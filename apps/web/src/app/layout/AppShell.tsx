import { Outlet, useLocation } from "react-router-dom"

import { SidebarProvider } from "@workspace/ui/components/sidebar"
import { cn } from "@workspace/ui/lib/utils"

import { AppHeader } from "./AppHeader"
import { AppSidebar } from "./AppSidebar"
import { CrmAssistantWidget } from "@/features/assistant/components/CrmAssistantWidget"
import { CONTAINED_PAGE_SCROLL_ENABLED } from "@/config/pageLayout"

export function AppShell() {
  const location = useLocation()
  const opportunityView = new URLSearchParams(location.search).get("view")
  const meetingView = new URLSearchParams(location.search).get("view")
  const routeSupportsContainedPageScroll =
    location.pathname === "/companies" ||
    location.pathname === "/people" ||
    location.pathname === "/activities" ||
    location.pathname === "/tasks" ||
    location.pathname === "/attention" ||
    location.pathname.startsWith("/admin/libraries") ||
    location.pathname === "/technical/library" ||
    location.pathname === "/technical/knowledge-base" ||
    location.pathname === "/technical/tenders" ||
    (location.pathname === "/opportunities" && (opportunityView === "list" || opportunityView === null)) ||
    (location.pathname === "/meetings" && (meetingView === "list" || meetingView === null))
  const usesContainedPageScroll =
    CONTAINED_PAGE_SCROLL_ENABLED && routeSupportsContainedPageScroll

  return (
    <SidebarProvider
      defaultOpen
      className={cn(
        "bg-transparent",
        usesContainedPageScroll ? "min-h-svh lg:h-svh lg:overflow-hidden" : "min-h-svh",
      )}
      style={{
        "--sidebar-width": "16rem",
        "--sidebar-width-icon": "4.75rem",
      } as React.CSSProperties}
    >
      <AppSidebar />
      <div data-page-scroll={usesContainedPageScroll ? "contained" : "natural"} className={cn(
        "flex min-w-0 flex-1 flex-col overflow-hidden",
        usesContainedPageScroll ? "min-h-svh lg:h-svh" : "min-h-svh",
      )}>
        <AppHeader />

        <main className={cn(
          "relative flex-1",
          usesContainedPageScroll && "lg:min-h-0 lg:overflow-hidden",
        )}>
          <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-[var(--app-primary-soft)]/20 to-transparent" />

          <div className={cn(
            "relative mx-auto w-full max-w-[var(--app-content-max-width)] px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8 xl:px-10",
            usesContainedPageScroll && "lg:h-full lg:min-h-0",
          )}>
            <Outlet />
          </div>
        </main>
      </div>
      <CrmAssistantWidget />
    </SidebarProvider>
  )
}
