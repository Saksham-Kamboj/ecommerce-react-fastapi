import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"

export function UserDashboard() {
  const { logout, user } = useAuth()
  return (
    <div className="p-8">
      <h1 className="mb-4 text-3xl font-bold text-primary">User Dashboard</h1>
      <p className="mb-8">
        Welcome back, {user?.full_name || user?.email}! Here is an overview of
        your activity.
      </p>

      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="mb-2 text-xl font-semibold">My Orders</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            View your recent purchases and track shipping.
          </p>
          <Button variant="outline">View Orders</Button>
        </div>
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="mb-2 text-xl font-semibold">My Profile</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Update your personal information and addresses.
          </p>
          <Button variant="outline">Edit Profile</Button>
        </div>
      </div>

      <Button onClick={logout} variant="secondary">
        Logout
      </Button>
    </div>
  )
}
