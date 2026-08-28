import {
  FormDialogBody,
  FormDialogFooter,
} from "@/components/shared/FormDialogLayout"
import { useDebouncedValue as useDebounced } from "@/lib/useDebouncedValue"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { applyServerFieldErrors } from "@/lib/formErrors"
import { FormActions } from "@/components/shared/FormActions"
import { useEffect, useMemo, useState, type ReactNode } from "react"
import { toast } from "sonner"

import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { DialogHeroHeader } from "@/components/shared/DialogHeroHeader"
import { FormSection } from "@/components/shared/FormSection"
import { PersianDateTimePicker } from "@/components/shared/PersianDateTimePicker"
import { SearchableCompanySelect } from "@/features/people/components/SearchableCompanySelect"
import { uiText } from "@/config/uiText"
import { getApiErrorMessage } from "@/lib/apiResponse"
import { Dialog, DialogContent } from "@workspace/ui/components/dialog"
import { Input } from "@workspace/ui/components/input"

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

const formSchema = z.object({
  companyId: z.string().min(1, uiText.meetings.validation.companyRequired),
  opportunity: z.custom<MeetingSelectOption>().optional(),
  title: z.string().trim().min(1, uiText.meetings.validation.titleRequired),
  agenda: z.string(),
  description: z.string(),
  mode: z.enum(["IN_PERSON", "ONLINE", "HYBRID"]),
  meetingTypeId: z.string(),
  location: z.string(),
  meetingUrl: z.string(),
  startAt: z.date().optional(),
  endAt: z.date().optional(),
  reminderPreset: z.enum(["none", "15", "30", "60", "120", "1440", "custom"]),
  customReminder: z.date().optional(),
  assignees: z.array(z.custom<MeetingSelectOption>()),
  attendees: z.array(z.custom<MeetingSelectOption>()),
})
type FormValues = z.infer<typeof formSchema>

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
  const defaultValues = useMemo<FormValues>(() => {
    const schedule = initialSchedule()
    const preset = reminderPresetFor(meeting)
    return {
      companyId: meeting?.companyId || initialCompanyId || "",
      opportunity: meeting?.opportunity
        ? { id: meeting.opportunity.id, label: meeting.opportunity.title }
        : initialOpportunity
          ? { id: initialOpportunity.id, label: initialOpportunity.title }
          : undefined,
      title: meeting?.title || "",
      agenda: meeting?.agenda || "",
      description: meeting?.description || "",
      mode: meeting?.mode || "IN_PERSON",
      meetingTypeId: meeting?.meetingTypeId || meeting?.type?.id || "",
      location: meeting?.location || "",
      meetingUrl: meeting?.meetingUrl || "",
      startAt: meeting?.startAt ? new Date(meeting.startAt) : schedule.start,
      endAt: meeting?.endAt ? new Date(meeting.endAt) : schedule.end,
      reminderPreset: preset,
      customReminder: meeting?.reminderAt
        ? new Date(meeting.reminderAt)
        : undefined,
      assignees:
        meeting?.assignees?.map(({ user }) => ({
          id: user.id,
          label: user.fullName || user.email || user.id,
          secondary: user.email || undefined,
        })) || [],
      attendees:
        meeting?.attendees?.map(({ person }) => ({
          id: person.id,
          label: person.fullName,
          secondary: person.title || person.jobTitle || undefined,
        })) || [],
    }
  }, [initialCompanyId, initialOpportunity, meeting])
  const {
    control,
    register,
    setValue,
    reset,
    setError,
    clearErrors,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ defaultValues, resolver: zodResolver(formSchema) })
  const {
    companyId,
    opportunity,
    title,
    agenda,
    description,
    mode,
    meetingTypeId,
    location,
    meetingUrl,
    startAt,
    endAt,
    reminderPreset,
    customReminder,
    assignees,
    attendees,
  } = useWatch({ control }) as FormValues
  const setCompanyId = (value: FormValues["companyId"]) =>
    setValue("companyId", value, { shouldDirty: true, shouldValidate: true })
  const setOpportunity = (value: FormValues["opportunity"]) =>
    setValue("opportunity", value, { shouldDirty: true, shouldValidate: true })
  const setTitle = (value: FormValues["title"]) =>
    setValue("title", value, { shouldDirty: true, shouldValidate: true })
  const setAgenda = (value: FormValues["agenda"]) =>
    setValue("agenda", value, { shouldDirty: true, shouldValidate: true })
  const setDescription = (value: FormValues["description"]) =>
    setValue("description", value, { shouldDirty: true, shouldValidate: true })
  const setMode = (value: FormValues["mode"]) =>
    setValue("mode", value, { shouldDirty: true, shouldValidate: true })
  const setMeetingTypeId = (value: FormValues["meetingTypeId"]) =>
    setValue("meetingTypeId", value, {
      shouldDirty: true,
      shouldValidate: true,
    })
  const setLocation = (value: FormValues["location"]) =>
    setValue("location", value, { shouldDirty: true, shouldValidate: true })
  const setMeetingUrl = (value: FormValues["meetingUrl"]) =>
    setValue("meetingUrl", value, { shouldDirty: true, shouldValidate: true })
  const setStartAt = (value: FormValues["startAt"]) =>
    setValue("startAt", value, { shouldDirty: true, shouldValidate: true })
  const setEndAt = (value: FormValues["endAt"]) =>
    setValue("endAt", value, { shouldDirty: true, shouldValidate: true })
  const setReminderPreset = (value: FormValues["reminderPreset"]) =>
    setValue("reminderPreset", value, {
      shouldDirty: true,
      shouldValidate: true,
    })
  const setCustomReminder = (value: FormValues["customReminder"]) =>
    setValue("customReminder", value, {
      shouldDirty: true,
      shouldValidate: true,
    })
  const setAssignees = (value: FormValues["assignees"]) =>
    setValue("assignees", value, { shouldDirty: true, shouldValidate: true })
  const setAttendees = (value: FormValues["attendees"]) =>
    setValue("attendees", value, { shouldDirty: true, shouldValidate: true })
  const [previousOpen, setPreviousOpen] = useState(open)
  const [opportunitySearch, setOpportunitySearch] = useState("")
  const [assigneeSearch, setAssigneeSearch] = useState("")
  const [attendeeSearch, setAttendeeSearch] = useState("")
  const [pendingCompany, setPendingCompany] = useState<string | undefined>()
  if (previousOpen !== open) {
    setPreviousOpen(open)
    if (open) {
      setOpportunitySearch("")
      setAssigneeSearch("")
      setAttendeeSearch("")
      setPendingCompany(undefined)
    }
  }
  useEffect(() => {
    if (open) {
      const schedule = initialSchedule()
      reset(
        meeting
          ? defaultValues
          : { ...defaultValues, startAt: schedule.start, endAt: schedule.end }
      )
    }
  }, [open, defaultValues, reset, meeting])

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
    clearErrors()
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
      applyServerFieldErrors(
        error,
        setError,
        [
          "companyId",
          "opportunity",
          "title",
          "agenda",
          "description",
          "mode",
          "meetingTypeId",
          "location",
          "meetingUrl",
          "startAt",
          "endAt",
          "reminderPreset",
          "customReminder",
          "assignees",
          "attendees",
        ],
        {
          opportunityId: "opportunity",
          assigneeUserIds: "assignees",
          attendeePersonIds: "attendees",
          reminderAt: "customReminder",
        }
      )
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
          <form className="contents" noValidate onSubmit={handleSubmit(submit)}>
            <FormDialogBody>
              {errors.root?.server?.message ? (
                <p role="alert" className="text-sm text-destructive">
                  {errors.root.server.message}
                </p>
              ) : null}
              <FormSection
                title={text.sections.context}
                description={text.sections.contextDescription}
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field
                    label={text.fields.company}
                    error={errors.companyId?.message}
                  >
                    <SearchableCompanySelect
                      value={companyId || undefined}
                      onChange={requestCompany}
                      allowEmpty={false}
                      disabled={lockCompany}
                    />
                  </Field>
                  <Field
                    label={text.fields.opportunity}
                    error={errors.opportunity?.message}
                  >
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
                  <Field
                    label={text.fields.title}
                    error={errors.title?.message}
                  >
                    <Input
                      {...register("title")}
                      aria-invalid={Boolean(errors.title)}
                      value={title}
                      maxLength={200}
                      onChange={(event) => setTitle(event.target.value)}
                      className="h-11 rounded-xl"
                    />
                  </Field>
                  <Field
                    label={text.fields.type}
                    error={errors.meetingTypeId?.message}
                  >
                    <select
                      {...register("meetingTypeId")}
                      aria-invalid={Boolean(errors.meetingTypeId)}
                      value={meetingTypeId}
                      onChange={(event) => setMeetingTypeId(event.target.value)}
                      className={selectClass}
                    >
                      <option value="">{text.placeholders.select}</option>
                      {(meetingTypes.data ?? []).map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field
                      label={text.fields.agenda}
                      error={errors.agenda?.message}
                    >
                      <textarea
                        {...register("agenda")}
                        aria-invalid={Boolean(errors.agenda)}
                        rows={3}
                        value={agenda}
                        onChange={(event) => setAgenda(event.target.value)}
                        className="w-full rounded-xl border border-input bg-transparent p-3 text-sm"
                      />
                    </Field>
                    <Field
                      label={text.fields.description}
                      error={errors.description?.message}
                    >
                      <textarea
                        {...register("description")}
                        aria-invalid={Boolean(errors.description)}
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
                  <Field
                    label={text.fields.startAt}
                    error={errors.startAt?.message}
                  >
                    <PersianDateTimePicker
                      value={startAt}
                      onChange={setStartAt}
                    />
                  </Field>
                  <Field
                    label={text.fields.endAt}
                    error={errors.endAt?.message}
                  >
                    <PersianDateTimePicker value={endAt} onChange={setEndAt} />
                  </Field>
                  <Field
                    label={text.fields.reminder}
                    error={errors.reminderPreset?.message}
                  >
                    <select
                      {...register("reminderPreset")}
                      aria-invalid={Boolean(errors.reminderPreset)}
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
                    <Field
                      label={text.fields.customReminder}
                      error={errors.customReminder?.message}
                    >
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
                  <Field label={text.fields.mode} error={errors.mode?.message}>
                    <select
                      {...register("mode")}
                      aria-invalid={Boolean(errors.mode)}
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
                    <Field
                      label={text.fields.location}
                      error={errors.location?.message}
                    >
                      <Input
                        {...register("location")}
                        aria-invalid={Boolean(errors.location)}
                        value={location}
                        onChange={(event) => setLocation(event.target.value)}
                        className="h-11 rounded-xl"
                      />
                    </Field>
                  ) : null}
                  {mode === "ONLINE" || mode === "HYBRID" ? (
                    <Field
                      label={text.fields.meetingUrl}
                      error={errors.meetingUrl?.message}
                    >
                      <Input
                        {...register("meetingUrl")}
                        aria-invalid={Boolean(errors.meetingUrl)}
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
                  <Field
                    label={text.fields.assignees}
                    error={errors.assignees?.message}
                  >
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
                  <Field
                    label={text.fields.attendees}
                    error={errors.attendees?.message}
                  >
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
                      emptyText={
                        people.isError ? text.errors.options : undefined
                      }
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
            </FormDialogBody>
            <FormDialogFooter>
              <FormActions
                onCancel={() => onOpenChange(false)}
                pending={pending}
                disabled={Boolean(validation)}
              />
            </FormDialogFooter>
          </form>
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

function Field({
  label,
  children,
  error,
}: {
  label: string
  children: ReactNode
  error?: string
}) {
  return (
    <label className="grid min-w-0 gap-2">
      <span className="text-xs text-[var(--app-heading)]">{label}</span>
      {children}
      {error ? (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      ) : null}
    </label>
  )
}

const selectClass =
  "h-11 w-full rounded-xl border border-input bg-transparent px-3 text-sm text-[var(--app-heading)] outline-none focus:ring-2 focus:ring-ring"
