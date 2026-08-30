import { EntityTableCell } from "@/components/shared/EntityTableCell"
import { ListChecks } from "lucide-react"
import { useNavigate } from "react-router-dom"

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
import { TaskActionsMenu, type TaskDialogAction } from "./TaskActionsMenu"

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
  onAction: (
    task: Task,
    action: TaskDialogAction
  ) => void
}) {
  const text = uiText.tasks
  const navigate = useNavigate()

  const columns: DataTableColumn<Task>[] = [
    {
      id: "task",
      header: text.table.task,
      className: "min-w-56",
      cell: (task) => (
        <EntityTableCell
          title={task.title}
          subtitle={taskContextLabel(task)}
          avatar={<ListChecks className="size-5" />}
        />
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
        <div><p>{task.assignedTo?.fullName || task.assignedTo?.email || text.labels.unassigned}</p><p className="text-xs text-[var(--app-text-secondary)]">{task.team?.name || ({ SELF: "شخصی", TEAM: "تیمی", ORGANIZATION: "سازمانی" }[task.assignmentScope || "SELF"])}</p></div>,
    },
    {
      id: "subtasks",
      header: "زیرکارها",
      className: "min-w-28",
      cell: (task) => {
        const children = task.subtasks ?? []
        const resolved = children.filter((item) => item.status === "DONE" || item.status === "CANCELLED").length
        return task.parentTaskId ? "زیرکار" : `${resolved.toLocaleString("fa-IR")} / ${children.length.toLocaleString("fa-IR")}`
      },
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
        <div
          onClick={(event) => event.stopPropagation()}
          onKeyDown={(event) => event.stopPropagation()}
        >
          <TaskActionsMenu
            onView={() => navigate(`/tasks/${task.id}`)}
            task={task}
            canUpdate={canUpdate}
            canAssign={canAssign}
            canComplete={canComplete}
            canDelete={canDelete}
            onEdit={() => onEdit(task)}
            onAction={(action) => onAction(task, action)}
          />
        </div>
      ),
    },
  ]

  return (
    <>
      <DataTableShell
        rows={tasks}
        columns={columns}
        getRowKey={(task) => task.id}
        onRowClick={(task) => navigate(`/tasks/${task.id}`)}
        mobile={{
          title: (task) => task.title,
          subtitle: taskContextLabel,
          avatar: () => <ListChecks className="size-5" />,
          status: (task) => <StatusBadge tone={taskStatusTone(task.status)}>{taskStatusLabel(task.status)}</StatusBadge>,
          fields: [
            { id: "priority", label: text.table.priority, render: (task) => <StatusBadge tone={taskPriorityTone(task.priority)} dot={false}>{taskPriorityLabel(task.priority)}</StatusBadge> },
            { id: "assignee", label: text.table.assignee, render: (task) => task.assignedTo?.fullName || task.assignedTo?.email || text.labels.unassigned },
            { id: "subtasks", label: "زیرکارها", render: (task) => task.parentTaskId ? "زیرکار" : `${(task.subtasks ?? []).filter((item) => item.status === "DONE" || item.status === "CANCELLED").length.toLocaleString("fa-IR")} / ${(task.subtasks?.length ?? 0).toLocaleString("fa-IR")}` },
            { id: "due", label: text.table.dueAt, render: (task) => task.dueAt ? formatJalaliDateTime(task.dueAt) : text.labels.noDueDate },
          ],
        }}
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
    </>
  )
}
