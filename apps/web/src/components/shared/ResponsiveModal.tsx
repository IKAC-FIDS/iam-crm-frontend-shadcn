import { Sparkles, type LucideIcon } from "lucide-react"
import type { ReactNode } from "react"
import { Dialog, DialogContent } from "@workspace/ui/components/dialog"
import { DialogHeroHeader } from "./DialogHeroHeader"

type ResponsiveModalSize = "sm" | "md" | "lg" | "xl"

const sizeClasses: Record<ResponsiveModalSize, string> = {
  sm: "max-w-md",
  md: "max-w-2xl",
  lg: "max-w-3xl",
  xl: "max-w-5xl",
}

const sizeWidths: Record<ResponsiveModalSize, string> = {
  sm: "28rem",
  md: "42rem",
  lg: "48rem",
  xl: "64rem",
}

export function ResponsiveModal({
  open,
  onClose,
  title,
  description,
  children,
  icon = Sparkles,
  size = "md",
  width,
}: {
  open: boolean
  onClose: () => void
  title: ReactNode
  description?: ReactNode
  children: ReactNode
  icon?: LucideIcon
  size?: ResponsiveModalSize
  /** @deprecated Prefer the canonical size prop. Kept for specialized legacy dialogs. */
  width?: string
}) {
  const resolvedClassName = width ?? sizeClasses[size]
  const legacyWidth = width
    ? (
        {
          "max-w-md": "28rem",
          "max-w-2xl": "42rem",
          "max-w-3xl": "48rem",
          "max-w-5xl": "64rem",
        } as Record<string, string>
      )[width]
    : undefined

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose()
      }}
    >
      <DialogContent
        showCloseButton={false}
        dir="rtl"
        data-size={size}
        className={`grid max-h-[92dvh] w-[calc(100%-2rem)] grid-rows-[auto_minmax(0,1fr)] gap-0 overflow-hidden rounded-[var(--app-radius-hero)] p-0 sm:max-w-none ${resolvedClassName}`}
        style={{
          maxWidth: legacyWidth ?? sizeWidths[size],
        }}
      >
        <DialogHeroHeader
          title={title}
          description={description}
          icon={icon}
          onClose={onClose}
        />
        <div className="ui-form-body">{children}</div>
      </DialogContent>
    </Dialog>
  )
}
