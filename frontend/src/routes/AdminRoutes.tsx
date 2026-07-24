import { lazy, Suspense } from "react"
import { Routes, Route, Navigate } from "react-router-dom"
import { AppLayout } from "@/layouts/AppLayout"
import PageLoading from "@/components/custom/PageLoading"

// Lazy load all admin pages
const AdminDashboard = lazy(() =>
  import("@/pages/admin/Dashboard").then((m) => ({ default: m.AdminDashboard }))
)
const UsersPage = lazy(() =>
  import("@/pages/admin/Users").then((m) => ({ default: m.UsersPage }))
)
const UserDetailPage = lazy(() =>
  import("@/pages/admin/UserDetail").then((m) => ({
    default: m.UserDetailPage,
  }))
)
const ProductsPage = lazy(() => import("@/pages/admin/Products"))
const CategoriesPage = lazy(() => import("@/pages/admin/Categories"))
const AdminOrdersPage = lazy(() => import("@/pages/admin/Orders"))
const AdminOrderDetailPage = lazy(() => import("@/pages/admin/OrderDetail"))
const AdminProductDetailPage = lazy(() =>
  import("@/pages/admin/ProductDetail").then((m) => ({
    default: m.AdminProductDetailPage,
  }))
)
const AdminCouponsPage = lazy(() =>
  import("@/pages/admin/Coupons").then((m) => ({
    default: m.AdminCouponsPage,
  }))
)

export function AdminRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route
          path="/dashboard"
          element={
            <Suspense fallback={<PageLoading />}>
              <AdminDashboard />
            </Suspense>
          }
        />
        <Route
          path="/users"
          element={
            <Suspense fallback={<PageLoading />}>
              <UsersPage />
            </Suspense>
          }
        />
        <Route
          path="/users/:userId"
          element={
            <Suspense fallback={<PageLoading />}>
              <UserDetailPage />
            </Suspense>
          }
        />
        <Route
          path="/products"
          element={
            <Suspense fallback={<PageLoading />}>
              <ProductsPage />
            </Suspense>
          }
        />
        <Route
          path="/products/:productId"
          element={
            <Suspense fallback={<PageLoading />}>
              <AdminProductDetailPage />
            </Suspense>
          }
        />
        <Route
          path="/categories"
          element={
            <Suspense fallback={<PageLoading />}>
              <CategoriesPage />
            </Suspense>
          }
        />
        <Route
          path="/orders"
          element={
            <Suspense fallback={<PageLoading />}>
              <AdminOrdersPage />
            </Suspense>
          }
        />
        <Route
          path="/orders/:orderId"
          element={
            <Suspense fallback={<PageLoading />}>
              <AdminOrderDetailPage />
            </Suspense>
          }
        />
        <Route
          path="/coupons"
          element={
            <Suspense fallback={<PageLoading />}>
              <AdminCouponsPage />
            </Suspense>
          }
        />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  )
}
