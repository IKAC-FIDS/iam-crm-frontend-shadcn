import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"

import { cn } from "@workspace/ui/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip"

type StatusTone =
  | "neutral"
  | "secondary"
  | "primary"
  | "success"
  | "warning"
  | "error"
  | "danger"
  | "info"

const toneClasses: Record<StatusTone, string> = {
  neutral:
    "bg-[var(--secondary)] text-[var(--app-primary-alt)] ring-[var(--app-outline)]/35",
  secondary:
    "bg-[var(--app-background)] text-[var(--app-text-secondary)] ring-[var(--app-divider)]",
  primary:
    "bg-[var(--app-primary-soft)] text-[var(--app-on-primary-container)] ring-[var(--app-primary)]/15",
  success:
    "bg-[var(--success-light)] text-[var(--success)] ring-[var(--success)]/15",
  warning:
    "bg-[var(--warning-light)] text-[var(--warning)] ring-[var(--warning)]/20",
  error:
    "bg-[var(--destructive-soft)] text-[var(--destructive)] ring-[var(--destructive)]/15",
  danger:
    "bg-[var(--destructive-soft)] text-[var(--destructive)] ring-[var(--destructive)]/15",
  info:
    "bg-[var(--info-light)] text-[var(--info)] ring-[var(--info)]/15",
}

export function StatusBadge({
  children,
  tone = "neutral",
  dot = true,
  icon: Icon,
  size = "sm",
  tooltip,
  className,
}: {
  children: ReactNode
  tone?: StatusTone
  dot?: boolean
  icon?: LucideIcon
  size?: "xs" | "sm" | "md"
  tooltip?: ReactNode
  className?: string
}) {
  const badge = (
    <span
      className={cn(
        "inline-flex w-fit max-w-full items-center rounded-full font-semibold ring-1 ring-inset",
        size === "xs" && "gap-1 px-2 py-0.5 text-[0.6875rem]",
        size === "sm" && "gap-1.5 px-2.5 py-1 text-xs",
        size === "md" && "gap-1.5 px-3 py-1.5 text-sm",
        toneClasses[tone],
        className,
      )}
    >
      {Icon ? <Icon aria-hidden="true" className="size-3.5 shrink-0" /> : null}
      {!Icon && dot ? (
        <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-current opacity-75" />
      ) : null}
      <span className="min-w-0 truncate">{children}</span>
    </span>
  )

  if (!tooltip) return badge

  return (
    <Tooltip>
      <TooltipTrigger render={badge} />
      <TooltipContent>{tooltip}</TooltipContent>
    </Tooltip>
  )
}

export type { StatusTone }
