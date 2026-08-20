import { StatusBadge, type StatusTone } from "@/components/shared/StatusBadge"

import type { CompanyPriority } from "../types/company.types"
import { priorityLabel } from "../utils/companyFormatters"

const priorityTone: Record<CompanyPriority, StatusTone> = {
  LOW: "neutral",
  MEDIUM: "info",
  HIGH: "warning",
  STRATEGIC: "primary",
}

export function CompanyPriorityBadge({
  priority,
}: {
  priority?: CompanyPriority | null
}) {
  if (!priority) return null

  return (
    <StatusBadge tone={priorityTone[priority]}>
      {priorityLabel[priority]}
    </StatusBadge>
  )
}
