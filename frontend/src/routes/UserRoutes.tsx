import { Routes, Route, Navigate } from "react-router-dom"
import { AppLayout } from "@/layouts/AppLayout"
import { UserProfile } from "@/pages/user/Profile"
import { UserProducts } from "@/pages/user/Products"
import { UserWishlist } from "@/pages/user/Wishlist"
import { UserCart } from "@/pages/user/Cart"
import { CheckoutPage } from "@/pages/user/Checkout"
import { UserOrders } from "@/pages/user/Orders"
import { OrderDetailPage } from "@/pages/user/OrderDetail"

export function UserRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/products" element={<UserProducts />} />
        <Route path="/wishlist" element={<UserWishlist />} />
        <Route path="/cart" element={<UserCart />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/orders" element={<UserOrders />} />
        <Route path="/orders/:orderId" element={<OrderDetailPage />} />
        <Route path="*" element={<Navigate to="/profile" replace />} />
      </Route>
    </Routes>
  )
}
