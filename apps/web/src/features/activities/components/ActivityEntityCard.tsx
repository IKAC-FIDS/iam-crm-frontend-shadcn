import type { ReactNode } from "react"
import {
  Activity as ActivityIcon,
  Building2,
  CalendarClock,
  Eye,
  Pencil,
  UserRound,
} from "lucide-react"

import {
  EntityCard,
  type EntityBadgeDescriptor,
  type EntityMetadataDescriptor,
} from "@/components/shared/EntityCard"
import type { EntityAction } from "@/components/shared/EntityRowActions"
import { IdentityAvatar } from "@/components/shared/IdentityAvatar"
import { uiText } from "@/config/uiText"

import type { Activity } from "../types/activity.types"

type ActivityEntityCardProps = {
  activity: Activity
  title: ReactNode
  subtitle?: ReactNode
  typeLabel: string
  dateLabel: string
  canUpdate: boolean
  onView: () => void
  onEdit: () => void
  onViewCompany: () => void
}

function activityCompanyName(activity: Activity) {
  return activity.company?.brandName || activity.company?.legalName || "شرکت ثبت نشده"
}

export function ActivityEntityCard({
  activity,
  title,
  subtitle,
  typeLabel,
  dateLabel,
  canUpdate,
  onView,
  onEdit,
  onViewCompany,
}: ActivityEntityCardProps) {
  const companyName = activityCompanyName(activity)
  const owner = activity.owner || activity.createdBy || activity.user
  const completed = activity.status === "COMPLETED"
  const companyId = activity.companyId || activity.company?.id

  const badges: EntityBadgeDescriptor[] = [
    {
      id: "status",
      label: completed ? "تکمیل‌شده" : "ثبت‌شده",
      tone: completed ? "success" : "neutral",
    },
    {
      id: "type",
      label: typeLabel,
      tone: "primary",
      dot: false,
    },
  ]

  const metadata: EntityMetadataDescriptor[] = [
    {
      id: "person",
      label: "شخص مرتبط",
      value: activity.person?.fullName || "—",
      icon: UserRound,
    },
    {
      id: "activity-date",
      label: "تاریخ فعالیت",
      value: dateLabel,
      icon: CalendarClock,
    },
  ]

  const actions: EntityAction[] = [
    {
      id: "view",
      label: uiText.common.view,
      accessibleLabel: `مشاهده فعالیت ${typeof title === "string" ? title : ""}`.trim(),
      icon: Eye,
      onClick: onView,
    },
    {
      id: "edit",
      label: "ویرایش فعالیت",
      icon: Pencil,
      onClick: onEdit,
      visible: canUpdate && activity.type !== "STAGE_CHANGE",
    },
    {
      id: "company",
      label: "مشاهده شرکت",
      icon: Building2,
      onClick: onViewCompany,
      visible: Boolean(companyId),
    },
  ]

  return (
    <EntityCard
      id={activity.id}
      title={title}
      subtitle={subtitle ? <>{companyName} · {subtitle}</> : companyName}
      ariaLabel={`فعالیت: ${typeof title === "string" ? title : typeLabel}`}
      accentColor={completed ? "var(--success)" : "var(--app-primary)"}
      onClick={onView}
      logo={(
        <IdentityAvatar
          name={companyName}
          mediaPath={activity.company?.id ? `/companies/${activity.company.id}/logo` : null}
          hasMedia={Boolean(activity.company?.logoObjectKey)}
          mediaVersion={activity.company?.logoObjectKey}
          fallbackIcon={<ActivityIcon className="size-5" />}
          className="size-14 rounded-2xl text-lg"
          imageClassName="object-contain bg-white p-1"
        />
      )}
      badges={badges}
      owner={owner ? {
        name: owner.fullName,
        role: owner.team || (activity.owner ? "مالک شرکت" : "ایجادکننده"),
        avatar: (
          <IdentityAvatar
            name={owner.fullName}
            mediaPath={`/users/${owner.id}/avatar`}
            hasMedia={Boolean(owner.avatarObjectKey)}
            mediaVersion={owner.avatarObjectKey}
            className="size-10 rounded-full text-xs"
          />
        ),
      } : null}
      ownerFallback="مالک ثبت نشده"
      metadata={metadata}
      actions={actions}
      actionLabel="عملیات فعالیت"
    />
  )
}
