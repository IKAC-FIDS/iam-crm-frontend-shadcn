import { useMemo, useState } from "react"
import type { LucideIcon } from "lucide-react"

import { Button } from "@workspace/ui/components/button"

import { uiText } from "@/config/uiText"

import type { DashboardSummary } from "../types/dashboard.types"
import {
  formatCompactNumber,
  formatCount,
  formatPersianMonth,
  formatPercent,
  toFiniteNumber,
} from "../utils/dashboardFormatters"

export function DashboardKpiCard({
  title,
  value,
  subtitle,
  icon: Icon,
  tone,
}: {
  title: string
  value: string
  subtitle: string
  icon: LucideIcon
  tone: "primary" | "success" | "info" | "neutral"
}) {
  const toneClass = {
    primary: "bg-[var(--app-primary-soft)] text-[var(--app-primary)]",
    success: "bg-[var(--success-light)] text-[var(--success)]",
    info: "bg-[var(--info-light)] text-[var(--info)]",
    neutral: "bg-[var(--secondary)] text-[var(--app-primary-alt)]",
  }[tone]

  return (
    <article className="group relative overflow-hidden rounded-[22px] border border-[var(--app-divider)] bg-[var(--app-surface)] p-5 shadow-[var(--app-shadow-card)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[var(--app-shadow-popover)]">
      <div className="pointer-events-none absolute -end-12 -top-12 size-28 rounded-full bg-[var(--app-primary)]/5 blur-3xl transition duration-300 group-hover:scale-125" />

      <div className={`relative grid size-11 place-items-center rounded-2xl ${toneClass}`}>
        <Icon className="size-5" />
      </div>

      <div className="relative mt-5">
        <p className="text-xs font-medium text-[var(--app-text-secondary)]">
          {title}
        </p>
        <p className="mt-2 text-[26px] font-bold leading-none text-[var(--app-heading)]">
          {value}
        </p>
        <p className="mt-3 text-xs text-[var(--app-text-secondary)]">
          {subtitle}
        </p>
      </div>
    </article>
  )
}

type TrendMode = "count" | "value"
const WIDTH = 900
const HEIGHT = 280
const PX = 28
const PT = 24
const PB = 38

function buildPath(values: number[], maxValue: number) {
  const chartWidth = WIDTH - PX * 2
  const chartHeight = HEIGHT - PT - PB
  const step = values.length > 1 ? chartWidth / (values.length - 1) : 0

  return values
    .map((value, index) => {
      const x = PX + index * step
      const y = PT + chartHeight - (value / maxValue) * chartHeight
      return `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`
    })
    .join(" ")
}

