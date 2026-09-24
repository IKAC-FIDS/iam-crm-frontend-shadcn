import { Bell, Building2, CalendarClock, Eye, ListChecks, ListTree, Pencil, RefreshCcw, Trash2, UserRoundCog } from "lucide-react"
import { useNavigate } from "react-router-dom"

import { EmptyState } from "@/components/shared/EmptyState"
import { EntityCard, type EntityBadgeDescriptor, type EntityMetadataDescriptor } from "@/components/shared/EntityCard"
import type { EntityAction } from "@/components/shared/EntityRowActions"
import { IdentityAvatar } from "@/components/shared/IdentityAvatar"
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
  canDelete: boolean
  onCreate: () => void
  onEdit: (task: Task) => void
  onAction: (task: Task, action: TaskDialogAction) => void
}) {
  const text = uiText.tasks
  const navigate = useNavigate()

  if (!tasks.length) {
    return <EmptyState icon={ListChecks} title={text.empty.title} description={text.empty.description} action={canCreate ? <Button className="rounded-xl" onClick={onCreate}>{text.actions.create}</Button> : undefined} />
  }

  return <div className="grid gap-2.5">
    {tasks.map((task) => {
      const companyName = task.company?.brandName || task.company?.legalName || taskContextLabel(task)
      const assigneeName = task.assignedTo?.fullName || task.assignedTo?.email || text.labels.unassigned
      const children = task.subtasks ?? []
      const resolved = children.filter((item) => item.status === "DONE" || item.status === "CANCELLED").length
      const badges: EntityBadgeDescriptor[] = [
        { id: "status", label: taskStatusLabel(task.status), tone: taskStatusTone(task.status) },
        { id: "priority", label: taskPriorityLabel(task.priority), tone: taskPriorityTone(task.priority), dot: false },
        { id: "review", label: taskReviewStatusLabel(task.reviewStatus), tone: taskReviewStatusTone(task.reviewStatus) },
      ]
      const metadata: EntityMetadataDescriptor[] = [
        {
          id: "due",
          label: text.table.dueAt,
          value: task.dueAt ? formatJalaliDateTime(task.dueAt) : text.labels.noDueDate,
          icon: CalendarClock,
          className: isTaskOverdue(task) ? "text-[var(--destructive)]" : undefined,
        },
        {
          id: "reminder",
          label: text.table.reminderAt,
          value: task.reminderAt ? formatJalaliDateTime(task.reminderAt) : uiText.common.notAvailable,
          icon: Bell,
        },
        {
          id: "subtasks",
          label: "زیرکارها",
          value: task.parentTaskId ? "زیرکار" : `${resolved.toLocaleString("fa-IR")} از ${children.length.toLocaleString("fa-IR")}`,
          icon: ListTree,
        },
      ]
      const actions: EntityAction[] = [
        { id: "view", label: uiText.common.view, accessibleLabel: `مشاهده ${task.title}`, icon: Eye, onClick: () => navigate(`/tasks/${task.id}`) },
        { id: "edit", label: text.actions.edit, icon: Pencil, onClick: () => onEdit(task), visible: canUpdate },
        { id: "assign", label: text.actions.assign, icon: UserRoundCog, onClick: () => onAction(task, "assign"), visible: canAssign },
        { id: "status", label: text.actions.changeStatus, icon: RefreshCcw, onClick: () => onAction(task, "status"), visible: canUpdate },
        { id: "delete", label: text.actions.delete, icon: Trash2, onClick: () => onAction(task, "delete"), visible: canDelete, variant: "danger" },
      ]

      return <EntityCard
        key={task.id}
        id={task.id}
        title={task.title}
        subtitle={<><span>{taskContextLabel(task)}</span>{task.description ? <span> · {task.description}</span> : null}</>}
        ariaLabel={`کار: ${task.title}`}
        accentColor={taskAccentColor(task.status)}
        onClick={() => navigate(`/tasks/${task.id}`)}
        logo={<IdentityAvatar name={companyName} mediaPath={task.company?.id ? `/companies/${task.company.id}/logo` : null} hasMedia={Boolean(task.company?.logoObjectKey)} mediaVersion={task.company?.logoObjectKey} fallbackIcon={<Building2 className="size-5" />} className="size-14 rounded-2xl text-lg" imageClassName="object-contain bg-white p-1" />}
        badges={badges}
        owner={task.assignedTo ? {
          name: assigneeName,
          role: task.team?.name || assignmentScopeLabel(task.assignmentScope),
          avatar: <IdentityAvatar name={assigneeName} mediaPath={`/users/${task.assignedTo.id}/avatar`} hasMedia={Boolean(task.assignedTo.avatarObjectKey)} mediaVersion={task.assignedTo.avatarObjectKey} className="size-10 rounded-full text-xs" />,
        } : null}
        ownerFallback={text.labels.unassigned}
        metadata={metadata}
        actions={actions}
        actionLabel="عملیات کار"
      />
    })}
  </div>
}

function assignmentScopeLabel(scope: Task["assignmentScope"]) {
  return { SELF: "شخصی", TEAM: "تیمی", ORGANIZATION: "سازمانی" }[scope]
}

function taskAccentColor(status: Task["status"]) {
  return {
    TODO: "var(--warning)",
    IN_PROGRESS: "var(--info)",
    DONE: "var(--success)",
    CANCELLED: "var(--destructive)",
  }[status]
}
