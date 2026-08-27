import {
  Activity as ActivityIcon,
  Filter,
  Plus,
  RotateCcw,
  Search,
  SlidersHorizontal,
} from "lucide-react"
import { useEffect, useMemo, useState } from "react"

import {
  DataTableShell,
  type DataTableColumn,
} from "@/components/shared/DataTableShell"
import { EmptyState } from "@/components/shared/EmptyState"
import { ErrorState } from "@/components/shared/ErrorState"
import { LoadingState } from "@/components/shared/LoadingState"
import { PageHero } from "@/components/shared/PageHero"
import { PaginationControls } from "@/components/shared/PaginationControls"
import { SearchableCompanySelect } from "@/features/people/components/SearchableCompanySelect"
import { usePipelineStages } from "@/features/opportunities/hooks/useOpportunities"
import { useAuthStore } from "@/store/authStore"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover"

import { ActivityActionsMenu } from "../components/ActivityActionsMenu"
import { ActivityDetailDialog } from "../components/ActivityDetailDialog"
import {
  ActivityPersianDateRangePicker,
  type ActivityPersianDateRange,
} from "../components/ActivityPersianDateRangePicker"
import { ActivityFormDialog } from "../components/ActivityFormDialog"
import { localizeStageChangeText } from "../utils/activityDisplay"
import { ActivityOptionSelect } from "../components/ActivityOptionSelect"
import {
  useActivities,
  useActivityOwnerOptions,
  useActivityPeopleOptions,
} from "../hooks/useActivities"
import {
  ACTIVITY_TYPE_OPTIONS,
  type Activity,
  type ActivityListQuery,
  type ActivityOption,
  type ActivityStatus,
  type ActivityType,
} from "../types/activity.types"

type QuickScope = "all" | "mine" | "team"

const selectClass =
  "h-11 w-full rounded-xl border border-input bg-transparent px-3 text-xs outline-none focus:border-[var(--app-primary)]"

function useDebounced(value: string, delay = 300) {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay)
    return () => window.clearTimeout(timer)
  }, [delay, value])

  return debounced
}

