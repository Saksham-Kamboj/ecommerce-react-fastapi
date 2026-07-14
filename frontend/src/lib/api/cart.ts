import { apiClient } from "./client"
import type {
  CartOut,
  CartItemCreate,
  CartItemUpdate,
  CartItemOut,
} from "@/types/cart"

export const cartApi = {
  /**
   * Get the current user's cart
   */
  getCart: () => apiClient<CartOut>("/cart/"),

  /**
   * Add a product to the cart (or increment if it exists)
   */
  addItem: (data: CartItemCreate) =>
    apiClient<CartItemOut>("/cart/items", { data }),

  /**
   * Update quantity of an item
   */
  updateQuantity: (itemId: string, data: CartItemUpdate) =>
    apiClient<CartItemOut>(`/cart/items/${itemId}`, {
      method: "PATCH",
      data,
    }),

  /**
   * Remove an item from the cart
   */
  removeItem: (itemId: string) =>
    apiClient<null>(`/cart/items/${itemId}`, { method: "DELETE" }),

  /**
   * Clear all items from the cart
   */
  clearCart: () => apiClient<null>("/cart/", { method: "DELETE" }),
}
