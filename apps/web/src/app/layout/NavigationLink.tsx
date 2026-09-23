import { ArrowUpLeft } from "lucide-react"
import { Link } from "react-router-dom"

import { cn } from "@workspace/ui/lib/utils"

import type { NavigationDestination } from "@/app/navigation/navigationConfig"

interface NavigationLinkProps {
  route: NavigationDestination
  active: boolean
  onNavigate?: () => void
  compact?: boolean
}

export function NavigationLink({ route, active, onNavigate, compact = false }: NavigationLinkProps) {
  const Icon = route.icon

  return (
    <Link
      to={route.path}
      onClick={(event) => {
        if (route.disabled) {
          event.preventDefault()
          return
        }
        onNavigate?.()
      }}
      aria-current={active ? "page" : undefined}
      aria-disabled={route.disabled || undefined}
      className={cn(
        "group relative flex min-w-0 items-center gap-3 rounded-xl border border-transparent outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[var(--app-primary)]",
        compact ? "min-h-11 px-2.5 py-2" : "min-h-14 px-3 py-2.5",
        active
          ? "border-[var(--app-primary)]/20 bg-[var(--app-primary-soft)] text-[var(--app-on-primary-container)]"
          : "text-[var(--app-heading)] hover:bg-[var(--app-background)]",
        route.disabled && "pointer-events-none opacity-50",
      )}
    >
      <span className={cn(
        "grid shrink-0 place-items-center rounded-xl",
        compact ? "size-8" : "size-10",
        active
          ? "bg-[var(--app-primary)] text-[var(--app-on-primary)]"
          : "bg-[var(--app-primary-soft)] text-[var(--app-primary)]",
      )}>
        <Icon className="size-4" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-bold">{route.label}</span>
        {!compact ? (
          <span className="mt-0.5 block truncate text-xs text-[var(--app-text-secondary)]">
            {route.description}
          </span>
        ) : null}
      </span>
      {route.badge !== undefined ? (
        <span className="rounded-full bg-[var(--app-primary-soft)] px-2 py-0.5 text-xs font-bold text-[var(--app-primary)]">
          {route.badge}
        </span>
      ) : null}
      <ArrowUpLeft className="size-3.5 shrink-0 text-[var(--app-icon-muted)] transition-transform group-hover:-translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
    </Link>
  )
}
