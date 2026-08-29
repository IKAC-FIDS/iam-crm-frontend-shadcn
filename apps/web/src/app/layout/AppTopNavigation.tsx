import { ArrowUpLeft, ChevronDown, LayoutDashboard, Menu, Sparkles } from "lucide-react"
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

const groupDescriptions = {
  sales: "مشتریان، تعاملات و جریان کامل فروش",
  technical: "دانش، مستندات و منابع تخصصی",
  management: "تنظیمات، دسترسی‌ها و مدیریت سازمان",
  account: "امنیت، مصرف و تنظیمات شخصی",
} as const

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

          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <button
                  type="button"
                  className={routeClass(groups.some(({ routes }) => routes.some((route) => isMenuRouteActive(route.path, location.pathname))))}
                />
              }
            >
              <Sparkles className="size-4 text-[var(--app-primary)]" />
              همه بخش‌ها
              <ChevronDown className="size-3.5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              sideOffset={8}
              dir="rtl"
              className="w-[min(92vw,960px)] overflow-hidden rounded-[1.75rem] border-[var(--app-divider)] bg-[var(--app-surface)]/95 p-0 shadow-[0_24px_80px_-24px_rgba(15,23,42,.35)] backdrop-blur-2xl"
            >
              <div className="relative overflow-hidden border-b border-[var(--app-divider)] bg-gradient-to-l from-[var(--app-primary-soft)] via-[var(--app-surface)] to-[var(--info-light)]/35 px-6 py-5">
                <div className="pointer-events-none absolute -start-10 -top-16 size-40 rounded-full bg-[var(--app-primary)]/10 blur-3xl" />
                <div className="relative flex items-center gap-3">
                  <span className="grid size-11 place-items-center rounded-2xl bg-[var(--app-primary)] text-[var(--app-on-primary)] shadow-[var(--app-shadow-brand)]">
                    <Sparkles className="size-5" />
                  </span>
                  <div>
                    <DropdownMenuLabel className="p-0 text-base font-black text-[var(--app-heading)]">فضای کاری یکپارچه</DropdownMenuLabel>
                    <p className="mt-1 text-xs text-[var(--app-text-secondary)]">سریع به تمام ابزارهای موردنیازتان دسترسی پیدا کنید.</p>
                  </div>
                </div>
              </div>

              <div className="grid max-h-[68vh] grid-cols-1 gap-3 overflow-y-auto p-4 lg:grid-cols-2">
                {groups.map(({ group, label, routes }) => (
                  <section key={group} className="rounded-2xl border border-[var(--app-divider)] bg-[var(--app-background)]/45 p-3">
                    <div className="mb-2 px-2 py-1">
                      <h3 className="text-sm font-black text-[var(--app-heading)]">{label}</h3>
                      <p className="mt-1 text-[11px] leading-5 text-[var(--app-text-secondary)]">{groupDescriptions[group]}</p>
                    </div>
                    <div className="grid gap-1 sm:grid-cols-2">
                      {routes.map((route) => {
                        const Icon = route.icon
                        const active = isMenuRouteActive(route.path, location.pathname)
                        return (
                          <DropdownMenuItem
                            key={route.id}
                            onClick={() => go(route.path)}
                            className={[
                              "group min-h-16 cursor-pointer items-center gap-3 rounded-xl border border-transparent p-2.5 transition-all",
                              active
                                ? "border-[var(--app-primary)]/20 bg-[var(--app-primary-soft)] text-[var(--app-on-primary-container)]"
                                : "hover:border-[var(--app-divider)] hover:bg-[var(--app-surface)] hover:shadow-sm",
                            ].join(" ")}
                          >
                            <span className={active ? "grid size-9 shrink-0 place-items-center rounded-xl bg-[var(--app-primary)] text-[var(--app-on-primary)]" : "grid size-9 shrink-0 place-items-center rounded-xl bg-[var(--app-surface)] text-[var(--app-primary)] ring-1 ring-[var(--app-divider)] transition group-hover:bg-[var(--app-primary-soft)]"}>
                              <Icon className="size-4" />
                            </span>
                            <span className="min-w-0 flex-1 truncate text-xs font-bold">{route.label}</span>
                            <ArrowUpLeft className="size-3.5 shrink-0 text-[var(--app-icon-muted)] opacity-0 transition group-hover:opacity-100" />
                          </DropdownMenuItem>
                        )
                      })}
                    </div>
                  </section>
                ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
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
