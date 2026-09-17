import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom"
import { beforeEach, expect, it, vi } from "vitest"

import { useAuthStore } from "@/store/authStore"
import { useAccountWorkspace } from "../hooks/useAccountWorkspace"
import type { AccountWorkspace } from "../types/accountWorkspace.types"
import { AccountProfilePage } from "./AccountProfilePage"

vi.mock("../hooks/useAccountWorkspace", () => ({
  useAccountWorkspace: vi.fn(),
}))
vi.mock("@/components/shared/ProfileMediaEditor", () => ({
  ProfileMediaEditor: () => <div>تصویر پروفایل</div>,
}))

const workspace: AccountWorkspace = {
  period: { startDate: null, endDate: null, defaultedToLast30Days: false },
  financialVisible: true,
  attention: {
    overdueTasks: 2,
    dueTodayTasks: 1,
    upcomingMeetings: 3,
    unreadNotifications: 4,
    unreadConversationMessages: 5,
  },
  summary: {
    tasks: { total: 8, open: 6, completed: 2, overdue: 2 },
    opportunities: {
      total: 3,
      active: 1,
      won: 1,
      lost: 1,
      totalValue: 300,
      activeValue: 100,
      wonValue: 100,
      lostValue: 100,
    },
    companiesOwned: 2,
    activities: 15,
    upcomingMeetings: 3,
    unreadNotifications: 4,
  },
  activityBreakdown: [{ code: "CALL", label: "تماس تلفنی", count: 15 }],
  recent: {
    tasks: [],
    opportunities: [],
    companies: [],
    meetings: [],
    notifications: [],
    conversations: [],
  },
}

function LocationProbe() {
  return (
    <div data-testid="location">
      {useLocation().pathname + useLocation().search}
    </div>
  )
}

beforeEach(() => {
  useAuthStore.setState({
    user: {
      id: "user-1",
      fullName: "کارشناس فروش",
      email: "rep@example.com",
      role: "REP",
      team: "SALES",
      teamId: "team-1",
      teamCode: "SALES",
      teamName: "فروش",
      permissions: [
        "task:view",
        "opportunity:view",
        "company:view",
        "activity:view",
        "meeting:view",
        "notification:view",
        "financial:view",
      ],
      organizationId: "org-1",
      roleId: "role-1",
      roleCode: "REP",
      roleName: "کارشناس فروش",
      avatarObjectKey: null,
    },
    status: "authenticated",
  })
  vi.mocked(useAccountWorkspace).mockReturnValue({
    data: workspace,
    isLoading: false,
    isError: false,
    error: null,
    isFetching: false,
    refetch: vi.fn(),
  } as unknown as ReturnType<typeof useAccountWorkspace>)
})

it("shows the personal workspace and preserves the correct activity drill-down filters", async () => {
  render(
    <MemoryRouter initialEntries={["/account/profile"]}>
      <Routes>
        <Route
          path="/account/profile"
          element={
            <>
              <AccountProfilePage />
              <LocationProbe />
            </>
          }
        />
        <Route path="*" element={<LocationProbe />} />
      </Routes>
    </MemoryRouter>
  )

  expect(
    screen.getByRole("heading", { name: "مرکز کار شخصی" })
  ).toBeInTheDocument()
  expect(screen.getByText("نیازمند توجه شما")).toBeInTheDocument()
  expect(screen.getByText("تماس تلفنی")).toBeInTheDocument()

  await userEvent.click(screen.getByRole("button", { name: /فعالیت‌های بازه/ }))
  expect(screen.getByTestId("location")).toHaveTextContent(
    "/activities?scope=mine&ownerId=user-1&dateFrom="
  )
  expect(screen.getByTestId("location")).toHaveTextContent("&dateTo=")
})

it("does not expose entity navigation when the matching view permission is absent", () => {
  useAuthStore.setState((state) => ({
    user: state.user
      ? { ...state.user, permissions: ["activity:view"] }
      : null,
  }))
  vi.mocked(useAccountWorkspace).mockReturnValue({
    data: {
      ...workspace,
      recent: {
        ...workspace.recent,
        tasks: [
          {
            id: "task-1",
            title: "پیگیری قرارداد",
            status: "IN_PROGRESS",
            priority: "HIGH",
            company: null,
          },
        ],
      },
    },
    isLoading: false,
    isError: false,
    error: null,
    isFetching: false,
    refetch: vi.fn(),
  } as unknown as ReturnType<typeof useAccountWorkspace>)

  render(
    <MemoryRouter initialEntries={["/account/profile"]}>
      <AccountProfilePage />
    </MemoryRouter>
  )

  expect(screen.getByText("پیگیری قرارداد")).toBeInTheDocument()
  expect(screen.getByText("در حال انجام")).toBeInTheDocument()
  expect(
    screen.queryByRole("link", { name: /پیگیری قرارداد/ })
  ).not.toBeInTheDocument()
})
