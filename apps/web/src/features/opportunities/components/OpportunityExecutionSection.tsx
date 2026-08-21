import {
  CalendarDays,
  CheckCircle2,
  ListChecks,
  Pencil,
  Plus,
  Trash2,
  XCircle,
  type LucideIcon,
} from "lucide-react"
import {
  useState,
  type Dispatch,
  type MouseEventHandler,
  type ReactNode,
  type SetStateAction,
} from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { EmptyState } from "@/components/shared/EmptyState"
import { ErrorState } from "@/components/shared/ErrorState"
import { LoadingState } from "@/components/shared/LoadingState"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { SurfaceCard } from "@/components/shared/SurfaceCard"
import { uiText } from "@/config/uiText"
import { MeetingFormDialog } from "@/features/meetings/components/MeetingFormDialog"
import {
  useCancelMeeting as useCancelMeetingMutation,
  useCompleteMeeting as useCompleteMeetingMutation,
  useMeetings as useMeetingList,
} from "@/features/meetings/hooks/useMeetings"
import type { Meeting } from "@/features/meetings/types/meeting.types"
import { getApiErrorMessage } from "@/lib/apiResponse"
import { formatJalaliDateTime } from "@/lib/date/jalali"
import { Button } from "@workspace/ui/components/button"

import {
  useCompleteOpportunityTask,
  useCreateOpportunityTask,
  useDeleteOpportunityTask,
  useOpportunityTasks,
  useUpdateOpportunityTask,
} from "../hooks/useOpportunities"
import type {
  Opportunity,
  OpportunityTask,
  OpportunityTaskPayload,
} from "../types/opportunity.types"
import {
  TaskDialog,
  type ResourceActionTarget,
  type ResourceDeleteTarget,
} from "./OpportunityResourceDialogs"

