import {
  AlertTriangle,
  Filter,
  List,
  ListChecks,
  Plus,
  RotateCcw,
  Search,
  SlidersHorizontal,
} from "lucide-react"
import { useMemo, useState } from "react"
import { useSearchParams } from "react-router-dom"

import { ErrorState } from "@/components/shared/ErrorState"
import { LoadingState } from "@/components/shared/LoadingState"
import { PaginationControls } from "@/components/shared/PaginationControls"
import { PersianDateTimePicker } from "@/components/shared/PersianDateTimePicker"
import { uiText } from "@/config/uiText"
import { SearchableCompanySelect } from "@/features/people/components/SearchableCompanySelect"
import { useAuthStore } from "@/store/authStore"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
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

const pageSize = 20

export function TasksPage() {
  const text = uiText.tasks
  const [params, setParams] = useSearchParams()
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
  const page = Math.max(1, Number(params.get("page") || 1))
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

  const quickQuery = quickToQuery(quick, user?.id)

  const query: TaskListQuery = {
    page,
    limit: pageSize,
    search: search.trim() || undefined,
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

  const tasks = useTasks(query, canView)

  const assignees = useTaskAssignees(
    assigneeSearch,
    advancedOpen && canView
  )
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
            item.company?.brandName ||
            item.company?.legalName ||
            undefined,
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
    setParams((current) => {
      const next = new URLSearchParams(current)
      if (value) next.set(key, value)
      else next.delete(key)
      if (key !== "page") next.delete("page")
      return next
    })
  }

  function setQuick(value: QuickFilter) {
    setParams((current) => {
      const next = new URLSearchParams(current)
      if (value === "all") next.delete("quick")
      else next.set("quick", value)
      next.delete("page")
      return next
    })
  }

  function switchView(nextView: ViewMode) {
    updateParam("view", nextView)
  }

  function clearFilters() {
    setParams((current) => {
      const next = new URLSearchParams()
      const viewValue = current.get("view")
      if (viewValue) next.set("view", viewValue)
      return next
    })
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
      <section className="relative overflow-hidden rounded-[30px] border border-[var(--app-divider)] bg-[var(--app-surface)] px-5 py-6 shadow-[var(--app-shadow-card)] sm:px-7">
        <div className="pointer-events-none absolute -end-20 -top-28 size-64 rounded-full bg-[var(--app-primary-soft)] blur-3xl" />

        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[var(--app-divider)] bg-[var(--app-background)]/70 px-3 py-1.5 text-[10px] font-bold text-[var(--app-primary)]">
              <ListChecks className="size-3.5" />
              مرکز مدیریت کارها
            </div>

            <h1 className="text-2xl font-bold text-[var(--app-heading)] sm:text-3xl">
              {text.title}
            </h1>

            <p className="mt-2 max-w-xl text-xs leading-6 text-[var(--app-text-secondary)]">
              {text.description}
            </p>
          </div>

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
        </div>
      </section>

      <section className="rounded-[24px] border border-[var(--app-divider)] bg-[var(--app-surface)] p-3 shadow-[var(--app-shadow-card)]">
        <div className="grid gap-3 xl:grid-cols-[minmax(230px,1.35fr)_minmax(150px,.65fr)_auto] xl:items-center">
          <div className="relative">
            <Search className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-[var(--app-icon-muted)]" />
            <Input
              value={search}
              onChange={(event) =>
                updateParam("search", event.target.value)
              }
              placeholder={text.placeholders.search}
              className="h-11 rounded-xl pe-9"
            />
          </div>

          <select
            value={priority || ""}
            onChange={(event) =>
              updateParam(
                "priority",
                event.target.value || undefined
              )
            }
            className={selectClass}
          >
            <option value="">{text.filters.allPriorities}</option>
            {(
              ["LOW", "MEDIUM", "HIGH", "STRATEGIC"] as TaskPriority[]
            ).map((value) => (
              <option key={value} value={value}>
                {text.priorities[value]}
              </option>
            ))}
          </select>

          <Popover
            open={advancedOpen}
            onOpenChange={setAdvancedOpen}
          >
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
                <span className="rounded-full bg-[var(--app-primary-soft)] px-1.5 text-[9px] text-[var(--app-primary)]">
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
                    setParams((current) => {
                      const next = new URLSearchParams(current)
                      if (value) next.set("companyId", value)
                      else {
                        next.delete("companyId")
                        next.delete("opportunityId")
                      }
                      next.delete("page")
                      return next
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
                  onLoadMore={() =>
                    void opportunities.fetchNextPage()
                  }
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
                  <span className="text-[9px] text-[var(--app-text-secondary)]">
                    {text.filters.dueFrom}
                  </span>
                  <PersianDateTimePicker
                    value={dueFrom ? new Date(dueFrom) : undefined}
                    onChange={(value) =>
                      updateParam(
                        "dueFrom",
                        value?.toISOString()
                      )
                    }
                  />
                </div>

                <div className="grid gap-1">
                  <span className="text-[9px] text-[var(--app-text-secondary)]">
                    {text.filters.dueTo}
                  </span>
                  <PersianDateTimePicker
                    value={dueTo ? new Date(dueTo) : undefined}
                    onChange={(value) =>
                      updateParam(
                        "dueTo",
                        value?.toISOString()
                      )
                    }
                  />
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <div className="mt-3 flex flex-col gap-3 border-t border-[var(--app-divider)] pt-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 flex-wrap gap-1.5">
            {quickFilters.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setQuick(item.value)}
                className={[
                  "inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-[10px] font-bold transition",
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

          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="shrink-0 rounded-xl text-[var(--app-text-secondary)]"
            onClick={clearFilters}
          >
            <RotateCcw className="size-3.5" />
            {text.actions.clearFilters}
          </Button>
        </div>
      </section>

      {tasks.isLoading ? (
        <LoadingState rows={6} />
      ) : tasks.isError ? (
        <ErrorState
          title={text.errors.listTitle}
          description={text.errors.listDescription}
          retryLabel={uiText.common.retry}
          onRetry={() => void tasks.refetch()}
        />
      ) : view === "list" ? (
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

      {tasks.data ? (
        <PaginationControls
          page={tasks.data.meta.page}
          pageCount={tasks.data.meta.totalPages}
          onPageChange={(next) =>
            updateParam("page", String(next))
          }
          disabled={tasks.isFetching}
        />
      ) : null}

      {createOpen ? (
        <TaskFormDialog
          open
          onOpenChange={setCreateOpen}
          initialCompanyId={companyId || undefined}
          initialOpportunity={
            opportunityId
              ? opportunityOptions.find(
                  (item) => item.id === opportunityId
                )
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

function normalizePriority(
  value: string | null
): TaskPriority | undefined {
  return ["LOW", "MEDIUM", "HIGH", "STRATEGIC"].includes(
    value || ""
  )
    ? (value as TaskPriority)
    : undefined
}

function quickToQuery(
  quick: QuickFilter,
  userId?: string
) {
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
  if (quick === "mine" && userId)
    result.assignedToId = userId
  if (quick === "created" && userId)
    result.createdById = userId

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
