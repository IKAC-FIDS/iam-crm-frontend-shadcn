import { describe, expect, it } from "vitest"

import type { AuthUser } from "@/store/authStore"
import { getVisibleMenuGroups } from "./routeNavigation"
import { isMenuRouteActive } from "./routeNavigation"

function user(permissions: string[]) {
  return { id: "user-1", permissions } as AuthUser
}

describe("operations navigation", () => {
  it("keeps each operational route under the permission-aware Operations group", () => {
    const operations = getVisibleMenuGroups(
      user(["task:view", "activity:view", "meeting:view", "notification:view"])
    ).find((item) => item.group === "operations")

    expect(operations?.routes.map((route) => [route.id, route.path])).toEqual([
      ["tasks", "/tasks"],
      ["meetings", "/meetings"],
      ["activities", "/activities"],
      ["follow-ups", "/follow-ups"],
      ["notifications", "/notifications"],
    ])
  })

  it("shows Operations for one visible child and hides it for none", () => {
    expect(
      getVisibleMenuGroups(user(["task:view"])).some(
        (item) => item.group === "operations"
      )
    ).toBe(true)
    expect(
      getVisibleMenuGroups(user(["company:view"])).some(
        (item) => item.group === "operations"
      )
    ).toBe(false)
  })

  it("keeps the compatibility attention route out of navigation", () => {
    const ids = getVisibleMenuGroups(
      user(["activity:view", "notification:view"])
    ).flatMap((item) => item.routes.map((route) => route.id))

    expect(ids).not.toContain("attention")
  })

  it("keeps the unified technical library active on its legacy child routes", () => {
    expect(isMenuRouteActive("/technical/library", "/technical/resources/r1")).toBe(true)
    expect(isMenuRouteActive("/technical/library", "/technical/documents/d1")).toBe(true)
    expect(isMenuRouteActive("/technical/library", "/technical/releases/v1")).toBe(true)
  })
})
