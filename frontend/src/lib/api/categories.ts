import { apiClient } from "./client"
import type { PaginatedApiResponse, ApiResponse } from "../../types/api"
import type {
  CategoryOut,
  CategoryCreate,
  CategoryUpdate,
} from "../../types/category"

export const categoriesApi = {
  getCategories: async (params?: {
    skip?: number
    limit?: number
    search?: string
  }): Promise<PaginatedApiResponse<CategoryOut>> => {
    let url = "/categories/"
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
    const res = await apiClient<CategoryOut[]>(url, { method: "GET" })
    return res as unknown as PaginatedApiResponse<CategoryOut>
  },

  getCategory: async (id: string): Promise<ApiResponse<CategoryOut>> => {
    return apiClient<CategoryOut>(`/categories/${id}`, { method: "GET" })
  },

  createCategory: async (
    data: CategoryCreate
  ): Promise<ApiResponse<CategoryOut>> => {
    return apiClient<CategoryOut>("/categories/", { method: "POST", data })
  },

  updateCategory: async (
    id: string,
    data: CategoryUpdate
  ): Promise<ApiResponse<CategoryOut>> => {
    return apiClient<CategoryOut>(`/categories/${id}`, {
      method: "PATCH",
      data,
    })
  },

  deleteCategory: async (id: string): Promise<ApiResponse<null>> => {
    return apiClient<null>(`/categories/${id}`, { method: "DELETE" })
  },
}
