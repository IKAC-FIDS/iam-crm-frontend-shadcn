import { useMemo, useState, type ReactNode } from "react"
import { toast } from "sonner"

import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { PersianDateTimePicker } from "@/components/shared/PersianDateTimePicker"
import { uiText } from "@/config/uiText"
import { getApiErrorMessage } from "@/lib/apiResponse"
import { useAuthStore } from "@/store/authStore"
import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { Label } from "@workspace/ui/components/label"

import {
  useReassignTask,
  useChangeTaskStatus,
  useCompleteTask,
  useDeleteTask,
  useRescheduleTask,
  useTaskAssignees,
  useTaskTeams,
  useCreateSubtask,
} from "../hooks/useTasks"
import type { Task, TaskAssignmentScope, TaskOption, TaskPriority, TaskStatus } from "../types/task.types"
import { type TaskDialogAction } from "./TaskActionsMenu"
export type { TaskDialogAction } from "./TaskActionsMenu"
import { TaskOptionSelect } from "./TaskOptionSelect"
import { canAssignTaskTargets } from "../taskPermissions"

export function TaskActionDialogs({
  task,
  action,
  onClose,
}: {
  task?: Task | null
  action?: TaskDialogAction
  onClose: () => void
}) {
  if (!task || !action) return null
  if (action === "delete") return <DeleteDialog task={task} onClose={onClose} />
  if (action === "complete") return <CompleteDialog task={task} onClose={onClose} />
  if (action === "status") return <StatusDialog task={task} onClose={onClose} />
  if (action === "assign") return <AssignDialog task={task} onClose={onClose} />
  if (action === "subtask") return <SubtaskDialog task={task} onClose={onClose} />
  return <RescheduleDialog task={task} onClose={onClose} />
}

function CompleteDialog({ task, onClose }: { task: Task; onClose: () => void }) {
  const text = uiText.tasks
  const mutation = useCompleteTask()
  const [note, setNote] = useState("")
  const incompleteCount = (task.subtasks ?? []).filter((item) => item.status !== "DONE" && item.status !== "CANCELLED").length
  async function submit() {
    try {
      await mutation.mutateAsync({ id: task.id, completionNote: note.trim() || undefined })
      toast.success(text.feedback.completed)
      onClose()
    } catch (error) {
      toast.error(getApiErrorMessage(error, text.errors.mutation))
    }
  }
  return (
    <SimpleDialog
      title={text.dialogs.completeTitle}
      description={text.dialogs.completeDescription}
      pending={mutation.isPending}
      submitLabel={text.actions.complete}
      submitDisabled={incompleteCount > 0}
      onClose={onClose}
      onSubmit={submit}
    >
      {incompleteCount ? <div className="rounded-xl border border-[var(--destructive)]/25 bg-[var(--destructive-soft)] p-3 text-xs text-[var(--destructive)]">{incompleteCount.toLocaleString("fa-IR")} زیرکار ناتمام باقی مانده است. ابتدا زیرکارها را بررسی کنید.</div> : null}
      <Field label={text.fields.completionNote}>
        <textarea rows={4} value={note} onChange={(e) => setNote(e.target.value)} className={textareaClass} />
      </Field>
    </SimpleDialog>
  )
}

function StatusDialog({ task, onClose }: { task: Task; onClose: () => void }) {
  const text = uiText.tasks
  const mutation = useChangeTaskStatus()
  const [status, setStatus] = useState<TaskStatus>(task.status)
  const [note, setNote] = useState("")
  async function submit() {
    try {
      await mutation.mutateAsync({ id: task.id, status, note: note.trim() || undefined })
      toast.success(text.feedback.statusChanged)
      onClose()
    } catch (error) {
      toast.error(getApiErrorMessage(error, text.errors.mutation))
    }
  }
  return (
    <SimpleDialog
      title={text.dialogs.statusTitle}
      description={text.dialogs.statusDescription}
      pending={mutation.isPending}
      submitLabel={text.actions.apply}
      onClose={onClose}
      onSubmit={submit}
    >
      <Field label={text.fields.status}>
        <select value={status} onChange={(e) => setStatus(e.target.value as TaskStatus)} className={selectClass}>
          {(["TODO", "IN_PROGRESS", "DONE", "CANCELLED"] as TaskStatus[]).map((value) => (
            <option key={value} value={value}>{text.statuses[value]}</option>
          ))}
        </select>
      </Field>
      <Field label={text.fields.note}>
        <textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} className={textareaClass} />
      </Field>
    </SimpleDialog>
  )
}

