import type { HTMLAttributes } from "react"

export function SurfaceCard({
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={[
        "min-w-0 rounded-[var(--app-radius-card)] border border-[var(--app-divider)] bg-[var(--app-surface)] shadow-[var(--app-shadow-card)]",
        className,
      ].join(" ")}
      {...props}
    />
  )
}
