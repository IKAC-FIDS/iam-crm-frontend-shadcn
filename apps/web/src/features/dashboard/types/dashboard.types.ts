export type NumericValue = number | string

export interface DashboardSummary {
  generatedAt: string
  period: { startDate: string; endDate: string }
  current: {
    activeOpportunities: {
      count: number
      estimatedValueIrr: NumericValue
      weightedValueIrr: NumericValue
      missingValueCount: number
      missingProbabilityCount: number
    }
    tasks: {
      openCount: number
      overdueCount: number
      dueTodayCount: number
      dueNextSevenDaysCount: number
    }
    meetings: {
      todayCount: number
      upcomingSevenDaysCount: number
      pastScheduledCount: number
    }
  }
  periodPerformance: {
    opportunities: {
      createdCount: number
      wonCount: number
      lostCount: number
      wonEstimatedValueIrr: NumericValue
      winRate: NumericValue
    }
    tasks: Record<string, NumericValue>
    meetings: {
      totalCount: number
      completedCount: number
      cancelledCount: number
      pastScheduledCount: number
      executionRate: NumericValue
    }
  }
  forecast: {
    horizonStartDate: string
    horizonEndDate: string
    opportunityCount: number
    estimatedValueIrr: NumericValue
    weightedValueIrr: NumericValue
    overdueCloseCount: number
    withoutCloseDateCount: number
  }
  attention: {
    overdueOpportunities: Array<{
      id: string
      title: string
      expectedCloseDate: string
      company?: { legalName: string; brandName?: string | null }
    }>
    overdueTasks: Array<{
      id: string
      title: string
      dueAt: string
      assignedTo?: { fullName: string } | null
    }>
    pastScheduledMeetings: Array<{
      id: string
      title: string
      startAt: string
      company?: { legalName: string; brandName?: string | null }
    }>
  }
  portfolio: {
    total: { count: number; estimatedValueIrr: NumericValue }
    active: { count: number; estimatedValueIrr: NumericValue; percentage: NumericValue }
    won: { count: number; estimatedValueIrr: NumericValue; percentage: NumericValue }
    lost: { count: number; estimatedValueIrr: NumericValue; percentage: NumericValue }
  }
  opportunityTrend12m: Array<{
    periodStart: string
    periodEnd: string
    createdCount: number
    wonCount: number
    lostCount: number
    createdValueIrr: NumericValue
    wonValueIrr: NumericValue
    lostValueIrr: NumericValue
  }>
  periodComparison?: {
    currentPeriod: { startDate: string; endDate: string }
    comparisonPeriod: { startDate: string; endDate: string }
    metrics: Array<{
      key: string
      currentValue: NumericValue
      comparisonValue: NumericValue
      percentChange: number | null
      direction: "UP" | "DOWN" | "UNCHANGED"
      polarity: "HIGHER_IS_BETTER" | "LOWER_IS_BETTER" | "NEUTRAL"
      isImprovement: boolean | null
    }>
  }
}

export interface DashboardLatestActivity {
  id: string
  type: string
  title: string
  activityDate: string
  person?: { id: string; fullName: string } | null
  company?: {
    id: string
    legalName: string
    brandName?: string | null
  } | null
  createdBy?: {
    id: string
    fullName: string
    email?: string
  } | null
}
