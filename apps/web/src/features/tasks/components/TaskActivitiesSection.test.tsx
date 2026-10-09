import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"

import type { Task } from "../types/task.types"
import { TaskActivitiesSection } from "./TaskActivitiesSection"

const { activityDialog, refetch } = vi.hoisted(() => ({
  activityDialog: vi.fn(),
  refetch: vi.fn(),
}))

vi.mock("@/store/authStore", () => ({
  useAuthStore: (selector: (state: unknown) => unknown) =>
    selector({
      user: { permissions: ["activity:view", "activity:create"] },
    }),
}))

vi.mock("@/features/activities/hooks/useActivities", () => ({
  useTaskActivities: () => ({
    data: {
      data: [],
      meta: { page: 1, totalPages: 1, total: 0 },
    },
    isLoading: false,
    isError: false,
    isFetching: false,
    refetch,
  }),
}))

vi.mock("@/features/activities/components/ActivityFormDialog", () => ({
  ActivityFormDialog: (props: unknown) => {
    activityDialog(props)
    return <div role="dialog">فرم ثبت فعالیت</div>
  },
}))

const task: Task = {
  id: "task-1",
  title: "کار بسته‌شده",
  status: "DONE",
  priority: "MEDIUM",
  assignmentScope: "SELF",
  requiresReview: false,
  reviewStatus: "NOT_REQUIRED",
  createdAt: "2026-09-01T08:00:00.000Z",
  updatedAt: "2026-09-02T08:00:00.000Z",
}

describe("TaskActivitiesSection", () => {
  beforeEach(() => {
    activityDialog.mockClear()
    refetch.mockClear()
  })

  it("allows permitted users to register an activity for a completed task", async () => {
    const user = userEvent.setup()
    render(<TaskActivitiesSection task={task} />)

    const createButtons = screen.getAllByRole("button", {
      name: "ثبت فعالیت",
    })
    expect(createButtons.length).toBeGreaterThan(0)

    await user.click(createButtons[0]!)

    expect(screen.getByRole("dialog")).toHaveTextContent("فرم ثبت فعالیت")
    expect(activityDialog).toHaveBeenLastCalledWith(
      expect.objectContaining({
        initialTargetType: "TASK",
        initialTask: expect.objectContaining({
          id: "task-1",
          label: "کار بسته‌شده",
        }),
        lockTarget: true,
      }),
    )
  })
})
