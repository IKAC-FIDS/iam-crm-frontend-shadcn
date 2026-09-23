import type { StatusTone } from "@/components/shared/StatusBadge"

import type { CompanyPriority } from "../types/company.types"

export const companyPriorityTone: Record<CompanyPriority, StatusTone> = {
  LOW: "neutral",
  MEDIUM: "info",
  HIGH: "warning",
  STRATEGIC: "primary",
}
