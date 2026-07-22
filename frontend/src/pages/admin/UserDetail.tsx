import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { usersApi } from "@/lib/api/users"
import type { UserDetailOut } from "@/types/admin"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  User,
  Phone,
  MapPin,
  Calendar,
  Clock,
  ShoppingBag,
  Mail,
  Building2,
  Hash,
  Globe,
} from "lucide-react"
import { format } from "date-fns"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import PageLoading from "@/components/custom/PageLoading"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function UserDetailPage() {
  const { userId } = useParams<{ userId: string }>()
  const navigate = useNavigate()
  const [user, setUser] = useState<UserDetailOut | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadUser() {
      if (!userId) return
      try {
        const response = await usersApi.getUserDetails(userId)
        setUser(response.data)
      } catch (error) {
        console.error("Failed to load user details", error)
      } finally {
        setLoading(false)
      }
    }
    loadUser()
  }, [userId])

  if (loading) return <PageLoading />

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <h2 className="mb-2 text-2xl font-bold">User Not Found</h2>
        <p className="mb-6 text-muted-foreground">
          The user you are looking for does not exist.
        </p>
        <Button onClick={() => navigate("/users")}>Back to Users</Button>
      </div>
    )
  }

  const getInitials = (name?: string | null, email?: string | null) => {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase()
    }
    if (email) {
      return email.substring(0, 2).toUpperCase()
    }
    return "??"
  }

  return (
    <div className="space-y-3">
      {/* Header / Hero Section */}
      <div className="relative overflow-hidden rounded-xl border bg-card shadow-sm">
        {/* Gradient Banner */}
        <div className="h-20 w-full bg-gradient-to-r from-primary/10 via-primary/5 to-transparent dark:from-primary/20 dark:via-primary/10" />

        <div className="relative px-6 pt-2 pb-4">
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-end">
            {/* Avatar */}
            <Avatar className="-mt-12 h-20 w-20 rounded-xl border-4 border-card shadow-md ring-1 ring-border sm:-mt-14 sm:h-24 sm:w-24">
              <AvatarImage
                src={`https://api.dicebear.com/7.x/notionists/svg?seed=${user.email}`}
              />
              <AvatarFallback className="bg-primary/5 text-xl font-bold text-primary">
                {getInitials(user.full_name, user.email)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-1 sm:pb-1">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                {user.full_name || "Unknown User"}
              </h1>
              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Mail className="h-4 w-4" />
                  {user.email}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  Joined {format(new Date(user.created_at), "MMM d, yyyy")}
                </span>
                <span className="flex items-center gap-1.5 font-mono text-xs">
                  ID: {user.id}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 sm:pb-4">
              <Badge
                variant={user.is_active ? "default" : "secondary"}
                className="px-3 py-1 text-sm shadow-sm"
              >
                {user.is_active ? "Active" : "Inactive"}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        {/* Contact Info Card */}
        <Card className="overflow-hidden p-0 transition-all hover:shadow-sm">
          <CardHeader className="border-b bg-muted/30 p-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="h-5 w-5 text-primary" />
              Contact Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Phone className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    Phone Number
                  </p>
                  <p className="mt-0.5 text-sm font-medium text-foreground">
                    {user.phone || "Not provided"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Calendar className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    Date of Birth
                  </p>
                  <p className="mt-0.5 text-sm font-medium text-foreground">
                    {user.date_of_birth
                      ? format(new Date(user.date_of_birth), "MMM d, yyyy")
                      : "Not provided"}
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-2 rounded-lg border border-dashed bg-muted/20 p-3">
              <p className="mb-1 text-xs font-medium text-muted-foreground">
                Bio
              </p>
              <p className="text-sm text-foreground">
                {user.bio || "No bio available for this user."}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Default Address Card */}
        <Card className="overflow-hidden p-0 transition-all hover:shadow-sm">
          <CardHeader className="border-b bg-muted/30 p-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <MapPin className="h-4 w-4 text-primary" />
              Default Address
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {user.default_address ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <MapPin className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">
                        Street Address
                      </p>
                      <p className="mt-0.5 text-sm font-medium text-foreground">
                        {user.default_address.address_line1}
                        {user.default_address.address_line2 && (
                          <>
                            <br />
                            {user.default_address.address_line2}
                          </>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Building2 className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">
                        City & State
                      </p>
                      <p className="mt-0.5 text-sm font-medium text-foreground">
                        {user.default_address.city}
                        {user.default_address.state
                          ? `, ${user.default_address.state}`
                          : ""}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Hash className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">
                        Postal Code
                      </p>
                      <p className="mt-0.5 text-sm font-medium text-foreground">
                        {user.default_address.postal_code || "—"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Globe className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">
                        Country
                      </p>
                      <p className="mt-0.5 text-sm font-medium text-foreground">
                        {user.default_address.country || "—"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                  <MapPin className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold">No Address Provided</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  This user hasn't added any addresses yet.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* All Orders */}
      <Card>
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-primary" />
            User Orders
          </CardTitle>
          <CardDescription>All orders placed by this user.</CardDescription>
        </CardHeader>
        <CardContent>
          {!user.recent_orders || user.recent_orders.length === 0 ? (
            <div className="py-6 text-center text-muted-foreground">
              This user hasn't placed any orders yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {user.recent_orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono text-xs">
                        {order.id.split("-")[0]}
                      </TableCell>
                      <TableCell>
                        {format(new Date(order.created_at), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell>{order.items_count}</TableCell>
                      <TableCell>
                        ₹
                        {order.total_amount.toLocaleString("en-IN", {
                          maximumFractionDigits: 0,
                        })}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            order.payment_status === "captured"
                              ? "border-green-200 bg-green-100 text-green-700"
                              : order.payment_status === "failed"
                                ? "border-red-200 bg-red-100 text-red-700"
                                : order.payment_status === "refunded"
                                  ? "border-orange-200 bg-orange-100 text-orange-700"
                                  : "border-amber-200 bg-amber-100 text-amber-700"
                          }
                        >
                          {order.payment_status === "captured"
                            ? "Paid"
                            : order.payment_status
                              ? order.payment_status.charAt(0).toUpperCase() +
                                order.payment_status.slice(1)
                              : "Pending"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            order.status === "delivered"
                              ? "border-green-200 bg-green-100 text-green-700"
                              : order.status === "cancelled"
                                ? "border-red-200 bg-red-100 text-red-700"
                                : order.status === "shipped"
                                  ? "border-blue-200 bg-blue-100 text-blue-700"
                                  : "border-amber-200 bg-amber-100 text-amber-700"
                          }
                        >
                          {order.status.charAt(0).toUpperCase() +
                            order.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/orders/${order.id}`)}
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
