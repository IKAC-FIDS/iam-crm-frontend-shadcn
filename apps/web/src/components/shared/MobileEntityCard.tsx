import type { ReactNode } from "react"
import { cn } from "@workspace/ui/lib/utils"

export type MobileEntityField<Row> = {
  id: string
  label: ReactNode
  render: (row: Row) => ReactNode
  hidden?: (row: Row) => boolean
}

export type MobileEntityConfig<Row> = {
  title: (row: Row) => ReactNode
  subtitle?: (row: Row) => ReactNode
  avatar?: (row: Row) => ReactNode
  status?: (row: Row) => ReactNode
  fields: readonly MobileEntityField<Row>[]
}

export function MobileEntityCard<Row>({
  row,
  config,
  actions,
  onClick,
}: {
  row: Row
  config: MobileEntityConfig<Row>
  actions?: ReactNode
  onClick?: () => void
}) {
  const fields = config.fields.filter((field) => !field.hidden?.(row))
  return (
    <article
      className={cn(
        "min-w-0 rounded-[var(--app-radius-card)] border border-[var(--app-divider)] bg-[var(--app-surface)] p-4 shadow-[var(--app-shadow-card)] transition-colors",
        onClick && "cursor-pointer hover:bg-[var(--app-background)]/55 active:bg-[var(--app-background)]"
      )}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.target === event.currentTarget && onClick && (event.key === "Enter" || event.key === " ")) {
          event.preventDefault()
          onClick()
        }
      }}
    >
      <div className="flex min-w-0 items-start gap-3">
        {config.avatar ? (
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[var(--app-primary-soft)] text-[var(--app-primary)]">
            {config.avatar(row)}
          </div>
        ) : null}
        <div className="min-w-0 flex-1">
          <h3 className="break-words text-sm font-black leading-6 text-[var(--app-heading)]">{config.title(row)}</h3>
          {config.subtitle ? <div className="mt-0.5 break-words text-xs leading-5 text-muted-foreground">{config.subtitle(row)}</div> : null}
          {config.status ? <div className="mt-2">{config.status(row)}</div> : null}
        </div>
        {actions ? <div className="shrink-0">{actions}</div> : null}
      </div>
      {fields.length ? (
        <dl className="mt-4 grid gap-2 border-t border-[var(--app-divider)] pt-3">
          {fields.map((field) => (
            <div key={field.id} className="grid min-w-0 grid-cols-[minmax(5rem,auto)_minmax(0,1fr)] items-start gap-3 text-xs leading-5">
              <dt className="font-bold text-muted-foreground">{field.label}</dt>
              <dd className="min-w-0 break-words text-end font-medium text-[var(--app-heading)]">{field.render(row)}</dd>
            </div>
          ))}
        </dl>
      ) : null}
    </article>
  )
}
