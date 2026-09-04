import {
  ArrowLeft,
  BarChart3,
  BriefcaseBusiness,
  CircleDollarSign,
  CircleGauge,
  Sparkles,
  Target,
} from "lucide-react"
import { useNavigate } from "react-router-dom"

import { Button } from "@workspace/ui/components/button"

import { ErrorState } from "@/components/shared/ErrorState"
import { PageHero } from "@/components/shared/PageHero"
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
  DashboardKpiCard,
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

  return (
    <div className="grid gap-5 pb-6">
      <PageHero
        title="داشبورد"
        description="نمای یکپارچه عملکرد فروش، فعالیت‌های اخیر و موارد نیازمند توجه شما."
        accessBadge={{ label: "مرکز فرمان CRM", icon: CircleGauge }}
        onBack={() => navigate("/dashboard")}
        onRefresh={() => Promise.all([summaryQuery.refetch(), activitiesQuery.refetch()])}
        refreshing={summaryQuery.isFetching || activitiesQuery.isFetching}
      />
      <section className="relative isolate overflow-hidden rounded-[var(--app-radius-hero)] border border-[var(--app-primary)]/15 bg-[linear-gradient(135deg,var(--app-on-primary-container)_0%,var(--app-primary-active)_52%,var(--app-primary)_100%)] px-5 py-6 text-[var(--app-on-primary)] shadow-[var(--app-shadow-hero)] sm:px-7 sm:py-7 lg:px-9">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -end-20 -top-28 size-80 rounded-full border border-[var(--app-on-primary)]/10" />
          <div className="absolute -end-4 -top-12 size-52 rounded-full border border-[var(--app-on-primary)]/10" />
          <div className="absolute bottom-[-55%] start-[-5%] size-80 rounded-full bg-[var(--info)]/35 blur-3xl" />
          <div className="absolute end-[18%] top-[20%] size-24 rounded-full bg-[var(--app-on-primary)]/10 blur-2xl" />
        </div>

        <div className="relative grid gap-7 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--app-on-primary)]/15 bg-[var(--app-on-primary)]/10 px-3 py-1.5 text-xs font-medium text-[var(--app-on-primary)]/90 backdrop-blur">
              <Sparkles className="size-3.5" />
              {text.hero.badge}
            </div>

            <h2 className="mt-5 text-2xl font-bold leading-relaxed sm:text-3xl">
              {text.hero.greeting}
              <span className="text-[var(--app-primary-soft)]">
                {" "}
                {user?.fullName}
              </span>
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-7 text-[var(--app-on-primary)]/70">
              {canViewReports
                ? text.hero.description
                : text.hero.limitedDescription}
            </p>

            <div className="mt-6 flex flex-wrap gap-2.5">
              {canViewOpportunities ? (
                <Button
                  type="button"
                  className="rounded-xl bg-[var(--app-on-primary)] text-[var(--app-primary-active)] hover:bg-[var(--app-background)]"
                  onClick={() => navigate("/opportunities")}
                >
                  {text.actions.opportunities}
                  <ArrowLeft className="size-4" />
                </Button>
              ) : null}

              {canViewCompanies ? (
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-xl border-[var(--app-on-primary)]/20 bg-[var(--app-on-primary)]/10 text-[var(--app-on-primary)] hover:bg-[var(--app-on-primary)]/15 hover:text-[var(--app-on-primary)]"
                  onClick={() => navigate("/companies")}
                >
                  {text.actions.companies}
                </Button>
              ) : null}
            </div>
          </div>

          {summary ? (
            <div className="grid min-w-[250px] grid-cols-2 gap-2.5">
              <div className="rounded-2xl border border-[var(--app-on-primary)]/10 bg-[var(--app-on-primary)]/10 p-4 backdrop-blur">
                <CircleGauge className="size-4 text-[var(--app-primary-soft)]" />
                <strong className="mt-4 block text-xl font-bold">
                  {formatPercent(summary.periodPerformance.opportunities.winRate)}
                </strong>
                <span className="mt-1 block text-xs text-[var(--app-on-primary)]/65">
                  {text.hero.stats.winRate}
                </span>
              </div>

              <div className="rounded-2xl border border-[var(--app-on-primary)]/10 bg-[var(--app-on-primary)]/10 p-4 backdrop-blur">
                <Target className="size-4 text-[var(--app-primary-soft)]" />
                <strong className="mt-4 block text-xl font-bold">
                  {formatCount(summary.current.activeOpportunities.count)}
                </strong>
                <span className="mt-1 block text-xs text-[var(--app-on-primary)]/65">
                  {text.hero.stats.activeCount}
                </span>
              </div>
            </div>
          ) : (
            <div className="hidden size-36 place-items-center rounded-[32px] border border-[var(--app-on-primary)]/10 bg-[var(--app-on-primary)]/10 text-[var(--app-on-primary)]/80 backdrop-blur lg:grid">
              <BarChart3 className="size-14" />
            </div>
          )}
        </div>
      </section>

      {!canViewReports ? (
        <section className="rounded-[var(--app-radius-feature)] border border-[var(--app-divider)] bg-[var(--app-surface)] p-6 shadow-[var(--app-shadow-card)]">
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
        </section>
      ) : summaryQuery.isError ? (
        <ErrorState
          title={text.errors.summaryTitle}
          description={getApiErrorMessage(
            summaryQuery.error,
            text.errors.summaryFallback,
          )}
          retryLabel={text.errors.retry}
          onRetry={() => void summaryQuery.refetch()}
        />
      ) : summary ? (
        <>
          {canViewFinancials ? <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <DashboardKpiCard
              title={text.kpis.totalPortfolio.title}
              value={compactIrr(summary.portfolio.total.estimatedValueIrr)}
              subtitle={`${formatCount(summary.portfolio.total.count)} ${text.units.opportunity}`}
              icon={CircleDollarSign}
              tone="neutral"
            />

            <DashboardKpiCard
              title={text.kpis.activePipeline.title}
              value={compactIrr(
                summary.current.activeOpportunities.estimatedValueIrr,
              )}
              subtitle={`${formatCount(summary.current.activeOpportunities.count)} ${text.kpis.activePipeline.subtitle}`}
              icon={BriefcaseBusiness}
              tone="primary"
            />

            <DashboardKpiCard
              title={text.kpis.totalWon.title}
              value={compactIrr(summary.portfolio.won.estimatedValueIrr)}
              subtitle={`${formatCount(summary.portfolio.won.count)} ${text.kpis.totalWon.subtitle}`}
              icon={Target}
              tone="success"
            />

            <DashboardKpiCard
              title={text.kpis.periodWon.title}
              value={compactIrr(
                summary.periodPerformance.opportunities.wonEstimatedValueIrr,
              )}
              subtitle={`${formatCount(summary.periodPerformance.opportunities.wonCount)} ${text.kpis.periodWon.subtitle}`}
              icon={BarChart3}
              tone="info"
            />
          </section> : null}

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
              <section className="rounded-[26px] border border-[var(--app-divider)] bg-[var(--app-surface)] p-6">
                <div className="grid min-h-44 place-items-center text-center">
                  <div>
                    <div className="mx-auto grid size-11 place-items-center rounded-2xl bg-[var(--secondary)] text-[var(--app-primary-alt)]">
                      <BriefcaseBusiness className="size-5" />
                    </div>
                    <p className="mt-4 text-sm font-bold text-[var(--app-heading)]">
                      {text.recentActivities.restrictedTitle}
                    </p>
                    <p className="mt-2 text-xs text-[var(--app-text-secondary)]">
                      {text.recentActivities.restrictedDescription}
                    </p>
                  </div>
                </div>
              </section>
            )}
          </div>
        </>
      ) : null}
    </div>
  )
}
