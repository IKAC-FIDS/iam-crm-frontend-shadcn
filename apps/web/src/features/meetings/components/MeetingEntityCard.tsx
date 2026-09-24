import {
  Building2,
  CalendarClock,
  CheckCircle2,
  Eye,
  MapPin,
  Pencil,
  Video,
  XCircle,
} from "lucide-react"

import {
  EntityCard,
  type EntityBadgeDescriptor,
  type EntityMetadataDescriptor,
} from "@/components/shared/EntityCard"
import type { EntityAction } from "@/components/shared/EntityRowActions"
import { IdentityAvatar } from "@/components/shared/IdentityAvatar"
import { uiText } from "@/config/uiText"
import { formatJalaliDate } from "@/lib/date/jalali"

import type { Meeting } from "../types/meeting.types"
import {
  meetingCompanyName,
  meetingModeLabel,
  meetingStatusLabel,
  meetingStatusTone,
  meetingTimeRange,
  meetingTypeLabel,
} from "../utils/meetingFormatters"

type MeetingEntityCardProps = {
  meeting: Meeting
  canUpdate: boolean
  canComplete: boolean
  canCancel: boolean
  onView: () => void
  onEdit: () => void
  onComplete: () => void
  onCancel: () => void
}

const statusAccent: Record<Meeting["status"], string> = {
  SCHEDULED: "var(--app-primary)",
  COMPLETED: "var(--success)",
  CANCELLED: "var(--destructive)",
}

export function MeetingEntityCard({
  meeting,
  canUpdate,
  canComplete,
  canCancel,
  onView,
  onEdit,
  onComplete,
  onCancel,
}: MeetingEntityCardProps) {
  const text = uiText.meetings
  const companyName = meetingCompanyName(meeting)
  const active = meeting.status === "SCHEDULED"
  const assignedUsers = meeting.assignees?.map((item) => item.user) ?? []
  const responsible = assignedUsers[0] || meeting.organizer || null
  const additionalAssignees = Math.max(0, assignedUsers.length - 1)

  const badges: EntityBadgeDescriptor[] = [
    {
      id: "status",
      label: meetingStatusLabel(meeting.status),
      tone: meetingStatusTone(meeting.status),
    },
    {
      id: "type",
      label: meetingTypeLabel(meeting.type),
      tone: "primary",
      dot: false,
    },
    {
      id: "mode",
      label: meetingModeLabel(meeting.mode),
      tone: "neutral",
      dot: false,
    },
  ]

  const place = meeting.mode === "ONLINE"
    ? meeting.meetingUrl || text.agenda.online
    : meeting.location || (meeting.mode === "HYBRID" ? meeting.meetingUrl : null)

  const metadata: EntityMetadataDescriptor[] = [
    {
      id: "schedule",
      label: text.table.schedule,
      value: (
        <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-0.5">
          <span>{formatJalaliDate(meeting.startAt)}</span>
          <span dir="ltr" className="tabular-nums">{meetingTimeRange(meeting)}</span>
        </span>
      ),
      icon: CalendarClock,
    },
    {
      id: "place",
      label: meeting.mode === "ONLINE" ? text.fields.meetingUrl : text.fields.location,
      value: place || uiText.common.notAvailable,
      icon: meeting.mode === "ONLINE" ? Video : MapPin,
    },
  ]

  const actions: EntityAction[] = [
    {
      id: "view",
      label: uiText.common.view,
      accessibleLabel: `مشاهده جلسه ${meeting.title}`,
      icon: Eye,
      onClick: onView,
    },
    {
      id: "edit",
      label: text.actions.edit,
      icon: Pencil,
      onClick: onEdit,
      visible: active && canUpdate,
    },
    {
      id: "complete",
      label: text.actions.complete,
      icon: CheckCircle2,
      onClick: onComplete,
      visible: active && canComplete,
    },
    {
      id: "cancel",
      label: text.actions.cancel,
      icon: XCircle,
      onClick: onCancel,
      visible: active && canCancel,
      variant: "danger",
    },
  ]

  return (
    <EntityCard
      id={meeting.id}
      title={meeting.title}
      subtitle={meeting.opportunity?.title || meeting.agenda || companyName}
      ariaLabel={`جلسه: ${meeting.title}`}
      accentColor={statusAccent[meeting.status]}
      disabled={meeting.status === "CANCELLED"}
      onClick={onView}
      logo={(
        <IdentityAvatar
          name={companyName}
          mediaPath={meeting.company?.id ? `/companies/${meeting.company.id}/logo` : null}
          hasMedia={Boolean(meeting.company?.logoObjectKey)}
          mediaVersion={meeting.company?.logoObjectKey}
          fallbackIcon={<Building2 className="size-5" />}
          className="size-14 rounded-2xl text-lg"
          imageClassName="bg-white object-contain p-1"
        />
      )}
      badges={badges}
      owner={responsible ? {
        name: responsible.fullName || responsible.email || uiText.common.notAvailable,
        role: additionalAssignees
          ? `${additionalAssignees.toLocaleString("fa-IR")} مسئول دیگر`
          : responsible.team?.name || (assignedUsers.length ? "مسئول جلسه" : text.fields.organizer),
        avatar: (
          <IdentityAvatar
            name={responsible.fullName || responsible.email || uiText.common.notAvailable}
            mediaPath={`/users/${responsible.id}/avatar`}
            hasMedia={Boolean(responsible.avatarObjectKey)}
            mediaVersion={responsible.avatarObjectKey}
            className="size-10 rounded-full text-xs"
          />
        ),
      } : null}
      ownerFallback="مسئولی ثبت نشده"
      metadata={metadata}
      actions={actions}
      actionLabel={text.actions.more}
    />
  )
}
