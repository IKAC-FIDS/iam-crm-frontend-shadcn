import type { LucideIcon } from "lucide-react"
import { Activity, Bell, BookOpen, BriefcaseBusiness, Building2, CalendarDays, ChartNoAxesCombined, CircleDollarSign, ClipboardCheck, Gauge, History, KeyRound, LayoutDashboard, ListChecks, Settings2, ShieldCheck, Users, UserRound, Workflow } from "lucide-react"
import { uiText } from "@/config/uiText"
const navText = uiText.navigation

export type RouteAccessPolicy =
  | { type: "authenticated" }
  | { type: "permissions"; mode: "any" | "all"; permissions: readonly string[] }

export type NavigationGroup = "عملیات فروش" | "مدیریت" | "حساب"

export interface AppMenuRoute {
  id: string
  path: string
  label: string
  group: NavigationGroup
  order: number
  icon: LucideIcon
  access: RouteAccessPolicy
}

const authenticated = { type: "authenticated" } as const
const any = (permissions: readonly string[]) => ({ type: "permissions", mode: "any", permissions }) as const
const salesGroup = uiText.navigation.groups.sales
const adminGroup = uiText.navigation.groups.management
const accountGroup = uiText.navigation.groups.account

export const appMenuRoutes: readonly AppMenuRoute[] = [
  { id: "dashboard", path: "/dashboard", label: navText.dashboard, group: salesGroup, order: 10, icon: LayoutDashboard, access: authenticated },
  { id: "companies", path: "/companies", label: navText.companies, group: salesGroup, order: 20, icon: Building2, access: any(["company:view"]) },
  { id: "opportunities", path: "/opportunities", label: "فرصت‌ها", group: salesGroup, order: 30, icon: BriefcaseBusiness, access: any(["opportunity:view"]) },
  { id: "pipeline", path: "/pipeline", label: "پایپ‌لاین", group: salesGroup, order: 40, icon: Workflow, access: any(["opportunity:view"]) },
  { id: "tasks", path: "/tasks", label: "کارها", group: salesGroup, order: 50, icon: ListChecks, access: any(["task:view"]) },
  { id: "meetings", path: "/meetings", label: "جلسات", group: salesGroup, order: 60, icon: CalendarDays, access: any(["meeting:view"]) },
  { id: "follow-ups", path: "/follow-ups", label: "پیگیری‌ها", group: salesGroup, order: 70, icon: ClipboardCheck, access: any(["follow-up:view", "activity:view"]) },
  { id: "notifications", path: "/notifications", label: "اعلان‌ها", group: salesGroup, order: 80, icon: Bell, access: any(["notification:view"]) },
  { id: "people", path: "/people", label: "افراد", group: salesGroup, order: 90, icon: UserRound, access: any(["people:directory:view"]) },
  { id: "activities", path: "/activities", label: "فعالیت‌ها", group: salesGroup, order: 100, icon: Activity, access: any(["activity:view"]) },
  { id: "reports", path: "/reports", label: "گزارش‌ها", group: salesGroup, order: 110, icon: ChartNoAxesCombined, access: any(["report:view"]) },
  { id: "admin-users", path: "/admin/users", label: "کاربران", group: "مدیریت", order: 210, icon: Users, access: any(["user:view"]) },
  { id: "admin-teams", path: "/admin/teams", label: "تیم‌ها", group: "مدیریت", order: 220, icon: Users, access: any(["team:view", "team:manage"]) },
  { id: "admin-exchange-rates", path: "/admin/exchange-rates", label: "نرخ دلار", group: adminGroup, order: 230, icon: CircleDollarSign, access: any(["exchange-rate:view"]) },
  { id: "admin-permissions", path: "/admin/permissions", label: "نقش‌ها و مجوزها", group: adminGroup, order: 260, icon: ShieldCheck, access: any(["permission:view", "role:view"]) },
  { id: "admin-libraries", path: "/admin/libraries", label: "کتابخانه‌ها", group: adminGroup, order: 270, icon: BookOpen, access: any(["library:industry:view", "library:industry:manage", "library:pain-point:view", "library:pain-point:manage", "library:use-case:view", "library:use-case:manage", "library:persona:view", "library:persona:manage", "library:lead-source:view", "library:lead-source:manage", "lookup:view", "lookup:manage", "library:university:view", "library:university:manage", "product:view", "product:manage"]) },
  { id: "admin-pipeline", path: "/admin/pipeline", label: "تنظیمات پایپ‌لاین", group: adminGroup, order: 280, icon: Settings2, access: any(["pipeline:config:view", "pipeline:config:manage", "pipeline:transition:view", "pipeline:transition:manage"]) },
  { id: "admin-audit-logs", path: "/admin/audit-logs", label: "رویدادهای ممیزی", group: adminGroup, order: 290, icon: History, access: any(["audit-log:view"]) },
  { id: "account-security", path: "/account/security", label: "امنیت حساب", group: accountGroup, order: 310, icon: KeyRound, access: authenticated },
  { id: "account-usage", path: "/account/usage", label: "مصرف و سهمیه", group: accountGroup, order: 320, icon: Gauge, access: authenticated },
] as const

export const navigationGroups: readonly NavigationGroup[] = [salesGroup, adminGroup, accountGroup]

export function getRouteByPath(pathname: string) {
  return [...appMenuRoutes].sort((a, b) => b.path.length - a.path.length).find((route) => pathname === route.path || (route.path !== "/dashboard" && pathname.startsWith(`${route.path}/`)))
}
