import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { useRazorpay } from "react-razorpay"
import { useCart } from "@/contexts/CartContext"
import { useAuth } from "@/contexts/AuthContext"
import { ordersApi } from "@/lib/api/orders"
import { paymentsApi } from "@/lib/api/payments"
import { addressApi } from "@/lib/api/addresses"
import { couponsApi } from "@/lib/api/coupons"
import type { Address } from "@/types/address"
import type { CouponOut } from "@/types/coupon"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import {
  ArrowLeft,
  CreditCard,
  Loader2,
  MapPin,
  Package,
  ShoppingCart,
  ChevronDown,
  Tag,
} from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface CheckoutForm {
  name: string
  phone: string
  address_line1: string
  address_line2?: string
  city: string
  state: string
  postal_code: string
  country: string
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

  const [addresses, setAddresses] = useState<Address[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<string>("new")

  const [activeCoupons, setActiveCoupons] = useState<CouponOut[]>([])
  const [isCouponsModalOpen, setIsCouponsModalOpen] = useState(false)
  const [appliedCoupon, setAppliedCoupon] = useState<CouponOut | null>(null)
  const [discountAmount, setDiscountAmount] = useState(0)
  const [couponCodeInput, setCouponCodeInput] = useState("")
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false)

  const finalTotal = Math.max(0, total - discountAmount)

  useEffect(() => {
    addressApi
      .getAddresses()
      .then((res) => {
        const data = res.data
        setAddresses(data)
        const defaultAddr = data.find((a) => a.is_default)
        if (defaultAddr) {
          setSelectedAddressId(defaultAddr.id)
        } else if (data.length > 0) {
          setSelectedAddressId(data[0].id)
        }
      })
      .catch(console.error)

    couponsApi
      .getActiveCoupons()
      .then((res) => setActiveCoupons(res.data))
      .catch(console.error)
  }, [])

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CheckoutForm>({
    defaultValues: {
      name: user?.full_name ?? "",
      phone: user?.phone ?? "",
      address_line1: "",
      address_line2: "",
      city: "",
      state: "",
      postal_code: "",
      country: "India",
    },
  })

  // Watch for selected address changes to populate form
  useEffect(() => {
    if (selectedAddressId !== "new") {
      const addr = addresses.find((a) => a.id === selectedAddressId)
      if (addr) {
        setValue("address_line1", addr.address_line1)
        setValue("address_line2", addr.address_line2 || "")
        setValue("city", addr.city)
        setValue("state", addr.state)
        setValue("postal_code", addr.postal_code)
        setValue("country", addr.country)
      }
    } else {
      setValue("address_line1", "")
      setValue("address_line2", "")
      setValue("city", "")
      setValue("state", "")
      setValue("postal_code", "")
      setValue("country", "India")
    }
  }, [selectedAddressId, addresses, setValue])

  if (items.length === 0) {
    return (
      <div className="flex min-h-100 flex-col items-center justify-center gap-4 rounded-xl border border-dashed text-center">
        <ShoppingCart className="h-12 w-12 text-muted-foreground/40" />
        <p className="text-lg font-semibold">Your cart is empty</p>
        <Button variant="outline" onClick={() => navigate("/products")}>
          Browse Products
        </Button>
      </div>
    )
  }

  const handleApplyCoupon = async (codeToApply: string) => {
    if (!codeToApply.trim()) return
    setIsApplyingCoupon(true)
    try {
      const res = await couponsApi.validateCoupon({
        code: codeToApply,
        cart_total: total,
      })
      const data = res.data
      if (data.is_valid && data.coupon) {
        setAppliedCoupon(data.coupon)
        setDiscountAmount(data.discount_amount)
        toast.success(res.message || "Coupon applied successfully!")
        setCouponCodeInput(data.coupon.code)
      } else {
        toast.error(res.message || "Invalid coupon")
        handleRemoveCoupon()
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to validate coupon")
      handleRemoveCoupon()
    } finally {
      setIsApplyingCoupon(false)
    }
  }

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null)
    setDiscountAmount(0)
    setCouponCodeInput("")
  }

  const onSubmit = async (data: CheckoutForm) => {
    setIsProcessing(true)
    try {
      let activeAddressId = selectedAddressId
      if (activeAddressId === "new") {
        const newAddr = await addressApi.createAddress({
          title: "Delivery Address",
          address_line1: data.address_line1,
          address_line2: data.address_line2 || "",
          city: data.city,
          state: data.state,
          postal_code: data.postal_code,
          country: data.country,
        })
        activeAddressId = newAddr.data.id
        // optionally add it to local state so user doesn't have to save again if checkout fails
        setAddresses((prev) => [...prev, newAddr.data])
        setSelectedAddressId(newAddr.data.id)
      }

      // Step 1 — Validate cart (no order created)
      await ordersApi.placeOrder({
        shipping_address_id: activeAddressId,
        shipping_name: data.name,
        shipping_phone: data.phone || null,
        notes: data.notes || null,
        coupon_code: appliedCoupon?.code,
      })

      // Step 2 — Create payment (no order_id needed)
      const payRes = await paymentsApi.createPaymentOrder({
        shipping_address_id: activeAddressId,
        shipping_name: data.name,
        shipping_phone: data.phone || null,
        notes: data.notes || null,
        coupon_code: appliedCoupon?.code,
      })
      const { razorpay_order_id, amount, currency, key_id } = payRes.data

      // Step 3 — Open Razorpay checkout
      const rzp = new Razorpay({
        key: key_id,
        amount,
        currency: currency as "INR",
        order_id: razorpay_order_id,
        name: "E-Commerce Platform",
        description: `Order Payment`,
        prefill: {
          name: data.name,
          email: user?.email ?? "",
          contact: data.phone ?? "",
        },
        theme: { color: "#0ea5e9" },
        handler: async (response) => {
          // Step 4 — Verify payment (order created here)
          try {
            const verifyRes = await paymentsApi.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            })
            const order = verifyRes.data // Order created HERE on backend
            await refreshCart() // cart cleared on backend
            toast.success(verifyRes.message)
            navigate(`/orders/${order.id}`)
          } catch (err) {
            toast.error(
              err instanceof Error ? err.message : "Payment verification failed"
            )
            navigate("/cart")
          } finally {
            setIsProcessing(false)
          }
        },
        modal: {
          ondismiss: () => {
            toast.info("Payment cancelled. Try again.")
            navigate("/cart")
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
                <CardTitle className="flex items-center justify-between text-base">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Delivery Address
                  </div>
                  {addresses.length > 0 && (
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button
                            variant="outline"
                            className="h-9 w-fit justify-between text-xs font-normal"
                          />
                        }
                      >
                        {selectedAddressId === "new"
                          ? "+ Use a new address"
                          : addresses.find((a) => a.id === selectedAddressId)
                              ?.title || "Select an address"}
                        <ChevronDown className="h-4 w-4 opacity-50" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-fit">
                        {addresses.map((a) => (
                          <DropdownMenuItem
                            key={a.id}
                            onClick={() => setSelectedAddressId(a.id)}
                            className="cursor-pointer"
                          >
                            {a.title} - {a.address_line1.substring(0, 20)}
                            {a.address_line1.length > 20 ? "..." : ""}
                          </DropdownMenuItem>
                        ))}
                        <DropdownMenuItem
                          onClick={() => setSelectedAddressId("new")}
                          className="cursor-pointer font-semibold text-primary"
                        >
                          + Use a new address
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
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
                      <span className="max-w-40 truncate text-muted-foreground">
                        {item.product.name} × {item.quantity}
                      </span>
                      <span className="font-medium">
                        ₹{(item.product.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                {appliedCoupon && (
                  <div className="flex items-center justify-between text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                    <span>Discount ({appliedCoupon.code})</span>
                    <span>-₹{discountAmount.toFixed(2)}</span>
                  </div>
                )}

                <Separator />

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Total</span>
                  <span className="text-xl font-bold text-primary">
                    ₹{finalTotal.toFixed(2)}
                  </span>
                </div>

                <p className="text-xs text-muted-foreground">
                  Shipping and taxes calculated at checkout.
                </p>

                {/* Coupon Input Area */}
                <div className="flex flex-col gap-2 rounded-lg border bg-muted/30 p-3">
                  <Label className="text-xs font-semibold">Discount Code</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter code"
                      className="h-9 text-sm"
                      value={couponCodeInput}
                      onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                      disabled={!!appliedCoupon || isApplyingCoupon}
                    />
                    {appliedCoupon ? (
                      <Button
                        type="button"
                        variant="ghost"
                        className="h-9 text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={handleRemoveCoupon}
                      >
                        Remove
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        variant="secondary"
                        className="h-9"
                        disabled={!couponCodeInput || isApplyingCoupon}
                        onClick={() => handleApplyCoupon(couponCodeInput)}
                      >
                        {isApplyingCoupon ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "Apply"
                        )}
                      </Button>
                    )}
                  </div>
                  
                  {/* See All Coupons Button */}
                  {!appliedCoupon && activeCoupons.length > 0 && (
                    <Button
                      type="button"
                      variant="outline"
                      className="mt-2 w-full text-xs"
                      onClick={() => setIsCouponsModalOpen(true)}
                    >
                      <Tag className="mr-2 h-3 w-3" />
                      View all available coupons
                    </Button>
                  )}
                </div>

                <Button
                  type="submit"
                  className="mt-2 w-full gap-2"
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
                      Place Order & Pay ₹{finalTotal.toFixed(2)}
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

      <Dialog open={isCouponsModalOpen} onOpenChange={setIsCouponsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Available Coupons</DialogTitle>
          </DialogHeader>
          <div className="mt-4 flex max-h-[60vh] flex-col gap-3 overflow-y-auto pr-2">
            {activeCoupons.map((coupon) => {
              const isValidForCart =
                !coupon.min_order_value || total >= coupon.min_order_value;
                
              return (
                <div
                  key={coupon.id}
                  className={`flex cursor-pointer items-center justify-between rounded-lg border p-3 transition-colors ${
                    isValidForCart
                      ? "border-emerald-200 bg-emerald-50 hover:bg-emerald-100 dark:border-emerald-900/50 dark:bg-emerald-950/20 dark:hover:bg-emerald-900/30"
                      : "opacity-50 grayscale"
                  }`}
                  onClick={() => {
                    if (isValidForCart) {
                      handleApplyCoupon(coupon.code)
                      setIsCouponsModalOpen(false)
                    }
                  }}
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 font-bold">
                      <Tag className="h-4 w-4 text-emerald-600" />
                      {coupon.code}
                    </div>
                    {coupon.min_order_value && (
                      <span className="text-xs text-muted-foreground">
                        Min. order: ₹{coupon.min_order_value}
                      </span>
                    )}
                  </div>
                  <div className="font-bold text-emerald-600">
                    {coupon.discount_type === "percentage"
                      ? `${coupon.discount_value}% OFF`
                      : `₹${coupon.discount_value} OFF`}
                  </div>
                </div>
              )
            })}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
