import type { ReactNode } from "react"

type StatusTone =
  | "neutral"
  | "primary"
  | "success"
  | "warning"
  | "error"
  | "info"

const toneClasses: Record<StatusTone, string> = {
  neutral:
    "bg-[var(--secondary)] text-[var(--app-primary-alt)] ring-[var(--app-outline)]/35",
  primary:
    "bg-[var(--app-primary-soft)] text-[var(--app-on-primary-container)] ring-[var(--app-primary)]/15",
  success:
    "bg-[var(--success-light)] text-[var(--success)] ring-[var(--success)]/15",
  warning:
    "bg-[var(--warning-light)] text-[var(--warning)] ring-[var(--warning)]/20",
  error:
    "bg-[var(--destructive-soft)] text-[var(--destructive)] ring-[var(--destructive)]/15",
  info:
    "bg-[var(--info-light)] text-[var(--info)] ring-[var(--info)]/15",
}

export function StatusBadge({
  children,
  tone = "neutral",
  dot = true,
}: {
  children: ReactNode
  tone?: StatusTone
  dot?: boolean
}) {
  return (
    <span
      className={[
        "inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset",
        toneClasses[tone],
      ].join(" ")}
    >
      {dot ? <span className="size-1.5 rounded-full bg-current opacity-75" /> : null}
      {children}
    </span>
  )
}

export type { StatusTone }
