import { beforeEach, describe, expect, it } from "vitest"
import { render, screen } from "@testing-library/react"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { canAccessRoute } from "@/app/navigation/routeAccess"
import {
  appMenuRoutes,
  technicalCenterAccess,
} from "@/app/navigation/routeRegistry"
import { getVisibleMenuRoutes } from "@/app/navigation/routeNavigation"
import { useAuthStore } from "@/store/authStore"
import { user } from "@/test/fixtures"
import { uiText } from "@/config/uiText"
import { PermissionRoute } from "./PermissionRoute"
import { ProtectedRoute } from "./ProtectedRoute"
import { AppErrorPage } from "./AppErrorPage"

beforeEach(() => useAuthStore.getState().clearUser())
describe("route access", () => {
  it("fails closed for guests and supports any/all policies", () => {
    expect(canAccessRoute(null, technicalCenterAccess)).toBe(false)
    expect(canAccessRoute(user, technicalCenterAccess)).toBe(false)
    expect(
      canAccessRoute(
        { ...user, permissions: [...user.permissions, "technical-release:view"] },
        technicalCenterAccess
      )
    ).toBe(true)
    expect(
      canAccessRoute(user, {
        type: "permissions",
        mode: "any",
        permissions: ["company:view", "other"],
      })
    ).toBe(true)
    expect(
      canAccessRoute(user, {
        type: "permissions",
        mode: "all",
        permissions: ["company:view", "other"],
      })
    ).toBe(false)
  })
  it("uses the same policy for menu visibility", () => {
    const visible = getVisibleMenuRoutes(user)
    for (const route of appMenuRoutes)
      expect(visible.includes(route)).toBe(canAccessRoute(user, route.access))
  })
  it("redirects anonymous users to login", () => {
    render(
      <MemoryRouter initialEntries={["/private"]}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/private" element={<div>private</div>} />
          </Route>
          <Route path="/login" element={<div>login screen</div>} />
        </Routes>
      </MemoryRouter>
    )
    expect(screen.getByText("login screen")).toBeInTheDocument()
  })
  it("shows a 403 instead of redirecting authenticated users to dashboard", () => {
    useAuthStore.getState().setSession(user, "token")
    render(
      <MemoryRouter initialEntries={["/private"]}>
        <Routes>
          <Route
            element={
              <PermissionRoute
                policy={{
                  type: "permissions",
                  mode: "any",
                  permissions: ["admin"],
                }}
              />
            }
          >
            <Route path="/private" element={<div>private</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    )
    expect(
      screen.getByRole("heading", { name: uiText.app.forbiddenTitle })
    ).toBeInTheDocument()
  })
  it("renders a dedicated not-found state", () => {
    render(<AppErrorPage status={404} />)
    expect(
      screen.getByRole("heading", { name: uiText.app.notFoundTitle })
    ).toBeInTheDocument()
  })
})
