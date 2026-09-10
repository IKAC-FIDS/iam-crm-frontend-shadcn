import { Bell, Building2, CalendarClock, ListChecks, ListTree, Pencil, RefreshCcw, Trash2, UserRoundCog } from "lucide-react"
import { useNavigate } from "react-router-dom"

import { EmptyState } from "@/components/shared/EmptyState"
import { EntityCardList, type EntityCardField } from "@/components/shared/EntityCardList"
import { IdentityAvatar } from "@/components/shared/IdentityAvatar"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { uiText } from "@/config/uiText"
import { formatJalaliDateTime } from "@/lib/date/jalali"
import { Button } from "@workspace/ui/components/button"

import type { Task } from "../types/task.types"
import { isTaskOverdue, taskContextLabel, taskPriorityLabel, taskPriorityTone, taskReviewStatusLabel, taskReviewStatusTone, taskStatusLabel, taskStatusTone } from "../utils/taskFormatters"
import type { TaskDialogAction } from "./TaskActionsMenu"

export function TaskList({ tasks, canCreate, canUpdate, canAssign, canDelete, onCreate, onEdit, onAction }: {
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
  const navigate = useNavigate()

  const fields: EntityCardField<Task>[] = [
    {
      id: "company",
      label: "شرکت / ارتباط",
      icon: Building2,
      render: (task) => {
        const companyName = task.company?.brandName || task.company?.legalName
        return <span className="inline-flex min-w-0 items-center gap-2">
          <IdentityAvatar name={companyName || taskContextLabel(task)} mediaPath={task.company?.id ? `/companies/${task.company.id}/logo` : null} hasMedia={Boolean(task.company?.id)} mediaVersion={task.company?.logoObjectKey} fallbackIcon={<Building2 className="size-4" />} className="size-8 rounded-xl text-[10px]" />
          <span className="truncate">{taskContextLabel(task)}</span>
        </span>
      },
    },
    {
      id: "assignee",
      label: text.table.assignee,
      icon: UserRoundCog,
      render: (task) => {
        const name = task.assignedTo?.fullName || task.assignedTo?.email || text.labels.unassigned
        return <span className="inline-flex min-w-0 items-center gap-2">
          <IdentityAvatar name={name} mediaPath={task.assignedTo?.id ? `/users/${task.assignedTo.id}/avatar` : null} hasMedia={Boolean(task.assignedTo?.id)} mediaVersion={task.assignedTo?.avatarObjectKey} className="size-8 rounded-xl text-[10px]" />
          <span className="min-w-0"><span className="block truncate">{name}</span><span className="block truncate text-[10px] font-normal text-[var(--app-text-secondary)]">{task.team?.name || assignmentScopeLabel(task.assignmentScope)}</span></span>
        </span>
      },
    },
    { id: "due", label: text.table.dueAt, icon: CalendarClock, render: (task) => <span className={isTaskOverdue(task) ? "font-bold text-[var(--destructive)]" : undefined}>{task.dueAt ? formatJalaliDateTime(task.dueAt) : text.labels.noDueDate}</span> },
    { id: "reminder", label: text.table.reminderAt, icon: Bell, render: (task) => task.reminderAt ? formatJalaliDateTime(task.reminderAt) : uiText.common.notAvailable },
    { id: "subtasks", label: "زیرکارها", icon: ListTree, render: (task) => {
      if (task.parentTaskId) return "زیرکار"
      const children = task.subtasks ?? []
      const resolved = children.filter((item) => item.status === "DONE" || item.status === "CANCELLED").length
      return `${resolved.toLocaleString("fa-IR")} از ${children.length.toLocaleString("fa-IR")}`
    } },
  ]

  return <EntityCardList
    rows={tasks}
    fields={fields}
    layout="row"
    density="compact"
    fieldsClassName="lg:grid-cols-3"
    getRowKey={(task) => task.id}
    onRowClick={(task) => navigate(`/tasks/${task.id}`)}
    title={(task) => task.title}
    subtitle={(task) => task.description || taskContextLabel(task)}
    media={() => <span className="grid size-12 place-items-center rounded-2xl bg-[var(--app-primary)] text-[var(--app-on-primary)] shadow-sm"><ListChecks className="size-5" /></span>}
    badges={(task) => <><StatusBadge tone={taskStatusTone(task.status)}>{taskStatusLabel(task.status)}</StatusBadge><StatusBadge tone={taskPriorityTone(task.priority)} dot={false}>{taskPriorityLabel(task.priority)}</StatusBadge><StatusBadge tone={taskReviewStatusTone(task.reviewStatus)}>{taskReviewStatusLabel(task.reviewStatus)}</StatusBadge></>}
    actions={(task) => <>
      {canUpdate ? <Button type="button" variant="ghost" size="sm" className="rounded-xl" onClick={() => onEdit(task)}><Pencil className="size-4" />{text.actions.edit}</Button> : null}
      {canAssign ? <Button type="button" variant="ghost" size="sm" className="rounded-xl" onClick={() => onAction(task, "assign")}><UserRoundCog className="size-4" />{text.actions.assign}</Button> : null}
      {canUpdate ? <Button type="button" variant="ghost" size="sm" className="rounded-xl" onClick={() => onAction(task, "status")}><RefreshCcw className="size-4" />{text.actions.changeStatus}</Button> : null}
      {canDelete ? <Button type="button" variant="ghost" size="sm" className="rounded-xl text-[var(--destructive)] hover:text-[var(--destructive)]" onClick={() => onAction(task, "delete")}><Trash2 className="size-4" />{text.actions.delete}</Button> : null}
    </>}
    emptyState={<EmptyState icon={ListChecks} title={text.empty.title} description={text.empty.description} action={canCreate ? <Button className="rounded-xl" onClick={onCreate}>{text.actions.create}</Button> : undefined} />}
  />
}

function assignmentScopeLabel(scope: Task["assignmentScope"]) {
  return { SELF: "شخصی", TEAM: "تیمی", ORGANIZATION: "سازمانی" }[scope]
}
