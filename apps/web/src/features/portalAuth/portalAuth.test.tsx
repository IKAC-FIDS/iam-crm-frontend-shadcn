import { beforeEach, describe, expect, it } from "vitest"
import { render, screen } from "@testing-library/react"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { PortalProtectedRoute } from "./PortalProtectedRoute"
import { usePortalAuthStore } from "./portalAuth.store"

describe("portal authentication boundary", () => {
  beforeEach(() => usePortalAuthStore.getState().clear())

  it("redirects an anonymous portal visitor to the portal login", () => {
    render(<MemoryRouter initialEntries={["/portal/home"]}><Routes><Route element={<PortalProtectedRoute />}><Route path="/portal/home" element={<div>portal home</div>} /></Route><Route path="/portal/login" element={<div>portal login</div>} /></Routes></MemoryRouter>)
    expect(screen.getByText("portal login")).toBeInTheDocument()
  })

  it("allows only an authenticated customer session into portal routes", () => {
    usePortalAuthStore.getState().setSession({
      accessToken: "portal-token",
      user: { id: "u1", fullName: "Customer", email: "customer@example.com", principalType: "CUSTOMER" },
      activeCompany: { membershipId: "m1", companyId: "c1", legalName: "Company", brandName: null, role: "CUSTOMER_USER" },
    })
    render(<MemoryRouter initialEntries={["/portal/home"]}><Routes><Route element={<PortalProtectedRoute />}><Route path="/portal/home" element={<div>portal home</div>} /></Route><Route path="/portal/login" element={<div>portal login</div>} /></Routes></MemoryRouter>)
    expect(screen.getByText("portal home")).toBeInTheDocument()
  })

  it("drops the previous company and token when switching session context", () => {
    const store = usePortalAuthStore.getState()
    store.setSession({ accessToken: "old", user: { id: "u1", fullName: "Customer", email: "c@example.com", principalType: "CUSTOMER" }, activeCompany: { membershipId: "m1", companyId: "c1", legalName: "One", brandName: null, role: "CUSTOMER_ADMIN" } })
    usePortalAuthStore.getState().setSession({ accessToken: "new", user: { id: "u1", fullName: "Customer", email: "c@example.com", principalType: "CUSTOMER" }, activeCompany: { membershipId: "m2", companyId: "c2", legalName: "Two", brandName: null, role: "CUSTOMER_USER" } })
    expect(usePortalAuthStore.getState()).toMatchObject({ accessToken: "new", activeCompany: { companyId: "c2", membershipId: "m2" } })
  })
})
