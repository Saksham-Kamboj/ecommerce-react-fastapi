import { lazy, Suspense } from "react"
import { Routes, Route, Navigate } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import PageLoading from "@/components/custom/PageLoading"

// Lazy load route bundles — each chunk is only loaded when needed
const AdminRoutes = lazy(() =>
  import("@/routes/AdminRoutes").then((m) => ({ default: m.AdminRoutes }))
)
const UserRoutes = lazy(() =>
  import("@/routes/UserRoutes").then((m) => ({ default: m.UserRoutes }))
)
const AuthRoutes = lazy(() =>
  import("@/routes/AuthRoutes").then((m) => ({ default: m.AuthRoutes }))
)

function ProtectedRouter() {
  const { user } = useAuth()
  if (user?.role === "superadmin") return <AdminRoutes />
  return <UserRoutes />
}

export function App() {
  const { isAuthenticated, isLoading, user } = useAuth()

  if (isLoading) {
    return <PageLoading />
  }

  const getDefaultPath = () => {
    if (!isAuthenticated) return "/login"
    return user?.role === "superadmin" ? "/dashboard" : "/profile"
  }

  return (
    <Suspense fallback={<PageLoading />}>
      <Routes>
        <Route path="/" element={<Navigate to={getDefaultPath()} replace />} />

        {isAuthenticated ? (
          <Route path="/*" element={<ProtectedRouter />} />
        ) : (
          <Route path="/*" element={<AuthRoutes />} />
        )}
      </Routes>
    </Suspense>
  )
}

export default App
