import {
  BarChart3,
  CalendarRange,
  RefreshCcw,
  TrendingUp,
  UsersRound,
} from "lucide-react"
import { useMemo, useState } from "react"

import { ErrorState } from "@/components/shared/ErrorState"
import { PersianDateRangePicker } from "@/components/shared/PersianDateRangePicker"
import { Button } from "@workspace/ui/components/button"

import type { ReportFilters } from "../api/reportsApi"
import { useReportsOverview } from "../hooks/useReportsOverview"

function n(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0
}

function fa(value: number, maximumFractionDigits = 0) {
  return new Intl.NumberFormat("fa-IR", { maximumFractionDigits }).format(value)
}

function compact(value: number) {
  return new Intl.NumberFormat("fa-IR", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value)
}

function labelOf(item: Record<string, unknown>) {
  return String(
    item.stageName ??
      item.stage ??
      item.name ??
      item.ownerName ??
      item.fullName ??
      "—",
  )
}

function MetricCard({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string
  value: string
  hint: string
  icon: typeof TrendingUp
}) {
  return (
    <article className="rounded-[24px] border border-[var(--app-divider)] bg-[var(--app-surface)] p-5 shadow-[var(--app-shadow-card)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-2 text-2xl font-bold tracking-tight">{value}</p>
          <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
        </div>
        <div className="rounded-2xl bg-[var(--app-primary-soft)] p-3">
          <Icon className="size-5 text-[var(--app-primary)]" />
        </div>
      </div>
    </article>
  )
}

