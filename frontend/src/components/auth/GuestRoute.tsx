import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"

export function GuestRoute() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading...
      </div>
    )
  }

  if (isAuthenticated) {
    // If the user is already logged in, redirect them to the dashboard or home
    return <Navigate to="/dashboard" replace />
  }

  // If not logged in, allow them to see the auth routes
  return <Outlet />
}
