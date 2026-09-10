import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter } from "react-router-dom"
import { describe, expect, it, vi } from "vitest"

import type { Task } from "../types/task.types"
import { TaskList } from "./TaskList"

const task = {
  id: "task-1",
  title: "پیگیری قرارداد",
  description: "هماهنگی مرحله بعد",
  status: "TODO",
  priority: "HIGH",
  assignmentScope: "SELF",
  requiresReview: false,
  reviewStatus: "NOT_REQUIRED",
  createdAt: "2026-09-11T08:00:00.000Z",
  updatedAt: "2026-09-11T08:00:00.000Z",
  company: { id: "company-1", brandName: "شرکت نمونه" },
  assignedTo: { id: "user-1", fullName: "کاربر نمونه" },
} satisfies Task

describe("TaskList", () => {
  it("renders the unified card with all permitted actions visible", async () => {
    const user = userEvent.setup()
    const onEdit = vi.fn()
    const onAction = vi.fn()

    render(
      <MemoryRouter>
        <TaskList tasks={[task]} canCreate canUpdate canAssign canComplete canDelete onCreate={vi.fn()} onEdit={onEdit} onAction={onAction} />
      </MemoryRouter>
    )

    expect(screen.queryByRole("table")).not.toBeInTheDocument()
    expect(screen.getByText("شرکت نمونه")).toBeInTheDocument()
    expect(screen.getByText("کاربر نمونه")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /ویرایش/ })).toBeVisible()
    expect(screen.getByRole("button", { name: /تغییر مسئول/ })).toBeVisible()
    expect(screen.getByRole("button", { name: /تغییر وضعیت/ })).toBeVisible()
    expect(screen.getByRole("button", { name: /حذف/ })).toBeVisible()

    await user.click(screen.getByRole("button", { name: /ویرایش/ }))
    await user.click(screen.getByRole("button", { name: /تغییر مسئول/ }))
    expect(onEdit).toHaveBeenCalledWith(task)
    expect(onAction).toHaveBeenCalledWith(task, "assign")
  })
})
