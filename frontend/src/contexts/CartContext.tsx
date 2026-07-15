/* eslint-disable react-refresh/only-export-components */
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react"
import { cartApi } from "@/lib/api/cart"
import { useDebounce } from "@/hooks/useDebounce"
import type { CartOut } from "@/types/cart"
import { useAuth } from "./AuthContext"

interface CartContextType {
  cart: CartOut | null
  isLoading: boolean
  isCartOpen: boolean
  setIsCartOpen: (open: boolean) => void
  addToCart: (productId: string, quantity?: number) => void
  updateQuantity: (itemId: string, quantity: number) => void
  removeFromCart: (itemId: string) => Promise<void>
  clearCart: () => Promise<void>
  refreshCart: () => Promise<void>
}

const CartContext = createContext<CartContextType | null>(null)

const DEBOUNCE_DELAY = 500

export function CartProvider({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [cart, setCart] = useState<CartOut | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const { isAuthenticated } = useAuth()

  // Shared debounce hook — one timer per key (itemId or productId)
  const { debounce, cancel, cancelAll } = useDebounce(DEBOUNCE_DELAY)

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
    } catch {
      setCart(null)
    } finally {
      setIsLoading(false)
    }
  }, [isAuthenticated])

  useEffect(() => {
    refreshCart()
  }, [refreshCart])

  /**
   * addToCart — debounced per productId.
   * Optimistically increments quantity in local state; API fires after DEBOUNCE_DELAY.
   */
  const addToCart = useCallback(
    (productId: string, quantity: number = 1) => {
      if (!isAuthenticated) {
        alert("Please login to add items to cart")
        return
      }

      // Optimistic update — increment existing item or add placeholder
      setCart((prev) => {
        if (!prev) return prev
        const existing = prev.items.find((i) => i.product.id === productId)
        if (existing) {
          const newQty = existing.quantity + quantity
          return {
            ...prev,
            items: prev.items.map((i) =>
              i.product.id === productId ? { ...i, quantity: newQty } : i
            ),
            total_price: Number.parseFloat(
              prev.items
                .map((i) =>
                  i.product.id === productId
                    ? i.product.price * newQty
                    : i.product.price * i.quantity
                )
                .reduce((sum, val) => sum + val, 0)
                .toFixed(2)
            ),
          }
        }
        return prev // new item — let server response handle it
      })

      debounce(`add-${productId}`, async () => {
        try {
          await cartApi.addItem({ product_id: productId, quantity })
          await refreshCart()
        } catch {
          alert("Failed to add to cart")
          await refreshCart()
        }
      })
    },
    [isAuthenticated, debounce, refreshCart]
  )

  /**
   * updateQuantity — debounced per itemId.
   * Optimistically updates quantity and subtotal in local state.
   */
  const updateQuantity = useCallback(
    (itemId: string, quantity: number) => {
      setCart((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          items: prev.items.map((item) =>
            item.id === itemId ? { ...item, quantity } : item
          ),
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

      debounce(`update-${itemId}`, async () => {
        try {
          await cartApi.updateQuantity(itemId, { quantity })
          await refreshCart()
        } catch {
          await refreshCart()
        }
      })
    },
    [debounce, refreshCart]
  )

  const removeFromCart = useCallback(
    async (itemId: string) => {
      cancel(`update-${itemId}`)
      cancel(`add-${itemId}`)
      try {
        await cartApi.removeItem(itemId)
        await refreshCart()
      } catch {
        // ignore
      }
    },
    [cancel, refreshCart]
  )

  const clearCart = useCallback(async () => {
    cancelAll()
    try {
      await cartApi.clearCart()
      await refreshCart()
    } catch {
      // ignore
    }
  }, [cancelAll, refreshCart])

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
