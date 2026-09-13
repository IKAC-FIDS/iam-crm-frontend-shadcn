import { render, screen } from "@testing-library/react"
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
    },
    isLoading: false,
  }),
  useUserPerformanceReport: () => ({
    data: {
      period: { startDate: null, endDate: null, dateBasis: {} },
      users: [
        { id: "user-1", fullName: "کاربر نمونه", email: "user@example.com" },
      ],
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
    render(<UserPerformanceReport />)

    expect(screen.getByText("فعالیت‌های ثبت‌شده")).toBeInTheDocument()
    expect(screen.getByText("شرکت‌های ایجادشده")).toBeInTheDocument()
    expect(screen.getByText("کارهای ایجادشده")).toBeInTheDocument()
    expect(screen.getByText("فرصت‌های ایجادشده")).toBeInTheDocument()
    expect(screen.getByText("تماس تلفنی")).toBeInTheDocument()
    expect(screen.getByText("دمو")).toBeInTheDocument()
    expect(screen.getByText("انجام‌شده")).toBeInTheDocument()
    expect(screen.getByText("انجام‌نشده")).toBeInTheDocument()
    expect(screen.getByText("موفق")).toBeInTheDocument()
    expect(screen.getByText("از دست‌رفته")).toBeInTheDocument()
    expect(screen.getByText("۳۵۰ ریال")).toBeInTheDocument()
  })
})
