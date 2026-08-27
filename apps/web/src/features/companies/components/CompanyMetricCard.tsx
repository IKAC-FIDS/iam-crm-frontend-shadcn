import type { LucideIcon } from "lucide-react"

export function CompanyMetricCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: LucideIcon
  label: string
  value: string
  hint?: string
}) {
  return (
    <div className="rounded-[var(--app-radius-card)] border border-[var(--app-divider)] bg-[var(--app-surface)] p-4 shadow-[var(--app-shadow-card)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-[var(--app-text-secondary)]">
            {label}
          </p>
          <p className="mt-2 text-xl font-bold tracking-tight text-[var(--app-heading)]">
            {value}
          </p>
          {hint ? (
            <p className="mt-1 text-xs text-[var(--app-text-secondary)]">
              {hint}
            </p>
          ) : null}
        </div>
        <div className="grid size-9 place-items-center rounded-xl bg-[var(--app-primary-soft)] text-[var(--app-primary)]">
          <Icon className="size-4" />
        </div>
      </div>
    </div>
  )
}
