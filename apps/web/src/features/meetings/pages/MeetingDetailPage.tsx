import {
  ArrowRight,
  Bell,
  BriefcaseBusiness,
  Building2,
  CalendarClock,
  CheckCircle2,
  Clock3,
  ExternalLink,
  FileText,
  MapPin,
  Pencil,
  UserRound,
  Users,
  Video,
  XCircle,
} from "lucide-react"
import { useState, type ReactNode } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"

import { ErrorState } from "@/components/shared/ErrorState"
import { LoadingState } from "@/components/shared/LoadingState"
import { PageHeader } from "@/components/shared/PageHeader"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { SurfaceCard } from "@/components/shared/SurfaceCard"
import { uiText } from "@/config/uiText"
import { Person360WorkspaceDialog } from "@/features/people/components/Person360WorkspaceDialog"
import { ArtifactPanel } from "@/features/artifacts/components/ArtifactPanel"
import {
  formatJalaliDate,
  formatJalaliDateTime,
} from "@/lib/date/jalali"
import { useAuthStore } from "@/store/authStore"
import { Button } from "@workspace/ui/components/button"

import { MeetingFormDialog } from "../components/MeetingFormDialog"
import { MeetingStatusActionDialog } from "../components/MeetingStatusActionDialog"
import { useMeeting } from "../hooks/useMeetings"
import type {
  Meeting,
  MeetingPerson,
  MeetingUser,
} from "../types/meeting.types"
import {
  meetingCompanyName,
  meetingModeLabel,
  meetingStatusLabel,
  meetingStatusTone,
  meetingTimeRange,
  meetingTypeLabel,
} from "../utils/meetingFormatters"

export function MeetingDetailPage() {
  const { id = "" } = useParams()
  const navigate = useNavigate()
  const text = uiText.meetings
  const detailText = text.detail
  const permissions = useAuthStore((state) => state.user?.permissions ?? [])
  const canView = permissions.includes("meeting:view")
  const canUpdate = permissions.includes("meeting:update")
  const canComplete = permissions.includes("meeting:complete")
  const canCancel = permissions.includes("meeting:cancel")
  const canViewCompany = permissions.includes("company:view")
  const canViewOpportunity = permissions.includes("opportunity:view")
  const canViewPerson = permissions.includes("person:view")

  const meetingQuery = useMeeting(id, canView)
  const [editOpen, setEditOpen] = useState(false)
  const [statusAction, setStatusAction] = useState<
    "complete" | "cancel" | undefined
  >()
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null)

  if (!canView) {
    return (
      <ErrorState
        title={detailText.errors.permissionTitle}
        description={detailText.errors.permissionDescription}
      />
    )
  }

  if (meetingQuery.isLoading) {
    return (
      <div className="mx-auto w-full max-w-[1500px]">
        <LoadingState rows={7} />
      </div>
    )
  }

  if (meetingQuery.isError || !meetingQuery.data) {
    return (
      <div className="mx-auto w-full max-w-[1500px]">
        <ErrorState
          title={detailText.errors.loadTitle}
          description={detailText.errors.loadDescription}
          retryLabel={uiText.common.retry}
          onRetry={() => void meetingQuery.refetch()}
        />
      </div>
    )
  }

  const meeting = meetingQuery.data
  const scheduled = meeting.status === "SCHEDULED"

  return (
    <div className="mx-auto grid w-full max-w-[1500px] min-w-0 gap-4">
      <div>
        <Button
          variant="ghost"
          size="sm"
          className="mb-2 rounded-xl text-[var(--app-text-secondary)]"
          onClick={() => navigate("/meetings")}
        >
          <ArrowRight className="size-4" />
          {detailText.actions.back}
        </Button>

        <PageHeader
          title={meeting.title}
          description={
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span>{meetingCompanyName(meeting)}</span>
              {meeting.opportunity?.title ? (
                <>
                  <span aria-hidden>·</span>
                  <span>{meeting.opportunity.title}</span>
                </>
              ) : null}
            </div>
          }
          actions={
            scheduled ? (
              <>
                {canUpdate ? (
                  <Button
                    variant="outline"
                    className="rounded-xl"
                    onClick={() => setEditOpen(true)}
                  >
                    <Pencil className="size-4" />
                    {text.actions.edit}
                  </Button>
                ) : null}
                {canComplete ? (
                  <Button
                    variant="outline"
                    className="rounded-xl border-[var(--success)]/30 text-[var(--success)] hover:bg-[var(--success-light)]"
                    onClick={() => setStatusAction("complete")}
                  >
                    <CheckCircle2 className="size-4" />
                    {text.actions.complete}
                  </Button>
                ) : null}
                {canCancel ? (
                  <Button
                    variant="outline"
                    className="rounded-xl border-[var(--destructive)]/30 text-[var(--destructive)] hover:bg-[var(--destructive-soft)]"
                    onClick={() => setStatusAction("cancel")}
                  >
                    <XCircle className="size-4" />
                    {text.actions.cancel}
                  </Button>
                ) : null}
              </>
            ) : undefined
          }
        />
      </div>

      <MeetingHero meeting={meeting} />

      <div className="grid min-w-0 items-start gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(300px,360px)]">
        <main className="grid min-w-0 gap-4">
          <ScheduleCard meeting={meeting} />
          <NarrativeCard
            icon={<FileText className="size-4" />}
            title={detailText.sections.agenda}
            value={meeting.agenda}
            empty={detailText.empty.agenda}
          />
          <NarrativeCard
            icon={<FileText className="size-4" />}
            title={detailText.sections.description}
            value={meeting.description}
            empty={detailText.empty.description}
          />
          <OutcomeCard meeting={meeting} />
          <ArtifactPanel entityType="MEETING" entityId={meeting.id} title="مستندات جلسه" readOnly={meeting.status !== "COMPLETED"} />
        </main>

        <aside className="grid min-w-0 gap-4 xl:sticky xl:top-4">
          <ContextCard
            meeting={meeting}
            canViewCompany={canViewCompany}
            canViewOpportunity={canViewOpportunity}
          />
          <PeopleCard
            meeting={meeting}
            canViewPerson={canViewPerson}
            onPersonClick={setSelectedPersonId}
          />
          <LifecycleCard meeting={meeting} />
        </aside>
      </div>

      {editOpen ? (
        <MeetingFormDialog
          open
          onOpenChange={setEditOpen}
          meeting={meeting}
          onSaved={() => void meetingQuery.refetch()}
        />
      ) : null}

      {statusAction ? (
        <MeetingStatusActionDialog
          meeting={meeting}
          action={statusAction}
          open
          onOpenChange={(open) => {
            if (!open) setStatusAction(undefined)
          }}
        />
      ) : null}

      <Person360WorkspaceDialog
        personId={selectedPersonId}
        open={Boolean(selectedPersonId) && canViewPerson}
        onOpenChange={(open) => {
          if (!open) setSelectedPersonId(null)
        }}
      />
    </div>
  )
}

