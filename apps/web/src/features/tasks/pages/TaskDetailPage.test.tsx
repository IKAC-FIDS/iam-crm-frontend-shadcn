import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter } from "react-router-dom"
import { beforeEach, describe, expect, it, vi } from "vitest"

import type { Task } from "../types/task.types"
import { TaskDetailPage } from "./TaskDetailPage"

const { navigate, refetch, permissions } = vi.hoisted(() => ({
  navigate: vi.fn(),
  refetch: vi.fn(),
  permissions: [
    "task:view",
    "task:update",
    "task:assign",
    "task:create-subtask",
    "task:complete",
    "task:delete",
    "company:view",
  ],
}))

const task: Task = {
  id: "task-1",
  title: "پیگیری قرارداد",
  status: "IN_PROGRESS",
  priority: "HIGH",
  assignmentScope: "SELF",
  requiresReview: false,
  reviewStatus: "NOT_REQUIRED",
  companyId: "company-1",
  company: {
    id: "company-1",
    brandName: "شرکت نمونه",
    logoObjectKey: "company-logo",
  },
  assignedToId: "user-1",
  assignedTo: {
    id: "user-1",
    fullName: "مسئول نمونه",
    avatarObjectKey: "assignee-avatar",
  },
  createdById: "user-2",
  createdBy: {
    id: "user-2",
    fullName: "ایجادکننده نمونه",
    avatarObjectKey: "creator-avatar",
  },
  createdAt: "2026-09-01T08:00:00.000Z",
  updatedAt: "2026-09-02T08:00:00.000Z",
}

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>(
    "react-router-dom",
  )
  return {
    ...actual,
    useNavigate: () => navigate,
    useParams: () => ({ id: "task-1" }),
  }
})

vi.mock("@/store/authStore", () => ({
  useAuthStore: (selector: (state: unknown) => unknown) =>
    selector({ user: { id: "user-1", permissions } }),
}))

vi.mock("../hooks/useTasks", () => ({
  useTask: () => ({
    data: task,
    isLoading: false,
    isError: false,
    isFetching: false,
    refetch,
  }),
}))

vi.mock("@/components/shared/IdentityAvatar", () => ({
  IdentityAvatar: ({ name, mediaPath }: { name: string; mediaPath?: string }) => (
    <span data-testid="identity-avatar" data-media-path={mediaPath}>
      {name}
    </span>
  ),
}))

vi.mock("../components/TaskFormDialog", () => ({
  TaskFormDialog: () => null,
}))
vi.mock("../components/TaskActivitiesSection", () => ({
  TaskActivitiesSection: () => null,
}))
vi.mock("../components/TaskReviewSection", () => ({
  TaskReviewSection: () => null,
}))
vi.mock("@/features/artifacts/components/ArtifactPanel", () => ({
  ArtifactPanel: () => null,
}))
vi.mock("@/features/people/components/Person360WorkspaceDialog", () => ({
  Person360WorkspaceDialog: () => null,
}))
vi.mock("../components/TaskActionDialogs", () => ({
  TaskActionDialogs: ({
    action,
    onDeleted,
  }: {
    action?: string
    onDeleted?: () => void
  }) =>
    action === "delete" ? (
      <button type="button" onClick={onDeleted}>
        تأیید حذف آزمایشی
      </button>
    ) : null,
}))

describe("TaskDetailPage", () => {
  beforeEach(() => {
    navigate.mockClear()
    refetch.mockClear()
  })

  it("uses the standard hero actions and identity media endpoints", () => {
    render(
      <MemoryRouter initialEntries={["/tasks/task-1"]}>
        <TaskDetailPage />
      </MemoryRouter>,
    )

    expect(
      screen.getByRole("heading", { name: "پیگیری قرارداد" }),
    ).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "تکمیل" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "ویرایش" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "تغییر مسئول" })).toBeInTheDocument()

    const mediaPaths = screen
      .getAllByTestId("identity-avatar")
      .map((element) => element.getAttribute("data-media-path"))
    expect(mediaPaths).toContain("/companies/company-1/logo")
    expect(mediaPaths).toContain("/users/user-1/avatar")
    expect(mediaPaths).toContain("/users/user-2/avatar")
  })

  it("returns to the task list after a successful delete", async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={["/tasks/task-1"]}>
        <TaskDetailPage />
      </MemoryRouter>,
    )

    await user.click(screen.getByRole("button", { name: "حذف" }))
    await user.click(screen.getByRole("button", { name: "تأیید حذف آزمایشی" }))

    expect(navigate).toHaveBeenCalledWith("/tasks", { replace: true })
  })
})