function AssignDialog({ task, onClose }: { task: Task; onClose: () => void }) {
  const text = uiText.tasks
  const mutation = useReassignTask()
  const [scope, setScope] = useState<TaskAssignmentScope>(task.assignmentScope || "SELF")
  const [teamSearch, setTeamSearch] = useState("")
  const [team, setTeam] = useState<TaskOption | undefined>(task.team ? { id: task.team.id, label: task.team.name, secondary: task.team.code } : undefined)
  const [reason, setReason] = useState("")
  const [search, setSearch] = useState("")
  const [assignee, setAssignee] = useState<TaskOption | undefined>(
    task.assignedTo
      ? {
          id: task.assignedTo.id,
          label: task.assignedTo.fullName || task.assignedTo.email || task.assignedTo.id,
          secondary: task.assignedTo.email || undefined,
        }
      : undefined
  )
  const query = useTaskAssignees(search, scope !== "SELF", scope === "TEAM" ? team?.id || "" : "")
  const teamQuery = useTaskTeams(teamSearch, scope === "TEAM")
  const options = useMemo(
    () =>
      query.data?.pages.flatMap((page) => page.data).map((item) => ({
        id: item.id,
        label: item.fullName || item.email || item.id,
        secondary: [item.email, item.role, item.teamRef?.name || item.team].filter(Boolean).join(" · ") || undefined,
      })) || [],
    [query.data]
  )
  const teamOptions = useMemo(() => teamQuery.data?.pages.flatMap((page) => page.data) || [], [teamQuery.data])
  async function submit() {
    if (scope === "TEAM" && !team) return
    try {
      await mutation.mutateAsync({ id: task.id, payload: { assignmentScope: scope, teamId: scope === "TEAM" ? team?.id : undefined, assigneeId: scope === "SELF" ? undefined : assignee?.id, reason: reason.trim() || undefined } })
      toast.success(text.feedback.assigned)
      onClose()
    } catch (error) {
      toast.error(getApiErrorMessage(error, text.errors.mutation))
    }
  }
  return (
    <SimpleDialog
      title={text.dialogs.assignTitle}
      description={text.dialogs.assignDescription}
      pending={mutation.isPending}
      submitLabel={text.actions.assign}
      submitDisabled={scope === "TEAM" && !team}
      onClose={onClose}
      onSubmit={submit}
    >
      <div className="rounded-xl border p-3 text-xs text-[var(--app-text-secondary)]">وضعیت فعلی: {task.assignedTo?.fullName || text.labels.unassigned} · {task.team?.name || "بدون تیم"}</div>
      <Field label="دامنه واگذاری">
        <select value={scope} onChange={(event) => { setScope(event.target.value as TaskAssignmentScope); setTeam(undefined); setAssignee(undefined) }} className={selectClass}>
          <option value="SELF">خودم</option><option value="TEAM">تیم</option><option value="ORGANIZATION">سازمان</option>
        </select>
      </Field>
      {scope === "TEAM" ? <Field label="تیم"><TaskOptionSelect value={team?.id} selectedOption={team} options={teamOptions} onChange={(next) => { setTeam(next); setAssignee(undefined) }} search={teamSearch} onSearchChange={setTeamSearch} placeholder="انتخاب تیم" allowEmpty={false} loading={teamQuery.isLoading} hasMore={teamQuery.hasNextPage} loadingMore={teamQuery.isFetchingNextPage} onLoadMore={() => void teamQuery.fetchNextPage()} /></Field> : null}
      {scope !== "SELF" ? <Field label={text.fields.assignee}>
        <TaskOptionSelect
          value={assignee?.id}
          selectedOption={assignee}
          options={options}
          onChange={setAssignee}
          search={search}
          onSearchChange={setSearch}
          placeholder={text.placeholders.assignee}
          allowEmpty={false}
          loading={query.isLoading}
          hasMore={query.hasNextPage}
          loadingMore={query.isFetchingNextPage}
          onLoadMore={() => void query.fetchNextPage()}
          disabled={scope === "TEAM" && !team}
        />
      </Field> : null}
      <Field label="دلیل تغییر مسئول"><textarea rows={3} value={reason} onChange={(event) => setReason(event.target.value)} className={textareaClass} /></Field>
    </SimpleDialog>
  )
}

