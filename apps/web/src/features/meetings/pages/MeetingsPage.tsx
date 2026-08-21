import { CalendarDays, LayoutList, Plus } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "react-router-dom"

import { ErrorState } from "@/components/shared/ErrorState"
import { LoadingState } from "@/components/shared/LoadingState"
import { PageHeader } from "@/components/shared/PageHeader"
import { PaginationControls } from "@/components/shared/PaginationControls"
import { SurfaceCard } from "@/components/shared/SurfaceCard"
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
  "dateFrom",
  "dateTo",
  "organizerId",
  "assignedUserId",
  "attendeePersonId",
] as const

export function MeetingsPage() {
  const text = uiText.meetings
  const [searchParams, setSearchParams] = useSearchParams()
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
  const page = Math.max(1, Number(searchParams.get("page")) || 1)
  const limit = [10, 20, 50, 100].includes(Number(searchParams.get("limit")))
    ? Number(searchParams.get("limit"))
    : 20
  const [searchDraft, setSearchDraft] = useState(
    searchParams.get("search") || ""
  )
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
    const next = new URLSearchParams(searchParams)
    Object.entries(values).forEach(([key, value]) => {
      if (value) next.set(key, value)
      else next.delete(key)
    })
    if (resetPage) next.set("page", "1")
    setSearchParams(next)
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (searchDraft === (searchParams.get("search") || "")) return
      const next = new URLSearchParams(searchParams)
      if (searchDraft.trim()) next.set("search", searchDraft.trim())
      else next.delete("search")
      next.set("page", "1")
      setSearchParams(next)
    }, 300)
    return () => window.clearTimeout(timer)
  }, [searchDraft, searchParams, setSearchParams])

  const filterValues: MeetingFilterValues = {
    search: searchDraft,
    companyId: searchParams.get("companyId") || undefined,
    opportunityId: searchParams.get("opportunityId") || undefined,
    status: ["SCHEDULED", "COMPLETED", "CANCELLED"].includes(statusParam || "")
      ? (statusParam as MeetingStatus)
      : undefined,
    mode: ["IN_PERSON", "ONLINE", "HYBRID"].includes(modeParam || "")
      ? (modeParam as MeetingMode)
      : undefined,
    dateFrom: searchParams.get("dateFrom") || undefined,
    dateTo: searchParams.get("dateTo") || undefined,
    organizerId: searchParams.get("organizerId") || undefined,
    assignedUserId: searchParams.get("assignedUserId") || undefined,
    attendeePersonId: searchParams.get("attendeePersonId") || undefined,
  }
  const queryParams = useMemo<MeetingQuery>(() => {
    const today = localDayRange()
    const query: MeetingQuery = {
      page,
      limit,
      search: searchParams.get("search") || undefined,
      companyId: filterValues.companyId,
      opportunityId: filterValues.opportunityId,
      organizerId: filterValues.organizerId,
      assignedUserId: filterValues.assignedUserId,
      attendeePersonId: filterValues.attendeePersonId,
      status: filterValues.status,
      mode: filterValues.mode,
      dateFrom: quick === "today" ? today.dateFrom : filterValues.dateFrom,
      dateTo: quick === "today" ? today.dateTo : filterValues.dateTo,
      upcoming: quick === "upcoming" || undefined,
      past: quick === "past" || undefined,
      mine: quick === "mine" || undefined,
    }
    if (quick === "completed") query.status = "COMPLETED"
    if (quick === "cancelled") query.status = "CANCELLED"
    return query
  }, [filterValues, limit, page, quick, searchParams])
  const meetings = useMeetings(queryParams, canView)
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
    if (patch.search !== undefined) setSearchDraft(patch.search)
    const params = Object.fromEntries(
      Object.entries(patch)
        .filter(([key]) => key !== "search")
        .map(([key, value]) => [key, value || undefined])
    )
    if ("status" in patch || "dateFrom" in patch || "dateTo" in patch)
      params.quick = undefined
    if (Object.keys(params).length) patchParams(params)
  }

  function clearFilters() {
    const values: Record<string, undefined> = { quick: undefined }
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
    <div className="mx-auto grid w-full max-w-[1500px] min-w-0 gap-4">
      <PageHeader
        title={text.title}
        description={text.description}
        actions={
          canCreate ? (
            <Button
              className="rounded-xl bg-[var(--app-primary)] text-[var(--app-on-primary)]"
              onClick={() => setFormMeeting(null)}
            >
              <Plus className="size-4" />
              {text.actions.create}
            </Button>
          ) : undefined
        }
      />

      <div className="flex w-full max-w-full gap-2 overflow-x-auto pb-1">
        {quickFilters.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => changeQuick(item)}
            className={`h-9 shrink-0 rounded-full px-4 text-xs font-bold transition-colors ${
              quick === item
                ? "bg-[var(--app-primary)] text-[var(--app-on-primary)]"
                : "border border-[var(--app-divider)] bg-[var(--app-surface)] text-[var(--app-text-secondary)] hover:bg-[var(--app-primary-soft)]"
            }`}
          >
            {text.quickFilters[item]}
          </button>
        ))}
      </div>

      <MeetingFilters
        values={filterValues}
        onChange={changeFilters}
        onClear={clearFilters}
      />

      <SurfaceCard className="min-w-0 overflow-hidden">
        <div className="flex items-center justify-between gap-3 border-b border-[var(--app-divider)] px-4 py-3">
          <p className="text-xs text-[var(--app-text-secondary)]">
            {(meetings.data?.meta.total ?? 0).toLocaleString("fa-IR")}{" "}
            {text.title}
          </p>
          <div className="inline-flex rounded-xl bg-[var(--app-background)] p-1">
            <ViewButton
              active={view === "agenda"}
              icon={<CalendarDays className="size-4" />}
              label={text.views.agenda}
              onClick={() => patchParams({ view: undefined }, false)}
            />
            <ViewButton
              active={view === "list"}
              icon={<LayoutList className="size-4" />}
              label={text.views.list}
              onClick={() => patchParams({ view: "list" }, false)}
            />
          </div>
        </div>
        <div className="min-w-0 p-3 sm:p-5">
          {meetings.isLoading ? (
            <LoadingState rows={6} />
          ) : meetings.isError ? (
            <ErrorState
              title={text.errors.listTitle}
              description={text.errors.listDescription}
              retryLabel={uiText.common.retry}
              onRetry={() => void meetings.refetch()}
            />
          ) : view === "agenda" ? (
            <MeetingAgenda
              meetings={rows}
              canCreate={canCreate}
              canUpdate={canUpdate}
              canComplete={canComplete}
              canCancel={canCancel}
              onCreate={() => setFormMeeting(null)}
              onEdit={setFormMeeting}
              onComplete={(meeting) =>
                setStatusState({ meeting, action: "complete" })
              }
              onCancel={(meeting) =>
                setStatusState({ meeting, action: "cancel" })
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
                setStatusState({ meeting, action: "complete" })
              }
              onCancel={(meeting) =>
                setStatusState({ meeting, action: "cancel" })
              }
            />
          )}
        </div>
      </SurfaceCard>

      {meetings.data && meetings.data.meta.totalPages > 1 ? (
        <PaginationControls
          page={page}
          pageCount={meetings.data.meta.totalPages}
          disabled={meetings.isFetching}
          onPageChange={(nextPage) =>
            patchParams({ page: String(nextPage) }, false)
          }
        />
      ) : null}

      {formMeeting !== undefined ? (
        <MeetingFormDialog
          open
          onOpenChange={(open) => {
            if (!open) setFormMeeting(undefined)
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
            if (!open) setStatusState(undefined)
          }}
        />
      ) : null}
    </div>
  )
}

function ViewButton({
  active,
  icon,
  label,
  onClick,
}: {
  active: boolean
  icon: React.ReactNode
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-bold ${
        active
          ? "bg-[var(--app-surface)] text-[var(--app-primary)] shadow-sm"
          : "text-[var(--app-text-secondary)]"
      }`}
    >
      {icon}
      {label}
    </button>
  )
}
