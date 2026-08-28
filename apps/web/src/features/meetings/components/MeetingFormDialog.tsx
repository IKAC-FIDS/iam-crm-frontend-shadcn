import { Loader2, Save } from "lucide-react"
import { useEffect, useMemo, useState, type ReactNode } from "react"
import { toast } from "sonner"

import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { DialogHeroHeader } from "@/components/shared/DialogHeroHeader"
import { FormSection } from "@/components/shared/FormSection"
import { PersianDateTimePicker } from "@/components/shared/PersianDateTimePicker"
import { SearchableCompanySelect } from "@/features/people/components/SearchableCompanySelect"
import { uiText } from "@/config/uiText"
import { getApiErrorMessage } from "@/lib/apiResponse"
import { Button } from "@workspace/ui/components/button"
import { Dialog, DialogContent } from "@workspace/ui/components/dialog"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"

import {
  useCreateMeeting,
  useMeetingAssignees,
  useMeetingOpportunityOptions,
  useMeetingPeopleOptions,
  useMeetingTypes,
  useUpdateMeeting,
} from "../hooks/useMeetings"
import type {
  Meeting,
  MeetingMode,
  MeetingOpportunityOption,
  MeetingPayload,
} from "../types/meeting.types"
import {
  MeetingMultiOptionSelect,
  MeetingOptionSelect,
  type MeetingSelectOption,
} from "./MeetingOptionSelect"

type ReminderPreset = "none" | "15" | "30" | "60" | "120" | "1440" | "custom"

function useDebounced(value: string) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), 300)
    return () => window.clearTimeout(timer)
  }, [value])
  return debounced
}

function initialSchedule() {
  const start = new Date()
  start.setSeconds(0, 0)
  start.setMinutes(start.getMinutes() < 30 ? 30 : 60)
  const end = new Date(start.getTime() + 60 * 60_000)
  return { start, end }
}

function reminderPresetFor(meeting?: Meeting | null): ReminderPreset {
  if (!meeting?.reminderAt) return "none"
  const minutes = Math.round(
    (new Date(meeting.startAt).getTime() -
      new Date(meeting.reminderAt).getTime()) /
      60_000
  )
  return [15, 30, 60, 120, 1440].includes(minutes)
    ? (String(minutes) as ReminderPreset)
    : "custom"
}

