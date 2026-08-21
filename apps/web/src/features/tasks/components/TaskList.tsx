import { ListChecks } from "lucide-react"

import {
  DataTableShell,
  type DataTableColumn,
} from "@/components/shared/DataTableShell"
import { EmptyState } from "@/components/shared/EmptyState"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { uiText } from "@/config/uiText"
import { formatJalaliDateTime } from "@/lib/date/jalali"
import { Button } from "@workspace/ui/components/button"

import type { Task } from "../types/task.types"
import {
  isTaskOverdue,
  taskContextLabel,
  taskPriorityLabel,
  taskPriorityTone,
  taskStatusLabel,
  taskStatusTone,
} from "../utils/taskFormatters"
import {
  TaskActionsMenu,
  type TaskDialogAction,
} from "./TaskActionsMenu"

export function TaskList({
  tasks,
  canCreate,
  canUpdate,
  canAssign,
  canComplete,
  canDelete,
  onCreate,
  onEdit,
  onAction,
}: {
  tasks: Task[]
  canCreate: boolean
  canUpdate: boolean
  canAssign: boolean
  canComplete: boolean
  canDelete: boolean
  onCreate: () => void
  onEdit: (task: Task) => void
  onAction: (task: Task, action: TaskDialogAction) => void
}) {
  const text = uiText.tasks

  const columns: DataTableColumn<Task>[] = [
    {
      id: "task",
      header: text.table.task,
      className: "min-w-56",
      cell: (task) => (
        <div className="min-w-0">
          <p className="truncate text-xs font-bold">{task.title}</p>
          <p className="mt-1 truncate text-[9px] text-[var(--app-text-secondary)]">
            {taskContextLabel(task)}
          </p>
        </div>
      ),
    },
    {
      id: "status",
      header: text.table.status,
      className: "min-w-32",
      cell: (task) => (
        <StatusBadge tone={taskStatusTone(task.status)}>
          {taskStatusLabel(task.status)}
        </StatusBadge>
      ),
    },
    {
      id: "priority",
      header: text.table.priority,
      className: "min-w-28",
      cell: (task) => (
        <StatusBadge tone={taskPriorityTone(task.priority)} dot={false}>
          {taskPriorityLabel(task.priority)}
        </StatusBadge>
      ),
    },
    {
      id: "assignee",
      header: text.table.assignee,
      className: "min-w-40",
      cell: (task) =>
        task.assignedTo?.fullName ||
        task.assignedTo?.email ||
        text.labels.unassigned,
    },
    {
      id: "due",
      header: text.table.dueAt,
      className: "min-w-44",
      cell: (task) => (
        <span
          className={
            isTaskOverdue(task)
              ? "font-bold text-[var(--destructive)]"
              : undefined
          }
        >
          {task.dueAt
            ? formatJalaliDateTime(task.dueAt)
            : text.labels.noDueDate}
        </span>
      ),
    },
    {
      id: "reminder",
      header: text.table.reminderAt,
      className: "min-w-44",
      cell: (task) =>
        task.reminderAt
          ? formatJalaliDateTime(task.reminderAt)
          : uiText.common.notAvailable,
    },
    {
      id: "actions",
      header: text.table.actions,
      className: "w-16",
      cell: (task) => (
        <TaskActionsMenu
          task={task}
          canUpdate={canUpdate}
          canAssign={canAssign}
          canComplete={canComplete}
          canDelete={canDelete}
          onEdit={() => onEdit(task)}
          onAction={(action) => onAction(task, action)}
        />
      ),
    },
  ]

  return (
    <div className="w-full max-w-full overflow-x-auto">
      <div className="min-w-[900px]">
        <DataTableShell
          rows={tasks}
          columns={columns}
          getRowKey={(task) => task.id}
          emptyState={
            <EmptyState
              icon={ListChecks}
              title={text.empty.title}
              description={text.empty.description}
              action={
                canCreate ? (
                  <Button className="rounded-xl" onClick={onCreate}>
                    {text.actions.create}
                  </Button>
                ) : undefined
              }
            />
          }
        />
      </div>
    </div>
  )
}
