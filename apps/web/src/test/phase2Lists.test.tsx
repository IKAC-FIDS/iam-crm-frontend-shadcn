import { act, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { createMemoryRouter, RouterProvider } from "react-router-dom"
import { beforeEach, expect, it, vi } from "vitest"
import type { ReactNode } from "react"
import { CompaniesPage } from "@/features/companies/pages/CompaniesPage"
import { AdminUsersPage } from "@/features/admin/users/pages/AdminUsersPage"
import { OpportunityListView } from "@/features/opportunities/components/OpportunityListView"
import { useListQueryState } from "@/lib/listQuery"
import { readOpportunityFilters } from "@/features/opportunities/utils/opportunityQuery"
import { useAuthStore } from "@/store/authStore"
import { uiText } from "@/config/uiText"
import { user, response, httpError } from "./fixtures"
import { api } from "@/lib/api"

vi.mock("@/lib/api", () => ({
  api: { get: vi.fn(), post: vi.fn(), patch: vi.fn() },
}))
const company = { id: "c1", legalName: "شرکت نمونه", priority: "HIGH" }
const opportunity = {
  id: "o1",
  companyId: "c1",
  title: "فرصت نمونه",
  stageId: "s1",
  stage: { id: "s1", label: "سرنخ" },
  priority: "HIGH",
}
const admin = {
  id: "u1",
  fullName: "کاربر نمونه",
  email: "user@example.test",
  role: "REP",
  isActive: true,
}
beforeEach(() => {
  vi.clearAllMocks()
  useAuthStore.setState({
    user: {
      ...user,
      permissions: ["company:view", "opportunity:view", "user:view"],
    },
    status: "authenticated",
  })
  vi.mocked(api.get).mockImplementation(async (url, config) => {
    const params = config?.params as
      { page?: number; limit?: number } | undefined
    const data =
      url === "/companies"
        ? [company]
        : url === "/opportunities"
          ? [opportunity]
          : url === "/users"
            ? [admin]
            : []
    return response({
      success: true,
      data,
      meta: {
        page: params?.page ?? 1,
        limit: params?.limit ?? 20,
        total: 60,
        totalPages: 3,
      },
    })
  })
})
function mount(element: ReactNode, url: string) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  const router = createMemoryRouter([{ path: "*", element }], {
    initialEntries: [url],
  })
  render(
    <QueryClientProvider client={client}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  )
  return { router, client }
}
it("Companies sends deep-link filters to the API, resets page and restores back navigation", async () => {
  const { router } = mount(
    <CompaniesPage />,
    "/companies?page=2&limit=20&search=نمونه&priority=HIGH"
  )
  expect(await screen.findByRole("table")).toHaveTextContent("شرکت نمونه")
  expect(screen.getByText("شرکت نمونه").closest("tr")).toHaveClass(
    "h-[var(--app-table-row-height)]"
  )
  expect(
    screen.getByRole("button", { name: uiText.companies.list.openCompany })
  ).toHaveClass("rounded-xl", "text-[var(--app-primary)]")
  expect(api.get).toHaveBeenCalledWith(
    "/companies",
    expect.objectContaining({
      params: expect.objectContaining({
        page: 2,
        limit: 20,
        search: "نمونه",
        priority: "HIGH",
      }),
    })
  )
  expect(
    screen.queryByRole("button", { name: uiText.companies.list.create })
  ).not.toBeInTheDocument()
  await userEvent.selectOptions(
    screen.getByLabelText(uiText.companies.list.filters.allPriorities),
    "LOW"
  )
  await waitFor(() =>
    expect(api.get).toHaveBeenCalledWith(
      "/companies",
      expect.objectContaining({
        params: expect.objectContaining({ page: 1, priority: "LOW" }),
      })
    )
  )
  expect(router.state.location.search).toContain("page=1")
  await act(() => router.navigate(-1))
  expect(
    screen.getByLabelText(uiText.companies.list.filters.allPriorities)
  ).toHaveValue("HIGH")
  expect(router.state.location.search).toContain("page=2")
})
it("Admin Users uses shared pagination, server filters and unchanged create permissions", async () => {
  const { router } = mount(
    <AdminUsersPage />,
    "/admin/users?page=2&limit=50&role=REP&status=ACTIVE&teamId=t1"
  )
  expect(await screen.findByRole("table")).toHaveTextContent("کاربر نمونه")
  expect(screen.getByText("کاربر نمونه").closest("tr")).toHaveClass(
    "h-[var(--app-table-row-height)]"
  )
  expect(
    screen.getByRole("button", { name: "مشاهده جزئیات کاربر" })
  ).toHaveClass("rounded-xl", "text-[var(--app-primary)]")
  expect(api.get).toHaveBeenCalledWith("/users", {
    params: { page: 2, limit: 50, role: "REP", teamId: "t1", isActive: true },
  })
  expect(
    screen.queryByRole("button", { name: "افزودن کاربر" })
  ).not.toBeInTheDocument()
  await userEvent.selectOptions(screen.getByLabelText("وضعیت"), "INACTIVE")
  await waitFor(() =>
    expect(api.get).toHaveBeenCalledWith("/users", {
      params: {
        page: 1,
        limit: 50,
        role: "REP",
        teamId: "t1",
        isActive: false,
      },
    })
  )
  await userEvent.selectOptions(
    screen.getByLabelText(uiText.common.pagination.rowsPerPage),
    "10"
  )
  await waitFor(() =>
    expect(router.state.location.search).toContain("limit=10")
  )
  expect(router.state.location.search).toContain("page=1")
})
it("Opportunities preserves company/view parameters and paginates on the server", async () => {
  const onView = vi.fn()
  function List() {
    const { params } = useListQueryState()
    return (
      <OpportunityListView
        filters={readOpportunityFilters(params)}
        permissions={{
          update: false,
          changeOwner: false,
          changeStage: false,
          archive: false,
          restore: false,
        }}
        onView={onView}
        onEdit={vi.fn()}
        onChangeOwner={vi.fn()}
        onChangeStage={vi.fn()}
        onArchiveToggle={vi.fn()}
      />
    )
  }
  const { router } = mount(
    <List />,
    "/opportunities?view=list&companyId=c1&page=2&limit=20"
  )
  expect(await screen.findByRole("table")).toHaveTextContent("فرصت نمونه")
  expect(screen.getByText("فرصت نمونه").closest("tr")).toHaveClass(
    "h-[var(--app-table-row-height)]"
  )
  await userEvent.click(
    screen.getByRole("button", { name: "مشاهده جزئیات فرصت" })
  )
  expect(onView).toHaveBeenCalledTimes(1)
  onView.mockClear()
  await waitFor(() =>
    expect(
      screen.getByRole("button", { name: uiText.common.pagination.next })
    ).not.toBeDisabled()
  )
  await userEvent.click(
    screen.getByRole("button", { name: uiText.common.pagination.next })
  )
  await waitFor(() =>
    expect(api.get).toHaveBeenCalledWith(
      "/opportunities",
      expect.objectContaining({
        params: expect.objectContaining({ page: 3, companyId: "c1" }),
      })
    )
  )
  expect(router.state.location.search).toContain("view=list")
  await userEvent.click(screen.getByText("فرصت نمونه"))
  expect(onView).toHaveBeenCalledWith(expect.objectContaining({ id: "o1" }))
})
it("a migrated page presents a normalized server error, not a false empty result", async () => {
  vi.mocked(api.get).mockRejectedValue(
    httpError(503, { message: "private SQL" })
  )
  mount(<CompaniesPage />, "/companies")
  expect(await screen.findByRole("alert")).toHaveTextContent(uiText.app.server)
  expect(
    screen.queryByText(uiText.companies.list.emptyTitle)
  ).not.toBeInTheDocument()
})
