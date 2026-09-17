import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"

import { cn } from "@workspace/ui/lib/utils"
import { SurfaceCard } from "./SurfaceCard"

export function DashboardToolbar({
  title,
  description,
  icon: Icon,
  children,
  className,
}: {
  title: ReactNode
  description?: ReactNode
  icon?: LucideIcon
  children: ReactNode
  className?: string
}) {
  return (
    <SurfaceCard
      className={cn(
        "flex flex-col gap-4 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between",
        className,
      )}
    >
      <div className="flex min-w-0 items-start gap-3">
        {Icon ? (
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[var(--app-primary-soft)] text-[var(--app-primary)]">
            <Icon className="size-5" aria-hidden="true" />
          </span>
        ) : null}
        <div className="min-w-0">
          <h2 className="text-sm font-bold text-[var(--app-heading)]">
            {title}
          </h2>
          {description ? (
            <p className="mt-1 text-xs leading-6 text-[var(--app-text-secondary)]">
              {description}
            </p>
          ) : null}
        </div>
      </div>
      <div className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto lg:justify-end">
        {children}
      </div>
    </SurfaceCard>
  )
}
