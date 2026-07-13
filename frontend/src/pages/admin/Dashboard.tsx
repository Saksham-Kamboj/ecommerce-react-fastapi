import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"

export function AdminDashboard() {
  const { user } = useAuth()
  
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="mb-2 text-3xl font-bold text-primary">
          Admin Dashboard
        </h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.full_name || user?.email}! You have full administrative access.
        </p>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
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

        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="mb-2 text-xl font-semibold">Sales Reports</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Analyze store revenue and statistics.
          </p>
          <Button variant="outline">View Reports</Button>
        </div>
      </div>
    </div>
  )
}
