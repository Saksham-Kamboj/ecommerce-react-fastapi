import { Outlet } from "react-router-dom"
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { AppSidebar } from "./sidebar/app-sidebar"
import { ModeToggle } from "@/components/theme/mode-toggle"
import { Separator } from "@/components/ui/separator"
import { DynamicBreadcrumb } from "@/components/layout/DynamicBreadcrumb"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/contexts/CartContext"
import { CartSheet } from "@/components/cart/CartSheet"

export function AppLayout() {
  const { cart, setIsCartOpen } = useCart()

  const itemCount = cart?.items.length || 0

  return (
    <SidebarProvider className="h-svh overflow-hidden">
      <AppSidebar />
      <SidebarInset className="flex min-h-0 flex-1 flex-col overflow-hidden">
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
        {/* 
          ScrollArea ko kaam karne ke liye parent ki explicit height chahiye.
          min-h-0 + flex-1 sirf tab kaam karta hai jab usse overflow-hidden
          container ke andar wrap kiya jaaye — isliye yahan ek intermediate
          div use kar rahe hain jo flex-1 se height lega aur overflow-hidden
          se ScrollArea ke Root ko bounded karega.
        */}
        <div className="min-h-0 flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="flex flex-col gap-4 p-4 pb-8">
              <Outlet />
            </div>
          </ScrollArea>
        </div>
      </SidebarInset>
      <CartSheet />
    </SidebarProvider>
  )
}
