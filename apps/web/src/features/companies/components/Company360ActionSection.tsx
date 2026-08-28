import { FormSection } from "@/components/shared/FormSection"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { ArrowLeft, Plus } from "lucide-react"
import type { ReactNode } from "react"

import { PaginationControls } from "@/components/shared/PaginationControls"
import { uiText } from "@/config/uiText"
import { Button } from "@workspace/ui/components/button"

export function Company360ActionSection({
  title,
  description,
  count = 0,
  icon,
  children,
  onCreate,
  createLabel,
  onViewAll,
  contentClassName = "max-h-[238px]",
  page,
  pageCount,
  pageSize,
  total,
  isFetching = false,
  onPageChange,
  onPageSizeChange,
}: {
  title: string
  description?: string
  count?: number
  icon?: ReactNode
  children: ReactNode
  onCreate?: () => void
  createLabel?: string
  onViewAll?: () => void
  contentClassName?: string
  page?: number
  pageCount?: number
  pageSize?: number
  total?: number
  isFetching?: boolean
  onPageChange?: (page: number) => void
  onPageSizeChange?: (pageSize: number) => void
}) {
  const hasPagination =
    page != null &&
    pageCount != null &&
    pageSize != null &&
    onPageChange != null &&
    onPageSizeChange != null
  return (
    <FormSection
      title={
        <span className="flex flex-wrap items-center gap-2">
          {icon}
          {title}
          <StatusBadge dot={false}>{count.toLocaleString("fa-IR")}</StatusBadge>
        </span>
      }
      description={description}
      actions={
        onCreate ? (
          <Button
            type="button"
            size="icon"
            className="rounded-xl"
            onClick={onCreate}
            aria-label={createLabel || uiText.common.save}
            title={createLabel}
          >
            <Plus className="size-4" />
          </Button>
        ) : null
      }
      bodyClassName={`min-h-0 overflow-y-auto overscroll-contain p-4 [scrollbar-gutter:stable] ${contentClassName}`}
      footer={
        <div className="grid gap-3">
          {hasPagination ? (
            <PaginationControls
              page={page}
              pageCount={pageCount}
              pageSize={pageSize}
              total={total ?? count}
              disabled={isFetching}
              onPageChange={onPageChange}
              onPageSizeChange={onPageSizeChange}
            />
          ) : null}
          {onViewAll ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="w-full justify-between rounded-xl text-xs text-[var(--app-primary)]"
              onClick={onViewAll}
            >
              {uiText.dashboard.recentActivities.viewAll}
              <ArrowLeft className="size-4" />
            </Button>
          ) : null}
        </div>
      }
    >
      {children}
    </FormSection>
  )
}
