import {
  Activity,
  BarChart3,
  BriefcaseBusiness,
  CircleDollarSign,
  CircleGauge,
  LayoutDashboard,
  Target,
} from "lucide-react"
import { useNavigate } from "react-router-dom"

import {
  DashboardMetricGrid,
  DashboardSection,
} from "@/components/shared/DashboardSection"
import { EmptyState } from "@/components/shared/EmptyState"
import { ErrorState } from "@/components/shared/ErrorState"
import { MetricCard } from "@/components/shared/MetricCard"
import { PageHero } from "@/components/shared/PageHero"
import { SurfaceCard } from "@/components/shared/SurfaceCard"
import { uiText } from "@/config/uiText"
import { getApiErrorMessage } from "@/lib/apiResponse"
import { canViewFinancials as hasFinancialVisibility } from "@/lib/permissions"
import { useAuthStore } from "@/store/authStore"

import {
  AttentionPanel,
  DashboardSkeleton,
  RecentActivities,
} from "../components/DashboardPanels"
import {
  OpportunityStatusDonut,
  OpportunityTrendChart,
} from "../components/DashboardVisuals"
import {
  useDashboardLatestActivities,
  useDashboardSummary,
} from "../hooks/useDashboard"
import {
  formatCompactNumber,
  formatCount,
  formatPercent,
} from "../utils/dashboardFormatters"

function hasPermission(permissions: string[], permission: string) {
  return permissions.includes(permission)
}

