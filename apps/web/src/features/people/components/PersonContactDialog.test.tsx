import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useState } from "react"
import { describe, expect, it, vi } from "vitest"

import { PersonContactDialog } from "./PersonContactDialog"

vi.mock("../hooks/usePeople", () => ({
  usePeopleLookup: () => ({
    data: [{ id: "type-mobile", label: "موبایل" }],
    isLoading: false,
    isError: false,
    error: null,
  }),
}))

function DialogHarness({ onSubmit = vi.fn().mockResolvedValue(undefined) }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        افزودن راه تماس
      </button>
      <PersonContactDialog
        open={open}
        onOpenChange={setOpen}
        isPending={false}
        onSubmit={onSubmit}
      />
    </>
  )
}

describe("PersonContactDialog", () => {
  it("opens, focuses the first field, and closes from the close button", async () => {
    const user = userEvent.setup()
    render(<DialogHarness />)

    await user.click(screen.getByRole("button", { name: "افزودن راه تماس" }))

    expect(
      screen.getByRole("dialog", { name: "افزودن راه تماس" })
    ).toBeInTheDocument()
    await waitFor(() =>
      expect(
        screen.getByRole("combobox", { name: /نوع راه تماس/ })
      ).toHaveFocus()
    )

    await user.click(screen.getByRole("button", { name: "بستن" }))
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
  })

  it("supports Escape dismissal through the dialog primitive", async () => {
    const user = userEvent.setup()
    render(<DialogHarness />)

    await user.click(screen.getByRole("button", { name: "افزودن راه تماس" }))
    await user.keyboard("{Escape}")

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
  })

  it("keeps validation in the form and submits the existing payload", async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    render(<DialogHarness onSubmit={onSubmit} />)

    await user.click(screen.getByRole("button", { name: "افزودن راه تماس" }))
    await user.selectOptions(
      screen.getByRole("combobox", { name: /نوع راه تماس/ }),
      "type-mobile"
    )
    await user.click(screen.getByRole("button", { name: "ذخیره تغییرات" }))

    expect(await screen.findByText("تکمیل این فیلد الزامی است.")).toBeVisible()
    expect(onSubmit).not.toHaveBeenCalled()

    await user.type(
      screen.getByRole("textbox", { name: /مقدار تماس/ }),
      "09121234567"
    )
    await user.type(
      screen.getByRole("textbox", { name: /یادداشت/ }),
      "شماره اصلی"
    )
    await user.click(screen.getByRole("checkbox", { name: "راه تماس اصلی" }))
    await user.click(screen.getByRole("button", { name: "ذخیره تغییرات" }))

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({
        typeOptionId: "type-mobile",
        value: "09121234567",
        note: "شماره اصلی",
        isPrimary: true,
      })
    )
  })

  it("keeps actions and dismissal disabled while submission is pending", async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    render(
      <PersonContactDialog
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

    expect(screen.getByRole("dialog")).toHaveClass(
      "max-h-[calc(100dvh-2rem)]",
      "overflow-hidden"
    )
  })
})
