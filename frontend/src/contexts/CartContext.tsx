/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-refresh/only-export-components */
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react"
import { cartApi } from "@/lib/api/cart"
import type { CartOut } from "@/types/cart"
import { useAuth } from "./AuthContext"

interface CartContextType {
  cart: CartOut | null
  isLoading: boolean
  isCartOpen: boolean
  setIsCartOpen: (open: boolean) => void
  addToCart: (productId: string, quantity?: number) => Promise<void>
  updateQuantity: (itemId: string, quantity: number) => Promise<void>
  removeFromCart: (itemId: string) => Promise<void>
  clearCart: () => Promise<void>
  refreshCart: () => Promise<void>
}

const CartContext = createContext<CartContextType | null>(null)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartOut | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const { isAuthenticated } = useAuth()

  const refreshCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart(null)
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      const response = await cartApi.getCart()
      setCart(response.data)
    } catch (error) {
      console.error("Failed to fetch cart:", error)
      setCart(null)
    } finally {
      setIsLoading(false)
    }
  }, [isAuthenticated])

  useEffect(() => {
    refreshCart()
  }, [refreshCart])

  const addToCart = async (productId: string, quantity: number = 1) => {
    if (!isAuthenticated) {
      // You could redirect to login here or show a toast
      alert("Please login to add items to cart")
      return
    }
    try {
      await cartApi.addItem({ product_id: productId, quantity })
      await refreshCart()
      setIsCartOpen(true) // Open sidebar when item added
    } catch (error) {
      console.error("Failed to add to cart:", error)
      alert("Failed to add to cart")
    }
  }

  const updateQuantity = async (itemId: string, quantity: number) => {
    try {
      await cartApi.updateQuantity(itemId, { quantity })
      await refreshCart()
    } catch (error) {
      console.error("Failed to update quantity:", error)
    }
  }

  const removeFromCart = async (itemId: string) => {
    try {
      await cartApi.removeItem(itemId)
      await refreshCart()
    } catch (error) {
      console.error("Failed to remove item:", error)
    }
  }

  const clearCart = async () => {
    try {
      await cartApi.clearCart()
      await refreshCart()
    } catch (error) {
      console.error("Failed to clear cart:", error)
    }
  }

  const value = {
    cart,
    isLoading,
    isCartOpen,
    setIsCartOpen,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    refreshCart,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
