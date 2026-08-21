import { uiText } from "@/config/uiText"
import { formatJalaliDateTime } from "@/lib/date/jalali"
import type { Task, TaskPriority, TaskStatus } from "../types/task.types"

export const taskStatusLabel = (status: TaskStatus) => uiText.tasks.statuses[status]
export const taskPriorityLabel = (priority: TaskPriority) => uiText.tasks.priorities[priority]

export function taskStatusTone(status: TaskStatus) {
  if (status === "DONE") return "success" as const
  if (status === "CANCELLED") return "error" as const
  if (status === "IN_PROGRESS") return "info" as const
  return "warning" as const
}

export function taskPriorityTone(priority: TaskPriority) {
  if (priority === "STRATEGIC") return "error" as const
  if (priority === "HIGH") return "warning" as const
  if (priority === "MEDIUM") return "info" as const
  return "neutral" as const
}

export const isTaskClosed = (task: Task) =>
  task.status === "DONE" || task.status === "CANCELLED"

export function isTaskOverdue(task: Task) {
  return Boolean(
    task.dueAt &&
      !isTaskClosed(task) &&
      new Date(task.dueAt).getTime() < Date.now()
  )
}

export function taskContextLabel(task: Task) {
  return (
    task.opportunity?.title ||
    task.company?.brandName ||
    task.company?.legalName ||
    task.person?.fullName ||
    task.commercialDocument?.title ||
    task.commercialDocument?.number ||
    uiText.common.notAvailable
  )
}

export function taskDueLabel(task: Task) {
  return task.dueAt
    ? formatJalaliDateTime(task.dueAt)
    : uiText.tasks.labels.noDueDate
}
