import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { ConfirmDialog } from "./ConfirmDialog"

describe("ConfirmDialog", () => {
  it("exposes explicit context and supports cancel and Escape", async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()

    const { rerender } = render(
      <ConfirmDialog
        open
        onOpenChange={onOpenChange}
        title="حذف شبکه اجتماعی لینکدین"
        description="این نشانی از پروفایل فرد حذف می‌شود."
        confirmLabel="حذف شبکه اجتماعی"
        onConfirm={vi.fn()}
      />
    )

    expect(
      screen.getByRole("dialog", { name: "حذف شبکه اجتماعی لینکدین" })
    ).toHaveAccessibleDescription("این نشانی از پروفایل فرد حذف می‌شود.")

    await user.click(screen.getByRole("button", { name: "انصراف" }))
    expect(onOpenChange).toHaveBeenLastCalledWith(false)

    onOpenChange.mockClear()
    rerender(
      <ConfirmDialog
        open
        onOpenChange={onOpenChange}
        title="حذف شبکه اجتماعی لینکدین"
        description="این نشانی از پروفایل فرد حذف می‌شود."
        confirmLabel="حذف شبکه اجتماعی"
        onConfirm={vi.fn()}
      />
    )
    await user.keyboard("{Escape}")
    expect(onOpenChange).toHaveBeenLastCalledWith(false)
  })

  it("prevents dismissal and duplicate confirmation while pending", async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    const onConfirm = vi.fn()

    render(
      <ConfirmDialog
        open
        onOpenChange={onOpenChange}
        title="حذف شبکه اجتماعی لینکدین"
        description="این نشانی از پروفایل فرد حذف می‌شود."
        confirmLabel="حذف شبکه اجتماعی"
        isPending
        onConfirm={onConfirm}
      />
    )

    expect(
      screen.getByRole("button", { name: "در حال انجام..." })
    ).toBeDisabled()
    expect(screen.getByRole("button", { name: "انصراف" })).toBeDisabled()
    await user.keyboard("{Escape}")

    expect(onOpenChange).not.toHaveBeenCalled()
    expect(onConfirm).not.toHaveBeenCalled()
  })
})
