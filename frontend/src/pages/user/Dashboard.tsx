import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"

export function UserDashboard() {
  const { user } = useAuth()

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="mb-2 text-3xl font-bold text-primary">User Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.full_name || user?.email}! Here is an overview of
          your activity.
        </p>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
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
    </div>
  )
}
