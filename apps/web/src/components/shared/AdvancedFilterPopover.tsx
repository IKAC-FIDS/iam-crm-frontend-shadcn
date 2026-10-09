import type { ReactNode } from "react"
import { Filter, SlidersHorizontal, X } from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import { Popover, PopoverContent, PopoverTrigger } from "@workspace/ui/components/popover"
import { cn } from "@workspace/ui/lib/utils"

export function AdvancedFilterPopover({
  children,
  open,
  onOpenChange,
  activeCount = 0,
  label = "فیلترها",
  title = "فیلترهای پیشرفته",
  description = "نتایج را با ترکیب چند معیار دقیق‌تر کنید.",
  onClear,
  contentClassName,
}: {
  children: ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  activeCount?: number
  label?: string
  title?: string
  description?: string
  onClear?: () => void
  contentClassName?: string
}) {
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger
        render={<Button type="button" variant="outline" className="h-11 w-full justify-between rounded-xl border-[var(--app-divider)] bg-[var(--app-background)]/55 px-3" />}
      >
        <span className="inline-flex min-w-0 items-center gap-2">
          <SlidersHorizontal className="size-4 shrink-0 text-[var(--app-primary)]" />
          <span className="truncate">{label}</span>
        </span>
        {activeCount ? (
          <span className="grid min-w-6 place-items-center rounded-full bg-[var(--app-primary)] px-1.5 py-0.5 text-xs font-bold text-[var(--app-on-primary)]">
            {activeCount.toLocaleString("fa-IR")}
          </span>
        ) : null}
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={8}
        dir="rtl"
        className={cn("grid max-h-[min(76vh,680px)] w-[min(780px,calc(100vw-24px))] grid-rows-[auto_minmax(0,1fr)] overflow-hidden rounded-3xl border-[var(--app-divider)] bg-[var(--app-surface)] p-0 shadow-2xl", contentClassName)}
      >
        <div className="flex items-start justify-between gap-3 border-b border-[var(--app-divider)] bg-[linear-gradient(145deg,var(--app-primary-soft),var(--app-surface)_72%)] px-4 py-4 sm:px-5">
          <div className="flex min-w-0 items-start gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-[var(--app-primary)] text-[var(--app-on-primary)] shadow-sm">
              <Filter className="size-4" />
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-sm font-bold text-[var(--app-heading)]">{title}</h2>
                {activeCount ? <span className="rounded-full bg-[var(--app-primary)]/10 px-2 py-0.5 text-xs font-bold text-[var(--app-primary)]">{activeCount.toLocaleString("fa-IR")} فیلتر فعال</span> : null}
              </div>
              <p className="mt-1 text-xs leading-5 text-[var(--app-text-secondary)]">{description}</p>
            </div>
          </div>

          {activeCount && onClear ? (
            <Button type="button" variant="ghost" size="sm" onClick={onClear} className="shrink-0 rounded-xl text-xs text-[var(--app-primary-alt)]">
              <X className="size-4" />
              <span className="hidden sm:inline">پاک‌کردن</span>
            </Button>
          ) : null}
        </div>

        <div className="min-h-0 overflow-y-auto overscroll-contain p-4 sm:p-5">{children}</div>
      </PopoverContent>
    </Popover>
  )
}
