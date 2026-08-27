import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  Building2,
  CalendarClock,
  CheckSquare2,
  CircleUserRound,
} from "lucide-react"
import { useNavigate } from "react-router-dom"

import { Button } from "@workspace/ui/components/button"

import { uiText } from "@/config/uiText"
import { localizeStageChangeText } from "@/features/activities/utils/activityDisplay"
import { usePipelineStages } from "@/features/opportunities/hooks/useOpportunities"

import type {
  DashboardLatestActivity,
  DashboardSummary,
} from "../types/dashboard.types"
import { formatPersianDateTime } from "../utils/dashboardFormatters"

export function AttentionPanel({
  attention,
  canViewOpportunities,
  canViewTasks,
  canViewMeetings,
}: {
  attention: DashboardSummary["attention"]
  canViewOpportunities: boolean
  canViewTasks: boolean
  canViewMeetings: boolean
}) {
  const text = uiText.dashboard.attention
  const navigate = useNavigate()

  const items = [
    ...(canViewOpportunities
      ? attention.overdueOpportunities.slice(0, 2).map((item) => ({
          id: `o-${item.id}`,
          title: item.title,
          meta:
            item.company?.brandName ||
            item.company?.legalName ||
            text.types.opportunity,
          icon: AlertTriangle,
          tone: "bg-[var(--warning-light)] text-[var(--warning)]",
          route: "/opportunities",
        }))
      : []),
    ...(canViewTasks
      ? attention.overdueTasks.slice(0, 2).map((item) => ({
          id: `t-${item.id}`,
          title: item.title,
          meta: item.assignedTo?.fullName || text.types.task,
          icon: CheckSquare2,
          tone: "bg-[var(--destructive)]/10 text-[var(--destructive)]",
          route: "/tasks",
        }))
      : []),
    ...(canViewMeetings
      ? attention.pastScheduledMeetings.slice(0, 2).map((item) => ({
          id: `m-${item.id}`,
          title: item.title,
          meta:
            item.company?.brandName ||
            item.company?.legalName ||
            text.types.meeting,
          icon: CalendarClock,
          tone: "bg-[var(--info-light)] text-[var(--info)]",
          route: "/meetings",
        }))
      : []),
  ].slice(0, 5)

  return (
    <section className="rounded-[26px] border border-[var(--app-divider)] bg-[var(--app-surface)] p-5 shadow-[var(--app-shadow-card)] sm:p-6">
      <h3 className="ui-section-title">{text.title}</h3>
      <p className="mt-1 text-xs leading-6 text-[var(--app-text-secondary)]">
        {text.description}
      </p>

      {items.length ? (
        <div className="mt-5 grid gap-2.5">
          {items.map((item) => {
            const Icon = item.icon
            return (
              <Button
                key={item.id}
                type="button"
                variant="ghost"
                className="h-auto w-full justify-start rounded-2xl bg-[var(--app-background)]/55 px-3 py-3 text-start hover:bg-[var(--app-background)]"
                onClick={() => navigate(item.route)}
              >
                <div className={`grid size-9 shrink-0 place-items-center rounded-xl ${item.tone}`}>
                  <Icon className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold text-[var(--app-heading)]">
                    {item.title}
                  </p>
                  <p className="mt-1 truncate text-xs font-normal text-[var(--app-text-secondary)]">
                    {item.meta}
                  </p>
                </div>
              </Button>
            )
          })}
        </div>
      ) : (
        <div className="mt-5 rounded-2xl border border-dashed border-[var(--app-divider)] bg-[var(--app-background)]/45 px-4 py-8 text-center text-xs text-[var(--app-text-secondary)]">
          {text.empty}
        </div>
      )}
    </section>
  )
}

export function RecentActivities({ data }: { data: DashboardLatestActivity[] }) {
  const text = uiText.dashboard.recentActivities
  const navigate = useNavigate()
  const stages = usePipelineStages(data.some((item) => item.type === "STAGE_CHANGE"))

  return (
    <section className="rounded-[26px] border border-[var(--app-divider)] bg-[var(--app-surface)] p-5 shadow-[var(--app-shadow-card)] sm:p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="ui-section-title">{text.title}</h3>
          <p className="mt-1 text-xs leading-6 text-[var(--app-text-secondary)]">
            {text.description}
          </p>
        </div>

        <Button
          type="button"
          variant="ghost"
          className="rounded-xl text-xs text-[var(--app-primary)]"
          onClick={() => navigate("/activities")}
        >
          {text.viewAll}
          <ArrowLeft className="size-3.5" />
        </Button>
      </div>

      {data.length ? (
        <div className="mt-5 divide-y divide-[var(--app-divider)]">
          {data.slice(0, 6).map((item) => (
            <div
              key={item.id}
              className="grid grid-cols-[auto_1fr] gap-3 py-3.5 first:pt-0 last:pb-0"
            >
              <div className="grid size-10 place-items-center rounded-2xl bg-[var(--app-primary-soft)] text-[var(--app-primary)]">
                <Activity className="size-4.5" />
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <p className="min-w-0 flex-1 truncate text-xs font-bold text-[var(--app-heading)]">
                    {item.type === "STAGE_CHANGE"
                      ? localizeStageChangeText(item.title, stages.data)
                      : item.title}
                  </p>
                  <time className="text-xs text-[var(--app-text-secondary)]">
                    {formatPersianDateTime(item.activityDate)}
                  </time>
                </div>

                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--app-text-secondary)]">
                  {item.company ? (
                    <span className="inline-flex items-center gap-1.5">
                      <Building2 className="size-3" />
                      {item.company.brandName || item.company.legalName}
                    </span>
                  ) : null}

                  {item.createdBy ? (
                    <span className="inline-flex items-center gap-1.5">
                      <CircleUserRound className="size-3" />
                      {item.createdBy.fullName}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-5 rounded-2xl border border-dashed border-[var(--app-divider)] bg-[var(--app-background)]/45 px-4 py-8 text-center text-xs text-[var(--app-text-secondary)]">
          {text.empty}
        </div>
      )}
    </section>
  )
}

export function DashboardSkeleton() {
  return (
    <div className="grid animate-pulse gap-5">
      <div className="h-48 rounded-[28px] bg-[var(--secondary)]/75" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-40 rounded-[22px] bg-[var(--secondary)]/70"
          />
        ))}
      </div>
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,0.8fr)]">
        <div className="h-[420px] rounded-[26px] bg-[var(--secondary)]/65" />
        <div className="h-[420px] rounded-[26px] bg-[var(--secondary)]/65" />
      </div>
    </div>
  )
}
