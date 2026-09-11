import { useDebouncedValue as useDebounced } from "@/lib/useDebouncedValue"
import { DataTableToolbar } from "@/components/shared/DataTableToolbar"
import { useState } from "react"

import { AdvancedFilterPopover } from "@/components/shared/AdvancedFilterPopover"
import { PersianDateRangePicker } from "@/components/shared/date"
import { SearchableOptionSelect } from "@/components/shared/SearchableOptionSelect"
import { uiText } from "@/config/uiText"
import { SearchableCompanySelect } from "@/features/people/components/SearchableCompanySelect"

import {
  useMeetingAssignees,
  useMeetingOpportunityOptions,
  useMeetingPeopleOptions,
  useMeetingTypes,
} from "../hooks/useMeetings"
import type { MeetingMode, MeetingStatus } from "../types/meeting.types"
import { MeetingOptionSelect } from "./MeetingOptionSelect"

type FilterValues = {
  search: string
  companyId?: string
  opportunityId?: string
  status?: MeetingStatus
  mode?: MeetingMode
  meetingTypeId?: string
  dateFrom?: string
  dateTo?: string
  organizerId?: string
  assignedUserId?: string
  attendeePersonId?: string
}

export function MeetingFilters({
  values,
  onChange,
  onClear,
  quickFilters,
}: {
  values: FilterValues
  onChange: (patch: Partial<FilterValues>) => void
  onClear: () => void
  quickFilters?: React.ReactNode
}) {
  const text = uiText.meetings
  const [opportunitySearch, setOpportunitySearch] = useState("")
  const [organizerSearch, setOrganizerSearch] = useState("")
  const [assignedSearch, setAssignedSearch] = useState("")
  const [attendeeSearch, setAttendeeSearch] = useState("")
  const [advancedOpen, setAdvancedOpen] = useState(false)

  const opportunities = useMeetingOpportunityOptions(
    values.companyId || "",
    useDebounced(opportunitySearch),
    true
  )
  const organizers = useMeetingAssignees(useDebounced(organizerSearch))
  const assigned = useMeetingAssignees(useDebounced(assignedSearch))
  const attendees = useMeetingPeopleOptions(
    values.companyId || "",
    useDebounced(attendeeSearch),
    true
  )
  const meetingTypes = useMeetingTypes()

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

  const hasActiveFilters = Boolean(
    values.search ||
    values.companyId ||
    values.status ||
    values.mode ||
    values.dateFrom ||
    values.dateTo ||
    values.meetingTypeId ||
    activeAdvanced
  )

  return (
    <DataTableToolbar
      searchValue={values.search}
      onSearchChange={(value) => onChange({ search: value })}
      searchPlaceholder={text.fields.search}
      hasActiveFilters={hasActiveFilters}
      onClearFilters={() => {
        setOpportunitySearch("")
        setOrganizerSearch("")
        setAssignedSearch("")
        setAttendeeSearch("")
        onClear()
      }}
      filtersClassName="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3"
      quickFilters={quickFilters}
      filters={
        <>
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

          <SearchableOptionSelect
            value={values.meetingTypeId || ""}
            options={(meetingTypes.data ?? []).map((item) => ({
              id: item.id,
              label: item.label,
            }))}
            onChange={(meetingTypeId) => onChange({ meetingTypeId })}
            search=""
            onSearchChange={() => undefined}
            placeholder={`${text.fields.type}: همه`}
            ariaLabel={text.fields.type}
            loading={meetingTypes.isLoading}
            searchable={false}
          />

          <SearchableOptionSelect
            value={values.status}
            options={(
              ["SCHEDULED", "COMPLETED", "CANCELLED"] as MeetingStatus[]
            ).map((id) => ({ id, label: text.statuses[id] }))}
            onChange={(status) =>
              onChange({ status: status as MeetingStatus | undefined })
            }
            search=""
            onSearchChange={() => undefined}
            placeholder={`${text.fields.status}: همه`}
            ariaLabel={text.fields.status}
            searchable={false}
          />

          <SearchableOptionSelect
            value={values.mode}
            options={(["IN_PERSON", "ONLINE", "HYBRID"] as MeetingMode[]).map(
              (id) => ({ id, label: text.modes[id] })
            )}
            onChange={(mode) =>
              onChange({ mode: mode as MeetingMode | undefined })
            }
            search=""
            onSearchChange={() => undefined}
            placeholder={`${text.fields.mode}: همه`}
            ariaLabel={text.fields.mode}
            searchable={false}
          />

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

          <AdvancedFilterPopover
            open={advancedOpen}
            onOpenChange={setAdvancedOpen}
            activeCount={activeAdvanced}
            label={text.actions.filters}
            onClear={() =>
              onChange({
                opportunityId: undefined,
                organizerId: undefined,
                assignedUserId: undefined,
                attendeePersonId: undefined,
              })
            }
          >
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
                    opportunities.isError ? text.errors.options : undefined
                  }
                  hasMore={opportunities.hasNextPage}
                  loadingMore={opportunities.isFetchingNextPage}
                  onLoadMore={() => void opportunities.fetchNextPage()}
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
                    organizers.isError ? text.errors.options : undefined
                  }
                  hasMore={organizers.hasNextPage}
                  loadingMore={organizers.isFetchingNextPage}
                  onLoadMore={() => void organizers.fetchNextPage()}
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
                  emptyText={assigned.isError ? text.errors.options : undefined}
                  hasMore={assigned.hasNextPage}
                  loadingMore={assigned.isFetchingNextPage}
                  onLoadMore={() => void assigned.fetchNextPage()}
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
                    attendees.isError ? text.errors.options : undefined
                  }
                  hasMore={attendees.hasNextPage}
                  loadingMore={attendees.isFetchingNextPage}
                  onLoadMore={() => void attendees.fetchNextPage()}
                />
              </FilterField>
            </div>
          </AdvancedFilterPopover>
        </>
      }
    />
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

function safeDate(value?: string) {
  if (!value) return undefined

  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? undefined : date
}

export type { FilterValues as MeetingFilterValues }
