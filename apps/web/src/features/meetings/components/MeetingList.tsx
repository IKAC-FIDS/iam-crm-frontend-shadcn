import { EntityTableCell } from "@/components/shared/EntityTableCell"
import { CalendarDays } from "lucide-react"
import { useNavigate } from "react-router-dom"

import {
  DataTableShell,
  type DataTableColumn,
} from "@/components/shared/DataTableShell"
import { EmptyState } from "@/components/shared/EmptyState"
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

  const columns: DataTableColumn<Meeting>[] = [
    {
      id: "meeting",
      header: text.fields.meeting,
      className: "min-w-52",
      cell: (meeting) => (
        <EntityTableCell
          title={meeting.title}
          subtitle={meeting.opportunity?.title}
          avatar={<CalendarDays className="size-5" />}
        />
      ),
    },
    {
      id: "company",
      header: text.table.company,
      className: "min-w-40",
      cell: meetingCompanyName,
    },
    {
      id: "schedule",
      header: text.table.schedule,
      className: "min-w-44",
      cell: (meeting) => (
        <div>
          <p className="text-xs">{formatJalaliDate(meeting.startAt)}</p>
          <p
            dir="ltr"
            className="mt-1 text-left text-xs text-[var(--app-text-secondary)] tabular-nums"
          >
            {meetingTimeRange(meeting)}
          </p>
        </div>
      ),
    },
    {
      id: "type",
      header: text.table.type,
      className: "min-w-36",
      cell: (meeting) => (
        <StatusBadge tone="primary" dot={false}>
          {meetingTypeLabel(meeting.type)}
        </StatusBadge>
      ),
    },
    {
      id: "mode",
      header: text.table.mode,
      className: "min-w-24",
      cell: (meeting) => meetingModeLabel(meeting.mode),
    },
    {
      id: "owner",
      header: text.table.owner,
      className: "min-w-44",
      cell: (meeting) =>
        meeting.assignees
          ?.map((item) => item.user.fullName)
          .filter(Boolean)
          .join(uiText.common.listSeparator) ||
        meeting.organizer?.fullName ||
        uiText.common.notAvailable,
    },
    {
      id: "status",
      header: text.table.status,
      className: "min-w-36",
      cell: (meeting) => (
        <StatusBadge tone={meetingStatusTone(meeting.status)}>
          {meetingStatusLabel(meeting.status)}
        </StatusBadge>
      ),
    },
    {
      id: "actions",
      header: text.fields.actions,
      className: "w-16",
      cell: (meeting) => (
        <div
          onClick={(event) => event.stopPropagation()}
          onKeyDown={(event) => event.stopPropagation()}
        >
          <MeetingActionsMenu
            onView={() => navigate(`/meetings/${meeting.id}`)}
            meeting={meeting}
            canUpdate={canUpdate}
            canComplete={canComplete}
            canCancel={canCancel}
            onEdit={() => onEdit(meeting)}
            onComplete={() => onComplete(meeting)}
            onCancel={() => onCancel(meeting)}
          />
        </div>
      ),
    },
  ]

  return (
    <>
      <DataTableShell
        rows={meetings}
        columns={columns}
        getRowKey={(meeting) => meeting.id}
        onRowClick={(meeting) => navigate(`/meetings/${meeting.id}`)}
        mobile={{
          title: (meeting) => meeting.title,
          subtitle: meetingCompanyName,
          avatar: () => <CalendarDays className="size-5" />,
          status: (meeting) => <StatusBadge tone={meetingStatusTone(meeting.status)}>{meetingStatusLabel(meeting.status)}</StatusBadge>,
          fields: [
            { id: "schedule", label: text.table.schedule, render: (meeting) => `${formatJalaliDate(meeting.startAt)}، ${meetingTimeRange(meeting)}` },
            { id: "type", label: text.table.type, render: (meeting) => meetingTypeLabel(meeting.type) },
            { id: "owner", label: text.table.owner, render: (meeting) => meeting.assignees?.map((item) => item.user.fullName).filter(Boolean).join(uiText.common.listSeparator) || meeting.organizer?.fullName || uiText.common.notAvailable },
          ],
        }}
        emptyState={
          <EmptyState
            icon={CalendarDays}
            title={text.empty.title}
            description={text.empty.description}
            action={
              canCreate ? (
                <Button className="rounded-xl" onClick={onCreate}>
                  {text.actions.create}
                </Button>
              ) : undefined
            }
          />
        }
      />
    </>
  )
}
