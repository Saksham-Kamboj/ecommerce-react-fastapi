import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import PageLoading from "../custom/PageLoading"

export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return <PageLoading />
  }

  if (!isAuthenticated) {
    // If the user is not logged in, redirect them to the login page
    return <Navigate to="/login" replace />
  }

  // If logged in, allow them to see the protected routes
  return <Outlet />
}
