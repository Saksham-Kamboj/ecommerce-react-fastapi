import { Route, Routes } from "react-router-dom"
import { RoleRoute } from "@/components/auth/RoleRoute"
import { AdminDashboard } from "@/pages/admin/Dashboard"

export function AdminRoutes() {
  return (
    <Routes>
      <Route element={<RoleRoute allowedRoles={["superadmin"]} />}>
        <Route path="/dashboard" element={<AdminDashboard />} />
        {/* Add more admin specific routes here */}
      </Route>
    </Routes>
  )
}
