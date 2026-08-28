import { expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { PaginationControls } from "./PaginationControls"
import { uiText } from "@/config/uiText"

it("disables previous on first page and changes pages and row count", async () => {
  const user = userEvent.setup()
  const changePage = vi.fn(), changeSize = vi.fn()
  render(<PaginationControls page={1} pageCount={3} onPageChange={changePage} pageSize={20} onPageSizeChange={changeSize} total={50} />)
  expect(screen.getByRole("button", { name: uiText.common.pagination.previous })).toBeDisabled()
  await user.click(screen.getByRole("button", { name: uiText.common.pagination.next }))
  expect(changePage).toHaveBeenCalledWith(2)
  await user.selectOptions(screen.getByRole("combobox"), "50")
  expect(changeSize).toHaveBeenCalledWith(50)
})
