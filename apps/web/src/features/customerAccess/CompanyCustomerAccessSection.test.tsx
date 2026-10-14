import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { CompanyCustomerAccessSection } from "./CompanyCustomerAccessSection"
import { getCompanyPortalAccess, inviteCustomer } from "./customerAccess.api"

vi.mock("./customerAccess.api", () => ({
  getCompanyPortalAccess: vi.fn(),
  inviteCustomer: vi.fn(),
  resendCustomerInvitation: vi.fn(),
  revokeCustomerInvitation: vi.fn(),
  setCompanyPortalAccess: vi.fn(),
  updateCustomerMembership: vi.fn(),
}))

describe("CompanyCustomerAccessSection", () => {
  beforeEach(() => {
    vi.mocked(getCompanyPortalAccess).mockResolvedValue({
      portalEnabled: true,
      portalEnabledAt: null,
      memberships: [],
      invitations: [],
    })
    vi.mocked(inviteCustomer).mockResolvedValue({})
  })

  it("sends the invitation when the submit button is clicked", async () => {
    const user = userEvent.setup()
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    render(
      <QueryClientProvider client={client}>
        <CompanyCustomerAccessSection companyId="company-1" canManage />
      </QueryClientProvider>
    )

    await user.click(await screen.findByRole("button", { name: "دعوت کاربر" }))
    await user.type(screen.getByRole("textbox"), "customer@example.com")
    await user.selectOptions(screen.getByRole("combobox"), "CUSTOMER_ADMIN")
    await user.click(screen.getByRole("button", { name: "ارسال دعوت" }))

    await waitFor(() => {
      expect(inviteCustomer).toHaveBeenCalledWith(
        "company-1",
        "customer@example.com",
        "CUSTOMER_ADMIN"
      )
    })
  })
})
