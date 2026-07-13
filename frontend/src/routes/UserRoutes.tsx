import { Routes, Route, Navigate } from "react-router-dom"
import { RoleRoute } from "@/components/auth/RoleRoute"
import { AppLayout } from "@/layouts/AppLayout"
import { UserDashboard } from "@/pages/user/Dashboard"

export function UserRoutes() {
  return (
    <Routes>
      <Route element={<RoleRoute allowedRoles={["user"]} />}>
        <Route element={<AppLayout />}>
          <Route path="dashboard" element={<UserDashboard />} />
          {/* Add more user routes here */}
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="dashboard" replace />} />
    </Routes>
  )
}
