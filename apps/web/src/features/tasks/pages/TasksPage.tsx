import { EntityListPage } from "@/components/shared/EntityListPage"
import { useDebouncedValue } from "@/lib/useDebouncedValue"
import { PageHero } from "@/components/shared/PageHero"
import { DataTableToolbar } from "@/components/shared/DataTableToolbar"
import {
  AlertTriangle,
  Filter,
  List,
  ListChecks,
  Plus,
  SlidersHorizontal,
} from "lucide-react"
import { useMemo, useState } from "react"
import { useListQueryState } from "@/lib/listQuery"
import { QueryContent } from "@/components/shared/QueryContent"

import { ErrorState } from "@/components/shared/ErrorState"
import { PaginationControls } from "@/components/shared/PaginationControls"
import { PersianDateTimePicker } from "@/components/shared/PersianDateTimePicker"
import { SearchableOptionSelect } from "@/components/shared/SearchableOptionSelect"
import { uiText } from "@/config/uiText"
import { SearchableCompanySelect } from "@/features/people/components/SearchableCompanySelect"
import { useAuthStore } from "@/store/authStore"
import { Button } from "@workspace/ui/components/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover"

import { TaskActionDialogs } from "../components/TaskActionDialogs"
import type { TaskDialogAction } from "../components/TaskActionsMenu"
import { TaskFocusView } from "../components/TaskFocusView"
import { TaskFormDialog } from "../components/TaskFormDialog"
import { canReassignTask } from "../taskPermissions"
import { TaskList } from "../components/TaskList"
import { TaskOptionSelect } from "../components/TaskOptionSelect"
import {
  useTaskAssignees,
  useTaskTeams,
  useTaskOpportunityOptions,
  useTasks,
} from "../hooks/useTasks"
import type {
  Task,
  TaskListQuery,
  TaskPriority,
  TaskStatus,
  TaskEntityType,
} from "../types/task.types"

type ViewMode = "focus" | "list"
type QuickFilter =
  | "all"
  | "overdue"
  | "todo"
  | "inProgress"
  | "done"
  | "cancelled"
  | "mine"
  | "team"
  | "organization"
  | "created"
  | "awaitingReview"

