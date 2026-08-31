import {
  ArrowRight,
  Bell,
  BriefcaseBusiness,
  Building2,
  CalendarClock,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  FileText,
  Pencil,
  RefreshCcw,
  Trash2,
  UserRound,
  UserRoundCog,
  XCircle,
  ListPlus,
  GitBranch,
  History,
  CalendarDays,
  Activity as ActivityIcon,
  Package,
} from "lucide-react"
import { useState, type ReactNode } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"

import { ErrorState } from "@/components/shared/ErrorState"
import { LoadingState } from "@/components/shared/LoadingState"
import { PageHeader } from "@/components/shared/PageHeader"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { SurfaceCard } from "@/components/shared/SurfaceCard"
import { uiText } from "@/config/uiText"
import { Person360WorkspaceDialog } from "@/features/people/components/Person360WorkspaceDialog"
import { ArtifactPanel } from "@/features/artifacts/components/ArtifactPanel"
import { formatJalaliDateTime } from "@/lib/date/jalali"
import { useAuthStore } from "@/store/authStore"
import { Button } from "@workspace/ui/components/button"

import {
  TaskActionDialogs,
  type TaskDialogAction,
} from "../components/TaskActionDialogs"
import { TaskFormDialog } from "../components/TaskFormDialog"
import { TaskReviewSection } from "../components/TaskReviewSection"
import { TaskActivitiesSection } from "../components/TaskActivitiesSection"
import { canReassignTask } from "../taskPermissions"
import { useTask } from "../hooks/useTasks"
import type { Task } from "../types/task.types"
import {
  isTaskOverdue,
  taskPriorityLabel,
  taskPriorityTone,
  taskStatusLabel,
  taskStatusTone,
} from "../utils/taskFormatters"

