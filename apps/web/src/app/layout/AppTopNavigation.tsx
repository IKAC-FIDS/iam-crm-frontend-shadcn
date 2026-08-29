import { ChevronDown, LayoutDashboard, Menu } from "lucide-react"
import { useLocation, useNavigate } from "react-router-dom"

import { Button } from "@workspace/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import {
  getVisibleMenuGroups,
  getVisibleTopLevelRoutes,
  isMenuRouteActive,
} from "@/app/navigation/routeNavigation"
import { uiText } from "@/config/uiText"
import { useAuthStore } from "@/store/authStore"

export function AppTopNavigation() {
  const user = useAuthStore((state) => state.user)
  const location = useLocation()
  const navigate = useNavigate()
  const groups = getVisibleMenuGroups(user)
  const topLevelRoutes = getVisibleTopLevelRoutes(user)
  const go = (path: string) => navigate(path)

  const routeClass = (active: boolean) =>
    [
      "inline-flex h-10 shrink-0 items-center gap-2 rounded-xl px-3 text-sm font-bold transition-colors",
      active
        ? "bg-[var(--app-primary-soft)] text-[var(--app-on-primary-container)]"
        : "text-[var(--app-text-secondary)] hover:bg-[var(--app-background)] hover:text-[var(--app-heading)]",
    ].join(" ")

  return (
    <nav aria-label={uiText.common.openCloseMainMenu} className="border-t border-[var(--app-divider)]/70">
      <div className="mx-auto flex min-h-14 w-full max-w-[var(--app-content-max-width)] items-center px-4 sm:px-6 lg:px-8 xl:px-10">
        <div className="hidden min-w-0 items-center gap-1 md:flex">
          {topLevelRoutes.map((route) => {
            const Icon = route.icon ?? LayoutDashboard
            const active = isMenuRouteActive(route.path, location.pathname)
            return (
              <button key={route.id} type="button" onClick={() => go(route.path)} className={routeClass(active)} aria-current={active ? "page" : undefined}>
                <Icon className="size-4" />
                {route.label}
              </button>
            )
          })}

          {groups.map(({ group, label, routes }) => {
            const active = routes.some((route) => isMenuRouteActive(route.path, location.pathname))
            return (
              <DropdownMenu key={group}>
                <DropdownMenuTrigger render={<button type="button" className={routeClass(active)} aria-current={active ? "page" : undefined} />}>
                  {label}
                  <ChevronDown className="size-3.5" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" dir="rtl" className="w-60 rounded-2xl p-2">
                  {routes.map((route) => {
                    const Icon = route.icon
                    const routeActive = isMenuRouteActive(route.path, location.pathname)
                    return (
                      <DropdownMenuItem key={route.id} onClick={() => go(route.path)} className={routeActive ? "rounded-xl bg-[var(--app-primary-soft)] font-bold text-[var(--app-on-primary-container)]" : "rounded-xl"}>
                        <Icon className="size-4" />
                        {route.label}
                      </DropdownMenuItem>
                    )
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            )
          })}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger render={<Button type="button" variant="ghost" className="h-10 rounded-xl md:hidden" />}>
            <Menu className="size-5" />
            منوی اصلی
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" dir="rtl" className="max-h-[70vh] w-72 overflow-y-auto rounded-2xl p-2">
            {topLevelRoutes.map((route) => {
              const Icon = route.icon ?? LayoutDashboard
              return <DropdownMenuItem key={route.id} onClick={() => go(route.path)} className="rounded-xl"><Icon className="size-4" />{route.label}</DropdownMenuItem>
            })}
            {groups.map(({ group, label, routes }) => (
              <div key={group}>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>{label}</DropdownMenuLabel>
                {routes.map((route) => {
                  const Icon = route.icon
                  return <DropdownMenuItem key={route.id} onClick={() => go(route.path)} className="rounded-xl"><Icon className="size-4" />{route.label}</DropdownMenuItem>
                })}
              </div>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  )
}
