import type { ReactNode } from "react"
import { SurfaceCard } from "@/components/shared/SurfaceCard"

type Props = {
  title: string
  description?: string
  children: ReactNode
  action?: ReactNode
}

export function Company360Section({
  title,
  description,
  children,
  action,
}: Props) {
  return (
    <SurfaceCard className="p-5 sm:p-6">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h2 className="ui-section-title">{title}</h2>
          {description ? (
            <p className="mt-1 text-xs text-[var(--app-text-secondary)]">
              {description}
            </p>
          ) : null}
        </div>
        {action}
      </div>

      {children}
    </SurfaceCard>
  )
}
