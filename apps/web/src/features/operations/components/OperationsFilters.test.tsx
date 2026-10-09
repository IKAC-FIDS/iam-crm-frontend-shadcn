import { fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { OperationsFilters } from "./OperationsFilters"

const filters = {
  search: "",
  ownershipScope: "mine" as const,
}

describe("OperationsFilters", () => {
  it("maps quick filters to aggregate API query state", async () => {
    const user = userEvent.setup()
    const onPatch = vi.fn()
    render(
      <OperationsFilters
        filters={filters}
        onPatch={onPatch}
        onClear={vi.fn()}
      />
    )

    await user.click(screen.getByRole("button", { name: "عقب‌افتاده" }))
    expect(onPatch).toHaveBeenCalledWith({
      attentionState: "OVERDUE",
      hasUnreadMessages: undefined,
      hasActiveOpportunity: undefined,
      hasNoNextAction: undefined,
    })
  })

  it("updates search without losing responsibility for URL-backed state", () => {
    const onPatch = vi.fn()
    render(
      <OperationsFilters
        filters={filters}
        onPatch={onPatch}
        onClear={vi.fn()}
      />
    )

    fireEvent.change(
      screen.getByRole("textbox", {
        name: "جست‌وجوی نام یا شناسه شرکت...",
      }),
      { target: { value: "رهسا" } }
    )
    expect(onPatch).toHaveBeenLastCalledWith({ search: "رهسا" })
  })
})