function formatDate(value?: string | null) {
  if (!value) return "—"

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "—"

  return new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

function activityTypeLabel(type: ActivityType) {
  return (
    ACTIVITY_TYPE_OPTIONS.find((item) => item.value === type)?.label || type
  )
}

function companyName(activity: Activity) {
  return activity.company?.brandName || activity.company?.legalName || "—"
}

export function ActivitiesPage() {
  const user = useAuthStore((state) => state.user)
  const permissions = user?.permissions ?? []

  const canView = permissions.includes("activity:view")
  const canCreate = permissions.includes("activity:create")
  const canUpdate = permissions.includes("activity:update")

  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState<10 | 20 | 50 | 100>(20)
  const [search, setSearch] = useState("")
  const [scope, setScope] = useState<QuickScope>("all")
  const [activityType, setActivityType] = useState<"" | ActivityType>("")
  const [status, setStatus] = useState<"" | ActivityStatus>("")
  const [companyId, setCompanyId] = useState("")
  const [person, setPerson] = useState<ActivityOption>()
  const [personSearch, setPersonSearch] = useState("")
  const [ownerId, setOwnerId] = useState("")
  const [team, setTeam] = useState("")
  const [dateRange, setDateRange] = useState<ActivityPersianDateRange>()
  const [createOpen, setCreateOpen] = useState(false)
  const [editActivity, setEditActivity] = useState<Activity | null>(null)
  const [detailActivity, setDetailActivity] = useState<Activity | null>(null)

  const debouncedSearch = useDebounced(search)
  const debouncedPersonSearch = useDebounced(personSearch)

  const people = useActivityPeopleOptions(
    companyId,
    debouncedPersonSearch,
    canView
  )
  const owners = useActivityOwnerOptions(canView)

  const ownerOptions = useMemo(
    () =>
      (owners.data || []).map((item) => ({
        id: item.id,
        label: item.label,
        secondary: item.secondary,
      })),
    [owners.data]
  )

  const teams = useMemo(
    () =>
      Array.from(
        new Set(
          (owners.data || [])
            .map((item) => item.team)
            .filter((item): item is string => Boolean(item))
        )
      ).sort((a, b) => a.localeCompare(b, "fa")),
    [owners.data]
  )

  const query = useMemo<ActivityListQuery>(() => {
    const from = dateRange?.from
      ? new Date(
          dateRange.from.getFullYear(),
          dateRange.from.getMonth(),
          dateRange.from.getDate(),
          0,
          0,
          0,
          0
        )
      : undefined

    const to = dateRange?.to
      ? new Date(
          dateRange.to.getFullYear(),
          dateRange.to.getMonth(),
          dateRange.to.getDate(),
          23,
          59,
          59,
          999
        )
      : undefined

    return {
      page,
      limit: pageSize,
      search: debouncedSearch.trim() || undefined,
      activityType: activityType || undefined,
      status: status || undefined,
      companyId: companyId || undefined,
      personId: person?.id,
      ownerId: scope === "mine" ? undefined : ownerId || undefined,
      team: team || undefined,
      mine: scope === "mine" ? true : undefined,
      ownershipScope: scope === "team" ? "team" : "all",
      dateFrom: from?.toISOString(),
      dateTo: to?.toISOString(),
      sortBy: "activityDate",
      sortOrder: "desc",
    }
  }, [
    activityType,
    companyId,
    dateRange,
    debouncedSearch,
    ownerId,
    page,
    pageSize,
    person?.id,
    scope,
    status,
    team,
  ])

  const activities = useActivities(query, canView)
  const stages = usePipelineStages(canView)
  const stageItems = stages.data ?? []

  const activeAdvanced = [companyId, person?.id, ownerId, team].filter(
    Boolean
  ).length

  function resetPage() {
    setPage(1)
  }

  function clearFilters() {
    setSearch("")
    setScope("all")
    setActivityType("")
    setStatus("")
    setCompanyId("")
    setPerson(undefined)
    setPersonSearch("")
    setOwnerId("")
    setTeam("")
    setDateRange(undefined)
    setPage(1)
  }

  const columns = useMemo<DataTableColumn<Activity>[]>(
    () => [
      {
        id: "activity",
        header: "فعالیت",
        cell: (item) => (
          <div className="max-w-[280px]">
            <span className="font-bold">
              {item.type === "STAGE_CHANGE" ? localizeStageChangeText(item.title || item.outcome, stageItems) || activityTypeLabel(item.type) : item.title || item.outcome || activityTypeLabel(item.type)}
            </span>

            {item.description || item.notes ? (
              <p className="mt-1 line-clamp-1 text-xs leading-5 text-[var(--app-text-secondary)]">
                {item.type === "STAGE_CHANGE" ? localizeStageChangeText(item.description || item.notes, stageItems) : item.description || item.notes}
              </p>
            ) : null}
          </div>
        ),
      },
      {
        id: "type",
        header: "نوع",
        cell: (item) => (
          <span className="rounded-full bg-[var(--app-primary-soft)] px-2 py-1 text-xs font-bold text-[var(--app-primary)]">
            {activityTypeLabel(item.type)}
          </span>
        ),
      },
      {
        id: "company",
        header: "شرکت",
        cell: companyName,
      },
      {
        id: "person",
        header: "شخص",
        cell: (item) => item.person?.fullName || "—",
      },
      {
        id: "creator",
        header: "ایجادکننده",
        cell: (item) => item.createdBy?.fullName || item.user?.fullName || "—",
      },
      {
        id: "status",
        header: "وضعیت",
        cell: (item) => (
          <span
            className={
              item.status === "COMPLETED"
                ? "text-[var(--success)]"
                : "text-[var(--app-text-secondary)]"
            }
          >
            {item.status === "COMPLETED" ? "تکمیل‌شده" : "ثبت‌شده"}
          </span>
        ),
      },
      {
        id: "activityDate",
        header: "تاریخ فعالیت",
        cell: (item) => formatDate(item.activityDate || item.occurredAt),
        className: "whitespace-nowrap",
      },
      {
        id: "createdAt",
        header: "تاریخ ایجاد",
        cell: (item) => formatDate(item.createdAt),
        className: "whitespace-nowrap",
      },
      {
        id: "actions",
        header: "عملیات",
        headerClassName: "text-center",
        className: "text-center",
        cell: (item) => (
          <ActivityActionsMenu
            activity={item}
            canUpdate={canUpdate}
            onEdit={() => setEditActivity(item)}
          />
        ),
      },
    ],
    [canUpdate, stageItems]
  )

  if (!canView) {
    return (
      <ErrorState
        title="عدم دسترسی"
        description="شما مجوز مشاهده فعالیت‌ها را ندارید."
      />
    )
  }

  return (
    <div className="grid gap-5" dir="rtl">
      <PageHero
        eyebrow="مرکز تعاملات مشتری"
        icon={ActivityIcon}
        title="فعالیت‌ها"
        description="تماس‌ها، جلسات، ایمیل‌ها، یادداشت‌ها و سایر تعاملات انجام‌شده با مشتریان را در یک نمای متمرکز مشاهده و مدیریت کنید."
        actions={
          canCreate ? (
            <Button
              type="button"
              className="rounded-xl bg-[var(--app-primary)] text-[var(--app-on-primary)] hover:bg-[var(--app-primary-hover)]"
              onClick={() => setCreateOpen(true)}
            >
              <Plus className="size-4" />
              ثبت فعالیت
            </Button>
          ) : null
        }
      />

      <section className="rounded-[24px] border border-[var(--app-divider)] bg-[var(--app-surface)] p-3 shadow-[var(--app-shadow-card)]">
        <div className="grid gap-3 xl:grid-cols-[minmax(220px,1.35fr)_auto_minmax(155px,.8fr)_minmax(145px,.72fr)_minmax(210px,1fr)_auto] xl:items-center">
          <div className="relative">
            <Search className="absolute end-3 top-1/2 size-4 -translate-y-1/2 text-[var(--app-icon-muted)]" />
            <Input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value)
                resetPage()
              }}
              placeholder="جستجو در نتیجه، یادداشت، شخص یا شرکت"
              className="h-11 rounded-xl pe-9"
            />
          </div>

          <div className="flex min-w-max rounded-xl border border-[var(--app-divider)] bg-[var(--app-background)] p-1">
            {(["all", "mine", "team"] as const).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => {
                  setScope(value)
                  if (value === "mine") setOwnerId("")
                  resetPage()
                }}
                className={[
                  "rounded-lg px-3 py-2 text-xs font-bold transition",
                  scope === value
                    ? "bg-[var(--app-primary)] text-[var(--app-on-primary)] shadow-sm"
                    : "text-[var(--app-text-secondary)] hover:text-[var(--app-primary)]",
                ].join(" ")}
              >
                {value === "all"
                  ? "همه"
                  : value === "mine"
                    ? "فعالیت‌های من"
                    : "تیم من"}
              </button>
            ))}
          </div>

          <select
            className={selectClass}
            value={activityType}
            onChange={(event) => {
              setActivityType(event.target.value as "" | ActivityType)
              resetPage()
            }}
          >
            <option value="">نوع: همه</option>
            {ACTIVITY_TYPE_OPTIONS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>

          <select
            className={selectClass}
            value={status}
            onChange={(event) => {
              setStatus(event.target.value as "" | ActivityStatus)
              resetPage()
            }}
          >
            <option value="">وضعیت: همه</option>
            <option value="RECORDED">ثبت‌شده</option>
            <option value="COMPLETED">تکمیل‌شده</option>
          </select>

          <ActivityPersianDateRangePicker
            value={dateRange}
            onChange={(value) => {
              setDateRange(value)
              resetPage()
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
              فیلترهای بیشتر
              {activeAdvanced ? (
                <span className="rounded-full bg-[var(--app-primary-soft)] px-1.5 text-xs text-[var(--app-primary)]">
                  {activeAdvanced.toLocaleString("fa-IR")}
                </span>
              ) : null}
            </PopoverTrigger>

            <PopoverContent
              align="end"
              className="w-[min(680px,calc(100vw-24px))] rounded-2xl p-4"
              dir="rtl"
            >
              <div className="mb-4 flex items-center gap-2 text-sm font-bold text-[var(--app-heading)]">
                <Filter className="size-4 text-[var(--app-primary)]" />
                فیلترهای بیشتر
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <SearchableCompanySelect
                  value={companyId || undefined}
                  onChange={(next) => {
                    setCompanyId(next || "")
                    setPerson(undefined)
                    setPersonSearch("")
                    resetPage()
                  }}
                  placeholder="همه شرکت‌ها"
                />

                <ActivityOptionSelect
                  value={person?.id}
                  selectedOption={person}
                  options={people.data || []}
                  onChange={(next) => {
                    setPerson(next)
                    resetPage()
                  }}
                  search={personSearch}
                  onSearchChange={setPersonSearch}
                  placeholder="همه اشخاص"
                  loading={people.isLoading}
                />

                <ActivityOptionSelect
                  value={ownerId || undefined}
                  options={ownerOptions}
                  onChange={(next) => {
                    setOwnerId(next?.id || "")
                    resetPage()
                  }}
                  search=""
                  onSearchChange={() => undefined}
                  placeholder="همه مالکان شرکت"
                  loading={owners.isLoading}
                  searchable={false}
                  disabled={scope === "mine"}
                />

                <select
                  className={selectClass}
                  value={team}
                  onChange={(event) => {
                    setTeam(event.target.value)
                    resetPage()
                  }}
                >
                  <option value="">تیم: همه</option>
                  {teams.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
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
            onClick={clearFilters}
          >
            <RotateCcw className="size-3.5" />
            پاک کردن فیلترها
          </Button>
        </div>
      </section>

      {activities.isLoading && !activities.data ? (
        <LoadingState />
      ) : activities.isError ? (
        <ErrorState
          title="خطا در دریافت فعالیت‌ها"
          description="دریافت فهرست فعالیت‌ها ناموفق بود."
          retryLabel="تلاش مجدد"
          onRetry={() => void activities.refetch()}
        />
      ) : activities.data ? (
        <div className="grid gap-3">
          <DataTableShell
            rows={
              Array.isArray(activities.data.data) ? activities.data.data : []
            }
            columns={columns}
            getRowKey={(item) => item.id}
            onRowClick={setDetailActivity}
            emptyState={
              <EmptyState
                icon={ActivityIcon}
                title="فعالیتی پیدا نشد"
                description="فعالیتی مطابق فیلترهای انتخاب‌شده وجود ندارد."
              />
            }
          />

          <PaginationControls page={activities.data.meta.page} pageCount={activities.data.meta.totalPages} pageSize={pageSize} total={activities.data.meta.total} onPageChange={setPage} onPageSizeChange={(value) => { setPageSize(value as 10 | 20 | 50 | 100); setPage(1) }} disabled={activities.isFetching} />
        </div>
      ) : null}

      <ActivityDetailDialog
        activity={detailActivity}
        stages={stageItems}
        open={Boolean(detailActivity)}
        onOpenChange={(open) => {
          if (!open) setDetailActivity(null)
        }}
        canUpdate={canUpdate}
        onEdit={() => {
          if (detailActivity) {
            setEditActivity(detailActivity)
          }
        }}
      />

      <ActivityFormDialog open={createOpen} onOpenChange={setCreateOpen} />

      <ActivityFormDialog
        open={Boolean(editActivity)}
        onOpenChange={(open) => {
          if (!open) setEditActivity(null)
        }}
        activity={editActivity}
      />
    </div>
  )
}
