import { Routes, Route, Navigate } from "react-router-dom"
import { AuthLayout } from "@/layouts/AuthLayout"
import { Login } from "@/pages/Login"
import { Register } from "@/pages/Register"
import { ForgotPassword } from "@/pages/ForgotPassword"
import { GuestRoute } from "@/components/auth/GuestRoute"
import { AdminRoutes } from "@/routes/AdminRoutes"
import { UserRoutes } from "@/routes/UserRoutes"
import { useAuth } from "@/contexts/AuthContext"

function RootRedirect() {
  const { isAuthenticated, isLoading, user } = useAuth()

  if (isLoading)
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading...
      </div>
    )

  if (!isAuthenticated || !user) return <Navigate to="/login" replace />

  if (user.role === "superadmin") {
    return <Navigate to="/admin/dashboard" replace />
  }

  return <Navigate to="/user/dashboard" replace />
}

export function App() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/dashboard" element={<RootRedirect />} />

      {/* Routes only accessible to non-logged-in users */}
      <Route element={<GuestRoute />}>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Route>
      </Route>

      {/* Role-specific route modules */}
      <Route path="/admin/*" element={<AdminRoutes />} />
      <Route path="/user/*" element={<UserRoutes />} />
    </Routes>
  )
}

export default App
