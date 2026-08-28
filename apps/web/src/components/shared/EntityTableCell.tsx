import type { ReactNode } from "react"

/** Shared, bounded identity cell for the company-style entity lists. */
export function EntityTableCell({
  title,
  subtitle,
  avatar,
  subtitleDir,
}: {
  title: string
  subtitle?: string | null
  avatar: ReactNode
  subtitleDir?: "ltr" | "rtl"
}) {
  return (
    <div className="flex h-11 w-64 items-center gap-3 text-start">
      <span
        aria-hidden="true"
        className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[var(--app-primary-soft)] text-sm font-bold text-[var(--app-primary)] ring-1 ring-[var(--app-primary)]/10"
      >
        {avatar}
      </span>
      <div className="min-w-0 flex-1">
        <p
          title={title}
          className="truncate text-sm leading-5 font-bold text-[var(--app-heading)]"
        >
          {title}
        </p>
        {subtitle ? (
          <p
            title={subtitle}
            dir={subtitleDir}
            className="mt-1 truncate text-start text-xs leading-4 text-[var(--app-text-secondary)]"
          >
            {subtitle}
          </p>
        ) : null}
      </div>
    </div>
  )
}
