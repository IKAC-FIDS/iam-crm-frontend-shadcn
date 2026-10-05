import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { MessageReferencePicker } from "./MessageReferencePicker"

const query = vi.hoisted(() => ({
  data: [{ id: "company-1", label: "شرکت نمونه" }],
}))

vi.mock("@tanstack/react-query", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@tanstack/react-query")>()
  return {
    ...actual,
    useQuery: ({ enabled }: { enabled: boolean }) => ({
      data: enabled ? query.data : undefined,
      isFetching: false,
    }),
  }
})

describe("MessageReferencePicker", () => {
  beforeEach(() => vi.clearAllMocks())

  it("shows all reference commands after typing slash", () => {
    render(
      <MessageReferencePicker
        body="/"
        onCommand={vi.fn()}
        onSelect={vi.fn()}
      />
    )

    expect(screen.getByText("/company")).toBeInTheDocument()
    expect(screen.getByText("/opportunity")).toBeInTheDocument()
    expect(screen.getByText("/task")).toBeInTheDocument()
    expect(screen.getByText("/meeting")).toBeInTheDocument()
  })

  it("opens a searchable entity list after a command is selected", async () => {
    const onCommand = vi.fn()
    const onSelect = vi.fn()
    const user = userEvent.setup()
    const view = render(
      <MessageReferencePicker
        body="/"
        onCommand={onCommand}
        onSelect={onSelect}
      />
    )

    await user.click(screen.getByRole("option", { name: /شرکت/ }))
    expect(onCommand).toHaveBeenCalledWith("company", "/")

    view.rerender(
      <MessageReferencePicker
        body="/company "
        onCommand={onCommand}
        onSelect={onSelect}
      />
    )
    const search = screen.getByRole("textbox", { name: "جست‌وجوی شرکت" })
    await user.type(search, "نمونه")
    expect(search).toHaveValue("نمونه")

    await user.click(screen.getByRole("option", { name: "شرکت نمونه" }))
    expect(onSelect).toHaveBeenCalledWith(
      { type: "COMPANY", id: "company-1", label: "شرکت نمونه" },
      "/company "
    )
  })
})
