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

const WIDTH = 940
const HEIGHT = 292
const PLOT_LEFT = 76
const PLOT_RIGHT = 24
const PLOT_TOP = 22
const PLOT_BOTTOM = 44
const GRID_LINES = 4

function buildPath(values: number[], maxValue: number) {
  const chartWidth = WIDTH - PLOT_LEFT - PLOT_RIGHT
  const chartHeight = HEIGHT - PLOT_TOP - PLOT_BOTTOM
  const step = values.length > 1 ? chartWidth / (values.length - 1) : 0

  return values
    .map((value, index) => {
      const x = PLOT_LEFT + index * step
      const y =
        PLOT_TOP +
        chartHeight -
        (maxValue > 0 ? (value / maxValue) * chartHeight : 0)

      return `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`
    })
    .join(" ")
}

function pointPosition(
  index: number,
  value: number,
  count: number,
  maxValue: number,
) {
  const chartWidth = WIDTH - PLOT_LEFT - PLOT_RIGHT
  const chartHeight = HEIGHT - PLOT_TOP - PLOT_BOTTOM
  const step = count > 1 ? chartWidth / (count - 1) : 0

  return {
    x: PLOT_LEFT + index * step,
    y:
      PLOT_TOP +
      chartHeight -
      (maxValue > 0 ? (value / maxValue) * chartHeight : 0),
  }
}

function niceMax(value: number) {
  if (value <= 0) return 1

  const magnitude = 10 ** Math.floor(Math.log10(value))
  const normalized = value / magnitude

  const rounded =
    normalized <= 1
      ? 1
      : normalized <= 2
        ? 2
        : normalized <= 5
          ? 5
          : 10

  return rounded * magnitude
}

