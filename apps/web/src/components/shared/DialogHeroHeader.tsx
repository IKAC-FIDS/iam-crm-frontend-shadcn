import { Sparkles, X, type LucideIcon } from "lucide-react"
import type { ReactNode } from "react"

import { Button } from "@workspace/ui/components/button"
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"

export function DialogHeroHeader({
  title,
  description,
  icon: Icon = Sparkles,
  onClose,
  closeLabel = "بستن",
  actions,
  className = "",
}: {
  title: ReactNode
  description?: ReactNode
  icon?: LucideIcon
  onClose?: () => void
  closeLabel?: string
  actions?: ReactNode
  className?: string
}) {
  return (
    <DialogHeader
      className={`relative overflow-hidden border-b border-[var(--app-divider)] bg-[linear-gradient(155deg,var(--app-primary-soft),var(--app-surface)_70%)] px-5 py-5 text-start sm:px-7 ${className}`}
    >
      <div className="pointer-events-none absolute -end-10 -top-14 size-36 rounded-full bg-[var(--app-primary)]/10 blur-3xl" />
      <div className="relative flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[var(--app-primary)] text-[var(--app-on-primary)] shadow-sm">
            <Icon className="size-5" />
          </span>
          <div className="min-w-0 pt-0.5">
            <DialogTitle className="text-lg leading-7 font-bold text-[var(--app-heading)]">
              {title}
            </DialogTitle>
            {description ? (
              <DialogDescription className="mt-1 max-w-2xl text-xs leading-6 text-[var(--app-text-secondary)]">
                {description}
              </DialogDescription>
            ) : null}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {actions}
          {onClose ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="rounded-xl bg-[var(--app-surface)]/55 hover:bg-[var(--app-surface)]"
              aria-label={closeLabel}
              onClick={onClose}
            >
              <X className="size-4" />
            </Button>
          ) : null}
        </div>
      </div>
    </DialogHeader>
  )
}
