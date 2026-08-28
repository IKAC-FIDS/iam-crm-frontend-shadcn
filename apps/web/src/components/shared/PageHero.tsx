import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"

import { SurfaceCard } from "./SurfaceCard"
import { Button } from "@workspace/ui/components/button"

export function PageHero({
  title,
  description,
  eyebrow,
  icon: Icon,
  actions,
  primaryAction,
  breadcrumbs,
  metadata,
  className = "",
}: {
  title: ReactNode
  description?: ReactNode
  eyebrow?: ReactNode
  icon?: LucideIcon
  actions?: ReactNode
  primaryAction?: {
    label: string
    onClick: () => void
    icon?: LucideIcon
    disabled?: boolean
  }
  breadcrumbs?: ReactNode
  metadata?: ReactNode
  className?: string
}) {
  return (
    <SurfaceCard
      className={`relative overflow-hidden rounded-[var(--app-radius-hero)] px-4 py-5 sm:px-7 sm:py-6 ${className}`}
    >
      <div className="pointer-events-none absolute -end-20 -top-24 size-64 rounded-full bg-[var(--app-primary-soft)] blur-3xl" />

      <div className="relative flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
        <div className="min-w-0">
          {breadcrumbs ? (
            <div className="ui-caption mb-3">{breadcrumbs}</div>
          ) : null}
          {eyebrow ? (
            <div className="ui-eyebrow mb-3 inline-flex max-w-full items-center gap-2">
              {Icon ? <Icon className="size-4 shrink-0" /> : null}
              <span className="truncate">{eyebrow}</span>
            </div>
          ) : null}

          <h1 className="ui-page-title flex items-center gap-3">
            {!eyebrow && Icon ? (
              <Icon
                aria-hidden="true"
                className="size-6 shrink-0 text-[var(--app-primary)]"
              />
            ) : null}
            {title}
          </h1>
          {description ? (
            <div className="ui-body mt-2 max-w-3xl">{description}</div>
          ) : null}
          {metadata ? (
            <div className="mt-3 flex flex-wrap gap-2">{metadata}</div>
          ) : null}
        </div>

        {actions || primaryAction ? (
          <div className="grid shrink-0 grid-cols-1 gap-2 min-[420px]:grid-cols-2 sm:flex sm:flex-wrap">
            {actions}
            {primaryAction ? (
              <Button
                type="button"
                disabled={primaryAction.disabled}
                onClick={primaryAction.onClick}
                className="rounded-xl"
              >
                {primaryAction.icon ? (
                  <primaryAction.icon className="size-4" />
                ) : null}
                {primaryAction.label}
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>
    </SurfaceCard>
  )
}
