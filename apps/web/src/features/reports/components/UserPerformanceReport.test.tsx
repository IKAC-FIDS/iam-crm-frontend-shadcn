import { render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { describe, expect, it, vi } from "vitest"

import { UserPerformanceReport } from "./UserPerformanceReport"

vi.mock("../hooks/useReportsAnalytics", () => ({
  useReportFilterOptions: () => ({
    data: {
      users: [
        {
          id: "user-1",
          fullName: "کاربر نمونه",
          email: "user@example.com",
          isActive: true,
        },
      ],
      teams: [{ id: "team-1", value: "team-1", code: "SALES", name: "فروش", label: "فروش" }],
    },
    isLoading: false,
  }),
  useUserPerformanceReport: () => ({
    data: {
      period: { startDate: null, endDate: null, dateBasis: {} },
      users: [
        { id: "user-1", fullName: "کاربر نمونه", email: "user@example.com" },
      ],
      members: [{
        user: { id: "user-1", fullName: "کاربر نمونه", email: "user@example.com" },
        activity: {
          total: 3,
          breakdown: [
            { code: "CALL", label: "تماس تلفنی", count: 3, percentage: 100 },
            { code: "DEMO", label: "دمو", count: 0, percentage: 0 },
          ],
        },
        companiesCreated: 2,
        tasksCreated: 4,
        tasksAssigned: { total: 5, completed: 2, incomplete: 3 },
        opportunities: {
          total: 2, active: 1, won: 1, lost: 0,
          totalValue: 350, activeValue: 100, wonValue: 250, lostValue: 0,
        },
      }],
      activity: {
        total: 3,
        breakdown: [
          { code: "CALL", label: "تماس تلفنی", count: 3 },
          { code: "DEMO", label: "دمو", count: 0 },
        ],
        uncataloguedCount: 0,
      },
      companiesCreated: 2,
      tasksCreated: 4,
      tasksAssigned: { total: 5, completed: 2, incomplete: 3 },
      opportunities: {
        total: 2,
        active: 1,
        won: 1,
        lost: 0,
        totalValue: 350,
        activeValue: 100,
        wonValue: 250,
        lostValue: 0,
      },
      financialVisible: true,
    },
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  }),
}))

describe("UserPerformanceReport", () => {
  it("renders the full user performance summary and active activity types", () => {
    render(<MemoryRouter><UserPerformanceReport /></MemoryRouter>)

    expect(screen.getByText("فعالیت‌های ثبت‌شده")).toBeInTheDocument()
    expect(screen.getByText("شرکت‌های ایجادشده")).toBeInTheDocument()
    expect(screen.getByText("کارهای ایجادشده")).toBeInTheDocument()
    expect(screen.getByText("فرصت‌های ایجادشده")).toBeInTheDocument()
    expect(screen.getByText("تماس تلفنی")).toBeInTheDocument()
    expect(screen.getByText("دمو")).toBeInTheDocument()
    expect(screen.getByText("کار انجام‌شده")).toBeInTheDocument()
    expect(screen.getByText("کار انجام‌نشده")).toBeInTheDocument()
    expect(screen.getByText("موفق")).toBeInTheDocument()
    expect(screen.getByText("از دست‌رفته")).toBeInTheDocument()
    expect(screen.getByText("۲۵۰ ریال")).toBeInTheDocument()
  })
})
