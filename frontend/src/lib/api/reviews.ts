import { apiClient } from "./client"
import type { ApiResponse, PaginatedApiResponse } from "@/types/api"
import type { ReviewCreate, ReviewOut, ReviewUpdate } from "@/types/review"

export const reviewsApi = {
  getProductReviews: async (
    productId: string,
    skip = 0,
    limit = 10
  ): Promise<PaginatedApiResponse<ReviewOut>> => {
    const res = await apiClient<ReviewOut[]>(
      `/products/${productId}/reviews?skip=${skip}&limit=${limit}`,
      {
        method: "GET",
      }
    )
    return res as unknown as PaginatedApiResponse<ReviewOut>
  },

  createReview: async (
    productId: string,
    data: ReviewCreate
  ): Promise<ApiResponse<ReviewOut>> => {
    return apiClient<ReviewOut>(`/products/${productId}/reviews`, {
      method: "POST",
      data,
    })
  },

  updateReview: async (
    reviewId: string,
    data: ReviewUpdate
  ): Promise<ApiResponse<ReviewOut>> => {
    return apiClient<ReviewOut>(`/reviews/${reviewId}`, {
      method: "PUT",
      data,
    })
  },

  deleteReview: async (reviewId: string): Promise<ApiResponse<null>> => {
    return apiClient<null>(`/reviews/${reviewId}`, {
      method: "DELETE",
    })
  },
}
