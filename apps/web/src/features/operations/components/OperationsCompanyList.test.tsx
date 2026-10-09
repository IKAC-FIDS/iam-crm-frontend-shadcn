import { MemoryRouter } from "react-router-dom"
import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { OperationsCompanyList } from "./OperationsCompanyList"
import type { OperationsCompaniesPage } from "../types/operations.types"

const result: OperationsCompaniesPage = {
  data: [
    {
      company: {
        id: "company-1",
        legalName: "شرکت نمونه",
        brandName: "نمونه",
        priority: "HIGH",
        engagementStatus: "NEEDS_ACTION",
        isPinned: false,
      },
      activeOpportunities: { count: 2, preview: [], hasMore: true },
      tasks: {
        open: 1,
        overdue: 0,
        dueToday: 1,
        next: {
          id: "task-1",
          title: "تماس امروز",
          dueAt: "2026-10-02T10:00:00Z",
          priority: "HIGH",
        },
      },
      conversation: { unreadCount: 3 },
      lastActivity: {
        id: "activity-1",
        type: "CALL",
        occurredAt: "2026-10-01T10:00:00Z",
      },
      nextAction: {
        type: "TASK",
        id: "task-1",
        title: "تماس امروز",
        at: "2026-10-02T10:00:00Z",
      },
      attention: { state: "TODAY" },
    },
  ],
  meta: {
    total: 1,
    page: 1,
    limit: 20,
    totalPages: 1,
    hasNext: false,
    hasPrevious: false,
  },
}

describe("OperationsCompanyList", () => {
  it("uses the canonical table/mobile entity contract and exposes standard actions", () => {
    const onAction = vi.fn()
    render(
      <MemoryRouter>
        <OperationsCompanyList
          page={1}
          pageSize={20}
          result={result}
          permissions={["task:create", "opportunity:view"]}
          fetching={false}
          filtered={false}
          onPageChange={vi.fn()}
          onPageSizeChange={vi.fn()}
          onAction={onAction}
        />
      </MemoryRouter>
    )
    expect(
      screen.getByRole("table", { name: "شرکت‌های عملیاتی" })
    ).toBeInTheDocument()
    expect(screen.getAllByText("نمونه").length).toBeGreaterThan(0)
    fireEvent.click(
      screen.getAllByRole("button", { name: /گفتگوهای شرکت نمونه/ })[0]
    )
    expect(onAction).toHaveBeenCalledWith("conversation", result.data[0])
  })
})
