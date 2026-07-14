import { Routes, Route, Navigate } from "react-router-dom"
import { AdminRoutes } from "@/routes/AdminRoutes"
import { UserRoutes } from "@/routes/UserRoutes"
import { AuthRoutes } from "@/routes/AuthRoutes"
import { useAuth } from "@/contexts/AuthContext"
import PageLoading from "@/components/custom/PageLoading"

function ProtectedRouter() {
  const { user } = useAuth()
  if (user?.role === "superadmin") return <AdminRoutes />
  return <UserRoutes />
}

export function App() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return <PageLoading />
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />

      {isAuthenticated ? (
        <Route path="/*" element={<ProtectedRouter />} />
      ) : (
        <Route path="/*" element={<AuthRoutes />} />
      )}
    </Routes>
  )
}

export default App
