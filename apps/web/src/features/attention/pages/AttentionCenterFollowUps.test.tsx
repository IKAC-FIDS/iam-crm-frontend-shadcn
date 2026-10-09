import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { MemoryRouter, useLocation } from "react-router-dom"

import { AttentionCenterPage } from "./AttentionCenterPage"

const mocks = vi.hoisted(() => ({
  complete: vi.fn(),
  reschedule: vi.fn(),
}))

vi.mock("@/store/authStore", () => ({
  useAuthStore: (select: (state: { user: { permissions: string[] } }) => unknown) => select({
    user: { permissions: ["follow-up:view", "follow-up:complete", "follow-up:reschedule"] },
  }),
}))
vi.mock("@/features/followUps/hooks/useFollowUps", () => ({
  useDueFollowUps: () => ({
    data: {
      data: [{
        id: "follow-up-1",
        companyId: "company-1",
        type: "CALL",
        notes: "پیگیری قرارداد",
        nextActionDate: "2020-01-01T10:00:00.000Z",
        company: { id: "company-1", legalName: "شرکت نمونه", logoObjectKey: "logo.png" },
        user: { id: "user-1", fullName: "کاربر نمونه", avatarObjectKey: "avatar.png" },
        person: { id: "person-1", fullName: "مخاطب نمونه" },
      }],
      meta: { page: 1, limit: 20, total: 1, totalPages: 1 },
    },
    isLoading: false,
    isError: false,
    isFetching: false,
    error: null,
    refetch: vi.fn(),
  }),
  useCompleteFollowUp: () => ({ mutateAsync: mocks.complete, isPending: false }),
  useRescheduleFollowUp: () => ({ mutateAsync: mocks.reschedule, isPending: false }),
}))
vi.mock("@/features/notifications/hooks/useNotifications", () => ({
  useUnreadCount: () => ({ data: 0 }),
  useReadAll: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useNotifications: () => ({ data: { data: [], meta: { page: 1, limit: 20, total: 0, totalPages: 1 } }, isLoading: false, isError: false }),
  useMarkRead: () => ({ mutateAsync: vi.fn() }),
  useMarkUnread: () => ({ mutateAsync: vi.fn() }),
  useArchive: () => ({ mutateAsync: vi.fn() }),
  useUnarchive: () => ({ mutateAsync: vi.fn() }),
  useDeleteNotification: () => ({ mutateAsync: vi.fn() }),
}))

function Location() {
  return <output data-testid="location">{useLocation().pathname}</output>
}

function show() {
  return render(
    <MemoryRouter initialEntries={["/attention?tab=follow-ups&page=1"]}>
      <AttentionCenterPage />
      <Location />
    </MemoryRouter>,
  )
}

describe("AttentionCenterPage follow-up cards", () => {
  beforeEach(() => vi.clearAllMocks())

  it("renders standard card data and every permitted action", () => {
    show()
    expect(screen.getByText("پیگیری قرارداد")).toBeVisible()
    expect(screen.getAllByText("عقب‌افتاده").length).toBeGreaterThan(0)
    expect(screen.getByText("مخاطب نمونه")).toBeVisible()
    expect(screen.getByRole("button", { name: "مشاهده شرکت شرکت نمونه" })).toBeVisible()
    expect(screen.getByRole("button", { name: "زمان‌بندی مجدد" })).toBeVisible()
    expect(screen.getByRole("button", { name: "انجام شد" })).toBeVisible()
  })

  it("keeps company navigation and completion dialog behavior", async () => {
    const user = userEvent.setup()
    show()
    await user.click(screen.getByRole("button", { name: "مشاهده شرکت شرکت نمونه" }))
    expect(screen.getByTestId("location")).toHaveTextContent("/companies/company-1")

    await user.click(screen.getByRole("button", { name: "انجام شد" }))
    expect(await screen.findByRole("dialog")).toHaveTextContent("تکمیل پیگیری")
  })
})
