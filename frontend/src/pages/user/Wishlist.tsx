import { useWishlist } from "@/contexts/WishlistContext"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ProductCard } from "@/components/user/ProductCard"
import { Heart } from "lucide-react"

export function UserWishlist() {
  const { items } = useWishlist()
  const navigate = useNavigate()

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between pr-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">
            My Wishlist
          </h1>
          <p className="text-muted-foreground">
            Products you have saved for later.
          </p>
        </div>
        {items.length > 0 && (
          <Badge variant="secondary" className="px-3 py-1 text-sm">
            {items.length} {items.length === 1 ? "item" : "items"}
          </Badge>
        )}
      </div>

      <Separator />

      {/* Empty state */}
      {items.length === 0 && (
        <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 rounded-xl border border-dashed text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <Heart className="h-8 w-8 text-muted-foreground/50" />
          </div>
          <div>
            <p className="text-lg font-semibold">Your wishlist is empty</p>
            <p className="text-sm text-muted-foreground">
              Click the heart icon on any product to save it here.
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate("/products")}>
            Browse Products
          </Button>
        </div>
      )}

      {/* Grid — same layout and ProductCard as Products page */}
      {items.length > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {items.map((item) => (
            <ProductCard key={item.id} product={item.product} />
          ))}
        </div>
      )}
    </div>
  )
}
