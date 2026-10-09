import { expect, it, vi } from "vitest"
import { fireEvent, render, screen } from "@testing-library/react"
import { TimeInput } from "./TimeInput"

it("keeps partial input, resets invalid drafts on blur, and follows external values", () => {
  const change = vi.fn()
  const { rerender } = render(<TimeInput aria-label="time" value="10:30" onValueChange={change} />)
  const input = screen.getByLabelText("time")
  fireEvent.change(input, { target: { value: "12" } })
  expect(input).toHaveValue("12")
  expect(change).not.toHaveBeenCalled()
  fireEvent.blur(input)
  expect(input).toHaveValue("10:30")
  fireEvent.change(input, { target: { value: "۱۴:۴۵" } })
  expect(change).toHaveBeenCalledWith("14:45")
  rerender(<TimeInput aria-label="time" value="09:15" onValueChange={change} />)
  expect(input).toHaveValue("09:15")
})
