import type { CategoryOut } from "./category"

export interface ProductBase {
  name: string
  description: string | null
  price: number
  stock_quantity: number
  image_url?: string | null
  category_id?: string | null
  is_active: boolean
}

export type ProductCreate = ProductBase

export interface ProductUpdate {
  name?: string | null
  description?: string | null
  price?: number | null
  stock_quantity?: number | null
  image_url?: string | null
  category_id?: string | null
  is_active?: boolean | null
}

export interface ProductOut extends ProductBase {
  id: string
  created_at: string
  updated_at: string
  category?: CategoryOut | null
}
