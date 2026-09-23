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
import { useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"

import { Button } from "@workspace/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
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
import type { AppMenuRoute } from "@/app/navigation/routeRegistry"
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
    description: "فروش، کارها، جلسات، پیگیری‌ها و مرکز فنی",
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
  "admin-email-settings": "SMTP، فرستنده و ارسال آزمایشی",
  "admin-audit-logs": "ردیابی تغییرات و رویدادها",
  "admin-timesheets": "بررسی و تأیید کارکرد اعضای تیم",
  "admin-timesheet-reports": "گزارش تجمیعی عملکرد کارکنان",
  "admin-work-schedules": "تنظیم ساعات و روزهای کاری سازمان",
  "admin-notifications": "قالب‌ها، قوانین و کانال‌های اعلان",
  "account-security": "رمز عبور، Passkey و نشست‌ها",
  "account-usage": "مصرف منابع و سهمیه‌ها",
}

const unifiedWorkspaceLabel = "عملیات و مدیریت"

const workspaceSections = [
  {
    id: "sales",
    label: "فروش و ارتباط با مشتری",
    routeIds: ["companies", "opportunities", "people", "activities", "reports"],
  },
  {
    id: "planning",
    label: "برنامه‌ریزی و پیگیری",
    routeIds: ["tasks", "meetings", "follow-ups", "notifications"],
  },
  {
    id: "technical",
    label: "مرکز فنی",
    routeIds: ["technical-library", "technical-knowledge-base", "technical-tenders"],
  },
  {
    id: "workforce",
    label: "کارکرد و منابع انسانی",
    routeIds: ["admin-timesheets", "admin-timesheet-reports", "admin-work-schedules"],
  },
  {
    id: "organization",
    label: "سازمان و دسترسی‌ها",
    routeIds: ["admin-users", "admin-teams", "admin-permissions", "admin-audit-logs"],
  },
  {
    id: "configuration",
    label: "تنظیمات و داده‌های پایه",
    routeIds: ["admin-libraries", "admin-pipeline", "admin-exchange-rates", "admin-notifications"],
  },
] as const

function mergeWorkspaceGroups(
  groups: ReturnType<typeof getVisibleMenuGroups>
) {
  const workspaceRoutes = groups
    .filter(({ group }) => group === "operations" || group === "management")
    .flatMap(({ routes }) => routes)
  const remainingGroups = groups.filter(
    ({ group }) => group !== "operations" && group !== "management"
  )

  return workspaceRoutes.length > 0
    ? [
        {
          group: "operations" as const,
          label: unifiedWorkspaceLabel,
          routes: workspaceRoutes,
        },
        ...remainingGroups,
      ]
    : remainingGroups
}

function getRouteSections(group: NavigationGroupKey, routes: AppMenuRoute[]) {
  if (group !== "operations") {
    return [{ id: group, label: null, routes }]
  }

  const assignedIds = new Set<string>(
    workspaceSections.flatMap(({ routeIds }) => routeIds)
  )
  const sections = workspaceSections
    .map((section) => ({
      id: section.id,
      label: section.label,
      routes: section.routeIds
        .map((routeId) => routes.find(({ id }) => id === routeId))
        .filter((route): route is AppMenuRoute => Boolean(route)),
    }))
    .filter(({ routes: sectionRoutes }) => sectionRoutes.length > 0)
  const uncategorizedRoutes = routes.filter(({ id }) => !assignedIds.has(id))

  return uncategorizedRoutes.length > 0
    ? [...sections, { id: "other", label: "سایر بخش‌ها", routes: uncategorizedRoutes }]
    : sections
}

