import { useState, useEffect } from "react"
import { useParams, useNavigate, useLocation } from "react-router-dom"
import { ordersApi } from "@/lib/api/orders"
import type { OrderOut, OrderStatus } from "@/types/order"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  MapPin,
  Package,
  ShoppingCart,
  XCircle,
} from "lucide-react"

const STATUS_CONFIG: Record<OrderStatus, { label: string; className: string }> =
  {
    pending: {
      label: "Pending",
      className:
        "border-amber-400 bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400",
    },
    confirmed: {
      label: "Confirmed",
      className:
        "border-blue-400 bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400",
    },
    shipped: {
      label: "Shipped",
      className:
        "border-purple-400 bg-purple-50 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400",
    },
    delivered: {
      label: "Delivered",
      className:
        "border-emerald-400 bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400",
    },
    cancelled: {
      label: "Cancelled",
      className:
        "border-rose-400 bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400",
    },
  }

function StatusBadge({ status }: Readonly<{ status: OrderStatus }>) {
  const config = STATUS_CONFIG[status] ?? { label: status, className: "" }
  return (
    <Badge variant="outline" className={`text-sm ${config.className}`}>
      {config.label}
    </Badge>
  )
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

// Order progress steps
const STATUS_STEPS: OrderStatus[] = [
  "pending",
  "confirmed",
  "shipped",
  "delivered",
]

function OrderProgress({ status }: Readonly<{ status: OrderStatus }>) {
  if (status === "cancelled") return null
  const currentIndex = STATUS_STEPS.indexOf(status)
  return (
    <div className="flex items-center gap-0">
      {STATUS_STEPS.map((step, i) => {
        const done = i <= currentIndex
        const isLast = i === STATUS_STEPS.length - 1
        return (
          <div key={step} className="flex flex-1 items-center">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold transition-colors ${done ? "border-primary bg-primary text-primary-foreground" : "border-muted bg-muted text-muted-foreground"}`}
              >
                {done ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
              </div>
              <span
                className={`text-[10px] font-medium capitalize ${done ? "text-primary" : "text-muted-foreground"}`}
              >
                {step}
              </span>
            </div>
            {!isLast && (
              <div
                className={`mb-4 h-0.5 flex-1 transition-colors ${i < currentIndex ? "bg-primary" : "bg-muted"}`}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

export function OrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const justPlaced =
    (location.state as { justPlaced?: boolean } | null)?.justPlaced ?? false

  const [order, setOrder] = useState<OrderOut | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isCancelling, setIsCancelling] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!orderId) return
    let cancelled = false
    ordersApi
      .getOrder(orderId)
      .then((res) => {
        if (!cancelled) {
          setOrder(res.data)
          setIsLoading(false)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError("Order not found")
          setIsLoading(false)
        }
      })
    return () => {
      cancelled = true
    }
  }, [orderId])

  const handleCancel = async () => {
    if (!order) return
    setIsCancelling(true)
    try {
      const res = await ordersApi.cancelOrder(order.id)
      setOrder(res.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to cancel order")
    } finally {
      setIsCancelling(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center gap-4 text-center">
        <p className="text-destructive">{error || "Order not found"}</p>
        <Button variant="outline" onClick={() => navigate("/orders")}>
          Back to Orders
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex w-full items-center justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-primary">
                Order #{order.id.slice(0, 8).toUpperCase()}
              </h1>
              <StatusBadge status={order.status} />
            </div>
            <p className="text-sm text-muted-foreground">
              Placed on {formatDate(order.created_at)}
            </p>
          </div>
          <div className="flex items-center gap-4">
            {order.status === "pending" && (
              <Button
                variant="outline"
                className="shrink-0 text-destructive hover:text-destructive"
                onClick={handleCancel}
                disabled={isCancelling}
              >
                {isCancelling ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  <>
                    <XCircle className="mr-2 h-4 w-4" />
                    Cancel Order
                  </>
                )}
              </Button>
            )}
            <Button variant="outline" onClick={() => navigate("/orders")}>
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </div>
        </div>
      </div>

      {/* Just placed success banner */}
      {justPlaced && (
        <div className="flex items-center gap-3 rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-3 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <p className="text-sm font-medium">
            Your order has been placed successfully! We'll confirm it shortly.
          </p>
        </div>
      )}

      <Separator />

      {/* Progress tracker */}
      {order.status !== "cancelled" && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Order Progress</CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <OrderProgress status={order.status} />
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Items */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Package className="h-4 w-4" />
              Items ({order.items.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-1 px-6 pb-5">
            {order.items.map((item) => (
              <div key={item.id}>
                <div className="flex items-center justify-between py-2.5">
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border bg-muted/50">
                      <ShoppingCart className="h-4 w-4 text-muted-foreground/40" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {item.product.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        ₹{Number(item.unit_price).toFixed(2)} × {item.quantity}
                      </p>
                    </div>
                  </div>
                  <p className="ml-3 shrink-0 font-semibold">
                    ₹{(Number(item.unit_price) * item.quantity).toFixed(2)}
                  </p>
                </div>
                <Separator />
              </div>
            ))}
            <div className="flex items-center justify-between pt-3">
              <span className="font-medium">Total</span>
              <span className="text-xl font-bold text-primary">
                ₹{Number(order.total_amount).toFixed(2)}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Shipping address */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <MapPin className="h-4 w-4" />
              Delivery Address
            </CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-5 text-sm">
            <p className="font-semibold">{order.shipping_name}</p>
            {order.shipping_phone && (
              <p className="text-muted-foreground">{order.shipping_phone}</p>
            )}
            <p className="mt-1">{order.shipping_address_line1}</p>
            {order.shipping_address_line2 && (
              <p>{order.shipping_address_line2}</p>
            )}
            <p>
              {order.shipping_city}, {order.shipping_state} —{" "}
              {order.shipping_postal_code}
            </p>
            <p>{order.shipping_country}</p>
            {order.notes && (
              <>
                <Separator className="my-3" />
                <p className="text-xs text-muted-foreground">
                  <span className="font-medium">Notes:</span> {order.notes}
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
