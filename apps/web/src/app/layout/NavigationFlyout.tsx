import { X } from "lucide-react"
import { useEffect, useRef } from "react"

import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

import type { NavigationFlyoutItem } from "@/app/navigation/navigationConfig"

import { NavigationGroup } from "./NavigationGroup"

interface NavigationFlyoutProps {
  item: NavigationFlyoutItem
  expanded: boolean
  onClose: () => void
  getAnchor: () => HTMLElement | null
}

export function NavigationFlyout({ item, expanded, onClose, getAnchor }: NavigationFlyoutProps) {
  const panelRef = useRef<HTMLElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
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
        "fixed inset-y-3 z-50 hidden w-[min(42rem,calc(100vw-6rem))] flex-col overflow-hidden rounded-[1.5rem] border border-[var(--app-divider)] bg-[var(--app-surface)]/98 shadow-[0_30px_90px_-30px_rgba(15,23,42,.6)] backdrop-blur-2xl md:flex",
        expanded ? "right-[calc(var(--sidebar-width)+0.75rem)]" : "right-[calc(var(--sidebar-width-icon)+0.75rem)]",
      )}
    >
      <header className="relative flex items-center gap-3 overflow-hidden border-b border-[var(--app-divider)] p-4">
        <span className="pointer-events-none absolute inset-y-0 end-0 w-56 bg-[radial-gradient(circle_at_right,var(--app-primary-soft),transparent_72%)]" />
        <span className="relative grid size-11 shrink-0 place-items-center rounded-2xl bg-[var(--app-primary)] text-[var(--app-on-primary)] shadow-[var(--app-shadow-brand)]">
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
      <div className="grid min-h-0 flex-1 auto-rows-max grid-cols-1 gap-5 overflow-y-auto p-4 sm:grid-cols-2">
        {item.sections.map((section) => (
          <NavigationGroup key={section.id} section={section} onNavigate={onClose} />
        ))}
      </div>
    </aside>
  )
}
