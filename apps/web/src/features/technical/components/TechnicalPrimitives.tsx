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
}: {
  targets: T[]
  presentation: { label: Record<T, string> }
  onTransition: (target: T, reason?: string) => Promise<unknown>
  pending: boolean
  canTarget: (target: T) => boolean
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
        onConfirm={async () => {
          if (target) await onTransition(target, reason)
        }}
      />
    </>
  )
}
