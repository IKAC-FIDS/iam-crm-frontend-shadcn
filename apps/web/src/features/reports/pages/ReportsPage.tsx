import {
  Activity,
  ArrowDown,
  ArrowUp,
  BarChart3,
  CalendarRange,
  CircleAlert,
  RotateCcw,
  Target,
  TimerReset,
  TrendingUp,
  UsersRound,
} from "lucide-react"
import { useMemo, useState } from "react"

import { MetricCard } from "@/components/shared/MetricCard"
import {
  DashboardMetricGrid,
  DashboardSection,
} from "@/components/shared/DashboardSection"
import { DashboardToolbar } from "@/components/shared/DashboardToolbar"
import { ContentSection } from "@/components/shared/ContentSection"
import { EntityListPage } from "@/components/shared/EntityListPage"
import { PageHero } from "@/components/shared/PageHero"
import { QueryContent } from "@/components/shared/QueryContent"
import { PersianDateRangePicker } from "@/components/shared/date"
import type { DateRangeValue } from "@/lib/date/jalali"
import type {
  ComparisonMetric,
  ConversionHealth,
  ReportFilters,
} from "../api/reportsApi"
import { useReportsAnalytics } from "../hooks/useReportsAnalytics"
import { UserPerformanceReport } from "../components/UserPerformanceReport"
import { useAuthStore } from "@/store/authStore"
import { canViewFinancials } from "@/lib/permissions"

