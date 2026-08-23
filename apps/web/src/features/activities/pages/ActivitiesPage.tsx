import { Building2, Pencil, Plus, RotateCcw, Search } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"

import { ErrorState } from "@/components/shared/ErrorState"
import { LoadingState } from "@/components/shared/LoadingState"
import { PageHeader } from "@/components/shared/PageHeader"
import { PaginationControls } from "@/components/shared/PaginationControls"
import { PersianDateRangePicker, type PersianDateRange } from "@/components/shared/PersianDateRangePicker"
import { SearchableCompanySelect } from "@/features/people/components/SearchableCompanySelect"
import { useAuthStore } from "@/store/authStore"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"

import { ActivityFormDialog } from "../components/ActivityFormDialog"
import { ActivityOptionSelect } from "../components/ActivityOptionSelect"
import {
  useActivities,
  useActivityOwnerOptions,
  useActivityPeopleOptions,
} from "../hooks/useActivities"
import {
  ACTIVITY_TYPE_OPTIONS,
  type Activity,
  type ActivityOption,
  type ActivityStatus,
  type ActivityType,
} from "../types/activity.types"

function useDebounced(value: string, delay = 350) {
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
    year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit",
  }).format(date)
}

function typeLabel(type: ActivityType) {
  return ACTIVITY_TYPE_OPTIONS.find((item) => item.value === type)?.label || type
}

