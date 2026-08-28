import { Building2, Pencil, Eye } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { EntityRowActions } from "@/components/shared/EntityRowActions"
import { uiText } from "@/config/uiText"
import type { Activity } from "../types/activity.types"
export function ActivityActionsMenu({
  activity,
  canUpdate,
  onEdit,
  onView,
}: {
  activity: Activity
  canUpdate: boolean
  onEdit: () => void
  onView?: () => void
}) {
  const navigate = useNavigate()
  const companyId = activity.companyId || activity.company?.id || ""
  return (
    <EntityRowActions
      actions={[
        {
          id: "view",
          label: uiText.common.view,
          icon: Eye,
          onClick: () => onView?.(),
          enabled: Boolean(onView),
        },
        {
          id: "edit",
          label: "ویرایش فعالیت",
          icon: Pencil,
          onClick: onEdit,
          enabled: canUpdate && activity.type !== "STAGE_CHANGE",
        },
        {
          id: "company",
          label: "مشاهده شرکت",
          icon: Building2,
          onClick: () => navigate(`/companies/${companyId}`),
          enabled: Boolean(companyId),
        },
      ]}
    />
  )
}
