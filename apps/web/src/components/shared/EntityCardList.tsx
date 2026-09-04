import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"

import { cn } from "@workspace/ui/lib/utils"
import { SurfaceCard } from "./SurfaceCard"

export type EntityCardField<T> = {
  id: string
  label: ReactNode
  render: (item: T) => ReactNode
  icon?: LucideIcon
  hideLabel?: boolean
  priority?: "primary" | "normal" | "secondary"
  className?: string
  valueClassName?: string
}

export type EntityCardListProps<T> = {
  rows: T[]
  fields: EntityCardField<T>[]
  getRowKey: (item: T) => string
  actions?: (item: T) => ReactNode
  onRowClick?: (item: T) => void
  emptyState?: ReactNode
  density?: "compact" | "comfortable"
  className?: string
  cardClassName?: string
}

function fieldPriorityClass(priority: EntityCardField<unknown>["priority"]) {
  switch (priority) {
    case "primary":
      return "sm:col-span-2 xl:col-span-2"
    case "secondary":
      return "opacity-85"
    default:
      return ""
  }
}

export function EntityCardList<T>({
  rows,
  fields,
  getRowKey,
  actions,
  onRowClick,
  emptyState,
  density = "comfortable",
  className,
  cardClassName,
}: EntityCardListProps<T>) {
  if (!rows.length) return <>{emptyState || null}</>

  const compact = density === "compact"

  return (
    <div className={cn("grid gap-3", className)}>
      {rows.map((item) => {
        const clickable = Boolean(onRowClick)

        return (
          <SurfaceCard
            key={getRowKey(item)}
            className={cn(
              "group overflow-hidden border border-[var(--app-divider)]",
              "transition-[transform,box-shadow,border-color] duration-200",
              clickable &&
                "cursor-pointer motion-safe:hover:-translate-y-px hover:border-[var(--app-primary)]/25 hover:shadow-[var(--app-shadow-card)]",
              cardClassName,
            )}
          >
            <div
              role={clickable ? "button" : undefined}
              tabIndex={clickable ? 0 : undefined}
              onClick={clickable ? () => onRowClick?.(item) : undefined}
              onKeyDown={
                clickable
                  ? (event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault()
                        onRowClick?.(item)
                      }
                    }
                  : undefined
              }
              className={cn(
                "grid min-w-0 gap-3",
                compact ? "p-3" : "p-4 sm:p-5",
              )}
            >
              <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                {fields.map((field) => {
                  const Icon = field.icon
                  return (
                    <div
                      key={field.id}
                      className={cn(
                        "min-w-0 rounded-xl bg-[var(--app-background)]/70",
                        compact ? "px-3 py-2.5" : "px-3.5 py-3",
                        fieldPriorityClass(
                          field.priority as EntityCardField<unknown>["priority"],
                        ),
                        field.className,
                      )}
                    >
                      {!field.hideLabel ? (
                        <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-medium text-[var(--app-text-secondary)]">
                          {Icon ? <Icon className="size-3.5 shrink-0" /> : null}
                          <span>{field.label}</span>
                        </div>
                      ) : null}

                      <div
                        className={cn(
                          "min-w-0 break-words text-xs font-semibold text-[var(--app-heading)]",
                          field.valueClassName,
                        )}
                      >
                        {field.render(item)}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {actions ? (
              <div
                className={cn(
                  "flex min-w-0 flex-wrap items-center justify-end gap-2 border-t border-[var(--app-divider)] bg-[var(--app-background)]/45",
                  compact ? "px-3 py-2.5" : "px-4 py-3 sm:px-5",
                )}
                onClick={(event) => event.stopPropagation()}
                onKeyDown={(event) => event.stopPropagation()}
              >
                {actions(item)}
              </div>
            ) : null}
          </SurfaceCard>
        )
      })}
    </div>
  )
}
