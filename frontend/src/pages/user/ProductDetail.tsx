import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { productsApi } from "@/lib/api/products"
import { reviewsApi } from "@/lib/api/reviews"
import { useCart } from "@/contexts/CartContext"
import { useWishlist } from "@/contexts/WishlistContext"
import type { ProductOut } from "@/types/product"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Heart, Minus, Plus, ShoppingCart } from "lucide-react"
import { cn } from "@/lib/utils"
import { ProductCard } from "@/components/user/ProductCard"
import { ProductReviews } from "@/components/user/ProductReviews"
import { StarRating } from "@/components/ui/star-rating"
import type { ReviewOut } from "@/types/review"
import PageLoading from "@/components/custom/PageLoading"
import { ErrorMessage } from "@/components/ui/error-message"

const GRADIENT_COLORS = [
  "from-blue-500 to-indigo-600",
  "from-emerald-400 to-teal-600",
  "from-orange-400 to-rose-500",
  "from-purple-500 to-fuchsia-600",
  "from-cyan-500 to-blue-600",
]

function getGradient(name: string): string {
  const sum = name
    .split("")
    .reduce((acc, char) => acc + (char.codePointAt(0) ?? 0), 0)
  return GRADIENT_COLORS[sum % GRADIENT_COLORS.length]
}

