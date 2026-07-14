"use client"

import * as React from "react"
import { useAuth } from "@/contexts/AuthContext"
import { appConfig } from "@/config/app"

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
} from "lucide-react"
import { Link } from "react-router-dom"

// Hardcode navigation for now, but in a real app this could be dynamic based on role
const navCommon = [
  {
    title: "Users",
    url: "/users",
    icon: <UsersIcon />,
    isActive: false,
    requireRole: "superadmin",
  },
  {
    title: "Products",
    url: "/products",
    icon: <ShoppingBag />,
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

  // Build full nav list and filter by role
  const filteredNavMain = [firstNavItem, ...navCommon].filter((item) => {
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
  const navUser = {
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
                <img
                  src="/e-com-logo.png"
                  alt="Logo"
                  className="size-full object-cover"
                />
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
        <NavUser user={navUser} />
      </SidebarFooter>
    </Sidebar>
  )
}
