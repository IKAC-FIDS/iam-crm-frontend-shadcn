import { fireEvent, render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { describe, expect, it, vi } from "vitest"

import { ReportsPage } from "./ReportsPage"

vi.mock("../hooks/useReportsAnalytics", () => ({
  useReportsAnalytics: () => ({
    data: undefined,
    error: null,
    isError: false,
    isFetching: false,
    isLoading: false,
    refetch: vi.fn(),
  }),
}))

vi.mock("../components/UserPerformanceReport", () => ({
  UserPerformanceReport: () => <div>گزارش مقایسه اعضا</div>,
}))

describe("ReportsPage", () => {
  it("switches report views from the standard PageHero control", () => {
    render(
      <MemoryRouter initialEntries={["/reports"]}>
        <ReportsPage />
      </MemoryRouter>
    )

    const salesView = screen.getByRole("button", {
      name: "سلامت مسیر فروش",
    })
    const usersView = screen.getByRole("button", { name: "عملکرد کاربران" })

    expect(salesView).toHaveAttribute("aria-pressed", "true")
    expect(usersView).toHaveAttribute("aria-pressed", "false")

    fireEvent.click(usersView)

    expect(usersView).toHaveAttribute("aria-pressed", "true")
    expect(screen.getByText("گزارش مقایسه اعضا")).toBeInTheDocument()
  })
})
