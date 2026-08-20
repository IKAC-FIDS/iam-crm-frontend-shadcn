import { Outlet } from "react-router-dom"
import { SidebarInset, SidebarProvider } from "@workspace/ui/components/sidebar"
import { AppHeader } from "./AppHeader"
import { AppSidebar } from "./AppSidebar"

export function AppShell() {
  return <SidebarProvider defaultOpen><AppSidebar /><SidebarInset className="min-w-0 bg-[#EFF5FA]"><AppHeader /><div className="mx-auto w-full max-w-[1600px] p-4 sm:p-6 lg:p-8"><Outlet /></div></SidebarInset></SidebarProvider>
}
