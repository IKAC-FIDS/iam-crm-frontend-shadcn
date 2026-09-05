import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { EntityCardList } from "./EntityCardList"

describe("EntityCardList", () => {
  it("renders visual identity and keeps action clicks separate", () => {
    const open = vi.fn()
    const action = vi.fn()
    render(
      <EntityCardList
        rows={[{ id: "1", name: "شرکت نمونه" }]}
        getRowKey={(item) => item.id}
        fields={[{ id: "name", label: "نام", render: (item) => item.name }]}
        title={(item) => item.name}
        subtitle={() => "زیرعنوان"}
        media={() => <span aria-label="logo">ن</span>}
        onRowClick={open}
        actions={() => <button onClick={action}>عملیات</button>}
      />,
    )
    expect(screen.getByLabelText("logo")).toBeInTheDocument()
    fireEvent.click(screen.getByText("عملیات"))
    expect(action).toHaveBeenCalledOnce()
    expect(open).not.toHaveBeenCalled()
  })

  it("opens a card with the keyboard", () => {
    const open = vi.fn()
    render(<EntityCardList rows={[{ id: "1" }]} getRowKey={(item) => item.id} fields={[]} title={() => "کارت"} onRowClick={open} />)
    fireEvent.keyDown(screen.getByRole("button"), { key: "Enter" })
    expect(open).toHaveBeenCalledOnce()
  })
})
