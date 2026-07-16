import { useState, useEffect } from "react"
import { format } from "date-fns"
import { Link } from "react-router-dom"

import { Badge } from "@/components/ui/badge"
import { DataTable, type ColumnDef } from "@/components/ui/data-table"
import { ordersApi } from "@/lib/api/orders"
import type { OrderOut, OrderStatus } from "@/types/order"
import type { Pagination as PaginationType } from "@/types/api"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

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

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderOut[]>([])
  const [pagination, setPagination] = useState<PaginationType | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Pagination & Filter state
  const [page, setPage] = useState(1)
  const limit = 10
  const [statusFilter, setStatusFilter] = useState<string>("all")

  useEffect(() => {
    let ignore = false
    const loadOrders = async () => {
      setIsLoading(true)
      try {
        const skip = (page - 1) * limit
        const status = statusFilter === "all" ? undefined : statusFilter
        const res = await ordersApi.getAllOrdersAdmin(skip, limit, status)
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
  }, [page, limit, statusFilter])

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
  ]

  const handlePageChange = (newPage: number) => {
    setIsLoading(true)
    setError(null)
    setPage(newPage)
  }

  return (
    <div className="flex-1 space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Orders</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage customer orders and update their statuses.
          </p>
        </div>
        <div className="flex w-full items-center gap-3 sm:w-auto">
          <Select
            value={statusFilter}
            onValueChange={(val) => {
              setStatusFilter(val || "all")
              setPage(1)
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Orders</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
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
