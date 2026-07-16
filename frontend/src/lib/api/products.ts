import { apiClient } from "./client"
import type { ApiResponse, PaginatedApiResponse } from "@/types/api"
import type { ProductOut, ProductCreate, ProductUpdate } from "@/types/product"

export const productsApi = {
  getProducts: async (
    skip = 0,
    limit = 10,
    search?: string,
    sortBy?: string,
    sortOrder?: string,
    categoryId?: string | null
  ): Promise<PaginatedApiResponse<ProductOut>> => {
    let url = `/products/?skip=${skip}&limit=${limit}`
    if (search) {
      url += `&search=${encodeURIComponent(search)}`
    }
    if (sortBy) {
      url += `&sort_by=${encodeURIComponent(sortBy)}`
    }
    if (sortOrder) {
      url += `&sort_order=${encodeURIComponent(sortOrder)}`
    }
    if (categoryId) {
      url += `&category_id=${encodeURIComponent(categoryId)}`
    }
    const res = await apiClient<ProductOut[]>(url, {
      method: "GET",
    })
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

  uploadProductImage: async (
    productId: string,
    image: File
  ): Promise<ApiResponse<ProductOut>> => {
    const formData = new FormData()
    formData.append("image", image)
    return apiClient<ProductOut>(`/products/${productId}/upload-image`, {
      method: "POST",
      data: formData,
    })
  },
}
