import { Building2, Pencil, Eye } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { EntityRowActions } from "@/components/shared/EntityRowActions"
import { uiText } from "@/config/uiText"
import { Button } from "@workspace/ui/components/button"
import type { Activity } from "../types/activity.types"
export function ActivityActionsMenu({
  activity,
  canUpdate,
  onEdit,
  onView,
  presentation = "menu",
}: {
  activity: Activity
  canUpdate: boolean
  onEdit: () => void
  onView?: () => void
  presentation?: "menu" | "buttons"
}) {
  const navigate = useNavigate()
  const companyId = activity.companyId || activity.company?.id || ""

  const actions = [
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
  ]

  if (presentation === "buttons") {
    return (
      <>
        {actions.map((action) => {
          if (!action.enabled) return null
          const Icon = action.icon
          return (
            <Button
              key={action.id}
              type="button"
              variant="ghost"
              size="sm"
              className="rounded-xl"
              onClick={action.onClick}
            >
              <Icon className="size-4" />
              {action.label}
            </Button>
          )
        })}
      </>
    )
  }

  return (
    <EntityRowActions actions={actions} />
  )
}
