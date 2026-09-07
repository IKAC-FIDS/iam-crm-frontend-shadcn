import { beforeEach, expect, it, vi } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter, useLocation } from "react-router-dom"
import { AttentionCenterPage } from "./AttentionCenterPage"

const mocks = vi.hoisted(() => ({
  row: { id: "notification-1", title: "کار جدید", body: "پیگیری قرارداد", actionUrl: "/tasks/task-1" as string | null,
    readAt: null as string | null, archivedAt: null as string | null, priority: "NORMAL", type: "TASK_ASSIGNED", createdAt: "2026-09-07T12:00:00Z" },
  read: vi.fn(), unread: vi.fn(), archive: vi.fn(), unarchive: vi.fn(), remove: vi.fn(), readAll: vi.fn(),
}))
vi.mock("@/store/authStore", () => ({ useAuthStore: (select: (state: { user: { permissions: string[] } }) => unknown) => select({ user: { permissions: ["notification:view", "notification:manage"] } }) }))
vi.mock("@/features/followUps/hooks/useFollowUps", () => ({
  useDueFollowUps: () => ({ data: { data: [] } }), useCompleteFollowUp: () => ({}), useRescheduleFollowUp: () => ({}),
}))
vi.mock("@/features/notifications/hooks/useNotifications", () => ({
  useNotifications: () => ({ data: { data: [mocks.row], meta: { page: 1, limit: 20, total: 1, totalPages: 1 } }, isLoading: false, isError: false }),
  useUnreadCount: () => ({ data: 1 }),
  useMarkRead: () => ({ mutateAsync: mocks.read }), useMarkUnread: () => ({ mutateAsync: mocks.unread }),
  useArchive: () => ({ mutateAsync: mocks.archive }), useUnarchive: () => ({ mutateAsync: mocks.unarchive }),
  useDeleteNotification: () => ({ mutateAsync: mocks.remove }), useReadAll: () => ({ mutateAsync: mocks.readAll }),
}))
function Location() { return <output data-testid="location">{useLocation().pathname}</output> }
function show() { return render(<MemoryRouter initialEntries={["/attention?tab=notifications"]}><AttentionCenterPage /><Location /></MemoryRouter>) }
beforeEach(() => {
  vi.clearAllMocks()
  mocks.row.actionUrl = "/tasks/task-1"
  mocks.row.readAt = null
  mocks.row.archivedAt = null
})
it.each(["/tasks/task-1", "/meetings/meeting-1"])("marks an inbox item read then navigates to %s", async path => {
  mocks.row.actionUrl = path
  show()
  expect(screen.getByText("پیگیری قرارداد")).toBeInTheDocument()
  await userEvent.click(screen.getByRole("button", { name: "مشاهده" }))
  await waitFor(() => expect(screen.getByTestId("location")).toHaveTextContent(path))
  expect(mocks.read).toHaveBeenCalledWith("notification-1")
})
it.each([null, "https://evil.example", "/\\evil.example"])("opens detail instead of navigating unsafe or missing URL %s", async url => {
  mocks.row.actionUrl = url
  show()
  await userEvent.click(screen.getByRole("button", { name: "مشاهده" }))
  expect(await screen.findByRole("dialog")).toHaveTextContent("پیگیری قرارداد")
  expect(screen.getByTestId("location")).toHaveTextContent("/attention")
})
it("shows archived state even if the notification was already read", () => {
  mocks.row.readAt = mocks.row.archivedAt = "2026-09-07T12:00:00Z"
  show()
  expect(screen.getByText("بایگانی‌شده")).toBeInTheDocument()
})
it("supports read-all through the existing API hook", async () => {
  show()
  await userEvent.click(screen.getByRole("button", { name: "خواندن همه" }))
  expect(mocks.readAll).toHaveBeenCalledOnce()
})
it.each([false, true])("supports archive/unarchive with archived=%s", async archived => {
  mocks.row.archivedAt = archived ? "2026-09-07T12:00:00Z" : null
  show()
  await userEvent.click(screen.getByRole("button", { name: "عملیات بیشتر" }))
  await userEvent.click(await screen.findByRole("menuitem", { name: archived ? "خروج از بایگانی" : "بایگانی" }))
  expect(archived ? mocks.unarchive : mocks.archive).toHaveBeenCalledWith("notification-1")
})
