import { Construction, Sparkles } from "lucide-react"
import { useLocation } from "react-router-dom"

import { Card, CardContent } from "@workspace/ui/components/card"

import { getRoutePresentation } from "@/app/navigation/routeNavigation"
import { uiText } from "@/config/uiText"

export function FeaturePlaceholderPage() {
  const location = useLocation()
  const { title } = getRoutePresentation(location.pathname)

  return (
    <Card className="relative overflow-hidden rounded-[var(--app-radius-feature)] border-[var(--app-divider)] bg-[var(--app-surface)] shadow-[var(--app-shadow-elevated)]">
      <div className="pointer-events-none absolute -end-24 -top-24 size-72 rounded-full bg-[var(--app-primary-soft)]/60 blur-3xl" />

      <CardContent className="relative flex min-h-[360px] flex-col items-center justify-center p-8 text-center">
        <div className="mb-5 grid size-14 place-items-center rounded-2xl bg-[var(--app-primary-soft)] text-[var(--app-primary)]">
          <Construction className="size-6" />
        </div>

        <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-[var(--app-background)] px-3 py-1 text-[11px] font-medium text-[var(--app-text-secondary)]">
          <Sparkles className="size-3" />
          {uiText.placeholders.badge}
        </div>

        <h2 className="text-xl font-bold text-[var(--app-heading)]">{title}</h2>

        <p className="mt-3 max-w-lg text-sm leading-7 text-[var(--app-text-secondary)]">
          {uiText.placeholders.description}
        </p>
      </CardContent>
    </Card>
  )
}
