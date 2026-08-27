import { Sparkles, X, type LucideIcon } from "lucide-react"
import type { ReactNode } from "react"

import { Button } from "@workspace/ui/components/button"

export function ResponsiveModal({
  open,
  onClose,
  title,
  description,
  children,
  icon: Icon = Sparkles,
  width = "max-w-2xl",
}: {
  open: boolean
  onClose: () => void
  title: ReactNode
  description?: ReactNode
  children: ReactNode
  icon?: LucideIcon
  width?: string
}) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[100] grid place-items-end bg-black/25 p-0 backdrop-blur-[2px] sm:place-items-center sm:p-4"
      dir="rtl"
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
        aria-label="بستن"
      />

      <section
        className={`relative z-10 grid max-h-[calc(100dvh-1rem)] w-full ${width} grid-rows-[auto_minmax(0,1fr)] overflow-hidden rounded-t-[26px] border border-[var(--app-divider)] bg-[var(--app-surface)] shadow-2xl sm:max-h-[92vh] sm:rounded-[28px]`}
      >
        <header className="relative overflow-hidden border-b border-[var(--app-divider)] bg-[linear-gradient(155deg,var(--app-primary-soft),var(--app-surface)_70%)] px-5 py-5 sm:px-7">
          <div className="pointer-events-none absolute -end-10 -top-14 size-36 rounded-full bg-[var(--app-primary)]/10 blur-3xl" />
          <div className="relative flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-start gap-3">
              <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[var(--app-primary)] text-[var(--app-on-primary)] shadow-sm">
                <Icon className="size-5" />
              </span>
              <div className="min-w-0 pt-0.5">
                <h2 className="text-lg leading-7 font-bold text-[var(--app-heading)]">
                  {title}
                </h2>
                {description ? (
                  <div className="mt-1 text-xs leading-6 text-[var(--app-text-secondary)]">
                    {description}
                  </div>
                ) : null}
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="shrink-0 rounded-xl bg-[var(--app-surface)]/55 hover:bg-[var(--app-surface)]"
              aria-label="بستن"
              onClick={onClose}
            >
              <X className="size-4" />
            </Button>
          </div>
        </header>

        <div className="min-h-0 overflow-y-auto overscroll-contain p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:p-5">
          {children}
        </div>
      </section>
    </div>
  )
}
