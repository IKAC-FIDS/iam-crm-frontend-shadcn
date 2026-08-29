import { Outlet } from "react-router-dom"

import { AppHeader } from "./AppHeader"

export function AppShell() {
  return (
    <div className="flex min-h-svh min-w-0 flex-col overflow-hidden bg-transparent">
      <AppHeader />

      <main className="relative flex-1">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-[var(--app-primary-soft)]/20 to-transparent" />

          <div className="relative mx-auto w-full max-w-[var(--app-content-max-width)] px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8 xl:px-10">
            <Outlet />
          </div>
      </main>
    </div>
  )
}
