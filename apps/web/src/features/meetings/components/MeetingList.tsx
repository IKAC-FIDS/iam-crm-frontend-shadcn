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
        <div className="min-w-0">
          <p className="truncate text-xs font-bold">{meeting.title}</p>
          {meeting.opportunity ? (
            <p className="mt-1 truncate text-xs text-[var(--app-text-secondary)]">
              {meeting.opportunity.title}
            </p>
          ) : null}
        </div>
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
      cell: (meeting) => <StatusBadge tone="primary" dot={false}>{meetingTypeLabel(meeting.type)}</StatusBadge>,
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
    <div className="w-full max-w-full overflow-x-auto">
      <div className="min-w-[920px]">
        <DataTableShell
          rows={meetings}
          columns={columns}
          getRowKey={(meeting) => meeting.id}
          onRowClick={(meeting) => navigate(`/meetings/${meeting.id}`)}
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
      </div>
    </div>
  )
}
