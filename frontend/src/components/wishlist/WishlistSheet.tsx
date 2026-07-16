import { useWishlist } from "@/contexts/WishlistContext"
import { useCart } from "@/contexts/CartContext"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Heart, ShoppingCart, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export function WishlistSheet() {
  const { items, isWishlistOpen, setIsWishlistOpen, toggle } = useWishlist()
  const { addToCart, updateQuantity, cart } = useCart()

  const hasItems = items.length > 0

  return (
    <Sheet open={isWishlistOpen} onOpenChange={setIsWishlistOpen}>
      <SheetContent className="flex max-h-screen w-full flex-col sm:max-w-md">
        <SheetHeader className="border-b border-border p-3">
          <SheetTitle className="flex items-center gap-2 text-xl">
            <Heart className="h-5 w-5" />
            Your Wishlist {hasItems && `(${items.length})`}
          </SheetTitle>
          <SheetDescription className="sr-only">
            View your saved wishlist items
          </SheetDescription>
        </SheetHeader>

        {hasItems ? (
          <div className="flex min-h-0 flex-1 flex-col">
            <ScrollArea className="min-h-0 flex-1 px-4">
              <div className="flex flex-col gap-6 py-4">
                {items.map((item) => {
                  const inCart = cart?.items.some(
                    (c) => c.product.id === item.product_id
                  )
                  return (
                    <div key={item.id} className="flex gap-4">
                      {/* Product image placeholder */}
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted/50">
                        <Heart className="h-6 w-6 text-muted-foreground/30" />
                      </div>

                      <div className="flex flex-1 flex-col justify-between gap-1">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="line-clamp-2 text-sm leading-tight font-medium">
                            {item.product.name}
                          </h4>
                          <p className="shrink-0 text-sm font-semibold">
                            ₹{item.product.price.toFixed(2)}
                          </p>
                        </div>

                        <div className="flex items-center justify-between">
                          {item.product.stock_quantity > 0 ? (
                            <span className="text-xs font-medium text-emerald-500">
                              {item.product.stock_quantity} in stock
                            </span>
                          ) : (
                            <Badge variant="destructive" className="text-xs">
                              Out of stock
                            </Badge>
                          )}

                          <div className="flex items-center gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 gap-1 px-2 text-xs"
                              disabled={item.product.stock_quantity === 0}
                              onClick={() => {
                                if (inCart) {
                                  updateQuantity(inCart.id, inCart.quantity + 1)
                                } else {
                                  addToCart(item.product_id, 1)
                                }
                              }}
                            >
                              <ShoppingCart className="h-3 w-3" />
                              {inCart ? "Add More" : "Add to Cart"}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-muted-foreground hover:text-destructive"
                              onClick={() => toggle(item.product_id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              <span className="sr-only">
                                Remove from wishlist
                              </span>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </ScrollArea>

            <div className="flex flex-col gap-2 border-t border-border p-4 pt-3">
              <p className="text-xs text-muted-foreground">
                {items.length} item{items.length !== 1 ? "s" : ""} saved
              </p>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setIsWishlistOpen(false)}
              >
                Continue Shopping
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 text-muted-foreground">
            <Heart className="h-16 w-16 text-muted-foreground/30" />
            <p>Your wishlist is empty.</p>
            <Button variant="outline" onClick={() => setIsWishlistOpen(false)}>
              Browse Products
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
