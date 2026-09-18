import {
  Activity,
  Building2,
  CalendarDays,
  CircleDollarSign,
  ListChecks,
  RotateCcw,
  Target,
  UsersRound,
} from "lucide-react"
import { useMemo, useState } from "react"
import { Link } from "react-router-dom"

import { IdentityAvatar } from "@/components/shared/IdentityAvatar"
import {
  DashboardMetricGrid,
  DashboardSection,
} from "@/components/shared/DashboardSection"
import { DashboardToolbar } from "@/components/shared/DashboardToolbar"
import { EmptyState } from "@/components/shared/EmptyState"
import { MetricCard } from "@/components/shared/MetricCard"
import { PersianDateRangePicker } from "@/components/shared/date"
import type { DateRangeValue } from "@/lib/date/jalali"
import { QueryContent } from "@/components/shared/QueryContent"
import { SearchableOptionSelect } from "@/components/shared/SearchableOptionSelect"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { SurfaceCard } from "@/components/shared/SurfaceCard"
import { Button } from "@workspace/ui/components/button"

import type { UserPerformanceReport as ReportData } from "../api/reportsApi"
import {
  useReportFilterOptions,
  useUserPerformanceReport,
} from "../hooks/useReportsAnalytics"

const number = new Intl.NumberFormat("fa-IR")

export function UserPerformanceReport() {
  const [dateRange, setDateRange] = useState<DateRangeValue>({})
  const [teamId, setTeamId] = useState<string>()
  const [teamSearch, setTeamSearch] = useState("")
  const filters = useMemo(
    () => ({
      startDate: dateRange.from?.toISOString(),
      endDate: dateRange.to?.toISOString(),
      teamId,
    }),
    [dateRange, teamId]
  )
  const query = useUserPerformanceReport(filters)
  const optionsQuery = useReportFilterOptions()
  const teams = useMemo(() => {
    const needle = teamSearch.trim().toLocaleLowerCase("fa")
    return (optionsQuery.data?.teams ?? [])
      .filter(
        (item) =>
          !needle ||
          item.label.toLocaleLowerCase("fa").includes(needle) ||
          item.code.toLocaleLowerCase("en").includes(needle)
      )
      .map((item) => ({ id: item.id, label: item.label, secondary: item.code }))
  }, [optionsQuery.data?.teams, teamSearch])

  return (
    <div className="grid gap-5">
      <DashboardToolbar
        title="فیلتر گزارش عملکرد"
        description="با انتخاب تیم، عملکرد همه اعضای فعال آن در کارت‌های جداگانه نمایش داده می‌شود؛ بدون فیلتر همه اعضای سازمان محاسبه می‌شوند."
        icon={UsersRound}
      >
        <div className="grid w-full gap-3 sm:grid-cols-2 lg:w-auto lg:grid-cols-[minmax(300px,1fr)_minmax(260px,0.8fr)_auto] lg:items-end">
          <label className="grid gap-2">
            <span className="text-xs font-bold text-[var(--app-heading)]">
              بازه گزارش
            </span>
            <PersianDateRangePicker value={dateRange} onChange={setDateRange} />
          </label>
          <div className="grid gap-2">
            <span className="text-xs font-bold text-[var(--app-heading)]">
              تیم
            </span>
            <SearchableOptionSelect
              value={teamId}
              options={teams}
              search={teamSearch}
              onSearchChange={setTeamSearch}
              onChange={setTeamId}
              placeholder="همه تیم‌ها"
              ariaLabel="انتخاب تیم گزارش"
              loading={optionsQuery.isLoading}
            />
          </div>
          <Button
            type="button"
            variant="outline"
            className="rounded-xl"
            disabled={!dateRange.from && !dateRange.to && !teamId}
            onClick={() => {
              setDateRange({})
              setTeamId(undefined)
              setTeamSearch("")
            }}
          >
            <RotateCcw className="size-4" />
            پاک‌کردن فیلترها
          </Button>
        </div>
      </DashboardToolbar>
      <QueryContent query={query} errorTitle="دریافت گزارش عملکرد انجام نشد">
        {query.data ? (
          <PerformanceContent data={query.data} dateRange={dateRange} />
        ) : null}
      </QueryContent>
    </div>
  )
}

