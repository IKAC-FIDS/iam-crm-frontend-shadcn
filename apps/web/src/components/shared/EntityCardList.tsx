import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"

import { cn } from "@workspace/ui/lib/utils"
import { EntityCard } from "./EntityCard"

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
  layout?: "tile" | "row"
  className?: string
  cardClassName?: string
  fieldsClassName?: string
  title?: (item: T) => ReactNode
  subtitle?: (item: T) => ReactNode
  media?: (item: T) => ReactNode
  badges?: (item: T) => ReactNode
  tags?: (item: T) => ReactNode
}

/** Compatibility adapter: legacy field configurations use the standard EntityCard shell. */
export function EntityCardList<T>({
  rows, fields, getRowKey, actions, onRowClick, emptyState,
  density = "comfortable", layout = "tile", className, cardClassName,
  fieldsClassName, title, subtitle, media, badges, tags,
}: EntityCardListProps<T>) {
  if (!rows.length) return <>{emptyState || null}</>

  return (
    <div className={cn("grid auto-rows-max content-start gap-3", layout === "tile" && "md:grid-cols-2", className)}>
      {rows.map((item) => {
        const itemTitle = title?.(item) ?? "—"
        return (
          <EntityCard
            key={getRowKey(item)}
            id={getRowKey(item)}
            title={itemTitle}
            subtitle={subtitle?.(item)}
            logo={media?.(item)}
            badgeContent={<>{badges?.(item)}{tags?.(item)}</>}
            showOwner={false}
            metadataContent={
              <div className={cn("grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-2", fieldsClassName)}>
                {fields.map((field) => {
                  const Icon = field.icon
                  return (
                    <div key={field.id} className={cn("min-w-0", field.priority === "secondary" && "opacity-85", field.className)}>
                      {!field.hideLabel ? (
                        <div className="flex items-center gap-1.5 text-xs text-[var(--app-text-secondary)]">
                          {Icon ? <Icon aria-hidden="true" className="size-3.5 shrink-0" /> : null}
                          <span className="truncate">{field.label}</span>
                        </div>
                      ) : null}
                      <div className={cn("mt-0.5 min-w-0 break-words text-xs font-semibold text-[var(--app-heading)]", field.valueClassName)}>
                        {field.render(item)}
                      </div>
                    </div>
                  )
                })}
              </div>
            }
            actionContent={actions?.(item)}
            onClick={onRowClick ? () => onRowClick(item) : undefined}
            className={cn(density === "comfortable" && "sm:[&>div]:p-5", cardClassName)}
            ariaLabel={typeof itemTitle === "string" ? itemTitle : undefined}
          />
        )
      })}
    </div>
  )
}