export function OpportunityExecutionSection({
  opportunity,
  permissions,
}: {
  opportunity: Opportunity
  permissions: string[]
}) {
  const text = uiText.opportunities.detail
  const navigate = useNavigate()
  const canViewTasks = permissions.includes("task:view")
  const canCreateTask =
    permissions.includes("task:create") && !opportunity.archivedAt
  const canUpdateTask =
    permissions.includes("task:update") && !opportunity.archivedAt
  const canDeleteTask =
    permissions.includes("task:delete") && !opportunity.archivedAt
  const canCompleteTask =
    permissions.includes("task:complete") && !opportunity.archivedAt
  const canViewMeetings = permissions.includes("meeting:view")
  const canCreateMeeting =
    permissions.includes("meeting:create") && !opportunity.archivedAt
  const canUpdateMeeting =
    permissions.includes("meeting:update") && !opportunity.archivedAt
  const canCompleteMeeting =
    permissions.includes("meeting:complete") && !opportunity.archivedAt
  const canCancelMeeting =
    permissions.includes("meeting:cancel") && !opportunity.archivedAt
  const [taskPage, setTaskPage] = useState(1)
  const [meetingPage, setMeetingPage] = useState(1)
  const tasks = useOpportunityTasks(opportunity.id, taskPage, canViewTasks)
  const meetings = useMeetingList(
    { page: meetingPage, limit: 20, opportunityId: opportunity.id },
    canViewMeetings
  )
  const [task, setTask] = useState<OpportunityTask | null | undefined>(
    undefined
  )
  const [meeting, setMeeting] = useState<Meeting | null | undefined>(undefined)
  const [deleteTarget, setDeleteTarget] = useState<ResourceDeleteTarget>(null)
  const [actionTarget, setActionTarget] = useState<ResourceActionTarget>(null)
  const createTask = useCreateOpportunityTask(opportunity.id)
  const updateTask = useUpdateOpportunityTask(opportunity.id)
  const completeTask = useCompleteOpportunityTask(opportunity.id)
  const deleteTask = useDeleteOpportunityTask(opportunity.id)
  const completeMeeting = useCompleteMeetingMutation()
  const cancelMeeting = useCancelMeetingMutation()
  async function saveTask(payload: OpportunityTaskPayload) {
    try {
      if (task) await updateTask.mutateAsync({ taskId: task.id, payload })
      else await createTask.mutateAsync(payload)
      toast.success(text.feedback.saved)
      setTask(undefined)
    } catch (error) {
      toast.error(getApiErrorMessage(error, text.errors.mutation))
    }
  }
  async function removeTask() {
    if (!deleteTarget || deleteTarget.kind !== "task") return
    try {
      await deleteTask.mutateAsync(deleteTarget.id)
      toast.success(text.feedback.deleted)
      setDeleteTarget(null)
    } catch (error) {
      toast.error(getApiErrorMessage(error, text.errors.mutation))
    }
  }
  async function confirmAction() {
    if (!actionTarget) return
    try {
      if (actionTarget.kind === "taskComplete")
        await completeTask.mutateAsync({ taskId: actionTarget.id })
      if (actionTarget.kind === "meetingComplete")
        await completeMeeting.mutateAsync({ id: actionTarget.id })
      if (actionTarget.kind === "meetingCancel")
        await cancelMeeting.mutateAsync({ id: actionTarget.id })
      toast.success(text.feedback.saved)
      setActionTarget(null)
    } catch (error) {
      toast.error(getApiErrorMessage(error, text.errors.mutation))
    }
  }
  return (
    <div className="grid w-full max-w-full min-w-0 items-stretch gap-4 md:grid-cols-2">
      <Section
        title={text.sections.tasks}
        count={tasks.data?.meta.total ?? opportunity._count?.tasks}
        action={
          canCreateTask ? (
            <Button
              size="sm"
              className="rounded-xl bg-[var(--app-primary)]"
              onClick={() => setTask(null)}
            >
              <Plus className="size-4" />
              {text.actions.addTask}
            </Button>
          ) : null
        }
      >
        {!canViewTasks ? (
          <PermissionNotice />
        ) : tasks.isLoading ? (
          <LoadingState rows={2} />
        ) : tasks.isError ? (
          <SectionError onRetry={() => void tasks.refetch()} />
        ) : tasks.data?.data.length ? (
          <div className="grid gap-2 2xl:grid-cols-2">
            {tasks.data.data.map((item) => (
              <article
                key={item.id}
                className="min-w-0 rounded-xl border border-[var(--app-divider)] p-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <StatusBadge
                    tone={
                      item.status === "DONE"
                        ? "success"
                        : item.status === "CANCELLED"
                          ? "error"
                          : item.status === "IN_PROGRESS"
                            ? "info"
                            : "neutral"
                    }
                  >
                    {text.taskStatuses[item.status]}
                  </StatusBadge>
                  <div className="flex">
                    {canUpdateTask && item.status !== "DONE" ? (
                      <IconButton
                        label={uiText.opportunities.actions.edit}
                        onClick={() => setTask(item)}
                      >
                        <Pencil />
                      </IconButton>
                    ) : null}
                    {canDeleteTask ? (
                      <IconButton
                        label={text.actions.delete}
                        danger
                        onClick={() =>
                          setDeleteTarget({ kind: "task", id: item.id })
                        }
                      >
                        <Trash2 />
                      </IconButton>
                    ) : null}
                  </div>
                </div>
                <h3 className="mt-3 text-xs font-bold break-words text-[var(--app-heading)]">
                  {item.title}
                </h3>
                {item.description ? (
                  <p className="mt-2 line-clamp-2 text-[10px] leading-5 break-words text-[var(--app-text-secondary)]">
                    {item.description}
                  </p>
                ) : null}
                <div className="mt-3 flex items-center justify-between text-[9px] text-[var(--app-text-secondary)]">
                  <span>{uiText.opportunities.priorities[item.priority]}</span>
                  <span>
                    {formatJalaliDateTime(item.dueAt) ||
                      uiText.common.notAvailable}
                  </span>
                </div>
                {canCompleteTask &&
                item.status !== "DONE" &&
                item.status !== "CANCELLED" ? (
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-3 h-8 w-full rounded-lg text-[9px]"
                    onClick={() =>
                      setActionTarget({ kind: "taskComplete", id: item.id })
                    }
                  >
                    <CheckCircle2 className="size-3.5" />
                    {text.actions.completeTask}
                  </Button>
                ) : null}
              </article>
            ))}
          </div>
        ) : (
          <CompactEmpty icon={ListChecks} title={text.empty.tasks} />
        )}
        {tasks.data ? (
          <Pagination meta={tasks.data.meta} setPage={setTaskPage} />
        ) : null}
      </Section>
      <Section
        title={text.sections.meetings}
        count={meetings.data?.meta.total}
        action={
          canViewMeetings || canCreateMeeting ? (
            <div className="flex flex-wrap gap-2">
              {canViewMeetings ? (
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-xl"
                  onClick={() =>
                    navigate(
                      `/meetings?companyId=${encodeURIComponent(opportunity.companyId)}&opportunityId=${encodeURIComponent(opportunity.id)}`
                    )
                  }
                >
                  {uiText.dashboard.recentActivities.viewAll}
                </Button>
              ) : null}
              {canCreateMeeting ? (
                <Button
                  size="sm"
                  className="rounded-xl bg-[var(--app-primary)]"
                  onClick={() => setMeeting(null)}
                >
                  <Plus className="size-4" />
                  {text.actions.addMeeting}
                </Button>
              ) : null}
            </div>
          ) : null
        }
      >
        {!canViewMeetings ? (
          <PermissionNotice />
        ) : meetings.isLoading ? (
          <LoadingState rows={2} />
        ) : meetings.isError ? (
          <SectionError onRetry={() => void meetings.refetch()} />
        ) : meetings.data?.data.length ? (
          <div className="grid gap-2 2xl:grid-cols-2">
            {meetings.data.data.map((item) => (
              <article
                key={item.id}
                role="button"
                tabIndex={0}
                className="min-w-0 cursor-pointer rounded-xl border border-[var(--app-divider)] p-3 transition-colors hover:border-[var(--app-primary)]/30 hover:bg-[var(--app-primary-soft)]/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-primary)]/30"
                onClick={() => navigate(`/meetings/${item.id}`)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault()
                    navigate(`/meetings/${item.id}`)
                  }
                }}
              >
                <div className="flex items-start justify-between">
                  <StatusBadge
                    tone={
                      item.status === "COMPLETED"
                        ? "success"
                        : item.status === "CANCELLED"
                          ? "error"
                          : "info"
                    }
                  >
                    {text.meetingStatuses[item.status]}
                  </StatusBadge>
                  {canUpdateMeeting && item.status === "SCHEDULED" ? (
                    <IconButton
                      label={uiText.opportunities.actions.edit}
                      onClick={(event) => {
                        event.stopPropagation()
                        setMeeting(item)
                      }}
                    >
                      <Pencil />
                    </IconButton>
                  ) : null}
                </div>
                <h3 className="mt-3 text-xs font-bold break-words text-[var(--app-heading)]">
                  {item.title}
                </h3>
                <p className="mt-2 text-[10px] text-[var(--app-text-secondary)]">
                  {text.meetingModes[item.mode]} ·{" "}
                  {formatJalaliDateTime(item.startAt)}
                </p>
                {item.location ? (
                  <p className="mt-1 truncate text-[9px] text-[var(--app-text-secondary)]">
                    {item.location}
                  </p>
                ) : null}
                {item.status === "SCHEDULED" ? (
                  <div className="mt-3 flex gap-2">
                    {canCompleteMeeting ? (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 flex-1 rounded-lg text-[9px]"
                        onClick={(event) => {
                          event.stopPropagation()
                          setActionTarget({
                            kind: "meetingComplete",
                            id: item.id,
                          })
                        }}
                      >
                        <CheckCircle2 className="size-3" />
                        {text.actions.completeMeeting}
                      </Button>
                    ) : null}
                    {canCancelMeeting ? (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 rounded-lg text-[9px]"
                        onClick={(event) => {
                          event.stopPropagation()
                          setActionTarget({
                            kind: "meetingCancel",
                            id: item.id,
                          })
                        }}
                      >
                        <XCircle className="size-3" />
                        {text.actions.cancelMeeting}
                      </Button>
                    ) : null}
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        ) : (
          <CompactEmpty icon={CalendarDays} title={text.empty.meetings} />
        )}
        {meetings.data ? (
          <Pagination meta={meetings.data.meta} setPage={setMeetingPage} />
        ) : null}
      </Section>
      {task !== undefined ? (
        <TaskDialog
          open
          onOpenChange={(open) => {
            if (!open) setTask(undefined)
          }}
          task={task}
          opportunityId={opportunity.id}
          companyId={opportunity.companyId}
          pending={createTask.isPending || updateTask.isPending}
          onSubmit={saveTask}
        />
      ) : null}
      {meeting !== undefined ? (
        <MeetingFormDialog
          open
          onOpenChange={(open) => {
            if (!open) setMeeting(undefined)
          }}
          meeting={meeting}
          initialCompanyId={opportunity.companyId}
          initialOpportunity={{
            id: opportunity.id,
            title: opportunity.title,
            companyId: opportunity.companyId,
          }}
          lockCompany
          lockOpportunity
        />
      ) : null}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
        title={text.dialogs.deleteTitle}
        description={text.dialogs.deleteDescription}
        confirmLabel={text.actions.delete}
        isPending={deleteTask.isPending}
        onConfirm={removeTask}
      />
      <ConfirmDialog
        open={Boolean(actionTarget)}
        onOpenChange={(open) => {
          if (!open) setActionTarget(null)
        }}
        title={
          actionTarget?.kind === "meetingCancel"
            ? text.dialogs.cancelTitle
            : text.dialogs.completeTitle
        }
        tone={actionTarget?.kind === "meetingCancel" ? "danger" : "primary"}
        isPending={
          completeTask.isPending ||
          completeMeeting.isPending ||
          cancelMeeting.isPending
        }
        onConfirm={confirmAction}
      />
    </div>
  )
}

function Section({
  title,
  count,
  action,
  children,
}: {
  title: string
  count?: number
  action?: ReactNode
  children: ReactNode
}) {
  return (
    <SurfaceCard className="flex h-[400px] max-h-[420px] min-h-[320px] max-w-full min-w-0 flex-col overflow-hidden">
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-[var(--app-divider)] px-4 py-3">
        <h2 className="flex min-w-0 items-center gap-2 text-sm font-bold break-words text-[var(--app-heading)]">
          {title}
          {count !== undefined ? (
            <span className="rounded-full bg-[var(--app-primary-soft)] px-2 py-0.5 text-[9px] text-[var(--app-primary)]">
              {count.toLocaleString("fa-IR")}
            </span>
          ) : null}
        </h2>
        {action}
      </div>
      <div className="min-h-0 max-w-full min-w-0 flex-1 overflow-y-auto overscroll-contain p-3 sm:p-4">
        {children}
      </div>
    </SurfaceCard>
  )
}
function IconButton({
  label,
  onClick,
  danger,
  children,
}: {
  label: string
  onClick: MouseEventHandler<HTMLButtonElement>
  danger?: boolean
  children: ReactNode
}) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className={
        danger
          ? "size-8 rounded-lg text-[var(--destructive)] [&_svg]:size-3.5"
          : "size-8 rounded-lg [&_svg]:size-3.5"
      }
      aria-label={label}
      onClick={onClick}
    >
      {children}
    </Button>
  )
}
function SectionError({ onRetry }: { onRetry: () => void }) {
  return (
    <ErrorState
      title={uiText.opportunities.detail.errors.section}
      description={uiText.opportunities.errors.listDescription}
      retryLabel={uiText.common.retry}
      onRetry={onRetry}
    />
  )
}
function PermissionNotice() {
  return (
    <ErrorState
      title={uiText.opportunities.detail.errors.resourcePermissionTitle}
      description={
        uiText.opportunities.detail.errors.resourcePermissionDescription
      }
    />
  )
}
function CompactEmpty({ icon, title }: { icon: LucideIcon; title: string }) {
  return (
    <div className="h-full w-full max-w-full min-w-0 [&_h3]:mt-2 [&>div]:h-full [&>div]:min-h-0 [&>div]:w-full [&>div]:max-w-full [&>div]:p-4">
      <EmptyState icon={icon} title={title} />
    </div>
  )
}
function Pagination({
  meta,
  setPage,
}: {
  meta: { hasPrevious?: boolean; hasNext?: boolean }
  setPage: Dispatch<SetStateAction<number>>
}) {
  return (
    <div className="mt-4 flex justify-end gap-2">
      <Button
        size="sm"
        variant="outline"
        className="rounded-xl"
        disabled={!meta.hasPrevious}
        onClick={() => setPage((value) => Math.max(1, value - 1))}
      >
        {uiText.common.pagination.previous}
      </Button>
      <Button
        size="sm"
        variant="outline"
        className="rounded-xl"
        disabled={!meta.hasNext}
        onClick={() => setPage((value) => value + 1)}
      >
        {uiText.common.pagination.next}
      </Button>
    </div>
  )
}


