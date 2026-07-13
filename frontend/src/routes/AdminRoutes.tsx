import { Routes, Route, Navigate } from "react-router-dom"
import { RoleRoute } from "@/components/auth/RoleRoute"
import { AppLayout } from "@/layouts/AppLayout"
import { AdminDashboard } from "@/pages/admin/Dashboard"

export function AdminRoutes() {
  return (
    <Routes>
      <Route element={<RoleRoute allowedRoles={["superadmin"]} />}>
        <Route element={<AppLayout />}>
          <Route path="dashboard" element={<AdminDashboard />} />
          {/* Add more admin routes here */}
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="dashboard" replace />} />
    </Routes>
  )
}