export function TaskDetailPage() {
  const { id = "" } = useParams()
  const navigate = useNavigate()
  const text = uiText.tasks
  const detail = text.detail
  const permissions = useAuthStore((state) => state.user?.permissions ?? [])

  const canView = permissions.includes("task:view")
  const canUpdate = permissions.includes("task:update")
  const canAssign = canReassignTask(permissions)
  const canCreateSubtask = permissions.includes("task:create-subtask") || permissions.includes("task:create")
  const canComplete = permissions.includes("task:complete")
  const canDelete = permissions.includes("task:delete")
  const canViewCompany = permissions.includes("company:view")
  const canViewOpportunity = permissions.includes("opportunity:view")
  const canViewPerson = permissions.includes("person:view")
  const canViewAudit = permissions.includes("audit-log:view") || permissions.includes("audit:view")

  const taskQuery = useTask(id, canView)
  const [editOpen, setEditOpen] = useState(false)
  const [action, setAction] = useState<TaskDialogAction>()
  const [personId, setPersonId] = useState<string | null>(null)

  if (!canView) {
    return (
      <ErrorState
        title={text.errors.permissionTitle}
        description={text.errors.permissionDescription}
      />
    )
  }

  if (taskQuery.isLoading) {
    return (
      <div className="mx-auto w-full max-w-[1500px]">
        <LoadingState rows={7} />
      </div>
    )
  }

  if (taskQuery.isError || !taskQuery.data) {
    return (
      <div className="mx-auto w-full max-w-[1500px]">
        <ErrorState
          title={detail.errors.loadTitle}
          description={detail.errors.loadDescription}
          retryLabel={uiText.common.retry}
          onRetry={() => void taskQuery.refetch()}
        />
      </div>
    )
  }

  const task = taskQuery.data
  const closed = task.status === "DONE" || task.status === "CANCELLED"

  return (
    <div className="mx-auto grid w-full max-w-[1500px] min-w-0 gap-4">
      <div>
        <Button
          variant="ghost"
          size="sm"
          className="mb-2 rounded-xl text-[var(--app-text-secondary)]"
          onClick={() => navigate("/tasks")}
        >
          <ArrowRight className="size-4" />
          {detail.actions.back}
        </Button>

        <PageHeader
          title={task.title}
          description={detail.description}
          actions={
            <>
              {canUpdate ? (
                <Button
                  variant="outline"
                  className="rounded-xl"
                  onClick={() => setEditOpen(true)}
                >
                  <Pencil className="size-4" />
                  {text.actions.edit}
                </Button>
              ) : null}
              {canAssign ? (
                <Button
                  variant="outline"
                  className="rounded-xl"
                  onClick={() => setAction("assign")}
                >
                  <UserRoundCog className="size-4" />
                  {text.actions.assign}
                </Button>
              ) : null}
              {canCreateSubtask && !closed ? (
                <Button variant="outline" className="rounded-xl" onClick={() => setAction("subtask")}>
                  <ListPlus className="size-4" />
                  ایجاد زیرکار
                </Button>
              ) : null}
              {canComplete && !closed ? (
                <Button
                  variant="outline"
                  className="rounded-xl border-[var(--success)]/30 text-[var(--success)] hover:bg-[var(--success-light)]"
                  onClick={() => setAction("complete")}
                  disabled={task.requiresReview && task.reviewStatus !== "APPROVED"}
                >
                  <CheckCircle2 className="size-4" />
                  {text.actions.complete}
                </Button>
              ) : null}
              {canUpdate ? (
                <Button
                  variant="outline"
                  className="rounded-xl"
                  onClick={() => setAction("status")}
                >
                  <RefreshCcw className="size-4" />
                  {text.actions.changeStatus}
                </Button>
              ) : null}
              {canDelete ? (
                <Button
                  variant="outline"
                  className="rounded-xl border-[var(--destructive)]/30 text-[var(--destructive)] hover:bg-[var(--destructive-soft)]"
                  onClick={() => setAction("delete")}
                >
                  <Trash2 className="size-4" />
                  {text.actions.delete}
                </Button>
              ) : null}
            </>
          }
        />
      </div>

      <TaskHero task={task} />

      <div className="grid min-w-0 items-start gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(310px,380px)]">
        <main className="grid min-w-0 gap-4">
          <ScheduleCard
            task={task}
            canUpdate={canUpdate}
            onReschedule={() => setAction("reschedule")}
          />
          <DescriptionCard task={task} />
          <OutcomeCard task={task} />
          <SubtasksCard task={task} canCreate={canCreateSubtask && !closed} onCreate={() => setAction("subtask")} />
          <TaskActivitiesSection task={task} />
          {task.requiresReview ? <TaskReviewSection task={task} /> : null}
          <ArtifactPanel entityType="TASK" entityId={task.id} title="فایل‌ها و مراجع کار" />
        </main>

        <aside className="grid min-w-0 gap-4 xl:sticky xl:top-4">
          <ContextCard
            task={task}
            canViewCompany={canViewCompany}
            canViewOpportunity={canViewOpportunity}
            canViewPerson={canViewPerson}
            onPerson={() => setPersonId(task.person?.id || null)}
          />
          <OwnershipCard task={task} />
          <LifecycleCard task={task} />
          {canViewAudit ? <AuditLinkCard taskId={task.id} /> : null}
        </aside>
      </div>

      {editOpen ? (
        <TaskFormDialog
          open
          onOpenChange={setEditOpen}
          task={task}
          onSaved={() => void taskQuery.refetch()}
        />
      ) : null}

      <TaskActionDialogs
        task={task}
        action={action}
        onClose={() => {
          setAction(undefined)
          void taskQuery.refetch()
        }}
      />

      <Person360WorkspaceDialog
        personId={personId}
        open={Boolean(personId) && canViewPerson}
        onOpenChange={(open) => {
          if (!open) setPersonId(null)
        }}
      />
    </div>
  )
}

