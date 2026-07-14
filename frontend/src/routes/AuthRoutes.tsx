import { Routes, Route, Navigate } from "react-router-dom"
import { AuthLayout } from "@/layouts/AuthLayout"
import { Login } from "@/pages/auth/Login"
import { Register } from "@/pages/auth/Register"
import { ForgotPassword } from "@/pages/auth/ForgotPassword"
import { GuestRoute } from "@/components/auth/GuestRoute"

export function AuthRoutes() {
  return (
    <Routes>
      <Route element={<GuestRoute />}>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
