import { AlertTriangle } from "lucide-react"

import { Button } from "@workspace/ui/components/button"

export function ErrorState({
  title,
  description,
  retryLabel,
  onRetry,
}: {
  title: string
  description: string
  retryLabel?: string
  onRetry?: () => void
}) {
  return (
    <div
      role="alert"
      className="rounded-[var(--app-radius-card)] border border-[var(--destructive)]/20 bg-[var(--destructive)]/5 p-6"
    >
      <div className="flex items-start gap-3">
        <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-[var(--destructive-soft)] text-[var(--destructive)]">
          <AlertTriangle className="size-5" />
        </div>

        <div className="min-w-0">
          <h3 className="font-bold text-[var(--destructive)]">{title}</h3>
          <p className="mt-1 text-sm leading-7 text-[var(--app-text-secondary)]">
            {description}
          </p>

          {onRetry && retryLabel ? (
            <Button
              type="button"
              variant="outline"
              className="mt-4 rounded-xl"
              onClick={onRetry}
            >
              {retryLabel}
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  )
}
