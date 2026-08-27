import { useMemo, useState, type ReactNode } from "react"
import { toast } from "sonner"

import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { PersianDateTimePicker } from "@/components/shared/PersianDateTimePicker"
import { uiText } from "@/config/uiText"
import { getApiErrorMessage } from "@/lib/apiResponse"
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
  useAssignTask,
  useChangeTaskStatus,
  useCompleteTask,
  useDeleteTask,
  useRescheduleTask,
  useTaskAssignees,
} from "../hooks/useTasks"
import type { Task, TaskOption, TaskStatus } from "../types/task.types"
import { type TaskDialogAction } from "./TaskActionsMenu"
export type { TaskDialogAction } from "./TaskActionsMenu"
import { TaskOptionSelect } from "./TaskOptionSelect"

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
  return <RescheduleDialog task={task} onClose={onClose} />
}

function CompleteDialog({ task, onClose }: { task: Task; onClose: () => void }) {
  const text = uiText.tasks
  const mutation = useCompleteTask()
  const [note, setNote] = useState("")
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
      onClose={onClose}
      onSubmit={submit}
    >
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
  const mutation = useAssignTask()
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
  const query = useTaskAssignees(search, true)
  const options = useMemo(
    () =>
      query.data?.pages.flatMap((page) => page.data).map((item) => ({
        id: item.id,
        label: item.fullName || item.email || item.id,
        secondary: item.email || undefined,
      })) || [],
    [query.data]
  )
  async function submit() {
    if (!assignee) return
    try {
      await mutation.mutateAsync({ id: task.id, assignedToId: assignee.id })
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
      submitDisabled={!assignee}
      onClose={onClose}
      onSubmit={submit}
    >
      <Field label={text.fields.assignee}>
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
        />
      </Field>
    </SimpleDialog>
  )
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

