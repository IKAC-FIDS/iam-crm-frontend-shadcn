import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useState } from "react"
import { describe, expect, it, vi } from "vitest"

import { PersonSocialDialog } from "./PersonSocialDialog"

function DialogHarness({ onSubmit = vi.fn().mockResolvedValue(undefined) }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        افزودن شبکه
      </button>
      <PersonSocialDialog
        open={open}
        onOpenChange={setOpen}
        isPending={false}
        onSubmit={onSubmit}
      />
    </>
  )
}

describe("PersonSocialDialog", () => {
  it("opens, focuses the first field, and closes from the close button", async () => {
    const user = userEvent.setup()
    render(<DialogHarness />)

    const trigger = screen.getByRole("button", { name: "افزودن شبکه" })
    await user.click(trigger)

    expect(
      screen.getByRole("dialog", { name: "افزودن شبکه اجتماعی" })
    ).toBeInTheDocument()
    await waitFor(() =>
      expect(screen.getByRole("combobox", { name: /پلتفرم/ })).toHaveFocus()
    )

    await user.click(screen.getByRole("button", { name: "بستن" }))
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
  })

  it("supports Escape dismissal through the dialog primitive", async () => {
    const user = userEvent.setup()
    render(<DialogHarness />)

    const trigger = screen.getByRole("button", { name: "افزودن شبکه" })
    await user.click(trigger)
    await user.keyboard("{Escape}")

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
  })

  it("keeps validation in the form and submits the existing payload", async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    render(<DialogHarness onSubmit={onSubmit} />)

    await user.click(screen.getByRole("button", { name: "افزودن شبکه" }))
    await user.click(screen.getByRole("button", { name: "ذخیره تغییرات" }))

    expect(await screen.findByText("تکمیل این فیلد الزامی است.")).toBeVisible()
    expect(onSubmit).not.toHaveBeenCalled()

    await user.type(
      screen.getByRole("textbox", { name: /شناسه یا نشانی/ }),
      "@neshane"
    )
    await user.type(
      screen.getByRole("textbox", { name: /یادداشت/ }),
      "ارتباط اصلی"
    )
    await user.click(
      screen.getByRole("checkbox", { name: "شبکه اجتماعی اصلی" })
    )
    await user.click(screen.getByRole("button", { name: "ذخیره تغییرات" }))

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({
        platform: "LINKEDIN",
        handle: "@neshane",
        note: "ارتباط اصلی",
        isPrimary: true,
      })
    )
  })

  it("keeps actions and dismissal disabled while submission is pending", async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    render(
      <PersonSocialDialog
        open
        onOpenChange={onOpenChange}
        isPending
        onSubmit={vi.fn().mockResolvedValue(undefined)}
      />
    )

    expect(
      screen.getByRole("button", { name: "در حال انجام..." })
    ).toBeDisabled()
    expect(screen.getByRole("button", { name: "انصراف" })).toBeDisabled()
    expect(screen.getByRole("button", { name: "بستن" })).toBeDisabled()

    await user.keyboard("{Escape}")
    expect(onOpenChange).not.toHaveBeenCalled()

    const dialog = screen.getByRole("dialog")
    expect(dialog).toHaveClass("max-h-[calc(100dvh-2rem)]", "overflow-hidden")
  })
})
