import type { LucideIcon } from "lucide-react"
import type { CSSProperties, KeyboardEvent, ReactNode } from "react"

import { Skeleton } from "@workspace/ui/components/skeleton"
import { cn } from "@workspace/ui/lib/utils"

import { EntityRowActions, type EntityAction } from "./EntityRowActions"
import { StatusBadge, type StatusTone } from "./StatusBadge"
import { SurfaceCard } from "./SurfaceCard"

export type EntityBadgeDescriptor = {
  id: string
  label: ReactNode
  tone?: StatusTone
  icon?: LucideIcon
  dot?: boolean
  size?: "xs" | "sm" | "md"
  tooltip?: ReactNode
}

export type EntityOwnerDescriptor = {
  name: string
  role?: ReactNode
  avatar?: ReactNode
  fallback?: ReactNode
}

export type EntityMetadataDescriptor = {
  id: string
  label: ReactNode
  value: ReactNode
  icon?: LucideIcon
  className?: string
}

export type EntityCardProps = {
  id: string
  title: ReactNode
  subtitle?: ReactNode
  logo?: ReactNode
  initials?: ReactNode
  fallback?: ReactNode
  badges?: readonly EntityBadgeDescriptor[]
  owner?: EntityOwnerDescriptor | null
  ownerFallback?: ReactNode
  metadata?: readonly EntityMetadataDescriptor[]
  actions?: readonly EntityAction[]
  actionLabel?: string
  onClick?: () => void
  loading?: boolean
  disabled?: boolean
  archived?: boolean
  selected?: boolean
  accentColor?: string
  className?: string
  ariaLabel?: string
}

