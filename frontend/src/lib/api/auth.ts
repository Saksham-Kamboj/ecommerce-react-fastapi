// API response types
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface Token {
  access_token: string;
  token_type: string;
}

export interface UserOut {
  id: string;
  email: string;
  full_name: string | null;
  is_active: boolean;
  role: string;
  created_at: string;
  updated_at: string;
}

const API_BASE = '/api/v1';

export const authApi = {
  async login(email: string, password: string): Promise<ApiResponse<Token>> {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }
    return data;
  },

  async register(email: string, fullName: string, password: string): Promise<ApiResponse<UserOut>> {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, full_name: fullName, password }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Registration failed');
    }
    return data;
  },
};
