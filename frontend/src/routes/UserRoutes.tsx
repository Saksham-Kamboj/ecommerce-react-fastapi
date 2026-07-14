import { Routes, Route, Navigate } from "react-router-dom"
import { AppLayout } from "@/layouts/AppLayout"
import { UserDashboard } from "@/pages/user/Dashboard"

export function UserRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<UserDashboard />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  )
}
