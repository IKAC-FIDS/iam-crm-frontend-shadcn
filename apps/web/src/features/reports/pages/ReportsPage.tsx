import {
  Activity,
  ArrowDown,
  ArrowUp,
  CircleAlert,
  RefreshCcw,
  RotateCcw,
  Target,
  TimerReset,
  TrendingUp,
  UsersRound,
} from "lucide-react"
import { useMemo, useState } from "react"

import { ErrorState } from "@/components/shared/ErrorState"
import {
  PersianDateRangePicker,
  type PersianDateRange,
} from "@/components/shared/PersianDateRangePicker"
import { Button } from "@workspace/ui/components/button"

import type {
  ComparisonMetric,
  ConversionHealth,
  ReportFilters,
} from "../api/reportsApi"
import { useReportsAnalytics } from "../hooks/useReportsAnalytics"

function fa(value: number, digits = 0) {
  return new Intl.NumberFormat("fa-IR", { maximumFractionDigits: digits }).format(value)
}

function monthLabel(value: string) {
  const [year, month] = value.split("-").map(Number)
  return new Intl.DateTimeFormat("fa-IR", {
    year: "2-digit",
    month: "short",
  }).format(new Date(Date.UTC(year, month - 1, 1)))
}

function MetricDelta({ metric, inverse = false, suffix = "%" }: {
  metric: ComparisonMetric
  inverse?: boolean
  suffix?: string
}) {
  const neutral = metric.delta === 0
  const positive = inverse ? metric.delta < 0 : metric.delta > 0
  const Icon = metric.delta > 0 ? ArrowUp : metric.delta < 0 ? ArrowDown : Activity

  return (
    <span className={[
      "inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium",
      neutral
        ? "bg-muted text-muted-foreground"
        : positive
          ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
          : "bg-red-500/10 text-red-700 dark:text-red-400",
    ].join(" ")}>
      <Icon className="size-3.5" />
      {neutral ? "بدون تغییر" : `${fa(Math.abs(metric.delta), 1)}${suffix}`}
      <span className="opacity-70">نسبت به دوره قبل</span>
    </span>
  )
}

function KpiCard({ title, value, helper, metric, inverse, suffix, icon: Icon }: {
  title: string
  value: string
  helper: string
  metric: ComparisonMetric
  inverse?: boolean
  suffix?: string
  icon: typeof TrendingUp
}) {
  return (
    <article className="rounded-[24px] border border-[var(--app-divider)] bg-[var(--app-surface)] p-5 shadow-[var(--app-shadow-card)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="mt-2 text-3xl font-black tracking-tight">{value}</p>
          <p className="mt-1 text-xs leading-6 text-muted-foreground">{helper}</p>
        </div>
        <div className="rounded-2xl bg-[var(--app-primary-soft)] p-3 text-[var(--app-primary)]">
          <Icon className="size-5" />
        </div>
      </div>
      <div className="mt-4">
        <MetricDelta metric={metric} inverse={inverse} suffix={suffix} />
      </div>
    </article>
  )
}

