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
  return new Intl.NumberFormat("fa-IR", {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(value)
}

function monthLabel(value: string) {
  const [year, month] = value.split("-").map(Number)
  return new Intl.DateTimeFormat("fa-IR", {
    year: "2-digit",
    month: "short",
  }).format(new Date(Date.UTC(year, month - 1, 1)))
}

function normalizeText(value: string) {
  return value
    .replace(/ي/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/\s+/g, " ")
    .trim()
}

function findMilestoneRate(
  milestones: ConversionHealth["milestones"],
  matchers: string[],
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
  const Icon = metric.delta > 0 ? ArrowUp : metric.delta < 0 ? ArrowDown : Activity

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

function LeadStatusChart({ data }: { data: ConversionHealth["outcomes"] }) {
  const colors: Record<string, string> = {
    won: "#2E7D32",
    lost: "#C62828",
    onHold: "#F9A825",
    active: "#2196F3",
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
        <div className="relative size-72 rounded-full" style={{ background: gradient }}>
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
        const y =
          height - padding - (item[key] / max) * (height - padding * 2)
        return `${x},${y}`
      })
      .join(" ")

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-4 text-xs">
        <span className="inline-flex items-center gap-2">
          <i className="h-0.5 w-5 bg-[#2196F3]" />سرنخ‌های ایجادشده
        </span>
        <span className="inline-flex items-center gap-2">
          <i className="h-0.5 w-5 bg-[#2E7D32]" />مشتری‌شده
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
            stroke="#2196F3"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={points("leads")}
          />
          <polyline
            fill="none"
            stroke="#2E7D32"
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
                className="fill-muted-foreground text-[11px]"
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
    },
    {
      key: "engagement",
      label: "تعامل",
      rate: findMilestoneRate(data.milestones, ["تعامل"]),
      stages: ["تماس گرفته شده", "علاقه‌مند"],
    },
    {
      key: "assessment",
      label: "ارزیابی",
      rate: findMilestoneRate(data.milestones, ["ارزیابی"]),
      stages: ["واجد شرایط", "نیازسنجی"],
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
    },
    {
      key: "won",
      label: "برنده",
      rate: data.summary.leadToCustomer.current,
      stages: ["انجام شده"],
    },
  ]

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
      <div className="space-y-3">
        {phases.map((phase, index) => {
          const visualWidth = Math.max(34, Math.min(100, 28 + phase.rate * 0.72))
          const shade = Math.max(0.42, 0.96 - index * 0.08)
          return (
            <div key={phase.key} className="space-y-2">
              <div
                className="mx-auto flex h-16 items-center justify-between gap-4 px-5 text-white shadow-sm"
                style={{
                  width: `${visualWidth}%`,
                  backgroundColor: `rgba(37, 99, 235, ${shade})`,
                  clipPath: "polygon(7% 0, 100% 0, 93% 100%, 0 100%)",
                }}
              >
                <span className="text-sm font-bold">{phase.label}</span>
                <span className="text-lg font-black">{fa(phase.rate, 1)}٪</span>
              </div>
              <div className="text-center text-xs leading-6 text-muted-foreground">
                {phase.stages.join(" • ")}
              </div>
            </div>
          )
        })}
      </div>

      <div className="rounded-[22px] border border-[var(--app-divider)] bg-muted/30 p-4 text-sm leading-7 text-muted-foreground">
        <div className="mb-2 font-bold text-foreground">توضیح فانل</div>
        <p>
          این فانل بر اساس مسیر توافق‌شده نمایش داده می‌شود:
          <span className="mx-1 font-medium text-foreground">
            سرنخ ← تعامل ← ارزیابی ← پیشنهاد ← نهایی‌سازی ← برنده
          </span>
        </p>
        <p className="mt-3">
          وضعیت‌های «متوقف شده»، «بدون پاسخ» و «از دست رفته» خارج از فانل اصلی
          هستند و در این نمودار نمایش داده نمی‌شوند.
        </p>
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
  const height = 430
  const padding = 68
  const maxValue = Math.max(1, ...data.map((item) => item.pipelineValue))

  const averageRate =
    data.reduce((sum, item) => sum + item.conversionRate, 0) / data.length
  const averageValue =
    data.reduce((sum, item) => sum + item.pipelineValue, 0) / data.length

  const valueX = padding + (averageValue / maxValue) * (width - padding * 2)
  const rateY =
    height -
    padding -
    (Math.min(100, averageRate) / 100) * (height - padding * 2)

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

  return (
    <div className="relative">
      <div className="mb-4 flex flex-wrap items-center gap-x-5 gap-y-2 rounded-xl bg-muted/40 px-3 py-2 text-[11px] text-muted-foreground">
        <span>
          خط عمودی: میانگین ارزش تیم
          <strong className="ms-1 text-foreground">{fa(averageValue)} ریال</strong>
        </span>
        <span>
          خط افقی: میانگین نرخ تبدیل تیم
          <strong className="ms-1 text-foreground">{fa(averageRate, 1)}٪</strong>
        </span>
        <span>اندازه دایره: تعداد فرصت‌ها</span>
      </div>

      {hovered ? (() => {
        const pipelineDiff = valueDiffPercent(hovered.pipelineValue)
        const rateDiff = hovered.conversionRate - averageRate
        const status = getStatus(hovered.pipelineValue, hovered.conversionRate)

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
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">میانگین نرخ تیم</span>
                <strong>{fa(averageRate, 1)}٪</strong>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">میانگین ارزش تیم</span>
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
                  <span className="ms-1">{pipelineDiff >= 0 ? "بالاتر" : "پایین‌تر"}</span>
                </strong>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">نرخ تبدیل</span>
                <strong>
                  {fa(Math.abs(rateDiff), 1)} واحد درصد
                  <span className="ms-1">{rateDiff >= 0 ? "بالاتر" : "پایین‌تر"}</span>
                </strong>
              </div>
            </div>

            <div className="my-3 border-t border-[var(--app-divider)]" />

            <div className="mb-2 font-bold">فرمول جایگاه</div>
            <div className="space-y-1 leading-6 text-muted-foreground">
              <p>
                محور افقی = ارزش فرصت‌های کارشناس در مقایسه با میانگین تیم
              </p>
              <p>
                محور عمودی = نرخ تبدیل کارشناس در مقایسه با میانگین تیم
              </p>
              <p>
                نتیجه این کارشناس: <strong className="text-foreground">{status}</strong>
              </p>
            </div>
          </div>
        )
      })() : null}

      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="min-w-[700px] w-full"
          onMouseLeave={() => setHoveredOwnerId(null)}
        >
          <rect
            x={padding}
            y={padding}
            width={Math.max(0, valueX - padding)}
            height={Math.max(0, rateY - padding)}
            fill="#2E7D32"
            opacity="0.035"
          />
          <rect
            x={valueX}
            y={padding}
            width={Math.max(0, width - padding - valueX)}
            height={Math.max(0, rateY - padding)}
            fill="#2E7D32"
            opacity="0.08"
          />
          <rect
            x={padding}
            y={rateY}
            width={Math.max(0, valueX - padding)}
            height={Math.max(0, height - padding - rateY)}
            fill="#64748B"
            opacity="0.04"
          />
          <rect
            x={valueX}
            y={rateY}
            width={Math.max(0, width - padding - valueX)}
            height={Math.max(0, height - padding - rateY)}
            fill="#C62828"
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
            strokeDasharray="7 7"
            opacity="0.8"
          />
          <line
            x1={padding}
            x2={width - padding}
            y1={rateY}
            y2={rateY}
            stroke="var(--app-text-secondary)"
            strokeDasharray="7 7"
            opacity="0.8"
          />

          <text x={padding + 12} y={padding + 22} fontSize="12" fill="#2E7D32">
            تبدیل خوب، فرصت کم
          </text>
          <text
            x={width - padding - 12}
            y={padding + 22}
            textAnchor="end"
            fontSize="12"
            fill="#2E7D32"
          >
            عملکرد برتر
          </text>
          <text
            x={padding + 12}
            y={height - padding - 16}
            fontSize="12"
            fill="#64748B"
          >
            نیازمند بررسی
          </text>
          <text
            x={width - padding - 12}
            y={height - padding - 16}
            textAnchor="end"
            fontSize="12"
            fill="#C62828"
          >
            فرصت زیاد، تبدیل پایین
          </text>

          <text
            x={width / 2}
            y={height - 14}
            textAnchor="middle"
            className="fill-muted-foreground text-[12px]"
          >
            ارزش فرصت‌های فروش
          </text>
          <text
            x={20}
            y={height / 2}
            transform={`rotate(-90 20 ${height / 2})`}
            textAnchor="middle"
            className="fill-muted-foreground text-[12px]"
          >
            نرخ تبدیل
          </text>
          <text x={valueX + 8} y={height - padding + 18} fontSize="10" fill="var(--app-text-secondary)">
            میانگین ارزش تیم
          </text>
          <text x={padding + 8} y={rateY - 8} fontSize="10" fill="var(--app-text-secondary)">
            میانگین نرخ تبدیل
          </text>

          {data.map((item) => {
            const x = padding + (item.pipelineValue / maxValue) * (width - padding * 2)
            const y =
              height -
              padding -
              (Math.min(100, item.conversionRate) / 100) * (height - padding * 2)
            const r = Math.max(9, Math.min(17, 7 + Math.sqrt(item.total)))
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
                  fillOpacity={active ? 0.96 : 0.78}
                  stroke="var(--app-surface)"
                  strokeWidth="3"
                />
                <text
                  x={x}
                  y={y - r - 8}
                  textAnchor="middle"
                  className="fill-foreground text-[11px] font-bold"
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
            <p className="mt-4 text-2xl font-black">{fa(leakage.dropRate, 1)}٪</p>
            <p className="mt-1 text-sm leading-7 text-muted-foreground">
              بین «{leakage.fromLabel}» و «{leakage.toLabel}»؛
              {" "}{fa(leakage.dropCount)} فرصت به مرحله بعد نرسیده‌اند.
            </p>
          </>
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">
            برای تشخیص نقطه ریزش داده کافی وجود ندارد.
          </p>
        )}
      </article>

      <article className="rounded-[22px] border border-[var(--app-divider)] bg-[var(--app-surface)] p-5">
        <div className="flex items-center gap-2 text-[var(--app-primary)]">
          <Target className="size-5" />
          <h3 className="font-bold">کیفیت تبدیل</h3>
        </div>
        <p className="mt-4 text-2xl font-black">
          {fa(data.summary.leadToCustomer.current, 1)}٪
        </p>
        <p className="mt-1 text-sm leading-7 text-muted-foreground">
          از سرنخ‌های بازه انتخابی، این درصد در نهایت به مشتری تبدیل شده‌اند.
        </p>
      </article>

      <article className="rounded-[22px] border border-[var(--app-divider)] bg-[var(--app-surface)] p-5">
        <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
          <RotateCcw className="size-5" />
          <h3 className="font-bold">بازگشت از توقف</h3>
        </div>
        <p className="mt-4 text-2xl font-black">{fa(data.recovery.rate, 1)}٪</p>
        <p className="mt-1 text-sm leading-7 text-muted-foreground">
          از فرصت‌هایی که وارد «متوقف شده» شده‌اند، این درصد دوباره به مسیر فروش
          برگشته‌اند.
        </p>
      </article>
    </section>
  )
}

