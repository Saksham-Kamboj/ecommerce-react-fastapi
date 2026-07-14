import { apiClient } from "./client"
import type { ApiResponse, PaginatedApiResponse } from "@/types/api"
import type { UserOut, UserCreate, UserUpdate } from "@/types/auth"

export const usersApi = {
  getUsers: async (
    skip = 0,
    limit = 10,
    search?: string
  ): Promise<PaginatedApiResponse<UserOut>> => {
    let url = `/users/?skip=${skip}&limit=${limit}`
    if (search) {
      url += `&search=${encodeURIComponent(search)}`
    }
    const res = await apiClient<UserOut[]>(url, {
      method: "GET",
    })
    return res as unknown as PaginatedApiResponse<UserOut>
  },

  getUser: async (userId: string): Promise<ApiResponse<UserOut>> => {
    return apiClient<UserOut>(`/users/${userId}`, {
      method: "GET",
    })
  },

  createUser: async (data: UserCreate): Promise<ApiResponse<UserOut>> => {
    return apiClient<UserOut>("/users/", {
      method: "POST",
      data,
    })
  },

  updateUser: async (
    userId: string,
    data: UserUpdate
  ): Promise<ApiResponse<UserOut>> => {
    return apiClient<UserOut>(`/users/${userId}`, {
      method: "PUT",
      data,
    })
  },

  deleteUser: async (userId: string): Promise<ApiResponse<null>> => {
    return apiClient<null>(`/users/${userId}`, {
      method: "DELETE",
    })
  },
}