function SubtaskDialog({ task, onClose }: { task: Task; onClose: () => void }) {
  const mutation = useCreateSubtask()
  const canAssignOthers = useAuthStore((state) =>
    canAssignTaskTargets(state.user?.permissions)
  )
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [priority, setPriority] = useState<TaskPriority>(task.priority)
  const [dueAt, setDueAt] = useState<Date>()
  const [inheritLinkedEntity, setInheritLinkedEntity] = useState(true)
  const [scope, setScope] = useState<TaskAssignmentScope>("SELF")
  const [team, setTeam] = useState<TaskOption>()
  const [assignee, setAssignee] = useState<TaskOption>()
  const [teamSearch, setTeamSearch] = useState("")
  const [assigneeSearch, setAssigneeSearch] = useState("")
  const teams = useTaskTeams(teamSearch, canAssignOthers && scope === "TEAM")
  const assignees = useTaskAssignees(assigneeSearch, canAssignOthers && scope !== "SELF", scope === "TEAM" ? team?.id || "" : "")
  const teamOptions = useMemo(() => teams.data?.pages.flatMap((page) => page.data) || [], [teams.data])
  const assigneeOptions = useMemo(() => assignees.data?.pages.flatMap((page) => page.data).map((item) => ({ id: item.id, label: item.fullName || item.email || item.id, secondary: [item.email, item.role, item.teamRef?.name || item.team].filter(Boolean).join(" · ") })) || [], [assignees.data])
  async function submit() {
    if (!title.trim() || (canAssignOthers && scope === "TEAM" && !team)) return
    try {
      await mutation.mutateAsync({ parentId: task.id, payload: { title: title.trim(), description: description.trim() || undefined, priority, dueAt: dueAt?.toISOString(), assignmentScope: canAssignOthers ? scope : "SELF", teamId: canAssignOthers && scope === "TEAM" ? team?.id : undefined, assigneeId: canAssignOthers && scope !== "SELF" ? assignee?.id : undefined, inheritLinkedEntity } })
      toast.success("زیرکار ایجاد شد.")
      onClose()
    } catch (error) { toast.error(getApiErrorMessage(error, uiText.tasks.errors.mutation)) }
  }
  return <SimpleDialog title="ایجاد زیرکار" description="یک کار جدید ساخته می‌شود و مسئولیت کار والد تغییر نمی‌کند." pending={mutation.isPending} submitLabel="ایجاد زیرکار" submitDisabled={!title.trim() || (canAssignOthers && scope === "TEAM" && !team)} onClose={onClose} onSubmit={submit}>
    <Field label="عنوان زیرکار"><input value={title} onChange={(event) => setTitle(event.target.value)} className={selectClass} maxLength={200} /></Field>
    <Field label="توضیحات"><textarea rows={3} value={description} onChange={(event) => setDescription(event.target.value)} className={textareaClass} /></Field>
    <Field label="اولویت"><select value={priority} onChange={(event) => setPriority(event.target.value as TaskPriority)} className={selectClass}>{(["LOW", "MEDIUM", "HIGH", "STRATEGIC"] as TaskPriority[]).map((value) => <option key={value} value={value}>{uiText.tasks.priorities[value]}</option>)}</select></Field>
    <Field label="موعد انجام"><PersianDateTimePicker value={dueAt} onChange={setDueAt} /></Field>
    {canAssignOthers ? <>
      <Field label="دامنه واگذاری"><select value={scope} onChange={(event) => { setScope(event.target.value as TaskAssignmentScope); setTeam(undefined); setAssignee(undefined) }} className={selectClass}><option value="SELF">خودم</option><option value="TEAM">تیم</option><option value="ORGANIZATION">سازمان</option></select></Field>
      {scope === "TEAM" ? <Field label="تیم"><TaskOptionSelect value={team?.id} selectedOption={team} options={teamOptions} onChange={(next) => { setTeam(next); setAssignee(undefined) }} search={teamSearch} onSearchChange={setTeamSearch} placeholder="انتخاب تیم" allowEmpty={false} loading={teams.isLoading} hasMore={teams.hasNextPage} loadingMore={teams.isFetchingNextPage} onLoadMore={() => void teams.fetchNextPage()} /></Field> : null}
      {scope !== "SELF" ? <Field label="مسئول"><TaskOptionSelect value={assignee?.id} selectedOption={assignee} options={assigneeOptions} onChange={setAssignee} search={assigneeSearch} onSearchChange={setAssigneeSearch} placeholder="انتخاب مسئول (اختیاری)" loading={assignees.isLoading} hasMore={assignees.hasNextPage} loadingMore={assignees.isFetchingNextPage} onLoadMore={() => void assignees.fetchNextPage()} disabled={scope === "TEAM" && !team} /></Field> : null}
    </> : <p className="rounded-xl bg-[var(--app-primary-soft)] p-3 text-xs leading-6 text-[var(--app-primary)]">این زیرکار به خود شما واگذار می‌شود. برای ارجاع به سایر کاربران یا تیم‌ها، دسترسی <code dir="ltr">task:assign</code> لازم است.</p>}
    <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={inheritLinkedEntity} onChange={(event) => setInheritLinkedEntity(event.target.checked)} />ارتباط تجاری/فنی از کار والد کپی شود</label>
  </SimpleDialog>
}

