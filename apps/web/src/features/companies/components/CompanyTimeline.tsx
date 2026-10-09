import { Activity, Clock3 } from "lucide-react"

import { EmptyState } from "@/components/shared/EmptyState"
import { uiText } from "@/config/uiText"

import type { CompanyActivity } from "../types/company.types"
import { formatCompanyDateTime } from "../utils/companyFormatters"

export function CompanyTimeline({ activities }: { activities: CompanyActivity[] }) {
  const text = uiText.companies.detail.timeline

  if (!activities.length) {
    return (
      <EmptyState
        icon={Activity}
        title={text.emptyTitle}
        description={text.emptyDescription}
      />
    )
  }

  return (
    <div className="relative">
      <div className="absolute bottom-3 start-[17px] top-3 w-px bg-[var(--app-divider)]" />
      <div className="grid gap-4">
        {activities.slice(0, 8).map((item) => (
          <div key={item.id} className="relative grid grid-cols-[36px_1fr] gap-3">
            <div className="z-10 grid size-9 place-items-center rounded-xl bg-[var(--app-primary-soft)] text-[var(--app-primary)] ring-4 ring-[var(--app-surface)]">
              <Activity className="size-4" />
            </div>
            <div className="min-w-0 rounded-2xl border border-[var(--app-divider)] bg-[var(--app-background)]/45 px-4 py-3">
              <p className="text-xs font-bold text-[var(--app-heading)]">
                {item.title || item.type || text.fallbackTitle}
              </p>
              {item.description ? (
                <p className="mt-1 line-clamp-2 text-xs leading-6 text-[var(--app-text-secondary)]">
                  {item.description}
                </p>
              ) : null}
              <p className="mt-2 inline-flex items-center gap-1 text-xs text-[var(--app-text-secondary)]">
                <Clock3 className="size-3" />
                {formatCompanyDateTime(
                  item.occurredAt || item.activityDate || item.createdAt,
                )}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
