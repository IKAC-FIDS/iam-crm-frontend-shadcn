import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"

import { SurfaceCard } from "./SurfaceCard"

const toneClasses = {
  primary: "bg-[var(--app-primary-soft)] text-[var(--app-primary)]",
  success: "bg-[var(--success-light)] text-[var(--success)]",
  warning: "bg-[var(--warning-light)] text-amber-700",
  info: "bg-[var(--info-light)] text-[var(--info)]",
  neutral: "bg-muted text-muted-foreground",
} as const

export function MetricCard({
  label,
  value,
  helper,
  icon: Icon,
  tone = "primary",
  className = "",
  onClick,
  active,
}: {
  label: ReactNode
  value: ReactNode
  helper?: ReactNode
  icon: LucideIcon
  tone?: keyof typeof toneClasses
  className?: string
  onClick?: () => void
  active?: boolean
}) {
  const displayValue =
    typeof value === "number" ? value.toLocaleString("fa-IR") : value

  return (
    <SurfaceCard
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-pressed={onClick ? Boolean(active) : undefined}
      onClick={onClick}
      onKeyDown={(event) => {
        if (onClick && (event.key === "Enter" || event.key === " ")) {
          event.preventDefault()
          onClick()
        }
      }}
      className={`group relative overflow-hidden p-4 transition-[transform,box-shadow,border-color] duration-200 sm:p-5 ${onClick ? "cursor-pointer focus-visible:ring-2 focus-visible:ring-ring motion-safe:hover:-translate-y-0.5 motion-safe:hover:shadow-[var(--app-shadow-card-hover)]" : ""} ${active ? "border-[var(--app-primary)] bg-[var(--app-primary-soft)]" : ""} ${className}`}
    >
      <span className="pointer-events-none absolute inset-x-0 top-0 h-0.5 origin-right scale-x-0 bg-[var(--app-primary)] transition-transform duration-200 group-hover:scale-x-100" />
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="ui-caption">{label}</div>
          <div className="ui-metric mt-2 truncate">{displayValue}</div>
          {helper ? <div className="ui-caption mt-1">{helper}</div> : null}
        </div>
        <div className={`shrink-0 rounded-2xl p-3 ${toneClasses[tone]}`}>
          <Icon className="size-5" />
        </div>
      </div>
    </SurfaceCard>
  )
}
