import { apiClient } from "./client"
import type { ApiResponse } from "@/types/api"
import type { Address, AddressCreate, AddressUpdate } from "@/types/address"

export const addressApi = {
  getAddresses: (): Promise<ApiResponse<Address[]>> =>
    apiClient<Address[]>("/addresses/"),

  createAddress: (data: AddressCreate): Promise<ApiResponse<Address>> =>
    apiClient<Address>("/addresses/", { method: "POST", data }),

  updateAddress: (
    id: string,
    data: AddressUpdate
  ): Promise<ApiResponse<Address>> =>
    apiClient<Address>(`/addresses/${id}`, { method: "PUT", data }),

  deleteAddress: (id: string): Promise<ApiResponse<null>> =>
    apiClient<null>(`/addresses/${id}`, { method: "DELETE" }),

  setDefaultAddress: (id: string): Promise<ApiResponse<Address>> =>
    apiClient<Address>(`/addresses/${id}/default`, { method: "PATCH" }),
}