export function OpportunityTrendChart({
  data,
}: {
  data: DashboardSummary["opportunityTrend12m"]
}) {
  const text = uiText.dashboard.trend
  const [mode, setMode] = useState<TrendMode>("count")

  const points = useMemo(
    () =>
      data.map((item) => ({
        label: formatPersianMonth(item.periodStart),
        created:
          mode === "count"
            ? item.createdCount
            : toFiniteNumber(item.createdValueIrr),
        won:
          mode === "count" ? item.wonCount : toFiniteNumber(item.wonValueIrr),
        lost:
          mode === "count" ? item.lostCount : toFiniteNumber(item.lostValueIrr),
      })),
    [data, mode],
  )

  const maxValue = Math.max(
    1,
    ...points.flatMap((item) => [item.created, item.won, item.lost]),
  )

  const formatValue = (value: number) =>
    mode === "count"
      ? formatCount(value)
      : `${formatCompactNumber(value)} ${uiText.dashboard.units.rial}`

  return (
    <section className="relative overflow-hidden rounded-[26px] border border-[var(--app-divider)] bg-[var(--app-surface)] p-5 shadow-[var(--app-shadow-card)] sm:p-6">
      <div className="pointer-events-none absolute -start-20 -top-20 size-64 rounded-full bg-[var(--app-primary)]/5 blur-3xl" />

      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="ui-section-title">{text.title}</h3>
          <p className="mt-1 text-xs leading-6 text-[var(--app-text-secondary)]">
            {text.description}
          </p>
        </div>

        <div className="flex w-fit rounded-xl bg-[var(--app-background)] p-1">
          {(["count", "value"] as const).map((item) => (
            <Button
              key={item}
              type="button"
              variant="ghost"
              className={
                mode === item
                  ? "h-8 rounded-lg bg-[var(--app-surface)] px-3 text-[var(--app-primary)] shadow-sm hover:bg-[var(--app-surface)]"
                  : "h-8 rounded-lg px-3 text-[var(--app-text-secondary)]"
              }
              onClick={() => setMode(item)}
            >
              {text.modes[item]}
            </Button>
          ))}
        </div>
      </div>

      <div className="relative mt-5 overflow-hidden rounded-[20px] border border-[var(--app-divider)]/80 bg-[linear-gradient(180deg,var(--app-background),var(--app-surface))] p-3">
        <div className="mb-3 flex flex-wrap gap-x-5 gap-y-2 rounded-xl bg-[var(--app-surface)]/85 px-3 py-2 text-[11px] shadow-sm">
          <span className="inline-flex items-center gap-1.5 text-[var(--app-text-secondary)]">
            <i className="size-2 rounded-full bg-[var(--app-primary)]" />
            {text.series.created}
          </span>
          <span className="inline-flex items-center gap-1.5 text-[var(--app-text-secondary)]">
            <i className="size-2 rounded-full bg-[var(--success)]" />
            {text.series.won}
          </span>
          <span className="inline-flex items-center gap-1.5 text-[var(--app-text-secondary)]">
            <i className="size-2 rounded-full bg-[var(--destructive)]" />
            {text.series.lost}
          </span>
          {points.length ? (
            <span className="ms-auto text-[var(--app-text-secondary)]">
              {points.at(-1)?.label}: {formatValue(points.at(-1)?.created ?? 0)}
            </span>
          ) : null}
        </div>

        <div className="overflow-x-auto">
          <svg
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            className="min-w-[720px] w-full"
            role="img"
            aria-label={text.ariaLabel}
          >
            {[0.25, 0.5, 0.75, 1].map((ratio) => {
              const y = PT + (HEIGHT - PT - PB) * ratio
              return (
                <line
                  key={ratio}
                  x1={PX}
                  x2={WIDTH - PX}
                  y1={y}
                  y2={y}
                  stroke="var(--app-divider)"
                  strokeWidth="1"
                />
              )
            })}

            <path
              d={buildPath(points.map((item) => item.created), maxValue)}
              fill="none"
              stroke="var(--app-primary)"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <path
              d={buildPath(points.map((item) => item.won), maxValue)}
              fill="none"
              stroke="var(--success)"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <path
              d={buildPath(points.map((item) => item.lost), maxValue)}
              fill="none"
              stroke="var(--destructive)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray="7 6"
            />

            {points.map((point, index) => {
              const x =
                PX +
                index *
                  ((WIDTH - PX * 2) / Math.max(1, points.length - 1))
              return (
                <text
                  key={`${point.label}-${index}`}
                  x={x}
                  y={HEIGHT - 12}
                  textAnchor="middle"
                  fontSize="11"
                  fill="var(--app-text-secondary)"
                >
                  {point.label}
                </text>
              )
            })}
          </svg>
        </div>
      </div>
    </section>
  )
}

export function OpportunityStatusDonut({
  portfolio,
}: {
  portfolio: DashboardSummary["portfolio"]
}) {
  const text = uiText.dashboard.status
  const active = toFiniteNumber(portfolio.active.percentage)
  const won = toFiniteNumber(portfolio.won.percentage)
  const lost = Math.max(0, 100 - active - won)

  const gradient = `conic-gradient(
    var(--app-primary) 0% ${active}%,
    var(--success) ${active}% ${active + won}%,
    var(--destructive) ${active + won}% ${active + won + lost}%,
    var(--secondary) ${active + won + lost}% 100%
  )`

  const rows = [
    [text.active, portfolio.active.count, portfolio.active.percentage, "bg-[var(--app-primary)]"],
    [text.won, portfolio.won.count, portfolio.won.percentage, "bg-[var(--success)]"],
    [text.lost, portfolio.lost.count, portfolio.lost.percentage, "bg-[var(--destructive)]"],
  ] as const

  return (
    <section className="relative overflow-hidden rounded-[26px] border border-[var(--app-divider)] bg-[var(--app-surface)] p-5 shadow-[var(--app-shadow-card)] sm:p-6">
      <h3 className="ui-section-title">{text.title}</h3>
      <p className="mt-1 text-xs leading-6 text-[var(--app-text-secondary)]">
        {text.description}
      </p>

      <div className="mt-6 grid place-items-center">
        <div
          className="grid size-48 place-items-center rounded-full"
          style={{ background: gradient }}
        >
          <div className="grid size-32 place-items-center rounded-full border border-[var(--app-divider)] bg-[var(--app-surface)] text-center shadow-[0_10px_30px_rgba(15,23,42,0.08)]">
            <div>
              <strong className="block text-3xl font-bold text-[var(--app-heading)]">
                {formatCount(portfolio.total.count)}
              </strong>
              <span className="mt-1 block text-[11px] text-[var(--app-text-secondary)]">
                {text.total}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-2">
        {rows.map(([label, count, percentage, dot]) => (
          <div
            key={label}
            className="flex items-center justify-between rounded-xl bg-[var(--app-background)]/70 px-3 py-2.5"
          >
            <div className="flex items-center gap-2.5">
              <span className={`size-2.5 rounded-full ${dot}`} />
              <span className="text-xs font-medium text-[var(--app-heading)]">
                {label}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <strong>{formatCount(count)}</strong>
              <span className="text-[var(--app-text-secondary)]">
                {formatPercent(percentage)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
