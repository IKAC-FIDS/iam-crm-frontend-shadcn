import type { ReactNode } from "react"
import type { LucideIcon } from "lucide-react"

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon?: LucideIcon
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="grid min-h-48 place-items-center rounded-[var(--app-radius-card)] border border-dashed border-[var(--app-divider)] bg-[var(--app-background)]/55 p-6 text-center">
      <div>
        {Icon ? (
          <div className="mx-auto grid size-11 place-items-center rounded-2xl bg-[var(--app-primary-soft)] text-[var(--app-primary)]">
            <Icon className="size-5" />
          </div>
        ) : null}

        <h3 className="mt-4 text-sm font-bold text-[var(--app-heading)]">
          {title}
        </h3>

        {description ? (
          <p className="mx-auto mt-2 max-w-md text-xs leading-6 text-[var(--app-text-secondary)]">
            {description}
          </p>
        ) : null}

        {action ? <div className="mt-4">{action}</div> : null}
      </div>
    </div>
  )
}
