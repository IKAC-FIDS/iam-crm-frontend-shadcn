import type { ReactNode } from "react"
import { cn } from "@workspace/ui/lib/utils"

/** Layout only: domain views, permissions and query state belong to the feature. */
export function EntityListPage({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div dir="rtl" className={cn("ui-list-page", className)}>
      {children}
    </div>
  )
}
