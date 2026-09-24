import {
  Archive,
  BriefcaseBusiness,
  CalendarDays,
  CircleDollarSign,
  Eye,
  Pencil,
  RefreshCcw,
  UserRoundCog,
  Waypoints,
} from "lucide-react"

import {
  EntityCard,
  type EntityBadgeDescriptor,
  type EntityMetadataDescriptor,
} from "@/components/shared/EntityCard"
import type { EntityAction } from "@/components/shared/EntityRowActions"
import { IdentityAvatar } from "@/components/shared/IdentityAvatar"
import { uiText } from "@/config/uiText"

import type { Opportunity } from "../types/opportunity.types"
import {
  formatOpportunityDate,
  formatOpportunityValue,
  opportunityCompanyName,
  priorityLabel,
} from "../utils/opportunityFormatters"
import type { OpportunityActionPermissions } from "./OpportunityActionsMenu"

type OpportunityEntityCardProps = {
  opportunity: Opportunity
  permissions: OpportunityActionPermissions
  financialVisible: boolean
  onView: () => void
  onEdit: () => void
  onChangeOwner: () => void
  onChangeStage: () => void
  onArchiveToggle: () => void
}

export function OpportunityEntityCard({
  opportunity,
  permissions,
  financialVisible,
  onView,
  onEdit,
  onChangeOwner,
  onChangeStage,
  onArchiveToggle,
}: OpportunityEntityCardProps) {
  const text = uiText.opportunities
  const active = !opportunity.archivedAt
  const companyName = opportunityCompanyName(opportunity)

  const badges: EntityBadgeDescriptor[] = [
    {
      id: "status",
      label: active ? text.status.active : text.status.archived,
      tone: active ? "success" : "warning",
    },
    {
      id: "priority",
      label: priorityLabel(opportunity.priority),
      tone:
        opportunity.priority === "STRATEGIC"
          ? "primary"
          : opportunity.priority === "HIGH"
            ? "warning"
            : opportunity.priority === "MEDIUM"
              ? "info"
              : "neutral",
      dot: false,
      tooltip: `${text.fields.priority}: ${priorityLabel(opportunity.priority)}`,
    },
    {
      id: "stage",
      label: opportunity.stage?.label || uiText.common.notAvailable,
      tone: "neutral",
      dot: false,
      tooltip: text.fields.stage,
    },
  ]

  const metadata: EntityMetadataDescriptor[] = [
    {
      id: "close-date",
      label: text.table.closeDate,
      value: formatOpportunityDate(opportunity.expectedCloseDate),
      icon: CalendarDays,
    },
  ]

  if (financialVisible) {
    metadata.push({
      id: "estimated-value",
      label: text.table.estimatedValue,
      value: `${formatOpportunityValue(opportunity.estimatedValue)} ${text.fields.valueUnit}`,
      icon: CircleDollarSign,
    })
  }

  const actions: EntityAction[] = [
    {
      id: "view",
      label: text.actions.view,
      accessibleLabel: "مشاهده جزئیات فرصت",
      icon: Eye,
      onClick: onView,
    },
    {
      id: "edit",
      label: text.actions.edit,
      icon: Pencil,
      onClick: onEdit,
      visible: permissions.update && active,
    },
    {
      id: "owner",
      label: text.actions.changeOwner,
      icon: UserRoundCog,
      onClick: onChangeOwner,
      visible: permissions.changeOwner && active,
    },
    {
      id: "stage",
      label: text.actions.changeStage,
      icon: Waypoints,
      onClick: onChangeStage,
      visible: permissions.changeStage && active,
    },
    {
      id: "archive",
      label: active ? text.actions.archive : text.actions.restore,
      icon: active ? Archive : RefreshCcw,
      onClick: onArchiveToggle,
      visible: active ? permissions.archive : permissions.restore,
      variant: active ? "danger" : "default",
    },
  ]

  return (
    <EntityCard
      id={opportunity.id}
      title={opportunity.title}
      subtitle={companyName}
      ariaLabel={`${text.table.opportunity}: ${opportunity.title}`}
      archived={Boolean(opportunity.archivedAt)}
      accentColor={opportunity.stage?.color || "var(--app-primary)"}
      onClick={onView}
      logo={(
        <IdentityAvatar
          name={companyName}
          mediaPath={opportunity.company?.id ? `/companies/${opportunity.company.id}/logo` : undefined}
          hasMedia={Boolean(opportunity.company?.logoObjectKey)}
          mediaVersion={opportunity.company?.logoObjectKey}
          fallbackIcon={<BriefcaseBusiness className="size-5" />}
          className="size-14 rounded-2xl text-lg"
        />
      )}
      badges={badges}
      owner={opportunity.owner ? {
        name: opportunity.owner.fullName,
        role: opportunity.owner.team || text.fields.owner,
        avatar: (
          <IdentityAvatar
            name={opportunity.owner.fullName}
            mediaPath={`/users/${opportunity.owner.id}/avatar`}
            hasMedia={Boolean(opportunity.owner.avatarObjectKey)}
            mediaVersion={opportunity.owner.avatarObjectKey}
            className="size-10 rounded-full text-xs"
          />
        ),
      } : null}
      ownerFallback={text.fields.noOwner}
      metadata={metadata}
      actions={actions}
      actionLabel={text.actions.more}
    />
  )
}
