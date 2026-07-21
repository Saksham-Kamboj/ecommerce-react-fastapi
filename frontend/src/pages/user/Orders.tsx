import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { ordersApi } from "@/lib/api/orders"
import type { OrderOut, OrderStatus } from "@/types/order"
import type { Pagination } from "@/types/api"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { SearchInput } from "@/components/ui/search-input"
import { PackageSearch, ShoppingBag, ChevronRight } from "lucide-react"
import PageLoading from "@/components/custom/PageLoading"

// ── Status config ──────────────────────────────────────────────────────────────
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
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  )
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export function UserOrders() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState<OrderOut[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const LIMIT = 10
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery)
      setPage(1)
    }, 500)
    return () => clearTimeout(handler)
  }, [searchQuery])

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    const skip = (page - 1) * LIMIT
    ordersApi
      .getMyOrders(skip, LIMIT, debouncedSearch || undefined)
      .then((res) => {
        if (!cancelled) {
          setOrders(res.data)
          setPagination(res.pagination)
          setIsLoading(false)
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          toast.error(
            err instanceof Error ? err.message : "Failed to load orders"
          )
          setIsLoading(false)
        }
      })
    return () => {
      cancelled = true
    }
  }, [page, debouncedSearch])

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">
            My Orders
          </h1>
          <p className="text-muted-foreground">
            Track and manage your purchase history.
          </p>
        </div>
        <div className="flex w-auto items-center gap-3">
          <SearchInput
            placeholder="Search by Order ID..."
            className="w-full sm:w-80"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <p className="text-sm whitespace-nowrap text-muted-foreground">
            {pagination?.totalItems || 0} total orders
          </p>
        </div>
      </div>

      <Separator />

      {isLoading && <PageLoading minHeight="min-h-135" />}

      {!isLoading && orders.length === 0 && (
        <div className="flex min-h-[360px] flex-col items-center justify-center gap-4 rounded-xl border border-dashed text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <PackageSearch className="h-8 w-8 text-muted-foreground/40" />
          </div>
          <div>
            <p className="text-lg font-semibold">No orders yet</p>
            <p className="text-sm text-muted-foreground">
              Your order history will appear here.
            </p>
          </div>
          <Button onClick={() => navigate("/products")}>
            <ShoppingBag className="mr-2 h-4 w-4" />
            Start Shopping
          </Button>
        </div>
      )}

      {!isLoading && orders.length > 0 && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            {orders.map((order, index) => (
              <Card
                key={order.id}
                className={`cursor-pointer p-0 transition-shadow hover:shadow-md ${
                  // Agar last item hai aur odd number hai toh full width
                  index === orders.length - 1 && orders.length % 2 !== 0
                    ? "col-span-2"
                    : ""
                }`}
                onClick={() => navigate(`/orders/${order.id}`)}
              >
                <CardContent className="flex items-center justify-between gap-4 p-5">
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold">
                        Order #{order.id.slice(0, 8).toUpperCase()}
                      </p>
                      <StatusBadge status={order.status} />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {order.items.length} item
                      {order.items.length !== 1 ? "s" : ""} · Placed on{" "}
                      {formatDate(order.created_at)}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {order.shipping_city}, {order.shipping_state} —{" "}
                      {order.shipping_name}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <p className="text-lg font-bold text-primary">
                      ₹{Number(order.total_amount).toFixed(2)}
                    </p>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                disabled={!pagination.hasPrevPage}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={!pagination.hasNextPage}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
