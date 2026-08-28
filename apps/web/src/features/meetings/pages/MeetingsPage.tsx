import { EntityListPage } from "@/components/shared/EntityListPage"
import { PageHero } from "@/components/shared/PageHero"
import { CalendarDays, LayoutList, Plus } from "lucide-react"
import { useMemo, useState } from "react"
import { useListQueryState } from "@/lib/listQuery"
import { useDebouncedValue } from "@/lib/useDebouncedValue"
import { QueryContent } from "@/components/shared/QueryContent"

import { ErrorState } from "@/components/shared/ErrorState"
import { PaginationControls } from "@/components/shared/PaginationControls"
import { uiText } from "@/config/uiText"
import { useAuthStore } from "@/store/authStore"
import { Button } from "@workspace/ui/components/button"

import { MeetingAgenda } from "../components/MeetingAgenda"
import {
  MeetingFilters,
  type MeetingFilterValues,
} from "../components/MeetingFilters"
import { MeetingFormDialog } from "../components/MeetingFormDialog"
import { MeetingList } from "../components/MeetingList"
import { MeetingStatusActionDialog } from "../components/MeetingStatusActionDialog"
import { useMeetings } from "../hooks/useMeetings"
import type {
  Meeting,
  MeetingMode,
  MeetingQuery,
  MeetingStatus,
} from "../types/meeting.types"
import { localDayRange } from "../utils/meetingFormatters"

type MeetingView = "agenda" | "list"
type QuickFilter =
  "all" | "today" | "upcoming" | "mine" | "completed" | "cancelled" | "past"

const quickFilters: QuickFilter[] = [
  "all",
  "today",
  "upcoming",
  "mine",
  "completed",
  "cancelled",
  "past",
]

const filterKeys = [
  "search",
  "companyId",
  "opportunityId",
  "status",
  "mode",
  "meetingTypeId",
  "dateFrom",
  "dateTo",
  "organizerId",
  "assignedUserId",
  "attendeePersonId",
] as const