export function AppTopNavigation() {
  const user = useAuthStore((state) => state.user)
  const location = useLocation()
  const navigate = useNavigate()
  const [activeWorkspaceSectionId, setActiveWorkspaceSectionId] = useState<
    string | null
  >(null)
  const groups = mergeWorkspaceGroups(getVisibleMenuGroups(user))
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
            const sections = getRouteSections(group, [...routes])
            const selectedSection =
              sections.find(({ id }) => id === activeWorkspaceSectionId) ??
              sections.find(({ routes: sectionRoutes }) =>
                sectionRoutes.some((route) =>
                  isMenuRouteActive(route.path, location.pathname)
                )
              ) ??
              sections[0]
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
                  className={[
                    "overflow-hidden rounded-[1.35rem] border-[var(--app-divider)] bg-[var(--app-surface)]/98 p-0 shadow-[0_30px_90px_-30px_rgba(15,23,42,.6)] backdrop-blur-2xl",
                    group === "operations"
                      ? "w-[min(94vw,800px)]"
                      : "w-[min(94vw,380px)]",
                  ].join(" ")}
                >
                  <div className="relative overflow-hidden border-b border-[var(--app-divider)] px-4 py-3.5">
                    <div className="pointer-events-none absolute inset-y-0 end-0 w-48 bg-[radial-gradient(circle_at_right,var(--app-primary-soft),transparent_72%)]" />
                    <div className="relative flex items-center gap-3">
                      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[var(--app-primary)] text-[var(--app-on-primary)] shadow-[var(--app-shadow-brand)]">
                        <GroupIcon className="size-[1.125rem]" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <h2 className="text-sm font-black text-[var(--app-heading)]">
                          {label}
                        </h2>
                        <p className="mt-0.5 text-[10px] leading-4 text-[var(--app-text-secondary)]">
                          {presentation.description}
                        </p>
                      </div>
                      <span className="rounded-full bg-[var(--app-primary-soft)] px-2.5 py-1 text-[10px] font-black text-[var(--app-primary)]">
                        {routes.length.toLocaleString("fa-IR")} بخش
                      </span>
                    </div>
                  </div>
                  {group === "operations" && selectedSection ? (
                    <div className="grid min-h-[330px] grid-cols-[190px_minmax(0,1fr)]">
                      <aside className="border-e border-[var(--app-divider)] bg-[var(--app-background)]/55 p-2.5">
                        <p className="px-2 pb-2 pt-1 text-[9px] font-black tracking-wide text-[var(--app-text-secondary)]">
                          دسته‌بندی بخش‌ها
                        </p>
                        <div className="space-y-1">
                          {sections.map((section) => {
                            const sectionActive = section.id === selectedSection.id
                            return (
                              <button
                                key={section.id}
                                type="button"
                                onClick={() => setActiveWorkspaceSectionId(section.id)}
                                onMouseEnter={() => setActiveWorkspaceSectionId(section.id)}
                                onFocus={() => setActiveWorkspaceSectionId(section.id)}
                                className={[
                                  "flex min-h-11 w-full items-center gap-2 rounded-xl px-2.5 text-start text-[11px] font-bold transition-colors",
                                  sectionActive
                                    ? "bg-[var(--app-primary)] text-[var(--app-on-primary)] shadow-[var(--app-shadow-brand)]"
                                    : "text-[var(--app-text-secondary)] hover:bg-[var(--app-surface)] hover:text-[var(--app-heading)]",
                                ].join(" ")}
                                aria-pressed={sectionActive}
                              >
                                <span
                                  className={[
                                    "size-1.5 rounded-full",
                                    sectionActive
                                      ? "bg-[var(--app-on-primary)]"
                                      : "bg-[var(--app-primary)]",
                                  ].join(" ")}
                                />
                                <span className="min-w-0 flex-1 truncate">
                                  {section.label}
                                </span>
                                <span
                                  className={[
                                    "rounded-md px-1.5 py-0.5 text-[9px]",
                                    sectionActive
                                      ? "bg-white/15 text-current"
                                      : "bg-[var(--app-surface)] text-[var(--app-text-secondary)]",
                                  ].join(" ")}
                                >
                                  {section.routes.length.toLocaleString("fa-IR")}
                                </span>
                              </button>
                            )
                          })}
                        </div>
                      </aside>
                      <section
                        className="min-w-0 p-4"
                        aria-label={selectedSection.label ?? label}
                      >
                        <div className="mb-3 flex items-center justify-between gap-3">
                          <div>
                            <h3 className="text-sm font-black text-[var(--app-heading)]">
                              {selectedSection.label}
                            </h3>
                            <p className="mt-0.5 text-[10px] text-[var(--app-text-secondary)]">
                              بخش موردنظر را برای ادامه انتخاب کنید
                            </p>
                          </div>
                          <span className="h-px min-w-10 flex-1 bg-[var(--app-divider)]" />
                        </div>
                        <div className="grid gap-1.5 sm:grid-cols-2">
                          {selectedSection.routes.map((route) => {
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
                                  "group relative min-h-16 cursor-pointer items-center gap-3 overflow-hidden rounded-xl border border-transparent px-2.5 py-2 transition-colors",
                                  routeActive
                                    ? "border-[var(--app-primary)]/15 bg-[var(--app-primary-soft)] text-[var(--app-on-primary-container)]"
                                    : "hover:bg-[var(--app-background)]/70",
                                ].join(" ")}
                              >
                                <span
                                  className={[
                                    "grid size-9 shrink-0 place-items-center rounded-xl transition-colors",
                                    routeActive
                                      ? "bg-[var(--app-primary)] text-[var(--app-on-primary)]"
                                      : "bg-[var(--app-primary-soft)] text-[var(--app-primary)] group-hover:bg-[var(--app-surface)]",
                                  ].join(" ")}
                                >
                                  <Icon className="size-4" />
                                </span>
                                <span className="min-w-0 flex-1">
                                  <span className="block truncate text-[11px] font-black">
                                    {route.label}
                                  </span>
                                  <span className="mt-0.5 block truncate text-[9px] font-normal text-[var(--app-text-secondary)]">
                                    {routeHints[route.id] || "ورود به این بخش"}
                                  </span>
                                </span>
                                <span className="text-[var(--app-icon-muted)] transition group-hover:text-[var(--app-primary)]">
                                  <ArrowUpLeft className="size-3" />
                                </span>
                                {routeActive ? (
                                  <span className="absolute end-0 top-2 h-12 w-0.5 rounded-s-full bg-[var(--app-primary)]" />
                                ) : null}
                              </DropdownMenuItem>
                            )
                          })}
                        </div>
                      </section>
                    </div>
                  ) : (
                    <div className="grid gap-1 p-2.5">
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
                              "min-h-14 cursor-pointer gap-3 rounded-xl px-3",
                              routeActive
                                ? "bg-[var(--app-primary-soft)] text-[var(--app-on-primary-container)]"
                                : "hover:bg-[var(--app-background)]",
                            ].join(" ")}
                          >
                            <span className="grid size-9 place-items-center rounded-xl bg-[var(--app-primary-soft)] text-[var(--app-primary)]">
                              <Icon className="size-4" />
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-[11px] font-black">
                                {route.label}
                              </span>
                              <span className="mt-0.5 block truncate text-[9px] text-[var(--app-text-secondary)]">
                                {routeHints[route.id] || "ورود به این بخش"}
                              </span>
                            </span>
                            <ArrowUpLeft className="size-3 text-[var(--app-icon-muted)]" />
                          </DropdownMenuItem>
                        )
                      })}
                    </div>
                  )}
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
              const sections = getRouteSections(group, [...routes])
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
                    {sections.map((section) => (
                      <div key={section.id}>
                        {section.label ? (
                          <DropdownMenuLabel className="px-2 pb-1 pt-3 text-[10px] font-black text-[var(--app-text-secondary)] first:pt-1">
                            {section.label}
                          </DropdownMenuLabel>
                        ) : null}
                    {section.routes.map((route) => {
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
                      </div>
                    ))}
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
