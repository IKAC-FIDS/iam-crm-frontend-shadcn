import {
  ArrowUpLeft,
  BriefcaseBusiness,
  CalendarDays,
  ChevronDown,
  CircleUserRound,
  LayoutDashboard,
  Menu,
  Settings2,
  Wrench,
  type LucideIcon,
} from "lucide-react"
import { useLocation, useNavigate } from "react-router-dom"

import { Button } from "@workspace/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import {
  getVisibleMenuGroups,
  getVisibleTopLevelRoutes,
  isMenuRouteActive,
} from "@/app/navigation/routeNavigation"
import type { NavigationGroupKey } from "@/app/navigation/routeRegistry"
import { uiText } from "@/config/uiText"
import { useAuthStore } from "@/store/authStore"

const groupPresentation: Record<
  NavigationGroupKey,
  { description: string; icon: LucideIcon }
> = {
  sales: {
    description: "مشتریان، تعاملات و جریان کامل فروش",
    icon: BriefcaseBusiness,
  },
  technical: {
    description: "دانش، مستندات و منابع تخصصی",
    icon: Wrench,
  },
  management: {
    description: "تنظیمات، دسترسی‌ها و مدیریت سازمان",
    icon: Settings2,
  },
  account: {
    description: "امنیت، مصرف و تنظیمات شخصی",
    icon: CircleUserRound,
  },
}

