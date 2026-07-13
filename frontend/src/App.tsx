import { Routes, Route, Navigate } from "react-router-dom"
import { AuthLayout } from "@/layouts/AuthLayout"
import { Login } from "@/pages/auth/Login"
import { Register } from "@/pages/auth/Register"
import { ForgotPassword } from "@/pages/auth/ForgotPassword"
import { GuestRoute } from "@/components/auth/GuestRoute"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { AppLayout } from "@/layouts/AppLayout"
import { AdminDashboard } from "@/pages/admin/Dashboard"
import { UsersPage } from "@/pages/admin/Users"
import { UserDashboard } from "@/pages/user/Dashboard"
import { RoleRoute } from "@/components/auth/RoleRoute"
import { useAuth } from "@/contexts/AuthContext"

function DashboardRouter() {
  const { user } = useAuth()
  if (user?.role === "superadmin") return <AdminDashboard />
  return <UserDashboard />
}

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Routes only accessible to non-logged-in users */}
      <Route element={<GuestRoute />}>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Route>
      </Route>

      {/* Authenticated routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardRouter />} />

          {/* Admin only routes */}
          <Route element={<RoleRoute allowedRoles={["superadmin"]} />}>
            <Route path="/users" element={<UsersPage />} />
          </Route>
        </Route>
      </Route>

      {/* Catch-all route */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default App
