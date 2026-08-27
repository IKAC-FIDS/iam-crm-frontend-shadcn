import {
  Building2,
  Layers3,
  MapPin,
  UserRound,
  UsersRound,
  Video,
} from "lucide-react"
import { useNavigate } from "react-router-dom"

import { EmptyState } from "@/components/shared/EmptyState"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { uiText } from "@/config/uiText"
import { Button } from "@workspace/ui/components/button"

import type { Meeting } from "../types/meeting.types"
import {
  meetingCompanyName,
  meetingDayKey,
  meetingDayLabel,
  meetingModeLabel,
  meetingStatusLabel,
  meetingStatusTone,
  meetingTimeRange,
} from "../utils/meetingFormatters"
import { MeetingActionsMenu } from "./MeetingActionsMenu"

export function MeetingAgenda({
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
  const navigate = useNavigate()
  const groups = new Map<string, Meeting[]>()

  meetings.forEach((meeting) => {
    const key = meetingDayKey(meeting.startAt)
    groups.set(key, [...(groups.get(key) || []), meeting])
  })

  if (!meetings.length) {
    return (
      <EmptyState
        icon={UsersRound}
        title={uiText.meetings.empty.title}
        description={uiText.meetings.empty.description}
        action={
          canCreate ? (
            <Button className="rounded-xl" onClick={onCreate}>
              {uiText.meetings.actions.create}
            </Button>
          ) : undefined
        }
      />
    )
  }

  return (
    <div className="grid min-w-0 gap-7">
      {[...groups.values()].map((items) => {
        const first = items[0]
        if (!first) return null

        return (
          <section key={meetingDayKey(first.startAt)} className="min-w-0">
            <div className="mb-3 flex items-center gap-3">
              <h2 className="shrink-0 text-sm font-bold text-[var(--app-heading)]">
                {meetingDayLabel(first.startAt)}
              </h2>
              <div className="h-px min-w-0 flex-1 bg-[var(--app-divider)]" />
            </div>

            <div className="grid gap-2.5">
              {items.map((meeting) => {
                const cancelled = meeting.status === "CANCELLED"
                const ModeIcon =
                  meeting.mode === "ONLINE"
                    ? Video
                    : meeting.mode === "HYBRID"
                      ? Layers3
                      : MapPin

                const openMeeting = () =>
                  navigate(`/meetings/${meeting.id}`)

                return (
                  <article
                    key={meeting.id}
                    tabIndex={0}
                    onClick={openMeeting}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault()
                        openMeeting()
                      }
                    }}
                    className={`grid min-w-0 cursor-pointer grid-cols-[72px_minmax(0,1fr)] overflow-hidden rounded-2xl border border-[var(--app-divider)] bg-[var(--app-surface)] shadow-[var(--app-shadow-card)] transition-colors hover:border-[var(--app-primary)]/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-primary)]/30 sm:grid-cols-[94px_minmax(0,1fr)] ${
                      cancelled ? "opacity-70" : ""
                    }`}
                  >
                    <div className="flex flex-col items-center justify-center border-e border-[var(--app-divider)] bg-[var(--app-background)]/65 px-2 py-4">
                      <span
                        dir="ltr"
                        className="text-sm font-bold text-[var(--app-heading)] tabular-nums"
                      >
                        {meetingTimeRange(meeting).split("–")[0]}
                      </span>
                      <span className="my-1 h-4 w-px bg-[var(--app-divider)]" />
                      <span
                        dir="ltr"
                        className="text-xs text-[var(--app-text-secondary)] tabular-nums"
                      >
                        {meetingTimeRange(meeting).split("–")[1]}
                      </span>
                    </div>

                    <div className="min-w-0 p-3.5 sm:p-4">
                      <div className="flex min-w-0 items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="truncate text-sm font-bold text-[var(--app-heading)]">
                            {meeting.title}
                          </h3>
                          <p className="mt-1.5 flex min-w-0 flex-wrap items-center gap-1.5 text-xs text-[var(--app-text-secondary)]">
                            <Building2 className="size-3.5" />
                            <span>{meetingCompanyName(meeting)}</span>
                            {meeting.opportunity ? (
                              <span>· {meeting.opportunity.title}</span>
                            ) : null}
                          </p>
                        </div>

                        <div
                          className="flex shrink-0 items-center gap-1.5"
                          onClick={(event) => event.stopPropagation()}
                          onKeyDown={(event) => event.stopPropagation()}
                        >
                          <StatusBadge tone={meetingStatusTone(meeting.status)}>
                            {meetingStatusLabel(meeting.status)}
                          </StatusBadge>
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
                      </div>

                      <div className="mt-3 flex min-w-0 flex-wrap gap-x-4 gap-y-2 text-xs text-[var(--app-text-secondary)]">
                        <span className="inline-flex items-center gap-1.5">
                          <ModeIcon className="size-3.5" />
                          {meetingModeLabel(meeting.mode)}
                        </span>

                        {meeting.organizer?.fullName ||
                        meeting.assignees?.length ? (
                          <span className="inline-flex items-center gap-1.5">
                            <UserRound className="size-3.5" />
                            {meeting.assignees?.length
                              ? `${meeting.assignees.length.toLocaleString("fa-IR")} ${uiText.meetings.agenda.assignees}`
                              : meeting.organizer?.fullName}
                          </span>
                        ) : null}

                        {meeting.attendees?.length ? (
                          <span className="inline-flex items-center gap-1.5">
                            <UsersRound className="size-3.5" />
                            {meeting.attendees.length.toLocaleString("fa-IR")}{" "}
                            {uiText.meetings.agenda.attendees}
                          </span>
                        ) : null}

                        {meeting.location ? (
                          <span className="truncate">{meeting.location}</span>
                        ) : null}

                        {!meeting.location && meeting.mode !== "IN_PERSON" ? (
                          <span>{uiText.meetings.agenda.online}</span>
                        ) : null}
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          </section>
        )
      })}
    </div>
  )
}
