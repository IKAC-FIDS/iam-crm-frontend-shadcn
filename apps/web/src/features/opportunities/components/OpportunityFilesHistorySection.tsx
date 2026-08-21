import {
  Activity,
  Download,
  FileArchive,
  History,
  Plus,
  Trash2,
  type LucideIcon,
} from "lucide-react"
import { useState, type ReactNode } from "react"
import { toast } from "sonner"

import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { EmptyState } from "@/components/shared/EmptyState"
import { ErrorState } from "@/components/shared/ErrorState"
import { LoadingState } from "@/components/shared/LoadingState"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { SurfaceCard } from "@/components/shared/SurfaceCard"
import { uiText } from "@/config/uiText"
import { getApiErrorMessage } from "@/lib/apiResponse"
import { formatJalaliDateTime } from "@/lib/date/jalali"
import { Button } from "@workspace/ui/components/button"

import { downloadOpportunityAttachment } from "../api/opportunities.api"
import {
  useDeleteOpportunityAttachment,
  useOpportunityAttachments,
  useUploadOpportunityAttachment,
} from "../hooks/useOpportunities"
import type {
  Opportunity,
  OpportunityAttachment,
} from "../types/opportunity.types"
import { AttachmentUploadDialog } from "./OpportunityResourceDialogs"

