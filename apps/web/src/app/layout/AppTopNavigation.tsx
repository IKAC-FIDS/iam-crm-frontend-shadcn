import {
  ArrowUpLeft,
  BriefcaseBusiness,
  ChevronDown,
  CircleUserRound,
  LayoutDashboard,
  Menu,
  Settings2,
  ListChecks,
  Wrench,
  type LucideIcon,
} from "lucide-react"
import { useLocation, useNavigate } from "react-router-dom"

import { Button } from "@workspace/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
  operations: {
    description: "کارها، تعاملات، جلسات و پیگیری‌های روزانه",
    icon: ListChecks,
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

const routeHints: Record<string, string> = {
  companies: "مدیریت حساب‌های مشتری",
  opportunities: "پیگیری چرخه و مراحل فروش",
  tasks: "اقدام‌ها و کارهای روزانه",
  meetings: "برنامه‌ریزی و مدیریت جلسات",
  "follow-ups": "پیگیری اقدام‌های زمان‌بندی‌شده",
  notifications: "اعلان‌ها و رویدادهای مهم",
  people: "مخاطبان و افراد سازمانی",
  activities: "تاریخچه تعاملات مشتری",
  reports: "شاخص‌ها و گزارش‌های فروش",
  "technical-releases": "نسخه‌ها و چرخه پشتیبانی",
  "technical-library": "نسخه‌ها، اسناد، فایل‌ها و لینک‌های فنی",
  "technical-knowledge-base": "مقالات و دانش قابل استفاده مجدد",
  "technical-tenders": "فرایند فنی و تجاری مناقصه",
  "technical-documents": "اسناد نسخه‌بندی‌شده و محرمانه",
  "technical-resources": "منابع، SDK و فایل‌های فنی",
  "admin-users": "کاربران و وضعیت دسترسی",
  "admin-teams": "ساختار و اعضای تیم‌ها",
  "admin-exchange-rates": "نرخ‌های ارز سازمان",
  "admin-permissions": "نقش‌ها و مجوزها",
  "admin-libraries": "داده‌های مرجع سامانه",
  "admin-pipeline": "مراحل و قوانین انتقال",
  "admin-audit-logs": "ردیابی تغییرات و رویدادها",
  "account-security": "رمز عبور، Passkey و نشست‌ها",
  "account-usage": "مصرف منابع و سهمیه‌ها",
}

export function AppTopNavigation() {
  const user = useAuthStore((state) => state.user)
  const location = useLocation()
  const navigate = useNavigate()
  const groups = getVisibleMenuGroups(user)
  const topLevelRoutes = getVisibleTopLevelRoutes(user)
  const primaryRoutes = topLevelRoutes
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
                  className="w-[min(92vw,540px)] overflow-hidden rounded-[1.6rem] border-[var(--app-divider)] bg-[var(--app-surface)]/95 p-0 shadow-[0_28px_90px_-32px_rgba(15,23,42,.55)] backdrop-blur-2xl"
                >
                  <div className="relative overflow-hidden border-b border-[var(--app-divider)] bg-[linear-gradient(135deg,var(--app-primary-soft),var(--app-surface)_62%,var(--info-light))] px-5 py-4">
                    <div className="pointer-events-none absolute -end-8 -top-12 size-32 rounded-full bg-[var(--app-primary)]/15 blur-3xl" />
                    <div className="pointer-events-none absolute start-10 -bottom-16 size-28 rounded-full bg-[var(--info)]/10 blur-3xl" />
                    <div className="relative flex items-center gap-3">
                      <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[var(--app-primary)] text-[var(--app-on-primary)] shadow-[var(--app-shadow-brand)]">
                        <GroupIcon className="size-5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h2 className="font-black text-[var(--app-heading)]">
                            {label}
                          </h2>
                          <span className="rounded-full bg-[var(--app-surface)]/70 px-2 py-0.5 text-[10px] font-bold text-[var(--app-primary)] ring-1 ring-[var(--app-primary)]/10">
                            {routes.length.toLocaleString("fa-IR")} بخش
                          </span>
                        </div>
                        <p className="mt-1 text-[11px] leading-5 text-[var(--app-text-secondary)]">
                          {presentation.description}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="grid max-h-[58vh] gap-2 overflow-y-auto p-3 sm:grid-cols-2">
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
                            "group relative min-h-[4.75rem] cursor-pointer items-center gap-3 overflow-hidden rounded-2xl border p-3 transition-all",
                            routeActive
                              ? "border-[var(--app-primary)]/25 bg-[var(--app-primary-soft)] text-[var(--app-on-primary-container)] shadow-[0_10px_30px_-22px_var(--app-primary)]"
                              : "border-[var(--app-divider)] bg-[var(--app-background)]/35 hover:-translate-y-0.5 hover:border-[var(--app-primary)]/20 hover:bg-[var(--app-surface)] hover:shadow-[var(--app-shadow-card)]",
                          ].join(" ")}
                        >
                          <span
                            className={[
                              "grid size-10 shrink-0 place-items-center rounded-xl ring-1 transition-colors",
                              routeActive
                                ? "bg-[var(--app-primary)] text-[var(--app-on-primary)] ring-[var(--app-primary)]/20"
                                : "bg-[var(--app-surface)] text-[var(--app-primary)] ring-[var(--app-divider)] group-hover:bg-[var(--app-primary-soft)]",
                            ].join(" ")}
                          >
                            <Icon className="size-[1.125rem]" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-xs font-black">
                              {route.label}
                            </span>
                            <span className="mt-1 block truncate text-[10px] font-normal text-[var(--app-text-secondary)]">
                              {routeHints[route.id] || "ورود به این بخش"}
                            </span>
                          </span>
                          <span className="grid size-7 shrink-0 place-items-center rounded-lg text-[var(--app-icon-muted)] transition group-hover:bg-[var(--app-primary-soft)] group-hover:text-[var(--app-primary)]">
                            <ArrowUpLeft className="size-3.5" />
                          </span>
                          {routeActive ? (
                            <span className="absolute end-0 top-3 h-8 w-1 rounded-s-full bg-[var(--app-primary)]" />
                          ) : null}
                        </DropdownMenuItem>
                      )
                    })}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            )
          })}

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
            className="max-h-[72vh] w-72 overflow-y-auto rounded-[1.35rem] border-[var(--app-divider)] bg-[var(--app-surface)]/95 p-2 shadow-[0_24px_70px_-28px_rgba(15,23,42,.5)] backdrop-blur-xl"
          >
            {primaryRoutes.map((route) => {
              const Icon = route.icon ?? LayoutDashboard
              return (
                <DropdownMenuItem
                  key={route.id}
                  onClick={() => go(route.path)}
                  className="min-h-11 rounded-xl font-bold"
                >
                  <span className="grid size-8 place-items-center rounded-lg bg-[var(--app-primary-soft)] text-[var(--app-primary)]">
                    <Icon className="size-4" />
                  </span>
                  {route.label}
                </DropdownMenuItem>
              )
            })}
            {groups.map(({ group, label, routes }) => {
              const GroupIcon = groupPresentation[group].icon
              return (
                <DropdownMenuSub key={group}>
                  <DropdownMenuSubTrigger className="min-h-12 rounded-xl font-bold hover:bg-[var(--app-primary-soft)]">
                    <span className="grid size-8 place-items-center rounded-lg bg-[var(--app-primary-soft)] text-[var(--app-primary)]">
                      <GroupIcon className="size-4" />
                    </span>
                    {label}
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent
                    dir="rtl"
                    className="w-72 rounded-[1.35rem] border-[var(--app-divider)] bg-[var(--app-surface)]/95 p-2 shadow-[0_20px_60px_-24px_rgba(15,23,42,.45)] backdrop-blur-xl"
                  >
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
                            "min-h-14 gap-3 rounded-xl border border-transparent p-2",
                            routeActive
                              ? "border-[var(--app-primary)]/20 bg-[var(--app-primary-soft)]"
                              : "hover:bg-[var(--app-background)]",
                          ].join(" ")}
                        >
                          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[var(--app-background)] text-[var(--app-primary)] ring-1 ring-[var(--app-divider)]">
                            <Icon className="size-4" />
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate text-xs font-bold">
                              {route.label}
                            </span>
                            <span className="mt-0.5 block truncate text-[10px] text-[var(--app-text-secondary)]">
                              {routeHints[route.id] || "ورود به این بخش"}
                            </span>
                          </span>
                        </DropdownMenuItem>
                      )
                    })}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              )
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  )
}