function TaskHero({ task }: { task: Task }) {
  const detail = uiText.tasks.detail
  const overdue = isTaskOverdue(task)
  return (
    <SurfaceCard className="relative min-w-0 overflow-hidden">
      <div
        className={[
          "absolute inset-y-0 start-0 w-1",
          overdue ? "bg-[var(--destructive)]" : "bg-[var(--app-primary)]",
        ].join(" ")}
      />
      <div className="grid min-w-0 gap-4 p-4 ps-5 sm:p-5 sm:ps-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge tone={taskStatusTone(task.status)}>
              {taskStatusLabel(task.status)}
            </StatusBadge>
            <StatusBadge tone={taskPriorityTone(task.priority)} dot={false}>
              {taskPriorityLabel(task.priority)}
            </StatusBadge>
            {overdue ? (
              <span className="rounded-full bg-[var(--destructive-soft)] px-2.5 py-1 text-xs font-bold text-[var(--destructive)]">
                {uiText.tasks.labels.overdue}
              </span>
            ) : null}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-[var(--app-text-secondary)]">
            <span className="inline-flex items-center gap-2">
              <CalendarClock className="size-4 text-[var(--app-primary)]" />
              {detail.labels.due}:{" "}
              <strong
                className={
                  overdue
                    ? "text-[var(--destructive)]"
                    : "text-[var(--app-heading)]"
                }
              >
                {task.dueAt
                  ? formatJalaliDateTime(task.dueAt)
                  : uiText.tasks.labels.noDueDate}
              </strong>
            </span>
            <span className="inline-flex items-center gap-2">
              <Bell className="size-4 text-[var(--app-primary-alt)]" />
              {detail.labels.reminder}:{" "}
              {task.reminderAt
                ? formatJalaliDateTime(task.reminderAt)
                : detail.labels.noReminder}
            </span>
          </div>
        </div>

        <div className="min-w-0 rounded-2xl bg-[var(--app-background)] px-4 py-3">
          <p className="text-xs text-[var(--app-text-secondary)]">
            {detail.labels.assignee}
          </p>
          <p className="mt-1 truncate text-xs font-bold text-[var(--app-heading)]">
            {task.assignedTo?.fullName ||
              task.assignedTo?.email ||
              uiText.tasks.labels.unassigned}
          </p>
        </div>
      </div>
    </SurfaceCard>
  )
}

function ScheduleCard({
  task,
  canUpdate,
  onReschedule,
}: {
  task: Task
  canUpdate: boolean
  onReschedule: () => void
}) {
  const detail = uiText.tasks.detail
  return (
    <SurfaceCard className="min-w-0 overflow-hidden">
      <SectionHeader
        icon={<CalendarClock className="size-4" />}
        title={detail.sections.schedule}
        action={
          canUpdate && task.status !== "DONE" && task.status !== "CANCELLED" ? (
            <Button
              size="sm"
              variant="outline"
              className="h-8 rounded-xl text-xs"
              onClick={onReschedule}
            >
              <RefreshCcw className="size-3.5" />
              {uiText.tasks.actions.reschedule}
            </Button>
          ) : undefined
        }
      />
      <div className="grid gap-3 p-4 sm:grid-cols-2 sm:p-5">
        <InfoBox
          icon={<CalendarClock className="size-4" />}
          label={detail.labels.due}
          value={
            task.dueAt
              ? formatJalaliDateTime(task.dueAt)
              : uiText.tasks.labels.noDueDate
          }
        />
        <InfoBox
          icon={<Bell className="size-4" />}
          label={detail.labels.reminder}
          value={
            task.reminderAt
              ? formatJalaliDateTime(task.reminderAt)
              : detail.labels.noReminder
          }
        />
      </div>
    </SurfaceCard>
  )
}

function DescriptionCard({ task }: { task: Task }) {
  const detail = uiText.tasks.detail
  return (
    <SurfaceCard className="min-w-0 overflow-hidden">
      <SectionHeader
        icon={<FileText className="size-4" />}
        title={detail.sections.description}
      />
      <div className="p-4 sm:p-5">
        <p
          className={[
            "whitespace-pre-wrap text-xs leading-7",
            task.description?.trim()
              ? "text-[var(--app-heading)]"
              : "text-[var(--app-text-secondary)]",
          ].join(" ")}
        >
          {task.description?.trim() || detail.empty.description}
        </p>
      </div>
    </SurfaceCard>
  )
}

