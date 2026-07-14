import { Routes, Route, Navigate } from "react-router-dom"
import { AppLayout } from "@/layouts/AppLayout"
import { UserProfile } from "@/pages/user/Profile"
import { UserProducts } from "@/pages/user/Products"

export function UserRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/products" element={<UserProducts />} />
        <Route path="*" element={<Navigate to="/profile" replace />} />
      </Route>
    </Routes>
  )
}