function PerformanceContent({
  data,
  dateRange,
}: {
  data: ReportData
  dateRange: DateRangeValue
}) {
  return (
    <>
      <DashboardSection
        id="reports-user-summary"
        title="خلاصه عملکرد اعضا"
        description="مجموع شاخص‌های اعضای انتخاب‌شده در بازه گزارش"
        icon={Activity}
      >
        <DashboardMetricGrid columns={5}>
          <MetricCard
            icon={Activity}
            label="فعالیت‌های ثبت‌شده"
            value={data.activity.total}
          />
          <MetricCard
            icon={Building2}
            label="شرکت‌های ایجادشده"
            value={data.companiesCreated}
          />
          <MetricCard icon={CalendarDays} label="جلسات" value={data.meetings} />
          <MetricCard
            icon={ListChecks}
            label="کارهای ایجادشده"
            value={data.tasksCreated}
          />
          <MetricCard
            icon={Target}
            label="فرصت‌های ایجادشده"
            value={data.opportunities.total}
          />
        </DashboardMetricGrid>
      </DashboardSection>
      <DashboardSection
        id="reports-user-members"
        title="مقایسه عملکرد اعضا"
        description="جزئیات فعالیت، کار، جلسه و فرصت هر عضو"
        icon={UsersRound}
        badge={`${number.format(data.members.length)} عضو`}
      >
        {data.members.length ? (
          <div className="grid gap-5 xl:grid-cols-2">
            {data.members.map((member) => (
              <MemberCard
                key={member.user.id}
                member={member}
                financialVisible={data.financialVisible}
                dateRange={dateRange}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={UsersRound}
            title="عضوی پیدا نشد"
            description="عضو فعالی مطابق تیم و بازه انتخاب‌شده وجود ندارد."
          />
        )}
      </DashboardSection>
    </>
  )
}

function MemberCard({
  member,
  financialVisible,
  dateRange,
}: {
  member: ReportData["members"][number]
  financialVisible: boolean
  dateRange: DateRangeValue
}) {
  const activityHref = (code: string) =>
    withQuery("/activities", {
      ownershipScope: "all",
      ownerId: member.user.id,
      activityType: code,
      dateFrom: dateRange.from?.toISOString(),
      dateTo: dateRange.to?.toISOString(),
    })
  const taskHref = (extra: Record<string, string | undefined>) =>
    withQuery("/tasks", { page: "1", ...extra })
  const meetingHref = withQuery("/meetings", {
    page: "1",
    organizerId: member.user.id,
    dateFrom: dateRange.from?.toISOString(),
    dateTo: dateRange.to?.toISOString(),
  })
  return (
    <SurfaceCard className="min-w-0 overflow-hidden">
      <header className="flex items-center gap-3 border-b border-[var(--app-divider)] bg-[var(--app-background)] p-4 sm:p-5">
        <IdentityAvatar
          name={member.user.fullName}
          mediaPath={`/users/${member.user.id}/avatar`}
          hasMedia
          className="size-11"
        />
        <div className="min-w-0">
          <h3 className="truncate text-sm font-bold text-[var(--app-heading)]">
            {member.user.fullName}
          </h3>
          <p className="mt-1 truncate text-xs text-[var(--app-text-secondary)]">
            {member.user.teamRef?.name ?? member.user.email ?? "بدون تیم"}
          </p>
        </div>
      </header>
      <div className="grid gap-4 p-4 sm:p-5">
        <div>
          <p className="mb-2 text-xs font-bold text-[var(--app-heading)]">
            فعالیت‌ها و سهم از کل تیم
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {member.activity.breakdown.map((item) => (
              <Link
                key={item.code}
                to={activityHref(item.code)}
                className="flex items-center justify-between gap-3 rounded-xl bg-[var(--app-background)] p-3 transition hover:bg-[var(--app-primary-soft)] focus-visible:ring-2 focus-visible:ring-[var(--app-primary)] focus-visible:outline-none"
              >
                <span className="min-w-0 truncate text-xs font-bold">
                  {item.label}
                </span>
                <span className="flex shrink-0 items-center gap-2">
                  <strong>{number.format(item.count)}</strong>
                  <StatusBadge
                    tone={item.count ? "info" : "neutral"}
                    dot={false}
                  >
                    {number.format(item.percentage ?? 0)}٪
                  </StatusBadge>
                </span>
              </Link>
            ))}
          </div>
        </div>
        <div className="grid gap-2 sm:grid-cols-3">
          <PlainMetric label="شرکت ایجادشده" value={member.companiesCreated} />
          <LinkedMetric
            label="جلسات"
            value={member.meetings}
            to={meetingHref}
          />
          <LinkedMetric
            label="کار ایجادشده"
            value={member.tasksCreated}
            to={taskHref({ createdById: member.user.id, view: "organization" })}
          />
          <LinkedMetric
            label="کار واگذارشده"
            value={member.tasksAssigned.total}
            to={taskHref({
              assignedToId: member.user.id,
              view: "organization",
            })}
          />
          <LinkedMetric
            label="کار انجام‌شده"
            value={member.tasksAssigned.completed}
            tone="success"
            to={taskHref({
              assignedToId: member.user.id,
              status: "DONE",
              view: "organization",
            })}
          />
          <PlainMetric
            label="کار انجام‌نشده"
            value={member.tasksAssigned.incomplete}
            tone="warning"
          />
          <PlainMetric
            label="فرصت ایجادشده"
            value={member.opportunities.total}
          />
        </div>
        <div className="grid gap-2 sm:grid-cols-3">
          <OpportunityMetric
            label="فعال"
            count={member.opportunities.active}
            value={member.opportunities.activeValue}
            tone="info"
            showValue={financialVisible}
          />
          <OpportunityMetric
            label="موفق"
            count={member.opportunities.won}
            value={member.opportunities.wonValue}
            tone="success"
            showValue={financialVisible}
          />
          <OpportunityMetric
            label="از دست‌رفته"
            count={member.opportunities.lost}
            value={member.opportunities.lostValue}
            tone="error"
            showValue={financialVisible}
          />
        </div>
      </div>
    </SurfaceCard>
  )
}

function withQuery(path: string, values: Record<string, string | undefined>) {
  const query = new URLSearchParams()
  Object.entries(values).forEach(([key, value]) => {
    if (value) query.set(key, value)
  })
  return `${path}?${query.toString()}`
}
function PlainMetric({
  label,
  value,
  tone = "neutral",
}: {
  label: string
  value: number
  tone?: "neutral" | "warning"
}) {
  return (
    <div className="rounded-xl bg-[var(--app-background)] p-3">
      <StatusBadge tone={tone} dot={false}>
        {label}
      </StatusBadge>
      <p className="mt-2 text-lg font-bold">{number.format(value)}</p>
    </div>
  )
}
function LinkedMetric({
  label,
  value,
  to,
  tone = "neutral",
}: {
  label: string
  value: number
  to: string
  tone?: "neutral" | "success"
}) {
  return (
    <Link
      to={to}
      className="rounded-xl bg-[var(--app-background)] p-3 transition hover:bg-[var(--app-primary-soft)] focus-visible:ring-2 focus-visible:ring-[var(--app-primary)] focus-visible:outline-none"
    >
      <StatusBadge tone={tone} dot={false}>
        {label}
      </StatusBadge>
      <p className="mt-2 text-lg font-bold">{number.format(value)}</p>
    </Link>
  )
}
function OpportunityMetric({
  label,
  count,
  value,
  tone,
  showValue,
}: {
  label: string
  count: number
  value: number | null
  tone: "info" | "success" | "error"
  showValue: boolean
}) {
  return (
    <div className="rounded-xl border border-[var(--app-divider)] p-3">
      <div className="flex items-center justify-between gap-2">
        <StatusBadge tone={tone}>{label}</StatusBadge>
        <strong>{number.format(count)}</strong>
      </div>
      {showValue && value !== null ? (
        <div className="mt-3 flex items-center gap-2 text-xs text-[var(--app-text-secondary)]">
          <CircleDollarSign className="size-4" />
          {money(value)}
        </div>
      ) : null}
    </div>
  )
}
function money(value: number) {
  return `${number.format(Math.round(value))} ریال`
}
