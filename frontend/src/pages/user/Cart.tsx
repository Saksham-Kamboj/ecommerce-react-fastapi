import { useCart } from "@/contexts/CartContext"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent } from "@/components/ui/card"
import {
  ShoppingCart,
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  ArrowRight,
} from "lucide-react"

export function UserCart() {
  const { cart, updateQuantity, removeFromCart, clearCart } = useCart()
  const navigate = useNavigate()

  const items = cart?.items ?? []
  const total = cart?.total_price ?? 0
  const hasItems = items.length > 0

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">
            My Cart
          </h1>
          <p className="text-muted-foreground">
            Review your items before checkout.
          </p>
        </div>
        {hasItems && (
          <Badge variant="secondary" className="px-3 py-1 text-sm">
            {items.length} {items.length === 1 ? "item" : "items"}
          </Badge>
        )}
      </div>

      <Separator />

      {/* Empty state */}
      {!hasItems && (
        <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 rounded-xl border border-dashed text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <ShoppingCart className="h-8 w-8 text-muted-foreground/50" />
          </div>
          <div>
            <p className="text-lg font-semibold">Your cart is empty</p>
            <p className="text-sm text-muted-foreground">
              Add products to your cart to see them here.
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate("/products")}>
            <ShoppingBag className="mr-2 h-4 w-4" />
            Browse Products
          </Button>
        </div>
      )}

      {/* Cart content */}
      {hasItems && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Items list */}
          <div className="flex flex-col gap-3 lg:col-span-2">
            {items.map((item) => (
              <Card key={item.id} className="overflow-hidden p-0">
                <CardContent className="flex items-center gap-4 p-2">
                  {/* Product visual */}
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-white">
                    {item.product.image_url ? (
                      <img
                        src={item.product.image_url}
                        alt={item.product.name}
                        className="h-full w-full object-contain mix-blend-multiply p-1"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-muted/50">
                        <ShoppingCart className="h-7 w-7 text-muted-foreground/30" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">
                      {item.product.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      ₹{item.product.price.toFixed(2)} each
                    </p>
                    {item.product.stock_quantity < 10 &&
                      item.product.stock_quantity > 0 && (
                        <p className="text-xs text-amber-500">
                          Only {item.product.stock_quantity} left
                        </p>
                      )}
                  </div>

                  {/* Qty controls */}
                  <div className="flex items-center gap-2 rounded-md border p-0.5">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 rounded-sm"
                      onClick={() =>
                        updateQuantity(item.id, Math.max(1, item.quantity - 1))
                      }
                      disabled={item.quantity <= 1}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-6 text-center text-sm font-medium">
                      {item.quantity}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 rounded-sm"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      disabled={item.quantity >= item.product.stock_quantity}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>

                  {/* Line total */}
                  <p className="w-20 text-right font-semibold">
                    ₹{(item.product.price * item.quantity).toFixed(2)}
                  </p>

                  {/* Remove */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => removeFromCart(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Remove</span>
                  </Button>
                </CardContent>
              </Card>
            ))}

            <Button
              variant="ghost"
              size="sm"
              className="self-start text-destructive hover:text-destructive"
              onClick={clearCart}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Clear Cart
            </Button>
          </div>

          {/* Order summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardContent className="flex flex-col gap-4 p-5">
                <h2 className="text-lg font-semibold">Order Summary</h2>
                <Separator />

                <div className="flex flex-col gap-2 text-sm">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between">
                      <span className="max-w-[160px] truncate text-muted-foreground">
                        {item.product.name} × {item.quantity}
                      </span>
                      <span className="font-medium">
                        ₹{(item.product.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="flex items-center justify-between font-semibold">
                  <span>Subtotal</span>
                  <span className="text-xl font-bold text-primary">
                    ₹{total.toFixed(2)}
                  </span>
                </div>

                <p className="text-xs text-muted-foreground">
                  Shipping and taxes calculated at checkout.
                </p>

                <Button
                  className="w-full"
                  onClick={() => navigate("/checkout")}
                >
                  Proceed to Checkout
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