export function OpportunityTrendChart({
  data,
  activeCount,
  activeValueIrr,
}: {
  data: DashboardSummary["opportunityTrend12m"]
  activeCount: number
  activeValueIrr: number | string | null
}) {
  const text = uiText.dashboard.trend
  const [mode, setMode] = useState<TrendMode>("count")
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

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

  const rawMax = Math.max(
    1,
    ...points.flatMap((item) => [item.created, item.won, item.lost]),
  )
  const maxValue = niceMax(rawMax)
  const latestMonth = points.at(-1)?.label ?? text.currentPeriodFallback

  const activeSummary =
    mode === "count"
      ? {
          title: `${text.activeSummary.countPrefix} ${latestMonth} ${text.activeSummary.monthSuffix}`,
          value: `${formatCount(activeCount)} ${uiText.dashboard.units.opportunity}`,
        }
      : {
          title: `${text.activeSummary.valuePrefix} ${latestMonth} ${text.activeSummary.monthSuffix}`,
          value: `${formatCompactNumber(activeValueIrr)} ${uiText.dashboard.units.rial}`,
        }

  const hovered = hoveredIndex === null ? null : points[hoveredIndex]

  const formatSeriesValue = (value: number) =>
    mode === "count"
      ? `${formatCount(value)} ${uiText.dashboard.units.opportunity}`
      : `${formatCompactNumber(value)} ${uiText.dashboard.units.rial}`

  const formatAxisValue = (value: number) =>
    mode === "count"
      ? formatCount(Math.round(value))
      : formatCompactNumber(value)

  return (
    <section className="relative overflow-hidden rounded-[26px] border border-[var(--app-divider)] bg-[var(--app-surface)] p-5 shadow-[var(--app-shadow-card)] sm:p-6">
      <div className="pointer-events-none absolute -start-20 -top-20 size-64 rounded-full bg-[var(--app-primary)]/5 blur-3xl" />

      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <h3 className="ui-section-title">{text.title}</h3>

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
        <div className="mb-3 grid gap-2 rounded-xl bg-[var(--app-surface)]/88 px-3 py-2.5 shadow-sm lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs">
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
          </div>

          <div className="text-start lg:text-end">
            <span className="block text-xs text-[var(--app-text-secondary)]">
              {activeSummary.title}
            </span>
            <strong className="mt-0.5 block text-xs text-[var(--app-heading)]">
              {activeSummary.value}
            </strong>
          </div>
        </div>

        <div className="relative">
          <div className="mb-1 flex items-center justify-start ps-1 text-xs font-medium text-[var(--app-text-secondary)]">
            {mode === "count" ? text.axis.count : text.axis.value}
          </div>

          <div className="relative overflow-x-auto">
            {hovered ? (
              <div className="pointer-events-none absolute end-4 top-3 z-10 min-w-44 rounded-2xl border border-[var(--app-divider)] bg-[var(--app-surface)]/95 p-3 text-xs shadow-[var(--app-shadow-popover)] backdrop-blur">
                <strong className="text-[var(--app-heading)]">{hovered.label}</strong>

                <div className="mt-2 grid gap-1.5 text-xs text-[var(--app-text-secondary)]">
                  <div className="flex items-center justify-between gap-5">
                    <span>{text.series.created}</span>
                    <strong className="text-[var(--app-heading)]">
                      {formatSeriesValue(hovered.created)}
                    </strong>
                  </div>
                  <div className="flex items-center justify-between gap-5">
                    <span>{text.series.won}</span>
                    <strong className="text-[var(--app-heading)]">
                      {formatSeriesValue(hovered.won)}
                    </strong>
                  </div>
                  <div className="flex items-center justify-between gap-5">
                    <span>{text.series.lost}</span>
                    <strong className="text-[var(--app-heading)]">
                      {formatSeriesValue(hovered.lost)}
                    </strong>
                  </div>
                </div>
              </div>
            ) : null}

            <svg
              viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
              className="min-w-[740px] w-full"
              role="img"
              aria-label={text.ariaLabel}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {Array.from({ length: GRID_LINES + 1 }).map((_, index) => {
                const ratio = index / GRID_LINES
                const y =
                  PLOT_TOP +
                  (HEIGHT - PLOT_TOP - PLOT_BOTTOM) * ratio
                const axisValue = maxValue * (1 - ratio)

                return (
                  <g key={index}>
                    <line
                      x1={PLOT_LEFT}
                      x2={WIDTH - PLOT_RIGHT}
                      y1={y}
                      y2={y}
                      stroke="var(--app-divider)"
                      strokeWidth="1"
                    />
                    <text
                      x={PLOT_LEFT - 12}
                      y={y + 4}
                      textAnchor="end"
                      fontSize="10"
                      fill="var(--app-text-secondary)"
                    >
                      {formatAxisValue(axisValue)}
                    </text>
                  </g>
                )
              })}

              <path
                d={buildPath(points.map((item) => item.created), maxValue)}
                fill="none"
                stroke="var(--app-primary)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d={buildPath(points.map((item) => item.won), maxValue)}
                fill="none"
                stroke="var(--success)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d={buildPath(points.map((item) => item.lost), maxValue)}
                fill="none"
                stroke="var(--destructive)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="7 6"
              />

              {points.map((point, index) => {
                const created = pointPosition(
                  index,
                  point.created,
                  points.length,
                  maxValue,
                )
                const won = pointPosition(index, point.won, points.length, maxValue)
                const lost = pointPosition(
                  index,
                  point.lost,
                  points.length,
                  maxValue,
                )

                const chartWidth = WIDTH - PLOT_LEFT - PLOT_RIGHT
                const hitWidth = Math.max(
                  40,
                  chartWidth / Math.max(points.length, 1),
                )

                return (
                  <g
                    key={`${point.label}-${index}`}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onFocus={() => setHoveredIndex(index)}
                    tabIndex={0}
                    className="cursor-pointer outline-none"
                  >
                    <rect
                      x={created.x - hitWidth / 2}
                      y={PLOT_TOP}
                      width={hitWidth}
                      height={HEIGHT - PLOT_TOP - PLOT_BOTTOM}
                      fill="transparent"
                    />

                    {[created, won, lost].map((item, pointIndex) => (
                      <circle
                        key={pointIndex}
                        cx={item.x}
                        cy={item.y}
                        r={hoveredIndex === index ? 5 : 3.5}
                        fill={
                          pointIndex === 0
                            ? "var(--app-primary)"
                            : pointIndex === 1
                              ? "var(--success)"
                              : "var(--destructive)"
                        }
                        stroke="var(--app-surface)"
                        strokeWidth="2"
                      />
                    ))}

                    <text
                      x={created.x}
                      y={HEIGHT - 12}
                      textAnchor="middle"
                      fontSize="11"
                      fill={
                        hoveredIndex === index
                          ? "var(--app-heading)"
                          : "var(--app-text-secondary)"
                      }
                    >
                      {point.label}
                    </text>
                  </g>
                )
              })}
            </svg>
          </div>
        </div>

        {mode === "value" ? (
          <div className="mt-1 text-xs text-[var(--app-text-secondary)]">
            {text.axis.valueHint}
          </div>
        ) : null}
      </div>
    </section>
  )
}

type DonutSegmentKey = "active" | "won" | "lost"