function HorizontalBars({
  items,
  value,
  suffix = "",
}: {
  items: Array<Record<string, unknown>>
  value: (item: Record<string, unknown>) => number
  suffix?: string
}) {
  const max = Math.max(1, ...items.map(value))
  if (!items.length) {
    return (
      <div className="py-12 text-center text-sm text-muted-foreground">
        داده‌ای برای نمایش وجود ندارد.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {items.slice(0, 8).map((item, index) => {
        const v = value(item)
        const width = v > 0 ? Math.max(4, (v / max) * 100) : 0
        return (
          <div key={`${labelOf(item)}-${index}`} className="space-y-1.5">
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="truncate font-medium">{labelOf(item)}</span>
              <span className="shrink-0 text-muted-foreground">
                {fa(v, 1)}
                {suffix}
              </span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-[var(--app-primary)] transition-all"
                style={{ width: `${width}%` }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

export function ReportsPage() {
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({})
  const [scope, setScope] = useState<"all" | "mine">("all")

  const filters = useMemo<ReportFilters>(
    () => ({
      startDate: dateRange.from?.toISOString(),
      endDate: dateRange.to?.toISOString(),
      ownershipScope: scope,
    }),
    [dateRange, scope],
  )

  const q = useReportsOverview(filters)

  const pipelineStages = (q.pipeline.data?.stages ?? []) as Array<
    Record<string, unknown>
  >
  const conversionStages = (q.conversion.data?.stages ?? []) as Array<
    Record<string, unknown>
  >
  const durations = (q.durations.data ?? []) as Array<Record<string, unknown>>
  const owners = (q.owners.data ?? []) as Array<Record<string, unknown>>

  const summary = q.pipeline.data?.summary

  const totalPipeline =
    n(summary?.totalValue) ||
    n(summary?.openValue) ||
    pipelineStages.reduce(
      (sum, item) => sum + n(item.totalValue ?? item.value),
      0,
    )

  const wonValue =
    n(summary?.wonValue) ||
    pipelineStages
      .filter((item) => /won|موفق|برد/i.test(labelOf(item)))
      .reduce((sum, item) => sum + n(item.totalValue ?? item.value), 0)

  const totalCompanies = n(q.conversion.data?.summary?.totalCompanies)
  const completedCompanies = n(q.conversion.data?.summary?.completedCompanies)

  const winRate =
    n(q.conversion.data?.summary?.overallConversionRate) ||
    (totalCompanies ? (completedCompanies / totalCompanies) * 100 : 0)

  const averageStageDays = durations.length
    ? durations.reduce(
        (sum, item) =>
          sum + n(item.averageDays ?? item.avgDays ?? item.duration),
        0,
      ) / durations.length
    : 0

  const isFetching =
    q.pipeline.isFetching ||
    q.conversion.isFetching ||
    q.durations.isFetching ||
    q.owners.isFetching

  const hasError =
    q.pipeline.isError ||
    q.conversion.isError ||
    q.durations.isError ||
    q.owners.isError

  const refresh = () => {
    void q.pipeline.refetch()
    void q.conversion.refetch()
    void q.durations.refetch()
    void q.owners.refetch()
  }

  return (
    <div className="grid gap-5" dir="rtl">
      <section className="relative overflow-hidden rounded-[30px] border border-[var(--app-divider)] bg-[var(--app-surface)] px-5 py-6 shadow-[var(--app-shadow-card)] sm:px-7">
        <div className="pointer-events-none absolute -end-20 -top-28 size-64 rounded-full bg-[var(--app-primary-soft)] blur-3xl" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[var(--app-divider)] bg-background/70 px-3 py-1 text-xs text-muted-foreground">
              <BarChart3 className="size-4" />
              تحلیل مدیریتی CRM
            </div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              گزارش‌ها و تحلیل عملکرد
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-muted-foreground">
              نمای یکپارچه از Pipeline، نرخ تبدیل، مدت حضور در مراحل و عملکرد
              مسئولان؛ نمودار برای درک سریع و جدول برای بررسی دقیق.
            </p>
          </div>
          <Button variant="outline" onClick={refresh} disabled={isFetching}>
            <RefreshCcw
              className={`ms-2 size-4 ${isFetching ? "animate-spin" : ""}`}
            />
            به‌روزرسانی
          </Button>
        </div>
      </section>

      <section className="rounded-[24px] border border-[var(--app-divider)] bg-[var(--app-surface)] p-3 shadow-[var(--app-shadow-card)]">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
          <div className="min-w-0 flex-1">
            <PersianDateRangePicker
              value={dateRange}
              onChange={(next) => setDateRange(next ?? {})}
            />
          </div>
          <div className="flex rounded-2xl bg-muted p-1">
            {(["all", "mine"] as const).map((value) => (
              <button
                key={value}
                type="button"
                className={`rounded-xl px-4 py-2 text-sm transition ${
                  scope === value
                    ? "bg-background font-medium shadow-sm"
                    : "text-muted-foreground"
                }`}
                onClick={() => setScope(value)}
              >
                {value === "all" ? "همه" : "متعلق به من"}
              </button>
            ))}
          </div>
        </div>
      </section>

      {hasError ? (
        <ErrorState
          title="دریافت گزارش‌ها با خطا مواجه شد"
          description="ارتباط با API گزارش‌ها را بررسی کنید."
          onRetry={refresh}
        />
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="ارزش Pipeline"
          value={compact(totalPipeline)}
          hint="فرصت‌های موجود در قیف فروش"
          icon={TrendingUp}
        />
        <MetricCard
          label="ارزش موفق"
          value={compact(wonValue)}
          hint="فرصت‌های Won در بازه انتخابی"
          icon={BarChart3}
        />
        <MetricCard
          label="نرخ تبدیل"
          value={`${fa(winRate, 1)}٪`}
          hint="نرخ تبدیل کلی"
          icon={TrendingUp}
        />
        <MetricCard
          label="میانگین ماندگاری مرحله"
          value={`${fa(averageStageDays, 1)} روز`}
          hint="میانگین زمان حضور در مراحل"
          icon={CalendarRange}
        />
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <article className="rounded-[24px] border border-[var(--app-divider)] bg-[var(--app-surface)] p-5 shadow-[var(--app-shadow-card)]">
          <div className="mb-5">
            <h2 className="font-semibold">Pipeline بر اساس مرحله</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              تعداد یا ارزش فرصت‌ها در مراحل فروش
            </p>
          </div>
          <HorizontalBars
            items={pipelineStages}
            value={(item) => n(item.count) || n(item.totalValue ?? item.value)}
          />
        </article>

        <article className="rounded-[24px] border border-[var(--app-divider)] bg-[var(--app-surface)] p-5 shadow-[var(--app-shadow-card)]">
          <div className="mb-5">
            <h2 className="font-semibold">نرخ تبدیل مراحل</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              مقایسه Conversion Rate بین مراحل
            </p>
          </div>
          <HorizontalBars
            items={conversionStages}
            value={(item) => n(item.conversionRate ?? item.rate)}
            suffix="٪"
          />
        </article>
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <article className="rounded-[24px] border border-[var(--app-divider)] bg-[var(--app-surface)] p-5 shadow-[var(--app-shadow-card)]">
          <div className="mb-5 flex items-center gap-2">
            <UsersRound className="size-5 text-[var(--app-primary)]" />
            <div>
              <h2 className="font-semibold">عملکرد مسئولان</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Pipeline و تعداد فرصت‌ها به تفکیک Owner
              </p>
            </div>
          </div>
          <HorizontalBars
            items={owners}
            value={(item) =>
              n(item.pipelineValue ?? item.totalValue) ||
              n(item.totalOpportunities ?? item.opportunityCount)
            }
          />
        </article>

        <article className="rounded-[24px] border border-[var(--app-divider)] bg-[var(--app-surface)] p-5 shadow-[var(--app-shadow-card)]">
          <div className="mb-5">
            <h2 className="font-semibold">مدت حضور در مراحل</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Stage Aging به روز
            </p>
          </div>
          <HorizontalBars
            items={durations}
            value={(item) =>
              n(item.averageDays ?? item.avgDays ?? item.duration)
            }
            suffix=" روز"
          />
        </article>
      </section>

      <section className="overflow-hidden rounded-[24px] border border-[var(--app-divider)] bg-[var(--app-surface)] shadow-[var(--app-shadow-card)]">
        <div className="border-b border-[var(--app-divider)] px-5 py-4">
          <h2 className="font-semibold">جدول عملکرد مسئولان</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            نمای دقیق داده‌های همان تحلیل‌های بالا
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr>
                <th className="px-5 py-3 text-right font-medium">مسئول</th>
                <th className="px-5 py-3 text-right font-medium">تعداد فرصت</th>
                <th className="px-5 py-3 text-right font-medium">ارزش Pipeline</th>
                <th className="px-5 py-3 text-right font-medium">ارزش Won</th>
              </tr>
            </thead>
            <tbody>
              {owners.length ? (
                owners.map((item, index) => (
                  <tr
                    key={`${labelOf(item)}-${index}`}
                    className="border-t border-[var(--app-divider)] hover:bg-muted/30"
                  >
                    <td className="px-5 py-4 font-medium">{labelOf(item)}</td>
                    <td className="px-5 py-4">
                      {fa(n(item.totalOpportunities ?? item.opportunityCount))}
                    </td>
                    <td className="px-5 py-4">
                      {compact(n(item.pipelineValue ?? item.totalValue))}
                    </td>
                    <td className="px-5 py-4">
                      {compact(n(item.wonValue))}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="px-5 py-10 text-center text-muted-foreground"
                  >
                    داده‌ای برای نمایش وجود ندارد.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

