import { expect, it } from "vitest"

import { user } from "@/test/fixtures"

import { getNavigationItems } from "./navigationConfig"

it("builds navigation from authorized registry routes and preserves workspace groups", () => {
  const items = getNavigationItems({
    ...user,
    permissions: ["company:view", "meeting:view", "user:view", "timesheet:view"],
  })
  const workspace = items.find((item) => item.id === "workspace")
  const account = items.find((item) => item.id === "account")

  expect(items.find((item) => item.id === "dashboard")?.kind).toBe("link")
  expect(workspace?.kind).toBe("flyout")
  expect(account?.kind).toBe("flyout")

  if (workspace?.kind !== "flyout") throw new Error("workspace flyout missing")
  const routeIds = workspace.sections.flatMap((section) => section.routes.map((route) => route.id))
  expect(routeIds).toEqual(expect.arrayContaining(["companies", "meetings", "admin-users"]))
  expect(routeIds).not.toContain("admin-permissions")
})
