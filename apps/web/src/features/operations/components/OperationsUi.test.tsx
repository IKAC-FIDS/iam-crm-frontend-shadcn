import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { OperationsAttentionCards } from "./OperationsAttentionCards"
import { OperationsQuickActions } from "./OperationsQuickActions"

describe("Operations UI", () => {
  it("renders the workspace attention summary and makes cards actionable", async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(
      <OperationsAttentionCards
        attention={{
          dueTodayTasks: 4,
          overdueTasks: 2,
          unreadConversationMessages: 6,
          meetingsToday: 1,
          activeOpportunities: 9,
        }}
        onSelect={onSelect}
      />
    )

    expect(screen.getByText("کارهای امروز")).toBeInTheDocument()
    expect(screen.getByText("۶")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: /کارهای عقب‌افتاده/ }))
    expect(onSelect).toHaveBeenCalledWith("overdue")
  })

  it("opens the product price drawer action when product access exists", async () => {
    const user = userEvent.setup()
    const onAction = vi.fn()
    render(
      <OperationsQuickActions
        permissions={["product:view"]}
        onAction={onAction}
      />
    )

    await user.click(screen.getByRole("button", { name: "قیمت محصولات" }))
    expect(onAction).toHaveBeenCalledWith("products")
  })

  it("only renders quick actions allowed by permissions", () => {
    render(
      <OperationsQuickActions
        permissions={["task:create"]}
        onAction={vi.fn()}
      />
    )

    expect(screen.getByRole("button", { name: "کار جدید" })).toBeInTheDocument()
    expect(
      screen.queryByRole("button", { name: "فرصت جدید" })
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole("button", { name: "قیمت محصولات" })
    ).not.toBeInTheDocument()
  })
})
