import { Route, Routes } from "react-router-dom"
import { RoleRoute } from "@/components/auth/RoleRoute"
import { UserDashboard } from "@/pages/user/Dashboard"

export function UserRoutes() {
  return (
    <Routes>
      <Route element={<RoleRoute allowedRoles={["user"]} />}>
        <Route path="/dashboard" element={<UserDashboard />} />
        {/* Add more user specific routes here */}
      </Route>
    </Routes>
  )
}
