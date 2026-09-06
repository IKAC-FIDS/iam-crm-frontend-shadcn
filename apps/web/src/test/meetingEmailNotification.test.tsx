import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { beforeEach, describe, expect, it, vi } from "vitest"
import type { ReactNode } from "react"

import { uiText } from "@/config/uiText"
import { useAuthStore } from "@/store/authStore"
import { MeetingDetailPage } from "@/features/meetings/pages/MeetingDetailPage"
import { notifyMeetingAssignees } from "@/features/meetings/api/meetings.api"
import { api } from "@/lib/api"
import { response } from "./fixtures"

const mocks = vi.hoisted(() => ({
  mutateAsync: vi.fn(),
  pending: false,
  success: vi.fn(),
  warning: vi.fn(),
  error: vi.fn(),
  post: vi.fn(),
}))

const meeting = {
  id: "meeting-1",
  companyId: "company-1",
  title: "جلسه بررسی فنی",
  meetingTypeId: "type-1",
  type: { id: "type-1", code: "OTHER", label: "سایر", sortOrder: 1, isActive: true },
  mode: "ONLINE" as const,
  startAt: "2099-01-01T10:00:00.000Z",
  endAt: "2099-01-01T11:00:00.000Z",
  status: "SCHEDULED" as const,
  company: { id: "company-1", legalName: "شرکت نمونه" },
  assignees: [
    { userId: "user-2", user: { id: "user-2", fullName: "کاربر دوم", email: "two@example.com" } },
    { userId: "user-3", user: { id: "user-3", fullName: "کاربر سوم", email: null } },
  ],
  attendees: [],
}

vi.mock("@/features/meetings/hooks/useMeetings", () => ({
  useMeeting: () => ({ data: meeting, isLoading: false, isError: false, isFetching: false, refetch: vi.fn() }),
  useNotifyMeetingAssignees: () => ({ mutateAsync: mocks.mutateAsync, isPending: mocks.pending }),
}))
vi.mock("sonner", () => ({ toast: { success: mocks.success, warning: mocks.warning, error: mocks.error } }))
vi.mock("@/lib/api", () => ({ api: { post: mocks.post } }))
vi.mock("@/components/shared/PageHeader", () => ({ PageHeader: ({ title, actions }: { title: string; actions?: ReactNode }) => <div><h1>{title}</h1>{actions}</div> }))
vi.mock("@/features/artifacts/components/ArtifactPanel", () => ({ ArtifactPanel: () => null }))
vi.mock("@/features/people/components/Person360WorkspaceDialog", () => ({ Person360WorkspaceDialog: () => null }))
vi.mock("@/features/meetings/components/MeetingFormDialog", () => ({ MeetingFormDialog: () => null }))
vi.mock("@/features/meetings/components/MeetingStatusActionDialog", () => ({ MeetingStatusActionDialog: () => null }))

function renderPage() {
  return render(
    <MemoryRouter initialEntries={["/meetings/meeting-1"]}>
      <Routes><Route path="/meetings/:id" element={<MeetingDetailPage />} /></Routes>
    </MemoryRouter>
  )
}

function authorize(permissions = ["meeting:view", "meeting:update"]) {
  useAuthStore.setState({
    user: {
      id: "user-1",
      fullName: "مدیر",
      email: "admin@example.com",
      role: "ADMIN",
      permissions,
      organizationId: "organization-1",
      roleId: "role-1",
      roleCode: "ADMIN",
      roleName: "مدیر",
      team: null,
      teamId: null,
      teamCode: null,
      teamName: null,
    },
    accessToken: "token",
    status: "authenticated",
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  mocks.pending = false
  authorize()
  mocks.post.mockResolvedValue(response({ total: 0, sent: 0, skipped: 0, failed: 0, recipients: [] }))
})

describe("meeting email notification action", () => {
  it("uses one meeting-specific backend endpoint", async () => {
    await notifyMeetingAssignees(meeting.id)
    expect(api.post).toHaveBeenCalledTimes(1)
    expect(api.post).toHaveBeenCalledWith(`/meetings/${meeting.id}/notify-assignees`)
  })
  it("shows the authorized action and opens a confirmation with assignee count", async () => {
    renderPage()
    await userEvent.click(screen.getByRole("button", { name: uiText.meetings.actions.notifyAssignees }))
    expect(screen.getByText(uiText.meetings.detail.dialogs.notifyTitle)).toBeInTheDocument()
    expect(screen.getByText(/۲ مسئول/)).toBeInTheDocument()
  })

  it("confirms through one notification mutation and shows all-sent feedback", async () => {
    mocks.mutateAsync.mockResolvedValue({ total: 2, sent: 2, skipped: 0, failed: 0, recipients: [] })
    renderPage()
    await userEvent.click(screen.getByRole("button", { name: uiText.meetings.actions.notifyAssignees }))
    await userEvent.click(screen.getByRole("button", { name: uiText.meetings.detail.dialogs.notifyConfirm }))
    await waitFor(() => expect(mocks.mutateAsync).toHaveBeenCalledTimes(1))
    expect(mocks.mutateAsync).toHaveBeenCalledWith(meeting.id)
    expect(mocks.success).toHaveBeenCalledWith("اعلان ایمیل برای ۲ نفر ارسال شد.")
  })

  it("shows partial feedback for skipped and failed recipients", async () => {
    mocks.mutateAsync.mockResolvedValue({ total: 3, sent: 1, skipped: 1, failed: 1, recipients: [] })
    renderPage()
    await userEvent.click(screen.getByRole("button", { name: uiText.meetings.actions.notifyAssignees }))
    await userEvent.click(screen.getByRole("button", { name: uiText.meetings.detail.dialogs.notifyConfirm }))
    await waitFor(() => expect(mocks.warning).toHaveBeenCalledWith(expect.stringContaining("۱ موفق")))
    expect(mocks.warning).toHaveBeenCalledWith(expect.stringContaining("۱ ناموفق"))
  })

  it("disables the action while a notification request is pending", () => {
    mocks.pending = true
    renderPage()
    expect(screen.getByRole("button", { name: uiText.meetings.actions.notifyAssignees })).toBeDisabled()
  })

  it("hides the action without meeting:update permission", () => {
    authorize(["meeting:view"])
    renderPage()
    expect(screen.queryByRole("button", { name: uiText.meetings.actions.notifyAssignees })).not.toBeInTheDocument()
  })
})
