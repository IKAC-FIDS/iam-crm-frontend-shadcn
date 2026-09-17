import type { LucideIcon } from "lucide-react"

import { MetricCard } from "@/components/shared/MetricCard"

export function CompanyMetricCard({
  icon: Icon,
  label,
  value,
  hint,
  onClick,
}: {
  icon: LucideIcon
  label: string
  value: string
  hint?: string
  onClick?: () => void
}) {
  return (
    <MetricCard
      icon={Icon}
      label={label}
      value={value}
      helper={hint}
      onClick={onClick}
    />
  )
}
