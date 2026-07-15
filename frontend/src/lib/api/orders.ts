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
    limit = 10
  ): Promise<PaginatedApiResponse<OrderOut>> =>
    apiClient<OrderOut[]>(`/orders/?skip=${skip}&limit=${limit}`, {
      method: "GET",
    }) as unknown as Promise<PaginatedApiResponse<OrderOut>>,

  /** Get a single order by ID */
  getOrder: (orderId: string): Promise<ApiResponse<OrderOut>> =>
    apiClient<OrderOut>(`/orders/${orderId}`, { method: "GET" }),

  /** Cancel a pending order */
  cancelOrder: (orderId: string): Promise<ApiResponse<OrderOut>> =>
    apiClient<OrderOut>(`/orders/${orderId}/cancel`, { method: "POST" }),
}