export function EntityCard({
  id,
  title,
  subtitle,
  logo,
  initials,
  fallback,
  badges = [],
  owner,
  ownerFallback,
  metadata = [],
  actions = [],
  actionLabel,
  onClick,
  loading = false,
  disabled = false,
  archived = false,
  selected = false,
  accentColor,
  className,
  ariaLabel,
}: EntityCardProps) {
  const interactive = Boolean(onClick) && !disabled && !loading

  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (!interactive || (event.key !== "Enter" && event.key !== " ")) return
    event.preventDefault()
    onClick?.()
  }

  if (loading) {
    return (
      <SurfaceCard aria-busy="true" aria-label={ariaLabel || "در حال بارگذاری"} className={cn("p-4", className)}>
        <div className="flex items-center gap-4" dir="rtl">
          <Skeleton className="size-14 shrink-0 rounded-2xl" />
          <div className="grid min-w-0 flex-1 gap-2">
            <Skeleton className="h-4 w-48 max-w-full" />
            <Skeleton className="h-3 w-32 max-w-full" />
          </div>
          <Skeleton className="hidden h-9 w-28 sm:block" />
        </div>
      </SurfaceCard>
    )
  }

  return (
    <SurfaceCard
      data-entity-id={id}
      data-selected={selected || undefined}
      data-archived={archived || undefined}
      role={interactive ? "button" : "article"}
      tabIndex={interactive ? 0 : undefined}
      aria-label={ariaLabel}
      aria-disabled={disabled || undefined}
      aria-pressed={interactive ? selected : undefined}
      onClick={interactive ? onClick : undefined}
      onKeyDown={handleKeyDown}
      style={
        accentColor
          ? ({ "--entity-accent": accentColor } as CSSProperties)
          : undefined
      }
      className={cn(
        "group relative overflow-hidden transition-[border-color,box-shadow,background-color,opacity] duration-200",
        interactive && "cursor-pointer hover:border-[var(--app-primary)]/35 hover:shadow-[var(--app-shadow-card)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--app-background)]",
        selected && "border-[var(--app-primary)] bg-[var(--app-primary-soft)]/25 ring-1 ring-[var(--app-primary)]/20",
        archived && "bg-[var(--app-background)]/55",
        disabled && "cursor-not-allowed opacity-60",
        className,
      )}
    >
      {accentColor ? (
        <div
          aria-hidden="true"
          data-entity-accent="true"
          className="pointer-events-none absolute inset-y-0 left-0 w-36 bg-[linear-gradient(to_right,color-mix(in_srgb,var(--entity-accent)_24%,transparent),color-mix(in_srgb,var(--entity-accent)_8%,transparent)_52%,transparent)] sm:w-52"
        >
          <span className="absolute inset-y-3 left-0 w-1 rounded-e-full bg-[var(--entity-accent)] shadow-[0_0_18px_color-mix(in_srgb,var(--entity-accent)_55%,transparent)]" />
          <span className="absolute bottom-2 left-5 size-16 rounded-full bg-[var(--entity-accent)]/10 blur-2xl" />
        </div>
      ) : null}

      <div className="relative z-[1] grid min-w-0 gap-4 p-3.5 sm:grid-cols-[minmax(14rem,1.35fr)_minmax(9rem,.7fr)_minmax(10rem,.8fr)_minmax(8rem,.65fr)_auto] sm:items-center sm:p-4" dir="rtl">
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid size-14 shrink-0 place-items-center overflow-hidden rounded-2xl bg-[var(--app-primary-soft)] text-lg font-black text-[var(--app-primary)] ring-1 ring-[var(--app-primary)]/15">
            {logo || initials || fallback || (typeof title === "string" ? title.trim().slice(0, 1) : null)}
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-extrabold leading-6 text-[var(--app-heading)]" title={typeof title === "string" ? title : undefined}>
              {title}
            </div>
            {subtitle ? (
              <div className="mt-0.5 truncate text-xs leading-5 text-[var(--app-text-secondary)]" title={typeof subtitle === "string" ? subtitle : undefined}>
                {subtitle}
              </div>
            ) : null}
          </div>
        </div>

        <div className="flex min-w-0 flex-wrap items-center gap-1.5 sm:border-s sm:border-[var(--app-divider)] sm:ps-4">
          {badges.map((badge) => (
            <StatusBadge key={badge.id} tone={badge.tone} icon={badge.icon} dot={badge.dot} size={badge.size} tooltip={badge.tooltip}>
              {badge.label}
            </StatusBadge>
          ))}
        </div>

        <div className="min-w-0 sm:border-s sm:border-[var(--app-divider)] sm:ps-4">
          {owner ? (
            <div className="flex min-w-0 items-center gap-2.5">
              <div className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-full bg-[var(--app-primary-soft)] text-xs font-bold text-[var(--app-primary)]">
                {owner.avatar || owner.fallback || owner.name.trim().slice(0, 1)}
              </div>
              <div className="min-w-0">
                <div className="truncate text-xs font-bold text-[var(--app-heading)]">{owner.name}</div>
                {owner.role ? <div className="mt-0.5 truncate text-xs text-[var(--app-text-secondary)]">{owner.role}</div> : null}
              </div>
            </div>
          ) : (
            <div className="text-xs text-[var(--app-text-secondary)]">{ownerFallback}</div>
          )}
        </div>

        <div className="grid min-w-0 gap-2 sm:border-s sm:border-[var(--app-divider)] sm:ps-4">
          {metadata.map((item) => {
            const Icon = item.icon
            return (
              <div key={item.id} className={cn("min-w-0", item.className)}>
                <div className="flex items-center gap-1.5 text-xs text-[var(--app-text-secondary)]">
                  {Icon ? <Icon aria-hidden="true" className="size-3.5 shrink-0" /> : null}
                  <span className="truncate">{item.label}</span>
                </div>
                <div className="mt-0.5 truncate text-xs font-semibold text-[var(--app-heading)]">{item.value}</div>
              </div>
            )
          })}
        </div>

        {actions.length ? (
          <div className="border-t border-[var(--app-divider)] pt-3 sm:border-s sm:border-t-0 sm:ps-3 sm:pt-0" onClick={(event) => event.stopPropagation()} onKeyDown={(event) => event.stopPropagation()}>
            <EntityRowActions label={actionLabel} actions={actions} />
          </div>
        ) : null}
      </div>
    </SurfaceCard>
  )
}