export function DashboardPage() {
  const text = uiText.dashboard
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const permissions = user?.permissions ?? []

  const canViewReports = hasPermission(permissions, "report:view")
  const canViewFinancials = hasFinancialVisibility(permissions)
  const canViewActivities =
    canViewReports && hasPermission(permissions, "activity:view")
  const canViewOpportunities = hasPermission(permissions, "opportunity:view")
  const canViewTasks = hasPermission(permissions, "task:view")
  const canViewMeetings = hasPermission(permissions, "meeting:view")
  const canViewCompanies = hasPermission(permissions, "company:view")

  const summaryQuery = useDashboardSummary(canViewReports)
  const activitiesQuery = useDashboardLatestActivities(canViewActivities)
  const summary = summaryQuery.data

  const compactIrr = (value: number | string | null | undefined) =>
    `${formatCompactNumber(value)} ${text.units.rial}`

  if (canViewReports && summaryQuery.isPending) {
    return <DashboardSkeleton />
  }

  const refreshing = summaryQuery.isFetching || activitiesQuery.isFetching

  return (
    <div className="grid gap-5 pb-6">
      <PageHero
        title={`${text.hero.greeting} ${user?.fullName || ""}`.trim()}
        description={
          canViewReports ? text.hero.description : text.hero.limitedDescription
        }
        accessBadge={{ label: text.hero.badge, icon: LayoutDashboard }}
        onBack={() => navigate("/dashboard")}
        onRefresh={async () => {
          const requests: Promise<unknown>[] = []
          if (canViewReports) requests.push(summaryQuery.refetch())
          if (canViewActivities) requests.push(activitiesQuery.refetch())
          await Promise.all(requests)
        }}
        refreshing={refreshing}
        facts={
          summary
            ? [
                {
                  id: "win-rate",
                  label: text.hero.stats.winRate,
                  value: formatPercent(
                    summary.periodPerformance.opportunities.winRate
                  ),
                  icon: CircleGauge,
                  tone: "success",
                  href: canViewOpportunities ? "/opportunities" : undefined,
                },
                {
                  id: "active-opportunities",
                  label: text.hero.stats.activeCount,
                  value: formatCount(summary.current.activeOpportunities.count),
                  icon: Target,
                  tone: "primary",
                  href: canViewOpportunities ? "/opportunities" : undefined,
                },
              ]
            : []
        }
        primaryAction={
          canViewOpportunities
            ? {
                label: text.actions.opportunities,
                icon: BriefcaseBusiness,
                onClick: () => navigate("/opportunities"),
              }
            : undefined
        }
        secondaryActions={
          canViewCompanies
            ? [
                {
                  id: "companies",
                  label: text.actions.companies,
                  onClick: () => navigate("/companies"),
                  variant: "outline",
                },
              ]
            : []
        }
      />

      {!canViewReports ? (
        <SurfaceCard className="p-5 sm:p-6">
          <div className="flex items-start gap-4">
            <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[var(--app-primary-soft)] text-[var(--app-primary)]">
              <BriefcaseBusiness className="size-5" />
            </div>

            <div>
              <h3 className="ui-section-title">{text.permissions.title}</h3>
              <p className="mt-2 text-sm leading-7 text-[var(--app-text-secondary)]">
                {text.permissions.description}
              </p>
            </div>
          </div>
        </SurfaceCard>
      ) : summaryQuery.isError ? (
        <ErrorState
          title={text.errors.summaryTitle}
          description={getApiErrorMessage(
            summaryQuery.error,
            text.errors.summaryFallback
          )}
          retryLabel={text.errors.retry}
          onRetry={() => void summaryQuery.refetch()}
        />
      ) : summary ? (
        <>
          {canViewFinancials ? (
            <DashboardSection
              id="dashboard-financial-overview"
              title="نمای مالی فرصت‌ها"
              description="ارزش سبد، پایپ‌لاین و فروش موفق در یک نگاه"
              icon={CircleDollarSign}
            >
              <DashboardMetricGrid>
                <MetricCard
                  label={text.kpis.totalPortfolio.title}
                  value={compactIrr(summary.portfolio.total.estimatedValueIrr)}
                  helper={`${formatCount(summary.portfolio.total.count)} ${text.units.opportunity}`}
                  icon={CircleDollarSign}
                  tone="neutral"
                  onClick={
                    canViewOpportunities
                      ? () => navigate("/opportunities")
                      : undefined
                  }
                />

                <MetricCard
                  label={text.kpis.activePipeline.title}
                  value={compactIrr(
                    summary.current.activeOpportunities.estimatedValueIrr
                  )}
                  helper={`${formatCount(summary.current.activeOpportunities.count)} ${text.kpis.activePipeline.subtitle}`}
                  icon={BriefcaseBusiness}
                  tone="primary"
                  onClick={
                    canViewOpportunities
                      ? () => navigate("/opportunities")
                      : undefined
                  }
                />

                <MetricCard
                  label={text.kpis.totalWon.title}
                  value={compactIrr(summary.portfolio.won.estimatedValueIrr)}
                  helper={`${formatCount(summary.portfolio.won.count)} ${text.kpis.totalWon.subtitle}`}
                  icon={Target}
                  tone="success"
                  onClick={
                    canViewOpportunities
                      ? () => navigate("/opportunities")
                      : undefined
                  }
                />

                <MetricCard
                  label={text.kpis.periodWon.title}
                  value={compactIrr(
                    summary.periodPerformance.opportunities.wonEstimatedValueIrr
                  )}
                  helper={`${formatCount(summary.periodPerformance.opportunities.wonCount)} ${text.kpis.periodWon.subtitle}`}
                  icon={BarChart3}
                  tone="info"
                  onClick={
                    canViewOpportunities
                      ? () => navigate("/opportunities")
                      : undefined
                  }
                />
              </DashboardMetricGrid>
            </DashboardSection>
          ) : null}

          <DashboardSection
            id="dashboard-opportunity-analysis"
            title="تحلیل فرصت‌ها"
            description="روند دوازده‌ماهه و ترکیب فعلی سبد فرصت‌ها"
            icon={BarChart3}
          >
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1.75fr)_minmax(320px,0.75fr)]">
              <OpportunityTrendChart
                data={summary.opportunityTrend12m}
                activeCount={summary.current.activeOpportunities.count}
                activeValueIrr={
                  summary.current.activeOpportunities.estimatedValueIrr
                }
                canViewValues={canViewFinancials}
              />
              <OpportunityStatusDonut portfolio={summary.portfolio} />
            </div>
          </DashboardSection>

          <DashboardSection
            id="dashboard-attention"
            title="پیگیری روزانه"
            description="موارد نیازمند اقدام و جدیدترین فعالیت‌های ثبت‌شده"
            icon={Activity}
          >
            <div className="grid gap-5 xl:grid-cols-2">
              <AttentionPanel
                attention={summary.attention}
                canViewOpportunities={canViewOpportunities}
                canViewTasks={canViewTasks}
                canViewMeetings={canViewMeetings}
              />

              {canViewActivities ? (
                activitiesQuery.isError ? (
                  <ErrorState
                    title={text.recentActivities.title}
                    description={text.errors.activitiesFallback}
                  />
                ) : (
                  <RecentActivities data={activitiesQuery.data ?? []} />
                )
              ) : (
                <SurfaceCard className="p-4 sm:p-5">
                  <EmptyState
                    icon={BriefcaseBusiness}
                    title={text.recentActivities.restrictedTitle}
                    description={text.recentActivities.restrictedDescription}
                  />
                </SurfaceCard>
              )}
            </div>
          </DashboardSection>
        </>
      ) : null}
    </div>
  )
}
