import { Routes, Route, Navigate } from "react-router-dom"
import { AppLayout } from "@/layouts/AppLayout"
import { AdminDashboard } from "@/pages/admin/Dashboard"
import { UsersPage } from "@/pages/admin/Users"
import ProductsPage from "@/pages/admin/Products"

import CategoriesPage from "@/pages/admin/Categories"

export function AdminRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<AdminDashboard />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  )
}
