import { useState, useEffect } from "react"
import { format } from "date-fns"
import { Link } from "react-router-dom"
import { Filter } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { SearchInput } from "@/components/ui/search-input"
import { DataTable, type ColumnDef } from "@/components/ui/data-table"
import { ordersApi } from "@/lib/api/orders"
import type { OrderOut, OrderStatus } from "@/types/order"
import type { Pagination as PaginationType } from "@/types/api"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const STATUS_CONFIG: Record<OrderStatus, { label: string; className: string }> =
  {
    pending: {
      label: "Pending",
      className:
        "border-amber-200 bg-amber-50 text-amber-600 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-400",
    },
    confirmed: {
      label: "Confirmed",
      className:
        "border-blue-200 bg-blue-50 text-blue-600 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-400",
    },
    shipped: {
      label: "Shipped",
      className:
        "border-purple-200 bg-purple-50 text-purple-600 dark:border-purple-900 dark:bg-purple-950 dark:text-purple-400",
    },
    delivered: {
      label: "Delivered",
      className:
        "border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-400",
    },
    cancelled: {
      label: "Cancelled",
      className:
        "border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-400",
    },
  }

const ORDER_STATUS_OPTIONS: Array<{
  value: "all" | OrderStatus
  label: string
}> = [
  { value: "all", label: "All Orders" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
]

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderOut[]>([])
  const [pagination, setPagination] = useState<PaginationType | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Pagination & Filter state
  const [page, setPage] = useState(1)
  const limit = 10
  const [statusFilter, setStatusFilter] = useState<"all" | OrderStatus>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const selectedStatusLabel =
    ORDER_STATUS_OPTIONS.find((status) => status.value === statusFilter)
      ?.label ?? "Status"

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery)
      setPage(1)
    }, 500)
    return () => clearTimeout(handler)
  }, [searchQuery])

  useEffect(() => {
    let ignore = false
    const loadOrders = async () => {
      setIsLoading(true)
      try {
        const skip = (page - 1) * limit
        const status = statusFilter === "all" ? undefined : statusFilter
        const search = debouncedSearch.trim() || undefined
        const res = await ordersApi.getAllOrdersAdmin(skip, limit, status, search)
        if (!ignore) {
          setOrders(res.data)
          setPagination(res.pagination)
        }
      } catch (err) {
        if (!ignore) {
          setError(
            err instanceof Error ? err.message : "Failed to fetch orders"
          )
        }
      } finally {
        if (!ignore) setIsLoading(false)
      }
    }
    loadOrders()
    return () => {
      ignore = true
    }
  }, [page, limit, statusFilter, debouncedSearch])

  const orderColumns: ColumnDef<OrderOut>[] = [
    {
      header: "Order ID",
      className: "pl-6 min-w-[120px]",
      cell: (order) => (
        <Link
          to={`/orders/${order.id}`}
          className="font-mono text-sm font-medium text-foreground uppercase hover:text-primary hover:underline"
        >
          {order.id.slice(0, 8)}
        </Link>
      ),
    },
    {
      header: "Customer",
      className: "min-w-[180px]",
      cell: (order) => (
        <div className="flex flex-col">
          <span className="font-semibold text-foreground">
            {order.shipping_name}
          </span>
          <span className="text-xs text-muted-foreground">
            {order.shipping_city}, {order.shipping_state}
          </span>
        </div>
      ),
    },
    {
      header: "Items",
      className: "min-w-[100px]",
      cell: (order) => (
        <span className="font-semibold text-foreground">
          {order.items.length}
        </span>
      ),
    },
    {
      header: "Date",
      className: "min-w-[140px]",
      cell: (order) => (
        <div className="flex flex-col">
          <span className="text-sm font-medium text-foreground">
            {format(new Date(order.created_at), "MMM d, yyyy")}
          </span>
          <span className="mt-0.5 text-xs text-muted-foreground">
            {format(new Date(order.created_at), "hh:mm a")}
          </span>
        </div>
      ),
    },
    {
      header: "Total",
      className: "w-[120px]",
      cell: (order) => (
        <span className="font-semibold text-foreground">
          ₹{order.total_amount.toFixed(2)}
        </span>
      ),
    },
    {
      header: "Status",
      className: "w-[140px]",
      cell: (order) => {
        const config = STATUS_CONFIG[order.status]
        return (
          <Badge variant="outline" className={config.className}>
            {config.label}
          </Badge>
        )
      },
    },
    {
      header: "Payment",
      className: "w-[140px]",
      cell: (order) => {
        if (!order.payment) {
          return <span className="text-xs text-muted-foreground">—</span>
        }
        const PAYMENT_CONFIG = {
          captured: {
            label: "Paid",
            className:
              "border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-400",
          },
          created: {
            label: "Pending",
            className:
              "border-amber-200 bg-amber-50 text-amber-600 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-400",
          },
          cancelled: {
            label: "Cancelled",
            className:
              "border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-400",
          },
          failed: {
            label: "Failed",
            className:
              "border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-400",
          },
        } as const
        const config = PAYMENT_CONFIG[
          order.payment.status as keyof typeof PAYMENT_CONFIG
        ] ?? { label: order.payment.status, className: "" }
        return (
          <Badge variant="outline" className={config.className}>
            {config.label}
          </Badge>
        )
      },
    },
  ]

  const handlePageChange = (newPage: number) => {
    setIsLoading(true)
    setError(null)
    setPage(newPage)
  }

  return (
    <div className="flex-1 space-y-3">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Orders</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage customer orders and update their statuses.
          </p>
        </div>
        <div className="flex w-full items-center gap-3 sm:w-auto">
          <SearchInput
            placeholder="Search user or ID..."
            className="w-full sm:w-64"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="outline" className="gap-2 whitespace-nowrap" />
              }
            >
              <Filter className="h-4 w-4" />
              {selectedStatusLabel}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuGroup>
                <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => {
                    setStatusFilter("all")
                    setPage(1)
                  }}
                  className={
                    statusFilter === "all" ? "font-semibold text-primary" : ""
                  }
                >
                  All Orders
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                {ORDER_STATUS_OPTIONS.filter(
                  (status) => status.value !== "all"
                ).map((status) => (
                  <DropdownMenuItem
                    key={status.value}
                    onClick={() => {
                      setStatusFilter(status.value)
                      setPage(1)
                    }}
                    className={
                      statusFilter === status.value
                        ? "font-semibold text-primary"
                        : ""
                    }
                  >
                    {status.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <DataTable
        data={orders}
        columns={orderColumns}
        isLoading={isLoading}
        error={error}
        emptyMessage="No orders found."
        pagination={pagination}
        onPageChange={handlePageChange}
        showIndex={true}
      />
    </div>
  )
}
