import { Sparkles, type LucideIcon } from "lucide-react"
import type { ReactNode } from "react"
import { Dialog, DialogContent } from "@workspace/ui/components/dialog"
import { DialogHeroHeader } from "./DialogHeroHeader"
export function ResponsiveModal({
  open,
  onClose,
  title,
  description,
  children,
  icon = Sparkles,
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
        className={`grid max-h-[92dvh] w-[calc(100%-2rem)] grid-rows-[auto_minmax(0,1fr)] gap-0 overflow-hidden rounded-[var(--app-radius-hero)] p-0 sm:max-w-none ${width}`}
        style={{
          maxWidth: (
            {
              "max-w-2xl": "42rem",
              "max-w-3xl": "48rem",
              "max-w-5xl": "64rem",
            } as Record<string, string>
          )[width],
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
