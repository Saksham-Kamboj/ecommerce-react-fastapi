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
  // Profile
  phone: string | null
  date_of_birth: string | null
  bio: string | null
  // Address
  address_line1: string | null
  address_line2: string | null
  city: string | null
  state: string | null
  postal_code: string | null
  country: string | null
  created_at: string
  updated_at: string
}

// Self-service update (user updates own profile)
export interface UserUpdateSelf {
  full_name?: string | null
  phone?: string | null
  date_of_birth?: string | null
  bio?: string | null
  address_line1?: string | null
  address_line2?: string | null
  city?: string | null
  state?: string | null
  postal_code?: string | null
  country?: string | null
}

export interface ChangePasswordRequest {
  current_password: string
  new_password: string
}

// Admin-only
export interface UserCreate {
  email: string
  password?: string
  full_name?: string
  role?: string
  is_active?: boolean
}

export interface UserUpdate {
  password?: string
  full_name?: string
  role?: string
  is_active?: boolean
}
