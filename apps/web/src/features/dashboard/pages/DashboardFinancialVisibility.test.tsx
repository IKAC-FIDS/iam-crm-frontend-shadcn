import { render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { useAuthStore } from "@/store/authStore"
import { user } from "@/test/fixtures"
import { DashboardPage } from "./DashboardPage"

const summary = {
  current: {
    activeOpportunities: { count: 2, estimatedValueIrr: "100" },
  },
  periodPerformance: {
    opportunities: { winRate: 25, wonCount: 1, wonEstimatedValueIrr: "50" },
  },
  portfolio: {
    total: { count: 2, estimatedValueIrr: "100" },
    active: { count: 1, estimatedValueIrr: "50", percentage: 50 },
    won: { count: 1, estimatedValueIrr: "50", percentage: 50 },
    lost: { count: 0, estimatedValueIrr: "0", percentage: 0 },
  },
  opportunityTrend12m: [],
  attention: {},
}

vi.mock("../hooks/useDashboard", () => ({
  useDashboardSummary: () => ({
    data: summary,
    isPending: false,
    isError: false,
  }),
  useDashboardLatestActivities: () => ({ data: [], isError: false }),
}))
vi.mock("../components/DashboardPanels", () => ({
  AttentionPanel: () => <div data-testid="attention" />,
  DashboardSkeleton: () => <div />,
  RecentActivities: () => <div />,
}))
vi.mock("../components/DashboardVisuals", () => ({
  OpportunityTrendChart: () => <div data-testid="financial-trend" />,
  OpportunityStatusDonut: () => <div data-testid="status-donut" />,
}))

describe("dashboard financial visibility", () => {
  beforeEach(() => {
    useAuthStore.setState({ status: "authenticated", user: null })
  })

  it("keeps non-financial dashboard content and hides financial widgets", () => {
    useAuthStore.setState({
      status: "authenticated",
      user: { ...user, permissions: ["report:view"] },
    })
    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    )

    expect(screen.getByTestId("status-donut")).toBeInTheDocument()
    expect(screen.queryByText("ارزش کل سبد فرصت‌ها")).toBeNull()
    expect(screen.getByTestId("financial-trend")).toBeInTheDocument()
  })

  it("shows financial widgets with financial:view", () => {
    useAuthStore.setState({
      status: "authenticated",
      user: { ...user, permissions: ["report:view", "financial:view"] },
    })
    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    )

    expect(screen.getByText("ارزش کل سبد فرصت‌ها")).toBeInTheDocument()
    expect(screen.getByText("ارزش پایپ‌لاین فعال")).toBeInTheDocument()
    expect(screen.getByText("فروش موفق تجمعی")).toBeInTheDocument()
    expect(screen.getByText("فروش موفق دوره")).toBeInTheDocument()
    expect(screen.getByTestId("financial-trend")).toBeInTheDocument()
  })
})