export function TasksPage() {
  const text = uiText.tasks
  const { params, page, pageSize, patch, setPageSize } = useListQueryState()
  const user = useAuthStore((state) => state.user)
  const permissions = user?.permissions ?? []

  const canView = permissions.includes("task:view")
  const canCreate = permissions.includes("task:create")
  const canUpdate = permissions.includes("task:update")
  const canAssign = canReassignTask(permissions)
  const canComplete = permissions.includes("task:complete")
  const canDelete = permissions.includes("task:delete")

  const view = (params.get("view") === "list" ? "list" : "focus") as ViewMode
  const quick = normalizeQuick(params.get("quick"))
  const search = params.get("search") || ""
  const companyId = params.get("companyId") || ""
  const opportunityId = params.get("opportunityId") || ""
  const priority = normalizePriority(params.get("priority"))
  const assignedToId = params.get("assignedToId") || ""
  const dueFrom = params.get("dueFrom") || ""
  const dueTo = params.get("dueTo") || ""
  const teamId = params.get("teamId") || ""
  const dueState = (params.get("dueState") || "") as TaskListQuery["dueState"] | ""
  const linkedEntityType = (params.get("linkedEntityType") || "") as TaskEntityType | ""
  const reviewStatus = (params.get("reviewStatus") || "") as TaskListQuery["reviewStatus"] | ""
  const reviewerId = params.get("reviewerId") || ""

  const [createOpen, setCreateOpen] = useState(false)
  const [editTask, setEditTask] = useState<Task | null>(null)
  const [actionTask, setActionTask] = useState<Task | null>(null)
  const [action, setAction] = useState<TaskDialogAction>()
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const [assigneeSearch, setAssigneeSearch] = useState("")
  const [reviewerSearch, setReviewerSearch] = useState("")
  const [opportunitySearch, setOpportunitySearch] = useState("")
  const [teamSearch, setTeamSearch] = useState("")

  const debouncedSearch = useDebouncedValue(search)
  const quickQuery = quickToQuery(quick, user?.id)

  const query: TaskListQuery = {
    page,
    limit: pageSize,
    search: debouncedSearch.trim() || undefined,
    companyId: companyId || undefined,
    opportunityId: opportunityId || undefined,
    priority,
    assignedToId: assignedToId || quickQuery.assignedToId,
    createdById: quickQuery.createdById,
    status: quickQuery.status,
    overdueOnly: quickQuery.overdueOnly,
    view: quickQuery.view,
    dueFrom: dueFrom || undefined,
    dueTo: dueTo || undefined,
    teamId: teamId || undefined,
    dueState: dueState || undefined,
    linkedEntityType: linkedEntityType || undefined,
    reviewStatus: reviewStatus || undefined,
    reviewerId: reviewerId || undefined,
    awaitingMyReview: quickQuery.awaitingMyReview,
  }

  const tasks = useTasks(query, canView && search === debouncedSearch)

  const assignees = useTaskAssignees(assigneeSearch, advancedOpen && canView)
  const reviewers = useTaskAssignees(reviewerSearch, advancedOpen && canView)
  const teams = useTaskTeams(teamSearch, advancedOpen && canView)
  const teamOptions = useMemo(
    () => teams.data?.pages.flatMap((part) => part.data) || [],
    [teams.data]
  )
  const assigneeOptions = useMemo(
    () =>
      assignees.data?.pages
        .flatMap((part) => part.data)
        .map((item) => ({
          id: item.id,
          label: item.fullName || item.email || item.id,
          secondary: [item.email, item.role, item.teamRef?.name || item.team].filter(Boolean).join(" · ") || undefined,
        })) || [],
    [assignees.data]
  )
  const reviewerOptions = useMemo(
    () =>
      reviewers.data?.pages
        .flatMap((part) => part.data)
        .map((item) => ({
          id: item.id,
          label: item.fullName || item.email || item.id,
          secondary: item.email || undefined,
        })) || [],
    [reviewers.data]
  )

  const opportunities = useTaskOpportunityOptions(
    companyId,
    opportunitySearch,
    advancedOpen && canView
  )
  const opportunityOptions = useMemo(
    () =>
      opportunities.data?.pages
        .flatMap((part) => part.data)
        .map((item) => ({
          id: item.id,
          label: item.title,
          secondary:
            item.company?.brandName || item.company?.legalName || undefined,
        })) || [],
    [opportunities.data]
  )

  const advancedCount = [
    companyId,
    opportunityId,
    assignedToId,
    dueFrom,
    dueTo,
    teamId,
    dueState,
    linkedEntityType,
    reviewStatus,
    reviewerId,
  ].filter(Boolean).length

  function updateParam(key: string, value?: string) {
    patch(
      { [key]: value },
      { resetPage: key !== "page", replace: key === "search" }
    )
  }
  function setQuick(value: QuickFilter) {
    patch({ quick: value === "all" ? undefined : value })
  }
  function switchView(nextView: ViewMode) {
    updateParam("view", nextView)
  }

  function clearFilters() {
    patch(
      Object.fromEntries(
        [
          "search",
          "companyId",
          "opportunityId",
          "priority",
          "assignedToId",
          "dueFrom",
          "dueTo",
          "teamId",
          "dueState",
          "linkedEntityType",
          "reviewStatus",
          "reviewerId",
          "quick",
        ].map((key) => [key, undefined])
      )
    )
    setAssigneeSearch("")
    setReviewerSearch("")
    setOpportunitySearch("")
    setTeamSearch("")
  }

  function openAction(task: Task, next: TaskDialogAction) {
    setActionTask(task)
    setAction(next)
  }

  if (!canView) {
    return (
      <ErrorState
        title={text.errors.permissionTitle}
        description={text.errors.permissionDescription}
      />
    )
  }

  return (
    <EntityListPage>
      <PageHero
        title={text.title}
        description={text.description}
        eyebrow={"مرکز مدیریت کارها"}
        icon={ListChecks}
        primaryAction={canCreate ? { label: text.actions.create, icon: Plus, onClick: () => setCreateOpen(true) } : undefined}
        viewOptions={[
          { id: "focus", label: text.views.focus, icon: ListChecks },
          { id: "list", label: text.views.list, icon: List },
        ]}
        activeView={view}
        onViewChange={(next) => switchView(next as ViewMode)}
      />

      <DataTableToolbar
        searchValue={search}
        onSearchChange={(value) => updateParam("search", value)}
        searchPlaceholder={text.placeholders.search}
        hasActiveFilters={Boolean(search || priority || quick !== "all" || advancedCount)}
        onClearFilters={clearFilters}
        filtersClassName="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3"
        filters={
          <>
            <SearchableOptionSelect
              ariaLabel={uiText.common.filters.priority}
              value={priority}
              options={priorityOptions.map((value) => ({ id: value, label: text.priorities[value] }))}
              onChange={(value) => updateParam("priority", value)}
              search=""
              onSearchChange={() => undefined}
              placeholder={text.filters.allPriorities}
              searchable={false}
            />

            <Popover open={advancedOpen} onOpenChange={setAdvancedOpen}>
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
                {advancedCount ? (
                  <span className="rounded-full bg-[var(--app-primary-soft)] px-1.5 text-xs text-[var(--app-primary)]">
                    {advancedCount.toLocaleString("fa-IR")}
                  </span>
                ) : null}
              </PopoverTrigger>

              <PopoverContent
                align="end"
                className="w-[min(760px,calc(100vw-24px))] rounded-2xl p-4"
                dir="rtl"
              >
                <div className="mb-4 flex items-center gap-2 text-sm font-bold text-[var(--app-heading)]">
                  <Filter className="size-4 text-[var(--app-primary)]" />
                  {text.actions.filters}
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <SearchableCompanySelect
                    value={companyId || undefined}
                    onChange={(value) => {
                      patch({
                        companyId: value || undefined,
                        ...(!value ? { opportunityId: undefined } : {}),
                      })
                    }}
                    placeholder={text.placeholders.company}
                  />

                  <TaskOptionSelect
                    value={opportunityId || undefined}
                    options={opportunityOptions}
                    onChange={(option) =>
                      updateParam("opportunityId", option?.id)
                    }
                    search={opportunitySearch}
                    onSearchChange={setOpportunitySearch}
                    placeholder={text.placeholders.opportunity}
                    loading={opportunities.isLoading}
                    hasMore={opportunities.hasNextPage}
                    loadingMore={opportunities.isFetchingNextPage}
                    onLoadMore={() => void opportunities.fetchNextPage()}
                  />

                  <TaskOptionSelect
                    value={teamId || undefined}
                    options={teamOptions}
                    onChange={(option) => updateParam("teamId", option?.id)}
                    search={teamSearch}
                    onSearchChange={setTeamSearch}
                    placeholder="تیم"
                    loading={teams.isLoading}
                    hasMore={teams.hasNextPage}
                    loadingMore={teams.isFetchingNextPage}
                    onLoadMore={() => void teams.fetchNextPage()}
                  />

                  <StaticFilterSelect ariaLabel="وضعیت موعد" value={dueState} placeholder="همه وضعیت‌های موعد" options={dueStateOptions} onChange={(value) => updateParam("dueState", value)} />

                  <StaticFilterSelect ariaLabel="نوع موجودیت مرتبط" value={linkedEntityType} placeholder="همه موجودیت‌های مرتبط" options={linkedEntityOptions} onChange={(value) => updateParam("linkedEntityType", value)} />

                  <StaticFilterSelect ariaLabel="وضعیت بازبینی" value={reviewStatus} placeholder="همه وضعیت‌های بازبینی" options={reviewStatusOptions} onChange={(value) => updateParam("reviewStatus", value)} />

                  <TaskOptionSelect
                    value={reviewerId || undefined}
                    options={reviewerOptions}
                    onChange={(option) => updateParam("reviewerId", option?.id)}
                    search={reviewerSearch}
                    onSearchChange={setReviewerSearch}
                    placeholder="بازبین"
                    loading={reviewers.isLoading}
                    hasMore={reviewers.hasNextPage}
                    loadingMore={reviewers.isFetchingNextPage}
                    onLoadMore={() => void reviewers.fetchNextPage()}
                  />

                  <TaskOptionSelect
                    value={assignedToId || undefined}
                    options={assigneeOptions}
                    onChange={(option) =>
                      updateParam("assignedToId", option?.id)
                    }
                    search={assigneeSearch}
                    onSearchChange={setAssigneeSearch}
                    placeholder={text.placeholders.assignee}
                    loading={assignees.isLoading}
                    hasMore={assignees.hasNextPage}
                    loadingMore={assignees.isFetchingNextPage}
                    onLoadMore={() => void assignees.fetchNextPage()}
                  />

                  <div className="grid gap-1">
                    <span className="text-xs text-[var(--app-text-secondary)]">
                      {text.filters.dueFrom}
                    </span>
                    <PersianDateTimePicker
                      value={dueFrom ? new Date(dueFrom) : undefined}
                      onChange={(value) =>
                        updateParam("dueFrom", value?.toISOString())
                      }
                    />
                  </div>

                  <div className="grid gap-1">
                    <span className="text-xs text-[var(--app-text-secondary)]">
                      {text.filters.dueTo}
                    </span>
                    <PersianDateTimePicker
                      value={dueTo ? new Date(dueTo) : undefined}
                      onChange={(value) =>
                        updateParam("dueTo", value?.toISOString())
                      }
                    />
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            <div className="col-span-full mt-3 flex flex-col gap-3 border-t border-[var(--app-divider)] pt-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex min-w-0 flex-wrap gap-1.5">
                {quickFilters.filter((item) => item.value !== "team" || permissions.includes("task:view-team")).filter((item) => item.value !== "organization" || permissions.includes("task:view-organization")).filter((item) => item.value !== "awaitingReview" || permissions.includes("task:review")).map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setQuick(item.value)}
                    className={[
                      "inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-bold transition",
                      quick === item.value
                        ? "bg-[var(--app-primary)] text-[var(--app-on-primary)] shadow-sm"
                        : "border border-[var(--app-divider)] bg-[var(--app-background)] text-[var(--app-text-secondary)] hover:text-[var(--app-primary)]",
                    ].join(" ")}
                  >
                    {item.value === "overdue" ? (
                      <AlertTriangle className="size-3.5" />
                    ) : null}
                    {item.value === "awaitingReview" ? "در انتظار بازبینی من" : text.quick[item.value]}
                  </button>
                ))}
              </div>
            </div>
          </>
        }
      />

      <QueryContent query={tasks} errorTitle={text.errors.listTitle}>
        {view === "list" ? (
          <TaskList
            tasks={tasks.data?.data ?? []}
            canCreate={canCreate}
            canUpdate={canUpdate}
            canAssign={canAssign}
            canComplete={canComplete}
            canDelete={canDelete}
            onCreate={() => setCreateOpen(true)}
            onEdit={setEditTask}
            onAction={openAction}
          />
        ) : (
          <TaskFocusView
            tasks={tasks.data?.data ?? []}
            canCreate={canCreate}
            canUpdate={canUpdate}
            canAssign={canAssign}
            canComplete={canComplete}
            canDelete={canDelete}
            onCreate={() => setCreateOpen(true)}
            onEdit={setEditTask}
            onAction={openAction}
          />
        )}
      </QueryContent>
      {tasks.data ? (
        <PaginationControls
          page={tasks.data.meta.page}
          pageCount={tasks.data.meta.totalPages}
          onPageChange={(next) => updateParam("page", String(next))}
          disabled={tasks.isFetching}
          pageSize={pageSize}
          total={tasks.data.meta.total}
          onPageSizeChange={setPageSize}
        />
      ) : null}

      {createOpen ? (
        <TaskFormDialog
          open
          onOpenChange={setCreateOpen}
          initialCompanyId={companyId || undefined}
          initialOpportunity={
            opportunityId
              ? opportunityOptions.find((item) => item.id === opportunityId)
              : undefined
          }
        />
      ) : null}

      {editTask ? (
        <TaskFormDialog
          open
          onOpenChange={(open) => {
            if (!open) setEditTask(null)
          }}
          task={editTask}
        />
      ) : null}

      <TaskActionDialogs
        task={actionTask}
        action={action}
        onClose={() => {
          setActionTask(null)
          setAction(undefined)
        }}
      />
    </EntityListPage>
  )
}

