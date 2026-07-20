import { apiClient } from "./client"
import type { ApiResponse, PaginatedApiResponse } from "@/types/api"
import type { OrderCreate, OrderOut } from "@/types/order"

export const ordersApi = {
  /** Place a new order from current cart */
  placeOrder: (data: OrderCreate): Promise<ApiResponse<OrderOut>> =>
    apiClient<OrderOut>("/orders/", { method: "POST", data }),

  /** Get current user's orders (paginated) */
  getMyOrders: (
    skip = 0,
    limit = 10,
    search?: string
  ): Promise<PaginatedApiResponse<OrderOut>> => {
    const params = new URLSearchParams()
    params.append("skip", skip.toString())
    params.append("limit", limit.toString())
    if (search) {
      params.append("search", search)
    }
    return apiClient<OrderOut[]>(`/orders/?${params.toString()}`, {
      method: "GET",
    }) as unknown as Promise<PaginatedApiResponse<OrderOut>>
  },

  /** Get a single order by ID */
  getOrder: (orderId: string): Promise<ApiResponse<OrderOut>> =>
    apiClient<OrderOut>(`/orders/${orderId}`, { method: "GET" }),

  /** Cancel a pending order */
  cancelOrder: (orderId: string): Promise<ApiResponse<OrderOut>> =>
    apiClient<OrderOut>(`/orders/${orderId}/cancel`, { method: "POST" }),

  // ── Admin Endpoints ──────────────────────────────────────────────────────────

  /** Get paginated list of all orders (Admin only) */
  getAllOrdersAdmin: (
    skip = 0,
    limit = 10,
    status?: string,
    search?: string
  ): Promise<PaginatedApiResponse<OrderOut>> => {
    const params = new URLSearchParams()
    params.append("skip", skip.toString())
    params.append("limit", limit.toString())
    if (status) {
      params.append("status", status)
    }
    if (search) {
      params.append("search", search)
    }
    return apiClient<OrderOut[]>(`/orders/admin/all?${params.toString()}`, {
      method: "GET",
    }) as unknown as Promise<PaginatedApiResponse<OrderOut>>
  },

  /** Get a single order by ID (Admin only) */
  getOrderAdmin: (orderId: string): Promise<ApiResponse<OrderOut>> =>
    apiClient<OrderOut>(`/orders/admin/${orderId}`, { method: "GET" }),

  /** Update order status (Admin only) */
  updateOrderStatusAdmin: (
    orderId: string,
    status: string
  ): Promise<ApiResponse<OrderOut>> =>
    apiClient<OrderOut>(`/orders/admin/${orderId}/status`, {
      method: "PATCH",
      data: { status },
    }),
}
