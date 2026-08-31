import {
  AlertTriangle,
  Building2,
  CalendarClock,
  CheckCircle2,
  Circle,
  UserRound,
} from "lucide-react"
import { useNavigate } from "react-router-dom"
import type { ReactNode } from "react"

import { EmptyState } from "@/components/shared/EmptyState"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { uiText } from "@/config/uiText"
import { Button } from "@workspace/ui/components/button"

import type { Task } from "../types/task.types"
import {
  isTaskOverdue,
  taskContextLabel,
  taskDueLabel,
  taskPriorityLabel,
  taskPriorityTone,
  taskStatusLabel,
  taskStatusTone,
  taskReviewStatusLabel,
  taskReviewStatusTone,
} from "../utils/taskFormatters"
import { TaskActionsMenu, type TaskDialogAction } from "./TaskActionsMenu"

export function TaskFocusView({
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

  if (!tasks.length) {
    return (
      <EmptyState
        icon={CheckCircle2}
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
    )
  }

  const overdue = tasks.filter(isTaskOverdue)
  const active = tasks.filter(
    (task) =>
      !isTaskOverdue(task) &&
      task.status !== "DONE" &&
      task.status !== "CANCELLED"
  )
  const closed = tasks.filter(
    (task) => task.status === "DONE" || task.status === "CANCELLED"
  )

  return (
    <div className="grid min-w-0 gap-5">
      {overdue.length ? (
        <TaskGroup
          title={text.groups.overdue}
          icon={<AlertTriangle className="size-4" />}
          tasks={overdue}
          emphasis="danger"
          {...{
            canUpdate,
            canAssign,
            canComplete,
            canDelete,
            onEdit,
            onAction,
          }}
        />
      ) : null}

      {active.length ? (
        <TaskGroup
          title={text.groups.active}
          icon={<Circle className="size-4" />}
          tasks={active}
          {...{
            canUpdate,
            canAssign,
            canComplete,
            canDelete,
            onEdit,
            onAction,
          }}
        />
      ) : null}

      {closed.length ? (
        <TaskGroup
          title={text.groups.closed}
          icon={<CheckCircle2 className="size-4" />}
          tasks={closed}
          muted
          {...{
            canUpdate,
            canAssign,
            canComplete,
            canDelete,
            onEdit,
            onAction,
          }}
        />
      ) : null}
    </div>
  )
}

function TaskGroup({
  title,
  icon,
  tasks,
  emphasis,
  muted = false,
  canUpdate,
  canAssign,
  canComplete,
  canDelete,
  onEdit,
  onAction,
}: {
  title: string
  icon: ReactNode
  tasks: Task[]
  emphasis?: "danger"
  muted?: boolean
  canUpdate: boolean
  canAssign: boolean
  canComplete: boolean
  canDelete: boolean
  onEdit: (task: Task) => void
  onAction: (
    task: Task,
    action: TaskDialogAction
  ) => void
}) {
  return (
    <section className="min-w-0">
      <div className="mb-2 flex items-center gap-2">
        <span
          className={
            emphasis === "danger"
              ? "text-[var(--destructive)]"
              : "text-[var(--app-primary)]"
          }
        >
          {icon}
        </span>
        <h2 className="text-sm font-bold text-[var(--app-heading)]">{title}</h2>
        <span className="rounded-full bg-[var(--app-background)] px-2 py-0.5 text-xs text-[var(--app-text-secondary)]">
          {tasks.length.toLocaleString("fa-IR")}
        </span>
      </div>

      <div className="grid gap-2">
        {tasks.map((task) => (
          <TaskFocusRow
            key={task.id}
            task={task}
            muted={muted}
            canUpdate={canUpdate}
            canAssign={canAssign}
            canComplete={canComplete}
            canDelete={canDelete}
            onEdit={onEdit}
            onAction={onAction}
          />
        ))}
      </div>
    </section>
  )
}

function TaskFocusRow({
  task,
  muted,
  canUpdate,
  canAssign,
  canComplete,
  canDelete,
  onEdit,
  onAction,
}: {
  task: Task
  muted: boolean
  canUpdate: boolean
  canAssign: boolean
  canComplete: boolean
  canDelete: boolean
  onEdit: (task: Task) => void
  onAction: (
    task: Task,
    action: TaskDialogAction
  ) => void
}) {
  const navigate = useNavigate()
  const overdue = isTaskOverdue(task)

  function openTask() {
    navigate(`/tasks/${task.id}`)
  }

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={openTask}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault()
          openTask()
        }
      }}
      className={[
        "min-w-0 cursor-pointer rounded-2xl border bg-[var(--app-surface)] p-3.5 shadow-[var(--app-shadow-card)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-primary)]/30 sm:p-4",
        overdue
          ? "border-[var(--destructive)]/25 hover:border-[var(--destructive)]/45"
          : "border-[var(--app-divider)] hover:border-[var(--app-primary)]/25",
        muted ? "opacity-75" : "",
      ].join(" ")}
    >
      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <StatusBadge tone={taskStatusTone(task.status)}>
              {taskStatusLabel(task.status)}
            </StatusBadge>
            <StatusBadge tone={taskPriorityTone(task.priority)} dot={false}>
              {taskPriorityLabel(task.priority)}
            </StatusBadge>
            <StatusBadge tone={taskReviewStatusTone(task.reviewStatus)}>{taskReviewStatusLabel(task.reviewStatus)}</StatusBadge>
            {overdue ? (
              <span className="rounded-full bg-[var(--destructive-soft)] px-2 py-1 text-xs font-bold text-[var(--destructive)]">
                {uiText.tasks.labels.overdue}
              </span>
            ) : null}
          </div>
          <h3 className="mt-2.5 text-sm font-bold leading-6 text-[var(--app-heading)]">
            {task.title}
          </h3>
          {task.description ? (
            <p className="mt-1 line-clamp-2 text-xs leading-5 text-[var(--app-text-secondary)]">
              {task.description}
            </p>
          ) : null}
        </div>

        <div
          onClick={(event) => event.stopPropagation()}
          onKeyDown={(event) => event.stopPropagation()}
        >
          <TaskActionsMenu
            task={task}
            canUpdate={canUpdate}
            canAssign={canAssign}
            canComplete={canComplete}
            canDelete={canDelete}
            onEdit={() => onEdit(task)}
            onAction={(action) => onAction(task, action)}
          />
        </div>
      </div>

      <div className="mt-3 flex min-w-0 flex-wrap gap-x-4 gap-y-2 text-xs text-[var(--app-text-secondary)]">
        <span className="inline-flex min-w-0 items-center gap-1.5">
          <Building2 className="size-3.5 shrink-0" />
          <span className="truncate">{taskContextLabel(task)}</span>
        </span>
        <span
          className={[
            "inline-flex items-center gap-1.5",
            overdue ? "font-bold text-[var(--destructive)]" : "",
          ].join(" ")}
        >
          <CalendarClock className="size-3.5" />
          {taskDueLabel(task)}
        </span>
        <span className="inline-flex min-w-0 items-center gap-1.5">
          <UserRound className="size-3.5 shrink-0" />
          <span className="truncate">
            {task.assignedTo?.fullName ||
              task.assignedTo?.email ||
              uiText.tasks.labels.unassigned}
          </span>
        </span>
      </div>
    </article>
  )
}

