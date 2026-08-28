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
      className={`p-4 sm:p-5 ${onClick ? "cursor-pointer focus-visible:ring-2 focus-visible:ring-ring" : ""} ${active ? "border-[var(--app-primary)] bg-[var(--app-primary-soft)]" : ""} ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="ui-caption">{label}</div>
          <div className="ui-metric mt-2 truncate">{value}</div>
          {helper ? <div className="ui-caption mt-1">{helper}</div> : null}
        </div>
        <div className={`shrink-0 rounded-2xl p-3 ${toneClasses[tone]}`}>
          <Icon className="size-5" />
        </div>
      </div>
    </SurfaceCard>
  )
}
