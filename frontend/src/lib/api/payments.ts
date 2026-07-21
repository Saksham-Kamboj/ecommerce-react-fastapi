import { apiClient } from "./client"
import type { ApiResponse } from "@/types/api"
import type {
  PaymentCreate,
  PaymentCreateOut,
  PaymentVerify,
} from "@/types/payment"
import type { OrderOut } from "@/types/order"

export const paymentsApi = {
  createPaymentOrder: (
    data: PaymentCreate
  ): Promise<ApiResponse<PaymentCreateOut>> =>
    apiClient<PaymentCreateOut>("/payments/create", { method: "POST", data }),

  verifyPayment: (data: PaymentVerify): Promise<ApiResponse<OrderOut>> =>
    apiClient<OrderOut>("/payments/verify", { method: "POST", data }),
}
