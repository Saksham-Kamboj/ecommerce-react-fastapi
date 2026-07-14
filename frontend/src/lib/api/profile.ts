import { apiClient } from "./client"
import type { ApiResponse } from "@/types/api"
import type {
  UserOut,
  UserUpdateSelf,
  ChangePasswordRequest,
} from "@/types/auth"

export const profileApi = {
  /** Update own profile (name, phone, bio, address) */
  updateMe: (data: UserUpdateSelf): Promise<ApiResponse<UserOut>> =>
    apiClient<UserOut>("/users/me", { method: "PUT", data }),

  /** Change password — requires current password verification */
  changePassword: (data: ChangePasswordRequest): Promise<ApiResponse<null>> =>
    apiClient<null>("/users/me/change-password", { method: "POST", data }),
}
