import { Routes, Route, Navigate } from "react-router-dom"
import { AdminRoutes } from "@/routes/AdminRoutes"
import { UserRoutes } from "@/routes/UserRoutes"
import { AuthRoutes } from "@/routes/AuthRoutes"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { useAuth } from "@/contexts/AuthContext"

function ProtectedRouter() {
  const { user } = useAuth()
  if (user?.role === "superadmin") return <AdminRoutes />
  return <UserRoutes />
}

export function App() {
  const { isAuthenticated } = useAuth()

  return (
    <Routes>
      <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />

      {/* Guest Routes */}
      <Route path="/*" element={<AuthRoutes />} />

      {/* Authenticated Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/*" element={<ProtectedRouter />} />
      </Route>
    </Routes>
  )
}

export default App
