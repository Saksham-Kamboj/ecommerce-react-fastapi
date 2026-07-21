import { apiClient } from "./client"
import type { ApiResponse } from "@/types/api"
import type { AdminStatsOut } from "@/types/admin"

export const adminApi = {
  async getStats(): Promise<ApiResponse<AdminStatsOut>> {
    return apiClient<AdminStatsOut>("/admin/stats")
  },
}
