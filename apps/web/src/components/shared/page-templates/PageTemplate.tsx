import type { ReactNode } from "react"
import { cn } from "@workspace/ui/lib/utils"
import { PageHero, type PageHeroProps } from "../PageHero"

export type PageTemplateProps = {
  hero: PageHeroProps
  children: ReactNode
  summary?: ReactNode
  toolbar?: ReactNode
  tabs?: ReactNode
  footer?: ReactNode
  className?: string
  contentClassName?: string
  scroll?: "document" | "contained"
}

export function PageTemplate({
  hero, children, summary, toolbar, tabs, footer,
  className, contentClassName, scroll = "document",
}: PageTemplateProps) {
  return (
    <div dir="rtl" className={cn("grid min-w-0 gap-4", scroll === "contained" && "min-h-0 lg:h-full", className)}>
      <PageHero {...hero} showRefresh={hero.showRefresh ?? Boolean(hero.onRefresh)} />
      {tabs && <div className="min-w-0">{tabs}</div>}
      {summary && <div className="min-w-0">{summary}</div>}
      {toolbar && <div className="min-w-0">{toolbar}</div>}
      <div className={cn("min-w-0", scroll === "contained" && "min-h-0 lg:overflow-y-auto", contentClassName)}>{children}</div>
      {footer && <div className="min-w-0">{footer}</div>}
    </div>
  )
}
