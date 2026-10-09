import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { SearchableOptionSelect } from "./SearchableOptionSelect"

describe("SearchableOptionSelect", () => {
  it("supports compact static option lists without rendering a search field", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()

    render(
      <SearchableOptionSelect
        ariaLabel="اولویت"
        options={[{ id: "HIGH", label: "زیاد" }]}
        onChange={onChange}
        search=""
        onSearchChange={() => undefined}
        placeholder="همه اولویت‌ها"
        searchable={false}
      />
    )

    await user.click(screen.getByRole("button", { name: "اولویت" }))

    expect(screen.queryByRole("textbox")).not.toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "زیاد" }))
    expect(onChange).toHaveBeenCalledWith("HIGH")
  })
})