function OutcomeDonut({ data }: { data: ConversionHealth["outcomes"] }) {
  const won = data.find((item) => item.key === "won")?.rate ?? 0
  const lost = data.find((item) => item.key === "lost")?.rate ?? 0
  const hold = data.find((item) => item.key === "onHold")?.rate ?? 0
  const gradient = `conic-gradient(#2E7D32 0 ${won}%, #C62828 ${won}% ${won + lost}%, #F9A825 ${won + lost}% ${won + lost + hold}%, #2196F3 ${won + lost + hold}% 100%)`
  const tone: Record<string, string> = {
    won: "#2E7D32",
    lost: "#C62828",
    onHold: "#F9A825",
    active: "#2196F3",
  }

  return (
    <div className="grid gap-6 md:grid-cols-[210px_1fr] md:items-center">
      <div className="relative mx-auto size-48 rounded-full" style={{ background: gradient }}>
        <div className="absolute inset-7 grid place-items-center rounded-full bg-[var(--app-surface)] text-center">
          <div>
            <div className="text-3xl font-black">{fa(won, 1)}%</div>
            <div className="mt-1 text-xs text-muted-foreground">تبدیل به مشتری</div>
          </div>
        </div>
      </div>

      <div className="grid gap-3">
        {data.map((item) => (
          <div key={item.key} className="flex items-center justify-between rounded-2xl border border-[var(--app-divider)] px-4 py-3">
            <div className="flex items-center gap-3">
              <span className="size-3 rounded-full" style={{ backgroundColor: tone[item.key] }} />
              <span className="text-sm font-medium">{item.label}</span>
            </div>
            <div className="text-left">
              <span className="font-bold">{fa(item.rate, 1)}%</span>
              <span className="ms-2 text-xs text-muted-foreground">{fa(item.count)} مورد</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function MilestoneChart({ data }: { data: ConversionHealth["milestones"] }) {
  return (
    <div className="space-y-4">
      {data.map((item, index) => (
        <div key={item.key} className="grid grid-cols-[110px_1fr_72px] items-center gap-3">
          <div>
            <p className="truncate text-sm font-medium">{item.label}</p>
            {index > 0 ? <p className="text-[11px] text-muted-foreground">Reach rate</p> : null}
          </div>
          <div className="h-4 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-[var(--app-primary)] transition-all"
              style={{
                width: `${Math.max(item.reachRate > 0 ? 3 : 0, item.reachRate)}%`,
                opacity: Math.max(0.42, 1 - index * 0.08),
              }}
            />
          </div>
          <div className="text-left font-bold">{fa(item.reachRate, 1)}%</div>
        </div>
      ))}
    </div>
  )
}

function TrendChart({ data }: { data: ConversionHealth["trend"] }) {
  if (!data.length) {
    return <div className="grid h-60 place-items-center text-sm text-muted-foreground">داده‌ای برای روند زمانی وجود ندارد.</div>
  }

  const width = 760
  const height = 240
  const padding = 30
  const max = Math.max(1, ...data.flatMap((item) => [item.leads, item.won]))
  const points = (key: "leads" | "won") => data.map((item, index) => {
    const x = data.length <= 1 ? width / 2 : padding + (index * (width - padding * 2)) / (data.length - 1)
    const y = height - padding - (item[key] / max) * (height - padding * 2)
    return `${x},${y}`
  }).join(" ")

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-4 text-xs">
        <span className="inline-flex items-center gap-2"><i className="h-0.5 w-5 bg-[#2196F3]" />سرنخ‌های ایجادشده</span>
        <span className="inline-flex items-center gap-2"><i className="h-0.5 w-5 bg-[#2E7D32]" />مشتری‌شده</span>
      </div>
      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="min-w-[620px]">
          {[0.25, 0.5, 0.75].map((ratio) => (
            <line key={ratio} x1={padding} x2={width - padding} y1={padding + ratio * (height - padding * 2)} y2={padding + ratio * (height - padding * 2)} stroke="currentColor" className="text-border" strokeDasharray="4 6" />
          ))}
          <polyline fill="none" stroke="#2196F3" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" points={points("leads")} />
          <polyline fill="none" stroke="#2E7D32" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" points={points("won")} />
          {data.map((item, index) => {
            const x = data.length <= 1 ? width / 2 : padding + (index * (width - padding * 2)) / (data.length - 1)
            return <text key={item.month} x={x} y={height - 4} textAnchor="middle" className="fill-muted-foreground text-[11px]">{monthLabel(item.month)}</text>
          })}
        </svg>
      </div>
    </div>
  )
}

function OwnerScatter({ data }: { data: ConversionHealth["owners"] }) {
  if (!data.length) {
    return <div className="grid h-64 place-items-center text-sm text-muted-foreground">داده‌ای برای مقایسه تیم وجود ندارد.</div>
  }

  const width = 620
  const height = 300
  const padding = 48
  const maxValue = Math.max(1, ...data.map((item) => item.pipelineValue))

  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${width} ${height}`} className="min-w-[560px]">
        <line x1={padding} x2={padding} y1={padding} y2={height - padding} stroke="currentColor" className="text-border" />
        <line x1={padding} x2={width - padding} y1={height - padding} y2={height - padding} stroke="currentColor" className="text-border" />
        <text x={width / 2} y={height - 8} textAnchor="middle" className="fill-muted-foreground text-[11px]">ارزش Pipeline</text>
        <text x={14} y={height / 2} transform={`rotate(-90 14 ${height / 2})`} textAnchor="middle" className="fill-muted-foreground text-[11px]">نرخ تبدیل</text>
        {data.map((item) => {
          const x = padding + (item.pipelineValue / maxValue) * (width - padding * 2)
          const y = height - padding - (Math.min(100, item.conversionRate) / 100) * (height - padding * 2)
          const r = Math.max(7, Math.min(15, 6 + Math.sqrt(item.total)))
          return (
            <g key={item.ownerId}>
              <circle cx={x} cy={y} r={r} fill="var(--app-primary)" fillOpacity="0.72" stroke="var(--app-surface)" strokeWidth="3" />
              <text x={x} y={y - r - 6} textAnchor="middle" className="fill-foreground text-[10px] font-medium">{item.ownerName}</text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

function InsightCards({ data }: { data: ConversionHealth }) {
  const leakage = data.biggestLeakage
  return (
    <section className="grid gap-4 lg:grid-cols-3">
      <article className="rounded-[22px] border border-[var(--app-divider)] bg-[var(--app-surface)] p-5">
        <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400"><CircleAlert className="size-5" /><h3 className="font-bold">بزرگ‌ترین نشتی</h3></div>
        {leakage ? (
          <><p className="mt-4 text-2xl font-black">{fa(leakage.dropRate, 1)}%</p><p className="mt-1 text-sm leading-7 text-muted-foreground">بین «{leakage.fromLabel}» و «{leakage.toLabel}»؛ {fa(leakage.dropCount)} فرصت به Milestone بعدی نرسیده‌اند.</p></>
        ) : <p className="mt-4 text-sm text-muted-foreground">برای تشخیص Bottleneck داده کافی نیست.</p>}
      </article>

      <article className="rounded-[22px] border border-[var(--app-divider)] bg-[var(--app-surface)] p-5">
        <div className="flex items-center gap-2 text-[var(--app-primary)]"><Target className="size-5" /><h3 className="font-bold">کیفیت تبدیل</h3></div>
        <p className="mt-4 text-2xl font-black">{fa(data.summary.leadToCustomer.current, 1)}%</p>
        <p className="mt-1 text-sm leading-7 text-muted-foreground">از سرنخ‌های Cohort انتخابی نهایتاً به مشتری تبدیل شده‌اند؛ مسیر میانی در این محاسبه دخالت ندارد.</p>
      </article>

      <article className="rounded-[22px] border border-[var(--app-divider)] bg-[var(--app-surface)] p-5">
        <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400"><RotateCcw className="size-5" /><h3 className="font-bold">Recovery از توقف</h3></div>
        <p className="mt-4 text-2xl font-black">{fa(data.recovery.rate, 1)}%</p>
        <p className="mt-1 text-sm leading-7 text-muted-foreground">از فرصت‌هایی که وارد «متوقف شده» شده‌اند دوباره به Pipeline برگشته‌اند.</p>
      </article>
    </section>
  )
}

export function ReportsPage() {
  const [dateRange, setDateRange] = useState<PersianDateRange | undefined>()
  const [scope, setScope] = useState<"all" | "mine">("all")

  const filters = useMemo<ReportFilters>(() => ({
    startDate: dateRange?.from?.toISOString(),
    endDate: dateRange?.to?.toISOString(),
    ownershipScope: scope,
  }), [dateRange, scope])

  const query = useReportsAnalytics(filters)
  const data = query.data

  return (
    <div className="grid gap-5" dir="rtl">
      <section className="relative overflow-hidden rounded-[30px] border border-[var(--app-divider)] bg-[var(--app-surface)] px-5 py-6 shadow-[var(--app-shadow-card)] sm:px-7">
        <div className="pointer-events-none absolute -end-16 -top-20 size-64 rounded-full bg-[var(--app-primary-soft)] blur-3xl" />
        <div className="relative flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[var(--app-divider)] bg-background/70 px-3 py-1 text-xs text-muted-foreground"><TrendingUp className="size-4" />Sales Intelligence</div>
            <h1 className="text-2xl font-black tracking-tight sm:text-3xl">تحلیل فروش و سلامت Pipeline</h1>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-muted-foreground">تمرکز این صفحه روی نتیجه و الگو است: چند درصد سرنخ‌ها مشتری شدند، نشتی کجا نشست دارد، چرخه فروش چقدر طول می‌کشد و چه بخشی از Pipeline از توقف بازیابی می‌شود.</p>
          </div>
          <Button variant="outline" onClick={() => void query.refetch()} disabled={query.isFetching}>
            <RefreshCcw className={`ms-2 size-4 ${query.isFetching ? "animate-spin" : ""}`} />به‌روزرسانی
          </Button>
        </div>
      </section>

      <section className="rounded-[24px] border border-[var(--app-divider)] bg-[var(--app-surface)] p-3 shadow-[var(--app-shadow-card)]">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
          <div className="min-w-0 flex-1"><PersianDateRangePicker value={dateRange} onChange={setDateRange} placeholder="۹۰ روز اخیر" /></div>
          <div className="flex rounded-2xl bg-muted p-1">
            {(["all", "mine"] as const).map((value) => (
              <button key={value} type="button" onClick={() => setScope(value)} className={["rounded-xl px-4 py-2 text-sm transition", scope === value ? "bg-background font-medium shadow-sm" : "text-muted-foreground"].join(" ")}>{value === "all" ? "همه" : "متعلق به من"}</button>
            ))}
          </div>
        </div>
      </section>

      {query.isError ? <ErrorState title="دریافت تحلیل فروش با خطا مواجه شد" description="Endpoint جدید conversion-health را در Backend بررسی کنید." retryLabel="تلاش مجدد" onRetry={() => void query.refetch()} /> : null}
      {query.isLoading ? <div className="grid min-h-72 place-items-center rounded-[24px] border border-[var(--app-divider)] bg-[var(--app-surface)] text-sm text-muted-foreground">در حال تحلیل داده‌های فروش...</div> : null}

      {data ? (
        <>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <KpiCard title="Lead → Customer" value={`${fa(data.summary.leadToCustomer.current, 1)}%`} helper={`از ${fa(data.summary.totalLeads)} سرنخ Cohort انتخابی`} metric={data.summary.leadToCustomer} icon={Target} />
            <KpiCard title="Median Time to Win" value={`${fa(data.summary.medianTimeToWinDays.current, 1)} روز`} helper="زمان میانه از ایجاد سرنخ تا رسیدن به Won" metric={data.summary.medianTimeToWinDays} inverse suffix=" روز" icon={TimerReset} />
            <KpiCard title="Lost Rate" value={`${fa(data.summary.lostRate.current, 1)}%`} helper="سهم Lost و No Response از Cohort" metric={data.summary.lostRate} inverse icon={CircleAlert} />
            <KpiCard title="Recovery Rate" value={`${fa(data.summary.recoveryRate.current, 1)}%`} helper="بازگشت از On Hold به Pipeline" metric={data.summary.recoveryRate} icon={RotateCcw} />
          </section>

          <section className="rounded-[24px] border border-[var(--app-divider)] bg-[var(--app-surface)] p-5 shadow-[var(--app-shadow-card)]">
            <div className="mb-5"><h2 className="text-lg font-bold">روند جذب تا تبدیل</h2><p className="mt-1 text-sm text-muted-foreground">سرنخ‌های ایجادشده و مشتری‌شده در طول Cohort انتخابی</p></div>
            <TrendChart data={data.trend} />
          </section>

          <section className="grid gap-5 xl:grid-cols-2">
            <article className="rounded-[24px] border border-[var(--app-divider)] bg-[var(--app-surface)] p-5 shadow-[var(--app-shadow-card)]">
              <div className="mb-5"><h2 className="text-lg font-bold">Outcome سرنخ‌ها</h2><p className="mt-1 text-sm text-muted-foreground">نتیجه فعلی Cohort بدون نمایش مسیرهای شلوغ میانی</p></div>
              <OutcomeDonut data={data.outcomes} />
            </article>
            <article className="rounded-[24px] border border-[var(--app-divider)] bg-[var(--app-surface)] p-5 shadow-[var(--app-shadow-card)]">
              <div className="mb-5"><h2 className="text-lg font-bold">Milestone Reach</h2><p className="mt-1 text-sm text-muted-foreground">درصد سرنخ‌هایی که حداقل یک‌بار به هر نقطه کلیدی فرآیند رسیده‌اند</p></div>
              <MilestoneChart data={data.milestones} />
            </article>
          </section>

          <section className="rounded-[24px] border border-[var(--app-divider)] bg-[var(--app-surface)] p-5 shadow-[var(--app-shadow-card)]">
            <div className="mb-5 flex items-start justify-between gap-4"><div><h2 className="text-lg font-bold">Performance Map تیم فروش</h2><p className="mt-1 text-sm text-muted-foreground">موقعیت هر Owner بر اساس ارزش Pipeline و نرخ تبدیل؛ اندازه نقطه نماینده تعداد Opportunityها است.</p></div><UsersRound className="size-5 text-[var(--app-primary)]" /></div>
            <OwnerScatter data={data.owners} />
          </section>

          <InsightCards data={data} />
        </>
      ) : null}
    </div>
  )
}