function MeetingHero({ meeting }: { meeting: Meeting }) {
  const text = uiText.meetings.detail
  return (
    <SurfaceCard className="relative min-w-0 overflow-hidden">
      <div className="absolute inset-y-0 start-0 w-1 bg-[var(--app-primary)]" />
      <div className="grid min-w-0 gap-4 p-4 ps-5 sm:p-5 sm:ps-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge tone={meetingStatusTone(meeting.status)}>
              {meetingStatusLabel(meeting.status)}
            </StatusBadge>
            <StatusBadge tone="primary" dot={false}>
              {meetingTypeLabel(meeting.type)}
            </StatusBadge>
            <StatusBadge tone="neutral" dot={false}>
              {meetingModeLabel(meeting.mode)}
            </StatusBadge>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-[var(--app-text-secondary)]">
            <span className="inline-flex items-center gap-2">
              <CalendarClock className="size-4 text-[var(--app-primary)]" />
              {formatJalaliDate(meeting.startAt)}
            </span>
            <span className="inline-flex items-center gap-2 font-bold text-[var(--app-heading)]">
              <Clock3 className="size-4 text-[var(--app-primary)]" />
              {meetingTimeRange(meeting)}
            </span>
            {meeting.reminderAt ? (
              <span className="inline-flex items-center gap-2">
                <Bell className="size-4 text-[var(--app-primary-alt)]" />
                {text.labels.reminder}:{" "}
                {formatJalaliDateTime(meeting.reminderAt)}
              </span>
            ) : (
              <span className="inline-flex items-center gap-2">
                <Bell className="size-4 text-[var(--app-text-secondary)]" />
                {text.labels.noReminder}
              </span>
            )}
          </div>
        </div>

        {meeting.meetingUrl &&
        (meeting.mode === "ONLINE" || meeting.mode === "HYBRID") ? (
          <a
            href={meeting.meetingUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[var(--app-primary)] px-4 text-xs font-bold text-[var(--app-on-primary)] transition-opacity hover:opacity-90"
          >
            <Video className="size-4" />
            {text.actions.join}
            <ExternalLink className="size-3.5" />
          </a>
        ) : null}
      </div>
    </SurfaceCard>
  )
}

function ScheduleCard({ meeting }: { meeting: Meeting }) {
  const text = uiText.meetings.detail
  return (
    <SurfaceCard className="min-w-0 overflow-hidden">
      <SectionHeader
        icon={<CalendarClock className="size-4" />}
        title={text.sections.schedule}
      />
      <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4 sm:p-5">
        <Metric
          label={text.labels.date}
          value={formatJalaliDate(meeting.startAt)}
          icon={<CalendarClock className="size-4" />}
        />
        <Metric
          label={text.labels.time}
          value={meetingTimeRange(meeting)}
          icon={<Clock3 className="size-4" />}
        />
        <Metric
          label={text.labels.mode}
          value={meetingModeLabel(meeting.mode)}
          icon={
            meeting.mode === "IN_PERSON" ? (
              <MapPin className="size-4" />
            ) : (
              <Video className="size-4" />
            )
          }
        />
        <Metric
          label={text.labels.reminder}
          value={
            meeting.reminderAt
              ? formatJalaliDateTime(meeting.reminderAt)
              : text.labels.noReminder
          }
          icon={<Bell className="size-4" />}
        />
      </div>

      {(meeting.location || meeting.meetingUrl) ? (
        <div className="border-t border-[var(--app-divider)] px-4 py-4 sm:px-5">
          <div className="grid gap-3 md:grid-cols-2">
            {meeting.location ? (
              <InfoRow
                icon={<MapPin className="size-4" />}
                label={text.labels.location}
                value={meeting.location}
              />
            ) : null}
            {meeting.meetingUrl ? (
              <div className="min-w-0 rounded-xl bg-[var(--app-background)] p-3">
                <div className="flex items-start gap-3">
                  <Video className="mt-0.5 size-4 shrink-0 text-[var(--app-primary)]" />
                  <div className="min-w-0">
                    <p className="text-xs text-[var(--app-text-secondary)]">
                      {text.labels.meetingUrl}
                    </p>
                    <a
                      href={meeting.meetingUrl}
                      target="_blank"
                      rel="noreferrer"
                      dir="ltr"
                      className="mt-1 block truncate text-start text-xs font-bold text-[var(--app-primary)] hover:underline"
                    >
                      {meeting.meetingUrl}
                    </a>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </SurfaceCard>
  )
}

function ContextCard({
  meeting,
  canViewCompany,
  canViewOpportunity,
}: {
  meeting: Meeting
  canViewCompany: boolean
  canViewOpportunity: boolean
}) {
  const text = uiText.meetings.detail
  return (
    <SurfaceCard className="min-w-0 overflow-hidden">
      <SectionHeader
        icon={<BriefcaseBusiness className="size-4" />}
        title={text.sections.context}
      />
      <div className="grid gap-3 p-4">
        <ContextLink
          icon={<Building2 className="size-4" />}
          label={text.labels.company}
          value={meetingCompanyName(meeting)}
          to={
            canViewCompany && meeting.companyId
              ? `/companies/${meeting.companyId}`
              : undefined
          }
        />
        <ContextLink
          icon={<BriefcaseBusiness className="size-4" />}
          label={text.labels.opportunity}
          value={meeting.opportunity?.title || uiText.common.notAvailable}
          to={
            canViewOpportunity && meeting.opportunity?.id
              ? `/opportunities/${meeting.opportunity.id}`
              : undefined
          }
        />
      </div>
    </SurfaceCard>
  )
}

function PeopleCard({
  meeting,
  canViewPerson,
  onPersonClick,
}: {
  meeting: Meeting
  canViewPerson: boolean
  onPersonClick: (id: string) => void
}) {
  const text = uiText.meetings.detail
  const assignees = meeting.assignees?.map((item) => item.user) ?? []
  const attendees = meeting.attendees?.map((item) => item.person) ?? []

  return (
    <SurfaceCard className="min-w-0 overflow-hidden">
      <SectionHeader
        icon={<Users className="size-4" />}
        title={text.sections.people}
      />
      <div className="grid gap-4 p-4">
        <PersonBlock
          label={text.labels.organizer}
          people={meeting.organizer ? [meeting.organizer] : []}
        />
        <PersonBlock label={text.labels.assignees} people={assignees} />
        <AttendeeBlock
          label={text.labels.attendees}
          attendees={attendees}
          canOpen={canViewPerson}
          onOpen={onPersonClick}
        />
      </div>
    </SurfaceCard>
  )
}

function LifecycleCard({ meeting }: { meeting: Meeting }) {
  const text = uiText.meetings.detail
  const items = [
    meeting.createdAt
      ? {
          label: text.lifecycle.created,
          value: formatJalaliDateTime(meeting.createdAt),
        }
      : undefined,
    meeting.updatedAt
      ? {
          label: text.lifecycle.updated,
          value: formatJalaliDateTime(meeting.updatedAt),
        }
      : undefined,
    meeting.completedAt
      ? {
          label: text.lifecycle.completed,
          value: `${formatJalaliDateTime(meeting.completedAt)}${
            meeting.completedBy?.fullName
              ? ` · ${meeting.completedBy.fullName}`
              : ""
          }`,
        }
      : undefined,
    meeting.cancelledAt
      ? {
          label: text.lifecycle.cancelled,
          value: `${formatJalaliDateTime(meeting.cancelledAt)}${
            meeting.cancelledBy?.fullName
              ? ` · ${meeting.cancelledBy.fullName}`
              : ""
          }`,
        }
      : undefined,
  ].filter(Boolean) as { label: string; value: string }[]

  if (!items.length) return null

  return (
    <SurfaceCard className="min-w-0 overflow-hidden">
      <SectionHeader
        icon={<Clock3 className="size-4" />}
        title={text.sections.lifecycle}
      />
      <div className="grid gap-0 p-4">
        {items.map((item) => (
          <div
            key={item.label}
            className="relative border-s border-[var(--app-divider)] ps-5 pb-5 last:pb-0"
          >
            <span className="absolute -start-1.5 top-1 size-3 rounded-full border-2 border-[var(--app-surface)] bg-[var(--app-primary)]" />
            <p className="text-xs text-[var(--app-text-secondary)]">
              {item.label}
            </p>
            <p className="mt-1 text-xs leading-5 font-bold text-[var(--app-heading)]">
              {item.value}
            </p>
          </div>
        ))}
      </div>
    </SurfaceCard>
  )
}

function OutcomeCard({ meeting }: { meeting: Meeting }) {
  const text = uiText.meetings.detail
  if (meeting.status === "SCHEDULED") {
    return (
      <SurfaceCard className="min-w-0 overflow-hidden">
        <SectionHeader
          icon={<CheckCircle2 className="size-4" />}
          title={text.sections.outcome}
        />
        <div className="p-4 sm:p-5">
          <div className="rounded-2xl border border-dashed border-[var(--app-divider)] bg-[var(--app-background)]/55 p-5 text-center">
            <p className="text-xs leading-6 text-[var(--app-text-secondary)]">
              {text.empty.outcomeScheduled}
            </p>
          </div>
        </div>
      </SurfaceCard>
    )
  }

  const cancelled = meeting.status === "CANCELLED"
  const value = cancelled
    ? meeting.cancellationReason
    : meeting.completionNote
  const empty = cancelled
    ? text.empty.cancellationReason
    : text.empty.completionNote

  return (
    <SurfaceCard className="min-w-0 overflow-hidden">
      <SectionHeader
        icon={
          cancelled ? (
            <XCircle className="size-4" />
          ) : (
            <CheckCircle2 className="size-4" />
          )
        }
        title={
          cancelled
            ? text.sections.cancellation
            : text.sections.outcome
        }
      />
      <div className="p-4 sm:p-5">
        <p className="whitespace-pre-wrap text-xs leading-7 text-[var(--app-heading)]">
          {value?.trim() || empty}
        </p>
      </div>
    </SurfaceCard>
  )
}

function NarrativeCard({
  icon,
  title,
  value,
  empty,
}: {
  icon: ReactNode
  title: string
  value?: string | null
  empty: string
}) {
  return (
    <SurfaceCard className="min-w-0 overflow-hidden">
      <SectionHeader icon={icon} title={title} />
      <div className="p-4 sm:p-5">
        <p
          className={`whitespace-pre-wrap text-xs leading-7 ${
            value?.trim()
              ? "text-[var(--app-heading)]"
              : "text-[var(--app-text-secondary)]"
          }`}
        >
          {value?.trim() || empty}
        </p>
      </div>
    </SurfaceCard>
  )
}

function SectionHeader({
  icon,
  title,
}: {
  icon: ReactNode
  title: string
}) {
  return (
    <div className="flex items-center gap-2 border-b border-[var(--app-divider)] px-4 py-3 sm:px-5">
      <span className="text-[var(--app-primary)]">{icon}</span>
      <h2 className="text-sm font-bold text-[var(--app-heading)]">{title}</h2>
    </div>
  )
}

function Metric({
  label,
  value,
  icon,
}: {
  label: string
  value: string
  icon: ReactNode
}) {
  return (
    <div className="min-w-0 rounded-2xl bg-[var(--app-background)] p-3">
      <div className="flex items-center gap-2 text-[var(--app-primary)]">
        {icon}
        <span className="text-xs text-[var(--app-text-secondary)]">
          {label}
        </span>
      </div>
      <p className="mt-2 break-words text-xs font-bold text-[var(--app-heading)]">
        {value}
      </p>
    </div>
  )
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: ReactNode
  label: string
  value: string
}) {
  return (
    <div className="min-w-0 rounded-xl bg-[var(--app-background)] p-3">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 shrink-0 text-[var(--app-primary)]">
          {icon}
        </span>
        <div className="min-w-0">
          <p className="text-xs text-[var(--app-text-secondary)]">{label}</p>
          <p className="mt-1 break-words text-xs font-bold text-[var(--app-heading)]">
            {value}
          </p>
        </div>
      </div>
    </div>
  )
}

function ContextLink({
  icon,
  label,
  value,
  to,
}: {
  icon: ReactNode
  label: string
  value: string
  to?: string
}) {
  const body = (
    <div className="flex min-w-0 items-center gap-3">
      <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-[var(--app-primary-soft)] text-[var(--app-primary)]">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-[var(--app-text-secondary)]">{label}</p>
        <p className="mt-1 truncate text-xs font-bold text-[var(--app-heading)]">
          {value}
        </p>
      </div>
      {to ? (
        <ExternalLink className="size-3.5 shrink-0 text-[var(--app-primary)]" />
      ) : null}
    </div>
  )

  return to ? (
    <Link
      to={to}
      className="rounded-2xl border border-[var(--app-divider)] p-3 transition-colors hover:bg-[var(--app-primary-soft)]/35"
    >
      {body}
    </Link>
  ) : (
    <div className="rounded-2xl border border-[var(--app-divider)] p-3">
      {body}
    </div>
  )
}

function PersonBlock({
  label,
  people,
}: {
  label: string
  people: MeetingUser[]
}) {
  return (
    <div>
      <p className="text-xs font-bold text-[var(--app-text-secondary)]">
        {label}
      </p>
      <div className="mt-2 grid gap-2">
        {people.length ? (
          people.map((person) => (
            <PersonRow
              key={person.id}
              name={person.fullName || person.email || uiText.common.notAvailable}
              secondary={person.email}
            />
          ))
        ) : (
          <p className="text-xs text-[var(--app-text-secondary)]">
            {uiText.common.notAvailable}
          </p>
        )}
      </div>
    </div>
  )
}

function AttendeeBlock({
  label,
  attendees,
  canOpen,
  onOpen,
}: {
  label: string
  attendees: MeetingPerson[]
  canOpen: boolean
  onOpen: (id: string) => void
}) {
  return (
    <div>
      <p className="text-xs font-bold text-[var(--app-text-secondary)]">
        {label}
      </p>
      <div className="mt-2 grid gap-2">
        {attendees.length ? (
          attendees.map((person) =>
            canOpen ? (
              <button
                key={person.id}
                type="button"
                className="rounded-xl text-start transition-colors hover:bg-[var(--app-primary-soft)]/35"
                onClick={() => onOpen(person.id)}
              >
                <PersonRow
                  name={person.fullName}
                  secondary={person.title || person.jobTitle}
                />
              </button>
            ) : (
              <PersonRow
                key={person.id}
                name={person.fullName}
                secondary={person.title || person.jobTitle}
              />
            )
          )
        ) : (
          <p className="text-xs text-[var(--app-text-secondary)]">
            {uiText.common.notAvailable}
          </p>
        )}
      </div>
    </div>
  )
}

function PersonRow({
  name,
  secondary,
}: {
  name: string
  secondary?: string | null
}) {
  return (
    <div className="flex min-w-0 items-center gap-3 rounded-xl border border-[var(--app-divider)] p-2.5">
      <div className="grid size-8 shrink-0 place-items-center rounded-full bg-[var(--app-primary-soft)] text-[var(--app-primary)]">
        <UserRound className="size-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-bold text-[var(--app-heading)]">
          {name}
        </p>
        {secondary ? (
          <p className="mt-0.5 truncate text-xs text-[var(--app-text-secondary)]">
            {secondary}
          </p>
        ) : null}
      </div>
    </div>
  )
}
