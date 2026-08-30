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
import type { PageMeta } from "../types"
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
}: {
  targets: T[]
  presentation: { label: Record<T, string> }
  onTransition: (target: T, reason?: string) => Promise<unknown>
  pending: boolean
  canTarget: (target: T) => boolean
  requiresReason?: (target: T) => boolean
}) {
  const [target, setTarget] = useState<T>(),
    [reason, setReason] = useState("")
  const allowed = targets.filter(canTarget)
  if (!allowed.length) return null
  return (
    <>
      <div className="flex flex-wrap gap-2">
        {allowed.map((t) => (
          <Button
            key={t}
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setTarget(t)}
            disabled={pending}
          >
            <ArrowLeft className="size-4" />
            {presentation.label[t]}
          </Button>
        ))}
      </div>
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
