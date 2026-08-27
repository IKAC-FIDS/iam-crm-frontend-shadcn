import type { ReactNode } from "react"

export function FormSection({
  title,
  description,
  children,
  actions,
}: {
  title: ReactNode
  description?: ReactNode
  children: ReactNode
  actions?: ReactNode
}) {
  return (
    <section className="overflow-hidden rounded-[var(--app-radius-card)] border border-[var(--app-divider)] bg-[var(--app-surface)] shadow-[var(--app-shadow-card)]">
      <div className="flex flex-col gap-3 border-b border-[var(--app-divider)] px-4 py-4 sm:flex-row sm:items-start sm:justify-between sm:px-5">
        <div className="min-w-0">
          <h2 className="ui-card-title">{title}</h2>
          {description ? (
            <div className="mt-1 text-xs leading-6 text-[var(--app-text-secondary)]">
              {description}
            </div>
          ) : null}
        </div>

        {actions ? (
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {actions}
          </div>
        ) : null}
      </div>

      <div className="p-4 sm:p-5">{children}</div>
    </section>
  )
}
