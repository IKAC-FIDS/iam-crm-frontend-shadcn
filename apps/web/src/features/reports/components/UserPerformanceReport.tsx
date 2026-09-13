import {
  Activity,
  Building2,
  CircleDollarSign,
  ListChecks,
  RotateCcw,
  Target,
  UserRound,
} from "lucide-react"
import { useMemo, useState } from "react"

import { ErrorState } from "@/components/shared/ErrorState"
import {
  PersianDateRangePicker,
  type PersianDateRange,
} from "@/components/shared/PersianDateRangePicker"
import { SearchableOptionSelect } from "@/components/shared/SearchableOptionSelect"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { SurfaceCard } from "@/components/shared/SurfaceCard"
import { Button } from "@workspace/ui/components/button"

import {
  useReportFilterOptions,
  useUserPerformanceReport,
} from "../hooks/useReportsAnalytics"

const number = new Intl.NumberFormat("fa-IR")

export function UserPerformanceReport() {
  const [dateRange, setDateRange] = useState<PersianDateRange>()
  const [userId, setUserId] = useState<string>()
  const [userSearch, setUserSearch] = useState("")
  const filters = useMemo(
    () => ({
      startDate: dateRange?.from?.toISOString(),
      endDate: dateRange?.to?.toISOString(),
      userId,
    }),
    [dateRange, userId],
  )
  const query = useUserPerformanceReport(filters)
  const optionsQuery = useReportFilterOptions()
  const users = useMemo(() => {
    const needle = userSearch.trim().toLocaleLowerCase("fa")
    return (optionsQuery.data?.users ?? [])
      .filter((item) => item.isActive !== false)
      .filter(
        (item) =>
          !needle ||
          item.fullName.toLocaleLowerCase("fa").includes(needle) ||
          item.email?.toLocaleLowerCase("en").includes(needle),
      )
      .map((item) => ({
        id: item.id,
        label: item.fullName,
        secondary: item.email ?? undefined,
      }))
  }, [optionsQuery.data?.users, userSearch])

  return (
    <div className="grid gap-5">
      <SurfaceCard className="p-4 sm:p-5">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.7fr)_auto] lg:items-end">
          <div className="grid gap-2">
            <span className="text-xs font-bold text-[var(--app-heading)]">بازه گزارش</span>
            <PersianDateRangePicker
              value={dateRange}
              onChange={setDateRange}
              placeholder="همه زمان‌ها"
            />
          </div>
          <div className="grid gap-2">
            <span className="text-xs font-bold text-[var(--app-heading)]">کاربر</span>
            <SearchableOptionSelect
              value={userId}
              options={users}
              search={userSearch}
              onSearchChange={setUserSearch}
              onChange={setUserId}
              placeholder="همه کاربران"
              ariaLabel="انتخاب کاربر گزارش"
              loading={optionsQuery.isLoading}
            />
          </div>
          <Button
            type="button"
            variant="outline"
            className="rounded-xl"
            disabled={!dateRange && !userId}
            onClick={() => {
              setDateRange(undefined)
              setUserId(undefined)
              setUserSearch("")
            }}
          >
            <RotateCcw className="size-4" />
            پاک‌کردن فیلترها
          </Button>
        </div>
        <p className="mt-3 text-xs leading-6 text-[var(--app-text-secondary)]">
          بدون انتخاب کاربر یا بازه، گزارش تجمیعی همه کاربران در تمام زمان‌ها نمایش داده می‌شود.
        </p>
      </SurfaceCard>

      {query.isError ? (
        <ErrorState
          title="دریافت گزارش عملکرد انجام نشد"
          description="لطفاً دوباره تلاش کنید."
          onRetry={() => void query.refetch()}
        />
      ) : null}

      {query.isLoading ? (
        <SurfaceCard className="grid min-h-64 place-items-center text-sm text-[var(--app-text-secondary)]">
          در حال محاسبه گزارش عملکرد...
        </SurfaceCard>
      ) : null}

      {query.data ? <PerformanceContent data={query.data} /> : null}
    </div>
  )
}

