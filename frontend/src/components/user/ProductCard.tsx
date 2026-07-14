import { useCart } from "@/contexts/CartContext"
import { Heart, ShoppingCart, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { ProductOut } from "@/types/product"
import { cn } from "@/lib/utils"

interface ProductCardProps {
  product: ProductOut
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
    .reduce((sum, char) => sum + char.charCodeAt(0), 0)
  return colors[charSum % colors.length]
}

// Mock rating generation
function getMockRating(id: string) {
  // deterministic pseudo-random rating between 4.0 and 5.0 based on ID
  const num = parseInt(id.replace(/-/g, "").substring(0, 8), 16)
  const rating = 4.0 + (num % 11) / 10 // 4.0 to 5.0
  const reviews = 20 + (num % 200) // 20 to 219
  return { rating: rating.toFixed(1), reviews }
}

export function ProductCard({ product }: ProductCardProps) {
  const gradientClass = getGradientFromName(product.name)
  const { rating, reviews } = getMockRating(product.id)
  const { cart, addToCart } = useCart()

  const cartItem = cart?.items.find((item) => item.product.id === product.id)
  const isInCart = !!cartItem

  return (
    <div className="group relative flex h-full flex-col overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md">
      {/* "Image" Area */}
      <div className="relative aspect-square w-full overflow-hidden bg-muted p-2">
        {/* Book Cover Mockup */}
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

        {/* Wishlist Button */}
        <Button
          variant="secondary"
          size="icon"
          className="absolute top-3 right-3 h-8 w-8 rounded-full bg-background/80 text-muted-foreground opacity-0 shadow-sm backdrop-blur transition-all group-hover:opacity-100 hover:text-red-500"
        >
          <Heart className="h-4 w-4" />
          <span className="sr-only">Add to wishlist</span>
        </Button>
      </div>

      {/* Content Area */}
      <div className="flex flex-1 flex-col gap-1 p-2">
        <h3 className="line-clamp-2 leading-tight font-semibold tracking-tight">
          {product.name}
        </h3>

        <p className="line-clamp-2 text-sm text-muted-foreground">
          {product.description || "No description available."}
        </p>

        <div className="">
          <div className="flex items-center justify-between">
            <div className="text-lg font-bold">₹{product.price.toFixed(2)}</div>

            <div className="flex items-center gap-1 text-sm">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span className="font-medium text-foreground">{rating}</span>
              <span className="text-xs text-muted-foreground">({reviews})</span>
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
      <div className="p-2 pt-0">
        <Button
          className="w-full transition-all"
          variant={isInCart ? "secondary" : "default"}
          disabled={product.stock_quantity === 0}
          onClick={() => addToCart(product.id, 1)}
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          {isInCart ? `Added (${cartItem.quantity}) - Add More` : "Add to Cart"}
        </Button>
      </div>
    </div>
  )
}
