export interface ReviewBase {
  rating: number
  comment?: string | null
}

export type ReviewCreate = ReviewBase

export interface ReviewUpdate {
  rating?: number | null
  comment?: string | null
}

export interface ReviewUser {
  id: string
  full_name: string | null
}

export interface ReviewOut extends ReviewBase {
  id: string
  product_id: string
  user_id: string
  created_at: string
  updated_at: string
  user?: ReviewUser | null
}