export function ReportsPage() {
  const [dateRange, setDateRange] = useState<PersianDateRange | undefined>()
  const [scope, setScope] = useState<"all" | "mine">("all")

  const filters = useMemo<ReportFilters>(
    () => ({
      startDate: dateRange?.from?.toISOString(),
      endDate: dateRange?.to?.toISOString(),
      ownershipScope: scope,
    }),
    [dateRange, scope],
  )

  const query = useReportsAnalytics(filters)
  const data = query.data

  return (
    <div className="grid gap-5" dir="rtl">
      <section className="relative overflow-hidden rounded-[30px] border border-[var(--app-divider)] bg-[var(--app-surface)] px-5 py-6 shadow-[var(--app-shadow-card)] sm:px-7">
        <div className="pointer-events-none absolute -end-16 -top-20 size-64 rounded-full bg-[var(--app-primary-soft)] blur-3xl" />
        <div className="relative flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[var(--app-divider)] bg-background/70 px-3 py-1 text-xs text-muted-foreground">
              <TrendingUp className="size-4" />هوش فروش
            </div>
            <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
              تحلیل فروش و سلامت مسیر
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-muted-foreground">
              در این صفحه می‌بینید چند درصد سرنخ‌ها مشتری شده‌اند، فرصت‌ها در چه
              وضعیتی هستند، تیم فروش چگونه عمل کرده و هر سرنخ در کدام فاز فانل قرار
              می‌گیرد.
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

      <section className="rounded-[24px] border border-[var(--app-divider)] bg-[var(--app-surface)] p-3 shadow-[var(--app-shadow-card)]">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
          <div className="min-w-0 flex-1">
            <PersianDateRangePicker
              value={dateRange}
              onChange={setDateRange}
              placeholder="۹۰ روز اخیر"
            />
          </div>
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
          title="دریافت تحلیل فروش با خطا مواجه شد"
          description="Endpoint مربوط به گزارش‌ها را در Backend بررسی کنید."
          retryLabel="تلاش مجدد"
          onRetry={() => void query.refetch()}
        />
      ) : null}

      {query.isLoading ? (
        <div className="grid min-h-72 place-items-center rounded-[24px] border border-[var(--app-divider)] bg-[var(--app-surface)] text-sm text-muted-foreground">
          در حال تحلیل داده‌های فروش...
        </div>
      ) : null}

      {data ? (
        <>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
          </section>

          <section className="rounded-[24px] border border-[var(--app-divider)] bg-[var(--app-surface)] p-5 shadow-[var(--app-shadow-card)]">
            <div className="mb-5">
              <h2 className="text-lg font-bold">روند جذب تا تبدیل</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                مقایسه تعداد سرنخ‌های ایجادشده با تعداد مشتری‌شده در طول بازه زمانی
              </p>
            </div>
            <TrendChart data={data.trend} />
          </section>

          <section className="grid gap-5 xl:grid-cols-2">
            <article className="rounded-[24px] border border-[var(--app-divider)] bg-[var(--app-surface)] p-5 shadow-[var(--app-shadow-card)]">
              <div className="mb-5">
                <h2 className="text-lg font-bold">وضعیت سرنخ‌ها</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  توزیع فعلی سرنخ‌ها در وضعیت‌های اصلی بازه انتخابی
                </p>
              </div>
              <LeadStatusChart data={data.outcomes} />
            </article>

            <article className="rounded-[24px] border border-[var(--app-divider)] bg-[var(--app-surface)] p-5 shadow-[var(--app-shadow-card)]">
              <div className="mb-5">
                <h2 className="text-lg font-bold">پیشرفت در مسیر فروش</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  نمایش فازهای فانل و استیج‌های هر فاز بر اساس مسیر توافق‌شده
                </p>
              </div>
              <FunnelChart data={data} />
            </article>
          </section>

          <section className="rounded-[24px] border border-[var(--app-divider)] bg-[var(--app-surface)] p-5 shadow-[var(--app-shadow-card)]">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold">عملکرد تیم فروش</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  هر دایره یک کارشناس است؛ محور افقی ارزش فرصت‌ها و محور عمودی نرخ
                  تبدیل را نشان می‌دهد.
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