function normalizeQuick(value: string | null): QuickFilter {
  return quickFilters.some((item) => item.value === value)
    ? (value as QuickFilter)
    : "all"
}

function normalizePriority(value: string | null): TaskPriority | undefined {
  return ["LOW", "MEDIUM", "HIGH", "STRATEGIC"].includes(value || "")
    ? (value as TaskPriority)
    : undefined
}

function quickToQuery(quick: QuickFilter, userId?: string) {
  const result: {
    status?: TaskStatus
    overdueOnly?: boolean
    assignedToId?: string
    createdById?: string
    view?: TaskListQuery["view"]
    awaitingMyReview?: boolean
  } = {}

  if (quick === "overdue") result.overdueOnly = true
  if (quick === "todo") result.status = "TODO"
  if (quick === "inProgress") result.status = "IN_PROGRESS"
  if (quick === "done") result.status = "DONE"
  if (quick === "cancelled") result.status = "CANCELLED"
  if (quick === "mine" && userId) result.assignedToId = userId
  if (quick === "created" && userId) result.createdById = userId
  if (quick === "team") result.view = "team"
  if (quick === "organization") result.view = "organization"
  if (quick === "awaitingReview") result.awaitingMyReview = true

  return result
}

const quickFilters: { value: QuickFilter }[] = [
  { value: "all" },
  { value: "overdue" },
  { value: "todo" },
  { value: "inProgress" },
  { value: "done" },
  { value: "cancelled" },
  { value: "mine" },
  { value: "team" },
  { value: "organization" },
  { value: "created" },
  { value: "awaitingReview" },
]

