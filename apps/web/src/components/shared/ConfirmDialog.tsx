import type { ReactNode } from "react"
import { AlertTriangle } from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"

import { uiText } from "@/config/uiText"

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = uiText.common.confirm,
  cancelLabel = uiText.common.cancel,
  tone = "danger",
  isPending = false,
  onConfirm,
  icon,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  tone?: "danger" | "primary"
  isPending?: boolean
  onConfirm: () => void | Promise<void>
  icon?: ReactNode
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-w-md gap-0 rounded-[var(--app-radius-feature)] border-[var(--app-divider)] bg-[var(--app-surface)] p-0 shadow-[var(--app-shadow-elevated)]"
        dir="rtl"
      >
        <DialogHeader className="p-5 pb-4">
          <div
            className={[
              "mb-3 grid size-11 place-items-center rounded-2xl",
              tone === "danger"
                ? "bg-[var(--destructive-soft)] text-[var(--destructive)]"
                : "bg-[var(--app-primary-soft)] text-[var(--app-primary)]",
            ].join(" ")}
          >
            {icon ?? <AlertTriangle className="size-5" />}
          </div>

          <DialogTitle className="text-base font-bold text-[var(--app-heading)]">
            {title}
          </DialogTitle>

          {description ? (
            <DialogDescription className="leading-7 text-[var(--app-text-secondary)]">
              {description}
            </DialogDescription>
          ) : null}
        </DialogHeader>

        <DialogFooter className="m-0 rounded-b-[var(--app-radius-feature)] border-t border-[var(--app-divider)] bg-[var(--app-background)]/55 p-4 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            className="rounded-xl"
            disabled={isPending}
            onClick={() => onOpenChange(false)}
          >
            {cancelLabel}
          </Button>

          <Button
            type="button"
            className={[
              "rounded-xl",
              tone === "danger"
                ? "bg-[var(--destructive)] text-white hover:bg-[var(--destructive)]/90"
                : "bg-[var(--app-primary)] text-[var(--app-on-primary)] hover:bg-[var(--app-primary-hover)]",
            ].join(" ")}
            disabled={isPending}
            onClick={() => void onConfirm()}
          >
            {isPending ? uiText.common.processing : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
