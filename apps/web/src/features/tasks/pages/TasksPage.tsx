import {
  AlertTriangle,
  Filter,
  List,
  ListChecks,
  Plus,
  Search,
  SlidersHorizontal,
} from "lucide-react"
import { useMemo, useState } from "react"
import { useSearchParams } from "react-router-dom"

import { ErrorState } from "@/components/shared/ErrorState"
import { LoadingState } from "@/components/shared/LoadingState"
import { PageHeader } from "@/components/shared/PageHeader"
import { PaginationControls } from "@/components/shared/PaginationControls"
import { PersianDateTimePicker } from "@/components/shared/PersianDateTimePicker"
import { SurfaceCard } from "@/components/shared/SurfaceCard"
import { uiText } from "@/config/uiText"
import { SearchableCompanySelect } from "@/features/people/components/SearchableCompanySelect"
import { useAuthStore } from "@/store/authStore"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"

import { TaskActionDialogs } from "../components/TaskActionDialogs"
import {
  type TaskDialogAction,
} from "../components/TaskActionsMenu"
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
    <div className="grid min-w-0 gap-5">
      <PageHeader
        title={text.title}
        description={text.description}
        actions={
          canCreate ? (
            <Button
              className="rounded-xl bg-[var(--app-primary)] text-[var(--app-on-primary)]"
              onClick={() => setCreateOpen(true)}
            >
              <Plus className="size-4" />
              {text.actions.create}
            </Button>
          ) : undefined
        }
      />

      <SurfaceCard className="min-w-0 p-3 sm:p-4">
        <div className="flex min-w-0 flex-col gap-3 xl:flex-row xl:items-center">
          <div className="flex min-w-0 flex-1 flex-wrap gap-1.5">
            {quickFilters.map((item) => (
              <Button
                key={item.value}
                type="button"
                size="sm"
                variant={quick === item.value ? "default" : "outline"}
                className="h-9 rounded-xl text-[10px]"
                onClick={() => setQuick(item.value)}
              >
                {item.value === "overdue" ? (
                  <AlertTriangle className="size-3.5" />
                ) : null}
                {text.quick[item.value]}
              </Button>
            ))}
          </div>

          <div className="flex shrink-0 gap-2">
            <Button
              type="button"
              size="sm"
              variant={view === "focus" ? "default" : "outline"}
              className="rounded-xl"
              onClick={() => updateParam("view", "focus")}
            >
              <ListChecks className="size-4" />
              {text.views.focus}
            </Button>
            <Button
              type="button"
              size="sm"
              variant={view === "list" ? "default" : "outline"}
              className="rounded-xl"
              onClick={() => updateParam("view", "list")}
            >
              <List className="size-4" />
              {text.views.list}
            </Button>
          </div>
        </div>

        <div className="mt-3 flex min-w-0 flex-col gap-2 md:flex-row">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-[var(--app-icon-muted)]" />
            <Input
              value={search}
              onChange={(event) => updateParam("search", event.target.value)}
              placeholder={text.placeholders.search}
              className="h-10 rounded-xl pe-9"
            />
          </div>

          <Button
            type="button"
            variant={advancedOpen ? "default" : "outline"}
            className="rounded-xl"
            onClick={() => setAdvancedOpen((value) => !value)}
          >
            <SlidersHorizontal className="size-4" />
            {text.actions.filters}
          </Button>
        </div>

        {advancedOpen ? (
          <div className="mt-3 grid gap-3 border-t border-[var(--app-divider)] pt-3 md:grid-cols-2 xl:grid-cols-4">
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
              onChange={(option) => updateParam("opportunityId", option?.id)}
              search={opportunitySearch}
              onSearchChange={setOpportunitySearch}
              placeholder={text.placeholders.opportunity}
              loading={opportunities.isLoading}
              hasMore={opportunities.hasNextPage}
              loadingMore={opportunities.isFetchingNextPage}
              onLoadMore={() => void opportunities.fetchNextPage()}
            />

            <select
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

            <TaskOptionSelect
              value={assignedToId || undefined}
              options={assigneeOptions}
              onChange={(option) => updateParam("assignedToId", option?.id)}
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
                  updateParam("dueFrom", value?.toISOString())
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
                  updateParam("dueTo", value?.toISOString())
                }
              />
            </div>

            <Button
              type="button"
              variant="ghost"
              className="rounded-xl text-[var(--app-text-secondary)]"
              onClick={() => {
                setParams((current) => {
                  const next = new URLSearchParams()
                  const viewValue = current.get("view")
                  if (viewValue) next.set("view", viewValue)
                  return next
                })
              }}
            >
              <Filter className="size-4" />
              {text.actions.clearFilters}
            </Button>
          </div>
        ) : null}
      </SurfaceCard>

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
          onPageChange={(next) => updateParam("page", String(next))}
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
  "h-11 w-full rounded-xl border border-input bg-transparent px-3 text-sm outline-none focus:border-[var(--app-primary)]"
