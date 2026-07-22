import { apiClient } from "./client"
import type { PaginatedApiResponse, ApiResponse } from "../../types/api"
import type {
  CouponOut,
  CouponCreate,
  CouponUpdate,
  CouponValidateRequest,
  CouponValidateResponse,
} from "../../types/coupon"

export const couponsApi = {
  // Admin Endpoints
  getCoupons: async (params?: {
    skip?: number
    limit?: number
    search?: string
  }): Promise<PaginatedApiResponse<CouponOut>> => {
    let url = "/coupons/"
    if (params) {
      const searchParams = new URLSearchParams()
      if (params.skip !== undefined)
        searchParams.append("skip", params.skip.toString())
      if (params.limit !== undefined)
        searchParams.append("limit", params.limit.toString())
      if (params.search) searchParams.append("search", params.search)
      const qs = searchParams.toString()
      if (qs) url += `?${qs}`
    }
    const res = await apiClient<CouponOut[]>(url, { method: "GET" })
    return res as unknown as PaginatedApiResponse<CouponOut>
  },

  getCoupon: async (id: string): Promise<ApiResponse<CouponOut>> => {
    return apiClient<CouponOut>(`/coupons/${id}`, { method: "GET" })
  },

  createCoupon: async (
    data: CouponCreate
  ): Promise<ApiResponse<CouponOut>> => {
    return apiClient<CouponOut>("/coupons/", { method: "POST", data })
  },

  updateCoupon: async (
    id: string,
    data: CouponUpdate
  ): Promise<ApiResponse<CouponOut>> => {
    return apiClient<CouponOut>(`/coupons/${id}`, {
      method: "PUT",
      data,
    })
  },

  deleteCoupon: async (id: string): Promise<ApiResponse<null>> => {
    return apiClient<null>(`/coupons/${id}`, { method: "DELETE" })
  },

  // User Endpoints
  getActiveCoupons: async (): Promise<ApiResponse<CouponOut[]>> => {
    return apiClient<CouponOut[]>("/coupons/active", { method: "GET" })
  },

  validateCoupon: async (
    data: CouponValidateRequest
  ): Promise<ApiResponse<CouponValidateResponse>> => {
    return apiClient<CouponValidateResponse>("/coupons/validate", {
      method: "POST",
      data,
    })
  },
}
