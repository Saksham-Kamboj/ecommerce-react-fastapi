import { apiClient } from "./client"
import type { ApiResponse, PaginatedApiResponse } from "@/types/api"
import type { ProductOut, ProductCreate, ProductUpdate } from "@/types/product"

export const productsApi = {
  getProducts: async (
    skip = 0,
    limit = 10
  ): Promise<PaginatedApiResponse<ProductOut>> => {
    const res = await apiClient<ProductOut[]>(
      `/products/?skip=${skip}&limit=${limit}`,
      {
        method: "GET",
      }
    )
    return res as unknown as PaginatedApiResponse<ProductOut>
  },

  getProduct: async (productId: string): Promise<ApiResponse<ProductOut>> => {
    return apiClient<ProductOut>(`/products/${productId}`, {
      method: "GET",
    })
  },

  createProduct: async (
    data: ProductCreate
  ): Promise<ApiResponse<ProductOut>> => {
    return apiClient<ProductOut>("/products/", {
      method: "POST",
      data,
    })
  },

  updateProduct: async (
    productId: string,
    data: ProductUpdate
  ): Promise<ApiResponse<ProductOut>> => {
    return apiClient<ProductOut>(`/products/${productId}`, {
      method: "PATCH",
      data,
    })
  },

  deleteProduct: async (productId: string): Promise<ApiResponse<null>> => {
    return apiClient<null>(`/products/${productId}`, {
      method: "DELETE",
    })
  },
}