function PerformanceContent({
  data,
}: {
  data: NonNullable<ReturnType<typeof useUserPerformanceReport>["data"]>
}) {
  const selectedLabel =
    data.users.length === 1 ? data.users[0]?.fullName : "همه کاربران"

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <UserRound className="size-4 text-[var(--app-primary)]" />
          <h2 className="text-base font-bold text-[var(--app-heading)]">عملکرد {selectedLabel}</h2>
        </div>
        <StatusBadge tone="neutral" dot={false}>
          {data.users.length === 1 ? "گزارش فردی" : `${number.format(data.users.length)} کاربر`}
        </StatusBadge>
      </div>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric icon={Activity} label="فعالیت‌های ثبت‌شده" value={data.activity.total} />
        <Metric icon={Building2} label="شرکت‌های ایجادشده" value={data.companiesCreated} />
        <Metric icon={ListChecks} label="کارهای ایجادشده" value={data.tasksCreated} />
        <Metric icon={Target} label="فرصت‌های ایجادشده" value={data.opportunities.total} />
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <SurfaceCard className="min-w-0 p-5">
          <h3 className="text-sm font-bold text-[var(--app-heading)]">فعالیت‌ها به تفکیک نوع فعال کتابخانه</h3>
          <p className="mt-1 text-xs text-[var(--app-text-secondary)]">نوع‌های غیرفعال در این تفکیک نمایش داده نمی‌شوند.</p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {data.activity.breakdown.map((item) => (
              <div key={item.code} className="flex items-center justify-between gap-3 rounded-2xl bg-[var(--app-background)] p-3">
                <span className="min-w-0 truncate text-xs font-bold">{item.label}</span>
                <StatusBadge tone={item.count ? "info" : "neutral"} dot={false}>{number.format(item.count)}</StatusBadge>
              </div>
            ))}
          </div>
          {data.activity.uncataloguedCount ? (
            <p className="mt-3 text-xs text-[var(--warning)]">
              {number.format(data.activity.uncataloguedCount)} فعالیت متعلق به نوع‌های غیرفعال یا حذف‌شده است.
            </p>
          ) : null}
        </SurfaceCard>

        <SurfaceCard className="min-w-0 p-5">
          <h3 className="text-sm font-bold text-[var(--app-heading)]">کارهای واگذارشده به کاربر</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <MiniMetric label="کل واگذاری" value={data.tasksAssigned.total} />
            <MiniMetric label="انجام‌شده" value={data.tasksAssigned.completed} tone="success" />
            <MiniMetric label="انجام‌نشده" value={data.tasksAssigned.incomplete} tone="warning" />
          </div>
          <p className="mt-4 text-xs leading-6 text-[var(--app-text-secondary)]">
            فیلتر زمانی این بخش بر اساس تاریخ ایجاد کار اعمال می‌شود و وضعیت، وضعیت فعلی کار است.
          </p>
        </SurfaceCard>
      </section>

      <SurfaceCard className="min-w-0 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-[var(--app-heading)]">نتیجه فرصت‌های ایجادشده</h3>
            <p className="mt-1 text-xs text-[var(--app-text-secondary)]">دسته‌بندی بر اساس مرحله فعلی فرصت انجام شده است.</p>
          </div>
          {data.financialVisible && data.opportunities.totalValue !== null ? (
            <div className="text-end">
              <p className="text-xs text-[var(--app-text-secondary)]">مجموع ارزش ثبت‌شده</p>
              <p className="mt-1 text-base font-bold">{money(data.opportunities.totalValue)}</p>
            </div>
          ) : null}
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <OpportunityMetric label="فعال" count={data.opportunities.active} value={data.opportunities.activeValue} tone="info" />
          <OpportunityMetric label="موفق" count={data.opportunities.won} value={data.opportunities.wonValue} tone="success" />
          <OpportunityMetric label="از دست‌رفته" count={data.opportunities.lost} value={data.opportunities.lostValue} tone="error" />
        </div>
      </SurfaceCard>
    </>
  )
}

function Metric({ icon: Icon, label, value }: { icon: typeof Activity; label: string; value: number }) {
  return <SurfaceCard className="flex items-center gap-3 p-4"><span className="grid size-10 place-items-center rounded-xl bg-[var(--app-primary-soft)] text-[var(--app-primary)]"><Icon className="size-5" /></span><div><p className="text-xs text-[var(--app-text-secondary)]">{label}</p><p className="mt-1 text-xl font-bold">{number.format(value)}</p></div></SurfaceCard>
}

function MiniMetric({ label, value, tone = "neutral" }: { label: string; value: number; tone?: "neutral" | "success" | "warning" }) {
  return <div className="rounded-2xl bg-[var(--app-background)] p-4"><StatusBadge tone={tone} dot={false}>{label}</StatusBadge><p className="mt-3 text-xl font-bold">{number.format(value)}</p></div>
}

function OpportunityMetric({ label, count, value, tone }: { label: string; count: number; value: number | null; tone: "info" | "success" | "error" }) {
  return <div className="rounded-2xl border border-[var(--app-divider)] p-4"><div className="flex items-center justify-between gap-2"><StatusBadge tone={tone}>{label}</StatusBadge><span className="text-lg font-bold">{number.format(count)}</span></div>{value !== null ? <div className="mt-4 flex items-center gap-2 text-xs text-[var(--app-text-secondary)]"><CircleDollarSign className="size-4" /><span>{money(value)}</span></div> : null}</div>
}

function money(value: number) {
  return `${number.format(Math.round(value))} ریال`
}
