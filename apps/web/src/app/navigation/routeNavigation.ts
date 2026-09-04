import type { AuthUser } from "@/store/authStore"
import { uiText } from "@/config/uiText"
import { canAccessRoute } from "./routeAccess"
import {
  appMenuRoutes,
  getNavigationGroupLabel,
  getRouteByPath,
  navigationGroups,
} from "./routeRegistry"

export function getVisibleMenuRoutes(user: AuthUser | null | undefined) {
  return appMenuRoutes
    .filter((route) => canAccessRoute(user, route.access))
    .filter((route) => route.showInNavigation !== false)
    .sort((left, right) => left.order - right.order)
}

export function getVisibleTopLevelRoutes(user: AuthUser | null | undefined) {
  return getVisibleMenuRoutes(user).filter((route) => route.group === null)
}

export function getVisibleMenuGroups(user: AuthUser | null | undefined) {
  const routes = getVisibleMenuRoutes(user)

  return navigationGroups
    .map((group) => ({
      group,
      label: getNavigationGroupLabel(group),
      routes: routes.filter((route) => route.group === group),
    }))
    .filter((entry) => entry.routes.length > 0)
}

export function isMenuRouteActive(routePath: string, pathname: string) {
  if (
    routePath === "/technical/library" &&
    ["/technical/releases", "/technical/documents", "/technical/resources"].some(
      (path) => pathname === path || pathname.startsWith(`${path}/`)
    )
  )
    return true
  return (
    pathname === routePath ||
    (routePath !== "/dashboard" && pathname.startsWith(`${routePath}/`))
  )
}

export interface AppBreadcrumb {
  label: string
  to?: string
}

export function getRoutePresentation(pathname: string) {
  if (pathname === "/account/profile") {
    return {
      title: uiText.common.profile,
      breadcrumbs: [
        { label: uiText.common.home, to: "/dashboard" },
        { label: uiText.navigation.groups.account },
        { label: uiText.common.profile },
      ] as AppBreadcrumb[],
    }
  }

  const route = getRouteByPath(pathname)

  if (!route) {
    return {
      title: uiText.navigation.dashboard,
      breadcrumbs: [
        { label: uiText.common.home, to: "/dashboard" },
      ] as AppBreadcrumb[],
    }
  }

  if (route.path === "/dashboard") {
    return {
      title: route.label,
      breadcrumbs: [
        { label: uiText.navigation.dashboard },
      ] as AppBreadcrumb[],
    }
  }

  const groupLabel = route.group
    ? getNavigationGroupLabel(route.group)
    : uiText.common.home

  return {
    title: route.label,
    breadcrumbs: [
      { label: uiText.common.home, to: "/dashboard" },
      { label: groupLabel },
      { label: route.label },
    ] as AppBreadcrumb[],
  }
}
