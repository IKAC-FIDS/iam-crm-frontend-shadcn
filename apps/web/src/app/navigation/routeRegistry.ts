import type { LucideIcon } from "lucide-react"
import {
  Activity,
  Bell,
  BookOpen,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  ChartNoAxesCombined,
  CircleDollarSign,
  ClipboardCheck,
  Gauge,
  History,
  KeyRound,
  LayoutDashboard,
  ListChecks,
  Settings2,
  ShieldCheck,
  Users,
  UserRound,
  Workflow,
} from "lucide-react"

import { uiText } from "@/config/uiText"

const navText = uiText.navigation

export type RouteAccessPolicy =
  | { type: "authenticated" }
  | {
      type: "permissions"
      mode: "any" | "all"
      permissions: readonly string[]
    }

export type NavigationGroupKey = keyof typeof uiText.navigation.groups

export interface AppMenuRoute {
  id: string
  path: string
  label: string
  group: NavigationGroupKey | null
  order: number
  icon: LucideIcon
  access: RouteAccessPolicy
}

const authenticated = { type: "authenticated" } as const

const any = (permissions: readonly string[]) =>
  ({ type: "permissions", mode: "any", permissions }) as const

export const appMenuRoutes: readonly AppMenuRoute[] = [
  {
    id: "dashboard",
    path: "/dashboard",
    label: navText.dashboard,
    group: null,
    order: 10,
    icon: LayoutDashboard,
    access: authenticated,
  },

  {
    id: "companies",
    path: "/companies",
    label: navText.companies,
    group: "sales",
    order: 20,
    icon: Building2,
    access: any(["company:view"]),
  },
  {
    id: "opportunities",
    path: "/opportunities",
    label: navText.opportunities,
    group: "sales",
    order: 30,
    icon: BriefcaseBusiness,
    access: any(["opportunity:view"]),
  },
  {
    id: "pipeline",
    path: "/pipeline",
    label: navText.pipeline,
    group: "sales",
    order: 40,
    icon: Workflow,
    access: any(["opportunity:view"]),
  },
  {
    id: "tasks",
    path: "/tasks",
    label: navText.tasks,
    group: "sales",
    order: 50,
    icon: ListChecks,
    access: any(["task:view"]),
  },
  {
    id: "meetings",
    path: "/meetings",
    label: navText.meetings,
    group: "sales",
    order: 60,
    icon: CalendarDays,
    access: any(["meeting:view"]),
  },
  {
    id: "follow-ups",
    path: "/follow-ups",
    label: navText.followUps,
    group: "sales",
    order: 70,
    icon: ClipboardCheck,
    access: any(["follow-up:view", "activity:view"]),
  },
  {
    id: "notifications",
    path: "/notifications",
    label: navText.notifications,
    group: "sales",
    order: 80,
    icon: Bell,
    access: any(["notification:view"]),
  },
  {
    id: "people",
    path: "/people",
    label: navText.people,
    group: "sales",
    order: 90,
    icon: UserRound,
    access: any(["people:directory:view"]),
  },
  {
    id: "activities",
    path: "/activities",
    label: navText.activities,
    group: "sales",
    order: 100,
    icon: Activity,
    access: any(["activity:view"]),
  },
  {
    id: "reports",
    path: "/reports",
    label: navText.reports,
    group: "sales",
    order: 110,
    icon: ChartNoAxesCombined,
    access: any(["report:view"]),
  },

  {
    id: "admin-users",
    path: "/admin/users",
    label: navText.users,
    group: "management",
    order: 210,
    icon: Users,
    access: any(["user:view"]),
  },
  {
    id: "admin-teams",
    path: "/admin/teams",
    label: navText.teams,
    group: "management",
    order: 220,
    icon: Users,
    access: any(["team:view", "team:manage"]),
  },
  {
    id: "admin-exchange-rates",
    path: "/admin/exchange-rates",
    label: navText.exchangeRates,
    group: "management",
    order: 230,
    icon: CircleDollarSign,
    access: any(["exchange-rate:view"]),
  },
  {
    id: "admin-permissions",
    path: "/admin/permissions",
    label: navText.rolesAndPermissions,
    group: "management",
    order: 260,
    icon: ShieldCheck,
    access: any(["permission:view", "role:view"]),
  },
  {
    id: "admin-libraries",
    path: "/admin/libraries",
    label: navText.libraries,
    group: "management",
    order: 270,
    icon: BookOpen,
    access: any([
      "library:industry:view",
      "library:industry:manage",
      "library:pain-point:view",
      "library:pain-point:manage",
      "library:use-case:view",
      "library:use-case:manage",
      "library:persona:view",
      "library:persona:manage",
      "library:lead-source:view",
      "library:lead-source:manage",
      "lookup:view",
      "lookup:manage",
      "library:university:view",
      "library:university:manage",
      "product:view",
      "product:manage",
    ]),
  },
  {
    id: "admin-pipeline",
    path: "/admin/pipeline",
    label: navText.pipelineSettings,
    group: "management",
    order: 280,
    icon: Settings2,
    access: any([
      "pipeline:config:view",
      "pipeline:config:manage",
      "pipeline:transition:view",
      "pipeline:transition:manage",
    ]),
  },
  {
    id: "admin-audit-logs",
    path: "/admin/audit-logs",
    label: navText.auditLogs,
    group: "management",
    order: 290,
    icon: History,
    access: any(["audit-log:view"]),
  },

  {
    id: "account-security",
    path: "/account/security",
    label: navText.accountSecurity,
    group: "account",
    order: 310,
    icon: KeyRound,
    access: authenticated,
  },
  {
    id: "account-usage",
    path: "/account/usage",
    label: navText.usageAndQuota,
    group: "account",
    order: 320,
    icon: Gauge,
    access: authenticated,
  },
] as const

export const navigationGroups: readonly NavigationGroupKey[] = [
  "sales",
  "management",
  "account",
]

export function getNavigationGroupLabel(group: NavigationGroupKey) {
  return uiText.navigation.groups[group]
}

export function getRouteByPath(pathname: string) {
  return [...appMenuRoutes]
    .sort((left, right) => right.path.length - left.path.length)
    .find(
      (route) =>
        pathname === route.path ||
        (route.path !== "/dashboard" &&
          pathname.startsWith(`${route.path}/`)),
    )
}
