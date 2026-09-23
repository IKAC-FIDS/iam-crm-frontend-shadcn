import {
  Archive,
  Building2,
  CalendarDays,
  Eye,
  Pencil,
  RefreshCcw,
  UserRoundCog,
} from "lucide-react"

import {
  EntityCard,
  type EntityBadgeDescriptor,
} from "@/components/shared/EntityCard"
import type { EntityAction } from "@/components/shared/EntityRowActions"
import { IdentityAvatar } from "@/components/shared/IdentityAvatar"
import type { StatusTone } from "@/components/shared/StatusBadge"
import { uiText } from "@/config/uiText"

import type { Company, CompanyActivityStatus } from "../types/company.types"
import {
  activityStatusLabel,
  companyDisplayName,
  formatCompanyDate,
  priorityLabel,
} from "../utils/companyFormatters"
import { companyPriorityTone } from "../utils/companyPresentation"

const activityStatusTone: Record<CompanyActivityStatus, StatusTone> = {
  ACTIVE: "success",
  INACTIVE: "warning",
  MERGED: "info",
  UNKNOWN: "neutral",
}

type CompanyEntityCardProps = {
  company: Company
  permissions: readonly string[]
  onView: () => void
  onEdit: () => void
  onChangeOwner: () => void
  onToggleArchive: () => void
}

export function CompanyEntityCard({
  company,
  permissions,
  onView,
  onEdit,
  onChangeOwner,
  onToggleArchive,
}: CompanyEntityCardProps) {
  const text = uiText.companies.list
  const name = companyDisplayName(company.legalName, company.brandName)
  const industry = company.industryRef?.name || company.industry
  const subtitle = company.brandName && company.brandName !== company.legalName
    ? company.legalName
    : industry || uiText.common.notAvailable
  const canEdit = permissions.includes("company:update")
  const canChangeOwner = permissions.includes("company:change-owner")
  const canToggleArchive = company.archivedAt
    ? permissions.includes("company:restore")
    : permissions.includes("company:archive")

  const badges: EntityBadgeDescriptor[] = [
    company.archivedAt
      ? { id: "archive-status", label: text.archived, tone: "warning" }
      : {
          id: "activity-status",
          label: company.activityStatus
            ? activityStatusLabel[company.activityStatus]
            : text.active,
          tone: company.activityStatus
            ? activityStatusTone[company.activityStatus]
            : "success",
        },
  ]

  if (company.priority) {
    badges.push({
      id: "priority",
      label: priorityLabel[company.priority],
      tone: companyPriorityTone[company.priority],
      tooltip: `${text.columns.priority}: ${priorityLabel[company.priority]}`,
    })
  }

  const actions: EntityAction[] = [
    { id: "view", label: text.openCompany, icon: Eye, onClick: onView },
    { id: "edit", label: uiText.companies.detail.edit, icon: Pencil, onClick: onEdit, visible: canEdit },
    { id: "change-owner", label: "تغییر مالک", icon: UserRoundCog, onClick: onChangeOwner, visible: canChangeOwner },
    {
      id: "archive",
      label: company.archivedAt ? "بازگردانی شرکت" : "بایگانی شرکت",
      icon: company.archivedAt ? RefreshCcw : Archive,
      onClick: onToggleArchive,
      visible: canToggleArchive,
      variant: company.archivedAt ? "default" : "danger",
    },
  ]

  return (
    <EntityCard
      id={company.id}
      title={name}
      subtitle={subtitle}
      ariaLabel={`${text.columns.company}: ${name}`}
      archived={Boolean(company.archivedAt)}
      onClick={onView}
      logo={(
        <IdentityAvatar
          name={name}
          mediaPath={`/companies/${company.id}/logo`}
          hasMedia={Boolean(company.logoObjectKey)}
          mediaVersion={company.logoObjectKey}
          fallbackIcon={<Building2 className="size-5" />}
          className="size-14 rounded-2xl text-lg"
        />
      )}
      badges={badges}
      owner={company.owner ? {
        name: company.owner.fullName,
        role: company.owner.team || "مالک شرکت",
        avatar: (
          <IdentityAvatar
            name={company.owner.fullName}
            mediaPath={`/users/${company.owner.id}/avatar`}
            hasMedia={Boolean(company.owner.avatarObjectKey)}
            mediaVersion={company.owner.avatarObjectKey}
            className="size-10 rounded-full text-xs"
          />
        ),
      } : null}
      ownerFallback={text.unassigned}
      metadata={[{
        id: "updated-at",
        label: text.columns.updatedAt,
        value: formatCompanyDate(company.updatedAt),
        icon: CalendarDays,
      }]}
      actions={actions}
    />
  )
}
