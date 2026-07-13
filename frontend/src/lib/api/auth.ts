import { apiClient } from "./client"
import type { ApiResponse } from "@/types/api"
import type { Token, UserOut } from "@/types/auth"

export const authApi = {
  async login(email: string, password: string): Promise<ApiResponse<Token>> {
    return apiClient<Token>("/auth/login", {
      data: { email, password },
    })
  },

  async register(
    email: string,
    fullName: string,
    password: string
  ): Promise<ApiResponse<UserOut>> {
    return apiClient<UserOut>("/auth/register", {
      data: { email, full_name: fullName, password },
    })
  },

  async getMe(token: string): Promise<ApiResponse<UserOut>> {
    // The client automatically attaches the token from localStorage
    // but we can also pass it explicitly if we wanted to
    return apiClient<UserOut>("/users/me", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  },

  async sendOtp(email: string): Promise<ApiResponse<null>> {
    return apiClient<null>("/auth/send-otp", {
      data: { email },
    })
  },

  async resetPassword(
    email: string,
    otpCode: string,
    newPassword: string
  ): Promise<ApiResponse<null>> {
    return apiClient<null>("/auth/reset-password", {
      data: { email, otp_code: otpCode, new_password: newPassword },
    })
  },
}
