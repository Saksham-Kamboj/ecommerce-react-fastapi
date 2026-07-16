import { useState } from "react"
import { useForm } from "react-hook-form"
import { useAuth } from "@/contexts/AuthContext"
import { useCart } from "@/contexts/CartContext"
import { useWishlist } from "@/contexts/WishlistContext"
import { profileApi } from "@/lib/api/profile"
import type { UserUpdateSelf, ChangePasswordRequest } from "@/types/auth"
import type { WishlistItemOut } from "@/types/wishlist"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import {
  CalendarIcon,
  CreditCardIcon,
  KeyRoundIcon,
  Loader2Icon,
  MapPinIcon,
  PackageIcon,
  ShoppingCartIcon,
  UserIcon,
  HeartIcon,
  CheckCircle2Icon,
  Trash2Icon,
} from "lucide-react"

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase()
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
}: Readonly<{
  icon: React.ElementType
  label: string
  value: string
  sub?: string
}>) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-lg leading-tight font-semibold">{value}</p>
          {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
        </div>
      </CardContent>
    </Card>
  )
}

function FieldRow({
  label,
  value,
}: Readonly<{ label: string; value?: string | null }>) {
  return (
    <div className="py-2">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-medium">{value || "—"}</p>
    </div>
  )
}

function SuccessAlert({ message }: Readonly<{ message: string }>) {
  return (
    <div className="flex items-center gap-2 rounded-md bg-green-500/10 px-3 py-2 text-sm text-green-600 dark:text-green-400">
      <CheckCircle2Icon className="h-4 w-4 shrink-0" />
      {message}
    </div>
  )
}

function ErrorAlert({ message }: Readonly<{ message: string }>) {
  return (
    <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
      {message}
    </div>
  )
}