export function AppTopNavigation() {
  const user = useAuthStore((state) => state.user)
  const location = useLocation()
  const navigate = useNavigate()
  const groups = getVisibleMenuGroups(user)
  const topLevelRoutes = getVisibleTopLevelRoutes(user)
  const meetingsRoute = topLevelRoutes.find((route) => route.id === "meetings")
  const primaryRoutes = topLevelRoutes.filter(
    (route) => route.id !== "meetings"
  )
  const go = (path: string) => navigate(path)

  const routeClass = (active: boolean) =>
    [
      "inline-flex h-10 shrink-0 items-center gap-2 rounded-xl px-3 text-sm font-bold transition-colors",
      active
        ? "bg-[var(--app-primary-soft)] text-[var(--app-on-primary-container)]"
        : "text-[var(--app-text-secondary)] hover:bg-[var(--app-background)] hover:text-[var(--app-heading)]",
    ].join(" ")

  return (
    <nav
      aria-label={uiText.common.openCloseMainMenu}
      className="border-t border-[var(--app-divider)]/70"
    >
      <div className="mx-auto flex min-h-14 w-full max-w-[var(--app-content-max-width)] items-center px-4 sm:px-6 lg:px-8 xl:px-10">
        <div className="hidden w-full min-w-0 items-center gap-1 md:flex">
          {primaryRoutes.map((route) => {
            const Icon = route.icon ?? LayoutDashboard
            const active = isMenuRouteActive(route.path, location.pathname)
            return (
              <button
                key={route.id}
                type="button"
                onClick={() => go(route.path)}
                className={routeClass(active)}
                aria-current={active ? "page" : undefined}
              >
                <Icon className="size-4" />
                {route.label}
              </button>
            )
          })}

          {groups.map(({ group, label, routes }) => {
            const presentation = groupPresentation[group]
            const GroupIcon = presentation.icon
            const active = routes.some((route) =>
              isMenuRouteActive(route.path, location.pathname)
            )
            return (
              <DropdownMenu key={group}>
                <DropdownMenuTrigger
                  render={
                    <button type="button" className={routeClass(active)} />
                  }
                >
                  <GroupIcon className="size-4" />
                  {label}
                  <ChevronDown className="size-3.5" />
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  sideOffset={8}
                  dir="rtl"
                  className="w-[min(92vw,390px)] rounded-2xl border-[var(--app-divider)] bg-[var(--app-surface)]/95 p-2 shadow-[0_20px_60px_-24px_rgba(15,23,42,.4)] backdrop-blur-2xl"
                >
                  <div className="mb-2 rounded-xl bg-[var(--app-primary-soft)]/55 px-3 py-2.5">
                    <div className="flex items-center gap-2 font-black text-[var(--app-heading)]">
                      <GroupIcon className="size-4 text-[var(--app-primary)]" />
                      {label}
                    </div>
                    <p className="mt-1 text-[11px] leading-5 text-[var(--app-text-secondary)]">
                      {presentation.description}
                    </p>
                  </div>
                  <div className="grid gap-1 sm:grid-cols-2">
                    {routes.map((route) => {
                      const Icon = route.icon
                      const routeActive = isMenuRouteActive(
                        route.path,
                        location.pathname
                      )
                      return (
                        <DropdownMenuItem
                          key={route.id}
                          onClick={() => go(route.path)}
                          className={[
                            "group min-h-12 cursor-pointer gap-2.5 rounded-xl p-2.5",
                            routeActive
                              ? "bg-[var(--app-primary-soft)] text-[var(--app-on-primary-container)]"
                              : "hover:bg-[var(--app-background)]",
                          ].join(" ")}
                        >
                          <Icon className="size-4 text-[var(--app-primary)]" />
                          <span className="min-w-0 flex-1 truncate text-xs font-bold">
                            {route.label}
                          </span>
                          <ArrowUpLeft className="size-3.5 text-[var(--app-icon-muted)] opacity-0 transition group-hover:opacity-100" />
                        </DropdownMenuItem>
                      )
                    })}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            )
          })}

          {meetingsRoute ? (
            <Button
              type="button"
              variant={
                isMenuRouteActive(meetingsRoute.path, location.pathname)
                  ? "default"
                  : "outline"
              }
              className="ms-auto h-10 shrink-0 rounded-xl"
              onClick={() => go(meetingsRoute.path)}
              aria-current={
                isMenuRouteActive(meetingsRoute.path, location.pathname)
                  ? "page"
                  : undefined
              }
            >
              <CalendarDays className="size-4" />
              {meetingsRoute.label}
            </Button>
          ) : null}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                type="button"
                variant="ghost"
                className="h-10 rounded-xl md:hidden"
              />
            }
          >
            <Menu className="size-5" />
            منوی اصلی
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            dir="rtl"
            className="max-h-[70vh] w-72 overflow-y-auto rounded-2xl p-2"
          >
            {primaryRoutes.map((route) => {
              const Icon = route.icon ?? LayoutDashboard
              return (
                <DropdownMenuItem
                  key={route.id}
                  onClick={() => go(route.path)}
                  className="min-h-11 rounded-xl"
                >
                  <Icon className="size-4" />
                  {route.label}
                </DropdownMenuItem>
              )
            })}
            {groups.map(({ group, label, routes }) => {
              const GroupIcon = groupPresentation[group].icon
              return (
                <DropdownMenuSub key={group}>
                  <DropdownMenuSubTrigger className="min-h-11 rounded-xl font-bold">
                    <GroupIcon className="size-4 text-[var(--app-primary)]" />
                    {label}
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent
                    dir="rtl"
                    className="w-64 rounded-2xl p-2"
                  >
                    {routes.map((route) => {
                      const Icon = route.icon
                      return (
                        <DropdownMenuItem
                          key={route.id}
                          onClick={() => go(route.path)}
                          className="min-h-11 rounded-xl"
                        >
                          <Icon className="size-4" />
                          {route.label}
                        </DropdownMenuItem>
                      )
                    })}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              )
            })}
            {meetingsRoute ? (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => go(meetingsRoute.path)}
                  className="min-h-11 rounded-xl bg-[var(--app-primary)] font-bold text-[var(--app-on-primary)] focus:bg-[var(--app-primary)]/90 focus:text-[var(--app-on-primary)]"
                >
                  <CalendarDays className="size-4" />
                  {meetingsRoute.label}
                </DropdownMenuItem>
              </>
            ) : null}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  )
}
