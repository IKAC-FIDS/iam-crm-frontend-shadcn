import { ChevronLeft } from "lucide-react"
import { Link, useLocation } from "react-router-dom"

import { getRoutePresentation } from "@/app/navigation/routeNavigation"

export function NavigationBreadcrumbs() {
  const location = useLocation()
  const { breadcrumbs } = getRoutePresentation(location.pathname)

  return (
    <nav aria-label="مسیر صفحه" className="hidden min-w-0 items-center gap-1 text-xs text-[var(--app-text-secondary)] lg:flex">
      {breadcrumbs.map((crumb, index) => (
        <span key={`${crumb.label}-${index}`} className="flex min-w-0 items-center gap-1">
          {index > 0 ? <ChevronLeft className="size-3 shrink-0" aria-hidden="true" /> : null}
          {crumb.to ? (
            <Link to={crumb.to} className="truncate rounded-sm outline-none hover:text-[var(--app-primary)] focus-visible:ring-2 focus-visible:ring-[var(--app-primary)]">
              {crumb.label}
            </Link>
          ) : (
            <span className="truncate" aria-current={index === breadcrumbs.length - 1 ? "page" : undefined}>{crumb.label}</span>
          )}
        </span>
      ))}
    </nav>
  )
}
