import type { ReactNode } from "react"

import { uiText } from "@/config/uiText"
import { Button } from "@workspace/ui/components/button"

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
  const pagination = uiText.common.pagination
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

        {totalPages > 1 ? (
          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--app-text-secondary)]">
              {pagination.page} {page.toLocaleString("fa-IR")} {pagination.of}{" "}
              {totalPages.toLocaleString("fa-IR")}
            </span>
            <Button
              size="sm"
              variant="outline"
              disabled={page <= 1 || isLoading}
              onClick={onPrevious}
            >
              {pagination.previous}
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={page >= totalPages || isLoading}
              onClick={onNext}
            >
              {pagination.next}
            </Button>
          </div>
        ) : null}
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
    </section>
  )
}
