"use client"

import * as React from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useCart } from "@/contexts/CartContext"
import { useWishlist } from "@/contexts/WishlistContext"
import { appConfig } from "@/config/app"
import logo from "@/assets/e-com-logo.png"

import { NavMain } from "./nav-main"
import { NavSecondary } from "./nav-secondary"
import { NavUser } from "./nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
  LifeBuoyIcon,
  SendIcon,
  UserCircleIcon,
  UsersIcon,
  ShoppingBag,
  LayoutDashboardIcon,
  HeartIcon,
  ShoppingCartIcon,
  PackageIcon,
  ClipboardList,
} from "lucide-react"
import { Link } from "react-router-dom"

// Shared admin nav items
const navAdmin = [
  {
    title: "Users",
    url: "/users",
    icon: <UsersIcon />,
    isActive: false,
    requireRole: "superadmin",
  },
  {
    title: "Categories",
    url: "/categories",
    icon: <PackageIcon />,
    isActive: false,
    requireRole: "superadmin",
  },
  {
    title: "Products",
    url: "/products",
    icon: <ShoppingBag />,
    isActive: false,
    requireRole: "superadmin",
  },
  {
    title: "Orders",
    url: "/orders",
    icon: <ClipboardList />,
    isActive: false,
    requireRole: "superadmin",
  },
]

// User-only nav items
const userNavItems = [
  {
    title: "Products",
    url: "/products",
    icon: <ShoppingBag />,
    isActive: false,
  },
  {
    title: "Wishlist",
    url: "/wishlist",
    icon: <HeartIcon />,
    isActive: false,
  },
  {
    title: "Cart",
    url: "/cart",
    icon: <ShoppingCartIcon />,
    isActive: false,
  },
  {
    title: "Orders",
    url: "/orders",
    icon: <PackageIcon />,
    isActive: false,
  },
]
const navSecondary = [
  {
    title: "Support",
    url: "https://github.com/Saksham-Kamboj/ecommerce-react-fastapi",
    icon: <LifeBuoyIcon />,
  },
  {
    title: "Feedback",
    url: "https://github.com/Saksham-Kamboj/ecommerce-react-fastapi",
    icon: <SendIcon />,
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth()
  const { cart } = useCart()
  const { items: wishlistItems } = useWishlist()

  const cartCount = cart?.items.length ?? 0
  const wishlistCount = wishlistItems.length
  const isAdmin = user?.role === "superadmin"

  // First nav item differs by role
  const firstNavItem = isAdmin
    ? {
        title: "Dashboard",
        url: "/dashboard",
        icon: <LayoutDashboardIcon />,
        isActive: true,
      }
    : {
        title: "Profile",
        url: "/profile",
        icon: <UserCircleIcon />,
        isActive: true,
      }

  // Admin sees: Dashboard, Users, Products
  // User sees: Profile, Products, Wishlist, Cart, Orders
  const getBadge = (url: string): number | undefined => {
    if (url === "/cart") return cartCount > 0 ? cartCount : undefined
    if (url === "/wishlist")
      return wishlistCount > 0 ? wishlistCount : undefined
    return undefined
  }

  const roleItems = isAdmin
    ? navAdmin
    : userNavItems.map((item) => ({ ...item, badge: getBadge(item.url) }))
  const filteredNavMain = [firstNavItem, ...roleItems].filter((item) => {
    if (
      "requireRole" in item &&
      item.requireRole &&
      item.requireRole !== user?.role
    ) {
      return false
    }
    return true
  })

  // Format the user object for NavUser
  const navUserData = {
    name: user?.full_name || user?.email?.split("@")[0] || "User",
    email: user?.email || "",
    avatar: "", // Can add an avatar URL if available in the backend later
  }

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader className="border-b border-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link to="/" />}>
              <div className="flex aspect-square size-10 items-center justify-center overflow-hidden rounded-lg">
                <img src={logo} alt="Logo" className="size-full object-cover" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{appConfig.name}</span>
                <span className="truncate text-xs">
                  {user?.role === "superadmin"
                    ? "Admin Panel"
                    : "Customer Panel"}
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={filteredNavMain} />
        <NavSecondary items={navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={navUserData} />
      </SidebarFooter>
    </Sidebar>
  )
}
