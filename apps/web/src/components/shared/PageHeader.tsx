import type { ReactNode } from "react"
import { Layers3, type LucideIcon } from "lucide-react"
import { PageHero } from "./PageHero"

export function PageHeader({
  title,
  description,
  actions,
  onBack,
  onRefresh,
  refreshing,
  accessLabel = "جزئیات",
  accessIcon = Layers3,
  metadata,
}: {
  title: ReactNode
  description?: ReactNode
  actions?: ReactNode
  onBack?: () => void
  onRefresh?: () => void | Promise<unknown>
  refreshing?: boolean
  accessLabel?: ReactNode
  accessIcon?: LucideIcon
  metadata?: ReactNode
}) {
  return (
    <PageHero
      title={title}
      description={description || "اطلاعات و عملیات این بخش را مشاهده و مدیریت کنید."}
      accessBadge={{ label: accessLabel, icon: accessIcon }}
      onBack={onBack}
      onRefresh={onRefresh}
      refreshing={refreshing}
      metadata={metadata}
      actions={actions}
    />
  )
}
