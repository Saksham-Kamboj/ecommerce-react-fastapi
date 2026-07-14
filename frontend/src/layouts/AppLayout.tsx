import { Outlet } from "react-router-dom"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "./sidebar/app-sidebar"
import { ModeToggle } from "@/components/theme/mode-toggle"
import { Separator } from "@/components/ui/separator"
import { DynamicBreadcrumb } from "@/components/layout/DynamicBreadcrumb"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/contexts/CartContext"
import { CartSheet } from "@/components/cart/CartSheet"

export function AppLayout() {
  const { cart, setIsCartOpen } = useCart()

  // Calculate total number of items (sum of quantities)
  const itemCount =
    cart?.items.reduce((total, item) => total + item.quantity, 0) || 0

  return (
    <SidebarProvider className="h-svh overflow-hidden">
      <AppSidebar />
      <SidebarInset className="overflow-hidden">
        <header className="flex h-12 shrink-0 items-center justify-between gap-2 border-b bg-background pr-4">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1 cursor-pointer" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <DynamicBreadcrumb />
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => setIsCartOpen(true)}
              aria-label="Open cart"
            >
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <Badge
                  className="pointer-events-none absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px]"
                  variant="default"
                >
                  {itemCount}
                </Badge>
              )}
            </Button>
            <ModeToggle />
          </div>
        </header>
        <ScrollArea className="min-h-0 flex-1">
          <div className="flex flex-col gap-4 p-2">
            <Outlet />
          </div>
        </ScrollArea>
      </SidebarInset>
      <CartSheet />
    </SidebarProvider>
  )
}
