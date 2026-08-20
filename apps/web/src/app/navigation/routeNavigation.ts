import type { AuthUser } from "@/store/authStore"
import { canAccessRoute } from "./routeAccess"
import { appMenuRoutes, getRouteByPath, navigationGroups } from "./routeRegistry"

export function getVisibleMenuRoutes(user: AuthUser | null | undefined) {
  return appMenuRoutes.filter((route) => canAccessRoute(user, route.access)).sort((a, b) => a.order - b.order)
}

export function getVisibleMenuGroups(user: AuthUser | null | undefined) {
  const routes = getVisibleMenuRoutes(user)
  return navigationGroups.map((group) => ({ group, routes: routes.filter((route) => route.group === group) })).filter((entry) => entry.routes.length > 0)
}

export function isMenuRouteActive(routePath: string, pathname: string) {
  return pathname === routePath || (routePath !== "/dashboard" && pathname.startsWith(`${routePath}/`))
}

export interface AppBreadcrumb { label: string; to?: string }

export function getRoutePresentation(pathname: string) {
  const route = getRouteByPath(pathname)
  if (!route) return { title: "داشبورد", breadcrumbs: [{ label: "خانه", to: "/dashboard" }] as AppBreadcrumb[] }
  if (route.path === "/dashboard") return { title: route.label, breadcrumbs: [{ label: "داشبورد" }] as AppBreadcrumb[] }
  return { title: route.label, breadcrumbs: [{ label: "خانه", to: "/dashboard" }, { label: route.group }, { label: route.label }] as AppBreadcrumb[] }
}
