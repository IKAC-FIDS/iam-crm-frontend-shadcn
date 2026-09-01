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
  Gauge,
  History,
  KeyRound,
  LayoutDashboard,
  ListChecks,
  Settings2,
  ShieldCheck,
  Users,
  UserRound,
  Rocket,
  FileText,
  FolderOpen,
  Gavel,
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

const technicalAny = (permissions: readonly string[]) =>
  ({ type: "permissions", mode: "any", permissions }) as const

export const technicalCenterAccess: RouteAccessPolicy = technicalAny([
  "technical-release:view", "technical-knowledge:view", "technical-document:view",
  "technical-resource:view", "technical-tender:view",
])

const any = (permissions: readonly string[]) =>
  ({ type: "permissions", mode: "any", permissions }) as const

export const technicalCenterRoutes: readonly AppMenuRoute[] = [
  { id: "technical-releases", path: "/technical/releases", label: uiText.technicalCenter.releases.title, group: "technical", order: 150, icon: Rocket, access: technicalAny(["technical-release:view"]) },
  { id: "technical-knowledge-base", path: "/technical/knowledge-base", label: uiText.technicalCenter.knowledgeBase.title, group: "technical", order: 160, icon: BookOpen, access: technicalAny(["technical-knowledge:view"]) },
  { id: "technical-tenders", path: "/technical/tenders", label: uiText.technicalCenter.tenders.title, group: "technical", order: 170, icon: Gavel, access: technicalAny(["technical-tender:view"]) },
  { id: "technical-documents", path: "/technical/documents", label: uiText.technicalCenter.documents.title, group: "technical", order: 180, icon: FileText, access: technicalAny(["technical-document:view"]) },
  { id: "technical-resources", path: "/technical/resources", label: uiText.technicalCenter.resources.title, group: "technical", order: 190, icon: FolderOpen, access: technicalAny(["technical-resource:view"]) },
]

export const appMenuRoutes: readonly AppMenuRoute[] = [
  ...technicalCenterRoutes,
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
    id: "tasks",
    path: "/tasks",
    label: navText.tasks,
    group: "operations",
    order: 10,
    icon: ListChecks,
    access: any(["task:view"]),
  },
  {
    id: "meetings",
    path: "/meetings",
    label: navText.meetings,
    group: "operations",
    order: 20,
    icon: CalendarDays,
    access: any(["meeting:view"]),
  },
  {
    id: "follow-ups",
    path: "/follow-ups",
    label: navText.followUps,
    group: "operations",
    order: 40,
    icon: Bell,
    access: any(["follow-up:view", "activity:view"]),
  },
  {
    id: "notifications",
    path: "/notifications",
    label: navText.notifications,
    group: "operations",
    order: 50,
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
    group: "operations",
    order: 30,
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
    access: {
      type: "permissions",
      mode: "all",
      permissions: ["exchange-rate:view", "financial:view"],
    },
  },
  {
    id: "admin-permissions",
    path: "/admin/permissions",
    label: navText.rolesAndPermissions,
    group: "management",
    order: 260,
    icon: ShieldCheck,
    access: any(["permission:view", "permission:manage", "role:view", "role:manage"]),
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
  "operations",
  "technical",
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