// ── Main Component ─────────────────────────────────────────────────────────────
export function UserProfile() {
  const { user, updateUser } = useAuth()
  const { cart } = useCart()
  const { items: wishlistItems, toggle: toggleWishlist } = useWishlist()

  if (!user) return null

  const displayName = user.full_name || user.email.split("@")[0]
  const initials = getInitials(displayName)
  const cartItemCount = cart?.items?.length ?? 0
  const cartTotal = cart?.total_price ?? 0

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-primary">
          My Profile
        </h1>
        <p className="text-muted-foreground">
          View and manage your account details.
        </p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center gap-4 p-6 sm:flex-row sm:items-start">
          <Avatar className="h-20 w-20">
            <AvatarFallback className="rounded-full bg-primary/10 text-2xl font-bold text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <h2 className="text-2xl font-bold">{displayName}</h2>
              <Badge
                variant={user.role === "superadmin" ? "default" : "secondary"}
                className="capitalize"
              >
                {user.role === "superadmin" ? "Admin" : "Customer"}
              </Badge>
              {user.is_active && (
                <Badge
                  variant="outline"
                  className="border-green-500 text-green-600 dark:text-green-400"
                >
                  Active
                </Badge>
              )}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{user.email}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Member since {formatDate(user.created_at)}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          icon={PackageIcon}
          label="Total Orders"
          value="0"
          sub="No orders yet"
        />
        <StatCard
          icon={ShoppingCartIcon}
          label="Cart Items"
          value={String(cartItemCount)}
          sub={
            cartItemCount > 0
              ? `₹${cartTotal.toFixed(2)} total`
              : "Cart is empty"
          }
        />
        <StatCard
          icon={HeartIcon}
          label="Wishlist"
          value={String(wishlistItems.length)}
          sub={
            wishlistItems.length > 0
              ? `${wishlistItems.length} saved`
              : "No items saved"
          }
        />
        <StatCard
          icon={MapPinIcon}
          label="Address"
          value={user.city ?? "Not set"}
          sub={user.country ?? undefined}
        />
      </div>

      <Tabs defaultValue="account">
        <TabsList className="mb-2 w-full justify-start gap-1 p-1">
          <TabsTrigger value="account" className="flex items-center gap-1.5">
            <UserIcon className="h-3.5 w-3.5" />
            Account
          </TabsTrigger>
          <TabsTrigger value="address" className="flex items-center gap-1.5">
            <MapPinIcon className="h-3.5 w-3.5" />
            Address
          </TabsTrigger>
          <TabsTrigger value="wishlist" className="flex items-center gap-1.5">
            <HeartIcon className="h-3.5 w-3.5" />
            Wishlist
            {wishlistItems.length > 0 && (
              <Badge
                variant="secondary"
                className="ml-0.5 h-4 px-1 text-[10px]"
              >
                {wishlistItems.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="cart" className="flex items-center gap-1.5">
            <ShoppingCartIcon className="h-3.5 w-3.5" />
            Cart
            {cartItemCount > 0 && (
              <Badge
                variant="secondary"
                className="ml-0.5 h-4 px-1 text-[10px]"
              >
                {cartItemCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-1.5">
            <KeyRoundIcon className="h-3.5 w-3.5" />
            Security
          </TabsTrigger>
          <TabsTrigger value="payment" className="flex items-center gap-1.5">
            <CreditCardIcon className="h-3.5 w-3.5" />
            Payment
          </TabsTrigger>
        </TabsList>

        <TabsContent value="account">
          <div className="grid gap-4 lg:grid-cols-2">
            <AccountViewCard user={user} />
            <AccountEditCard user={user} updateUser={updateUser} />
          </div>
        </TabsContent>

        <TabsContent value="address">
          <div className="grid gap-4 lg:grid-cols-2">
            <AddressViewCard user={user} />
            <AddressEditCard user={user} updateUser={updateUser} />
          </div>
        </TabsContent>

        <TabsContent value="wishlist">
          <WishlistCard items={wishlistItems} onRemove={toggleWishlist} />
        </TabsContent>

        <TabsContent value="cart">
          <CartSummaryCard
            cart={cart}
            cartItemCount={cartItemCount}
            cartTotal={cartTotal}
          />
        </TabsContent>

        <TabsContent value="security">
          <ChangePasswordCard />
        </TabsContent>

        <TabsContent value="payment">
          <Card className="border-dashed opacity-70">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <CreditCardIcon className="h-4 w-4" />
                Payment Methods
              </CardTitle>
              <CardDescription>
                Save cards and UPI for faster checkout.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex min-h-[160px] flex-col items-center justify-center gap-2 text-center">
              <CreditCardIcon className="h-10 w-10 text-muted-foreground/30" />
              <p className="text-sm font-medium">Coming Soon</p>
              <p className="text-xs text-muted-foreground">
                Payment method management will be available with Razorpay /
                Stripe integration.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// ── Account View ───────────────────────────────────────────────────────────────
function AccountViewCard({
  user,
}: Readonly<{ user: NonNullable<ReturnType<typeof useAuth>["user"]> }>) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Account Details</CardTitle>
        <CardDescription>Your current profile information.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-1 px-6 pb-5">
        <FieldRow label="Full Name" value={user.full_name} />
        <Separator />
        <FieldRow label="Email" value={user.email} />
        <Separator />
        <FieldRow label="Phone" value={user.phone} />
        <Separator />
        <FieldRow
          label="Date of Birth"
          value={user.date_of_birth ?? undefined}
        />
        <Separator />
        <FieldRow label="Bio" value={user.bio} />
        <Separator />
        <FieldRow label="Member Since" value={formatDate(user.created_at)} />
      </CardContent>
    </Card>
  )
}

// ── Account Edit ───────────────────────────────────────────────────────────────
function AccountEditCard({
  user,
  updateUser,
}: Readonly<{
  user: NonNullable<ReturnType<typeof useAuth>["user"]>
  updateUser: (u: NonNullable<ReturnType<typeof useAuth>["user"]>) => void
}>) {
  const [isSaving, setIsSaving] = useState(false)
  const [success, setSuccess] = useState("")
  const [error, setError] = useState("")
  const {
    register,
    handleSubmit,
    formState: { isDirty },
  } = useForm<UserUpdateSelf>({
    defaultValues: {
      full_name: user.full_name ?? "",
      phone: user.phone ?? "",
      date_of_birth: user.date_of_birth ?? "",
      bio: user.bio ?? "",
    },
  })
  const onSubmit = async (data: UserUpdateSelf) => {
    setIsSaving(true)
    setSuccess("")
    setError("")
    try {
      const res = await profileApi.updateMe(data)
      updateUser(res.data)
      setSuccess("Profile updated successfully.")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile.")
    } finally {
      setIsSaving(false)
    }
  }
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Edit Account</CardTitle>
        <CardDescription>Update your personal information.</CardDescription>
      </CardHeader>
      <CardContent className="px-6 pb-5">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="full_name">Full Name</Label>
            <Input
              id="full_name"
              placeholder="John Doe"
              {...register("full_name")}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              placeholder="+91 98765 43210"
              {...register("phone")}
            />
          </div>
          <div className="grid gap-1.5">
            <Label
              htmlFor="date_of_birth"
              className="flex items-center gap-1.5"
            >
              <CalendarIcon className="h-3.5 w-3.5" />
              Date of Birth
            </Label>
            <Input
              id="date_of_birth"
              type="date"
              {...register("date_of_birth")}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              placeholder="Tell us a bit about yourself..."
              rows={3}
              {...register("bio")}
            />
          </div>
          {success && <SuccessAlert message={success} />}
          {error && <ErrorAlert message={error} />}
          <Button
            type="submit"
            disabled={isSaving || !isDirty}
            className="w-full sm:w-auto"
          >
            {isSaving && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

// ── Address View ───────────────────────────────────────────────────────────────
function AddressViewCard({
  user,
}: Readonly<{ user: NonNullable<ReturnType<typeof useAuth>["user"]> }>) {
  const hasAddress = user.address_line1 || user.city || user.country
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Saved Address</CardTitle>
        <CardDescription>Your default delivery address.</CardDescription>
      </CardHeader>
      <CardContent className="px-6 pb-5">
        {hasAddress ? (
          <div className="space-y-1">
            <FieldRow label="Address Line 1" value={user.address_line1} />
            <Separator />
            <FieldRow label="Address Line 2" value={user.address_line2} />
            <Separator />
            <FieldRow label="City" value={user.city} />
            <Separator />
            <FieldRow label="State" value={user.state} />
            <Separator />
            <FieldRow label="Postal Code" value={user.postal_code} />
            <Separator />
            <FieldRow label="Country" value={user.country} />
          </div>
        ) : (
          <div className="flex min-h-[160px] flex-col items-center justify-center gap-2 rounded-lg border border-dashed text-center">
            <MapPinIcon className="h-8 w-8 text-muted-foreground/40" />
            <p className="text-sm font-medium">No address saved</p>
            <p className="text-xs text-muted-foreground">
              Add your delivery address on the right.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ── Address Edit ───────────────────────────────────────────────────────────────
function AddressEditCard({
  user,
  updateUser,
}: Readonly<{
  user: NonNullable<ReturnType<typeof useAuth>["user"]>
  updateUser: (u: NonNullable<ReturnType<typeof useAuth>["user"]>) => void
}>) {
  const [isSaving, setIsSaving] = useState(false)
  const [success, setSuccess] = useState("")
  const [error, setError] = useState("")
  const {
    register,
    handleSubmit,
    formState: { isDirty },
  } = useForm<UserUpdateSelf>({
    defaultValues: {
      address_line1: user.address_line1 ?? "",
      address_line2: user.address_line2 ?? "",
      city: user.city ?? "",
      state: user.state ?? "",
      postal_code: user.postal_code ?? "",
      country: user.country ?? "",
    },
  })
  const onSubmit = async (data: UserUpdateSelf) => {
    setIsSaving(true)
    setSuccess("")
    setError("")
    try {
      const res = await profileApi.updateMe(data)
      updateUser(res.data)
      setSuccess("Address updated successfully.")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update address.")
    } finally {
      setIsSaving(false)
    }
  }
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Edit Address</CardTitle>
        <CardDescription>Update your delivery address.</CardDescription>
      </CardHeader>
      <CardContent className="px-6 pb-5">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="address_line1">Address Line 1</Label>
            <Input
              id="address_line1"
              placeholder="123, Main Street"
              {...register("address_line1")}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="address_line2">Address Line 2 (optional)</Label>
            <Input
              id="address_line2"
              placeholder="Apartment, suite, etc."
              {...register("address_line2")}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="city">City</Label>
              <Input id="city" placeholder="Mumbai" {...register("city")} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                placeholder="Maharashtra"
                {...register("state")}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="postal_code">Postal Code</Label>
              <Input
                id="postal_code"
                placeholder="400001"
                {...register("postal_code")}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                placeholder="India"
                {...register("country")}
              />
            </div>
          </div>
          {success && <SuccessAlert message={success} />}
          {error && <ErrorAlert message={error} />}
          <Button
            type="submit"
            disabled={isSaving || !isDirty}
            className="w-full sm:w-auto"
          >
            {isSaving && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
            Save Address
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

// ── Wishlist Card ──────────────────────────────────────────────────────────────
function WishlistCard({
  items,
  onRemove,
}: Readonly<{
  items: WishlistItemOut[]
  onRemove: (productId: string) => Promise<void>
}>) {
  const { cart, addToCart, updateQuantity } = useCart()

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">My Wishlist</CardTitle>
            <CardDescription>
              Products you have saved for later.
            </CardDescription>
          </div>
          {items.length > 0 && (
            <Badge variant="secondary">{items.length} items</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="px-6 pb-5">
        {items.length === 0 ? (
          <div className="flex min-h-[160px] flex-col items-center justify-center gap-2 rounded-lg border border-dashed text-center">
            <HeartIcon className="h-8 w-8 text-muted-foreground/40" />
            <p className="text-sm font-medium">Your wishlist is empty</p>
            <p className="text-xs text-muted-foreground">
              Click the heart icon on any product to save it.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            {items.map((item) => {
              const cartItem = cart?.items.find(
                (c) => c.product.id === item.product_id
              )
              const isInCart = !!cartItem
              return (
                <div key={item.id}>
                  <div className="flex items-center justify-between gap-3 py-2.5">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {item.product.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        ₹{item.product.price.toFixed(2)} ·{" "}
                        {item.product.stock_quantity > 0 ? (
                          <span className="text-emerald-500">
                            {item.product.stock_quantity} in stock
                          </span>
                        ) : (
                          <span className="text-destructive">Out of stock</span>
                        )}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <Button
                        variant={isInCart ? "secondary" : "outline"}
                        size="sm"
                        className="h-7 gap-1 px-2 text-xs"
                        disabled={item.product.stock_quantity === 0}
                        onClick={() => {
                          if (isInCart && cartItem) {
                            updateQuantity(cartItem.id, cartItem.quantity + 1)
                          } else {
                            addToCart(item.product_id, 1)
                          }
                        }}
                      >
                        <ShoppingCartIcon className="h-3 w-3" />
                        {isInCart
                          ? `Add More (${cartItem.quantity})`
                          : "Add to Cart"}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => onRemove(item.product_id)}
                      >
                        <Trash2Icon className="h-4 w-4" />
                        <span className="sr-only">Remove from wishlist</span>
                      </Button>
                    </div>
                  </div>
                  <Separator />
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ── Cart Summary ───────────────────────────────────────────────────────────────
function CartSummaryCard({
  cart,
  cartItemCount,
  cartTotal,
}: Readonly<{
  cart: ReturnType<typeof useCart>["cart"]
  cartItemCount: number
  cartTotal: number
}>) {
  const { removeFromCart } = useCart()
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">Cart Summary</CardTitle>
            <CardDescription>Items currently in your cart.</CardDescription>
          </div>
          {cartItemCount > 0 && (
            <Badge variant="secondary">{cartItemCount} items</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="px-6 pb-5">
        {cartItemCount === 0 ? (
          <div className="flex min-h-[160px] flex-col items-center justify-center gap-2 rounded-lg border border-dashed text-center">
            <ShoppingCartIcon className="h-8 w-8 text-muted-foreground/40" />
            <p className="text-sm font-medium">Your cart is empty</p>
            <p className="text-xs text-muted-foreground">
              Add products to see them here.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            {cart?.items.map((item) => (
              <div key={item.id}>
                <div className="flex items-center justify-between py-2.5">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {item.product.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Qty: {item.quantity} × ₹{item.product.price.toFixed(2)}
                    </p>
                  </div>
                  <div className="ml-4 flex shrink-0 items-center gap-3">
                    <p className="text-sm font-semibold">
                      ₹{(item.product.price * item.quantity).toFixed(2)}
                    </p>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => removeFromCart(item.id)}
                    >
                      <Trash2Icon className="h-4 w-4" />
                      <span className="sr-only">Remove from cart</span>
                    </Button>
                  </div>
                </div>
                <Separator />
              </div>
            ))}
            <div className="flex items-center justify-between pt-3">
              <span className="text-sm font-medium">Subtotal</span>
              <span className="text-base font-bold text-primary">
                ₹{cartTotal.toFixed(2)}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ── Change Password ────────────────────────────────────────────────────────────
function ChangePasswordCard() {
  const [isSaving, setIsSaving] = useState(false)
  const [success, setSuccess] = useState("")
  const [error, setError] = useState("")
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordRequest>()
  const onSubmit = async (data: ChangePasswordRequest) => {
    setIsSaving(true)
    setSuccess("")
    setError("")
    try {
      await profileApi.changePassword(data)
      setSuccess("Password changed successfully.")
      reset()
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to change password."
      )
    } finally {
      setIsSaving(false)
    }
  }
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <KeyRoundIcon className="h-4 w-4" />
            Change Password
          </CardTitle>
          <CardDescription>
            Enter your current password and choose a new one.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 pb-5">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <div className="grid gap-1.5">
              <Label htmlFor="current_password">Current Password</Label>
              <Input
                id="current_password"
                type="password"
                placeholder="••••••••"
                {...register("current_password", {
                  required: "Current password is required",
                })}
              />
              {errors.current_password && (
                <p className="text-xs text-destructive">
                  {errors.current_password.message}
                </p>
              )}
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="new_password">New Password</Label>
              <Input
                id="new_password"
                type="password"
                placeholder="••••••••"
                {...register("new_password", {
                  required: "New password is required",
                  minLength: { value: 6, message: "Minimum 6 characters" },
                })}
              />
              {errors.new_password && (
                <p className="text-xs text-destructive">
                  {errors.new_password.message}
                </p>
              )}
            </div>
            {success && <SuccessAlert message={success} />}
            {error && <ErrorAlert message={error} />}
            <Button
              type="submit"
              disabled={isSaving}
              className="w-full sm:w-auto"
            >
              {isSaving && (
                <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
              )}
              Update Password
            </Button>
          </form>
        </CardContent>
      </Card>
      <Card className="border-dashed opacity-70">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Two-Factor Authentication</CardTitle>
          <CardDescription>
            Add an extra layer of security to your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex min-h-[160px] flex-col items-center justify-center gap-2 text-center">
          <KeyRoundIcon className="h-8 w-8 text-muted-foreground/30" />
          <p className="text-sm font-medium">Coming Soon</p>
          <p className="text-xs text-muted-foreground">
            2FA via authenticator app or SMS will be available soon.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