export function OpportunityFilesHistorySection({
  opportunity,
  permissions,
}: {
  opportunity: Opportunity
  permissions: string[]
}) {
  const text = uiText.opportunities.detail
  const canView = permissions.includes("attachment:view")
  const canManage =
    permissions.includes("attachment:manage") && !opportunity.archivedAt
  const [page, setPage] = useState(1)
  const attachments = useOpportunityAttachments(opportunity.id, page, canView)
  const upload = useUploadOpportunityAttachment(opportunity.id)
  const remove = useDeleteOpportunityAttachment(opportunity.id)
  const [uploadOpen, setUploadOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] =
    useState<OpportunityAttachment | null>(null)
  const histories = Array.isArray(opportunity.stageHistories)
    ? opportunity.stageHistories
    : []
  const activities = (
    Array.isArray(opportunity.activities) ? opportunity.activities : []
  ).filter((item) => item.type !== "STAGE_CHANGE")
  async function uploadFile(file: File, description?: string) {
    if (file.size > 25 * 1024 * 1024)
      return toast.error(text.errors.fileTooLarge)
    try {
      await upload.mutateAsync({ file, description })
      toast.success(text.feedback.uploaded)
      setUploadOpen(false)
    } catch (error) {
      toast.error(getApiErrorMessage(error, text.errors.mutation))
    }
  }
  async function deleteFile() {
    if (!deleteTarget) return
    try {
      await remove.mutateAsync(deleteTarget.id)
      toast.success(text.feedback.deleted)
      setDeleteTarget(null)
    } catch (error) {
      toast.error(getApiErrorMessage(error, text.errors.mutation))
    }
  }
  async function downloadFile(item: OpportunityAttachment) {
    try {
      await downloadOpportunityAttachment(item.id, item.originalFileName)
      toast.success(text.feedback.downloaded)
    } catch (error) {
      toast.error(getApiErrorMessage(error, text.errors.section))
    }
  }
  return (
    <div className="grid w-full max-w-full min-w-0 gap-4">
      <Section
        title={text.sections.attachments}
        count={attachments.data?.meta.total}
        action={
          canManage ? (
            <Button
              size="sm"
              className="rounded-xl bg-[var(--app-primary)]"
              onClick={() => setUploadOpen(true)}
            >
              <Plus className="size-4" />
              {text.actions.uploadAttachment}
            </Button>
          ) : null
        }
      >
        {!canView ? (
          <PermissionNotice />
        ) : attachments.isLoading ? (
          <LoadingState rows={2} />
        ) : attachments.isError ? (
          <SectionError onRetry={() => void attachments.refetch()} />
        ) : attachments.data?.data.length ? (
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {attachments.data.data.map((item) => (
              <article
                key={item.id}
                className="flex min-w-0 items-start gap-3 rounded-xl border border-[var(--app-divider)] p-3"
              >
                <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-[var(--app-primary-soft)] text-[var(--app-primary)]">
                  <FileArchive className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-xs font-bold text-[var(--app-heading)]">
                    {item.originalFileName}
                  </h3>
                  <p className="mt-1 text-[9px] text-[var(--app-text-secondary)]">
                    {formatBytes(item.sizeBytes)} ·{" "}
                    {formatJalaliDateTime(item.createdAt)}
                  </p>
                  {item.description ? (
                    <p className="mt-2 line-clamp-2 text-[9px] text-[var(--app-text-secondary)]">
                      {item.description}
                    </p>
                  ) : null}
                  <div className="mt-3 flex gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 rounded-lg text-[9px]"
                      onClick={() => void downloadFile(item)}
                    >
                      <Download className="size-3" />
                      {text.actions.download}
                    </Button>
                    {canManage ? (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="size-8 rounded-lg text-[var(--destructive)]"
                        aria-label={text.actions.delete}
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
        ) : (
          <CompactEmpty icon={FileArchive} title={text.empty.attachments} />
        )}
        {attachments.data ? (
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
      </Section>
      <div className="grid min-w-0 items-start gap-4 xl:grid-cols-2">
        <Section title={text.sections.stageHistory}>
          {histories.length ? (
            <div className="grid gap-0">
              {histories.map((history) => (
                <div
                  key={history.id}
                  className="relative border-s border-[var(--app-divider)] ps-5 pb-5 last:pb-0"
                >
                  <span className="absolute -start-1.5 top-1 size-3 rounded-full border-2 border-[var(--app-surface)] bg-[var(--app-primary)]" />
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge tone="neutral">
                      {history.fromStage?.label || uiText.common.notAvailable}
                    </StatusBadge>
                    <span className="text-[10px] text-[var(--app-text-secondary)]">
                      ←
                    </span>
                    <StatusBadge tone="primary">
                      {history.toStage?.label || uiText.common.notAvailable}
                    </StatusBadge>
                  </div>
                  <p className="mt-2 text-[9px] text-[var(--app-text-secondary)]">
                    {formatJalaliDateTime(history.changedAt)}
                    {history.changedBy?.fullName
                      ? ` · ${history.changedBy.fullName}`
                      : ""}
                  </p>
                  {history.note ? (
                    <p className="mt-2 text-[10px] leading-5 break-words whitespace-pre-wrap text-[var(--app-heading)]">
                      {history.note}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          ) : (
            <CompactEmpty icon={History} title={text.empty.stageHistory} />
          )}
        </Section>
        <Section title={text.sections.activityHistory}>
          {activities.length ? (
            <div className="grid gap-0">
              {activities.map((item) => (
                <div
                  key={item.id}
                  className="relative border-s border-[var(--app-divider)] ps-5 pb-5 last:pb-0"
                >
                  <span className="absolute -start-1.5 top-1 size-3 rounded-full border-2 border-[var(--app-surface)] bg-[var(--app-primary-alt)]" />
                  <div className="flex items-center justify-between gap-2">
                    <StatusBadge tone="neutral">
                      {activityLabel(item.type)}
                    </StatusBadge>
                    <time className="text-[9px] text-[var(--app-text-secondary)]">
                      {formatJalaliDateTime(item.occurredAt)}
                    </time>
                  </div>
                  {item.outcome ? (
                    <p className="mt-2 text-xs font-bold text-[var(--app-heading)]">
                      {item.outcome}
                    </p>
                  ) : null}
                  {item.notes ? (
                    <p className="mt-1 text-[10px] leading-5 break-words whitespace-pre-wrap text-[var(--app-text-secondary)]">
                      {item.notes}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          ) : (
            <CompactEmpty icon={Activity} title={text.empty.activities} />
          )}
        </Section>
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
        title={text.dialogs.deleteTitle}
        description={text.dialogs.deleteDescription}
        confirmLabel={text.actions.delete}
        isPending={remove.isPending}
        onConfirm={deleteFile}
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
    <SurfaceCard className="max-w-full min-w-0 overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--app-divider)] px-4 py-3">
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
      <div className="max-w-full min-w-0 p-3 sm:p-4">{children}</div>
    </SurfaceCard>
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
    <div className="w-full max-w-full min-w-0 [&_h3]:mt-2 [&>div]:min-h-0 [&>div]:w-full [&>div]:max-w-full [&>div]:p-4">
      <EmptyState icon={icon} title={title} />
    </div>
  )
}
function activityLabel(type: string) {
  const labels = uiText.opportunities.detail.activityTypes as Record<
    string,
    string
  >
  return labels[type] || type
}
function formatBytes(value: number) {
  const units = uiText.opportunities.detail.fileUnits
  if (value < 1024) return `${value.toLocaleString("fa-IR")} ${units.bytes}`
  if (value < 1024 * 1024)
    return `${(value / 1024).toLocaleString("fa-IR", { maximumFractionDigits: 1 })} ${units.kilobytes}`
  return `${(value / 1024 / 1024).toLocaleString("fa-IR", { maximumFractionDigits: 1 })} ${units.megabytes}`
}
