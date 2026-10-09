import { describe, expect, it } from "vitest"
import { isValidElement } from "react"
import type { RouteObject } from "react-router-dom"
import {
  appMenuRoutes,
  type RouteAccessPolicy,
} from "@/app/navigation/routeRegistry"
import { coreRoutes } from "./routes/coreRoutes"
import { salesRoutes } from "./routes/salesRoutes"
import { adminRoutes } from "./routes/adminRoutes"
import { accountRoutes } from "./routes/accountRoutes"
import { technicalRoutes } from "./routes/technicalRoutes"
import { publicRoutes } from "./routes/publicRoutes"

const groups = [
  ...coreRoutes,
  ...salesRoutes,
  ...adminRoutes,
  ...accountRoutes,
  ...technicalRoutes,
]
function paths(routes: RouteObject[]): string[] {
  return routes.flatMap((route) => [
    ...(route.path ? [route.path] : []),
    ...paths(route.children ?? []),
  ])
}
describe("routing manifest", () => {
  it("registers each menu route exactly once with the identical policy object", () => {
    const registered = paths(groups)
    expect(new Set(registered).size).toBe(registered.length)
    for (const route of appMenuRoutes) {
      expect(registered.filter((path) => path === route.path)).toHaveLength(1)
      const group = groups.find((item) =>
        item.children?.some((child) => child.path === route.path)
      )!
      expect(
        isValidElement<{ policy: RouteAccessPolicy }>(group.element) &&
          group.element.props.policy
      ).toBe(route.access)
    }
  })
  it("preserves detail paths and compatibility redirects", () => {
    expect(paths(groups)).toEqual(
      expect.arrayContaining([
        "/companies/:companyId",
        "/opportunities/:id",
        "/tasks/:id",
        "/meetings/:id",
        "/admin/users/:userId",
        "/admin/teams/:teamId",
        "/pipeline",
        "/follow-ups",
        "/notifications",
        "/account/profile",
      ])
    )
    expect(paths(publicRoutes)).toEqual(["/login", "/", "*"])
  })
})