function OutcomeCard({ task }: { task: Task }) {
  const detail = uiText.tasks.detail

  if (task.status === "DONE") {
    return (
      <SurfaceCard className="min-w-0 overflow-hidden">
        <SectionHeader
          icon={<CheckCircle2 className="size-4" />}
          title={detail.sections.outcome}
        />
        <div className="p-4 sm:p-5">
          <p className="whitespace-pre-wrap text-xs leading-7 text-[var(--app-heading)]">
            {task.completionNote?.trim() || detail.empty.completionNote}
          </p>
        </div>
      </SurfaceCard>
    )
  }

  if (task.status === "CANCELLED") {
    return (
      <SurfaceCard className="min-w-0 overflow-hidden">
        <SectionHeader
          icon={<XCircle className="size-4" />}
          title={detail.sections.cancellation}
        />
        <div className="p-4 sm:p-5">
          <p className="whitespace-pre-wrap text-xs leading-7 text-[var(--app-heading)]">
            {task.cancelReason?.trim() || detail.empty.cancelReason}
          </p>
        </div>
      </SurfaceCard>
    )
  }

  return (
    <SurfaceCard className="min-w-0 overflow-hidden">
      <SectionHeader
        icon={<CheckCircle2 className="size-4" />}
        title={detail.sections.outcome}
      />
      <div className="p-4 sm:p-5">
        <div className="rounded-2xl border border-dashed border-[var(--app-divider)] bg-[var(--app-background)]/55 p-5 text-center">
          <p className="text-xs leading-6 text-[var(--app-text-secondary)]">
            {detail.empty.activeOutcome}
          </p>
        </div>
      </div>
    </SurfaceCard>
  )
}

function ContextCard({
  task,
  canViewCompany,
  canViewOpportunity,
  canViewPerson,
  onPerson,
}: {
  task: Task
  canViewCompany: boolean
  canViewOpportunity: boolean
  canViewPerson: boolean
  onPerson: () => void
}) {
  const detail = uiText.tasks.detail

  return (
    <SurfaceCard className="min-w-0 overflow-hidden">
      <SectionHeader
        icon={<BriefcaseBusiness className="size-4" />}
        title={detail.sections.context}
      />
      <div className="grid gap-3 p-4">
        <ContextLink
          icon={<Building2 className="size-4" />}
          label={detail.labels.company}
          value={
            task.company?.brandName ||
            task.company?.legalName ||
            uiText.common.notAvailable
          }
          to={
            canViewCompany && task.companyId
              ? `/companies/${task.companyId}`
              : undefined
          }
        />
        {task.meeting ? <ContextLink icon={<CalendarDays className="size-4" />} label="جلسه" value={task.meeting.title} to={`/meetings/${task.meeting.id}`} /> : null}
        {task.activity ? <ContextLink icon={<ActivityIcon className="size-4" />} label="فعالیت" value={task.activity.type} to="/activities" /> : null}
        {task.product ? <ContextLink icon={<Package className="size-4" />} label="محصول" value={`${task.product.name} (${task.product.code})`} to="/admin/libraries/products" /> : null}
        <ContextLink
          icon={<BriefcaseBusiness className="size-4" />}
          label={detail.labels.opportunity}
          value={task.opportunity?.title || uiText.common.notAvailable}
          to={
            canViewOpportunity && task.opportunity?.id
              ? `/opportunities/${task.opportunity.id}`
              : undefined
          }
        />
        <ContextButton
          icon={<UserRound className="size-4" />}
          label={detail.labels.person}
          value={task.person?.fullName || uiText.common.notAvailable}
          enabled={canViewPerson && Boolean(task.person?.id)}
          onClick={onPerson}
        />
        <ContextLink
          icon={<FileText className="size-4" />}
          label={detail.labels.document}
          value={
            task.commercialDocument?.title ||
            task.commercialDocument?.number ||
            uiText.common.notAvailable
          }
          to={
            canViewOpportunity &&
            task.opportunity?.id &&
            task.commercialDocument?.id
              ? `/opportunities/${task.opportunity.id}`
              : undefined
          }
        />
        <ContextLink
          icon={<CircleDollarSign className="size-4" />}
          label={detail.labels.payment}
          value={
            task.payment
              ? `${Number(task.payment.amount || 0).toLocaleString("fa-IR")} ${
                  task.payment.currency || ""
                }`.trim()
              : uiText.common.notAvailable
          }
          to={
            canViewOpportunity && task.opportunity?.id && task.payment?.id
              ? `/opportunities/${task.opportunity.id}`
              : undefined
          }
        />
      </div>
    </SurfaceCard>
  )
}