export function MeetingsPage() {
  const text = uiText.meetings
  const {
    params: searchParams,
    page,
    pageSize: limit,
    patch: patchList,
    setPage,
    setPageSize,
  } = useListQueryState()
  const permissions = useAuthStore((state) => state.user?.permissions ?? [])

  const canView = permissions.includes("meeting:view")
  const canCreate = permissions.includes("meeting:create")
  const canUpdate = permissions.includes("meeting:update")
  const canComplete = permissions.includes("meeting:complete")
  const canCancel = permissions.includes("meeting:cancel")

  const view: MeetingView =
    searchParams.get("view") === "list" ? "list" : "agenda"

  const quickValue = searchParams.get("quick")
  const quick: QuickFilter = quickFilters.includes(quickValue as QuickFilter)
    ? (quickValue as QuickFilter)
    : "all"

  const searchDraft = searchParams.get("search") || ""
  const debouncedSearch = useDebouncedValue(searchDraft, 300)
  const setSearchDraft = (search: string) =>
    patchList({ search }, { replace: true })
  const [formMeeting, setFormMeeting] = useState<Meeting | null | undefined>(
    undefined
  )
  const [statusState, setStatusState] = useState<{
    meeting: Meeting
    action: "complete" | "cancel"
  }>()

  const statusParam = searchParams.get("status")
  const modeParam = searchParams.get("mode")

  function patchParams(
    values: Record<string, string | undefined>,
    resetPage = true
  ) {
    patchList(values, { resetPage })
  }

  const filterValues = useMemo<MeetingFilterValues>(
    () => ({
      search: searchDraft,
      companyId: searchParams.get("companyId") || undefined,
      opportunityId: searchParams.get("opportunityId") || undefined,
      status: ["SCHEDULED", "COMPLETED", "CANCELLED"].includes(
        statusParam || ""
      )
        ? (statusParam as MeetingStatus)
        : undefined,
      mode: ["IN_PERSON", "ONLINE", "HYBRID"].includes(modeParam || "")
        ? (modeParam as MeetingMode)
        : undefined,
      meetingTypeId: searchParams.get("meetingTypeId") || undefined,
      dateFrom: searchParams.get("dateFrom") || undefined,
      dateTo: searchParams.get("dateTo") || undefined,
      organizerId: searchParams.get("organizerId") || undefined,
      assignedUserId: searchParams.get("assignedUserId") || undefined,
      attendeePersonId: searchParams.get("attendeePersonId") || undefined,
    }),
    [searchDraft, searchParams, statusParam, modeParam]
  )

  const queryParams = useMemo<MeetingQuery>(() => {
    const today = localDayRange()

    const query: MeetingQuery = {
      page,
      limit,
      search: debouncedSearch.trim() || undefined,
      companyId: filterValues.companyId,
      opportunityId: filterValues.opportunityId,
      organizerId: filterValues.organizerId,
      assignedUserId: filterValues.assignedUserId,
      attendeePersonId: filterValues.attendeePersonId,
      status: filterValues.status,
      mode: filterValues.mode,
      meetingTypeId: filterValues.meetingTypeId,
      dateFrom: quick === "today" ? today.dateFrom : filterValues.dateFrom,
      dateTo: quick === "today" ? today.dateTo : filterValues.dateTo,
      upcoming: quick === "upcoming" || undefined,
      past: quick === "past" || undefined,
      mine: quick === "mine" || undefined,
    }

    if (quick === "completed") {
      query.status = "COMPLETED"
    }

    if (quick === "cancelled") {
      query.status = "CANCELLED"
    }

    return query
  }, [debouncedSearch, filterValues, limit, page, quick])

  const meetings = useMeetings(
    queryParams,
    canView && searchDraft === debouncedSearch
  )
  const rows = meetings.data?.data ?? []

  const contextualOpportunity = rows.find(
    (item) => item.opportunity?.id === filterValues.opportunityId
  )?.opportunity

  function changeQuick(nextQuick: QuickFilter) {
    patchParams({
      quick: nextQuick === "all" ? undefined : nextQuick,
      status: undefined,
      dateFrom: undefined,
      dateTo: undefined,
    })
  }

  function changeFilters(patch: Partial<MeetingFilterValues>) {
    if (patch.search !== undefined) {
      setSearchDraft(patch.search)
    }

    const params = Object.fromEntries(
      Object.entries(patch)
        .filter(([key]) => key !== "search")
        .map(([key, value]) => [key, value || undefined])
    )

    if ("status" in patch || "dateFrom" in patch || "dateTo" in patch) {
      params.quick = undefined
    }

    if (Object.keys(params).length) {
      patchParams(params)
    }
  }

  function clearFilters() {
    const values: Record<string, undefined> = {
      quick: undefined,
    }

    filterKeys.forEach((key) => (values[key] = undefined))

    setSearchDraft("")
    patchParams(values)
  }

  if (!canView) {
    return (
      <ErrorState
        title={text.errors.listTitle}
        description={text.errors.listDescription}
      />
    )
  }

  return (
    <EntityListPage>
      <PageHero
        title={text.title}
        description={text.description}
        eyebrow={"مرکز مدیریت جلسات"}
        icon={CalendarDays}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex rounded-xl border border-[var(--app-divider)] bg-[var(--app-background)] p-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className={
                  view === "agenda"
                    ? "rounded-lg bg-[var(--app-surface)] text-[var(--app-primary)] shadow-sm"
                    : "rounded-lg"
                }
                onClick={() => patchParams({ view: undefined }, false)}
              >
                <CalendarDays className="size-4" />
                {text.views.agenda}
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                className={
                  view === "list"
                    ? "rounded-lg bg-[var(--app-surface)] text-[var(--app-primary)] shadow-sm"
                    : "rounded-lg"
                }
                onClick={() => patchParams({ view: "list" }, false)}
              >
                <LayoutList className="size-4" />
                {text.views.list}
              </Button>
            </div>

            {canCreate ? (
              <Button
                type="button"
                className="rounded-xl bg-[var(--app-primary)] text-[var(--app-on-primary)] hover:bg-[var(--app-primary-hover)]"
                onClick={() => setFormMeeting(null)}
              >
                <Plus className="size-4" />
                {text.actions.create}
              </Button>
            ) : null}
          </div>
        }
      />

      <MeetingFilters
        values={filterValues}
        onChange={changeFilters}
        onClear={clearFilters}
      />

      <section className="flex min-w-0 flex-col gap-3 rounded-[20px] border border-[var(--app-divider)] bg-[var(--app-surface)] p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-wrap gap-1.5">
          {quickFilters.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => changeQuick(item)}
              className={[
                "inline-flex h-8 items-center rounded-lg px-3 text-xs font-bold transition",
                quick === item
                  ? "bg-[var(--app-primary)] text-[var(--app-on-primary)] shadow-sm"
                  : "border border-[var(--app-divider)] bg-[var(--app-background)] text-[var(--app-text-secondary)] hover:text-[var(--app-primary)]",
              ].join(" ")}
            >
              {text.quickFilters[item]}
            </button>
          ))}
        </div>

        <p className="shrink-0 text-xs text-[var(--app-text-secondary)]">
          {(meetings.data?.meta.total ?? 0).toLocaleString("fa-IR")}{" "}
          {text.title}
        </p>
      </section>

      <div className="min-w-0">
        <QueryContent query={meetings} errorTitle={text.errors.listTitle}>
          {view === "agenda" ? (
            <MeetingAgenda
              meetings={rows}
              canCreate={canCreate}
              canUpdate={canUpdate}
              canComplete={canComplete}
              canCancel={canCancel}
              onCreate={() => setFormMeeting(null)}
              onEdit={setFormMeeting}
              onComplete={(meeting) =>
                setStatusState({
                  meeting,
                  action: "complete",
                })
              }
              onCancel={(meeting) =>
                setStatusState({
                  meeting,
                  action: "cancel",
                })
              }
            />
          ) : (
            <MeetingList
              meetings={rows}
              canCreate={canCreate}
              canUpdate={canUpdate}
              canComplete={canComplete}
              canCancel={canCancel}
              onCreate={() => setFormMeeting(null)}
              onEdit={setFormMeeting}
              onComplete={(meeting) =>
                setStatusState({
                  meeting,
                  action: "complete",
                })
              }
              onCancel={(meeting) =>
                setStatusState({
                  meeting,
                  action: "cancel",
                })
              }
            />
          )}
        </QueryContent>
      </div>

      {meetings.data ? (
        <PaginationControls
          page={page}
          pageCount={meetings.data.meta.totalPages}
          disabled={meetings.isFetching}
          pageSize={limit}
          total={meetings.data.meta.total}
          onPageSizeChange={setPageSize}
          onPageChange={setPage}
        />
      ) : null}

      {formMeeting !== undefined ? (
        <MeetingFormDialog
          open
          onOpenChange={(open) => {
            if (!open) {
              setFormMeeting(undefined)
            }
          }}
          meeting={formMeeting}
          initialCompanyId={filterValues.companyId}
          initialOpportunity={
            contextualOpportunity
              ? {
                  id: contextualOpportunity.id,
                  title: contextualOpportunity.title,
                  companyId: contextualOpportunity.companyId,
                }
              : undefined
          }
        />
      ) : null}

      {statusState ? (
        <MeetingStatusActionDialog
          meeting={statusState.meeting}
          action={statusState.action}
          open
          onOpenChange={(open) => {
            if (!open) {
              setStatusState(undefined)
            }
          }}
        />
      ) : null}
    </EntityListPage>
  )
}
