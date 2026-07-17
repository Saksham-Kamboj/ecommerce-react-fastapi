import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { useRazorpay } from "react-razorpay"
import { useCart } from "@/contexts/CartContext"
import { useAuth } from "@/contexts/AuthContext"
import { ordersApi } from "@/lib/api/orders"
import { paymentsApi } from "@/lib/api/payments"
import type { ShippingAddress } from "@/types/order"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import {
  ArrowLeft,
  CreditCard,
  Loader2,
  MapPin,
  Package,
  ShoppingCart,
} from "lucide-react"

interface CheckoutForm extends ShippingAddress {
  notes?: string
}

export function CheckoutPage() {
  const { cart, refreshCart } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()
  const { Razorpay } = useRazorpay()

  const [isProcessing, setIsProcessing] = useState(false)

  const items = cart?.items ?? []
  const total = cart?.total_price ?? 0

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutForm>({
    defaultValues: {
      name: user?.full_name ?? "",
      phone: user?.phone ?? "",
      address_line1: user?.address_line1 ?? "",
      address_line2: user?.address_line2 ?? "",
      city: user?.city ?? "",
      state: user?.state ?? "",
      postal_code: user?.postal_code ?? "",
      country: user?.country ?? "India",
    },
  })

  if (items.length === 0) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 rounded-xl border border-dashed text-center">
        <ShoppingCart className="h-12 w-12 text-muted-foreground/40" />
        <p className="text-lg font-semibold">Your cart is empty</p>
        <Button variant="outline" onClick={() => navigate("/products")}>
          Browse Products
        </Button>
      </div>
    )
  }

  const onSubmit = async (data: CheckoutForm) => {
    setIsProcessing(true)
    try {
      // Step 1 — Create order (status: pending, cart cleared)
      const orderRes = await ordersApi.placeOrder({
        shipping_address: {
          name: data.name,
          phone: data.phone || null,
          address_line1: data.address_line1,
          address_line2: data.address_line2 || null,
          city: data.city,
          state: data.state,
          postal_code: data.postal_code,
          country: data.country,
        },
        notes: data.notes || null,
      })
      await refreshCart()
      const order = orderRes.data

      // Step 2 — Create Razorpay payment order
      const payRes = await paymentsApi.createPaymentOrder({
        order_id: order.id,
      })
      const { razorpay_order_id, amount, currency, key_id } = payRes.data

      // Step 3 — Open Razorpay checkout
      const rzp = new Razorpay({
        key: key_id,
        amount,
        currency: currency as "INR",
        order_id: razorpay_order_id,
        name: "E-Commerce Platform",
        description: `Order #${order.id.slice(0, 8).toUpperCase()}`,
        prefill: {
          name: data.name,
          email: user?.email ?? "",
          contact: data.phone ?? "",
        },
        theme: { color: "#0ea5e9" },
        handler: async (response) => {
          // Step 4 — Verify payment on backend
          try {
            const verifyRes = await paymentsApi.verifyPayment({
              order_id: order.id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            })
            toast.success(verifyRes.message)
            navigate(`/orders/${order.id}`)
          } catch (err) {
            toast.error(
              err instanceof Error ? err.message : "Payment verification failed"
            )
            // Order placed but payment failed — redirect to order detail for retry
            navigate(`/orders/${order.id}`)
          } finally {
            setIsProcessing(false)
          }
        },
        modal: {
          ondismiss: () => {
            toast.info(
              "Payment cancelled. Your order is saved — you can pay from Orders page."
            )
            navigate(`/orders/${order.id}`)
            setIsProcessing(false)
          },
        },
      })
      rzp.open()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to place order")
      setIsProcessing(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">
            Checkout
          </h1>
          <p className="text-muted-foreground">
            Confirm your delivery address and pay.
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate("/cart")}>
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Cart
        </Button>
      </div>

      <Separator />

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left — shipping form */}
          <div className="flex flex-col gap-4 lg:col-span-2">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <MapPin className="h-4 w-4" />
                  Delivery Address
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4 px-6 pb-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="grid gap-1.5">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      placeholder="John Doe"
                      {...register("name", {
                        required: "Full name is required",
                      })}
                    />
                    {errors.name && (
                      <p className="text-xs text-destructive">
                        {errors.name.message}
                      </p>
                    )}
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      placeholder="+91 98765 43210"
                      {...register("phone")}
                    />
                  </div>
                </div>

                <div className="grid gap-1.5">
                  <Label htmlFor="address_line1">Address Line 1 *</Label>
                  <Input
                    id="address_line1"
                    placeholder="House no., Street name"
                    {...register("address_line1", {
                      required: "Address is required",
                    })}
                  />
                  {errors.address_line1 && (
                    <p className="text-xs text-destructive">
                      {errors.address_line1.message}
                    </p>
                  )}
                </div>

                <div className="grid gap-1.5">
                  <Label htmlFor="address_line2">
                    Address Line 2 (optional)
                  </Label>
                  <Input
                    id="address_line2"
                    placeholder="Apartment, suite, landmark"
                    {...register("address_line2")}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-1.5">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      placeholder="Mumbai"
                      {...register("city", { required: "City is required" })}
                    />
                    {errors.city && (
                      <p className="text-xs text-destructive">
                        {errors.city.message}
                      </p>
                    )}
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="state">State *</Label>
                    <Input
                      id="state"
                      placeholder="Maharashtra"
                      {...register("state", { required: "State is required" })}
                    />
                    {errors.state && (
                      <p className="text-xs text-destructive">
                        {errors.state.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-1.5">
                    <Label htmlFor="postal_code">Postal Code *</Label>
                    <Input
                      id="postal_code"
                      placeholder="400001"
                      {...register("postal_code", {
                        required: "Postal code is required",
                      })}
                    />
                    {errors.postal_code && (
                      <p className="text-xs text-destructive">
                        {errors.postal_code.message}
                      </p>
                    )}
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="country">Country *</Label>
                    <Input
                      id="country"
                      placeholder="India"
                      {...register("country", {
                        required: "Country is required",
                      })}
                    />
                    {errors.country && (
                      <p className="text-xs text-destructive">
                        {errors.country.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid gap-1.5">
                  <Label htmlFor="notes">Order Notes (optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any special instructions for delivery..."
                    rows={2}
                    {...register("notes")}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right — order summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Package className="h-4 w-4" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4 px-6 pb-6">
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

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Total</span>
                  <span className="text-xl font-bold text-primary">
                    ₹{total.toFixed(2)}
                  </span>
                </div>

                <p className="text-xs text-muted-foreground">
                  Shipping and taxes calculated at checkout.
                </p>

                <Button
                  type="submit"
                  className="w-full gap-2"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4" />
                      Place Order & Pay ₹{total.toFixed(2)}
                    </>
                  )}
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  className="w-full text-xs text-muted-foreground"
                  onClick={() => navigate("/cart")}
                >
                  ← Back to Cart
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}
