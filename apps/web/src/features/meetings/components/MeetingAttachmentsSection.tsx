import {
  Download,
  FileArchive,
  Plus,
  Trash2,
  UploadCloud,
} from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { EmptyState } from "@/components/shared/EmptyState"
import { ErrorState } from "@/components/shared/ErrorState"
import { LoadingState } from "@/components/shared/LoadingState"
import { SurfaceCard } from "@/components/shared/SurfaceCard"
import { uiText } from "@/config/uiText"
import { getApiErrorMessage } from "@/lib/apiResponse"
import { formatJalaliDateTime } from "@/lib/date/jalali"
import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"

import { downloadMeetingAttachment } from "../api/meetings.api"
import {
  useDeleteMeetingAttachment,
  useMeetingAttachments,
  useUploadMeetingAttachment,
} from "../hooks/useMeetings"
import type { Meeting, MeetingAttachment } from "../types/meeting.types"

const MAX_FILE_SIZE = 25 * 1024 * 1024

export function MeetingAttachmentsSection({
  meeting,
  permissions,
}: {
  meeting: Meeting
  permissions: string[]
}) {
  const text = uiText.meetings.detail
  const canView = permissions.includes("attachment:view")
  const canManage =
    permissions.includes("attachment:manage") && meeting.status === "COMPLETED"
  const enabled = canView && meeting.status === "COMPLETED"
  const [page, setPage] = useState(1)
  const [uploadOpen, setUploadOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] =
    useState<MeetingAttachment | null>(null)

  const attachments = useMeetingAttachments(meeting.id, page, enabled)
  const upload = useUploadMeetingAttachment(meeting.id)
  const remove = useDeleteMeetingAttachment(meeting.id)

  async function uploadFile(file: File, description?: string) {
    if (file.size > MAX_FILE_SIZE) {
      toast.error(text.attachments.fileTooLarge)
      return
    }
    try {
      await upload.mutateAsync({ file, description })
      toast.success(text.feedback.uploaded)
      setUploadOpen(false)
    } catch (error) {
      toast.error(getApiErrorMessage(error, text.errors.attachmentMutation))
    }
  }

  async function deleteFile() {
    if (!deleteTarget) return
    try {
      await remove.mutateAsync(deleteTarget.id)
      toast.success(text.feedback.deleted)
      setDeleteTarget(null)
    } catch (error) {
      toast.error(getApiErrorMessage(error, text.errors.attachmentMutation))
    }
  }

  async function downloadFile(item: MeetingAttachment) {
    try {
      await downloadMeetingAttachment(item.id, item.originalFileName)
      toast.success(text.feedback.downloaded)
    } catch (error) {
      toast.error(getApiErrorMessage(error, text.errors.attachmentLoad))
    }
  }

  return (
    <SurfaceCard className="min-w-0 overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--app-divider)] px-4 py-3 sm:px-5">
        <div className="min-w-0">
          <h2 className="text-sm font-bold text-[var(--app-heading)]">
            {text.sections.attachments}
          </h2>
          <p className="mt-1 text-xs leading-5 text-[var(--app-text-secondary)]">
            {meeting.status === "COMPLETED"
              ? text.attachments.completedHint
              : meeting.status === "CANCELLED"
                ? text.attachments.cancelledHint
                : text.attachments.scheduledHint}
          </p>
        </div>
        {canManage ? (
          <Button
            size="sm"
            className="rounded-xl bg-[var(--app-primary)] text-[var(--app-on-primary)]"
            onClick={() => setUploadOpen(true)}
          >
            <Plus className="size-4" />
            {text.actions.uploadAttachment}
          </Button>
        ) : null}
      </div>

      <div className="min-h-[170px] p-3 sm:p-5">
        {meeting.status !== "COMPLETED" ? (
          <div className="flex min-h-[140px] items-center justify-center rounded-2xl border border-dashed border-[var(--app-divider)] bg-[var(--app-background)]/55 px-5 text-center">
            <div className="max-w-lg">
              <FileArchive className="mx-auto size-7 text-[var(--app-primary-alt)]" />
              <p className="mt-3 text-xs leading-6 text-[var(--app-text-secondary)]">
                {meeting.status === "CANCELLED"
                  ? text.attachments.cancelledHint
                  : text.attachments.scheduledHint}
              </p>
            </div>
          </div>
        ) : !canView ? (
          <ErrorState
            title={text.errors.attachmentPermissionTitle}
            description={text.errors.attachmentPermissionDescription}
          />
        ) : attachments.isLoading ? (
          <LoadingState rows={2} />
        ) : attachments.isError ? (
          <ErrorState
            title={text.errors.attachmentLoad}
            description={text.errors.attachmentLoadDescription}
            retryLabel={uiText.common.retry}
            onRetry={() => void attachments.refetch()}
          />
        ) : attachments.data?.data.length ? (
          <>
            <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
              {attachments.data.data.map((item) => (
                <article
                  key={item.id}
                  className="flex min-w-0 gap-3 rounded-2xl border border-[var(--app-divider)] bg-[var(--app-surface)] p-3"
                >
                  <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-[var(--app-primary-soft)] text-[var(--app-primary)]">
                    <FileArchive className="size-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3
                      className="truncate text-xs font-bold text-[var(--app-heading)]"
                      title={item.originalFileName}
                    >
                      {item.originalFileName}
                    </h3>
                    <p className="mt-1 text-xs text-[var(--app-text-secondary)]">
                      {formatBytes(item.sizeBytes)} ·{" "}
                      {formatJalaliDateTime(item.createdAt)}
                    </p>
                    {item.description ? (
                      <p className="mt-2 line-clamp-2 text-xs leading-5 text-[var(--app-text-secondary)]">
                        {item.description}
                      </p>
                    ) : null}
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 rounded-lg text-xs"
                        onClick={() => void downloadFile(item)}
                      >
                        <Download className="size-3.5" />
                        {text.actions.download}
                      </Button>
                      {canManage ? (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="size-8 rounded-lg text-[var(--destructive)]"
                          aria-label={text.actions.deleteAttachment}
                          onClick={() => setDeleteTarget(item)}
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      ) : null}
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {attachments.data.meta.totalPages > 1 ? (
              <div className="mt-4 flex justify-end gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-xl"
                  disabled={!attachments.data.meta.hasPrevious}
                  onClick={() => setPage((value) => Math.max(1, value - 1))}
                >
                  {uiText.common.pagination.previous}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-xl"
                  disabled={!attachments.data.meta.hasNext}
                  onClick={() => setPage((value) => value + 1)}
                >
                  {uiText.common.pagination.next}
                </Button>
              </div>
            ) : null}
          </>
        ) : (
          <div className="[&_h3]:mt-2 [&>div]:min-h-[140px] [&>div]:p-4">
            <EmptyState
              icon={FileArchive}
              title={text.attachments.emptyTitle}
              description={text.attachments.emptyDescription}
              action={
                canManage ? (
                  <Button
                    size="sm"
                    className="rounded-xl bg-[var(--app-primary)]"
                    onClick={() => setUploadOpen(true)}
                  >
                    <UploadCloud className="size-4" />
                    {text.actions.uploadAttachment}
                  </Button>
                ) : undefined
              }
            />
          </div>
        )}
      </div>

      <AttachmentUploadDialog
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        pending={upload.isPending}
        onSubmit={uploadFile}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
        title={text.dialogs.deleteAttachmentTitle}
        description={text.dialogs.deleteAttachmentDescription}
        confirmLabel={text.actions.deleteAttachment}
        isPending={remove.isPending}
        onConfirm={deleteFile}
      />
    </SurfaceCard>
  )
}

function AttachmentUploadDialog({
  open,
  onOpenChange,
  pending,
  onSubmit,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  pending: boolean
  onSubmit: (file: File, description?: string) => void | Promise<void>
}) {
  const text = uiText.meetings.detail
  const [file, setFile] = useState<File>()
  const [description, setDescription] = useState("")

  function close(next: boolean) {
    if (!next && !pending) {
      setFile(undefined)
      setDescription("")
    }
    onOpenChange(next)
  }

  async function submit() {
    if (!file || pending) return
    await onSubmit(file, description.trim() || undefined)
  }

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{text.dialogs.uploadTitle}</DialogTitle>
          <DialogDescription>{text.dialogs.uploadDescription}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="meeting-attachment-file">
              {text.attachments.fileLabel}
            </Label>
            <Input
              id="meeting-attachment-file"
              type="file"
              disabled={pending}
              onChange={(event) => setFile(event.target.files?.[0])}
            />
            <p className="text-xs leading-5 text-[var(--app-text-secondary)]">
              {text.attachments.fileHint}
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="meeting-attachment-description">
              {text.attachments.descriptionLabel}
            </Label>
            <textarea
              id="meeting-attachment-description"
              value={description}
              disabled={pending}
              onChange={(event) => setDescription(event.target.value)}
              rows={3}
              className="w-full resize-none rounded-xl border border-input bg-transparent px-3 py-2 text-sm outline-none focus:border-[var(--app-primary)]"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              className="rounded-xl"
              disabled={pending}
              onClick={() => close(false)}
            >
              {uiText.common.cancel}
            </Button>
            <Button
              type="button"
              className="rounded-xl bg-[var(--app-primary)] text-[var(--app-on-primary)]"
              disabled={!file || pending}
              onClick={() => void submit()}
            >
              <UploadCloud className="size-4" />
              {pending ? uiText.common.processing : text.actions.uploadAttachment}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function formatBytes(value: number) {
  const units = uiText.meetings.detail.fileUnits
  if (value < 1024)
    return `${value.toLocaleString("fa-IR")} ${units.bytes}`
  if (value < 1024 * 1024)
    return `${(value / 1024).toLocaleString("fa-IR", {
      maximumFractionDigits: 1,
    })} ${units.kilobytes}`
  return `${(value / 1024 / 1024).toLocaleString("fa-IR", {
    maximumFractionDigits: 1,
  })} ${units.megabytes}`
}
