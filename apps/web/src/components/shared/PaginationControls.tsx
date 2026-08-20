import { ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@workspace/ui/components/button"

import { uiText } from "@/config/uiText"

export function PaginationControls({
  page,
  pageCount,
  onPageChange,
  disabled = false,
}: {
  page: number
  pageCount: number
  onPageChange: (page: number) => void
  disabled?: boolean
}) {
  const safePageCount = Math.max(pageCount, 1)
  const safePage = Math.min(Math.max(page, 1), safePageCount)

  return (
    <div className="flex flex-col gap-3 rounded-[var(--app-radius-card)] border border-[var(--app-divider)] bg-[var(--app-surface)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs text-[var(--app-text-secondary)]">
        {uiText.common.pagination.page} {safePage}{" "}
        {uiText.common.pagination.of} {safePageCount}
      </p>

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
