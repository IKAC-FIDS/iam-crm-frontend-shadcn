import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

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
vi.mock("@/features/conversations/api/conversations.api", () => ({
  getCompanyConversationHub: vi
    .fn()
    .mockResolvedValue({
      company: { id: "company-1", name: "شرکت نمونه" },
      direct: null,
      threads: [],
      counts: { all: 0, company: 0, tasks: 0, activities: 0, unread: 0 },
    }),
}))

function renderDialog(onClose = vi.fn()) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <QueryClientProvider client={client}>
      <CompanyConversationDialog
        company={{ id: "company-1", legalName: "شرکت نمونه" }}
        onClose={onClose}
      />
    </QueryClientProvider>
  )
}

describe("CompanyConversationDialog", () => {
  it("opens the existing company conversation in place", async () => {
    const user = userEvent.setup()
    renderDialog()

    expect(screen.getByRole("dialog")).toBeInTheDocument()
    expect(screen.getByText("گفتگوهای شرکت نمونه")).toBeInTheDocument()
    await user.click(
      await screen.findByRole("button", { name: /گفتگوی مستقیم شرکت/ })
    )
    expect(screen.getByText("COMPANY:company-1")).toBeInTheDocument()
  })

  it("closes through accessible dialog controls", async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    renderDialog(onClose)

    await user.click(screen.getByRole("button", { name: /بستن/ }))
    expect(onClose).toHaveBeenCalled()
  })
})
