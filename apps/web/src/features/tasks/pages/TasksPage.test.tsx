import { render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { beforeEach, describe, expect, it, vi } from "vitest"

import type { TaskListQuery } from "../types/task.types"
import { TasksPage } from "./TasksPage"

let receivedQuery: TaskListQuery | undefined

const emptyInfiniteQuery = {
  data: { pages: [] },
  fetchNextPage: vi.fn(),
  hasNextPage: false,
  isFetchingNextPage: false,
  isLoading: false,
}

vi.mock("@/store/authStore", () => ({
  useAuthStore: (selector: (state: unknown) => unknown) =>
    selector({
      user: {
        id: "current-user",
        permissions: ["task:view", "task:view-organization", "task:create"],
      },
    }),
}))

vi.mock("../hooks/useTasks", () => ({
  useTasks: (query: TaskListQuery) => {
    receivedQuery = query
    return {
      data: {
        data: [],
        meta: { page: 1, limit: 20, total: 0, totalPages: 0 },
      },
      error: null,
      isError: false,
      isFetching: false,
      isLoading: false,
      refetch: vi.fn(),
    }
  },
  useTaskAssignees: () => emptyInfiniteQuery,
  useTaskTeams: () => emptyInfiniteQuery,
  useTaskOpportunityOptions: () => emptyInfiniteQuery,
}))

vi.mock("../components/TaskList", () => ({
  TaskList: () => <div>فهرست کارها</div>,
}))

vi.mock("../components/TaskFormDialog", () => ({
  TaskFormDialog: () => null,
}))

vi.mock("../components/TaskActionDialogs", () => ({
  TaskActionDialogs: () => null,
}))

describe("TasksPage query parameters", () => {
  beforeEach(() => {
    receivedQuery = undefined
  })

  it("preserves report deep-link creator and organization filters", () => {
    render(
      <MemoryRouter
        initialEntries={[
          "/tasks?page=1&createdById=creator-1&view=organization",
        ]}
      >
        <TasksPage />
      </MemoryRouter>
    )

    expect(screen.getByText("فهرست کارها")).toBeInTheDocument()
    expect(receivedQuery).toMatchObject({
      page: 1,
      createdById: "creator-1",
      view: "organization",
    })
    expect(
      screen.getByRole("button", { name: "کارهای سازمان" })
    ).toHaveAttribute("aria-pressed", "true")
  })
})
