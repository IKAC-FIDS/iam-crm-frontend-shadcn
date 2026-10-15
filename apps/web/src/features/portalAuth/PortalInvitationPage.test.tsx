import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { PortalInvitationPage } from "./PortalInvitationPage"
import { acceptPortalInvitation } from "./portalAuth.api"

vi.mock("./portalAuth.api", () => ({
  acceptPortalInvitation: vi.fn(),
}))

describe("PortalInvitationPage", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("submits the invitation token and entered account details", async () => {
    const user = userEvent.setup()
    vi.mocked(acceptPortalInvitation).mockResolvedValue({} as never)

    const { container } = render(
      <MemoryRouter initialEntries={["/portal/invitation/invitation-token"]}>
        <Routes>
          <Route
            path="/portal/invitation/:token"
            element={<PortalInvitationPage />}
          />
          <Route path="/portal/home" element={<p>پرتال مشتری</p>} />
        </Routes>
      </MemoryRouter>
    )

    const fullNameInput = container.querySelector<HTMLInputElement>(
      'input:not([type="password"])'
    )
    const passwordInput = container.querySelector<HTMLInputElement>(
      'input[type="password"]'
    )
    if (!fullNameInput || !passwordInput) throw new Error("Invitation inputs missing")
    await user.type(fullNameInput, "کاربر مشتری")
    await user.type(passwordInput, "secure-password")
    await user.click(screen.getByRole("button", { name: "فعال‌سازی امن" }))

    expect(acceptPortalInvitation).toHaveBeenCalledTimes(1)
    expect(acceptPortalInvitation).toHaveBeenCalledWith(
      "invitation-token",
      "secure-password",
      "کاربر مشتری"
    )
    expect(await screen.findByText("پرتال مشتری")).toBeInTheDocument()
  })
})
