import { lazy, Suspense } from "react"
import { Routes, Route, Navigate } from "react-router-dom"
import { AuthLayout } from "@/layouts/AuthLayout"
import PageLoading from "@/components/custom/PageLoading"

// Lazy load all auth pages
const Login = lazy(() =>
  import("@/pages/auth/Login").then((m) => ({ default: m.Login }))
)
const Register = lazy(() =>
  import("@/pages/auth/Register").then((m) => ({ default: m.Register }))
)
const ForgotPassword = lazy(() =>
  import("@/pages/auth/ForgotPassword").then((m) => ({
    default: m.ForgotPassword,
  }))
)

export function AuthRoutes() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route
          path="/login"
          element={
            <Suspense fallback={<PageLoading />}>
              <Login />
            </Suspense>
          }
        />
        <Route
          path="/register"
          element={
            <Suspense fallback={<PageLoading />}>
              <Register />
            </Suspense>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <Suspense fallback={<PageLoading />}>
              <ForgotPassword />
            </Suspense>
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
