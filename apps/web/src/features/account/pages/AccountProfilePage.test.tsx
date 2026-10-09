import { render, screen } from "@testing-library/react"
import type { ReactNode } from "react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom"
import { beforeEach, expect, it, vi } from "vitest"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

import { useAuthStore } from "@/store/authStore"
import { FontPreferenceProvider } from "@/components/font-preference-provider"
import { useAccountWorkspace } from "../hooks/useAccountWorkspace"
import { getUser } from "@/features/admin/users/api/adminUsersApi"
import { useAdminUsers } from "@/features/admin/users/hooks/useAdminUsers"
import type { AccountWorkspace } from "../types/accountWorkspace.types"
import { AccountProfilePage } from "./AccountProfilePage"

vi.mock("../hooks/useAccountWorkspace", () => ({
  useAccountWorkspace: vi.fn(),
}))
vi.mock("@/features/admin/users/hooks/useAdminUsers", () => ({
  useAdminUsers: vi.fn(),
}))
vi.mock("@/features/admin/users/api/adminUsersApi", () => ({
  getUser: vi.fn(),
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

function TestQueryProvider({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={new QueryClient()}>
      {children}
    </QueryClientProvider>
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
  vi.mocked(useAdminUsers).mockReturnValue({
    data: { data: [] },
    isFetching: false,
  } as unknown as ReturnType<typeof useAdminUsers>)
})

it("shows the personal workspace and preserves the correct activity drill-down filters", async () => {
  render(
    <TestQueryProvider>
      <MemoryRouter initialEntries={["/account/profile"]}>
        <Routes>
          <Route
            path="/account/profile"
            element={
              <>
                <FontPreferenceProvider>
                  <AccountProfilePage />
                </FontPreferenceProvider>
                <LocationProbe />
              </>
            }
          />
          <Route path="*" element={<LocationProbe />} />
        </Routes>
      </MemoryRouter>
    </TestQueryProvider>
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

it("shows only the user's related conversation context and participants", () => {
  vi.mocked(useAccountWorkspace).mockReturnValue({
    data: {
      ...workspace,
      recent: {
        ...workspace.recent,
        conversations: [
          {
            id: "thread-1",
            entityType: "TASK",
            entityId: "task-1",
            status: "OPEN",
            updatedAt: "2026-10-03T08:00:00.000Z",
            unreadCount: 1,
            actionUrl: "/tasks/task-1#conversation",
            createdBy: { id: "creator-1", fullName: "مریم احمدی" },
            relatedUsers: [{ id: "user-2", fullName: "علی رضایی" }],
            context: {
              company: { id: "company-1", name: "شرکت نمونه" },
              opportunity: { id: "opportunity-1", title: "فروش SSO" },
              task: { id: "task-1", title: "پیگیری پیشنهاد" },
            },
            latestMessage: {
              id: "message-1",
              body: "لطفاً نتیجه را اعلام کنید",
              type: "COMMENT",
              createdAt: "2026-10-03T08:00:00.000Z",
              author: { id: "creator-1", fullName: "مریم احمدی" },
            },
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
    <TestQueryProvider>
      <MemoryRouter initialEntries={["/account/profile"]}>
        <FontPreferenceProvider>
          <AccountProfilePage />
        </FontPreferenceProvider>
      </MemoryRouter>
    </TestQueryProvider>
  )

  expect(screen.getByText("گفتگوهای من")).toBeInTheDocument()
  expect(screen.getByText("ایجادکننده: مریم احمدی")).toBeInTheDocument()
  expect(screen.getByText("افراد مرتبط / تگ‌شده: علی رضایی")).toBeInTheDocument()
  expect(
    screen.getByText(
      "شرکت: شرکت نمونه · فرصت: فروش SSO · کار: پیگیری پیشنهاد"
    )
  ).toBeInTheDocument()
})

it("does not expose entity navigation when the matching view permission is absent", () => {
  useAuthStore.setState((state) => ({
    user: state.user ? { ...state.user, permissions: ["activity:view"] } : null,
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
    <TestQueryProvider>
      <MemoryRouter initialEntries={["/account/profile"]}>
        <FontPreferenceProvider>
          <AccountProfilePage />
        </FontPreferenceProvider>
      </MemoryRouter>
    </TestQueryProvider>
  )

  expect(screen.getByText("پیگیری قرارداد")).toBeInTheDocument()
  expect(screen.getByText("در حال انجام")).toBeInTheDocument()
  expect(
    screen.queryByRole("link", { name: /پیگیری قرارداد/ })
  ).not.toBeInTheDocument()
})

it("lets an admin select another user and requests that user's workspace", async () => {
  useAuthStore.setState((state) => ({
    user: state.user ? { ...state.user, role: "ADMIN" } : null,
  }))
  vi.mocked(useAdminUsers).mockReturnValue({
    data: {
      data: [
        {
          id: "00000000-0000-4000-8000-000000000099",
          fullName: "کاربر انتخابی",
          email: "selected@example.com",
          role: "REP",
          isActive: true,
        },
      ],
    },
    isFetching: false,
  } as unknown as ReturnType<typeof useAdminUsers>)
  vi.mocked(getUser).mockResolvedValue({
    id: "00000000-0000-4000-8000-000000000099",
    fullName: "کاربر انتخابی",
    email: "selected@example.com",
    role: "REP",
    isActive: true,
  })

  render(
    <TestQueryProvider>
      <MemoryRouter initialEntries={["/account/profile"]}>
        <FontPreferenceProvider>
          <AccountProfilePage />
        </FontPreferenceProvider>
      </MemoryRouter>
    </TestQueryProvider>
  )

  await userEvent.click(
    screen.getByRole("button", { name: "انتخاب کاربر برای مشاهده پروفایل" })
  )
  await userEvent.click(screen.getByText("کاربر انتخابی"))

  expect(useAccountWorkspace).toHaveBeenLastCalledWith(
    expect.objectContaining({
      userId: "00000000-0000-4000-8000-000000000099",
    })
  )
  expect(
    (await screen.findAllByText("selected@example.com")).length
  ).toBeGreaterThan(0)
})
