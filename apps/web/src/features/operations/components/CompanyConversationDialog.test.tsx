import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { CompanyConversationDialog } from "./CompanyConversationDialog"

vi.mock("@/features/conversations/components/EntityConversationPanel", () => ({
  EntityConversationPanel: ({
    entityType,
    entityId,
  }: {
    entityType: string
    entityId: string
  }) => <div>{`${entityType}:${entityId}`}</div>,
}))

describe("CompanyConversationDialog", () => {
  it("opens the existing company conversation in place", () => {
    render(
      <CompanyConversationDialog
        company={{ id: "company-1", legalName: "شرکت نمونه" }}
        onClose={vi.fn()}
      />
    )

    expect(screen.getByRole("dialog")).toBeInTheDocument()
    expect(screen.getByText("گفتگوی شرکت نمونه")).toBeInTheDocument()
    expect(screen.getByText("COMPANY:company-1")).toBeInTheDocument()
  })

  it("closes through accessible dialog controls", async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(
      <CompanyConversationDialog
        company={{ id: "company-1", legalName: "شرکت نمونه" }}
        onClose={onClose}
      />
    )

    await user.click(screen.getByRole("button", { name: /بستن/ }))
    expect(onClose).toHaveBeenCalled()
  })
})