type StaticFilterOption = { id: string; label: string }

function StaticFilterSelect({
  ariaLabel,
  value,
  placeholder,
  options,
  onChange,
}: {
  ariaLabel: string
  value?: string
  placeholder: string
  options: StaticFilterOption[]
  onChange: (value?: string) => void
}) {
  return (
    <SearchableOptionSelect
      ariaLabel={ariaLabel}
      value={value || undefined}
      options={options}
      onChange={onChange}
      search=""
      onSearchChange={() => undefined}
      placeholder={placeholder}
      searchable={false}
    />
  )
}

const priorityOptions: TaskPriority[] = ["LOW", "MEDIUM", "HIGH", "STRATEGIC"]

const dueStateOptions: StaticFilterOption[] = [
  { id: "none", label: "بدون موعد" },
  { id: "upcoming", label: "آینده" },
  { id: "today", label: "امروز" },
  { id: "overdue", label: "گذشته" },
  { id: "completed", label: "تکمیل‌شده" },
]

const linkedEntityOptions: StaticFilterOption[] = [
  { id: "COMPANY", label: "شرکت" },
  { id: "OPPORTUNITY", label: "فرصت" },
  { id: "PERSON", label: "شخص" },
  { id: "MEETING", label: "جلسه" },
  { id: "ACTIVITY", label: "فعالیت" },
  { id: "PRODUCT", label: "محصول" },
]

const reviewStatusOptions: StaticFilterOption[] = [
  { id: "NOT_REQUIRED", label: "بدون بازبینی" },
  { id: "DRAFT", label: "پیش‌نویس" },
  { id: "PENDING_REVIEW", label: "در انتظار بازبینی" },
  { id: "CHANGES_REQUESTED", label: "نیازمند اصلاح" },
  { id: "APPROVED", label: "تأییدشده" },
]
