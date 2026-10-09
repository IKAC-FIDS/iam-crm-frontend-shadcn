import { StatusBadge } from "@/components/shared/StatusBadge"

import type { CompanyPriority } from "../types/company.types"
import { priorityLabel } from "../utils/companyFormatters"
import { companyPriorityTone } from "../utils/companyPresentation"

export function CompanyPriorityBadge({
  priority,
}: {
  priority?: CompanyPriority | null
}) {
  if (!priority) return null

  return (
    <StatusBadge tone={companyPriorityTone[priority]}>
      {priorityLabel[priority]}
    </StatusBadge>
  )
}