export function ActivitiesPage() {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const permissions = user?.permissions ?? []
  const canView = permissions.includes("activity:view")
  const canCreate = permissions.includes("activity:create")
  const canUpdate = permissions.includes("activity:update")

  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [activityType, setActivityType] = useState<"" | ActivityType>("")
  const [status, setStatus] = useState<"" | ActivityStatus>("")
  const [companyId, setCompanyId] = useState("")
  const [person, setPerson] = useState<ActivityOption>()
  const [personSearch, setPersonSearch] = useState("")
  const [ownerId, setOwnerId] = useState("")
  const [team, setTeam] = useState("")
  const [mine, setMine] = useState(false)
  const [dateRange, setDateRange] = useState<PersianDateRange>()
  const [createOpen, setCreateOpen] = useState(false)
  const [editActivity, setEditActivity] = useState<Activity | null>(null)

  const debouncedSearch = useDebounced(search, 400)
  const debouncedPersonSearch = useDebounced(personSearch, 300)
  const people = useActivityPeopleOptions(companyId, debouncedPersonSearch, canView)
  const owners = useActivityOwnerOptions(canView)

  const teams = useMemo(() => Array.from(new Set(
    (owners.data || []).map((item) => item.team).filter((item): item is string => Boolean(item))
  )).sort((a, b) => a.localeCompare(b, "fa")), [owners.data])

  const ownerOptions = useMemo(() => (owners.data || []).map((item) => ({
    id: item.id, label: item.label, secondary: item.secondary,
  })), [owners.data])

  const query = useMemo(() => {
    const from = dateRange?.from
      ? new Date(dateRange.from.getFullYear(), dateRange.from.getMonth(), dateRange.from.getDate(), 0, 0, 0, 0)
      : undefined
    const to = dateRange?.to
      ? new Date(dateRange.to.getFullYear(), dateRange.to.getMonth(), dateRange.to.getDate(), 23, 59, 59, 999)
      : undefined

    return {
      page,
      limit: 20 as const,
      search: debouncedSearch.trim() || undefined,
      activityType: activityType || undefined,
      status: status || undefined,
      companyId: companyId || undefined,
      personId: person?.id,
      ownerId: mine ? undefined : ownerId || undefined,
      team: team || undefined,
      mine: mine || undefined,
      dateFrom: from?.toISOString(),
      dateTo: to?.toISOString(),
      sortBy: "activityDate" as const,
      sortOrder: "desc" as const,
    }
  }, [activityType, companyId, dateRange, debouncedSearch, mine, ownerId, page, person?.id, status, team])

  const activities = useActivities(query, canView)
  const resetPage = () => setPage(1)

  function clearFilters() {
    setSearch("")
    setActivityType("")
    setStatus("")
    setCompanyId("")
    setPerson(undefined)
    setPersonSearch("")
    setOwnerId("")
    setTeam("")
    setMine(false)
    setDateRange(undefined)
    setPage(1)
  }

  if (!canView) {
    return <div className="p-4 sm:p-6"><ErrorState title="عدم دسترسی" description="شما مجوز مشاهده فعالیت‌ها را ندارید." /></div>
  }

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <PageHeader
        title="فعالیت‌ها"
        description="سوابق تعاملات و اقدامات انجام‌شده با مشتریان را مشاهده و مدیریت کنید."
        actions={canCreate ? <Button type="button" onClick={() => setCreateOpen(true)}><Plus className="size-4" />ثبت فعالیت</Button> : undefined}
      />

      <div className="rounded-[var(--app-radius-card)] border border-[var(--app-divider)] bg-[var(--app-surface)] p-4 shadow-[var(--app-shadow-card)]">
        <div className="grid gap-3 lg:grid-cols-4">
          <div className="relative lg:col-span-2">
            <Search className="absolute end-3 top-1/2 size-4 -translate-y-1/2 text-[var(--app-icon-muted)]" />
            <Input value={search} onChange={(e) => { setSearch(e.target.value); resetPage() }} placeholder="جستجو در نتیجه، یادداشت، شخص یا شرکت" className="h-11 rounded-xl pe-9" />
          </div>

          <select value={activityType} onChange={(e) => { setActivityType(e.target.value as "" | ActivityType); resetPage() }} className="h-11 rounded-xl border border-input bg-background px-3 text-sm">
            <option value="">همه انواع فعالیت</option>
            {ACTIVITY_TYPE_OPTIONS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>

          <select value={status} onChange={(e) => { setStatus(e.target.value as "" | ActivityStatus); resetPage() }} className="h-11 rounded-xl border border-input bg-background px-3 text-sm">
            <option value="">همه وضعیت‌ها</option>
            <option value="RECORDED">ثبت‌شده</option>
            <option value="COMPLETED">تکمیل‌شده</option>
          </select>

          <SearchableCompanySelect
            value={companyId || undefined}
            onChange={(next) => { setCompanyId(next || ""); setPerson(undefined); setPersonSearch(""); resetPage() }}
            placeholder="همه شرکت‌ها"
          />

          <ActivityOptionSelect
            value={person?.id}
            selectedOption={person}
            options={people.data || []}
            onChange={(next) => { setPerson(next); resetPage() }}
            search={personSearch}
            onSearchChange={setPersonSearch}
            placeholder="همه اشخاص"
            loading={people.isLoading}
          />

          <ActivityOptionSelect
            value={ownerId || undefined}
            options={ownerOptions}
            onChange={(next) => { setOwnerId(next?.id || ""); resetPage() }}
            search=""
            onSearchChange={() => undefined}
            placeholder="همه مالکان"
            loading={owners.isLoading}
            searchable={false}
            disabled={mine}
          />

          <select value={team} onChange={(e) => { setTeam(e.target.value); resetPage() }} className="h-11 rounded-xl border border-input bg-background px-3 text-sm">
            <option value="">همه تیم‌ها</option>
            {teams.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>

          <div className="lg:col-span-2"><PersianDateRangePicker value={dateRange} onChange={(next) => { setDateRange(next); resetPage() }} placeholder="بازه تاریخ فعالیت" /></div>

          <label className="flex h-11 items-center gap-2 rounded-xl border border-input px-3 text-sm">
            <input type="checkbox" checked={mine} onChange={(e) => { setMine(e.target.checked); if (e.target.checked) setOwnerId(""); resetPage() }} />فعالیت‌های من
          </label>

          <Button type="button" variant="outline" className="h-11 rounded-xl" onClick={clearFilters}><RotateCcw className="size-4" />پاک کردن فیلترها</Button>
        </div>
      </div>

      {activities.isLoading && !activities.data ? (
        <LoadingState />
      ) : activities.isError ? (
        <ErrorState title="خطا در دریافت فعالیت‌ها" description="دریافت فهرست فعالیت‌ها ناموفق بود." retryLabel="تلاش مجدد" onRetry={() => void activities.refetch()} />
      ) : activities.data ? (
        <div className="overflow-hidden rounded-[var(--app-radius-card)] border border-[var(--app-divider)] bg-[var(--app-surface)] shadow-[var(--app-shadow-card)]">
          <div className="flex items-center justify-between border-b border-[var(--app-divider)] px-4 py-3">
            <p className="text-xs text-[var(--app-text-secondary)]">مجموع {activities.data.meta.total.toLocaleString("fa-IR")} فعالیت</p>
            {activities.isFetching ? <span className="text-xs text-[var(--app-text-secondary)]">در حال بروزرسانی...</span> : null}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1040px] text-sm">
              <thead className="bg-[var(--app-background)]/65 text-xs text-[var(--app-text-secondary)]">
                <tr className="border-b border-[var(--app-divider)]">
                  {['نوع','عنوان / شرح','شخص','شرکت','ایجادکننده','وضعیت','تاریخ فعالیت','تاریخ ایجاد','عملیات'].map((h) => <th key={h} className="px-4 py-3 text-start font-medium">{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {activities.data.data.map((row) => {
                  const rowCompanyId = row.companyId || row.company?.id || ""
                  return (
                    <tr key={row.id} className="border-b border-[var(--app-divider)] last:border-0 hover:bg-[var(--app-background)]/55">
                      <td className="px-4 py-3"><span className="inline-flex rounded-full border border-[var(--app-divider)] bg-[var(--app-background)] px-2.5 py-1 text-xs">{typeLabel(row.type)}</span></td>
                      <td className="max-w-[280px] px-4 py-3"><div className="font-medium text-[var(--app-heading)]">{row.title || row.outcome || typeLabel(row.type)}</div>{row.description || row.notes ? <div className="mt-1 line-clamp-2 text-xs leading-5 text-[var(--app-text-secondary)]">{row.description || row.notes}</div> : null}</td>
                      <td className="px-4 py-3">{row.person?.fullName || '—'}</td>
                      <td className="px-4 py-3">{row.company?.brandName || row.company?.legalName || '—'}</td>
                      <td className="px-4 py-3">{row.createdBy?.fullName || row.user?.fullName || '—'}</td>
                      <td className="px-4 py-3">{row.status === 'COMPLETED' ? 'تکمیل‌شده' : 'ثبت‌شده'}</td>
                      <td className="whitespace-nowrap px-4 py-3">{formatDate(row.activityDate || row.occurredAt)}</td>
                      <td className="whitespace-nowrap px-4 py-3">{formatDate(row.createdAt)}</td>
                      <td className="px-4 py-3"><div className="flex items-center gap-1">
                        {rowCompanyId ? <Button type="button" size="icon" variant="ghost" title="مشاهده شرکت" onClick={() => navigate(`/companies/${rowCompanyId}`)}><Building2 className="size-4" /></Button> : null}
                        {canUpdate && row.type !== 'STAGE_CHANGE' ? <Button type="button" size="icon" variant="ghost" title="ویرایش فعالیت" onClick={() => setEditActivity(row)}><Pencil className="size-4" /></Button> : null}
                      </div></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {!activities.data.data.length ? <div className="px-4 py-16 text-center text-sm text-[var(--app-text-secondary)]">هیچ فعالیتی با فیلترهای انتخاب‌شده پیدا نشد.</div> : null}
          <div className="border-t border-[var(--app-divider)] p-4"><PaginationControls page={page} pageCount={activities.data.meta.totalPages} onPageChange={setPage} disabled={activities.isFetching} /></div>
        </div>
      ) : null}

      <ActivityFormDialog open={createOpen} onOpenChange={setCreateOpen} />
      <ActivityFormDialog open={Boolean(editActivity)} onOpenChange={(next) => { if (!next) setEditActivity(null) }} activity={editActivity} />
    </div>
  )
}
