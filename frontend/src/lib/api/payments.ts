import { apiClient } from "./client"
import type { ApiResponse } from "@/types/api"
import type {
  PaymentCreate,
  PaymentCreateOut,
  PaymentOut,
  PaymentVerify,
} from "@/types/payment"

export const paymentsApi = {
  createPaymentOrder: (
    data: PaymentCreate
  ): Promise<ApiResponse<PaymentCreateOut>> =>
    apiClient<PaymentCreateOut>("/payments/create", { method: "POST", data }),

  verifyPayment: (data: PaymentVerify): Promise<ApiResponse<PaymentOut>> =>
    apiClient<PaymentOut>("/payments/verify", { method: "POST", data }),
}
