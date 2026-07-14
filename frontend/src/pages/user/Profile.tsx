import { useAuth } from "@/contexts/AuthContext"
import { useCart } from "@/contexts/CartContext"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  UserIcon,
  MailIcon,
  ShieldCheckIcon,
  CalendarIcon,
  ClockIcon,
  PackageIcon,
  HeartIcon,
  MapPinIcon,
  CreditCardIcon,
  BellIcon,
  ShoppingCartIcon,
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

// ── Stat Card ──────────────────────────────────────────────────────────────────
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

// ── Info Row ───────────────────────────────────────────────────────────────────
function InfoRow({
  icon: Icon,
  label,
  value,
  children,
}: Readonly<{
  icon: React.ElementType
  label: string
  value?: string
  children?: React.ReactNode
}>) {
  return (
    <div className="flex items-start gap-3 py-3">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        {children ?? (
          <p className="truncate text-sm font-medium">{value ?? "—"}</p>
        )}
      </div>
    </div>
  )
}

// ── Coming Soon Card ───────────────────────────────────────────────────────────
function ComingSoonCard({
  icon: Icon,
  title,
  description,
}: Readonly<{
  icon: React.ElementType
  title: string
  description: string
}>) {
  return (
    <Card className="border-dashed opacity-60">
      <CardContent className="flex items-center gap-4 p-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
          <Icon className="h-5 w-5 text-muted-foreground" />
        </div>
        <div>
          <p className="text-sm font-medium">{title}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        <Badge variant="secondary" className="ml-auto shrink-0 text-xs">
          Coming soon
        </Badge>
      </CardContent>
    </Card>
  )
}

// ── Main Component ─────────────────────────────────────────────────────────────
export function UserProfile() {
  const { user } = useAuth()
  const { cart } = useCart()

  if (!user) return null

  const displayName = user.full_name || user.email.split("@")[0]
  const initials = getInitials(displayName)

  const cartItemCount = cart?.items?.length ?? 0
  const cartTotal = cart?.total_price ?? 0
  const cartSubText =
    cartItemCount > 0 ? `₹${cartTotal.toFixed(2)} total` : "Cart is empty"

  return (
    <div className="flex flex-col gap-6">
      {/* ── Page heading ── */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-primary">
          My Profile
        </h1>
        <p className="text-muted-foreground">
          View and manage your account details.
        </p>
      </div>

      {/* ── Hero card ── */}
      <Card>
        <CardContent className="flex flex-col items-center gap-4 p-6 sm:flex-row sm:items-start">
          <Avatar className="h-20 w-20 text-2xl">
            <AvatarFallback className="rounded-full bg-primary/10 text-2xl font-bold text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-col items-center gap-2 sm:flex-row sm:items-center">
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

      {/* ── Stats row ── */}
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
          sub={cartSubText}
        />
        <StatCard
          icon={HeartIcon}
          label="Wishlist"
          value="0"
          sub="No items saved"
        />
        <StatCard
          icon={MapPinIcon}
          label="Saved Addresses"
          value="0"
          sub="No addresses"
        />
      </div>

      {/* ── Details + Activity grid ── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Account details */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Account Details</CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-4">
            <InfoRow
              icon={UserIcon}
              label="Full Name"
              value={user.full_name ?? "Not set"}
            />
            <Separator />
            <InfoRow icon={MailIcon} label="Email Address" value={user.email} />
            <Separator />
            <InfoRow icon={ShieldCheckIcon} label="Role">
              <Badge variant="secondary" className="mt-0.5 capitalize">
                {user.role}
              </Badge>
            </InfoRow>
            <Separator />
            <InfoRow
              icon={CalendarIcon}
              label="Account Created"
              value={formatDate(user.created_at)}
            />
            <Separator />
            <InfoRow
              icon={ClockIcon}
              label="Last Updated"
              value={formatDate(user.updated_at)}
            />
          </CardContent>
        </Card>

        {/* Cart summary */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Cart Summary</CardTitle>
              {cartItemCount > 0 && (
                <Badge variant="secondary">{cartItemCount} items</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="px-6 pb-4">
            {cartItemCount === 0 ? (
              <div className="flex min-h-[180px] flex-col items-center justify-center gap-2 rounded-lg border border-dashed text-center">
                <ShoppingCartIcon className="h-8 w-8 text-muted-foreground/40" />
                <p className="text-sm font-medium">Your cart is empty</p>
                <p className="text-xs text-muted-foreground">
                  Add products to see them here.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                {cart?.items.slice(0, 5).map((item) => (
                  <div key={item.id}>
                    <div className="flex items-center justify-between py-2.5">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {item.product.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Qty: {item.quantity} × ₹
                          {item.product.price.toFixed(2)}
                        </p>
                      </div>
                      <p className="ml-4 shrink-0 text-sm font-semibold">
                        ₹{(item.product.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                    <Separator />
                  </div>
                ))}
                {cartItemCount > 5 && (
                  <p className="pt-1 text-center text-xs text-muted-foreground">
                    +{cartItemCount - 5} more items
                  </p>
                )}
                <div className="flex items-center justify-between pt-2">
                  <span className="text-sm font-medium">Subtotal</span>
                  <span className="text-base font-bold text-primary">
                    ₹{cartTotal.toFixed(2)}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Coming soon features ── */}
      <div>
        <p className="mb-3 text-sm font-medium tracking-wide text-muted-foreground uppercase">
          More Features
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <ComingSoonCard
            icon={MapPinIcon}
            title="Manage Addresses"
            description="Add and manage delivery addresses"
          />
          <ComingSoonCard
            icon={CreditCardIcon}
            title="Payment Methods"
            description="Save cards for faster checkout"
          />
          <ComingSoonCard
            icon={BellIcon}
            title="Notifications"
            description="Control your notification preferences"
          />
          <ComingSoonCard
            icon={ShieldCheckIcon}
            title="Security Settings"
            description="Change password and 2FA settings"
          />
        </div>
      </div>
    </div>
  )
}