function fa(value: number, digits = 0) {
  return new Intl.NumberFormat("fa-IR", {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(value)
}

function monthLabel(value: string) {
  const [year, month] = value.split("-").map(Number)
  return new Intl.DateTimeFormat("fa-IR", {
    calendar: "persian",
    year: "2-digit",
    month: "short",
  }).format(new Date(Date.UTC(year, month - 1, 1)))
}

function normalizeText(value: string) {
  return value.replace(/ي/g, "ی").replace(/ك/g, "ک").replace(/\s+/g, " ").trim()
}

function findMilestoneRate(
  milestones: ConversionHealth["milestones"],
  matchers: string[]
) {
  const hit = milestones.find((item) => {
    const label = normalizeText(item.label).toLowerCase()
    const key = item.key.toLowerCase()
    return matchers.some((matcher) => {
      const needle = normalizeText(matcher).toLowerCase()
      return label.includes(needle) || key.includes(needle)
    })
  })

  return hit?.reachRate ?? 0
}

function MetricDelta({
  metric,
  inverse = false,
  suffix = "%",
}: {
  metric: ComparisonMetric
  inverse?: boolean
  suffix?: string
}) {
  const neutral = metric.delta === 0
  const positive = inverse ? metric.delta < 0 : metric.delta > 0
  const Icon =
    metric.delta > 0 ? ArrowUp : metric.delta < 0 ? ArrowDown : Activity

  return (
    <span
      className={[
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium",
        neutral
          ? "bg-muted text-muted-foreground"
          : positive
            ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
            : "bg-red-500/10 text-red-700 dark:text-red-400",
      ].join(" ")}
    >
      <Icon className="size-3.5" />
      {neutral ? "بدون تغییر" : `${fa(Math.abs(metric.delta), 1)}${suffix}`}
      <span className="opacity-70">نسبت به دوره قبل</span>
    </span>
  )
}

function KpiCard({
  title,
  value,
  helper,
  metric,
  inverse,
  suffix,
  icon: Icon,
}: {
  title: string
  value: string
  helper: string
  metric: ComparisonMetric
  inverse?: boolean
  suffix?: string
  icon: typeof TrendingUp
}) {
  return (
    <MetricCard
      label={title}
      value={value}
      icon={Icon}
      helper={
        <>
          <span className="block leading-6">{helper}</span>
          <span className="mt-3 block">
            <MetricDelta metric={metric} inverse={inverse} suffix={suffix} />
          </span>
        </>
      }
    />
  )
}

function LeadStatusChart({ data }: { data: ConversionHealth["outcomes"] }) {
  const colors: Record<string, string> = {
    won: "var(--success)",
    lost: "var(--destructive)",
    onHold: "var(--warning)",
    active: "var(--info)",
  }

  const ordered = ["active", "won", "lost", "onHold"]
    .map((key) => data.find((item) => item.key === key))
    .filter(Boolean) as ConversionHealth["outcomes"]

  const wonRate = ordered.find((item) => item.key === "won")?.rate ?? 0
  let pointer = 0
  const segments = ordered.map((item) => {
    const start = pointer
    pointer += item.rate
    return `${colors[item.key]} ${start}% ${pointer}%`
  })
  const gradient = `conic-gradient(${segments.join(", ")})`

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_320px] lg:items-center">
      <div className="grid gap-3">
        {ordered.map((item) => (
          <div
            key={item.key}
            className="rounded-[22px] border border-[var(--app-divider)] px-4 py-3"
          >
            <div className="mb-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span
                  className="size-3 rounded-full"
                  style={{ backgroundColor: colors[item.key] }}
                />
                <span className="text-base font-bold">{item.label}</span>
              </div>
              <div className="text-left">
                <div className="text-xl font-black">{fa(item.rate, 1)}٪</div>
                <div className="text-xs text-muted-foreground">
                  {fa(item.count)} مورد
                </div>
              </div>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.max(item.rate > 0 ? 5 : 0, item.rate)}%`,
                  backgroundColor: colors[item.key],
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center">
        <div
          className="relative size-72 rounded-full"
          style={{ background: gradient }}
        >
          <div className="absolute inset-10 grid place-items-center rounded-full bg-[var(--app-surface)] text-center">
            <div>
              <div className="text-4xl font-black">{fa(wonRate, 1)}٪</div>
              <div className="mt-2 text-sm text-muted-foreground">
                تبدیل به مشتری
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function TrendChart({ data }: { data: ConversionHealth["trend"] }) {
  if (!data.length) {
    return (
      <div className="grid h-60 place-items-center text-sm text-muted-foreground">
        داده‌ای برای روند زمانی وجود ندارد.
      </div>
    )
  }

  const width = 760
  const height = 240
  const padding = 30
  const max = Math.max(1, ...data.flatMap((item) => [item.leads, item.won]))
  const points = (key: "leads" | "won") =>
    data
      .map((item, index) => {
        const x =
          data.length <= 1
            ? width / 2
            : padding + (index * (width - padding * 2)) / (data.length - 1)
        const y = height - padding - (item[key] / max) * (height - padding * 2)
        return `${x},${y}`
      })
      .join(" ")

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-4 text-xs">
        <span className="inline-flex items-center gap-2">
          <i className="h-0.5 w-5 bg-[var(--info)]" />
          سرنخ‌های ایجادشده
        </span>
        <span className="inline-flex items-center gap-2">
          <i className="h-0.5 w-5 bg-[var(--success)]" />
          مشتری‌شده
        </span>
      </div>
      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="min-w-[620px]">
          {[0.25, 0.5, 0.75].map((ratio) => (
            <line
              key={ratio}
              x1={padding}
              x2={width - padding}
              y1={padding + ratio * (height - padding * 2)}
              y2={padding + ratio * (height - padding * 2)}
              stroke="currentColor"
              className="text-border"
              strokeDasharray="4 6"
            />
          ))}
          <polyline
            fill="none"
            stroke="var(--info)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={points("leads")}
          />
          <polyline
            fill="none"
            stroke="var(--success)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={points("won")}
          />
          {data.map((item, index) => {
            const x =
              data.length <= 1
                ? width / 2
                : padding + (index * (width - padding * 2)) / (data.length - 1)
            return (
              <text
                key={item.month}
                x={x}
                y={height - 4}
                textAnchor="middle"
                className="fill-muted-foreground text-xs"
              >
                {monthLabel(item.month)}
              </text>
            )
          })}
        </svg>
      </div>
    </div>
  )
}

function FunnelChart({ data }: { data: ConversionHealth }) {
  const [hoveredKey, setHoveredKey] = useState<string | null>(null)

  const proposalRate =
    findMilestoneRate(data.milestones, ["تجاری"]) ||
    findMilestoneRate(data.milestones, ["پیش‌فاکتور"]) ||
    findMilestoneRate(data.milestones, ["پایلوت"])

  const finalizeRate =
    findMilestoneRate(data.milestones, ["تحویل"]) ||
    findMilestoneRate(data.milestones, ["پذیرش"])

  const phases = [
    {
      key: "lead",
      label: "سرنخ",
      rate: 100,
      stages: ["سرنخ"],
      helper: "شروع مسیر فروش",
    },
    {
      key: "engagement",
      label: "تعامل",
      rate: findMilestoneRate(data.milestones, ["تعامل"]),
      stages: ["تماس گرفته شده", "علاقه‌مند"],
      helper: "برقراری ارتباط و شکل‌گیری علاقه",
    },
    {
      key: "assessment",
      label: "ارزیابی",
      rate: findMilestoneRate(data.milestones, ["ارزیابی"]),
      stages: ["واجد شرایط", "نیازسنجی"],
      helper: "بررسی تناسب مشتری و نیاز واقعی",
    },
    {
      key: "proposal",
      label: "پیشنهاد",
      rate: proposalRate,
      stages: [
        "در انتظار تأیید پیش‌فاکتور",
        "پایلوت زمان‌بندی شده",
        "پایلوت در حال اجرا",
        "در انتظار تأیید پایلوت",
      ],
      helper: "ارائه پیشنهاد و در صورت نیاز اجرای پایلوت",
    },
    {
      key: "finalize",
      label: "نهایی‌سازی",
      rate: finalizeRate,
      stages: [
        "در انتظار تأیید فاکتور پرداخت",
        "نصب زمان‌بندی شده",
        "نصب در حال اجرا",
        "در انتظار پذیرش مشتری",
      ],
      helper: "تکمیل خرید، اجرا و پذیرش",
    },
    {
      key: "won",
      label: "برنده",
      rate: data.summary.leadToCustomer.current,
      stages: ["انجام شده"],
      helper: "تبدیل نهایی به مشتری",
    },
  ]

  const totalLeads = Math.max(0, data.summary.totalLeads)
  const hovered = phases.find((phase) => phase.key === hoveredKey) ?? null

  const estimatedCount = (rate: number) =>
    totalLeads === 0 ? 0 : Math.round((totalLeads * rate) / 100)

  const tones = [
    "var(--chart-1)",
    "var(--chart-2)",
    "var(--chart-3)",
    "var(--chart-4)",
    "var(--chart-5)",
    "var(--success)",
  ]

  return (
    <div className="relative">
      {hovered ? (
        <div
          className="pointer-events-none absolute start-4 top-4 z-20 w-[340px] max-w-[calc(100%-32px)] rounded-2xl border border-[var(--app-divider)] bg-[var(--app-surface)] p-4 text-xs shadow-[var(--app-shadow-popover)]"
          dir="rtl"
        >
          <div className="flex items-start justify-between gap-4 border-b border-[var(--app-divider)] pb-3">
            <div>
              <div className="text-base font-black text-foreground">
                {hovered.label}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                {hovered.helper}
              </div>
            </div>
            <div className="text-left">
              <div className="text-2xl font-black text-[var(--app-primary)]">
                {fa(hovered.rate, 1)}٪
              </div>
              <div className="text-xs text-muted-foreground">
                حدود {fa(estimatedCount(hovered.rate))} سرنخ
              </div>
            </div>
          </div>

          <div className="mt-3">
            <div className="mb-2 font-bold text-foreground">
              استیج‌های این فاز
            </div>
            <div className="grid gap-1.5">
              {hovered.stages.map((stage) => (
                <div
                  key={stage}
                  className="rounded-lg bg-muted/60 px-2.5 py-1.5 text-muted-foreground"
                >
                  {stage}
                </div>
              ))}
            </div>
          </div>

          <p className="mt-3 leading-6 text-muted-foreground">
            یعنی حدود{" "}
            <strong className="text-foreground">{fa(hovered.rate, 1)}٪</strong>{" "}
            از سرنخ‌های بازه انتخابی حداقل یک‌بار به این بخش از مسیر فروش
            رسیده‌اند.
          </p>
        </div>
      ) : null}

      <div className="space-y-3">
        {phases.map((phase, index) => {
          const count = estimatedCount(phase.rate)
          const tone = tones[index] ?? "var(--app-primary)"

          return (
            <div
              key={phase.key}
              tabIndex={0}
              aria-label={`${phase.label}: ${fa(phase.rate, 1)} درصد، حدود ${fa(count)} مورد`}
              className="group grid gap-2 rounded-[18px] border border-transparent px-2 py-2 transition hover:border-[var(--app-divider)] hover:bg-muted/25 lg:grid-cols-[110px_minmax(0,1fr)_86px]"
              onMouseEnter={() => setHoveredKey(phase.key)}
              onMouseLeave={() => setHoveredKey(null)}
              onFocus={() => setHoveredKey(phase.key)}
              onBlur={() => setHoveredKey(null)}
            >
              <div className="flex items-center justify-between gap-3 lg:block">
                <div className="text-sm font-bold">{phase.label}</div>
                <div className="mt-1 text-xs text-muted-foreground lg:hidden">
                  {fa(phase.rate, 1)}٪
                </div>
              </div>

              <div className="min-w-0">
                <div className="relative h-11 overflow-hidden rounded-xl bg-muted">
                  <div
                    className="absolute inset-y-0 end-0 rounded-xl transition-all duration-300"
                    style={{
                      width: `${Math.max(phase.rate > 0 ? 3 : 0, Math.min(100, phase.rate))}%`,
                      backgroundColor: tone,
                    }}
                  />
                  <div className="relative z-10 flex h-full items-center justify-end px-3 text-xs font-bold">
                    {phase.rate >= 18 ? (
                      <span className="text-white">{fa(phase.rate, 1)}٪</span>
                    ) : null}
                  </div>
                </div>

                <div className="mt-1.5 truncate text-xs text-muted-foreground">
                  {phase.stages.join(" • ")}
                </div>
              </div>

              <div className="hidden text-left lg:block">
                <div className="text-lg font-black">{fa(phase.rate, 1)}٪</div>
                <div className="text-xs text-muted-foreground">
                  {fa(count)} مورد
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-4 rounded-xl bg-muted/35 px-3 py-2 text-xs leading-6 text-muted-foreground">
        طول هر میله نشان می‌دهد چه درصدی از سرنخ‌ها حداقل یک‌بار به آن فاز
        رسیده‌اند. برای دیدن استیج‌های هر فاز، نشانگر را روی همان ردیف نگه
        دارید.
      </div>
    </div>
  )
}

function OwnerScatter({ data }: { data: ConversionHealth["owners"] }) {
  const [hoveredOwnerId, setHoveredOwnerId] = useState<string | null>(null)

  if (!data.length) {
    return (
      <div className="grid h-64 place-items-center text-sm text-muted-foreground">
        داده‌ای برای مقایسه تیم وجود ندارد.
      </div>
    )
  }

  const width = 860
  const height = 470
  const left = 110
  const right = 110
  const top = 64
  const bottom = 92

  const plotLeft = left
  const plotRight = width - right
  const plotTop = top
  const plotBottom = height - bottom
  const plotWidth = plotRight - plotLeft
  const plotHeight = plotBottom - plotTop

  const maxValue = Math.max(1, ...data.map((item) => item.pipelineValue))

  const averageRate =
    data.reduce((sum, item) => sum + item.conversionRate, 0) / data.length
  const averageValue =
    data.reduce((sum, item) => sum + item.pipelineValue, 0) / data.length

  const valueX = plotLeft + (averageValue / maxValue) * plotWidth
  const rateY = plotBottom - (Math.min(100, averageRate) / 100) * plotHeight

  const hovered = data.find((item) => item.ownerId === hoveredOwnerId) ?? null

  const getStatus = (pipelineValue: number, conversionRate: number) => {
    const valueAbove = pipelineValue >= averageValue
    const rateAbove = conversionRate >= averageRate

    if (valueAbove && rateAbove) return "عملکرد برتر"
    if (!valueAbove && rateAbove) return "تبدیل خوب، فرصت کم"
    if (valueAbove && !rateAbove) return "فرصت زیاد، تبدیل پایین"
    return "نیازمند بررسی"
  }

  const valueDiffPercent = (value: number) =>
    averageValue === 0 ? 0 : ((value - averageValue) / averageValue) * 100

  const leftQuadrantCenter = (plotLeft + valueX) / 2
  const rightQuadrantCenter = (valueX + plotRight) / 2

  return (
    <div className="relative">
      <div className="mb-4 flex flex-wrap items-center gap-x-5 gap-y-2 rounded-xl bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
        <span>
          خط عمودی: میانگین ارزش تیم
          <strong className="ms-1 text-foreground">
            {fa(averageValue)} ریال
          </strong>
        </span>
        <span>
          خط افقی: میانگین نرخ تبدیل تیم
          <strong className="ms-1 text-foreground">
            {fa(averageRate, 1)}٪
          </strong>
        </span>
        <span>اندازه دایره: تعداد فرصت‌ها</span>
      </div>

      {hovered
        ? (() => {
            const pipelineDiff = valueDiffPercent(hovered.pipelineValue)
            const rateDiff = hovered.conversionRate - averageRate
            const status = getStatus(
              hovered.pipelineValue,
              hovered.conversionRate
            )

            return (
              <div
                className="pointer-events-none absolute start-4 top-14 z-20 w-[340px] max-w-[calc(100%-32px)] rounded-2xl border border-[var(--app-divider)] bg-[var(--app-surface)] p-4 text-xs shadow-[var(--app-shadow-popover)]"
                dir="rtl"
              >
                <div className="flex items-start justify-between gap-3 border-b border-[var(--app-divider)] pb-3">
                  <div>
                    <div className="text-sm font-black text-foreground">
                      {hovered.ownerName}
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      جزئیات عملکرد کارشناس
                    </div>
                  </div>
                  <span className="rounded-full bg-[var(--app-primary-soft)] px-2.5 py-1 font-bold text-[var(--app-primary)]">
                    {status}
                  </span>
                </div>

                <div className="mt-3 grid gap-2">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-muted-foreground">تعداد فرصت‌ها</span>
                    <strong>{fa(hovered.total)} مورد</strong>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-muted-foreground">ارزش فرصت‌ها</span>
                    <strong>{fa(hovered.pipelineValue)} ریال</strong>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-muted-foreground">نرخ تبدیل</span>
                    <strong>{fa(hovered.conversionRate, 1)}٪</strong>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-muted-foreground">
                      میانگین نرخ تیم
                    </span>
                    <strong>{fa(averageRate, 1)}٪</strong>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-muted-foreground">
                      میانگین ارزش تیم
                    </span>
                    <strong>{fa(averageValue)} ریال</strong>
                  </div>
                </div>

                <div className="my-3 border-t border-[var(--app-divider)]" />

                <div className="mb-2 font-bold">اختلاف با تیم</div>
                <div className="grid gap-2">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-muted-foreground">ارزش فرصت‌ها</span>
                    <strong>
                      {fa(Math.abs(pipelineDiff), 1)}٪
                      <span className="ms-1">
                        {pipelineDiff >= 0 ? "بالاتر" : "پایین‌تر"}
                      </span>
                    </strong>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-muted-foreground">نرخ تبدیل</span>
                    <strong>
                      {fa(Math.abs(rateDiff), 1)} واحد درصد
                      <span className="ms-1">
                        {rateDiff >= 0 ? "بالاتر" : "پایین‌تر"}
                      </span>
                    </strong>
                  </div>
                </div>

                <div className="my-3 border-t border-[var(--app-divider)]" />

                <div className="mb-2 font-bold">فرمول جایگاه</div>
                <div className="space-y-1 leading-6 text-muted-foreground">
                  <p>محور افقی = ارزش فرصت‌ها در مقایسه با میانگین تیم</p>
                  <p>محور عمودی = نرخ تبدیل در مقایسه با میانگین تیم</p>
                  <p>
                    نتیجه: <strong className="text-foreground">{status}</strong>
                  </p>
                </div>
              </div>
            )
          })()
        : null}

      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full min-w-[760px]"
          onMouseLeave={() => setHoveredOwnerId(null)}
        >
          <rect
            x={plotLeft}
            y={plotTop}
            width={Math.max(0, valueX - plotLeft)}
            height={Math.max(0, rateY - plotTop)}
            fill="var(--success)"
            opacity="0.035"
          />
          <rect
            x={valueX}
            y={plotTop}
            width={Math.max(0, plotRight - valueX)}
            height={Math.max(0, rateY - plotTop)}
            fill="var(--success)"
            opacity="0.08"
          />
          <rect
            x={plotLeft}
            y={rateY}
            width={Math.max(0, valueX - plotLeft)}
            height={Math.max(0, plotBottom - rateY)}
            fill="var(--app-text-secondary)"
            opacity="0.04"
          />
          <rect
            x={valueX}
            y={rateY}
            width={Math.max(0, plotRight - valueX)}
            height={Math.max(0, plotBottom - rateY)}
            fill="var(--destructive)"
            opacity="0.04"
          />

          <line
            x1={plotLeft}
            x2={plotLeft}
            y1={plotTop}
            y2={plotBottom}
            stroke="var(--app-divider)"
          />
          <line
            x1={plotLeft}
            x2={plotRight}
            y1={plotBottom}
            y2={plotBottom}
            stroke="var(--app-divider)"
          />
          <line
            x1={valueX}
            x2={valueX}
            y1={plotTop}
            y2={plotBottom}
            stroke="var(--app-text-secondary)"
            strokeDasharray="7 7"
            opacity="0.8"
          />
          <line
            x1={plotLeft}
            x2={plotRight}
            y1={rateY}
            y2={rateY}
            stroke="var(--app-text-secondary)"
            strokeDasharray="7 7"
            opacity="0.8"
          />

          {/* Quadrant labels: centered inside each quadrant to avoid clipping */}
          <text
            x={leftQuadrantCenter}
            y={plotTop + 28}
            textAnchor="middle"
            fontSize="11"
            fontWeight="600"
            fill="var(--success)"
          >
            تبدیل خوب، فرصت کم
          </text>
          <text
            x={rightQuadrantCenter}
            y={plotTop + 28}
            textAnchor="middle"
            fontSize="11"
            fontWeight="600"
            fill="var(--success)"
          >
            عملکرد برتر
          </text>
          <text
            x={leftQuadrantCenter}
            y={plotBottom - 22}
            textAnchor="middle"
            fontSize="11"
            fontWeight="600"
            fill="var(--app-text-secondary)"
          >
            نیازمند بررسی
          </text>
          <text
            x={rightQuadrantCenter}
            y={plotBottom - 22}
            textAnchor="middle"
            fontSize="11"
            fontWeight="600"
            fill="var(--destructive)"
          >
            فرصت زیاد، تبدیل پایین
          </text>

          {/* Axis titles */}
          <text
            x={width / 2}
            y={height - 18}
            textAnchor="middle"
            className="fill-muted-foreground text-xs"
          >
            ارزش فرصت‌های فروش
          </text>
          <text
            x={30}
            y={(plotTop + plotBottom) / 2}
            transform={`rotate(-90 30 ${(plotTop + plotBottom) / 2})`}
            textAnchor="middle"
            className="fill-muted-foreground text-xs"
          >
            نرخ تبدیل
          </text>

          {/* Average labels */}
          <text
            x={valueX}
            y={plotBottom + 24}
            textAnchor="middle"
            fontSize="9"
            fill="var(--app-text-secondary)"
          >
            میانگین ارزش تیم
          </text>
          <text
            x={plotLeft + 8}
            y={rateY - 9}
            textAnchor="start"
            fontSize="9"
            fill="var(--app-text-secondary)"
          >
            میانگین نرخ تبدیل
          </text>

          {data.map((item) => {
            const x = plotLeft + (item.pipelineValue / maxValue) * plotWidth
            const y =
              plotBottom -
              (Math.min(100, item.conversionRate) / 100) * plotHeight

            const r = Math.max(9, Math.min(17, 7 + Math.sqrt(item.total)))
            const active = hoveredOwnerId === item.ownerId

            return (
              <g
                key={item.ownerId}
                tabIndex={0}
                role="img"
                aria-label={`${item.ownerName}: ${fa(item.conversionRate, 1)} درصد نرخ تبدیل، ${fa(item.pipelineValue)} ریال ارزش فرصت`}
                className="cursor-pointer outline-none"
                onMouseEnter={() => setHoveredOwnerId(item.ownerId)}
                onFocus={() => setHoveredOwnerId(item.ownerId)}
                onBlur={() => setHoveredOwnerId(null)}
              >
                <circle
                  cx={x}
                  cy={y}
                  r={active ? r + 2 : r}
                  fill="var(--app-primary)"
                  fillOpacity={active ? 0.96 : 0.78}
                  stroke="var(--app-surface)"
                  strokeWidth="3"
                />
                <text
                  x={x}
                  y={y - r - 9}
                  textAnchor="middle"
                  className="fill-foreground text-xs font-bold"
                >
                  {item.ownerName}
                </text>
              </g>
            )
          })}
        </svg>
      </div>
    </div>
  )
}

function InsightCards({ data }: { data: ConversionHealth }) {
  const leakage = data.biggestLeakage
  return (
    <DashboardSection
      id="reports-sales-insights"
      title="بینش‌های مدیریتی"
      description="مهم‌ترین نقاط قوت و ریسک مسیر فروش در بازه انتخابی"
      icon={CircleAlert}
    >
      <DashboardMetricGrid columns={3}>
        <MetricCard
          label="بیشترین ریزش"
          value={leakage ? `${fa(leakage.dropRate, 1)}٪` : "داده ناکافی"}
          helper={
            leakage
              ? `بین «${leakage.fromLabel}» و «${leakage.toLabel}»؛ ${fa(leakage.dropCount)} فرصت به مرحله بعد نرسیده‌اند.`
              : "برای تشخیص نقطه ریزش داده کافی وجود ندارد."
          }
          icon={CircleAlert}
          tone="warning"
        />
        <MetricCard
          label="کیفیت تبدیل"
          value={`${fa(data.summary.leadToCustomer.current, 1)}٪`}
          helper="سهم سرنخ‌هایی که در نهایت به مشتری تبدیل شده‌اند."
          icon={Target}
          tone="primary"
        />
        <MetricCard
          label="بازگشت از توقف"
          value={`${fa(data.recovery.rate, 1)}٪`}
          helper="سهم فرصت‌های متوقف‌شده‌ای که دوباره به مسیر فروش برگشته‌اند."
          icon={RotateCcw}
          tone="success"
        />
      </DashboardMetricGrid>
    </DashboardSection>
  )
}

export function ReportsPage() {
  const financialVisible = canViewFinancials(
    useAuthStore((state) => state.user?.permissions)
  )
  const [dateRange, setDateRange] = useState<DateRangeValue>({})
  const [scope, setScope] = useState<"all" | "mine">("all")
  const [view, setView] = useState<"sales" | "users">("sales")

  const filters = useMemo<ReportFilters>(
    () => ({
      startDate: dateRange?.from?.toISOString(),
      endDate: dateRange?.to?.toISOString(),
      ownershipScope: scope,
    }),
    [dateRange, scope]
  )

  const query = useReportsAnalytics(filters, view === "sales")
  const data = query.data

  return (
    <EntityListPage>
      <PageHero
        title="گزارش‌ها"
        description="سلامت مسیر فروش و عملکرد کاربران را در یک نمای تحلیلی بررسی کنید."
        accessBadge={{ label: "تحلیل و گزارش", icon: TrendingUp }}
        showRefresh={false}
        viewOptions={[
          { id: "sales", label: "سلامت مسیر فروش", icon: TrendingUp },
          { id: "users", label: "عملکرد کاربران", icon: UsersRound },
        ]}
        activeView={view}
        onViewChange={(nextView) => setView(nextView as "sales" | "users")}
      />

      {view === "sales" ? (
        <>
          <DashboardToolbar
            title="فیلتر گزارش سلامت فروش"
            description="بازه زمانی و دامنه مالکیت را برای تحلیل انتخاب کنید."
            icon={CalendarRange}
          >
            <div className="min-w-0 flex-1 lg:min-w-80">
              <PersianDateRangePicker
                value={dateRange}
                onChange={setDateRange}
              />
            </div>
            <div className="flex rounded-xl border border-[var(--app-divider)] bg-[var(--app-background)] p-1">
              {(["all", "mine"] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={scope === value}
                  onClick={() => setScope(value)}
                  className={[
                    "rounded-lg px-4 py-2 text-sm transition",
                    scope === value
                      ? "bg-[var(--app-surface)] font-medium text-[var(--app-primary)] shadow-sm"
                      : "text-[var(--app-text-secondary)] hover:text-[var(--app-primary)]",
                  ].join(" ")}
                >
                  {value === "all" ? "همه" : "متعلق به من"}
                </button>
              ))}
            </div>
          </DashboardToolbar>

          <QueryContent
            query={query}
            errorTitle="دریافت تحلیل فروش با خطا مواجه شد"
          >
            {data ? (
              <>
                <DashboardSection
                  id="reports-sales-summary"
                  title="شاخص‌های کلیدی فروش"
                  description="مقایسه شاخص‌های بازه انتخابی با دوره قبل"
                  icon={TrendingUp}
                >
                  <DashboardMetricGrid>
                    <KpiCard
                      title="تبدیل سرنخ به مشتری"
                      value={`${fa(data.summary.leadToCustomer.current, 1)}٪`}
                      helper={`از ${fa(data.summary.totalLeads)} سرنخ در بازه انتخابی`}
                      metric={data.summary.leadToCustomer}
                      icon={Target}
                    />
                    <KpiCard
                      title="میانه زمان تبدیل"
                      value={`${fa(data.summary.medianTimeToWinDays.current, 1)} روز`}
                      helper="از ایجاد سرنخ تا تبدیل به مشتری"
                      metric={data.summary.medianTimeToWinDays}
                      inverse
                      suffix=" روز"
                      icon={TimerReset}
                    />
                    <KpiCard
                      title="نرخ عدم موفقیت"
                      value={`${fa(data.summary.lostRate.current, 1)}٪`}
                      helper="سهم از دست رفته و بدون پاسخ از کل سرنخ‌ها"
                      metric={data.summary.lostRate}
                      inverse
                      icon={CircleAlert}
                    />
                    <KpiCard
                      title="بازگشت از توقف"
                      value={`${fa(data.summary.recoveryRate.current, 1)}٪`}
                      helper="فرصت‌هایی که از توقف دوباره فعال شده‌اند"
                      metric={data.summary.recoveryRate}
                      icon={RotateCcw}
                    />
                  </DashboardMetricGrid>
                </DashboardSection>

                <ContentSection
                  title="روند جذب تا تبدیل"
                  description="مقایسه تعداد سرنخ‌های ایجادشده با تعداد مشتری‌شده در طول بازه زمانی"
                  icon={BarChart3}
                >
                  <TrendChart data={data.trend} />
                </ContentSection>

                <section className="grid gap-5 xl:grid-cols-2">
                  <ContentSection
                    title="وضعیت سرنخ‌ها"
                    description="توزیع فعلی سرنخ‌ها در وضعیت‌های اصلی بازه انتخابی"
                    icon={Activity}
                  >
                    <LeadStatusChart data={data.outcomes} />
                  </ContentSection>

                  <ContentSection
                    title="پیشرفت در مسیر فروش"
                    description="نمایش فازهای فانل و استیج‌های هر فاز بر اساس مسیر توافق‌شده"
                    icon={Target}
                  >
                    <FunnelChart data={data} />
                  </ContentSection>
                </section>

                {financialVisible ? (
                  <ContentSection
                    title="عملکرد تیم فروش"
                    description="مقایسه ارزش فرصت‌ها و نرخ تبدیل هر کارشناس"
                    icon={UsersRound}
                  >
                    <OwnerScatter data={data.owners} />
                  </ContentSection>
                ) : null}

                <InsightCards data={data} />
              </>
            ) : null}
          </QueryContent>
        </>
      ) : (
        <UserPerformanceReport />
      )}
    </EntityListPage>
  )
}