function OwnershipCard({ task }: { task: Task }) {
  const detail = uiText.tasks.detail
  return (
    <SurfaceCard className="min-w-0 overflow-hidden">
      <SectionHeader
        icon={<UserRoundCog className="size-4" />}
        title={detail.sections.ownership}
      />
      <div className="grid gap-3 p-4">
        <InfoBox icon={<GitBranch className="size-4" />} label="دامنه واگذاری" value={{ SELF: "خودم", TEAM: "تیم", ORGANIZATION: "سازمان" }[task.assignmentScope || "SELF"]} />
        {task.team ? <InfoBox icon={<UserRoundCog className="size-4" />} label="تیم" value={`${task.team.name} (${task.team.code})`} /> : null}
        <InfoBox
          icon={<UserRoundCog className="size-4" />}
          label={detail.labels.assignee}
          value={
            task.assignedTo?.fullName ||
            task.assignedTo?.email ||
            uiText.tasks.labels.unassigned
          }
        />
        <InfoBox
          icon={<UserRound className="size-4" />}
          label={detail.labels.createdBy}
          value={
            task.createdBy?.fullName ||
            task.createdBy?.email ||
            uiText.common.notAvailable
          }
        />
        {task.status === "DONE" ? (
          <InfoBox
            icon={<CheckCircle2 className="size-4" />}
            label={detail.labels.completedBy}
            value={
              task.completedBy?.fullName ||
              task.completedBy?.email ||
              uiText.common.notAvailable
            }
          />
        ) : null}
      </div>
    </SurfaceCard>
  )
}

function SubtasksCard({ task, canCreate, onCreate }: { task: Task; canCreate: boolean; onCreate: () => void }) {
  const children = task.subtasks ?? []
  const resolved = children.filter((item) => item.status === "DONE" || item.status === "CANCELLED").length
  const percent = children.length ? Math.round((resolved / children.length) * 100) : 0
  return <SurfaceCard className="min-w-0 overflow-hidden">
    <SectionHeader icon={<GitBranch className="size-4" />} title={`زیرکارها · ${resolved.toLocaleString("fa-IR")} از ${children.length.toLocaleString("fa-IR")}`} action={canCreate ? <Button size="sm" variant="outline" className="rounded-xl" onClick={onCreate}><ListPlus className="size-4" />ایجاد زیرکار</Button> : undefined} />
    <div className="grid gap-3 p-4 sm:p-5">
      {children.length ? <><div className="h-2 overflow-hidden rounded-full bg-[var(--app-background)]"><div className="h-full bg-[var(--app-primary)]" style={{ width: `${percent}%` }} /></div>{children.map((child) => <Link key={child.id} to={`/tasks/${child.id}`} className="grid gap-2 rounded-xl border p-3 transition hover:bg-[var(--app-primary-soft)]/30 sm:grid-cols-[1fr_auto] sm:items-center"><div><p className="font-bold">{child.title}</p><p className="mt-1 text-xs text-[var(--app-text-secondary)]">{child.assignedTo?.fullName || child.assignedTo?.email || uiText.tasks.labels.unassigned}</p></div><StatusBadge tone={taskStatusTone(child.status)}>{taskStatusLabel(child.status)}</StatusBadge></Link>)}</> : <p className="text-xs text-[var(--app-text-secondary)]">هنوز زیرکاری ثبت نشده است.</p>}
      {task.parentTask ? <Link to={`/tasks/${task.parentTask.id}`} className="rounded-xl bg-[var(--app-background)] p-3 text-xs text-[var(--app-primary)]">کار والد: {task.parentTask.title}</Link> : null}
    </div>
  </SurfaceCard>
}

