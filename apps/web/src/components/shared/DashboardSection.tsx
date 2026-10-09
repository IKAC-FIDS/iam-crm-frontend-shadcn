import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"

import { cn } from "@workspace/ui/lib/utils"

type DashboardSectionTone = "default" | "primary" | "warning"

const toneClasses: Record<DashboardSectionTone, string> = {
  default: "bg-[var(--app-primary-soft)] text-[var(--app-primary)]",
  primary: "bg-[var(--app-primary)] text-[var(--app-on-primary)]",
  warning: "bg-[var(--warning-light)] text-amber-700",
}

export function DashboardSection({
  id,
  title,
  description,
  icon: Icon,
  badge,
  action,
  children,
  tone = "default",
  className,
}: {
  id?: string
  title: ReactNode
  description?: ReactNode
  icon?: LucideIcon
  badge?: ReactNode
  action?: ReactNode
  children: ReactNode
  tone?: DashboardSectionTone
  className?: string
}) {
  const titleId = id ? `${id}-title` : undefined

  return (
    <section
      id={id}
      aria-labelledby={titleId}
      className={cn("scroll-mt-24", className)}
    >
      <header className="mb-3 flex flex-wrap items-end justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          {Icon ? (
            <span
              className={cn(
                "grid size-10 shrink-0 place-items-center rounded-xl shadow-sm",
                toneClasses[tone],
              )}
            >
              <Icon className="size-5" aria-hidden="true" />
            </span>
          ) : null}
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2
                id={titleId}
                className="text-base font-bold text-[var(--app-heading)]"
              >
                {title}
              </h2>
              {badge ? (
                <span className="rounded-full border border-[var(--app-divider)] bg-[var(--app-surface)] px-2.5 py-1 text-xs font-semibold text-[var(--app-text-secondary)] shadow-sm">
                  {badge}
                </span>
              ) : null}
            </div>
            {description ? (
              <p className="mt-1 text-xs leading-6 text-[var(--app-text-secondary)]">
                {description}
              </p>
            ) : null}
          </div>
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </header>
      {children}
    </section>
  )
}

export function DashboardMetricGrid({
  children,
  columns = 4,
  className,
}: {
  children: ReactNode
  columns?: 3 | 4 | 5 | 6
  className?: string
}) {
  const desktopColumns = {
    3: "xl:grid-cols-3",
    4: "xl:grid-cols-4",
    5: "xl:grid-cols-5",
    6: "xl:grid-cols-6",
  }[columns]

  return (
    <div
      className={cn(
        "grid gap-3 sm:grid-cols-2 lg:grid-cols-3",
        desktopColumns,
        className,
      )}
    >
      {children}
    </div>
  )
}
