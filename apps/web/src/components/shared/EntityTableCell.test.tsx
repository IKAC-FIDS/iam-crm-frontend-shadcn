import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { expect, it, vi } from "vitest"
import { EntityTableCell } from "./EntityTableCell"
import { EntityRowActions } from "./EntityRowActions"

it("uses the same bounded identity frame with or without a subtitle", () => {
  const { rerender } = render(<EntityTableCell title="شرکت نمونه" avatar="ش" />)
  expect(
    screen.getByTitle("شرکت نمونه").parentElement?.parentElement
  ).toHaveClass("h-11", "w-64")
  rerender(
    <EntityTableCell
      title="کاربر نمونه"
      subtitle="user@example.test"
      subtitleDir="ltr"
      avatar="ک"
    />
  )
  expect(
    screen.getByTitle("کاربر نمونه").parentElement?.parentElement
  ).toHaveClass("h-11", "w-64")
  expect(screen.getByTitle("user@example.test")).toHaveAttribute("dir", "ltr")
  expect(screen.getByTitle("user@example.test")).toHaveClass("truncate")
})

it("keeps view last and invokes it once without activating the row", async () => {
  const onRow = vi.fn(),
    onView = vi.fn()
  render(
    <div onClick={onRow}>
      <EntityRowActions label="مشاهده جزئیات" onView={onView}>
        <button>عملیات</button>
      </EntityRowActions>
    </div>
  )
  const view = screen.getByRole("button", { name: "مشاهده جزئیات" })
  expect(view.parentElement?.lastElementChild).toBe(view)
  expect(view).toHaveClass("rounded-xl", "text-[var(--app-primary)]")
  await userEvent.click(view)
  expect(onView).toHaveBeenCalledTimes(1)
  expect(onRow).not.toHaveBeenCalled()
})
