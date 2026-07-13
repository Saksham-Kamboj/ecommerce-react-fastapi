"use client"

import * as React from "react"
import { useAuth } from "@/contexts/AuthContext"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { TerminalSquareIcon, BotIcon, BookOpenIcon, Settings2Icon, LifeBuoyIcon, SendIcon, FrameIcon, PieChartIcon, MapIcon, TerminalIcon } from "lucide-react"

// Hardcode navigation for now, but in a real app this could be dynamic based on role
const navMain = [
  {
    title: "Playground",
    url: "#",
    icon: (
      <TerminalSquareIcon
      />
    ),
    isActive: true,
    items: [
      {
        title: "History",
        url: "#",
      },
      {
        title: "Starred",
        url: "#",
      },
      {
        title: "Settings",
        url: "#",
      },
    ],
  },
  {
    title: "Models",
    url: "#",
    icon: (
      <BotIcon
      />
    ),
    items: [
      {
        title: "Genesis",
        url: "#",
      },
      {
        title: "Explorer",
        url: "#",
      },
      {
        title: "Quantum",
        url: "#",
      },
    ],
  },
  {
    title: "Documentation",
    url: "#",
    icon: (
      <BookOpenIcon
      />
    ),
    items: [
      {
        title: "Introduction",
        url: "#",
      },
      {
        title: "Get Started",
        url: "#",
      },
      {
        title: "Tutorials",
        url: "#",
      },
      {
        title: "Changelog",
        url: "#",
      },
    ],
  },
  {
    title: "Settings",
    url: "#",
    icon: (
      <Settings2Icon
      />
    ),
    items: [
      {
        title: "General",
        url: "#",
      },
      {
        title: "Team",
        url: "#",
      },
      {
        title: "Billing",
        url: "#",
      },
      {
        title: "Limits",
        url: "#",
      },
    ],
  },
]
const navSecondary = [
  {
    title: "Support",
    url: "#",
    icon: (
      <LifeBuoyIcon
      />
    ),
  },
  {
    title: "Feedback",
    url: "#",
    icon: (
      <SendIcon
      />
    ),
  },
]
const projects = [
  {
    name: "Design Engineering",
    url: "#",
    icon: (
      <FrameIcon
      />
    ),
  },
  {
    name: "Sales & Marketing",
    url: "#",
    icon: (
      <PieChartIcon
      />
    ),
  },
  {
    name: "Travel",
    url: "#",
    icon: (
      <MapIcon
      />
    ),
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth()
  
  // Format the user object for NavUser
  const navUser = {
    name: user?.full_name || user?.email?.split('@')[0] || "User",
    email: user?.email || "",
    avatar: "", // Can add an avatar URL if available in the backend later
  }

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<a href="#" />}>
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <TerminalIcon className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">EKVAYU Commerce</span>
                <span className="truncate text-xs">{user?.role === 'superadmin' ? 'Admin Panel' : 'Customer Panel'}</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
        <NavProjects projects={projects} />
        <NavSecondary items={navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={navUser} />
      </SidebarFooter>
    </Sidebar>
  )
}
