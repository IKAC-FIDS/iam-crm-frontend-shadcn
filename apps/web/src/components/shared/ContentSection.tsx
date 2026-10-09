import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"

import { SurfaceCard } from "./SurfaceCard"

export function ContentSection({
  title,
  description,
  icon: Icon,
  action,
  children,
  className = "",
}: {
  title: ReactNode
  description?: ReactNode
  icon?: LucideIcon
  action?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <SurfaceCard className={`overflow-hidden ${className}`}>
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-[var(--app-divider)] bg-[var(--app-background)]/55 p-4 sm:p-5">
        <div className="flex min-w-0 items-start gap-3">
          {Icon ? (
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[var(--app-primary-soft)] text-[var(--app-primary)]">
              <Icon className="size-5" />
            </span>
          ) : null}
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-[var(--app-heading)]">
              {title}
            </h2>
            {description ? (
              <p className="mt-1 text-xs leading-6 text-[var(--app-text-secondary)]">
                {description}
              </p>
            ) : null}
          </div>
        </div>
        {action}
      </header>
      <div className="p-4 sm:p-5">{children}</div>
    </SurfaceCard>
  )
}

export function ContentList({ children }: { children: ReactNode }) {
  return <div className="grid gap-2">{children}</div>
}
export function ContentListItem({
  children,
  className = "",
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={`min-w-0 rounded-xl border border-[var(--app-divider)] bg-[var(--app-background)]/55 p-3 transition hover:border-[var(--app-primary)]/25 hover:bg-[var(--app-primary-soft)]/25 ${className}`}
    >
      {children}
    </div>
  )
}
