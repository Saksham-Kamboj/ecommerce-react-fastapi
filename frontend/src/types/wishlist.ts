import type { ProductOut } from "./product"

export interface WishlistItemOut {
  id: string
  user_id: string
  product_id: string
  created_at: string
  product: ProductOut
}
