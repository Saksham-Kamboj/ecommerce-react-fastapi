import { useEffect, useState } from "react"
import { Bell, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { notificationsApi } from "@/lib/api/notifications"
import type { Notification } from "@/types/notification"

export function AdminNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    let isMounted = true
    
    const fetchNotifications = async () => {
      try {
        const response = await notificationsApi.getUnread()
        if (isMounted) {
          setNotifications(response.data)
        }
      } catch (error) {
        console.error("Failed to fetch notifications:", error)
      }
    }

    void fetchNotifications()
    
    const interval = setInterval(() => void fetchNotifications(), 30000)
    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [])

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationsApi.markAsRead(id)
      setNotifications((prev) => prev.filter((n) => n.id !== id))
    } catch (error) {
      console.error("Failed to mark as read:", error)
    }
  }
  
  const handleMarkAllAsRead = async () => {
    try {
      await notificationsApi.markAllAsRead()
      setNotifications([])
      setIsOpen(false)
    } catch (error) {
      console.error("Failed to mark all as read:", error)
    }
  }

  const unreadCount = notifications.length

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="relative h-9 w-9 overflow-visible"
            aria-label="Admin Notifications"
          />
        }
      >
        <Bell className="h-[1.2rem] w-[1.2rem]" />
        {unreadCount > 0 && (
          <span className="pointer-events-none absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h4 className="font-semibold text-sm">Notifications</h4>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead} className="h-auto text-xs px-2 py-1">
              Mark all read
            </Button>
          )}
        </div>
        {unreadCount === 0 ? (
          <div className="p-6 text-center text-sm text-muted-foreground">
            No new notifications
          </div>
        ) : (
          <ScrollArea className="h-80">
            <div className="flex flex-col">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="flex items-start gap-3 border-b p-4 last:border-0 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {notification.title}
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {notification.message}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {new Date(notification.created_at).toLocaleString()}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 rounded-full shrink-0"
                    onClick={() => handleMarkAsRead(notification.id)}
                    title="Mark as read"
                  >
                    <Check className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </PopoverContent>
    </Popover>
  )
}
