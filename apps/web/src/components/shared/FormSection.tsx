import type { ReactNode } from "react"
import { SurfaceCard } from "./SurfaceCard"

export function FormSection({
  title,
  description,
  children,
  actions,
  footer,
  bodyClassName,
}: {
  title: ReactNode
  description?: ReactNode
  children: ReactNode
  actions?: ReactNode
  footer?: ReactNode
  bodyClassName?: string
}) {
  return (
    <SurfaceCard className="overflow-hidden">
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

      <div className={bodyClassName ?? "p-4 sm:p-5"}>{children}</div>
      {footer ? (
        <div className="border-t border-[var(--app-divider)] p-3">{footer}</div>
      ) : null}
    </SurfaceCard>
  )
}