function RescheduleDialog({ task, onClose }: { task: Task; onClose: () => void }) {
  const text = uiText.tasks
  const mutation = useRescheduleTask()
  const [dueAt, setDueAt] = useState<Date | undefined>(task.dueAt ? new Date(task.dueAt) : undefined)
  const [reminderAt, setReminderAt] = useState<Date | undefined>(task.reminderAt ? new Date(task.reminderAt) : undefined)
  const invalidReminder = Boolean(reminderAt && dueAt && reminderAt >= dueAt)

  async function submit() {
    if (!dueAt || invalidReminder) return
    try {
      await mutation.mutateAsync({
        id: task.id,
        dueAt: dueAt.toISOString(),
        reminderAt: reminderAt?.toISOString(),
      })
      toast.success(text.feedback.rescheduled)
      onClose()
    } catch (error) {
      toast.error(getApiErrorMessage(error, text.errors.mutation))
    }
  }

  return (
    <SimpleDialog
      title={text.dialogs.rescheduleTitle}
      description={text.dialogs.rescheduleDescription}
      pending={mutation.isPending}
      submitLabel={text.actions.reschedule}
      submitDisabled={!dueAt || invalidReminder}
      onClose={onClose}
      onSubmit={submit}
    >
      <Field label={text.fields.dueAt}>
        <PersianDateTimePicker value={dueAt} onChange={setDueAt} />
      </Field>
      <Field label={text.fields.reminderAt}>
        <PersianDateTimePicker value={reminderAt} onChange={setReminderAt} />
      </Field>
      {invalidReminder ? (
        <p className="text-xs text-[var(--destructive)]">{text.validation.reminderBeforeDue}</p>
      ) : null}
    </SimpleDialog>
  )
}

function DeleteDialog({ task, onClose }: { task: Task; onClose: () => void }) {
  const text = uiText.tasks
  const mutation = useDeleteTask()
  async function submit() {
    try {
      await mutation.mutateAsync(task)
      toast.success(text.feedback.deleted)
      onClose()
    } catch (error) {
      toast.error(getApiErrorMessage(error, text.errors.mutation))
    }
  }
  return (
    <ConfirmDialog
      open
      onOpenChange={(open) => { if (!open) onClose() }}
      title={text.dialogs.deleteTitle}
      description={text.dialogs.deleteDescription}
      confirmLabel={text.actions.delete}
      tone="danger"
      isPending={mutation.isPending}
      onConfirm={submit}
    />
  )
}

function SimpleDialog({
  title,
  description,
  pending,
  submitLabel,
  submitDisabled = false,
  onClose,
  onSubmit,
  children,
}: {
  title: string
  description: string
  pending: boolean
  submitLabel: string
  submitDisabled?: boolean
  onClose: () => void
  onSubmit: () => void | Promise<void>
  children: ReactNode
}) {
  return (
    <Dialog open onOpenChange={(open) => { if (!open && !pending) onClose() }}>
      <DialogContent showCloseButton={false} dir="rtl" className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2">{children}</div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" className="rounded-xl" disabled={pending} onClick={onClose}>
            {uiText.common.cancel}
          </Button>
          <Button
            type="button"
            className="rounded-xl bg-[var(--app-primary)] text-[var(--app-on-primary)]"
            disabled={pending || submitDisabled}
            onClick={() => void onSubmit()}
          >
            {pending ? uiText.common.processing : submitLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-2">
      <Label className="text-xs font-bold">{label}</Label>
      {children}
    </div>
  )
}

const selectClass =
  "h-11 w-full rounded-xl border border-input bg-transparent px-3 text-sm outline-none focus:border-[var(--app-primary)]"
const textareaClass =
  "w-full resize-none rounded-xl border border-input bg-transparent p-3 text-sm outline-none focus:border-[var(--app-primary)]"

