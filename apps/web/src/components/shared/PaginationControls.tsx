import { ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@workspace/ui/components/button"

import { uiText } from "@/config/uiText"

export function PaginationControls({
  page,
  pageCount,
  onPageChange,
  pageSize,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100],
  total,
  disabled = false,
}: {
  page: number
  pageCount: number
  onPageChange: (page: number) => void
  pageSize?: number
  onPageSizeChange?: (pageSize: number) => void
  pageSizeOptions?: readonly number[]
  total?: number
  disabled?: boolean
}) {
  const safePageCount = Math.max(pageCount, 1)
  const safePage = Math.min(Math.max(page, 1), safePageCount)

  return (
    <div className="flex flex-col gap-3 rounded-[var(--app-radius-card)] border border-[var(--app-divider)] bg-[var(--app-surface)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-[var(--app-text-secondary)]">
        {pageSize != null && onPageSizeChange ? (
          <label className="flex items-center gap-2 whitespace-nowrap">
            <span>تعداد ردیف</span>
            <select
              aria-label="تعداد ردیف در هر صفحه"
              className="h-9 min-w-20 rounded-xl border border-[var(--app-divider)] bg-[var(--app-background)] px-2 text-sm text-[var(--app-text-primary)] outline-none focus:border-[var(--app-primary)] disabled:opacity-50"
              value={pageSize}
              disabled={disabled}
              onChange={(event) => onPageSizeChange(Number(event.target.value))}
            >
              {pageSizeOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </label>
        ) : null}
        <p>
          {uiText.common.pagination.page} {safePage}{" "}
          {uiText.common.pagination.of} {safePageCount}
          {total != null ? ` • ${total.toLocaleString("fa-IR")} ردیف` : ""}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="rounded-xl"
          disabled={disabled || safePage <= 1}
          onClick={() => onPageChange(safePage - 1)}
        >
          <ChevronRight className="size-4" />
          {uiText.common.pagination.previous}
        </Button>

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="rounded-xl"
          disabled={disabled || safePage >= safePageCount}
          onClick={() => onPageChange(safePage + 1)}
        >
          {uiText.common.pagination.next}
          <ChevronLeft className="size-4" />
        </Button>
      </div>
    </div>
  )
}
