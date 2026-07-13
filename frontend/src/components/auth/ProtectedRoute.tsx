import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"

export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading...
      </div>
    )
  }

  if (!isAuthenticated) {
    // If the user is not logged in, redirect them to the login page
    return <Navigate to="/login" replace />
  }

  // If logged in, allow them to see the protected routes
  return <Outlet />
}
