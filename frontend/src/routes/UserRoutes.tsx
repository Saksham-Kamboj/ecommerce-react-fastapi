import { lazy, Suspense } from "react"
import { Routes, Route, Navigate } from "react-router-dom"
import { AppLayout } from "@/layouts/AppLayout"
import PageLoading from "@/components/custom/PageLoading"

// Lazy load all user pages
const UserProfile = lazy(() =>
  import("@/pages/user/Profile").then((m) => ({ default: m.UserProfile }))
)
const UserProducts = lazy(() =>
  import("@/pages/user/Products").then((m) => ({ default: m.UserProducts }))
)
const ProductDetailPage = lazy(() =>
  import("@/pages/user/ProductDetail").then((m) => ({
    default: m.ProductDetailPage,
  }))
)
const UserWishlist = lazy(() =>
  import("@/pages/user/Wishlist").then((m) => ({ default: m.UserWishlist }))
)
const UserCart = lazy(() =>
  import("@/pages/user/Cart").then((m) => ({ default: m.UserCart }))
)
const CheckoutPage = lazy(() =>
  import("@/pages/user/Checkout").then((m) => ({ default: m.CheckoutPage }))
)
const UserOrders = lazy(() =>
  import("@/pages/user/Orders").then((m) => ({ default: m.UserOrders }))
)
const OrderDetailPage = lazy(() =>
  import("@/pages/user/OrderDetail").then((m) => ({
    default: m.OrderDetailPage,
  }))
)

export function UserRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route
          path="/profile"
          element={
            <Suspense fallback={<PageLoading />}>
              <UserProfile />
            </Suspense>
          }
        />
        <Route
          path="/products"
          element={
            <Suspense fallback={<PageLoading />}>
              <UserProducts />
            </Suspense>
          }
        />
        <Route
          path="/products/:productId"
          element={
            <Suspense fallback={<PageLoading />}>
              <ProductDetailPage />
            </Suspense>
          }
        />
        <Route
          path="/wishlist"
          element={
            <Suspense fallback={<PageLoading />}>
              <UserWishlist />
            </Suspense>
          }
        />
        <Route
          path="/cart"
          element={
            <Suspense fallback={<PageLoading />}>
              <UserCart />
            </Suspense>
          }
        />
        <Route
          path="/checkout"
          element={
            <Suspense fallback={<PageLoading />}>
              <CheckoutPage />
            </Suspense>
          }
        />
        <Route
          path="/orders"
          element={
            <Suspense fallback={<PageLoading />}>
              <UserOrders />
            </Suspense>
          }
        />
        <Route
          path="/orders/:orderId"
          element={
            <Suspense fallback={<PageLoading />}>
              <OrderDetailPage />
            </Suspense>
          }
        />
        <Route path="*" element={<Navigate to="/profile" replace />} />
      </Route>
    </Routes>
  )
}
