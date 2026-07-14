/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-refresh/only-export-components */
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
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
  updateQuantity: (itemId: string, quantity: number) => void
  removeFromCart: (itemId: string) => Promise<void>
  clearCart: () => Promise<void>
  refreshCart: () => Promise<void>
}

const CartContext = createContext<CartContextType | null>(null)

// Debounce delay in ms — API fires this long after the last click
const DEBOUNCE_DELAY = 500

export function CartProvider({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [cart, setCart] = useState<CartOut | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const { isAuthenticated } = useAuth()

  // Holds pending debounce timers per cart item id
  const debounceTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>(
    {}
  )

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

  const addToCart = useCallback(
    async (productId: string, quantity: number = 1) => {
      if (!isAuthenticated) {
        alert("Please login to add items to cart")
        return
      }
      try {
        await cartApi.addItem({ product_id: productId, quantity })
        await refreshCart()
      } catch (error) {
        console.error("Failed to add to cart:", error)
        alert("Failed to add to cart")
      }
    },
    [isAuthenticated, refreshCart]
  )

  /**
   * Optimistic update: immediately reflect the new quantity in the UI,
   * then debounce the actual API call so rapid +/- clicks collapse into
   * a single request fired DEBOUNCE_DELAY ms after the last click.
   */
  const updateQuantity = useCallback(
    (itemId: string, quantity: number) => {
      // 1. Optimistically update local cart state right away
      setCart((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          items: prev.items.map((item) =>
            item.id === itemId ? { ...item, quantity } : item
          ),
          // Recalculate subtotal optimistically
          total_price: Number.parseFloat(
            prev.items
              .map((item) =>
                item.id === itemId
                  ? item.product.price * quantity
                  : item.product.price * item.quantity
              )
              .reduce((sum, val) => sum + val, 0)
              .toFixed(2)
          ),
        }
      })

      // 2. Cancel any existing timer for this item
      if (debounceTimers.current[itemId]) {
        clearTimeout(debounceTimers.current[itemId])
      }

      // 3. Schedule the API call after the debounce delay
      debounceTimers.current[itemId] = setTimeout(async () => {
        delete debounceTimers.current[itemId]
        try {
          await cartApi.updateQuantity(itemId, { quantity })
          // Sync with server after the debounced call completes
          await refreshCart()
        } catch (error) {
          console.error("Failed to update quantity:", error)
          // Roll back to server state on error
          await refreshCart()
        }
      }, DEBOUNCE_DELAY)
    },
    [refreshCart]
  )

  const removeFromCart = useCallback(
    async (itemId: string) => {
      // Cancel any pending debounce for this item before removing
      if (debounceTimers.current[itemId]) {
        clearTimeout(debounceTimers.current[itemId])
        delete debounceTimers.current[itemId]
      }
      try {
        await cartApi.removeItem(itemId)
        await refreshCart()
      } catch (error) {
        console.error("Failed to remove item:", error)
      }
    },
    [refreshCart]
  )

  const clearCart = useCallback(async () => {
    // Cancel all pending debounces
    Object.values(debounceTimers.current).forEach(clearTimeout)
    debounceTimers.current = {}
    try {
      await cartApi.clearCart()
      await refreshCart()
    } catch (error) {
      console.error("Failed to clear cart:", error)
    }
  }, [refreshCart])

  const value = useMemo(
    () => ({
      cart,
      isLoading,
      isCartOpen,
      setIsCartOpen,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      refreshCart,
    }),
    [
      cart,
      isLoading,
      isCartOpen,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      refreshCart,
    ]
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
