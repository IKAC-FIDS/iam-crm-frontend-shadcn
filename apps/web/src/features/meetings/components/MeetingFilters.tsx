import {
  Filter,
  RotateCcw,
  Search,
  SlidersHorizontal,
} from "lucide-react"
import { useEffect, useState } from "react"

import { PersianDateRangePicker } from "@/components/shared/date"
import { uiText } from "@/config/uiText"
import { SearchableCompanySelect } from "@/features/people/components/SearchableCompanySelect"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover"

import {
  useMeetingAssignees,
  useMeetingOpportunityOptions,
  useMeetingPeopleOptions,
} from "../hooks/useMeetings"
import type {
  MeetingMode,
  MeetingStatus,
} from "../types/meeting.types"
import { MeetingOptionSelect } from "./MeetingOptionSelect"

type FilterValues = {
  search: string
  companyId?: string
  opportunityId?: string
  status?: MeetingStatus
  mode?: MeetingMode
  dateFrom?: string
  dateTo?: string
  organizerId?: string
  assignedUserId?: string
  attendeePersonId?: string
}

function useDebounced(value: string) {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = window.setTimeout(
      () => setDebounced(value),
      300
    )
    return () => window.clearTimeout(timer)
  }, [value])

  return debounced
}

export function MeetingFilters({
  values,
  onChange,
  onClear,
}: {
  values: FilterValues
  onChange: (patch: Partial<FilterValues>) => void
  onClear: () => void
}) {
  const text = uiText.meetings
  const [opportunitySearch, setOpportunitySearch] = useState("")
  const [organizerSearch, setOrganizerSearch] = useState("")
  const [assignedSearch, setAssignedSearch] = useState("")
  const [attendeeSearch, setAttendeeSearch] = useState("")

  const opportunities = useMeetingOpportunityOptions(
    values.companyId || "",
    useDebounced(opportunitySearch),
    true
  )
  const organizers = useMeetingAssignees(
    useDebounced(organizerSearch)
  )
  const assigned = useMeetingAssignees(
    useDebounced(assignedSearch)
  )
  const attendees = useMeetingPeopleOptions(
    values.companyId || "",
    useDebounced(attendeeSearch),
    true
  )

  const opportunityOptions =
    opportunities.data?.pages
      .flatMap((page) => page.data)
      .map((item) => ({
        id: item.id,
        label: item.title,
      })) || []

  const organizerOptions =
    organizers.data?.pages
      .flatMap((page) => page.data)
      .map((item) => ({
        id: item.id,
        label: item.fullName || item.email || item.id,
      })) || []

  const assignedOptions =
    assigned.data?.pages
      .flatMap((page) => page.data)
      .map((item) => ({
        id: item.id,
        label: item.fullName || item.email || item.id,
      })) || []

  const attendeeOptions =
    attendees.data?.pages
      .flatMap((page) => page.data)
      .map((item) => ({
        id: item.id,
        label: item.fullName,
      })) || []

  const range = {
    from: safeDate(values.dateFrom),
    to: safeDate(values.dateTo),
  }

  const activeAdvanced = [
    values.opportunityId,
    values.organizerId,
    values.assignedUserId,
    values.attendeePersonId,
  ].filter(Boolean).length

  return (
    <section className="rounded-[24px] border border-[var(--app-divider)] bg-[var(--app-surface)] p-3 shadow-[var(--app-shadow-card)]">
      <div className="grid gap-3 xl:grid-cols-[minmax(220px,1.3fr)_minmax(190px,1fr)_150px_150px_minmax(260px,1.25fr)_auto] xl:items-center">
        <div className="relative min-w-0">
          <Search className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-[var(--app-icon-muted)]" />
          <Input
            value={values.search}
            onChange={(event) =>
              onChange({ search: event.target.value })
            }
            placeholder={text.fields.search}
            className="h-11 rounded-xl pe-9"
          />
        </div>

        <SearchableCompanySelect
          value={values.companyId}
          onChange={(companyId) =>
            onChange({
              companyId,
              opportunityId: undefined,
              attendeePersonId: undefined,
            })
          }
        />

        <select
          value={values.status || ""}
          onChange={(event) =>
            onChange({
              status: (event.target.value ||
                undefined) as MeetingStatus | undefined,
            })
          }
          className={selectClass}
        >
          <option value="">
            {text.fields.status}: همه
          </option>
          <option value="SCHEDULED">
            {text.statuses.SCHEDULED}
          </option>
          <option value="COMPLETED">
            {text.statuses.COMPLETED}
          </option>
          <option value="CANCELLED">
            {text.statuses.CANCELLED}
          </option>
        </select>

        <select
          value={values.mode || ""}
          onChange={(event) =>
            onChange({
              mode: (event.target.value ||
                undefined) as MeetingMode | undefined,
            })
          }
          className={selectClass}
        >
          <option value="">
            {text.fields.mode}: همه
          </option>
          <option value="IN_PERSON">
            {text.modes.IN_PERSON}
          </option>
          <option value="ONLINE">
            {text.modes.ONLINE}
          </option>
          <option value="HYBRID">
            {text.modes.HYBRID}
          </option>
        </select>

        <PersianDateRangePicker
          value={range}
          onChange={(next) => {
            const from = next.from
            const to = next.to

            if (from) from.setHours(0, 0, 0, 0)
            if (to) to.setHours(23, 59, 59, 999)

            onChange({
              dateFrom: from?.toISOString(),
              dateTo: to?.toISOString(),
            })
          }}
        />

        <Popover>
          <PopoverTrigger
            render={
              <Button
                type="button"
                variant="outline"
                className="h-11 rounded-xl"
              />
            }
          >
            <SlidersHorizontal className="size-4" />
            {text.actions.filters}
            {activeAdvanced ? (
              <span className="rounded-full bg-[var(--app-primary-soft)] px-1.5 text-xs text-[var(--app-primary)]">
                {activeAdvanced.toLocaleString("fa-IR")}
              </span>
            ) : null}
          </PopoverTrigger>

          <PopoverContent
            align="end"
            dir="rtl"
            className="max-h-[75vh] w-[min(680px,calc(100vw-24px))] overflow-y-auto rounded-2xl p-4"
          >
            <div className="mb-4 flex items-center gap-2 text-sm font-bold text-[var(--app-heading)]">
              <Filter className="size-4 text-[var(--app-primary)]" />
              {text.actions.filters}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FilterField label={text.fields.opportunity}>
                <MeetingOptionSelect
                  value={values.opportunityId}
                  onChange={(option) =>
                    onChange({
                      opportunityId: option?.id,
                    })
                  }
                  options={opportunityOptions}
                  search={opportunitySearch}
                  onSearchChange={setOpportunitySearch}
                  placeholder={
                    values.companyId
                      ? text.placeholders.select
                      : text.placeholders.companyFirst
                  }
                  disabled={!values.companyId}
                  loading={opportunities.isLoading}
                  emptyText={
                    opportunities.isError
                      ? text.errors.options
                      : undefined
                  }
                  hasMore={opportunities.hasNextPage}
                  loadingMore={
                    opportunities.isFetchingNextPage
                  }
                  onLoadMore={() =>
                    void opportunities.fetchNextPage()
                  }
                />
              </FilterField>

              <FilterField label={text.fields.organizer}>
                <MeetingOptionSelect
                  value={values.organizerId}
                  onChange={(option) =>
                    onChange({
                      organizerId: option?.id,
                    })
                  }
                  options={organizerOptions}
                  search={organizerSearch}
                  onSearchChange={setOrganizerSearch}
                  placeholder={text.placeholders.select}
                  loading={organizers.isLoading}
                  emptyText={
                    organizers.isError
                      ? text.errors.options
                      : undefined
                  }
                  hasMore={organizers.hasNextPage}
                  loadingMore={
                    organizers.isFetchingNextPage
                  }
                  onLoadMore={() =>
                    void organizers.fetchNextPage()
                  }
                />
              </FilterField>

              <FilterField label={text.fields.assignedUser}>
                <MeetingOptionSelect
                  value={values.assignedUserId}
                  onChange={(option) =>
                    onChange({
                      assignedUserId: option?.id,
                    })
                  }
                  options={assignedOptions}
                  search={assignedSearch}
                  onSearchChange={setAssignedSearch}
                  placeholder={text.placeholders.select}
                  loading={assigned.isLoading}
                  emptyText={
                    assigned.isError
                      ? text.errors.options
                      : undefined
                  }
                  hasMore={assigned.hasNextPage}
                  loadingMore={assigned.isFetchingNextPage}
                  onLoadMore={() =>
                    void assigned.fetchNextPage()
                  }
                />
              </FilterField>

              <FilterField label={text.fields.attendee}>
                <MeetingOptionSelect
                  value={values.attendeePersonId}
                  onChange={(option) =>
                    onChange({
                      attendeePersonId: option?.id,
                    })
                  }
                  options={attendeeOptions}
                  search={attendeeSearch}
                  onSearchChange={setAttendeeSearch}
                  placeholder={
                    values.companyId
                      ? text.placeholders.select
                      : text.placeholders.companyFirst
                  }
                  disabled={!values.companyId}
                  loading={attendees.isLoading}
                  emptyText={
                    attendees.isError
                      ? text.errors.options
                      : undefined
                  }
                  hasMore={attendees.hasNextPage}
                  loadingMore={attendees.isFetchingNextPage}
                  onLoadMore={() =>
                    void attendees.fetchNextPage()
                  }
                />
              </FilterField>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div className="mt-3 flex justify-end">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="rounded-xl text-[var(--app-text-secondary)]"
          onClick={() => {
            setOpportunitySearch("")
            setOrganizerSearch("")
            setAssignedSearch("")
            setAttendeeSearch("")
            onClear()
          }}
        >
          <RotateCcw className="size-3.5" />
          {text.actions.clear}
        </Button>
      </div>
    </section>
  )
}

function FilterField({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="grid min-w-0 gap-2">
      <span className="text-xs font-bold text-[var(--app-heading)]">
        {label}
      </span>
      {children}
    </div>
  )
}

const selectClass =
  "h-11 w-full rounded-xl border border-input bg-transparent px-3 text-xs text-[var(--app-heading)] outline-none focus:border-[var(--app-primary)]"

function safeDate(value?: string) {
  if (!value) return undefined

  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? undefined
    : date
}

export type {
  FilterValues as MeetingFilterValues,
}
