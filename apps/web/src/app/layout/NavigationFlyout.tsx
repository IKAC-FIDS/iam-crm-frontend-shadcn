import { X } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { useLocation } from "react-router-dom"

import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

import type { NavigationFlyoutItem } from "@/app/navigation/navigationConfig"
import { isMenuRouteActive } from "@/app/navigation/routeNavigation"

import { NavigationLink } from "./NavigationLink"

interface NavigationFlyoutProps {
  item: NavigationFlyoutItem
  expanded: boolean
  onClose: () => void
  getAnchor: () => HTMLElement | null
}

export function NavigationFlyout({ item, expanded, onClose, getAnchor }: NavigationFlyoutProps) {
  const panelRef = useRef<HTMLElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const location = useLocation()
  const [selectedSectionId, setSelectedSectionId] = useState(() =>
    item.sections.find((section) =>
      section.routes.some((route) => isMenuRouteActive(route.path, location.pathname)),
    )?.id ?? item.sections[0]?.id,
  )
  const selectedSection = item.sections.find((section) => section.id === selectedSectionId) ?? item.sections[0]
  const Icon = item.icon

  useEffect(() => {
    closeButtonRef.current?.focus()

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault()
        onClose()
        getAnchor()?.focus()
      }
    }
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node
      if (!panelRef.current?.contains(target) && !getAnchor()?.contains(target)) onClose()
    }

    document.addEventListener("keydown", onKeyDown)
    document.addEventListener("pointerdown", onPointerDown)
    return () => {
      document.removeEventListener("keydown", onKeyDown)
      document.removeEventListener("pointerdown", onPointerDown)
    }
  }, [getAnchor, onClose])

  return (
    <aside
      ref={panelRef}
      role="dialog"
      aria-modal="false"
      aria-label={item.label}
      className={cn(
        "fixed top-4 z-50 hidden max-h-[calc(100svh-2rem)] flex-col overflow-hidden rounded-[1.35rem] border border-[var(--app-divider)] bg-[var(--app-surface)]/98 shadow-[0_28px_80px_-30px_rgba(15,23,42,.65)] backdrop-blur-2xl md:flex",
      )}
      style={{
        right: expanded
          ? "calc(var(--sidebar-width) + 0.75rem)"
          : "calc(var(--sidebar-width-icon) + 0.75rem)",
        width: expanded
          ? "min(46rem, calc(100vw - var(--sidebar-width) - 1.5rem))"
          : "min(46rem, calc(100vw - var(--sidebar-width-icon) - 1.5rem))",
      }}
    >
      <header className="relative flex items-center gap-3 overflow-hidden border-b border-[var(--app-divider)] px-4 py-3.5">
        <span className="pointer-events-none absolute inset-y-0 end-0 w-56 bg-[radial-gradient(circle_at_right,var(--app-primary-soft),transparent_72%)]" />
        <span className="relative grid size-10 shrink-0 place-items-center rounded-xl bg-[var(--app-primary)] text-[var(--app-on-primary)] shadow-[var(--app-shadow-brand)]">
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <div className="relative min-w-0 flex-1">
          <h2 className="text-base font-black text-[var(--app-heading)]">{item.label}</h2>
          <p className="mt-0.5 text-xs leading-5 text-[var(--app-text-secondary)]">{item.description}</p>
        </div>
        <Button ref={closeButtonRef} type="button" variant="ghost" size="icon" onClick={onClose} aria-label={`بستن ${item.label}`} className="relative rounded-xl">
          <X className="size-4" />
        </Button>
      </header>
      <div className="grid min-h-0 flex-1 grid-cols-[11rem_minmax(0,1fr)] overflow-hidden max-sm:grid-cols-1">
        <nav aria-label={`دسته‌بندی‌های ${item.label}`} className="overflow-y-auto border-e border-[var(--app-divider)] bg-[var(--app-background)]/45 p-2.5 max-sm:border-b max-sm:border-e-0">
          <div className="grid gap-1 max-sm:grid-cols-2">
            {item.sections.map((section) => {
              const selected = section.id === selectedSection?.id
              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => setSelectedSectionId(section.id)}
                  className={cn(
                    "flex min-h-11 items-center gap-2 rounded-xl px-2.5 text-start text-xs font-bold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[var(--app-primary)]",
                    selected
                      ? "bg-[var(--app-primary)] text-[var(--app-on-primary)] shadow-sm"
                      : "text-[var(--app-text-secondary)] hover:bg-[var(--app-surface)] hover:text-[var(--app-heading)]",
                  )}
                  aria-pressed={selected}
                >
                  <span className={cn("size-1.5 shrink-0 rounded-full", selected ? "bg-current" : "bg-[var(--app-primary)]")} />
                  <span className="min-w-0 flex-1 truncate">{section.label}</span>
                  <span className={cn("rounded-md px-1.5 py-0.5 tabular-nums", selected ? "bg-white/15" : "bg-[var(--app-surface)]")}>
                    {section.routes.length.toLocaleString("fa-IR")}
                  </span>
                </button>
              )
            })}
          </div>
        </nav>
        {selectedSection ? (
          <section aria-labelledby={`flyout-section-${selectedSection.id}`} className="min-h-0 overflow-y-auto p-3.5">
            <div className="mb-3 flex items-center gap-3">
              <div className="min-w-0">
                <h3 id={`flyout-section-${selectedSection.id}`} className="truncate text-sm font-black text-[var(--app-heading)]">{selectedSection.label}</h3>
                <p className="mt-0.5 text-xs text-[var(--app-text-secondary)]">بخش موردنظر را برای ادامه انتخاب کنید</p>
              </div>
              <span className="h-px flex-1 bg-[var(--app-divider)]" />
            </div>
            <div className="grid gap-1.5 lg:grid-cols-2">
              {selectedSection.routes.map((route) => (
                <NavigationLink
                  key={route.id}
                  route={route}
                  active={isMenuRouteActive(route.path, location.pathname)}
                  onNavigate={onClose}
                  compact
                />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </aside>
  )
}
