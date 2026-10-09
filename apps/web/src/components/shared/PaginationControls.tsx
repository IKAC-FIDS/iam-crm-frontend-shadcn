import { ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@workspace/ui/components/button"

import { uiText } from "@/config/uiText"

type PageItem = number | "ellipsis-start" | "ellipsis-end"

function getPaginationItems(page: number, pageCount: number): PageItem[] {
  if (pageCount <= 7) return Array.from({ length: pageCount }, (_, index) => index + 1)

  const pages = [...new Set([1, pageCount, page - 1, page, page + 1])]
    .filter((value) => value > 0 && value <= pageCount)
    .sort((a, b) => a - b)
  const items: PageItem[] = []

  pages.forEach((value, index) => {
    const previous = pages[index - 1]
    if (previous && value - previous > 1) {
      items.push(previous === 1 ? "ellipsis-start" : "ellipsis-end")
    }
    items.push(value)
  })
  return items
}

export function PaginationControls({
  page, pageCount, onPageChange, pageSize, onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100], total, disabled = false,
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
  const safePageCount = Number.isFinite(pageCount) ? Math.max(Math.floor(pageCount), 1) : 1
  const safePage = Number.isFinite(page) ? Math.min(Math.max(Math.floor(page), 1), safePageCount) : 1
  const firstResult = total && pageSize ? Math.min((safePage - 1) * pageSize + 1, total) : 0
  const lastResult = total && pageSize ? Math.min(safePage * pageSize, total) : 0
  const pageItems = getPaginationItems(safePage, safePageCount)

  return (
    <div className="flex flex-col gap-2 rounded-[var(--app-radius-card)] border border-[var(--app-divider)] bg-[var(--app-surface)] px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
      <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[var(--app-text-secondary)]">
        {total != null ? (
          <>
            <span className="font-medium whitespace-nowrap">
              {pageSize != null && total > 0
                ? `نمایش ${firstResult.toLocaleString("fa-IR")} تا ${lastResult.toLocaleString("fa-IR")} از ${total.toLocaleString("fa-IR")} نتیجه`
                : `${total.toLocaleString("fa-IR")} ${uiText.common.pagination.rows}`}
            </span>
            {pageSize != null && total > 0 ? (
              <span className="sr-only">{total.toLocaleString("fa-IR")} {uiText.common.pagination.rows}</span>
            ) : null}
          </>
        ) : null}
        {total != null ? <span className="text-[var(--app-divider)]">•</span> : null}
        <span className="whitespace-nowrap">
          {uiText.common.pagination.page} {safePage.toLocaleString("fa-IR")} {uiText.common.pagination.of} {safePageCount.toLocaleString("fa-IR")}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {pageSize != null && onPageSizeChange ? (
          <label className="relative">
            <span className="sr-only">{uiText.common.pagination.rowsPerPage}</span>
            <select
              aria-label={uiText.common.pagination.rowsPerPage}
              className="h-9 min-w-[92px] appearance-none rounded-xl border border-[var(--app-divider)] bg-[var(--app-background)] ps-3 pe-8 text-xs font-medium text-[var(--app-text-primary)] transition outline-none hover:border-[var(--app-primary)]/40 focus:border-[var(--app-primary)] disabled:opacity-50"
              value={pageSize}
              disabled={disabled}
              onChange={(event) => onPageSizeChange(Number(event.target.value))}
            >
              {pageSizeOptions.map((option) => (
                <option key={option} value={option}>{option.toLocaleString("fa-IR")} / {uiText.common.pagination.page}</option>
              ))}
            </select>
            <ChevronLeft className="pointer-events-none absolute end-2.5 top-1/2 size-3.5 -translate-y-1/2 -rotate-90 text-[var(--app-icon-muted)]" />
          </label>
        ) : null}

        <nav className="flex items-center gap-1" aria-label="صفحه‌بندی نتایج" dir="rtl">
          <Button type="button" variant="outline" size="icon-sm" className="size-9 rounded-xl" disabled={disabled || safePage <= 1} onClick={() => onPageChange(safePage - 1)} aria-label={uiText.common.pagination.previous} title={uiText.common.pagination.previous}>
            <ChevronRight className="size-4" />
          </Button>

          <div className="hidden items-center gap-1 sm:flex">
            {pageItems.map((item) => typeof item === "number" ? (
              <Button key={item} type="button" variant={item === safePage ? "default" : "ghost"} size="icon-sm" className="size-9 rounded-xl" disabled={disabled} aria-label={`صفحه ${item.toLocaleString("fa-IR")}`} aria-current={item === safePage ? "page" : undefined} onClick={() => onPageChange(item)}>
                {item.toLocaleString("fa-IR")}
              </Button>
            ) : (
              <span key={item} aria-hidden="true" className="grid size-9 place-items-center text-[var(--app-text-secondary)]">…</span>
            ))}
          </div>

          <Button type="button" variant="outline" size="icon-sm" className="size-9 rounded-xl" disabled={disabled || safePage >= safePageCount} onClick={() => onPageChange(safePage + 1)} aria-label={uiText.common.pagination.next} title={uiText.common.pagination.next}>
            <ChevronLeft className="size-4" />
          </Button>
        </nav>
      </div>
    </div>
  )
}
