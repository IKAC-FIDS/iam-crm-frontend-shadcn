import { beforeEach, expect, it, vi } from "vitest"
import { api } from "@/lib/api"
import { createSubtask, reassignTask } from "@/features/tasks/api/tasks.api"

vi.mock("@/lib/api", () => ({ api: { post: vi.fn() } }))

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(api.post).mockResolvedValue({ data: { data: { id: "task-2", title: "Child" } } })
})

it("uses the dedicated reassignment endpoint and preserves audit reason", async () => {
  await reassignTask("task-1", { assignmentScope: "TEAM", teamId: "team-1", assigneeId: "user-2", reason: "Capacity" })
  expect(api.post).toHaveBeenCalledWith("/tasks/task-1/reassign", {
    assignmentScope: "TEAM", teamId: "team-1", assigneeId: "user-2", reason: "Capacity",
  })
})

it("creates a new child through the explicit subtask endpoint", async () => {
  await createSubtask("task-1", { title: "Child", assignmentScope: "SELF", inheritLinkedEntity: true })
  expect(api.post).toHaveBeenCalledWith("/tasks/task-1/subtasks", {
    title: "Child", assignmentScope: "SELF", inheritLinkedEntity: true,
  })
})
