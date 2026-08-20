import type { ReactNode } from "react"
import { Search, X } from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"

import { uiText } from "@/config/uiText"

export function DataTableToolbar({
  searchValue,
  onSearchChange,
  searchPlaceholder = uiText.common.table.searchPlaceholder,
  filters,
  actions,
  hasActiveFilters = false,
  onClearFilters,
}: {
  searchValue: string
  onSearchChange: (value: string) => void
  searchPlaceholder?: string
  filters?: ReactNode
  actions?: ReactNode
  hasActiveFilters?: boolean
  onClearFilters?: () => void
}) {
  return (
    <div className="flex flex-col gap-3 rounded-[var(--app-radius-card)] border border-[var(--app-divider)] bg-[var(--app-surface)] p-3 shadow-[var(--app-shadow-card)] lg:flex-row lg:items-center">
      <div className="relative min-w-0 flex-1 lg:max-w-sm">
        <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-[var(--app-icon-muted)]" />

        <Input
          value={searchValue}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={searchPlaceholder}
          className="h-10 rounded-xl border-[var(--app-divider)] bg-[var(--app-background)]/55 ps-10 focus-visible:ring-[var(--app-primary)]"
        />
      </div>

      {filters ? (
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
          {filters}
        </div>
      ) : null}

      <div className="flex shrink-0 flex-wrap items-center gap-2">
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
    </div>
  )
}