export function OpportunityStatusDonut({
  portfolio,
}: {
  portfolio: DashboardSummary["portfolio"]
}) {
  const text = uiText.dashboard.status
  const [hoveredSegment, setHoveredSegment] =
    useState<DonutSegmentKey | null>(null)

  const segments = [
    {
      key: "active" as const,
      label: text.active,
      count: portfolio.active.count,
      percentage: toFiniteNumber(portfolio.active.percentage),
      stroke: "var(--app-primary)",
      dot: "bg-[var(--app-primary)]",
    },
    {
      key: "won" as const,
      label: text.won,
      count: portfolio.won.count,
      percentage: toFiniteNumber(portfolio.won.percentage),
      stroke: "var(--success)",
      dot: "bg-[var(--success)]",
    },
    {
      key: "lost" as const,
      label: text.lost,
      count: portfolio.lost.count,
      percentage: toFiniteNumber(portfolio.lost.percentage),
      stroke: "var(--destructive)",
      dot: "bg-[var(--destructive)]",
    },
  ]

  let offset = 0
  const renderedSegments = segments.map((segment) => {
    const item = { ...segment, offset }
    offset += segment.percentage
    return item
  })

  const hovered = segments.find((item) => item.key === hoveredSegment)

  return (
    <section className="relative overflow-hidden rounded-[26px] border border-[var(--app-divider)] bg-[var(--app-surface)] p-5 shadow-[var(--app-shadow-card)] sm:p-6">
      <h3 className="ui-section-title">{text.title}</h3>
      <p className="mt-1 text-xs leading-6 text-[var(--app-text-secondary)]">
        {text.description}
      </p>

      <div className="relative mt-6 grid place-items-center">
        {hovered ? (
          <div className="pointer-events-none absolute top-0 z-10 rounded-2xl border border-[var(--app-divider)] bg-[var(--app-surface)]/95 px-4 py-3 text-center shadow-[var(--app-shadow-popover)] backdrop-blur">
            <strong className="block text-xs text-[var(--app-heading)]">
              {hovered.label}
            </strong>
            <span className="mt-1 block text-xs text-[var(--app-text-secondary)]">
              {text.legend.countLabel}: {formatCount(hovered.count)}{" "}
              {uiText.dashboard.units.opportunity}
            </span>
            <span className="mt-1 block text-xs text-[var(--app-text-secondary)]">
              {text.legend.shareLabel}: {formatPercent(hovered.percentage)}
            </span>
          </div>
        ) : null}

        <div className="relative size-52">
          <svg
            viewBox="0 0 120 120"
            className="size-full -rotate-90"
            role="img"
            aria-label={text.ariaLabel}
            onMouseLeave={() => setHoveredSegment(null)}
          >
            <circle
              cx="60"
              cy="60"
              r="42"
              fill="none"
              stroke="var(--secondary)"
              strokeWidth="18"
              pathLength="100"
            />

            {renderedSegments.map((segment) => (
              <circle
                key={segment.key}
                cx="60"
                cy="60"
                r="42"
                fill="none"
                stroke={segment.stroke}
                strokeWidth={hoveredSegment === segment.key ? 20 : 18}
                pathLength="100"
                strokeDasharray={`${Math.max(segment.percentage, 0.001)} ${100 - Math.max(segment.percentage, 0.001)}`}
                strokeDashoffset={-segment.offset}
                strokeLinecap="butt"
                className="cursor-pointer transition-all duration-200"
                onMouseEnter={() => setHoveredSegment(segment.key)}
                onFocus={() => setHoveredSegment(segment.key)}
                tabIndex={0}
              />
            ))}
          </svg>

          <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
            <div>
              <strong className="block text-3xl font-bold text-[var(--app-heading)]">
                {formatCount(portfolio.total.count)}
              </strong>
              <span className="mt-1 block text-xs text-[var(--app-text-secondary)]">
                {text.total}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-2.5">
        {segments.map((segment) => (
          <button
            key={segment.key}
            type="button"
            className="grid w-full grid-cols-[minmax(0,1fr)_88px_88px] items-center gap-3 rounded-xl bg-[var(--app-background)]/70 px-3 py-3 text-start transition hover:bg-[var(--app-background)]"
            onMouseEnter={() => setHoveredSegment(segment.key)}
            onMouseLeave={() => setHoveredSegment(null)}
            onFocus={() => setHoveredSegment(segment.key)}
            onBlur={() => setHoveredSegment(null)}
          >
            <span className="flex min-w-0 items-center gap-2.5">
              <span className={`size-2.5 shrink-0 rounded-full ${segment.dot}`} />
              <strong className="truncate text-xs text-[var(--app-heading)]">
                {segment.label}
              </strong>
            </span>

            <span className="text-center">
              <span className="block text-xs leading-5 text-[var(--app-text-secondary)]">
                {text.legend.countLabel}
              </span>
              <strong className="block text-xs leading-5 text-[var(--app-heading)]">
                {formatCount(segment.count)}
              </strong>
            </span>

            <span className="text-center">
              <span className="block text-xs leading-5 text-[var(--app-text-secondary)]">
                {text.legend.shareLabel}
              </span>
              <strong className="block text-xs leading-5 text-[var(--app-heading)]">
                {formatPercent(segment.percentage)}
              </strong>
            </span>
          </button>
        ))}
      </div>
    </section>
  )
}
