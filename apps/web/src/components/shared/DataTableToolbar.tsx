import type { ReactNode } from "react"
import { Search, X } from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"

import { uiText } from "@/config/uiText"
import { cn } from "@workspace/ui/lib/utils"

export function DataTableToolbar({
  searchValue,
  onSearchChange,
  searchPlaceholder = uiText.common.table.searchPlaceholder,
  filters,
  actions,
  hasActiveFilters = false,
  onClearFilters,
  filtersClassName,
}: {
  searchValue?: string
  onSearchChange?: (value: string) => void
  searchPlaceholder?: string
  filters?: ReactNode
  actions?: ReactNode
  hasActiveFilters?: boolean
  onClearFilters?: () => void
  filtersClassName?: string
}) {
  return (
    <div className="ui-filter-controls flex min-w-0 flex-wrap items-center gap-[var(--app-space-toolbar)] rounded-[var(--app-radius-card)] border border-[var(--app-divider)] bg-[var(--app-surface)] p-3 shadow-[var(--app-shadow-card)]">
      {onSearchChange ? (
        <div className="relative min-w-0 flex-[1_1_240px]">
          <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-[var(--app-icon-muted)]" />

          <Input
            aria-label={searchPlaceholder}
            value={searchValue ?? ""}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={searchPlaceholder}
            className="h-11 rounded-xl border-[var(--app-divider)] bg-[var(--app-background)]/55 ps-10 focus-visible:ring-[var(--app-primary)]"
          />
        </div>
      ) : null}

      {filters ? (
        <div
          className={cn(
            "flex min-w-0 flex-[2_1_320px] flex-wrap items-center gap-3 [&>*]:min-w-0",
            filtersClassName
          )}
        >
          {filters}
        </div>
      ) : null}

      {actions || (hasActiveFilters && onClearFilters) ? (
        <div className="ms-auto flex min-w-0 flex-wrap items-center justify-end gap-2">
          {hasActiveFilters && onClearFilters ? (
            <Button
              type="button"
              variant="ghost"
              className="h-10 rounded-xl text-xs text-[var(--app-primary-alt)]"
              onClick={onClearFilters}
            >
              <X className="size-4" />
              {uiText.common.table.clearFilters}
            </Button>
          ) : null}

          {actions}
        </div>
      ) : null}
    </div>
  )
}
