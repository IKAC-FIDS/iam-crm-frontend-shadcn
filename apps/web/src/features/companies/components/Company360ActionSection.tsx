import { ArrowLeft, Plus } from "lucide-react"
import type { ReactNode } from "react"

import { PaginationControls } from "@/components/shared/PaginationControls"
import { uiText } from "@/config/uiText"
import { Button } from "@workspace/ui/components/button"

export function Company360ActionSection({
  title, description, count = 0, icon, children, onCreate, createLabel, onViewAll,
  contentClassName = "max-h-[238px]", page, pageCount, pageSize, total,
  isFetching = false, onPageChange, onPageSizeChange,
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
  const hasPagination = page != null && pageCount != null && pageSize != null && onPageChange != null && onPageSizeChange != null
  return (
    <section className="group relative overflow-hidden rounded-[var(--app-radius-feature)] border border-[var(--app-divider)] bg-[var(--app-surface)] shadow-[var(--app-shadow-card)] transition-shadow duration-200 hover:shadow-md">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-l from-[var(--app-primary)] via-[var(--app-info)] to-[var(--app-primary-soft)]" />
      <header className="flex items-start justify-between gap-4 px-5 pb-4 pt-5 sm:px-6 sm:pt-6">
        <div className="flex min-w-0 items-start gap-3">
          {icon ? <div className="grid size-10 shrink-0 place-items-center rounded-2xl bg-[var(--app-primary-soft)] text-[var(--app-primary)]">{icon}</div> : null}
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="ui-section-title">{title}</h2>
              <span className="rounded-full border border-[var(--app-divider)] bg-[var(--app-background)] px-2 py-0.5 text-xs font-bold text-[var(--app-text-secondary)]">{count.toLocaleString("fa-IR")}</span>
            </div>
            {description ? <p className="mt-1 text-xs leading-5 text-[var(--app-text-secondary)]">{description}</p> : null}
          </div>
        </div>
        {onCreate ? <Button type="button" size="icon" className="size-9 shrink-0 rounded-xl bg-[var(--app-primary)] text-[var(--app-on-primary)] shadow-sm hover:bg-[var(--app-primary-hover)]" onClick={onCreate} aria-label={createLabel} title={createLabel}><Plus className="size-4" /></Button> : null}
      </header>
      <div className={`mx-2 min-h-0 overflow-y-auto overscroll-contain px-3 pb-2 pe-2 [scrollbar-gutter:stable] sm:mx-3 ${contentClassName}`}>{children}</div>
      {hasPagination ? (
        <div className="mt-3 border-t border-[var(--app-divider)] bg-[var(--app-background)]/25 px-3 py-3 sm:px-4">
          <PaginationControls page={page} pageCount={pageCount} pageSize={pageSize} total={total ?? count} disabled={isFetching} onPageChange={onPageChange} onPageSizeChange={onPageSizeChange} />
        </div>
      ) : null}
      {onViewAll ? <footer className="border-t border-[var(--app-divider)] bg-[var(--app-background)]/40 px-5 py-3 sm:px-6"><Button type="button" variant="ghost" size="sm" className="w-full justify-between rounded-xl text-xs text-[var(--app-primary)] hover:bg-[var(--app-primary-soft)] hover:text-[var(--app-primary-interactive)]" onClick={onViewAll}>{uiText.dashboard.recentActivities.viewAll}<ArrowLeft className="size-3.5" /></Button></footer> : null}
    </section>
  )
}
