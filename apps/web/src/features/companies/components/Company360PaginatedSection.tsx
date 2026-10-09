import type { ReactNode } from "react"

import { uiText } from "@/config/uiText"
import { PaginationControls } from "@/components/shared/PaginationControls"

type Props = {
  title: string
  total?: number
  page?: number
  totalPages?: number
  isLoading?: boolean
  isError?: boolean
  onNext?: () => void
  onPrevious?: () => void
  children: ReactNode
}

export function Company360PaginatedSection({
  title,
  total = 0,
  page = 1,
  totalPages = 0,
  isLoading = false,
  isError = false,
  onNext,
  onPrevious,
  children,
}: Props) {
  const detail = uiText.companies.detail

  return (
    <section className="rounded-[var(--app-radius-feature)] border border-[var(--app-divider)] bg-[var(--app-surface)] p-5 shadow-[var(--app-shadow-card)] sm:p-6">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="ui-section-title">{title}</h2>
          <p className="mt-1 text-xs text-[var(--app-text-secondary)]">
            {total.toLocaleString("fa-IR")}
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-2">
          <div className="h-14 animate-pulse rounded-2xl bg-[var(--app-background)]" />
          <div className="h-14 animate-pulse rounded-2xl bg-[var(--app-background)]" />
        </div>
      ) : isError ? (
        <p className="text-xs text-[var(--app-text-secondary)]">
          {detail.errorDescription}
        </p>
      ) : (
        children
      )}

      {totalPages > 1 ? (
        <div className="mt-5 border-t border-[var(--app-divider)] pt-3">
          <PaginationControls
            page={page}
            pageCount={totalPages}
            total={total}
            disabled={isLoading}
            onPageChange={(nextPage) => {
              if (nextPage > page) onNext?.()
              if (nextPage < page) onPrevious?.()
            }}
          />
        </div>
      ) : null}
    </section>
  )
}
