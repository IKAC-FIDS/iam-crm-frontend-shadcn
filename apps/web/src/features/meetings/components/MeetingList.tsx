import { Building2, CalendarDays, Clock3, MapPin, UserRound } from "lucide-react"
import { useNavigate } from "react-router-dom"

import { EntityCardList, type EntityCardField } from "@/components/shared/EntityCardList"
import { EmptyState } from "@/components/shared/EmptyState"
import { IdentityAvatar } from "@/components/shared/IdentityAvatar"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { uiText } from "@/config/uiText"
import { formatJalaliDate } from "@/lib/date/jalali"
import { Button } from "@workspace/ui/components/button"

import type { Meeting } from "../types/meeting.types"
import {
  meetingCompanyName,
  meetingModeLabel,
  meetingStatusLabel,
  meetingStatusTone,
  meetingTimeRange,
  meetingTypeLabel,
} from "../utils/meetingFormatters"
import { MeetingActionsMenu } from "./MeetingActionsMenu"

export function MeetingList({
  meetings,
  canCreate,
  canUpdate,
  canComplete,
  canCancel,
  onCreate,
  onEdit,
  onComplete,
  onCancel,
}: {
  meetings: Meeting[]
  canCreate: boolean
  canUpdate: boolean
  canComplete: boolean
  canCancel: boolean
  onCreate: () => void
  onEdit: (meeting: Meeting) => void
  onComplete: (meeting: Meeting) => void
  onCancel: (meeting: Meeting) => void
}) {
  const text = uiText.meetings
  const navigate = useNavigate()

  const fields: EntityCardField<Meeting>[] = [
    {
      id: "company",
      label: text.table.company,
      icon: Building2,
      render: (meeting) => {
        const companyName = meetingCompanyName(meeting)
        return (
          <span className="inline-flex min-w-0 items-center gap-2">
            <IdentityAvatar
              name={companyName}
              mediaPath={meeting.company?.id ? `/companies/${meeting.company.id}/logo` : null}
              hasMedia={Boolean(meeting.company?.id)}
              fallbackIcon={<Building2 className="size-4" />}
              className="size-8 rounded-xl text-[10px]"
            />
            <span className="truncate">{companyName}</span>
          </span>
        )
      },
    },
    {
      id: "schedule",
      label: text.table.schedule,
      icon: Clock3,
      render: (meeting) => (
        <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-1">
          <span>{formatJalaliDate(meeting.startAt)}</span>
          <span dir="ltr" className="tabular-nums text-[var(--app-text-secondary)]">
            {meetingTimeRange(meeting)}
          </span>
        </span>
      ),
    },
    {
      id: "owner",
      label: text.table.owner,
      icon: UserRound,
      render: (meeting) => {
        const assignedUsers = meeting.assignees?.map((item) => item.user) ?? []
        const people = assignedUsers.length
          ? assignedUsers
          : meeting.organizer
            ? [meeting.organizer]
            : []

        if (!people.length) return uiText.common.notAvailable

        return (
          <span className="inline-flex min-w-0 items-center gap-2">
            <span className="flex shrink-0 -space-x-2 space-x-reverse">
              {people.slice(0, 3).map((user) => (
                <IdentityAvatar
                  key={user.id}
                  name={user.fullName || user.email || uiText.common.notAvailable}
                  mediaPath={`/users/${user.id}/avatar`}
                  hasMedia
                  className="size-8 rounded-xl border-2 border-[var(--app-surface)] text-[10px]"
                />
              ))}
            </span>
            <span className="truncate">
              {people
                .map((user) => user.fullName || user.email)
                .filter(Boolean)
                .join(uiText.common.listSeparator)}
            </span>
          </span>
        )
      },
    },
    {
      id: "delivery",
      label: text.table.mode,
      icon: MapPin,
      render: (meeting) => meetingModeLabel(meeting.mode),
    },
  ]

  return (
    <EntityCardList
      rows={meetings}
      fields={fields}
      getRowKey={(meeting) => meeting.id}
      layout="row"
      density="compact"
      fieldsClassName="sm:grid-cols-2 xl:grid-cols-4"
      title={(meeting) => meeting.title}
      subtitle={(meeting) => meeting.opportunity?.title || meeting.agenda || meetingCompanyName(meeting)}
      media={() => (
        <span className="grid size-12 place-items-center rounded-2xl bg-[var(--app-primary)] text-[var(--app-on-primary)] shadow-sm">
          <CalendarDays className="size-5" />
        </span>
      )}
      badges={(meeting) => (
        <StatusBadge tone={meetingStatusTone(meeting.status)}>
          {meetingStatusLabel(meeting.status)}
        </StatusBadge>
      )}
      tags={(meeting) => (
        <>
          <StatusBadge tone="primary" dot={false}>{meetingTypeLabel(meeting.type)}</StatusBadge>
          <StatusBadge tone="neutral" dot={false}>{meetingModeLabel(meeting.mode)}</StatusBadge>
        </>
      )}
      onRowClick={(meeting) => navigate(`/meetings/${meeting.id}`)}
      actions={(meeting) => (
        <MeetingActionsMenu
          presentation="buttons"
          meeting={meeting}
          canUpdate={canUpdate}
          canComplete={canComplete}
          canCancel={canCancel}
          onView={() => navigate(`/meetings/${meeting.id}`)}
          onEdit={() => onEdit(meeting)}
          onComplete={() => onComplete(meeting)}
          onCancel={() => onCancel(meeting)}
        />
      )}
      emptyState={
        <EmptyState
          icon={CalendarDays}
          title={text.empty.title}
          description={text.empty.description}
          action={canCreate ? <Button className="rounded-xl" onClick={onCreate}>{text.actions.create}</Button> : undefined}
        />
      }
    />
  )
}
