import {
  AlertTriangle,
  Building2,
  CalendarClock,
  CheckCircle2,
  Circle,
  UserRound,
} from "lucide-react"
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
} from "../utils/taskFormatters"
import {
  TaskActionsMenu,
  type TaskDialogAction,
} from "./TaskActionsMenu"

type CommonProps = {
  canUpdate: boolean
  canAssign: boolean
  canComplete: boolean
  canDelete: boolean
  onEdit: (task: Task) => void
  onAction: (task: Task, action: TaskDialogAction) => void
}

export function TaskFocusView({
  tasks,
  canCreate,
  onCreate,
  ...actions
}: {
  tasks: Task[]
  canCreate: boolean
  onCreate: () => void
} & CommonProps) {
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
          danger
          {...actions}
        />
      ) : null}
      {active.length ? (
        <TaskGroup
          title={text.groups.active}
          icon={<Circle className="size-4" />}
          tasks={active}
          {...actions}
        />
      ) : null}
      {closed.length ? (
        <TaskGroup
          title={text.groups.closed}
          icon={<CheckCircle2 className="size-4" />}
          tasks={closed}
          muted
          {...actions}
        />
      ) : null}
    </div>
  )
}

function TaskGroup({
  title,
  icon,
  tasks,
  danger = false,
  muted = false,
  ...actions
}: {
  title: string
  icon: ReactNode
  tasks: Task[]
  danger?: boolean
  muted?: boolean
} & CommonProps) {
  return (
    <section className="min-w-0">
      <div className="mb-2 flex items-center gap-2">
        <span className={danger ? "text-[var(--destructive)]" : "text-[var(--app-primary)]"}>
          {icon}
        </span>
        <h2 className="text-sm font-bold text-[var(--app-heading)]">{title}</h2>
        <span className="rounded-full bg-[var(--app-background)] px-2 py-0.5 text-[9px] text-[var(--app-text-secondary)]">
          {tasks.length.toLocaleString("fa-IR")}
        </span>
      </div>
      <div className="grid gap-2">
        {tasks.map((task) => (
          <TaskRow key={task.id} task={task} muted={muted} {...actions} />
        ))}
      </div>
    </section>
  )
}

function TaskRow({
  task,
  muted,
  canUpdate,
  canAssign,
  canComplete,
  canDelete,
  onEdit,
  onAction,
}: { task: Task; muted: boolean } & CommonProps) {
  const overdue = isTaskOverdue(task)
  return (
    <article
      className={[
        "min-w-0 rounded-2xl border bg-[var(--app-surface)] p-3.5 shadow-[var(--app-shadow-card)] transition-colors sm:p-4",
        overdue
          ? "border-[var(--destructive)]/25"
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
            {overdue ? (
              <span className="rounded-full bg-[var(--destructive-soft)] px-2 py-1 text-[9px] font-bold text-[var(--destructive)]">
                {uiText.tasks.labels.overdue}
              </span>
            ) : null}
          </div>
          <h3 className="mt-2.5 text-sm font-bold leading-6 text-[var(--app-heading)]">
            {task.title}
          </h3>
          {task.description ? (
            <p className="mt-1 line-clamp-2 text-[10px] leading-5 text-[var(--app-text-secondary)]">
              {task.description}
            </p>
          ) : null}
        </div>
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

      <div className="mt-3 flex min-w-0 flex-wrap gap-x-4 gap-y-2 text-[10px] text-[var(--app-text-secondary)]">
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
