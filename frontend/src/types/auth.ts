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
