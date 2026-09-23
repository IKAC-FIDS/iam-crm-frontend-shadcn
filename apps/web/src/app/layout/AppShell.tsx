import { Outlet, useLocation } from "react-router-dom"

import { SidebarProvider } from "@workspace/ui/components/sidebar"
import { cn } from "@workspace/ui/lib/utils"

import { AppHeader } from "./AppHeader"
import { AppSidebar } from "./AppSidebar"

export function AppShell() {
  const location = useLocation()
  const usesContainedPageScroll = location.pathname === "/companies"

  return (
    <SidebarProvider
      defaultOpen
      className={cn(
        "bg-transparent",
        usesContainedPageScroll ? "h-svh overflow-hidden" : "min-h-svh",
      )}
      style={{
        "--sidebar-width": "16rem",
        "--sidebar-width-icon": "4.75rem",
      } as React.CSSProperties}
    >
      <AppSidebar />
      <div className={cn(
        "flex min-w-0 flex-1 flex-col overflow-hidden",
        usesContainedPageScroll ? "h-svh" : "min-h-svh",
      )}>
        <AppHeader />

        <main className={cn(
          "relative flex-1",
          usesContainedPageScroll && "min-h-0 overflow-hidden",
        )}>
          <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-[var(--app-primary-soft)]/20 to-transparent" />

          <div className={cn(
            "relative mx-auto w-full max-w-[var(--app-content-max-width)] px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8 xl:px-10",
            usesContainedPageScroll && "h-full min-h-0",
          )}>
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}
