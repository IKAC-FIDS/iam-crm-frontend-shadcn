import {
  Archive,
  Eye,
  Pencil,
  RefreshCcw,
  UserRoundCog,
  Waypoints,
} from "lucide-react"
import { EntityRowActions } from "@/components/shared/EntityRowActions"
import { uiText } from "@/config/uiText"
import type { Opportunity } from "../types/opportunity.types"
export interface OpportunityActionPermissions {
  update: boolean
  changeOwner: boolean
  changeStage: boolean
  archive: boolean
  restore: boolean
}

export function OpportunityActionsMenu({
  opportunity,
  permissions,
  onView,
  onEdit,
  onChangeOwner,
  onChangeStage,
  onArchiveToggle,
}: {
  opportunity: Opportunity
  permissions: OpportunityActionPermissions
  onView: () => void
  onEdit: () => void
  onChangeOwner: () => void
  onChangeStage: () => void
  onArchiveToggle: () => void
}) {
  const text = uiText.opportunities.actions
  const active = !opportunity.archivedAt

  return (
    <EntityRowActions
      actions={[
        { id: "view", label: "مشاهده جزئیات فرصت", icon: Eye, onClick: onView },
        {
          id: "edit",
          label: text.edit,
          icon: Pencil,
          onClick: onEdit,
          enabled: permissions.update && active,
        },
        {
          id: "owner",
          label: text.changeOwner,
          icon: UserRoundCog,
          onClick: onChangeOwner,
          enabled: permissions.changeOwner && active,
        },
        {
          id: "stage",
          label: text.changeStage,
          icon: Waypoints,
          onClick: onChangeStage,
          enabled: permissions.changeStage && active,
        },
        {
          id: "archive",
          label: text.archive,
          icon: Archive,
          onClick: onArchiveToggle,
          enabled: active && permissions.archive,
          tone: "danger",
        },
        {
          id: "restore",
          label: text.restore,
          icon: RefreshCcw,
          onClick: onArchiveToggle,
          enabled: !active && permissions.restore,
        },
      ]}
    />
  )
}
