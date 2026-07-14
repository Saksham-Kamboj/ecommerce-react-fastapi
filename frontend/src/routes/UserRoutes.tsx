import { Routes, Route, Navigate } from "react-router-dom"
import { AppLayout } from "@/layouts/AppLayout"
import { UserDashboard } from "@/pages/user/Dashboard"
import { UserProducts } from "@/pages/user/Products"

export function UserRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<UserDashboard />} />
        <Route path="/products" element={<UserProducts />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  )
}
