import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"

interface RoleRouteProps {
  allowedRoles: string[]
}

export function RoleRoute({ allowedRoles }: RoleRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading...
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />
  }

  if (!allowedRoles.includes(user.role)) {
    // Redirect to unauthorized page, or default dashboard
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}
