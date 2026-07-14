import { apiClient } from "./client"
import type { ApiResponse } from "@/types/api"
import type { WishlistItemOut } from "@/types/wishlist"

export const wishlistApi = {
  /** Get all wishlist items for current user */
  getWishlist: (): Promise<ApiResponse<WishlistItemOut[]>> =>
    apiClient<WishlistItemOut[]>("/wishlist/"),

  /** Add product to wishlist */
  addToWishlist: (productId: string): Promise<ApiResponse<WishlistItemOut>> =>
    apiClient<WishlistItemOut>(`/wishlist/${productId}`, { method: "POST" }),

  /** Remove product from wishlist */
  removeFromWishlist: (productId: string): Promise<ApiResponse<null>> =>
    apiClient<null>(`/wishlist/${productId}`, { method: "DELETE" }),
}
