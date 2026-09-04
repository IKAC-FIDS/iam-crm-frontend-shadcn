import { useState, type ReactNode } from "react"
import { ArrowLeft } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { StatusBadge, type StatusTone } from "@/components/shared/StatusBadge"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import type { MobileEntityConfig } from "@/components/shared/MobileEntityCard"
import {
  DataTableShell,
  type DataTableColumn,
} from "@/components/shared/DataTableShell"
import type { KnowledgeArticle, PageMeta, TechnicalRelease } from "../types"
export function TechnicalStatusBadge<T extends string>({
  status,
  presentation,
}: {
  status: T
  presentation: { label: Record<T, string>; tone: Record<T, StatusTone> }
}) {
  return (
    <StatusBadge tone={presentation.tone[status]}>
      {presentation.label[status]}
    </StatusBadge>
  )
}

export function ReleaseSupportBadge({
  release,
}: {
  release: TechnicalRelease
}) {
  const [now] = useState(() => Date.now())
  const supportStart = release.supportStartDate
    ? new Date(release.supportStartDate).getTime()
    : undefined
  const supportEnd = release.supportEndDate
    ? new Date(release.supportEndDate).getTime()
    : undefined
  const endOfLife = release.endOfLifeDate
    ? new Date(release.endOfLifeDate).getTime()
    : undefined

  if (
    release.status === "END_OF_LIFE" ||
    (endOfLife !== undefined && endOfLife <= now)
  ) {
    return <StatusBadge tone="error">پایان عمر</StatusBadge>
  }
  if (supportEnd !== undefined && supportEnd <= now) {
    return <StatusBadge tone="warning">پشتیبانی پایان یافته</StatusBadge>
  }
  if (supportStart !== undefined && supportStart > now) {
    return <StatusBadge tone="info">پشتیبانی شروع نشده</StatusBadge>
  }
  if (release.status === "RELEASED" || release.status === "DEPRECATED") {
    return (
      <StatusBadge
        tone={release.status === "DEPRECATED" ? "warning" : "success"}
      >
        در حال پشتیبانی
      </StatusBadge>
    )
  }
  return <StatusBadge tone="neutral">زمان‌بندی نشده</StatusBadge>
}

export function KnowledgeVisibilityBadge({
  visibility,
}: {
  visibility: KnowledgeArticle["visibility"]
}) {
  return (
    <StatusBadge tone={visibility === "RESTRICTED" ? "warning" : "info"}>
      {visibility === "RESTRICTED" ? "محدود" : "داخلی"}
    </StatusBadge>
  )
}

export function KnowledgeReviewBadge({
  nextReviewAt,
}: {
  nextReviewAt?: string | null
}) {
  const [reviewNow] = useState(() => Date.now())
  if (!nextReviewAt) {
    return <StatusBadge tone="neutral">بدون برنامه بازبینی</StatusBadge>
  }
  const dueAt = new Date(nextReviewAt).getTime()
if (dueAt <= reviewNow) {
    return <StatusBadge tone="error">بازبینی سررسید شده</StatusBadge>
  }
  if (dueAt - reviewNow <= 30 * 24 * 60 * 60 * 1000) {
    return <StatusBadge tone="warning">بازبینی نزدیک</StatusBadge>
  }
  return <StatusBadge tone="success">بازبینی برنامه‌ریزی‌شده</StatusBadge>
}
export function ResponsiveTechnicalList<Row>({
  rows,
  columns,
  mobile,
  getKey,
  onOpen,
  meta,
  pageSize,
  onPage,
  onPageSize,
  emptyState,
  renderRowActions,
}: {
  rows: Row[]
  columns: DataTableColumn<Row>[]
  mobile: MobileEntityConfig<Row>
  getKey: (r: Row) => string
  onOpen: (r: Row) => void
  meta?: PageMeta
  pageSize: number
  onPage: (n: number) => void
  onPageSize: (n: number) => void
  emptyState?: ReactNode
  renderRowActions?: (row: Row) => ReactNode
}) {
  return (
    <DataTableShell
      rows={rows}
      columns={columns}
      getRowKey={getKey}
      onRowClick={onOpen}
      emptyState={emptyState}
      mobile={mobile}
      renderRowActions={renderRowActions}
      pagination={
        meta
          ? {
              page: meta.page,
              pageCount: meta.totalPages,
              total: meta.total,
              pageSize,
              onPageChange: onPage,
              onPageSizeChange: onPageSize,
            }
          : undefined
      }
    />
  )
}
export function LifecycleActions<T extends string>({
  targets,
  presentation,
  onTransition,
  pending,
  canTarget,
  requiresReason = () => false,
  getTargetBlockReason = () => undefined,
}: {
  targets: T[]
  presentation: { label: Record<T, string> }
  onTransition: (target: T, reason?: string) => Promise<unknown>
  pending: boolean
  canTarget: (target: T) => boolean
  requiresReason?: (target: T) => boolean
  getTargetBlockReason?: (target: T) => string | undefined
}) {
  const [target, setTarget] = useState<T>(),
    [reason, setReason] = useState("")
  const allowed = targets.filter(canTarget)
  if (!allowed.length) return null
  return (
    <>
      <div className="flex flex-wrap gap-2">
        {allowed.map((t) => {
          const blockReason = getTargetBlockReason(t)
          return (
          <Button
            key={t}
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setTarget(t)}
            disabled={pending || Boolean(blockReason)}
            title={blockReason}
          >
            <ArrowLeft className="size-4" />
            {presentation.label[t]}
          </Button>
          )
        })}
      </div>
      {allowed.some((item) => getTargetBlockReason(item)) ? (
        <ul className="mt-3 grid gap-2 text-xs leading-5 text-muted-foreground">
          {allowed.map((item) => {
            const reason = getTargetBlockReason(item)
            return reason ? <li key={item}>برای «{presentation.label[item]}»: {reason}</li> : null
          })}
        </ul>
      ) : null}
      <ConfirmDialog
        open={Boolean(target)}
        onOpenChange={(o) => {
          if (!o && !pending) {
            setTarget(undefined)
            setReason("")
          }
        }}
        title={target ? `تغییر وضعیت به «${presentation.label[target]}»` : ""}
        description="این تغییر مطابق سیاست چرخه عمر Backend ثبت می‌شود."
        isPending={pending}
        confirmDisabled={Boolean(target && requiresReason(target) && !reason.trim())}
        onConfirm={async () => {
          if (target) await onTransition(target, reason)
        }}
      >
        {target && requiresReason(target) ? (
          <label className="grid gap-2 text-sm font-bold text-[var(--app-heading)]">
            دلیل تغییر وضعیت
            <textarea
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              rows={3}
              required
              autoFocus
              className="min-h-24 w-full resize-y rounded-xl border border-[var(--app-divider)] bg-[var(--app-background)] px-3 py-2 font-normal text-[var(--app-text)] outline-none focus:border-[var(--app-primary)] focus:ring-2 focus:ring-[var(--app-primary-soft)]"
              placeholder="دلیل را ثبت کنید"
            />
          </label>
        ) : null}
      </ConfirmDialog>
    </>
  )
}
