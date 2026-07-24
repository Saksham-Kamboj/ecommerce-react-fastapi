import { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { toast } from "sonner"
import { ordersApi } from "@/lib/api/orders"
import type { OrderOut, OrderStatus } from "@/types/order"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  Loader2,
  MapPin,
  Package,
  ShoppingCart,
  XCircle,
} from "lucide-react"
import PageLoading from "@/components/custom/PageLoading"
import { ErrorMessage } from "@/components/ui/error-message"

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

  const [order, setOrder] = useState<OrderOut | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isCancelling, setIsCancelling] = useState(false)

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
      .catch((err) => {
        if (!cancelled) {
          console.error("Failed to load order details", err)
          setIsLoading(false)
          setError(
            err instanceof Error ? err.message : "Failed to load order details"
          )
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
      toast.success(res.message)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to cancel order")
    } finally {
      setIsCancelling(false)
    }
  }

  if (isLoading) {
    return <PageLoading minHeight="min-h-135" />
  }

  if (error) {
    return <ErrorMessage message={error} />
  }

  if (!order) {
    return (
      <div className="flex min-h-75 flex-col items-center justify-center gap-4 text-center">
        <p className="text-destructive">Order not found</p>
        <Button variant="outline" onClick={() => navigate("/orders")}>
          Back to Orders
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
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
        <div className="flex items-center gap-3">
          {order.status !== "delivered" && order.status !== "cancelled" && (
            <Button
              variant="outline"
              className="text-destructive hover:text-destructive"
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
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back
          </Button>
        </div>
      </div>

      <Separator />

      {order.status !== "cancelled" && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Order Progress</CardTitle>
          </CardHeader>
          <CardContent className="px-6">
            <OrderProgress status={order.status} />
          </CardContent>
        </Card>
      )}

      {/* Items */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Package className="h-4 w-4" />
            Items ({order.items.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-1 px-6">
          {order.items.map((item) => (
            <div key={item.id}>
              <div className="flex items-center justify-between py-2.5">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <Link
                    to={`/products/${item.product.id}`}
                    className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-white transition-opacity hover:opacity-80"
                  >
                    {item.product.image_url ? (
                      <img
                        src={item.product.image_url}
                        alt={item.product.name}
                        className="h-full w-full object-contain p-1 mix-blend-multiply"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-muted/50">
                        <ShoppingCart className="h-4 w-4 text-muted-foreground/40" />
                      </div>
                    )}
                  </Link>
                  <div className="min-w-0">
                    <Link
                      to={`/products/${item.product.id}`}
                      className="block truncate text-sm font-medium transition-colors hover:text-primary hover:underline"
                    >
                      {item.product.name}
                    </Link>
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
              ₹{Number(order.subtotal_amount).toFixed(2)}
            </span>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Shipping */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <MapPin className="h-4 w-4" />
              Delivery Address
            </CardTitle>
          </CardHeader>
          <CardContent className="px-6 text-sm">
            <dl className="grid grid-cols-[100px_1fr] gap-x-2 gap-y-3">
              <dt className="text-muted-foreground">Name</dt>
              <dd className="text-right font-medium">{order.shipping_name}</dd>
              {order.shipping_phone && (
                <>
                  <dt className="text-muted-foreground">Phone</dt>
                  <dd className="text-right font-medium">
                    {order.shipping_phone}
                  </dd>
                </>
              )}
              <dt className="text-muted-foreground">Address</dt>
              <dd className="text-right font-medium">
                {order.shipping_address_line1}
                {order.shipping_address_line2 && (
                  <>
                    {", "}
                    {order.shipping_address_line2}
                  </>
                )}
              </dd>
              <dt className="text-muted-foreground">Location</dt>
              <dd className="text-right font-medium">
                {order.shipping_city}, {order.shipping_state}
              </dd>
              <dt className="text-muted-foreground">PIN Code</dt>
              <dd className="text-right font-medium">
                {order.shipping_postal_code}
              </dd>
              <dt className="text-muted-foreground">Country</dt>
              <dd className="text-right font-medium">
                {order.shipping_country}
              </dd>
              {order.notes && (
                <>
                  <div className="col-span-2 my-1">
                    <Separator />
                  </div>
                  <dt className="text-muted-foreground">Notes</dt>
                  <dd className="text-right font-medium">{order.notes}</dd>
                </>
              )}
            </dl>
          </CardContent>
        </Card>
        {/* Payment Details — from backend's single latest payment */}
        {order.payment && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <CreditCard className="h-4 w-4" />
                Payment Details
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6">
              <dl className="grid grid-cols-[140px_1fr] gap-x-2 gap-y-3 text-sm">
                <dt className="text-muted-foreground">Status</dt>
                <dd className="text-right">
                  {order.payment.status === "captured" && (
                    <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                      Paid
                    </span>
                  )}
                  {order.payment.status === "created" && (
                    <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
                      Awaiting Payment
                    </span>
                  )}
                  {order.payment.status === "cancelled" && (
                    <span className="inline-flex items-center rounded-full bg-rose-50 px-2 py-0.5 text-xs font-semibold text-rose-600 dark:bg-rose-950/50 dark:text-rose-400">
                      Cancelled
                    </span>
                  )}
                  {order.payment.status === "failed" && (
                    <span className="inline-flex items-center rounded-full bg-rose-50 px-2 py-0.5 text-xs font-semibold text-rose-600 dark:bg-rose-950/50 dark:text-rose-400">
                      Failed
                    </span>
                  )}
                </dd>
                {order.discount_amount > 0 && (
                  <>
                    <dt className="text-muted-foreground">Subtotal</dt>
                    <dd className="text-right">
                      ₹{Number(order.subtotal_amount).toFixed(2)}
                    </dd>
                    <dt className="whitespace-nowrap text-muted-foreground">
                      Discount
                      {order.coupon_code &&
                        ` (${order.coupon_code}) (${Math.round((order.discount_amount / order.subtotal_amount) * 100)}%)`}
                    </dt>
                    <dd className="text-right text-emerald-600 dark:text-emerald-400">
                      -₹{Number(order.discount_amount).toFixed(2)}
                    </dd>
                  </>
                )}
                <dt className="text-muted-foreground">Amount Paid</dt>
                <dd className="text-right font-semibold text-primary">
                  ₹{Number(order.total_amount).toFixed(2)}{" "}
                  {order.payment.currency}
                </dd>
                <dt className="text-muted-foreground">Provider</dt>
                <dd className="text-right font-medium capitalize">
                  {order.payment.provider}
                </dd>
                {order.payment.provider_payment_id && (
                  <>
                    <dt className="text-muted-foreground">Payment ID</dt>
                    <dd className="text-right font-mono text-xs text-muted-foreground">
                      {order.payment.provider_payment_id}
                    </dd>
                  </>
                )}
                <dt className="text-muted-foreground">Last Updated</dt>
                <dd className="text-right font-medium">
                  {formatDate(order.payment.created_at)}
                </dd>
              </dl>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
