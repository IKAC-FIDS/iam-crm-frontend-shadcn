import type { ReactNode } from "react"
import { Eye } from "lucide-react"
import { Button } from "@workspace/ui/components/button"

export function EntityRowActions({
  label,
  onView,
  children,
}: {
  label: string
  onView: () => void
  children?: ReactNode
}) {
  return (
    <div className="flex min-w-20 items-center justify-end gap-1">
      {children}
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="shrink-0 rounded-xl text-[var(--app-primary)]"
        aria-label={label}
        title={label}
        onClick={(event) => {
          event.stopPropagation()
          onView()
        }}
      >
        <Eye aria-hidden="true" className="size-4" />
      </Button>
    </div>
  )
}
