import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"

export function AdminDashboard() {
  const { logout, user } = useAuth()
  return (
    <div className="p-8">
      <h1 className="mb-4 text-3xl font-bold text-primary">
        Superadmin Dashboard
      </h1>
      <p className="mb-8">
        Welcome back, {user?.full_name || user?.email}! You have full
        administrative access.
      </p>

      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="mb-2 text-xl font-semibold">Manage Users</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            View, edit, and delete users across the platform.
          </p>
          <Button variant="outline">Go to Users</Button>
        </div>
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="mb-2 text-xl font-semibold">System Settings</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Configure global settings and policies.
          </p>
          <Button variant="outline">Go to Settings</Button>
        </div>
      </div>

      <Button onClick={logout} variant="destructive">
        Logout
      </Button>
    </div>
  )
}