export function MeetingFormDialog({
  open,
  onOpenChange,
  meeting,
  initialCompanyId,
  initialOpportunity,
  lockCompany = false,
  lockOpportunity = false,
  onSaved,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  meeting?: Meeting | null
  initialCompanyId?: string
  initialOpportunity?: MeetingOpportunityOption
  lockCompany?: boolean
  lockOpportunity?: boolean
  onSaved?: (meeting: Meeting) => void
}) {
  const text = uiText.meetings
  const create = useCreateMeeting()
  const update = useUpdateMeeting()
  const pending = create.isPending || update.isPending
  const [companyId, setCompanyId] = useState("")
  const [opportunity, setOpportunity] = useState<MeetingSelectOption>()
  const [title, setTitle] = useState("")
  const [agenda, setAgenda] = useState("")
  const [description, setDescription] = useState("")
  const [mode, setMode] = useState<MeetingMode>("IN_PERSON")
  const [meetingTypeId, setMeetingTypeId] = useState("")
  const [location, setLocation] = useState("")
  const [meetingUrl, setMeetingUrl] = useState("")
  const [startAt, setStartAt] = useState<Date>()
  const [endAt, setEndAt] = useState<Date>()
  const [reminderPreset, setReminderPreset] = useState<ReminderPreset>("none")
  const [customReminder, setCustomReminder] = useState<Date>()
  const [assignees, setAssignees] = useState<MeetingSelectOption[]>([])
  const [attendees, setAttendees] = useState<MeetingSelectOption[]>([])
  const [opportunitySearch, setOpportunitySearch] = useState("")
  const [assigneeSearch, setAssigneeSearch] = useState("")
  const [attendeeSearch, setAttendeeSearch] = useState("")
  const [pendingCompany, setPendingCompany] = useState<string | undefined>()

  const resetInputs0 = [initialCompanyId, initialOpportunity?.id, initialOpportunity?.title, meeting, open] as const
  const [previousResetInputs0, setPreviousResetInputs0] = useState<typeof resetInputs0 | null>(null)
  if (previousResetInputs0 === null || previousResetInputs0[0] !== resetInputs0[0] || previousResetInputs0[1] !== resetInputs0[1] || previousResetInputs0[2] !== resetInputs0[2] || previousResetInputs0[3] !== resetInputs0[3] || previousResetInputs0[4] !== resetInputs0[4]) {
    setPreviousResetInputs0(resetInputs0)
    if (open) {
const schedule = initialSchedule()
    const preset = reminderPresetFor(meeting)
    setCompanyId(meeting?.companyId || initialCompanyId || "")
    setOpportunity(
      meeting?.opportunity
        ? { id: meeting.opportunity.id, label: meeting.opportunity.title }
        : initialOpportunity
          ? { id: initialOpportunity.id, label: initialOpportunity.title }
          : undefined
    )
    setTitle(meeting?.title || "")
    setAgenda(meeting?.agenda || "")
    setDescription(meeting?.description || "")
    setMode(meeting?.mode || "IN_PERSON")
    setMeetingTypeId(meeting?.meetingTypeId || meeting?.type?.id || "")
    setLocation(meeting?.location || "")
    setMeetingUrl(meeting?.meetingUrl || "")
    setStartAt(meeting?.startAt ? new Date(meeting.startAt) : schedule.start)
    setEndAt(meeting?.endAt ? new Date(meeting.endAt) : schedule.end)
    setReminderPreset(preset)
    setCustomReminder(
      meeting?.reminderAt ? new Date(meeting.reminderAt) : undefined
    )
    setAssignees(
      meeting?.assignees?.map(({ user }) => ({
        id: user.id,
        label: user.fullName || user.email || user.id,
        secondary: user.email || undefined,
      })) || []
    )
    setAttendees(
      meeting?.attendees?.map(({ person }) => ({
        id: person.id,
        label: person.fullName,
        secondary: person.title || person.jobTitle || undefined,
      })) || []
    )
    setOpportunitySearch("")
    setAssigneeSearch("")
    setAttendeeSearch("")
}
  }

  const debouncedOpportunity = useDebounced(opportunitySearch)
  const debouncedAssignee = useDebounced(assigneeSearch)
  const debouncedAttendee = useDebounced(attendeeSearch)
  const opportunities = useMeetingOpportunityOptions(
    companyId,
    debouncedOpportunity,
    open
  )
  const assigneeQuery = useMeetingAssignees(debouncedAssignee, open)
  const people = useMeetingPeopleOptions(companyId, debouncedAttendee, open)
  const meetingTypes = useMeetingTypes(open)

  const opportunityOptions = useMemo(
    () =>
      opportunities.data?.pages
        .flatMap((page) => page.data)
        .map((item) => ({ id: item.id, label: item.title })) || [],
    [opportunities.data]
  )
  const assigneeOptions = useMemo(
    () =>
      assigneeQuery.data?.pages
        .flatMap((page) => page.data)
        .map((item) => ({
          id: item.id,
          label: item.fullName || item.email || item.id,
          secondary: item.email || undefined,
        })) || [],
    [assigneeQuery.data]
  )
  const attendeeOptions = useMemo(
    () =>
      people.data?.pages
        .flatMap((page) => page.data)
        .map((item) => ({
          id: item.id,
          label: item.fullName,
          secondary: item.title || item.jobTitle || undefined,
        })) || [],
    [people.data]
  )

  const reminderAt = useMemo(() => {
    if (reminderPreset === "none" || !startAt) return undefined
    if (reminderPreset === "custom") return customReminder
    return new Date(startAt.getTime() - Number(reminderPreset) * 60_000)
  }, [customReminder, reminderPreset, startAt])

  const validation = useMemo(() => {
    if (!companyId) return text.validation.companyRequired
    if (
      meeting?.opportunityId &&
      companyId !== meeting.companyId &&
      !opportunity
    )
      return text.validation.opportunityRequiredAfterCompanyChange
    if (!title.trim()) return text.validation.titleRequired
    if (!startAt) return text.validation.startRequired
    if (!endAt) return text.validation.endRequired
    if (endAt <= startAt) return text.validation.endAfterStart
    if (reminderPreset === "custom" && !customReminder)
      return text.validation.reminderRequired
    if (reminderAt && reminderAt >= startAt)
      return text.validation.reminderBeforeStart
    if (reminderAt && startAt > new Date() && reminderAt < new Date())
      return text.validation.reminderPast
    if (
      mode !== "IN_PERSON" &&
      meetingUrl.trim() &&
      !/^https?:\/\/\S+$/i.test(meetingUrl.trim())
    )
      return text.validation.urlInvalid
    return ""
  }, [
    companyId,
    customReminder,
    endAt,
    meeting,
    meetingUrl,
    mode,
    opportunity,
    reminderAt,
    reminderPreset,
    startAt,
    text.validation,
    title,
  ])

  function applyCompany(next?: string) {
    setCompanyId(next || "")
    setOpportunity(undefined)
    setAttendees([])
    setOpportunitySearch("")
    setAttendeeSearch("")
    setPendingCompany(undefined)
  }

  function requestCompany(next?: string) {
    if (next === companyId) return
    if (opportunity || attendees.length) setPendingCompany(next || "")
    else applyCompany(next)
  }

  async function submit() {
    if (validation || !startAt || !endAt) return
    const payload: MeetingPayload = {
      companyId,
      opportunityId: opportunity?.id,
      title: title.trim(),
      meetingTypeId: meetingTypeId || undefined,
      agenda: agenda.trim() || undefined,
      description: description.trim() || undefined,
      mode,
      location: location.trim() || undefined,
      meetingUrl: meetingUrl.trim() || undefined,
      startAt: startAt.toISOString(),
      endAt: endAt.toISOString(),
      reminderAt: reminderAt?.toISOString(),
      assigneeUserIds: assignees.map((item) => item.id),
      attendeePersonIds: attendees.map((item) => item.id),
    }
    try {
      const saved = meeting
        ? await update.mutateAsync({
            id: meeting.id,
            payload,
            previous: meeting,
          })
        : await create.mutateAsync(payload)
      toast.success(meeting ? text.feedback.updated : text.feedback.created)
      onSaved?.(saved)
      onOpenChange(false)
    } catch (error) {
      toast.error(getApiErrorMessage(error, text.errors.mutation))
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          showCloseButton={false}
          dir="rtl"
          className="max-h-[94vh] w-full max-w-[calc(100%_-_1rem)] min-w-0 grid-rows-[auto_minmax(0,1fr)_auto] gap-0 overflow-hidden rounded-[26px] p-0 sm:max-w-[900px]"
        >
          <DialogHeroHeader
            title={meeting ? text.dialogs.editTitle : text.dialogs.createTitle}
            description={text.description}
            onClose={() => onOpenChange(false)}
          />
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto bg-[var(--app-background)]/45 p-4 sm:p-5">
            <FormSection
              title={text.sections.context}
              description={text.sections.contextDescription}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label={text.fields.company}>
                  <SearchableCompanySelect
                    value={companyId || undefined}
                    onChange={requestCompany}
                    allowEmpty={false}
                    disabled={lockCompany}
                  />
                </Field>
                <Field label={text.fields.opportunity}>
                  <MeetingOptionSelect
                    value={opportunity?.id}
                    selectedOption={opportunity}
                    onChange={setOpportunity}
                    options={opportunityOptions}
                    search={opportunitySearch}
                    onSearchChange={setOpportunitySearch}
                    placeholder={
                      companyId
                        ? text.placeholders.select
                        : text.placeholders.companyFirst
                    }
                    disabled={!companyId || lockOpportunity}
                    allowEmpty={!meeting?.opportunityId}
                    loading={opportunities.isLoading}
                    emptyText={
                      opportunities.isError ? text.errors.options : undefined
                    }
                    hasMore={opportunities.hasNextPage}
                    loadingMore={opportunities.isFetchingNextPage}
                    onLoadMore={() => void opportunities.fetchNextPage()}
                  />
                </Field>
              </div>
            </FormSection>

            <FormSection
              title={text.sections.meeting}
              description={text.sections.meetingDescription}
            >
              <div className="grid gap-4">
                <Field label={text.fields.title}>
                  <Input
                    value={title}
                    maxLength={200}
                    onChange={(event) => setTitle(event.target.value)}
                    className="h-11 rounded-xl"
                  />
                </Field>
                <Field label={text.fields.type}>
                  <select value={meetingTypeId} onChange={(event) => setMeetingTypeId(event.target.value)} className={selectClass}>
                    <option value="">{text.placeholders.select}</option>
                    {(meetingTypes.data ?? []).map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
                  </select>
                </Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label={text.fields.agenda}>
                    <textarea
                      rows={3}
                      value={agenda}
                      onChange={(event) => setAgenda(event.target.value)}
                      className="w-full rounded-xl border border-input bg-transparent p-3 text-sm"
                    />
                  </Field>
                  <Field label={text.fields.description}>
                    <textarea
                      rows={3}
                      value={description}
                      onChange={(event) => setDescription(event.target.value)}
                      className="w-full rounded-xl border border-input bg-transparent p-3 text-sm"
                    />
                  </Field>
                </div>
              </div>
            </FormSection>

            <FormSection
              title={text.sections.schedule}
              description={text.sections.scheduleDescription}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label={text.fields.startAt}>
                  <PersianDateTimePicker
                    value={startAt}
                    onChange={setStartAt}
                  />
                </Field>
                <Field label={text.fields.endAt}>
                  <PersianDateTimePicker value={endAt} onChange={setEndAt} />
                </Field>
                <Field label={text.fields.reminder}>
                  <select
                    value={reminderPreset}
                    onChange={(event) =>
                      setReminderPreset(event.target.value as ReminderPreset)
                    }
                    className={selectClass}
                  >
                    <option
                      value="none"
                      disabled={Boolean(meeting?.reminderAt)}
                    >
                      {text.reminders.none}
                    </option>
                    <option value="15">{text.reminders.minutes15}</option>
                    <option value="30">{text.reminders.minutes30}</option>
                    <option value="60">{text.reminders.hour1}</option>
                    <option value="120">{text.reminders.hours2}</option>
                    <option value="1440">{text.reminders.day1}</option>
                    <option value="custom">{text.reminders.custom}</option>
                  </select>
                </Field>
                {reminderPreset === "custom" ? (
                  <Field label={text.fields.customReminder}>
                    <PersianDateTimePicker
                      value={customReminder}
                      onChange={setCustomReminder}
                    />
                  </Field>
                ) : null}
              </div>
            </FormSection>

            <FormSection
              title={text.sections.delivery}
              description={text.sections.deliveryDescription}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label={text.fields.mode}>
                  <select
                    value={mode}
                    onChange={(event) =>
                      setMode(event.target.value as MeetingMode)
                    }
                    className={selectClass}
                  >
                    <option value="IN_PERSON">{text.modes.IN_PERSON}</option>
                    <option value="ONLINE">{text.modes.ONLINE}</option>
                    <option value="HYBRID">{text.modes.HYBRID}</option>
                  </select>
                </Field>
                {mode === "IN_PERSON" || mode === "HYBRID" ? (
                  <Field label={text.fields.location}>
                    <Input
                      value={location}
                      onChange={(event) => setLocation(event.target.value)}
                      className="h-11 rounded-xl"
                    />
                  </Field>
                ) : null}
                {mode === "ONLINE" || mode === "HYBRID" ? (
                  <Field label={text.fields.meetingUrl}>
                    <Input
                      dir="ltr"
                      value={meetingUrl}
                      onChange={(event) => setMeetingUrl(event.target.value)}
                      className="h-11 rounded-xl text-left"
                    />
                  </Field>
                ) : null}
              </div>
            </FormSection>

            <FormSection
              title={text.sections.people}
              description={text.sections.peopleDescription}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label={text.fields.assignees}>
                  <MeetingMultiOptionSelect
                    value={assignees}
                    onChange={setAssignees}
                    options={assigneeOptions}
                    search={assigneeSearch}
                    onSearchChange={setAssigneeSearch}
                    placeholder={text.placeholders.select}
                    loading={assigneeQuery.isLoading}
                    emptyText={
                      assigneeQuery.isError ? text.errors.options : undefined
                    }
                    hasMore={assigneeQuery.hasNextPage}
                    loadingMore={assigneeQuery.isFetchingNextPage}
                    onLoadMore={() => void assigneeQuery.fetchNextPage()}
                  />
                </Field>
                <Field label={text.fields.attendees}>
                  <MeetingMultiOptionSelect
                    value={attendees}
                    onChange={setAttendees}
                    options={attendeeOptions}
                    search={attendeeSearch}
                    onSearchChange={setAttendeeSearch}
                    placeholder={
                      companyId
                        ? text.placeholders.select
                        : text.placeholders.companyFirst
                    }
                    disabled={!companyId}
                    loading={people.isLoading}
                    emptyText={people.isError ? text.errors.options : undefined}
                    hasMore={people.hasNextPage}
                    loadingMore={people.isFetchingNextPage}
                    onLoadMore={() => void people.fetchNextPage()}
                  />
                </Field>
              </div>
            </FormSection>
            {validation ? (
              <p className="rounded-xl border border-[var(--warning)]/25 bg-[var(--warning-light)] p-3 text-xs text-[var(--warning)]">
                {validation}
              </p>
            ) : null}
          </div>
          <div className="flex flex-col-reverse gap-2 border-t border-[var(--app-divider)] bg-[var(--app-surface)] px-5 py-4 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              className="rounded-xl"
              disabled={pending}
              onClick={() => onOpenChange(false)}
            >
              {uiText.common.cancel}
            </Button>
            <Button
              type="button"
              className="rounded-xl bg-[var(--app-primary)]"
              disabled={pending || Boolean(validation)}
              onClick={() => void submit()}
            >
              {pending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              {text.actions.save}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <ConfirmDialog
        open={pendingCompany !== undefined}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) setPendingCompany(undefined)
        }}
        title={text.dialogs.companyChangeTitle}
        description={text.dialogs.companyChangeDescription}
        tone="primary"
        onConfirm={() => applyCompany(pendingCompany)}
      />
    </>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid min-w-0 gap-2">
      <Label className="text-xs text-[var(--app-heading)]">{label}</Label>
      {children}
    </div>
  )
}

const selectClass =
  "h-11 w-full rounded-xl border border-input bg-transparent px-3 text-sm text-[var(--app-heading)] outline-none focus:ring-2 focus:ring-ring"
