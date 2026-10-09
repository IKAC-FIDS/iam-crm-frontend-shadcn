import type { ReactNode } from "react"
import type { RouteObject } from "react-router-dom"
import { appMenuRoutes } from "@/app/navigation/routeRegistry"
import { PermissionRoute } from "../PermissionRoute"

export function routeGroup(
  id: string,
  element: ReactNode,
  extra: RouteObject[] = []
): RouteObject {
  const route = appMenuRoutes.find((item) => item.id === id)
  if (!route) throw new Error(`Missing route registry entry: ${id}`)
  return {
    element: <PermissionRoute policy={route.access} />,
    children: [{ path: route.path, element }, ...extra],
  }
}