export function ProductDetailPage() {
  const { productId } = useParams<{ productId: string }>()
  const navigate = useNavigate()
  const { cart, addToCart, updateQuantity } = useCart()
  const { isWishlisted, toggle } = useWishlist()

  const [product, setProduct] = useState<ProductOut | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [qty, setQty] = useState(1)

  // Load product
  useEffect(() => {
    if (!productId) return
    let cancelled = false
    productsApi
      .getProduct(productId)
      .then((res) => {
        if (!cancelled) {
          setProduct(res.data)
          setIsLoading(false)
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Product not found")
          setIsLoading(false)
        }
      })
    return () => {
      cancelled = true
    }
  }, [productId])

  const [reviews, setReviews] = useState<ReviewOut[]>([])

  // Load reviews
  useEffect(() => {
    if (!productId) return
    let cancelled = false
    reviewsApi
      .getProductReviews(productId, 0, 100)
      .then((res) => {
        if (!cancelled) {
          setReviews(res.data)
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          toast.error(
            err instanceof Error ? err.message : "Failed to load reviews"
          )
        }
      })
    return () => {
      cancelled = true
    }
  }, [productId])

  const [relatedProducts, setRelatedProducts] = useState<ProductOut[]>([])

  // Load related products
  useEffect(() => {
    if (!product?.category_id) return
    let cancelled = false
    productsApi
      .getProducts(0, 10, undefined, undefined, undefined, product.category_id)
      .then((res) => {
        if (!cancelled) {
          const others = res.data.filter((p) => p.id !== product.id)
          // Cryptographically safe shuffle, max 5
          const shuffled = [...others]
            .sort(
              () =>
                crypto.getRandomValues(new Uint32Array(1))[0] / 0xffffffff - 0.5
            )
            .slice(0, 5)
          setRelatedProducts(shuffled)
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          toast.error(
            err instanceof Error
              ? err.message
              : "Failed to load related products"
          )
        }
      })
    return () => {
      cancelled = true
    }
  }, [product])

  if (isLoading) {
    return <PageLoading minHeight="min-h-135" />
  }

  if (error) {
    return <ErrorMessage message={error} />
  }

  if (!product) {
    return (
      <div className="flex min-h-75 flex-col items-center justify-center gap-4 text-center">
        <p className="text-destructive">Product not found</p>
        <Button variant="outline" onClick={() => navigate("/products")}>
          Back to Products
        </Button>
      </div>
    )
  }

  const gradient = getGradient(product.name)
  const rating =
    reviews.length > 0
      ? (
          reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length
        ).toFixed(1)
      : "0.0"
  const reviewsCount = reviews.length

  const wishlisted = isWishlisted(product.id)
  const cartItem = cart?.items.find((i) => i.product.id === product.id)
  const isInCart = !!cartItem
  const maxQty = product.stock_quantity
  const inStock = product.stock_quantity > 0
  const selectedQty = cartItem?.quantity ?? qty

  const handleCartAction = () => {
    addToCart(product.id, selectedQty)
  }

  const handleQtyChange = (nextQty: number) => {
    const quantity = Math.min(maxQty, Math.max(1, nextQty))
    setQty(quantity)

    if (cartItem) {
      updateQuantity(cartItem.id, quantity)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* ── Left: visual ── */}
        <div className="flex flex-col gap-4">
          {product.image_url ? (
            <div className="flex aspect-4/3 w-full items-center justify-center overflow-hidden rounded-2xl border bg-white p-4 shadow-lg">
              <img
                src={product.image_url}
                alt={product.name}
                className="h-full w-full object-contain mix-blend-multiply"
                loading="lazy"
              />
            </div>
          ) : (
            <div
              className={cn(
                "flex aspect-3/2 w-full items-center justify-center rounded-2xl bg-linear-to-br p-12 text-center text-white shadow-lg",
                gradient
              )}
            >
              <span className="font-serif text-3xl font-bold tracking-tight drop-shadow-lg">
                {product.name}
              </span>
            </div>
          )}
        </div>

        {/* ── Right: info ── */}
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold tracking-tight">
              {product.name}
            </h1>
            <div className="flex items-center gap-2">
              {inStock ? (
                <Badge
                  variant="outline"
                  className="border-emerald-400 text-emerald-600 dark:text-emerald-400"
                >
                  {product.stock_quantity} in stock
                </Badge>
              ) : (
                <Badge variant="destructive">Out of stock</Badge>
              )}
              {isInCart && (
                <Badge variant="secondary">{cartItem.quantity} in cart</Badge>
              )}
              {/* Rating */}
              <div className="flex items-center gap-3">
                <StarRating rating={Number(rating)} iconClassName="h-5 w-5" />
                <span className="text-sm font-semibold">{rating}</span>
                <span className="text-sm text-muted-foreground">
                  ({reviewsCount} reviews)
                </span>
              </div>
            </div>
          </div>

          <div className="text-4xl font-bold text-primary">
            ₹{product.price.toFixed(2)}
          </div>

          <Separator />

          {product.description && (
            <div className="flex flex-col gap-2">
              <h3 className="font-semibold">About this product</h3>
              <p className="leading-relaxed text-muted-foreground">
                {product.description}
              </p>
            </div>
          )}

          {product.category && (
            <div className="mt-2 flex flex-col gap-2 text-sm text-muted-foreground">
              <p>
                <strong>Category:</strong>{" "}
                <span className="font-medium text-foreground">
                  {product.category.name}
                </span>
              </p>
            </div>
          )}

          <Separator />

          {/* Quantity */}
          {inStock && (
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">Quantity</span>
              <div className="flex items-center gap-2 rounded-md border p-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-sm"
                  onClick={() => handleQtyChange(selectedQty - 1)}
                  disabled={selectedQty <= 1}
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="w-8 text-center text-sm font-semibold">
                  {selectedQty}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-sm"
                  onClick={() => handleQtyChange(selectedQty + 1)}
                  disabled={selectedQty >= maxQty}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
              <span className="text-xs text-muted-foreground">
                Max {maxQty}
              </span>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3">
            {!isInCart && (
              <Button
                className="flex-1"
                disabled={!inStock}
                onClick={handleCartAction}
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                {inStock ? `Add ${selectedQty} to Cart` : "Out of Stock"}
              </Button>
            )}

            {isInCart && (
              <Button className="flex-1" onClick={() => navigate("/cart")}>
                View Cart & Checkout
              </Button>
            )}

            <Button
              variant="outline"
              className={cn(
                "w-14 shrink-0",
                wishlisted && "border-red-300 text-red-500 hover:text-red-600"
              )}
              onClick={() => toggle(product.id)}
            >
              <Heart className={cn("h-5 w-5", wishlisted && "fill-red-500")} />
              <span className="sr-only">
                {wishlisted ? "Remove from wishlist" : "Add to wishlist"}
              </span>
            </Button>
          </div>
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <div className="mt-8 flex flex-col gap-6">
          <Separator />
          <h2 className="text-2xl font-bold tracking-tight">
            More from {product.category?.name || "this category"}
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {relatedProducts.map((rp) => (
              <ProductCard key={rp.id} product={rp} />
            ))}
          </div>
        </div>
      )}

      <div className="mt-8">
        <Separator className="mb-8" />
        <ProductReviews
          productId={product.id}
          reviews={reviews}
          onReviewsChange={setReviews}
        />
      </div>
    </div>
  )
}
