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
import { TaskList } from "../components/TaskList"
import { TaskOptionSelect } from "../components/TaskOptionSelect"
import {
  useTaskAssignees,
  useTaskOpportunityOptions,
  useTasks,
} from "../hooks/useTasks"
import type {
  Task,
  TaskListQuery,
  TaskPriority,
  TaskStatus,
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
  | "created"

export function TasksPage() {
  const text = uiText.tasks
  const { params, page, pageSize, patch, setPageSize } = useListQueryState()
  const user = useAuthStore((state) => state.user)
  const permissions = user?.permissions ?? []

  const canView = permissions.includes("task:view")
  const canCreate = permissions.includes("task:create")
  const canUpdate = permissions.includes("task:update")
  const canAssign = permissions.includes("task:assign")
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

  const [createOpen, setCreateOpen] = useState(false)
  const [editTask, setEditTask] = useState<Task | null>(null)
  const [actionTask, setActionTask] = useState<Task | null>(null)
  const [action, setAction] = useState<TaskDialogAction>()
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const [assigneeSearch, setAssigneeSearch] = useState("")
  const [opportunitySearch, setOpportunitySearch] = useState("")

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
    dueFrom: dueFrom || undefined,
    dueTo: dueTo || undefined,
  }

  const tasks = useTasks(query, canView && search === debouncedSearch)

  const assignees = useTaskAssignees(assigneeSearch, advancedOpen && canView)
  const assigneeOptions = useMemo(
    () =>
      assignees.data?.pages
        .flatMap((part) => part.data)
        .map((item) => ({
          id: item.id,
          label: item.fullName || item.email || item.id,
          secondary: item.email || undefined,
        })) || [],
    [assignees.data]
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
          "quick",
        ].map((key) => [key, undefined])
      )
    )
    setAssigneeSearch("")
    setOpportunitySearch("")
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
    <div className="grid min-w-0 gap-5" dir="rtl">
      <PageHero
        title={text.title}
        description={text.description}
        eyebrow={"مرکز مدیریت کارها"}
        icon={ListChecks}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex rounded-xl border border-[var(--app-divider)] bg-[var(--app-background)] p-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className={
                  view === "focus"
                    ? "rounded-lg bg-[var(--app-surface)] text-[var(--app-primary)] shadow-sm"
                    : "rounded-lg"
                }
                onClick={() => switchView("focus")}
              >
                <ListChecks className="size-4" />
                {text.views.focus}
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
                onClick={() => switchView("list")}
              >
                <List className="size-4" />
                {text.views.list}
              </Button>
            </div>

            {canCreate ? (
              <Button
                type="button"
                className="rounded-xl bg-[var(--app-primary)] text-[var(--app-on-primary)] hover:bg-[var(--app-primary-hover)]"
                onClick={() => setCreateOpen(true)}
              >
                <Plus className="size-4" />
                {text.actions.create}
              </Button>
            ) : null}
          </div>
        }
      />

      <DataTableToolbar
        searchValue={search}
        onSearchChange={(value) => updateParam("search", value)}
        searchPlaceholder={text.placeholders.search}
        hasActiveFilters
        onClearFilters={clearFilters}
        filtersClassName="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3"
        filters={
          <>
            <select
              aria-label={uiText.common.filters.priority}
              value={priority || ""}
              onChange={(event) =>
                updateParam("priority", event.target.value || undefined)
              }
              className={selectClass}
            >
              <option value="">{text.filters.allPriorities}</option>
              {(["LOW", "MEDIUM", "HIGH", "STRATEGIC"] as TaskPriority[]).map(
                (value) => (
                  <option key={value} value={value}>
                    {text.priorities[value]}
                  </option>
                )
              )}
            </select>

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
                {quickFilters.map((item) => (
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
                    {text.quick[item.value]}
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
    </div>
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
  } = {}

  if (quick === "overdue") result.overdueOnly = true
  if (quick === "todo") result.status = "TODO"
  if (quick === "inProgress") result.status = "IN_PROGRESS"
  if (quick === "done") result.status = "DONE"
  if (quick === "cancelled") result.status = "CANCELLED"
  if (quick === "mine" && userId) result.assignedToId = userId
  if (quick === "created" && userId) result.createdById = userId

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
  { value: "created" },
]

const selectClass =
  "h-11 w-full rounded-xl border border-input bg-transparent px-3 text-xs outline-none focus:border-[var(--app-primary)]"
