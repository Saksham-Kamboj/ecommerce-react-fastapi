import { Routes, Route, Navigate } from "react-router-dom"
import { AppLayout } from "@/layouts/AppLayout"
import { AdminDashboard } from "@/pages/admin/Dashboard"
import { UsersPage } from "@/pages/admin/Users"
import ProductsPage from "@/pages/admin/Products"
import CategoriesPage from "@/pages/admin/Categories"
import AdminOrdersPage from "@/pages/admin/Orders"
import AdminOrderDetailPage from "@/pages/admin/OrderDetail"
import { AdminProductDetailPage } from "@/pages/admin/ProductDetail"

export function AdminRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<AdminDashboard />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route
          path="/products/:productId"
          element={<AdminProductDetailPage />}
        />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/orders" element={<AdminOrdersPage />} />
        <Route path="/orders/:orderId" element={<AdminOrderDetailPage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  )
}
