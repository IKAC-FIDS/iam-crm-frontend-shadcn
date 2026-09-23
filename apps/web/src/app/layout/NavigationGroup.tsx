import { useLocation } from "react-router-dom"

import type { NavigationSection } from "@/app/navigation/navigationConfig"
import { isMenuRouteActive } from "@/app/navigation/routeNavigation"

import { NavigationLink } from "./NavigationLink"

interface NavigationGroupProps {
  section: NavigationSection
  onNavigate?: () => void
  compact?: boolean
}

export function NavigationGroup({ section, onNavigate, compact }: NavigationGroupProps) {
  const location = useLocation()

  return (
    <section aria-labelledby={`navigation-section-${section.id}`} className="min-w-0">
      <div className="mb-2 flex items-center gap-3">
        <h3 id={`navigation-section-${section.id}`} className="shrink-0 text-xs font-black text-[var(--app-text-secondary)]">
          {section.label}
        </h3>
        <span className="h-px flex-1 bg-[var(--app-divider)]" />
        <span className="text-xs tabular-nums text-[var(--app-text-secondary)]">
          {section.routes.length.toLocaleString("fa-IR")}
        </span>
      </div>
      <div className="grid gap-1.5 sm:grid-cols-2">
        {section.routes.map((route) => (
          <NavigationLink
            key={route.id}
            route={route}
            active={isMenuRouteActive(route.path, location.pathname)}
            onNavigate={onNavigate}
            compact={compact}
          />
        ))}
      </div>
    </section>
  )
}
