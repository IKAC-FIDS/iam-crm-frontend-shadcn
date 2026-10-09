import type { ReactNode } from "react"
import { X } from "lucide-react"

import { uiText } from "@/config/uiText"
import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"

export type QuickViewField = {
  label?: string
  value?: ReactNode
  wide?: boolean
}

export function EntityQuickViewDialog({
  open,
  onOpenChange,
  title,
  subtitle,
  icon,
  fields,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  subtitle?: ReactNode
  icon?: ReactNode
  fields: QuickViewField[]
}) {
  const visibleFields = fields.filter(
    (field) =>
      field.value !== undefined &&
      field.value !== null &&
      field.value !== "",
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        dir="rtl"
        className="max-h-[84vh] w-[min(860px,calc(100vw-24px))] max-w-none gap-0 overflow-hidden rounded-[28px] border-[var(--app-divider)] bg-[var(--app-surface)] p-0 shadow-[var(--app-shadow-elevated)] sm:max-w-none"
      >
        <DialogHeader className="border-b border-[var(--app-divider)] bg-[linear-gradient(155deg,var(--app-primary-soft),var(--app-surface)_68%)] px-5 py-5 sm:px-7">
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              {icon ? (
                <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[var(--app-primary)] text-[var(--app-on-primary)]">
                  {icon}
                </div>
              ) : null}
              <div className="min-w-0">
                <DialogTitle className="truncate text-lg font-bold text-[var(--app-heading)]">
                  {title}
                </DialogTitle>
                {subtitle ? (
                  <div className="mt-1 text-xs text-[var(--app-text-secondary)]">
                    {subtitle}
                  </div>
                ) : null}
              </div>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="shrink-0 rounded-xl"
              aria-label={uiText.companies.form.close}
              onClick={() => onOpenChange(false)}
            >
              <X className="size-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="min-h-0 overflow-y-auto p-5 sm:p-7">
          <div className="grid gap-3 sm:grid-cols-2">
            {visibleFields.map((field, index) => (
              <div
                key={index}
                className={[
                  "rounded-2xl border border-[var(--app-divider)] bg-[var(--app-background)]/45 p-4",
                  field.wide ? "sm:col-span-2" : "",
                ].join(" ")}
              >
                {field.label ? (
                  <p className="text-xs font-bold text-[var(--app-text-secondary)]">
                    {field.label}
                  </p>
                ) : null}
                <div
                  dir="auto"
                  className={field.label ? "mt-2 text-sm text-[var(--app-heading)]" : "text-sm text-[var(--app-heading)]"}
                >
                  {field.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
