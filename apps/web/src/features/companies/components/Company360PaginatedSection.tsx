import type { ReactNode } from "react"

import { Button } from "@workspace/ui/components/button"

type Props = {
  title: string
  total?: number
  page?: number
  totalPages?: number
  onNext?: () => void
  onPrevious?: () => void
  children: ReactNode
}

export function Company360PaginatedSection({
  title,
  total = 0,
  page = 1,
  totalPages = 1,
  onNext,
  onPrevious,
  children,
}: Props) {
  return (
    <section className="rounded-2xl border border-[var(--app-divider)] bg-[var(--app-surface)] p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="ui-section-title">{title}</h2>
          <p className="mt-1 text-xs text-[var(--app-text-secondary)]">
            {total.toLocaleString("fa-IR")} مورد
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={page <= 1}
            onClick={onPrevious}
          >
            قبلی
          </Button>

          <Button
            size="sm"
            variant="outline"
            disabled={page >= totalPages}
            onClick={onNext}
          >
            بعدی
          </Button>
        </div>
      </div>

      {children}
    </section>
  )
}
