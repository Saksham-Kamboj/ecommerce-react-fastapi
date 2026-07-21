import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { usersApi } from "@/lib/api/users"
import type { UserDetailOut } from "@/types/admin"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { User, Phone, MapPin, Calendar, Clock, ShoppingBag } from "lucide-react"
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
        <p className="mb-6 text-muted-foreground">The user you are looking for does not exist.</p>
        <Button onClick={() => navigate("/users")}>Back to Users</Button>
      </div>
    )
  }


  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">User Details</h1>
        <p className="text-sm text-muted-foreground">ID: {user.id}</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Profile Card */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="mb-1 text-sm font-medium text-muted-foreground">Name</div>
              <div className="text-lg font-semibold">{user.full_name || "N/A"}</div>
            </div>
            <div>
              <div className="mb-1 text-sm font-medium text-muted-foreground">Email</div>
              <div>{user.email}</div>
            </div>
            <div>
              <div className="mb-1 text-sm font-medium text-muted-foreground">Status</div>
              <Badge variant={user.is_active ? "default" : "secondary"}>
                {user.is_active ? "Active" : "Inactive"}
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              Joined {format(new Date(user.created_at), "MMM d, yyyy")}
            </div>
          </CardContent>
        </Card>

        {/* Contact & Address Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Contact & Address
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="space-y-4">
              <div>
                <div className="mb-1 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Phone className="h-4 w-4" /> Phone
                </div>
                <div>{user.phone || "Not provided"}</div>
              </div>
              <div>
                <div className="mb-1 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Calendar className="h-4 w-4" /> Date of Birth
                </div>
                <div>{user.date_of_birth ? format(new Date(user.date_of_birth), "MMM d, yyyy") : "Not provided"}</div>
              </div>
              <div>
                <div className="mb-1 text-sm font-medium text-muted-foreground">Bio</div>
                <div className="text-sm">{user.bio || "No bio available."}</div>
              </div>
            </div>

            <div>
              <div className="mb-1 text-sm font-medium text-muted-foreground">Shipping Address</div>
              {user.address_line1 || user.city || user.country ? (
                <address className="not-italic text-sm leading-relaxed">
                  {user.address_line1 && <div>{user.address_line1}</div>}
                  {user.address_line2 && <div>{user.address_line2}</div>}
                  <div>
                    {user.city} {user.state ? `, ${user.state}` : ""} {user.postal_code}
                  </div>
                  {user.country && <div>{user.country}</div>}
                </address>
              ) : (
                <div className="text-sm text-muted-foreground">No address provided</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-primary" />
            Recent Orders
          </CardTitle>
          <CardDescription>
            The most recent orders placed by this user.
          </CardDescription>
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
                      <TableCell className="font-mono text-xs">{order.id.split("-")[0]}</TableCell>
                      <TableCell>{format(new Date(order.created_at), "MMM d, yyyy")}</TableCell>
                      <TableCell>{order.items_count}</TableCell>
                      <TableCell>₹{order.total_amount.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={
                          order.payment_status === "captured" ? "border-green-200 bg-green-100 text-green-700" :
                            order.payment_status === "failed" ? "border-red-200 bg-red-100 text-red-700" :
                              order.payment_status === "refunded" ? "border-orange-200 bg-orange-100 text-orange-700" :
                                "border-amber-200 bg-amber-100 text-amber-700"
                        }>
                          {order.payment_status === "captured"
                            ? "Paid"
                            : order.payment_status
                              ? order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)
                              : "Pending"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={
                          order.status === "delivered" ? "border-green-200 bg-green-100 text-green-700" :
                            order.status === "cancelled" ? "border-red-200 bg-red-100 text-red-700" :
                              order.status === "shipped" ? "border-blue-200 bg-blue-100 text-blue-700" :
                                "border-amber-200 bg-amber-100 text-amber-700"
                        }>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => navigate(`/orders/${order.id}`)}>
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
