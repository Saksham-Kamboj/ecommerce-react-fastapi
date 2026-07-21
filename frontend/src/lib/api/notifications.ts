import { apiClient } from "./client"

import type { Notification } from "@/types/notification"

export const notificationsApi = {
  getUnread: () => apiClient<Notification[]>("/admin/notifications"),

  markAsRead: (id: string) =>
    apiClient<Notification>(`/admin/notifications/${id}/read`, {
      method: "PATCH",
    }),

  markAllAsRead: () =>
    apiClient<{ success: boolean }>("/admin/notifications/read-all", {
      method: "PATCH",
    }),
}
