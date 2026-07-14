import { Outlet } from "react-router-dom"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "./sidebar/app-sidebar"
import { ModeToggle } from "@/components/theme/mode-toggle"
import { Separator } from "@/components/ui/separator"
import { DynamicBreadcrumb } from "@/components/layout/DynamicBreadcrumb"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { ScrollArea } from "@/components/ui/scroll-area"

export function AppLayout() {
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
          <ModeToggle />
        </header>
        <ScrollArea className="flex-1 min-h-0">
          <div className="flex flex-col gap-4 p-2">
            <Outlet />
          </div>
        </ScrollArea>
      </SidebarInset>
    </SidebarProvider>
  )
}
