import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { AdvancedFilterPopover } from "./AdvancedFilterPopover"

describe("AdvancedFilterPopover", () => {
  it("shows active filter context and clears only when requested", async () => {
    const user = userEvent.setup()
    const onClear = vi.fn()

    render(
      <AdvancedFilterPopover activeCount={2} onClear={onClear}>
        <label>
          شرکت
          <input />
        </label>
      </AdvancedFilterPopover>
    )

    await user.click(screen.getByRole("button", { name: /فیلترها/ }))
    expect(screen.getByRole("heading", { name: "فیلترهای پیشرفته" })).toBeInTheDocument()
    expect(screen.getByText("۲ فیلتر فعال")).toBeInTheDocument()
    expect(screen.getByLabelText("شرکت")).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "پاک‌کردن" }))
    expect(onClear).toHaveBeenCalledOnce()
  })
})
