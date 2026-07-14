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
import { ShoppingCart, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/contexts/CartContext"
import { useWishlist } from "@/contexts/WishlistContext"
import { CartSheet } from "@/components/cart/CartSheet"
import { WishlistSheet } from "@/components/wishlist/WishlistSheet"

export function AppLayout() {
  const { cart, setIsCartOpen } = useCart()
  const { items: wishlistItems, setIsWishlistOpen } = useWishlist()

  const itemCount = cart?.items.length || 0
  const wishlistCount = wishlistItems.length

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
          <div className="flex items-center gap-1">
            {/* Wishlist */}
            <Button
              variant="ghost"
              size="icon"
              className="relative h-9 w-9 overflow-visible"
              onClick={() => setIsWishlistOpen(true)}
              aria-label="Open wishlist"
            >
              <Heart className="h-[1.2rem] w-[1.2rem]" />
              {wishlistCount > 0 && (
                <span className="pointer-events-none absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
                  {wishlistCount}
                </span>
              )}
            </Button>

            {/* Cart */}
            <Button
              variant="ghost"
              size="icon"
              className="relative h-9 w-9 overflow-visible"
              onClick={() => setIsCartOpen(true)}
              aria-label="Open cart"
            >
              <ShoppingCart className="h-[1.2rem] w-[1.2rem]" />
              {itemCount > 0 && (
                <span className="pointer-events-none absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
                  {itemCount}
                </span>
              )}
            </Button>

            <ModeToggle />
          </div>
        </header>
        <div className="min-h-0 flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="flex flex-col gap-4 p-4 pb-8">
              <Outlet />
            </div>
          </ScrollArea>
        </div>
      </SidebarInset>
      <CartSheet />
      <WishlistSheet />
    </SidebarProvider>
  )
}
