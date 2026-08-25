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
import { PersianDatePicker } from "@/components/shared/PersianDatePicker"
import { Button } from "@workspace/ui/components/button"

import type {
  ComparisonMetric,
  ConversionHealth,
  ReportFilters,
} from "../api/reportsApi"
import { useReportsAnalytics } from "../hooks/useReportsAnalytics"

function fa(value: number, digits = 0) {
  return new Intl.NumberFormat("fa-IR", {
    maximumFractionDigits: digits,
  }).format(value)
}

function monthLabel(value: string) {
  const [year, month] = value.split("-").map(Number)
  return new Intl.DateTimeFormat("fa-IR", {
    year: "2-digit",
    month: "short",
  }).format(new Date(Date.UTC(year, month - 1, 1)))
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
        "inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-medium",
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
    <article className="rounded-[22px] border border-[var(--app-divider)] bg-[var(--app-surface)] p-5 shadow-[var(--app-shadow-card)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="mt-2 text-3xl font-black tracking-tight">{value}</p>
          <p className="mt-2 text-xs leading-6 text-muted-foreground">{helper}</p>
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

  const gradient = `conic-gradient(
    #2E7D32 0 ${won}%,
    #C62828 ${won}% ${won + lost}%,
    #F9A825 ${won + lost}% ${won + lost + hold}%,
    #2196F3 ${won + lost + hold}% 100%
  )`

  const tone: Record<string, string> = {
    won: "#2E7D32",
    lost: "#C62828",
    onHold: "#F9A825",
    active: "#2196F3",
  }

  const labels: Record<string, string> = {
    won: "مشتری",
    lost: "از دست‌رفته",
    onHold: "متوقف",
    active: "در جریان",
  }

  return (
    <div className="grid gap-6 md:grid-cols-[210px_1fr] md:items-center">
      <div
        className="relative mx-auto size-48 rounded-full"
        style={{ background: gradient }}
      >
        <div className="absolute inset-7 grid place-items-center rounded-full bg-[var(--app-surface)] text-center">
          <div>
            <div className="text-3xl font-black">{fa(won, 1)}٪</div>
            <div className="mt-1 text-xs text-muted-foreground">تبدیل به مشتری</div>
          </div>
        </div>
      </div>

      <div className="grid gap-3">
        {data.map((item) => (
          <div
            key={item.key}
            className="flex items-center justify-between rounded-2xl border border-[var(--app-divider)] px-4 py-3"
          >
            <div className="flex items-center gap-3">
              <span
                className="size-3 rounded-full"
                style={{ backgroundColor: tone[item.key] }}
              />
              <span className="text-sm font-medium">
                {labels[item.key] ?? item.label}
              </span>
            </div>
            <div className="text-left">
              <span className="font-bold">{fa(item.rate, 1)}٪</span>
              <span className="ms-2 text-xs text-muted-foreground">
                {fa(item.count)} مورد
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ProgressChart({ data }: { data: ConversionHealth["milestones"] }) {
  const labels: Record<string, string> = {
    engagement: "تعامل اولیه",
    qualification: "ارزیابی",
    commercial: "تجاری",
    pilot: "پایلوت",
    delivery: "تحویل",
    acceptance: "پذیرش",
    won: "مشتری",
  }

  return (
    <div className="space-y-4">
      {data.map((item) => (
        <div
          key={item.key}
          className="grid grid-cols-[92px_1fr_64px] items-center gap-3"
        >
          <p className="truncate text-sm font-medium">
            {labels[item.key] ?? item.label}
          </p>
          <div className="h-3 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-[var(--app-primary)] transition-all"
              style={{
                width: `${Math.max(item.reachRate > 0 ? 3 : 0, item.reachRate)}%`,
              }}
            />
          </div>
          <div className="text-left text-sm font-bold">
            {fa(item.reachRate, 1)}٪
          </div>
        </div>
      ))}
    </div>
  )
}

function TrendChart({ data }: { data: ConversionHealth["trend"] }) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  if (!data.length) {
    return (
      <div className="grid h-64 place-items-center text-sm text-muted-foreground">
        داده‌ای برای نمایش روند وجود ندارد.
      </div>
    )
  }

  const width = 900
  const height = 290
  const left = 62
  const right = 24
  const top = 24
  const bottom = 44
  const plotWidth = width - left - right
  const plotHeight = height - top - bottom
  const max = Math.max(1, ...data.flatMap((item) => [item.leads, item.won]))

  const xAt = (index: number) =>
    data.length <= 1
      ? width / 2
      : left + (index * plotWidth) / (data.length - 1)

  const yAt = (value: number) => top + plotHeight - (value / max) * plotHeight

  const path = (key: "leads" | "won") =>
    data
      .map((item, index) => {
        const x = xAt(index)
        const y = yAt(item[key])
        return `${index === 0 ? "M" : "L"} ${x} ${y}`
      })
      .join(" ")

  const hovered = hoveredIndex === null ? null : data[hoveredIndex]

  return (
    <div className="rounded-[20px] border border-[var(--app-divider)] bg-[var(--app-background)]/55 p-3">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-[var(--app-surface)] px-3 py-2.5">
        <div className="flex flex-wrap gap-5 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-2">
            <i className="size-2 rounded-full bg-[var(--app-primary)]" />
            سرنخ‌های ایجادشده
          </span>
          <span className="inline-flex items-center gap-2">
            <i className="size-2 rounded-full bg-[var(--success)]" />
            تبدیل‌شده به مشتری
          </span>
        </div>
        <span className="text-[11px] text-muted-foreground">
          روند ماهانه ورود و تبدیل سرنخ
        </span>
      </div>

      <div className="relative overflow-x-auto">
        {hovered ? (
          <div className="pointer-events-none absolute end-4 top-3 z-10 min-w-40 rounded-2xl border border-[var(--app-divider)] bg-[var(--app-surface)]/95 p-3 text-xs shadow-[var(--app-shadow-popover)]">
            <strong>{monthLabel(hovered.month)}</strong>
            <div className="mt-2 grid gap-1.5 text-muted-foreground">
              <div className="flex justify-between gap-6">
                <span>ایجادشده</span>
                <strong className="text-foreground">{fa(hovered.leads)}</strong>
              </div>
              <div className="flex justify-between gap-6">
                <span>مشتری‌شده</span>
                <strong className="text-foreground">{fa(hovered.won)}</strong>
              </div>
            </div>
          </div>
        ) : null}

        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="min-w-[720px] w-full"
          onMouseLeave={() => setHoveredIndex(null)}
        >
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = top + ratio * plotHeight
            const label = Math.round(max * (1 - ratio))
            return (
              <g key={ratio}>
                <line
                  x1={left}
                  x2={width - right}
                  y1={y}
                  y2={y}
                  stroke="var(--app-divider)"
                />
                <text
                  x={left - 10}
                  y={y + 4}
                  textAnchor="end"
                  fontSize="10"
                  fill="var(--app-text-secondary)"
                >
                  {fa(label)}
                </text>
              </g>
            )
          })}

          <path
            d={path("leads")}
            fill="none"
            stroke="var(--app-primary)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d={path("won")}
            fill="none"
            stroke="var(--success)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {data.map((item, index) => {
            const x = xAt(index)
            const leadY = yAt(item.leads)
            const wonY = yAt(item.won)
            const hitWidth = Math.max(48, plotWidth / Math.max(data.length, 1))

            return (
              <g
                key={item.month}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIndex(index)}
              >
                <rect
                  x={x - hitWidth / 2}
                  y={top}
                  width={hitWidth}
                  height={plotHeight}
                  fill="transparent"
                />
                <circle
                  cx={x}
                  cy={leadY}
                  r={hoveredIndex === index ? 5 : 3.5}
                  fill="var(--app-primary)"
                  stroke="var(--app-surface)"
                  strokeWidth="2"
                />
                <circle
                  cx={x}
                  cy={wonY}
                  r={hoveredIndex === index ? 5 : 3.5}
                  fill="var(--success)"
                  stroke="var(--app-surface)"
                  strokeWidth="2"
                />
                <text
                  x={x}
                  y={height - 12}
                  textAnchor="middle"
                  fontSize="11"
                  fill="var(--app-text-secondary)"
                >
                  {monthLabel(item.month)}
                </text>
              </g>
            )
          })}
        </svg>
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

  const width = 760
  const height = 410
  const padding = 66
  const maxValue = Math.max(1, ...data.map((item) => item.pipelineValue))

  const averageRate =
    data.reduce((sum, item) => sum + item.conversionRate, 0) / data.length
  const averageValue =
    data.reduce((sum, item) => sum + item.pipelineValue, 0) / data.length

  const valueX =
    padding + (averageValue / maxValue) * (width - padding * 2)
  const rateY =
    height -
    padding -
    (Math.min(100, averageRate) / 100) * (height - padding * 2)

  const hovered =
    data.find((item) => item.ownerId === hoveredOwnerId) ?? null

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

  return (
    <div className="relative">
      <div className="mb-3 flex flex-wrap items-center gap-x-5 gap-y-2 rounded-xl bg-muted/40 px-3 py-2 text-[11px] text-muted-foreground">
        <span>
          خط عمودی: میانگین ارزش فرصت‌های تیم{" "}
          <strong className="text-foreground">{fa(averageValue)} ریال</strong>
        </span>
        <span>
          خط افقی: میانگین نرخ تبدیل تیم{" "}
          <strong className="text-foreground">{fa(averageRate, 1)}٪</strong>
        </span>
        <span>اندازه دایره: تعداد فرصت‌ها</span>
      </div>

      {hovered ? (() => {
        const pipelineDiff = valueDiffPercent(hovered.pipelineValue)
        const rateDiff = hovered.conversionRate - averageRate
        const status = getStatus(hovered.pipelineValue, hovered.conversionRate)

        return (
          <div
            className="pointer-events-none absolute start-4 top-14 z-20 w-[330px] max-w-[calc(100%-32px)] rounded-2xl border border-[var(--app-divider)] bg-[var(--app-surface)] p-4 text-xs shadow-[var(--app-shadow-popover)]"
            dir="rtl"
          >
            <div className="flex items-start justify-between gap-3 border-b border-[var(--app-divider)] pb-3">
              <div>
                <div className="text-sm font-black text-foreground">
                  {hovered.ownerName}
                </div>
                <div className="mt-1 text-[11px] text-muted-foreground">
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
            </div>

            <div className="my-3 border-t border-[var(--app-divider)]" />

            <div className="mb-2 font-bold">مقایسه با تیم</div>
            <div className="grid gap-2">
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">ارزش فرصت‌ها</span>
                <strong>
                  {fa(Math.abs(pipelineDiff), 1)}٪{" "}
                  {pipelineDiff >= 0 ? "بالاتر" : "پایین‌تر"}
                </strong>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">نرخ تبدیل</span>
                <strong>
                  {fa(Math.abs(rateDiff), 1)} واحد درصد{" "}
                  {rateDiff >= 0 ? "بالاتر" : "پایین‌تر"}
                </strong>
              </div>
            </div>

            <div className="my-3 border-t border-[var(--app-divider)]" />

            <div className="mb-2 font-bold">دلیل نتیجه</div>
            <div className="grid gap-1.5 leading-5">
              <div>
                {hovered.pipelineValue >= averageValue ? "✓" : "•"} ارزش فرصت‌ها{" "}
                {hovered.pipelineValue >= averageValue ? "بالاتر از" : "پایین‌تر از"} میانگین تیم است.
              </div>
              <div>
                {hovered.conversionRate >= averageRate ? "✓" : "•"} نرخ تبدیل{" "}
                {hovered.conversionRate >= averageRate ? "بالاتر از" : "پایین‌تر از"} میانگین تیم است.
              </div>
            </div>

            <div className="mt-3 rounded-xl bg-muted/60 px-3 py-2">
              <span className="text-muted-foreground">نتیجه: </span>
              <strong>{status}</strong>
            </div>
          </div>
        )
      })() : null}

      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="min-w-[680px] w-full"
          onMouseLeave={() => setHoveredOwnerId(null)}
        >
          <rect
            x={padding}
            y={padding}
            width={Math.max(0, valueX - padding)}
            height={Math.max(0, rateY - padding)}
            fill="var(--success)"
            opacity="0.035"
          />
          <rect
            x={valueX}
            y={padding}
            width={Math.max(0, width - padding - valueX)}
            height={Math.max(0, rateY - padding)}
            fill="var(--success)"
            opacity="0.075"
          />
          <rect
            x={padding}
            y={rateY}
            width={Math.max(0, valueX - padding)}
            height={Math.max(0, height - padding - rateY)}
            fill="var(--warning)"
            opacity="0.035"
          />
          <rect
            x={valueX}
            y={rateY}
            width={Math.max(0, width - padding - valueX)}
            height={Math.max(0, height - padding - rateY)}
            fill="var(--destructive)"
            opacity="0.04"
          />

          <line
            x1={padding}
            x2={padding}
            y1={padding}
            y2={height - padding}
            stroke="var(--app-divider)"
          />
          <line
            x1={padding}
            x2={width - padding}
            y1={height - padding}
            y2={height - padding}
            stroke="var(--app-divider)"
          />

          <line
            x1={valueX}
            x2={valueX}
            y1={padding}
            y2={height - padding}
            stroke="var(--app-text-secondary)"
            strokeDasharray="6 6"
            opacity="0.75"
          />
          <line
            x1={padding}
            x2={width - padding}
            y1={rateY}
            y2={rateY}
            stroke="var(--app-text-secondary)"
            strokeDasharray="6 6"
            opacity="0.75"
          />

          <text
            x={padding + 12}
            y={padding + 20}
            fontSize="11"
            fill="var(--success)"
          >
            تبدیل خوب، فرصت کم
          </text>
          <text
            x={width - padding - 12}
            y={padding + 20}
            textAnchor="end"
            fontSize="11"
            fill="var(--success)"
          >
            عملکرد برتر
          </text>
          <text
            x={padding + 12}
            y={height - padding - 12}
            fontSize="11"
            fill="var(--app-text-secondary)"
          >
            نیازمند بررسی
          </text>
          <text
            x={width - padding - 12}
            y={height - padding - 12}
            textAnchor="end"
            fontSize="11"
            fill="var(--destructive)"
          >
            فرصت زیاد، تبدیل پایین
          </text>

          <text
            x={width / 2}
            y={height - 16}
            textAnchor="middle"
            className="fill-muted-foreground text-[11px]"
          >
            ارزش فرصت‌های فروش
          </text>

          <text
            x={padding + 7}
            y={rateY - 8}
            fontSize="9"
            fill="var(--app-text-secondary)"
          >
            میانگین نرخ تبدیل
          </text>

          <text
            x={valueX + 6}
            y={height - padding + 18}
            fontSize="9"
            fill="var(--app-text-secondary)"
          >
            میانگین ارزش فرصت‌ها
          </text>

          {data.map((item) => {
            const x =
              padding +
              (item.pipelineValue / maxValue) * (width - padding * 2)

            const y =
              height -
              padding -
              (Math.min(100, item.conversionRate) / 100) *
                (height - padding * 2)

            const r = Math.max(8, Math.min(17, 7 + Math.sqrt(item.total)))
            const active = hoveredOwnerId === item.ownerId

            return (
              <g
                key={item.ownerId}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredOwnerId(item.ownerId)}
              >
                <circle
                  cx={x}
                  cy={y}
                  r={active ? r + 2 : r}
                  fill="var(--app-primary)"
                  fillOpacity={active ? 0.95 : 0.78}
                  stroke="var(--app-surface)"
                  strokeWidth="3"
                />
                <text
                  x={x}
                  y={y - r - 8}
                  textAnchor="middle"
                  className="fill-foreground text-[10px] font-medium"
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
    <section className="grid gap-4 lg:grid-cols-3">
      <article className="rounded-[22px] border border-[var(--app-divider)] bg-[var(--app-surface)] p-5">
        <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
          <CircleAlert className="size-5" />
          <h3 className="font-bold">بیشترین ریزش</h3>
        </div>
        {leakage ? (
          <>
            <p className="mt-4 text-2xl font-black">
              {fa(leakage.dropRate, 1)}٪
            </p>
            <p className="mt-2 text-sm leading-7 text-muted-foreground">
              بیشترین افت بین «{leakage.fromLabel}» و «{leakage.toLabel}» است.
            </p>
          </>
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">
            داده کافی برای تشخیص ریزش وجود ندارد.
          </p>
        )}
      </article>

      <article className="rounded-[22px] border border-[var(--app-divider)] bg-[var(--app-surface)] p-5">
        <div className="flex items-center gap-2 text-[var(--app-primary)]">
          <Target className="size-5" />
          <h3 className="font-bold">تبدیل سرنخ</h3>
        </div>
        <p className="mt-4 text-2xl font-black">
          {fa(data.summary.leadToCustomer.current, 1)}٪
        </p>
        <p className="mt-2 text-sm leading-7 text-muted-foreground">
          این سهم از سرنخ‌ها در نهایت به مشتری تبدیل شده‌اند.
        </p>
      </article>

      <article className="rounded-[22px] border border-[var(--app-divider)] bg-[var(--app-surface)] p-5">
        <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
          <RotateCcw className="size-5" />
          <h3 className="font-bold">بازگشت از توقف</h3>
        </div>
        <p className="mt-4 text-2xl font-black">{fa(data.recovery.rate, 1)}٪</p>
        <p className="mt-2 text-sm leading-7 text-muted-foreground">
          فرصت‌های متوقف‌شده‌ای که دوباره به چرخه فروش برگشته‌اند.
        </p>
      </article>
    </section>
  )
}

export function ReportsPage() {
  const [fromDate, setFromDate] = useState<Date | undefined>()
  const [toDate, setToDate] = useState<Date | undefined>()
  const [scope, setScope] = useState<"all" | "mine">("all")

  const filters = useMemo<ReportFilters>(
    () => ({
      startDate: fromDate?.toISOString(),
      endDate: toDate?.toISOString(),
      ownershipScope: scope,
    }),
    [fromDate, toDate, scope],
  )

  const query = useReportsAnalytics(filters)
  const data = query.data

  return (
    <div className="grid gap-5" dir="rtl">
      <section className="relative overflow-hidden rounded-[26px] border border-[var(--app-divider)] bg-[var(--app-surface)] px-5 py-5 shadow-[var(--app-shadow-card)] sm:px-6">
        <div className="pointer-events-none absolute -end-16 -top-20 size-56 rounded-full bg-[var(--app-primary-soft)] blur-3xl" />
        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl font-black tracking-tight">
              تحلیل فروش
            </h1>
            <p className="mt-1 truncate text-sm text-muted-foreground">
              نمای کلی از تبدیل، ریزش و عملکرد تیم فروش
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => void query.refetch()}
            disabled={query.isFetching}
          >
            <RefreshCcw
              className={`ms-2 size-4 ${query.isFetching ? "animate-spin" : ""}`}
            />
            به‌روزرسانی
          </Button>
        </div>
      </section>

      <section className="rounded-[22px] border border-[var(--app-divider)] bg-[var(--app-surface)] p-3 shadow-[var(--app-shadow-card)]">
        <div className="grid gap-3 lg:grid-cols-[1fr_1fr_auto] lg:items-center">
          <PersianDatePicker
            value={fromDate}
            onChange={setFromDate}
            placeholder="از تاریخ"
            maxDate={toDate}
          />
          <PersianDatePicker
            value={toDate}
            onChange={setToDate}
            placeholder="تا تاریخ"
            minDate={fromDate}
          />
          <div className="flex rounded-2xl bg-muted p-1">
            {(["all", "mine"] as const).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setScope(value)}
                className={[
                  "rounded-xl px-4 py-2 text-sm transition",
                  scope === value
                    ? "bg-background font-medium shadow-sm"
                    : "text-muted-foreground",
                ].join(" ")}
              >
                {value === "all" ? "همه" : "متعلق به من"}
              </button>
            ))}
          </div>
        </div>
      </section>

      {query.isError ? (
        <ErrorState
          title="دریافت گزارش با خطا مواجه شد"
          description="دوباره تلاش کنید."
          retryLabel="تلاش مجدد"
          onRetry={() => void query.refetch()}
        />
      ) : null}

      {query.isLoading ? (
        <div className="grid min-h-72 place-items-center rounded-[22px] border border-[var(--app-divider)] bg-[var(--app-surface)] text-sm text-muted-foreground">
          در حال دریافت گزارش...
        </div>
      ) : null}

      {data ? (
        <>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <KpiCard
              title="نرخ تبدیل"
              value={`${fa(data.summary.leadToCustomer.current, 1)}٪`}
              helper="سرنخ‌هایی که به مشتری تبدیل شده‌اند"
              metric={data.summary.leadToCustomer}
              icon={Target}
            />
            <KpiCard
              title="زمان تبدیل"
              value={`${fa(data.summary.medianTimeToWinDays.current, 1)} روز`}
              helper="میانه زمان تبدیل سرنخ به مشتری"
              metric={data.summary.medianTimeToWinDays}
              inverse
              suffix=" روز"
              icon={TimerReset}
            />
            <KpiCard
              title="نرخ ریزش"
              value={`${fa(data.summary.lostRate.current, 1)}٪`}
              helper="سرنخ‌های از دست‌رفته یا بدون پاسخ"
              metric={data.summary.lostRate}
              inverse
              icon={CircleAlert}
            />
            <KpiCard
              title="نرخ بازگشت"
              value={`${fa(data.summary.recoveryRate.current, 1)}٪`}
              helper="فرصت‌های برگشته از وضعیت توقف"
              metric={data.summary.recoveryRate}
              icon={RotateCcw}
            />
          </section>

          <section className="rounded-[24px] border border-[var(--app-divider)] bg-[var(--app-surface)] p-5 shadow-[var(--app-shadow-card)]">
            <div className="mb-4">
              <h2 className="text-lg font-bold">روند سرنخ‌ها</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                مقایسه ماهانه سرنخ‌های ایجادشده و تبدیل‌شده به مشتری
              </p>
            </div>
            <TrendChart data={data.trend} />
          </section>

          <section className="grid gap-5 xl:grid-cols-2">
            <article className="rounded-[24px] border border-[var(--app-divider)] bg-[var(--app-surface)] p-5 shadow-[var(--app-shadow-card)]">
              <div className="mb-5">
                <h2 className="text-lg font-bold">وضعیت سرنخ‌ها</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  وضعیت فعلی سرنخ‌های دوره انتخابی
                </p>
              </div>
              <OutcomeDonut data={data.outcomes} />
            </article>

            <article className="rounded-[24px] border border-[var(--app-divider)] bg-[var(--app-surface)] p-5 shadow-[var(--app-shadow-card)]">
              <div className="mb-5">
                <h2 className="text-lg font-bold">پیشرفت در مسیر فروش</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  درصد سرنخ‌هایی که به هر مرحله اصلی رسیده‌اند
                </p>
              </div>
              <ProgressChart data={data.milestones} />
            </article>
          </section>

          <section className="rounded-[24px] border border-[var(--app-divider)] bg-[var(--app-surface)] p-5 shadow-[var(--app-shadow-card)]">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold">عملکرد تیم فروش</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  مقایسه ارزش فرصت‌ها و نرخ تبدیل هر کارشناس
                </p>
              </div>
              <UsersRound className="size-5 text-[var(--app-primary)]" />
            </div>
            <OwnerScatter data={data.owners} />
          </section>

          <InsightCards data={data} />
        </>
      ) : null}
    </div>
  )
}