function LifecycleCard({ task }: { task: Task }) {
  const detail = uiText.tasks.detail
  const items = [
    {
      label: detail.lifecycle.created,
      value: task.createdAt ? formatJalaliDateTime(task.createdAt) : null,
    },
    {
      label: detail.lifecycle.updated,
      value: task.updatedAt ? formatJalaliDateTime(task.updatedAt) : null,
    },
    {
      label: detail.lifecycle.completed,
      value: task.completedAt ? formatJalaliDateTime(task.completedAt) : null,
    },
    {
      label: detail.lifecycle.cancelled,
      value: task.cancelledAt ? formatJalaliDateTime(task.cancelledAt) : null,
    },
  ].filter((item) => item.value)

  return (
    <SurfaceCard className="min-w-0 overflow-hidden">
      <SectionHeader
        icon={<Clock3 className="size-4" />}
        title={detail.sections.lifecycle}
      />
      <div className="grid gap-0 p-4">
        {items.map((item) => (
          <div
            key={item.label}
            className="relative border-s border-[var(--app-divider)] ps-5 pb-5 last:pb-0"
          >
            <span className="absolute -start-1.5 top-1 size-3 rounded-full border-2 border-[var(--app-surface)] bg-[var(--app-primary)]" />
            <p className="text-xs text-[var(--app-text-secondary)]">
              {item.label}
            </p>
            <p className="mt-1 text-xs leading-5 font-bold text-[var(--app-heading)]">
              {item.value}
            </p>
          </div>
        ))}
      </div>
    </SurfaceCard>
  )
}

function AuditLinkCard({ taskId }: { taskId: string }) {
  return <SurfaceCard className="min-w-0 overflow-hidden">
    <SectionHeader icon={<History className="size-4" />} title="فعالیت و تاریخچه" />
    <div className="p-4">
      <Button variant="outline" className="w-full rounded-xl" render={<Link to={`/admin/audit-logs?entityType=task&entityId=${taskId}`} />}>
        <History className="size-4" />مشاهده رویدادهای ممیزی
      </Button>
    </div>
  </SurfaceCard>
}

function SectionHeader({
  icon,
  title,
  action,
}: {
  icon: ReactNode
  title: string
  action?: ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-[var(--app-divider)] px-4 py-3 sm:px-5">
      <div className="flex min-w-0 items-center gap-2">
        <span className="shrink-0 text-[var(--app-primary)]">{icon}</span>
        <h2 className="truncate text-sm font-bold text-[var(--app-heading)]">
          {title}
        </h2>
      </div>
      {action}
    </div>
  )
}

function InfoBox({
  icon,
  label,
  value,
}: {
  icon: ReactNode
  label: string
  value: string
}) {
  return (
    <div className="min-w-0 rounded-2xl bg-[var(--app-background)] p-3">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 shrink-0 text-[var(--app-primary)]">{icon}</span>
        <div className="min-w-0">
          <p className="text-xs text-[var(--app-text-secondary)]">{label}</p>
          <p className="mt-1 break-words text-xs font-bold text-[var(--app-heading)]">
            {value}
          </p>
        </div>
      </div>
    </div>
  )
}

function ContextLink({
  icon,
  label,
  value,
  to,
}: {
  icon: ReactNode
  label: string
  value: string
  to?: string
}) {
  const body = (
    <div className="flex min-w-0 items-center gap-3">
      <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-[var(--app-primary-soft)] text-[var(--app-primary)]">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-[var(--app-text-secondary)]">{label}</p>
        <p className="mt-1 truncate text-xs font-bold text-[var(--app-heading)]">
          {value}
        </p>
      </div>
    </div>
  )

  return to ? (
    <Link
      to={to}
      className="rounded-2xl border border-[var(--app-divider)] p-3 transition-colors hover:bg-[var(--app-primary-soft)]/35"
    >
      {body}
    </Link>
  ) : (
    <div className="rounded-2xl border border-[var(--app-divider)] p-3">
      {body}
    </div>
  )
}

function ContextButton({
  icon,
  label,
  value,
  enabled,
  onClick,
}: {
  icon: ReactNode
  label: string
  value: string
  enabled: boolean
  onClick: () => void
}) {
  const body = (
    <div className="flex min-w-0 items-center gap-3">
      <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-[var(--app-primary-soft)] text-[var(--app-primary)]">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-[var(--app-text-secondary)]">{label}</p>
        <p className="mt-1 truncate text-xs font-bold text-[var(--app-heading)]">
          {value}
        </p>
      </div>
    </div>
  )

  return enabled ? (
    <button
      type="button"
      className="rounded-2xl border border-[var(--app-divider)] p-3 text-start transition-colors hover:bg-[var(--app-primary-soft)]/35"
      onClick={onClick}
    >
      {body}
    </button>
  ) : (
    <div className="rounded-2xl border border-[var(--app-divider)] p-3">
      {body}
    </div>
  )
}
