import type { ProductOut } from "./product"

export interface CartItemCreate {
  product_id: string
  quantity: number
}

export interface CartItemUpdate {
  quantity: number
}

export interface CartItemOut {
  id: string
  quantity: number
  created_at: string
  updated_at: string
  product: ProductOut
}

export interface CartOut {
  id: string
  user_id: string
  created_at: string
  updated_at: string
  items: CartItemOut[]
  total_price: number
}
