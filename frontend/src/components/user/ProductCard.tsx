import { useCart } from "@/contexts/CartContext"
import { useWishlist } from "@/contexts/WishlistContext"
import { Link } from "react-router-dom"
import { Heart, ShoppingCart, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { ProductOut } from "@/types/product"
import { cn } from "@/lib/utils"

interface ProductCardProps {
  product: ProductOut
  hideActions?: boolean
}

// Helper to generate a consistent gradient based on a string
function getGradientFromName(name: string) {
  const colors = [
    "from-blue-500 to-indigo-600",
    "from-emerald-400 to-teal-600",
    "from-orange-400 to-rose-500",
    "from-purple-500 to-fuchsia-600",
    "from-cyan-500 to-blue-600",
  ]
  const charSum = name
    .split("")
    .reduce((sum, char) => sum + (char.codePointAt(0) ?? 0), 0)
  return colors[charSum % colors.length]
}

export function ProductCard({ product, hideActions = false }: Readonly<ProductCardProps>) {
  const gradientClass = getGradientFromName(product.name)
  const { cart, addToCart, updateQuantity } = useCart()
  const { isWishlisted, toggle } = useWishlist()

  const cartItem = cart?.items.find((item) => item.product.id === product.id)
  const isInCart = !!cartItem
  const wishlisted = isWishlisted(product.id)

  const handleCartClick = () => {
    if (isInCart && cartItem) {
      // Already in cart — increment via updateQuantity (debounced, sends final qty)
      updateQuantity(cartItem.id, cartItem.quantity + 1)
    } else {
      addToCart(product.id, 1)
    }
  }

  return (
    <div className="group relative flex h-full flex-col overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md">
      {/* Product visual area */}
      <div className="relative aspect-4/3 w-full overflow-hidden bg-white p-2">
        {product.image_url ? (
          <Link to={`/products/${product.id}`}>
            <img
              src={product.image_url}
              alt={product.name}
              className="h-full w-full rounded-sm object-contain mix-blend-multiply shadow-inner transition-transform duration-300 group-hover:scale-102"
              loading="lazy"
            />
          </Link>
        ) : (
          <div
            className={cn(
              "flex h-full w-full items-center justify-center rounded-sm bg-linear-to-br p-6 text-center text-white shadow-inner transition-transform duration-300 group-hover:scale-102",
              gradientClass
            )}
          >
            <span className="line-clamp-4 font-serif text-xl font-bold tracking-tight drop-shadow-md">
              {product.name}
            </span>
          </div>
        )}

        {/* Wishlist Button */}
        {!hideActions && (
          <Button
            variant="secondary"
            size="icon"
            onClick={() => toggle(product.id)}
            className={cn(
              "absolute top-3 right-3 h-8 w-8 rounded-full bg-background/80 shadow-sm backdrop-blur transition-all group-hover:opacity-100",
              wishlisted
                ? "text-red-500 opacity-100 hover:text-red-600"
                : "text-muted-foreground opacity-0 hover:text-red-500"
            )}
          >
            <Heart className={cn("h-4 w-4", wishlisted && "fill-red-500")} />
            <span className="sr-only">
              {wishlisted ? "Remove from wishlist" : "Add to wishlist"}
            </span>
          </Button>
        )}
      </div>

      {/* Content Area */}
      <div className="flex flex-1 flex-col gap-1 p-2">
        <Link to={`/products/${product.id}`}>
          <h3 className="line-clamp-1 cursor-pointer leading-tight font-semibold tracking-tight hover:text-primary hover:underline">
            {product.name}
          </h3>
        </Link>
        {product.category && (
          <span className="text-xs font-medium text-muted-foreground">
            {product.category.name}
          </span>
        )}

        <p className="line-clamp-2 text-sm text-muted-foreground">
          {product.description || "No description available."}
        </p>

        <div className="">
          <div className="flex items-center justify-between">
            <div className="text-lg font-bold">₹{product.price.toFixed(2)}</div>

            <div className="flex items-center gap-1 text-sm">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span className="font-medium text-foreground">
                {product.rating.toFixed(1)}
              </span>
              <span className="text-xs text-muted-foreground">
                ({product.reviews_count})
              </span>
            </div>
          </div>

          <div className="mt-2 text-xs font-medium">
            {product.stock_quantity > 0 ? (
              <span className="text-emerald-500">
                {product.stock_quantity} in stock
              </span>
            ) : (
              <span className="text-destructive">Out of stock</span>
            )}
          </div>
        </div>
      </div>

      {/* Footer Area */}
      {!hideActions && (
        <div className="p-2 pt-0">
          <Button
            className="w-full transition-all"
            variant={isInCart ? "secondary" : "default"}
            disabled={product.stock_quantity === 0}
            onClick={handleCartClick}
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            {isInCart ? `Added (${cartItem.quantity}) - Add More` : "Add to Cart"}
          </Button>
        </div>
      )}
    </div>
  )
}
