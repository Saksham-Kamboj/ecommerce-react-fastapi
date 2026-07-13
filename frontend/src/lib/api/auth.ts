// API response types
export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export interface Token {
  access_token: string
  token_type: string
}

export interface UserOut {
  id: string
  email: string
  full_name: string | null
  is_active: boolean
  role: string
  created_at: string
  updated_at: string
}

const API_BASE = "/api/v1"

export const authApi = {
  async login(email: string, password: string): Promise<ApiResponse<Token>> {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    })

    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.message || "Login failed")
    }
    return data
  },

  async register(
    email: string,
    fullName: string,
    password: string
  ): Promise<ApiResponse<UserOut>> {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, full_name: fullName, password }),
    })

    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.message || "Registration failed")
    }
    return data
  },

  async getMe(token: string): Promise<ApiResponse<UserOut>> {
    const response = await fetch(`${API_BASE}/users/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch user profile")
    }
    return data
  },

  async sendOtp(email: string): Promise<ApiResponse<null>> {
    const response = await fetch(`${API_BASE}/auth/send-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to send OTP');
    }
    return data;
  },

  async resetPassword(email: string, otpCode: string, newPassword: string): Promise<ApiResponse<null>> {
    const response = await fetch(`${API_BASE}/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, otp_code: otpCode, new_password: newPassword }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to reset password');
    }
    return data;
  },
}
