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
  const safePageCount = Number.isFinite(pageCount)
    ? Math.max(Math.floor(pageCount), 1)
    : 1
  const safePage = Number.isFinite(page)
    ? Math.min(Math.max(Math.floor(page), 1), safePageCount)
    : 1

  return (
    <div className="flex flex-col gap-2 rounded-[var(--app-radius-card)] border border-[var(--app-divider)] bg-[var(--app-surface)] px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
      <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[var(--app-text-secondary)]">
        {total != null ? (
          <span className="font-medium whitespace-nowrap">
            {total.toLocaleString("fa-IR")} {uiText.common.pagination.rows}
          </span>
        ) : null}

        {total != null ? (
          <span className="text-[var(--app-divider)]">•</span>
        ) : null}

        <span className="whitespace-nowrap">
          {uiText.common.pagination.page} {safePage.toLocaleString("fa-IR")}{" "}
          {uiText.common.pagination.of} {safePageCount.toLocaleString("fa-IR")}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {pageSize != null && onPageSizeChange ? (
          <label className="relative">
            <span className="sr-only">
              {uiText.common.pagination.rowsPerPage}
            </span>
            <select
              aria-label={uiText.common.pagination.rowsPerPage}
              className="h-9 min-w-[92px] appearance-none rounded-xl border border-[var(--app-divider)] bg-[var(--app-background)] ps-3 pe-8 text-xs font-medium text-[var(--app-text-primary)] transition outline-none hover:border-[var(--app-primary)]/40 focus:border-[var(--app-primary)] disabled:opacity-50"
              value={pageSize}
              disabled={disabled}
              onChange={(event) => onPageSizeChange(Number(event.target.value))}
            >
              {pageSizeOptions.map((option) => (
                <option key={option} value={option}>
                  {option.toLocaleString("fa-IR")} /{" "}
                  {uiText.common.pagination.page}
                </option>
              ))}
            </select>
            <ChevronLeft className="pointer-events-none absolute end-2.5 top-1/2 size-3.5 -translate-y-1/2 -rotate-90 text-[var(--app-icon-muted)]" />
          </label>
        ) : null}

        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            className="size-9 rounded-xl"
            disabled={disabled || safePage <= 1}
            onClick={() => onPageChange(safePage - 1)}
            aria-label={uiText.common.pagination.previous}
            title={uiText.common.pagination.previous}
          >
            <ChevronRight className="size-4" />
          </Button>

          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            className="size-9 rounded-xl"
            disabled={disabled || safePage >= safePageCount}
            onClick={() => onPageChange(safePage + 1)}
            aria-label={uiText.common.pagination.next}
            title={uiText.common.pagination.next}
          >
            <ChevronLeft className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
