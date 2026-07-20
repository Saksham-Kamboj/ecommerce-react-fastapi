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
    data: ProductCreate,
    imageFile?: File | null
  ): Promise<ApiResponse<ProductOut>> => {
    const formData = new FormData()
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value.toString())
      }
    })
    if (imageFile) {
      formData.append("image", imageFile)
    }

    return apiClient<ProductOut>("/products/", {
      method: "POST",
      data: formData,
    })
  },

  updateProduct: async (
    productId: string,
    data: ProductUpdate,
    imageFile?: File | null
  ): Promise<ApiResponse<ProductOut>> => {
    const formData = new FormData()
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        // If it's explicitly null, send a special string so the backend can clear it
        formData.append(key, value === null ? "null" : value.toString())
      }
    })
    if (imageFile) {
      formData.append("image", imageFile)
    }

    return apiClient<ProductOut>(`/products/${productId}`, {
      method: "PATCH",
      data: formData,
    })
  },

  deleteProduct: async (productId: string): Promise<ApiResponse<null>> => {
    return apiClient<null>(`/products/${productId}`, {
      method: "DELETE",
    })
  },
}
