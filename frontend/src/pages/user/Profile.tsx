import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { useAuth } from "@/contexts/AuthContext"
import { profileApi } from "@/lib/api/profile"
import { ordersApi } from "@/lib/api/orders"
import type { UserUpdateSelf, ChangePasswordRequest } from "@/types/auth"
import { AddressManager } from "@/components/user/AddressManager"

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
  UserIcon,
  ShieldCheckIcon,
  LayoutGridIcon,
  WalletIcon,
  TicketIcon,
  ClockIcon,
  CheckCircle2Icon,
} from "lucide-react"
import { ErrorMessage } from "@/components/ui/error-message"

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

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  })
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

// ── Overview Bento Grid ────────────────────────────────────────────────────────
function OverviewBento({
  user,
  totalOrders,
  loginTime,
}: Readonly<{
  user: NonNullable<ReturnType<typeof useAuth>["user"]>
  totalOrders: number | null
  loginTime: string | null
}>) {
  let profileCompletion = 50

  if (user.full_name && user.phone && user.date_of_birth) {
    profileCompletion = 100
  } else if (user.full_name && user.phone) {
    profileCompletion = 75
  }

  return (
    <div className="grid gap-4 md:grid-cols-4">
      {/* Welcome Card (Hero) */}
      <Card className="overflow-hidden rounded-lg border-primary/10 bg-primary/5 p-0 shadow-sm backdrop-blur-md md:col-span-3">
        <CardContent className="p-5">
          <div className="flex flex-col items-center gap-5 md:flex-row">
            <Avatar className="h-24 w-24 border-4 border-background shadow-sm">
              <AvatarFallback className="bg-primary text-3xl text-primary-foreground">
                {getInitials(user.full_name || user.email)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2 text-center md:text-left">
              <h2 className="text-3xl font-bold tracking-tight">
                Hello, {user.full_name?.split(" ")[0] || "User"} 👋
              </h2>
              <p className="text-muted-foreground">{user.email}</p>
              <div className="mt-2 flex items-center justify-center gap-2 md:justify-start">
                <Badge
                  variant={user.role === "superadmin" ? "default" : "secondary"}
                >
                  {user.role === "superadmin" ? "Admin" : "Customer"}
                </Badge>
                {user.is_active && (
                  <Badge
                    variant="outline"
                    className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  >
                    Active
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Completion */}
      <Card className="rounded-lg p-0 shadow-sm">
        <CardContent className="flex h-full flex-col justify-center gap-3 p-5">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Profile
              </p>
              <p className="text-2xl font-bold">{profileCompletion}%</p>
            </div>
            <UserIcon className="h-8 w-8 text-primary/30" />
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${profileCompletion}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Stats Bento */}
      <Card className="rounded-lg p-0 shadow-sm transition-shadow hover:shadow-md">
        <CardContent className="flex h-full flex-col justify-between gap-2 p-5">
          <div className="w-fit rounded-full bg-primary/10 p-2.5">
            <PackageIcon className="h-5 w-5 text-primary" />
          </div>
          <div className="mt-1">
            <p className="text-sm font-medium text-muted-foreground">
              Total Orders
            </p>
            <p className="text-2xl font-bold">{totalOrders ?? "—"}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-lg p-0 shadow-sm transition-shadow hover:shadow-md">
        <CardContent className="flex h-full flex-col justify-between gap-2 p-5">
          <div className="w-fit rounded-full bg-primary/10 p-2.5">
            <WalletIcon className="h-5 w-5 text-primary" />
          </div>
          <div className="mt-1">
            <p className="text-sm font-medium text-muted-foreground">
              Wallet Balance
            </p>
            <p className="text-2xl font-bold">₹0.00</p>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-lg p-0 shadow-sm transition-shadow hover:shadow-md">
        <CardContent className="flex h-full flex-col justify-between gap-2 p-5">
          <div className="w-fit rounded-full bg-primary/10 p-2.5">
            <TicketIcon className="h-5 w-5 text-primary" />
          </div>
          <div className="mt-1">
            <p className="text-sm font-medium text-muted-foreground">
              Active Coupons
            </p>
            <p className="text-2xl font-bold">0</p>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity Timeline */}
      <Card className="rounded-lg shadow-sm transition-shadow hover:shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <ClockIcon className="h-5 w-5 text-primary" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="px-5">
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="mt-1 rounded-full bg-primary/10 p-1.5">
                <CheckCircle2Icon className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold">Logged in successfully</p>
                <p className="text-xs text-muted-foreground">
                  {loginTime ? formatDateTime(loginTime) : "Just now"}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="mt-1 rounded-full bg-primary/10 p-1.5">
                <UserIcon className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold">Profile Created</p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(user.created_at)}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ── Main Component ─────────────────────────────────────────────────────────────
export function UserProfile() {
  const { user, updateUser, isAuthError, loginTime } = useAuth()
  const [totalOrders, setTotalOrders] = useState<number | null>(null)

  useEffect(() => {
    ordersApi
      .getMyOrders(0, 1)
      .then((res) => setTotalOrders(res.pagination?.totalItems ?? 0))
      .catch(() => setTotalOrders(0))
  }, [])

  if (!user) return null

  return (
    <div className="flex w-full flex-col gap-4 pb-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          My Account
        </h1>
        <p className="mt-1 text-muted-foreground">
          Manage your profile, addresses, and security settings.
        </p>
      </div>

      {isAuthError ? (
        <ErrorMessage message={isAuthError} />
      ) : (
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="h-auto w-full flex-wrap justify-start gap-1 shadow-sm">
            <TabsTrigger
              value="overview"
              className="flex items-center gap-1.5 rounded-lg px-4 py-2.5 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
            >
              <LayoutGridIcon className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="account"
              className="flex items-center gap-1.5 rounded-lg px-4 py-2.5 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
            >
              <UserIcon className="h-4 w-4" />
              Account
            </TabsTrigger>
            <TabsTrigger
              value="address"
              className="flex items-center gap-1.5 rounded-lg px-4 py-2.5 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
            >
              <MapPinIcon className="h-4 w-4" />
              Addresses
            </TabsTrigger>
            <TabsTrigger
              value="security"
              className="flex items-center gap-1.5 rounded-lg px-4 py-2.5 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
            >
              <KeyRoundIcon className="h-4 w-4" />
              Security
            </TabsTrigger>
            <TabsTrigger
              value="payment"
              className="flex items-center gap-1.5 rounded-lg px-4 py-2.5 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
            >
              <CreditCardIcon className="h-4 w-4" />
              Payment
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="focus-visible:outline-none">
            <OverviewBento
              user={user}
              totalOrders={totalOrders}
              loginTime={loginTime}
            />
          </TabsContent>

          <TabsContent value="account" className="focus-visible:outline-none">
            <div className="grid gap-4 lg:grid-cols-2">
              <AccountViewCard user={user} />
              <AccountEditCard user={user} updateUser={updateUser} />
            </div>
          </TabsContent>

          <TabsContent value="address" className="focus-visible:outline-none">
            <div className="rounded-lg bg-white/50 p-1 shadow-sm backdrop-blur-sm dark:bg-black/20">
              <AddressManager />
            </div>
          </TabsContent>

          <TabsContent value="security" className="focus-visible:outline-none">
            <ChangePasswordCard />
          </TabsContent>

          <TabsContent value="payment" className="focus-visible:outline-none">
            <Card className="rounded-lg shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <CreditCardIcon className="h-5 w-5 text-primary" />
                  Payment Settings
                </CardTitle>
                <CardDescription>
                  Manage your payment methods and billing preferences securely
                  via Razorpay.
                </CardDescription>
              </CardHeader>
              <CardContent className="px-6 pb-6">
                <div className="flex flex-col gap-5 pt-2">
                  <div className="flex flex-col gap-4 rounded-lg border border-primary/20 bg-primary/5 p-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10">
                        <ShieldCheckIcon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-bold">Razorpay Secure</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          Your transactions are secured with 256-bit encryption.
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className="w-fit border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    >
                      Active
                    </Badge>
                  </div>

                  <div className="mt-4 space-y-3">
                    <h4 className="text-sm font-semibold">
                      Saved Payment Methods
                    </h4>
                    <div className="flex min-h-40 flex-col items-center justify-center gap-3 rounded-lg border border-dashed bg-muted/20 text-center">
                      <CreditCardIcon className="h-8 w-8 text-muted-foreground/40" />
                      <p className="text-sm font-semibold">
                        No cards saved yet
                      </p>
                      <p className="max-w-xs text-xs text-muted-foreground">
                        You can save a new card or UPI handle during your next
                        checkout for faster payments.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}

// ── Account View ───────────────────────────────────────────────────────────────
function AccountViewCard({
  user,
}: Readonly<{ user: NonNullable<ReturnType<typeof useAuth>["user"]> }>) {
  return (
    <Card className="rounded-lg shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <UserIcon className="h-5 w-5 text-primary" /> Account Details
        </CardTitle>
        <CardDescription>Your current profile information.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-1 px-6 pb-6">
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
    try {
      const res = await profileApi.updateMe(data)
      updateUser(res.data)
      toast.success(res.message)
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update profile."
      )
    } finally {
      setIsSaving(false)
    }
  }
  return (
    <Card className="rounded-lg shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-base">Edit Account</CardTitle>
        <CardDescription>Update your personal information.</CardDescription>
      </CardHeader>
      <CardContent className="px-6 pb-6">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          <div className="grid gap-2">
            <Label htmlFor="full_name">Full Name</Label>
            <Input
              id="full_name"
              placeholder="John Doe"
              className="rounded-lg"
              {...register("full_name")}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              placeholder="+91 98765 43210"
              className="rounded-lg"
              {...register("phone")}
            />
          </div>
          <div className="grid gap-2">
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
              className="rounded-lg"
              {...register("date_of_birth")}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              placeholder="Tell us a bit about yourself..."
              rows={3}
              className="resize-none rounded-lg"
              {...register("bio")}
            />
          </div>
          <Button
            type="submit"
            disabled={isSaving || !isDirty}
            className="mt-2 w-full rounded-lg sm:w-auto"
          >
            {isSaving && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

// ── Change Password ────────────────────────────────────────────────────────────
function ChangePasswordCard() {
  const [isSaving, setIsSaving] = useState(false)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordRequest>()
  const onSubmit = async (data: ChangePasswordRequest) => {
    setIsSaving(true)
    try {
      const res = await profileApi.changePassword(data)
      toast.success(res.message)
      reset()
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to change password."
      )
    } finally {
      setIsSaving(false)
    }
  }
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="rounded-lg shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-base">
            <KeyRoundIcon className="h-5 w-5 text-primary" />
            Change Password
          </CardTitle>
          <CardDescription>
            Enter your current password and choose a new one.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-5"
          >
            <div className="grid gap-2">
              <Label htmlFor="current_password">Current Password</Label>
              <Input
                id="current_password"
                type="password"
                placeholder="••••••••"
                className="rounded-lg"
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
            <div className="grid gap-2">
              <Label htmlFor="new_password">New Password</Label>
              <Input
                id="new_password"
                type="password"
                placeholder="••••••••"
                className="rounded-lg"
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
            <Button
              type="submit"
              disabled={isSaving}
              className="mt-2 w-full rounded-lg sm:w-auto"
            >
              {isSaving && (
                <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
              )}
              Update Password
            </Button>
          </form>
        </CardContent>
      </Card>
      <Card className="rounded-lg border-dashed opacity-70 shadow-none">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Two-Factor Authentication</CardTitle>
          <CardDescription>
            Add an extra layer of security to your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex min-h-50 flex-col items-center justify-center gap-3 text-center">
          <div className="rounded-full bg-muted p-4">
            <KeyRoundIcon className="h-8 w-8 text-muted-foreground/50" />
          </div>
          <p className="text-sm font-semibold">Coming Soon</p>
          <p className="max-w-xs text-xs text-muted-foreground">
            2FA via authenticator app or SMS will be available soon.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
