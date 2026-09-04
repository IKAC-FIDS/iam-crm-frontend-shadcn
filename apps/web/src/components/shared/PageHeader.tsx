import type { ReactNode } from "react"
import { Layers3 } from "lucide-react"
import { PageHero } from "./PageHero"

export function PageHeader({
  title,
  description,
  actions,
  onBack,
  onRefresh,
  refreshing,
  accessLabel = "جزئیات",
}: {
  title: ReactNode
  description?: ReactNode
  actions?: ReactNode
  onBack?: () => void
  onRefresh?: () => void | Promise<unknown>
  refreshing?: boolean
  accessLabel?: ReactNode
}) {
  return (
    <PageHero
      title={title}
      description={description || "اطلاعات و عملیات این بخش را مشاهده و مدیریت کنید."}
      accessBadge={{ label: accessLabel, icon: Layers3 }}
      onBack={onBack}
      onRefresh={onRefresh}
      refreshing={refreshing}
      actions={actions}
    />
  )
}
