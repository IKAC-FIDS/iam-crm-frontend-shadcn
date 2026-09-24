import type { LucideIcon } from "lucide-react"
import { CircleUserRound, LayoutDashboard, ListChecks } from "lucide-react"

import type { AuthUser } from "@/store/authStore"

import { getVisibleMenuRoutes } from "./routeNavigation"
import type { AppMenuRoute } from "./routeRegistry"

export interface NavigationSection {
  id: string
  label: string
  routes: NavigationDestination[]
}

export interface NavigationQuickAction {
  id: string
  label: string
  href: string
  icon?: LucideIcon
  requiredPermissions?: readonly string[]
}

export interface NavigationDestination extends AppMenuRoute {
  description: string
  badge?: string | number
  disabled?: boolean
  quickActions?: readonly NavigationQuickAction[]
}

export interface NavigationLinkItem {
  id: string
  kind: "link"
  label: string
  description: string
  icon: LucideIcon
  route: NavigationDestination
}

export interface NavigationFlyoutItem {
  id: string
  kind: "flyout"
  label: string
  description: string
  icon: LucideIcon
  sections: NavigationSection[]
}

export type NavigationItem = NavigationLinkItem | NavigationFlyoutItem

const routeDescriptions: Record<string, string> = {
  "crm-assistant": "پرسش و تحلیل امن اطلاعات CRM",
  companies: "مدیریت حساب‌های مشتری",
  opportunities: "پیگیری چرخه و مراحل فروش",
  tasks: "اقدام‌ها و کارهای روزانه",
  meetings: "برنامه‌ریزی و مدیریت جلسات",
  "follow-ups": "پیگیری اقدام‌های زمان‌بندی‌شده",
  notifications: "اعلان‌ها و رویدادهای مهم",
  people: "مخاطبان و افراد سازمانی",
  activities: "تاریخچه تعاملات مشتری",
  reports: "شاخص‌ها و گزارش‌های فروش",
  "technical-library": "نسخه‌ها، اسناد، فایل‌ها و لینک‌های فنی",
  "technical-knowledge-base": "مقالات و دانش قابل استفاده مجدد",
  "technical-tenders": "فرایند فنی و تجاری مناقصه",
  "admin-users": "کاربران و وضعیت دسترسی",
  "admin-teams": "ساختار و اعضای تیم‌ها",
  "admin-exchange-rates": "نرخ‌های ارز سازمان",
  "admin-permissions": "نقش‌ها و مجوزها",
  "admin-libraries": "داده‌های مرجع سامانه",
  "admin-pipeline": "مراحل و قوانین انتقال",
  "admin-audit-logs": "ردیابی تغییرات و رویدادها",
  "admin-timesheets": "بررسی و تأیید کارکرد اعضای تیم",
  "admin-timesheet-reports": "گزارش تجمیعی عملکرد کارکنان",
  "admin-work-schedules": "تنظیم ساعات و روزهای کاری سازمان",
  "admin-notifications": "قالب‌ها، قوانین و کانال‌های اعلان",
  "account-timesheets": "ثبت و مشاهده ساعات کاری",
  "account-leave": "درخواست‌ها و سوابق مرخصی",
  "account-security": "رمز عبور، Passkey و نشست‌ها",
  "account-usage": "مصرف منابع و سهمیه‌ها",
}

const workspaceSections = [
  { id: "sales", label: "فروش و ارتباط با مشتری", routeIds: ["companies", "opportunities", "people", "activities", "reports"] },
  { id: "planning", label: "برنامه‌ریزی و پیگیری", routeIds: ["tasks", "meetings", "follow-ups", "notifications"] },
  { id: "technical", label: "مرکز فنی", routeIds: ["technical-library", "technical-knowledge-base", "technical-tenders"] },
  { id: "workforce", label: "کارکرد و منابع انسانی", routeIds: ["admin-timesheets", "admin-timesheet-reports", "admin-work-schedules"] },
  { id: "organization", label: "سازمان و دسترسی‌ها", routeIds: ["admin-users", "admin-teams", "admin-permissions", "admin-audit-logs"] },
  { id: "configuration", label: "تنظیمات و داده‌های پایه", routeIds: ["admin-libraries", "admin-pipeline", "admin-exchange-rates", "admin-notifications"] },
] as const

export function getNavigationRouteDescription(routeId: string) {
  return routeDescriptions[routeId] ?? "ورود به این بخش"
}

function withPresentation(route: AppMenuRoute): NavigationDestination {
  return { ...route, description: getNavigationRouteDescription(route.id) }
}

function createSections(routes: AppMenuRoute[]) {
  const assignedIds = new Set(workspaceSections.flatMap((section) => section.routeIds))
  const sections = workspaceSections
    .map((section) => ({
      id: section.id,
      label: section.label,
      routes: section.routeIds
        .map((id) => routes.find((route) => route.id === id))
        .filter((route): route is AppMenuRoute => Boolean(route)),
    }))
    .filter((section) => section.routes.length > 0)
  const otherRoutes = routes.filter((route) => !assignedIds.has(route.id as never))

  return otherRoutes.length
    ? [...sections, { id: "other", label: "سایر بخش‌ها", routes: otherRoutes }]
        .map((section) => ({ ...section, routes: section.routes.map(withPresentation) }))
    : sections.map((section) => ({ ...section, routes: section.routes.map(withPresentation) }))
}

export function getNavigationItems(user: AuthUser | null | undefined): NavigationItem[] {
  const routes = getVisibleMenuRoutes(user)
  const topLevelRoutes = routes.filter((route) => route.group === null)
  const workspaceRoutes = routes.filter(
    (route) => route.group === "operations" || route.group === "management",
  )
  const accountRoutes = routes.filter((route) => route.group === "account")
  const items: NavigationItem[] = topLevelRoutes.map((route) => ({
    id: route.id,
    kind: "link",
    label: route.label,
    description: getNavigationRouteDescription(route.id),
    icon: route.icon ?? LayoutDashboard,
    route: withPresentation(route),
  }))

  if (workspaceRoutes.length) {
    items.push({
      id: "workspace",
      kind: "flyout",
      label: "عملیات و مدیریت",
      description: "فروش، پیگیری، مرکز فنی و مدیریت سازمان",
      icon: ListChecks,
      sections: createSections(workspaceRoutes),
    })
  }

  if (accountRoutes.length) {
    items.push({
      id: "account",
      kind: "flyout",
      label: "حساب کاربری",
      description: "کارکرد، مرخصی، امنیت و تنظیمات شخصی",
      icon: CircleUserRound,
      sections: [{ id: "account", label: "حساب کاربری", routes: accountRoutes.map(withPresentation) }],
    })
  }

  return items
}
