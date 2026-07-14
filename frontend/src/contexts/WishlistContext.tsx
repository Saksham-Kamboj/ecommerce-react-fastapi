/* eslint-disable react-refresh/only-export-components */
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react"
import { wishlistApi } from "@/lib/api/wishlist"
import type { WishlistItemOut } from "@/types/wishlist"
import { useAuth } from "./AuthContext"

interface WishlistContextType {
  items: WishlistItemOut[]
  isLoading: boolean
  isWishlistOpen: boolean
  setIsWishlistOpen: (open: boolean) => void
  isWishlisted: (productId: string) => boolean
  toggle: (productId: string) => Promise<void>
  refresh: () => Promise<void>
}

const WishlistContext = createContext<WishlistContextType | null>(null)

export function WishlistProvider({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [items, setItems] = useState<WishlistItemOut[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isWishlistOpen, setIsWishlistOpen] = useState(false)
  const { isAuthenticated } = useAuth()

  // Track whether the initial load has been triggered
  const loadedRef = useRef(false)

  const refresh = useCallback(async () => {
    if (!isAuthenticated) {
      setItems([])
      return
    }
    setIsLoading(true)
    try {
      const res = await wishlistApi.getWishlist()
      setItems(res.data ?? [])
    } catch {
      setItems([])
    } finally {
      setIsLoading(false)
    }
  }, [isAuthenticated])

  // Trigger initial load only via a ref-guarded effect
  // No setState in effect body — refresh() is called as a side effect
  // and its setState calls happen asynchronously inside the async function
  useEffect(() => {
    // Reset on auth change so re-login triggers a fresh load
    loadedRef.current = false
  }, [isAuthenticated])

  useEffect(() => {
    if (loadedRef.current) return
    loadedRef.current = true
    void refresh()
  }, [refresh])

  const isWishlisted = useCallback(
    (productId: string) => items.some((i) => i.product_id === productId),
    [items]
  )

  const toggle = useCallback(
    async (productId: string) => {
      if (!isAuthenticated) {
        alert("Please login to use wishlist")
        return
      }
      const alreadyWishlisted = items.some((i) => i.product_id === productId)

      // Optimistic update
      if (alreadyWishlisted) {
        setItems((prev) => prev.filter((i) => i.product_id !== productId))
      }

      try {
        if (alreadyWishlisted) {
          await wishlistApi.removeFromWishlist(productId)
        } else {
          const res = await wishlistApi.addToWishlist(productId)
          setItems((prev) => [...prev, res.data])
        }
      } catch {
        void refresh()
      }
    },
    [isAuthenticated, items, refresh]
  )

  const value = useMemo(
    () => ({
      items,
      isLoading,
      isWishlistOpen,
      setIsWishlistOpen,
      isWishlisted,
      toggle,
      refresh,
    }),
    [items, isLoading, isWishlistOpen, isWishlisted, toggle, refresh]
  )

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  const ctx = useContext(WishlistContext)
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider")
  return ctx
}
