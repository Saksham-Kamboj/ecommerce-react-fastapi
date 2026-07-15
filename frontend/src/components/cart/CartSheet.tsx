import { useCart } from "@/contexts/CartContext"
import { useNavigate } from "react-router-dom"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ShoppingCart, Minus, Plus, Trash2 } from "lucide-react"

export function CartSheet() {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart()
  const navigate = useNavigate()

  const items = cart?.items || []
  const hasItems = items.length > 0
  const total = cart?.total_price || 0

  return (
    <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
      <SheetContent className="flex max-h-screen w-full flex-col sm:max-w-md">
        <SheetHeader className="border-b border-border p-3">
          <SheetTitle className="flex items-center gap-2 text-xl">
            <ShoppingCart className="h-5 w-5" />
            Your Cart {hasItems && `(${items.length})`}
          </SheetTitle>
          <SheetDescription className="sr-only">
            View your shopping cart items and proceed to checkout
          </SheetDescription>
        </SheetHeader>

        {hasItems ? (
          <div className="flex min-h-0 flex-1 flex-col">
            <ScrollArea className="min-h-0 flex-1 px-4">
              <div className="flex flex-col gap-6 py-4">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    {/* Placeholder for item image if needed in future */}
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted/50">
                      <ShoppingCart className="h-8 w-8 text-muted-foreground/30" />
                    </div>

                    <div className="flex flex-1 flex-col justify-between">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="line-clamp-1 text-sm font-medium">
                          {item.product.name}
                        </h4>
                        <p className="text-sm font-semibold whitespace-nowrap">
                          ₹{(item.product.price * item.quantity).toFixed(2)}
                        </p>
                      </div>

                      <div className="mt-auto flex items-center justify-between">
                        <div className="flex items-center gap-2 rounded-md border p-0.5">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 rounded-sm"
                            onClick={() =>
                              updateQuantity(
                                item.id,
                                Math.max(1, item.quantity - 1)
                              )
                            }
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-4 text-center text-xs font-medium">
                            {item.quantity}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 rounded-sm"
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                            disabled={
                              item.quantity >= item.product.stock_quantity
                            }
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="flex flex-col gap-2 border-t border-border p-4 pt-2">
              <div className="flex items-center justify-between font-medium">
                <span>Subtotal</span>
                <span className="text-xl font-bold">₹{total.toFixed(2)}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Shipping and taxes calculated at checkout.
              </p>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={clearCart}
                >
                  Clear Cart
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => {
                    setIsCartOpen(false)
                    navigate("/checkout")
                  }}
                >
                  Checkout
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 text-muted-foreground">
            <ShoppingCart className="h-16 w-16 text-muted-foreground/30" />
            <p>Your cart is empty.</p>
            <Button variant="outline" onClick={() => setIsCartOpen(false)}>
              Continue Shopping
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
