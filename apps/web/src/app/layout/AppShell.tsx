import { Outlet } from "react-router-dom"

import { SidebarProvider } from "@workspace/ui/components/sidebar"

import { AppHeader } from "./AppHeader"
import { AppSidebar } from "./AppSidebar"

export function AppShell() {
  return (
    <SidebarProvider
      defaultOpen={false}
      className="min-h-svh bg-transparent"
      style={{
        "--sidebar-width": "16rem",
        "--sidebar-width-icon": "4.75rem",
      } as React.CSSProperties}
    >
      <AppSidebar />
      <div className="flex min-h-svh min-w-0 flex-1 flex-col overflow-hidden">
        <AppHeader />

        <main className="relative flex-1">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-[var(--app-primary-soft)]/20 to-transparent" />

          <div className="relative mx-auto w-full max-w-[var(--app-content-max-width)] px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8 xl:px-10">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}
