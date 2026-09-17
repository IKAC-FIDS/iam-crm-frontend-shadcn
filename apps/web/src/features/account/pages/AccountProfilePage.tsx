import { useMemo, useState, type ReactNode } from "react"
import { Link, useNavigate } from "react-router-dom"
import {
  Activity,
  ArrowLeft,
  AtSign,
  Bell,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock3,
  KeyRound,
  ListChecks,
  MessageSquareText,
  RotateCcw,
  ShieldCheck,
  TriangleAlert,
  UserRound,
} from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import { uiText } from "@/config/uiText"
import { formatJalaliDateTime } from "@/lib/date/jalali"
import { useAuthStore, type AuthUser } from "@/store/authStore"
import {
  ContentList,
  ContentListItem,
  ContentSection,
} from "@/components/shared/ContentSection"
import { EmptyState } from "@/components/shared/EmptyState"
import {
  DashboardMetricGrid,
  DashboardSection,
} from "@/components/shared/DashboardSection"
import { DashboardToolbar } from "@/components/shared/DashboardToolbar"
import { IdentityAvatar } from "@/components/shared/IdentityAvatar"
import { MetricCard } from "@/components/shared/MetricCard"
import { PageHero } from "@/components/shared/PageHero"
import {
  PersianDateRangePicker,
  type PersianDateRange,
} from "@/components/shared/PersianDateRangePicker"
import { ProfileMediaEditor } from "@/components/shared/ProfileMediaEditor"
import { QueryContent } from "@/components/shared/QueryContent"
import { StatusBadge, type StatusTone } from "@/components/shared/StatusBadge"
import { SurfaceCard } from "@/components/shared/SurfaceCard"
import { safeNotificationActionUrl } from "@/features/notifications/utils/notificationDisplay"
import {
  taskStatusLabel,
  taskStatusTone,
} from "@/features/tasks/utils/taskFormatters"
import { useAccountWorkspace } from "../hooks/useAccountWorkspace"
import type {
  AccountWorkspace,
  WorkspaceCompanyIdentity,
} from "../types/accountWorkspace.types"

const profileText = uiText.profile
function dateInput(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function defaultPeriod(): PersianDateRange {
  const to = new Date()
  const from = new Date(to)
  from.setDate(from.getDate() - 30)
  return { from, to }
}

function money(value: number | null) {
  return value == null
    ? "محرمانه"
    : `${new Intl.NumberFormat("fa-IR").format(value)} ریال`
}

function companyName(company?: WorkspaceCompanyIdentity | null) {
  return company?.brandName || company?.legalName || "بدون شرکت"
}

export function AccountProfilePage() {
  const user = useAuthStore((state) => state.user)
  const patchUser = useAuthStore((state) => state.patchUser)
  const [period, setPeriod] = useState<PersianDateRange>(defaultPeriod)
  const filters = useMemo(
    () => ({
      startDate: period.from ? dateInput(period.from) : undefined,
      endDate: period.to ? dateInput(period.to) : undefined,
      recentLimit: 5,
    }),
    [period]
  )
  const workspaceQuery = useAccountWorkspace(filters)

  return (
    <div className="grid gap-6">
      <PageHero
        title="مرکز کار شخصی"
        description="کارها، فرصت‌ها، جلسات، اعلان‌ها و شاخص‌های کاری خودتان را در یک نمای یکپارچه دنبال کنید."
        accessBadge={{ label: "حساب کاربری", icon: UserRound }}
        backFallback="/dashboard"
        onRefresh={() => workspaceQuery.refetch()}
        refreshing={workspaceQuery.isFetching}
        secondaryActions={[
          {
            id: "security",
            label: "امنیت حساب",
            icon: KeyRound,
            href: "/account/security",
            variant: "outline",
          },
        ]}
      />

      <ProfileIdentity
        user={user}
        onAvatarChanged={(hasMedia) =>
          patchUser({
            avatarObjectKey: hasMedia ? `updated-${Date.now()}` : null,
          })
        }
      />

      <DashboardToolbar
        title="بازه گزارش عملکرد"
        description="آمار فعالیت‌ها در بازه انتخابی محاسبه می‌شود؛ فهرست‌های جاری مستقل از این بازه‌اند."
        icon={CalendarDays}
      >
        <div className="min-w-64 flex-1">
          <PersianDateRangePicker
            value={period}
            onChange={(value) => setPeriod(value || {})}
          />
        </div>
        <Button variant="outline" onClick={() => setPeriod(defaultPeriod())}>
          <RotateCcw className="size-4" />
          ۳۰ روز اخیر
        </Button>
      </DashboardToolbar>

      <QueryContent
        query={workspaceQuery}
        errorTitle="اطلاعات مرکز کار شخصی دریافت نشد"
      >
        {workspaceQuery.data ? (
          <WorkspaceContent
            data={workspaceQuery.data}
            user={user}
            reportStart={filters.startDate}
            reportEnd={filters.endDate}
          />
        ) : null}
      </QueryContent>

      <AccountDetails user={user} />
    </div>
  )
}

function ProfileIdentity({
  user,
  onAvatarChanged,
}: {
  user: AuthUser | null
  onAvatarChanged: (hasMedia: boolean) => void
}) {
  return (
    <SurfaceCard className="relative overflow-hidden border-[var(--app-primary-soft)] p-5 sm:p-6">
      <div className="pointer-events-none absolute -end-24 -top-24 size-80 rounded-full bg-[var(--app-primary-soft)]/60 blur-3xl" />
      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center">
        {user ? (
          <ProfileMediaEditor
            name={user.fullName}
            mediaPath={`/users/${user.id}/avatar`}
            hasMedia={Boolean(user.avatarObjectKey)}
            mediaVersion={user.avatarObjectKey}
            canEdit
            label="تصویر پروفایل"
            onChanged={onAvatarChanged}
          />
        ) : null}
        <div className="min-w-0">
          <h2 className="text-xl font-bold text-[var(--app-heading)]">
            {user?.fullName || uiText.common.notAvailable}
          </h2>
          <p className="mt-1 text-sm text-[var(--app-text-secondary)]">
            {user?.roleName || user?.role}{" "}
            {user?.teamName ? `· ${user.teamName}` : ""}
          </p>
          <p className="mt-2 flex items-center gap-2 text-xs text-[var(--app-text-secondary)]">
            <AtSign className="size-4" />
            {user?.email}
          </p>
        </div>
      </div>
    </SurfaceCard>
  )
}

function WorkspaceContent({
  data,
  user,
  reportStart,
  reportEnd,
}: {
  data: AccountWorkspace
  user: AuthUser | null
  reportStart?: string
  reportEnd?: string
}) {
  const navigate = useNavigate()
  const can = (permission: string) =>
    Boolean(user?.permissions.includes(permission))
  const go = (path: string, permission?: string) =>
    permission && !can(permission) ? undefined : () => navigate(path)
  const activityBase = `/activities?scope=mine&ownerId=${user?.id || ""}${reportStart ? `&dateFrom=${encodeURIComponent(reportStart)}` : ""}${reportEnd ? `&dateTo=${encodeURIComponent(reportEnd)}` : ""}`

  return (
    <div className="grid gap-6">
      <DashboardSection
        id="attention"
        title="نیازمند توجه شما"
        description="موارد فوری را پیش از ادامه روز کاری بررسی کنید."
        icon={TriangleAlert}
        tone="warning"
        badge={`${(
          data.attention.overdueTasks +
          data.attention.dueTodayTasks +
          data.attention.unreadNotifications +
          data.attention.unreadConversationMessages
        ).toLocaleString("fa-IR")} مورد`}
      >
        <DashboardMetricGrid columns={5}>
          <MetricCard
            label="کارهای عقب‌افتاده"
            value={data.attention.overdueTasks}
            icon={TriangleAlert}
            tone="warning"
            onClick={go("/tasks?page=1&quick=overdue", "task:view")}
          />
          <MetricCard
            label="سررسید امروز"
            value={data.attention.dueTodayTasks}
            icon={Clock3}
            tone="info"
            onClick={go("/tasks?page=1&dueState=today&quick=mine", "task:view")}
          />
          <MetricCard
            label="جلسات پیش‌رو"
            value={data.attention.upcomingMeetings}
            icon={CalendarDays}
            onClick={go("/meetings?page=1&quick=upcoming", "meeting:view")}
          />
          <MetricCard
            label="اعلان خوانده‌نشده"
            value={data.attention.unreadNotifications}
            icon={Bell}
            tone="info"
            onClick={go("/attention?tab=notifications", "notification:view")}
          />
          <MetricCard
            label="پیام خوانده‌نشده"
            value={data.attention.unreadConversationMessages}
            icon={MessageSquareText}
            tone="primary"
            onClick={go("/attention?tab=conversations", "activity:view")}
          />
        </DashboardMetricGrid>
      </DashboardSection>

      <DashboardSection
        id="overview"
        title="نمای کلی من"
        description="خلاصه عملکرد و موجودی کاری شما در یک نگاه"
        icon={Activity}
      >
        <DashboardMetricGrid columns={6}>
          <MetricCard
            label="کارهای باز"
            value={data.summary.tasks.open}
            helper={`${data.summary.tasks.completed.toLocaleString("fa-IR")} تکمیل‌شده`}
            icon={ListChecks}
            onClick={go("/tasks?page=1&quick=mine", "task:view")}
          />
          <MetricCard
            label="فرصت‌های فعال"
            value={data.summary.opportunities.active}
            helper={money(data.summary.opportunities.activeValue)}
            icon={BriefcaseBusiness}
            onClick={go(
              `/opportunities?page=1&ownershipScope=mine&ownerId=${user?.id || ""}`,
              "opportunity:view"
            )}
          />
          <MetricCard
            label="شرکت‌های تحت مالکیت"
            value={data.summary.companiesOwned}
            icon={Building2}
            onClick={go(
              "/companies?page=1&ownershipScope=MINE",
              "company:view"
            )}
          />
          <MetricCard
            label="فعالیت‌های بازه"
            value={data.summary.activities}
            icon={Activity}
            tone="info"
            onClick={go(activityBase, "activity:view")}
          />
          <MetricCard
            label="جلسات پیش‌رو"
            value={data.summary.upcomingMeetings}
            icon={CalendarDays}
            onClick={go("/meetings?page=1&quick=upcoming", "meeting:view")}
          />
          <MetricCard
            label="کل فرصت‌ها"
            value={data.summary.opportunities.total}
            helper={money(data.summary.opportunities.totalValue)}
            icon={BriefcaseBusiness}
            tone="neutral"
            onClick={go(
              `/opportunities?page=1&ownershipScope=mine&ownerId=${user?.id || ""}`,
              "opportunity:view"
            )}
          />
        </DashboardMetricGrid>
      </DashboardSection>

      <div className="grid gap-6 xl:grid-cols-2">
        <EntitySection
          title="کارهای جاری"
          description="نزدیک‌ترین کارهای باز شما"
          icon={ListChecks}
          href="/tasks?page=1&quick=mine"
          canView={can("task:view")}
          empty="کار بازی برای شما وجود ندارد."
        >
          {data.recent.tasks.map((task) => (
            <EntityLink
              key={task.id}
              to={can("task:view") ? `/tasks/${task.id}` : undefined}
            >
              <CompanyAvatar company={task.company} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <strong className="truncate text-sm">{task.title}</strong>
                  <StatusBadge tone={taskStatusTone(task.status)}>
                    {taskStatusLabel(task.status)}
                  </StatusBadge>
                </div>
                <p className="mt-1 text-xs text-[var(--app-text-secondary)]">
                  {companyName(task.company)}
                  {task.dueAt ? ` · ${formatJalaliDateTime(task.dueAt)}` : ""}
                </p>
              </div>
            </EntityLink>
          ))}
        </EntitySection>

        <EntitySection
          title="جلسات پیش‌رو"
          description="جلساتی که برگزارکننده یا عضو آن هستید"
          icon={CalendarDays}
          href="/meetings?page=1&quick=upcoming"
          canView={can("meeting:view")}
          empty="جلسه برنامه‌ریزی‌شده‌ای ندارید."
        >
          {data.recent.meetings.map((meeting) => (
            <EntityLink
              key={meeting.id}
              to={can("meeting:view") ? `/meetings/${meeting.id}` : undefined}
            >
              <CompanyAvatar company={meeting.company} />
              <div className="min-w-0 flex-1">
                <strong className="block truncate text-sm">
                  {meeting.title}
                </strong>
                <p className="mt-1 text-xs text-[var(--app-text-secondary)]">
                  {companyName(meeting.company)} ·{" "}
                  {formatJalaliDateTime(meeting.startAt)}
                </p>
              </div>
            </EntityLink>
          ))}
        </EntitySection>

        <EntitySection
          title="فرصت‌های اخیر"
          description="فرصت‌هایی که مالک آن‌ها هستید"
          icon={BriefcaseBusiness}
          href={`/opportunities?page=1&ownershipScope=mine&ownerId=${user?.id || ""}`}
          canView={can("opportunity:view")}
          empty="فرصتی تحت مالکیت شما نیست."
        >
          {data.recent.opportunities.map((opportunity) => (
            <EntityLink
              key={opportunity.id}
              to={
                can("opportunity:view")
                  ? `/opportunities/${opportunity.id}`
                  : undefined
              }
            >
              <CompanyAvatar company={opportunity.company} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <strong className="truncate text-sm">
                    {opportunity.title}
                  </strong>
                  <StatusBadge
                    tone={
                      opportunity.stage.terminalType === "WON"
                        ? "success"
                        : opportunity.stage.terminalType === "LOST"
                          ? "error"
                          : "primary"
                    }
                  >
                    {opportunity.stage.label}
                  </StatusBadge>
                </div>
                <p className="mt-1 text-xs text-[var(--app-text-secondary)]">
                  {companyName(opportunity.company)} ·{" "}
                  {money(opportunity.estimatedValue)}
                </p>
              </div>
            </EntityLink>
          ))}
        </EntitySection>

        <EntitySection
          title="شرکت‌های من"
          description="آخرین شرکت‌های تحت مالکیت شما"
          icon={Building2}
          href="/companies?page=1&ownershipScope=MINE"
          canView={can("company:view")}
          empty="شرکتی تحت مالکیت شما نیست."
        >
          {data.recent.companies.map((company) => (
            <EntityLink
              key={company.id}
              to={can("company:view") ? `/companies/${company.id}` : undefined}
            >
              <CompanyAvatar company={company} />
              <div className="min-w-0 flex-1">
                <strong className="block truncate text-sm">
                  {companyName(company)}
                </strong>
                <p className="mt-1 text-xs text-[var(--app-text-secondary)]">
                  آخرین تغییر: {formatJalaliDateTime(company.updatedAt)}
                </p>
              </div>
            </EntityLink>
          ))}
        </EntitySection>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_.85fr]">
        <ContentSection
          title="ترکیب فعالیت‌های من"
          description="رویدادهای سیستمی محاسبه نمی‌شوند و فقط انواع فعال کتابخانه نمایش داده شده‌اند."
          icon={Activity}
          action={
            can("activity:view") ? (
              <SectionLink to={activityBase}>همه فعالیت‌ها</SectionLink>
            ) : undefined
          }
        >
          {data.activityBreakdown.length ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {data.activityBreakdown.map((item) => (
                <button
                  type="button"
                  key={item.code}
                  disabled={!can("activity:view")}
                  onClick={go(
                    `${activityBase}&activityType=${encodeURIComponent(item.code)}`,
                    "activity:view"
                  )}
                  className="flex items-center justify-between rounded-xl bg-[var(--app-background)] p-3 text-start transition enabled:hover:bg-[var(--app-primary-soft)]"
                >
                  <span className="text-xs font-semibold">{item.label}</span>
                  <span className="rounded-full bg-[var(--app-primary-soft)] px-2.5 py-1 text-xs font-bold text-[var(--app-primary)]">
                    {item.count.toLocaleString("fa-IR")}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Activity}
              title="نوع فعالیت فعالی تعریف نشده است"
            />
          )}
        </ContentSection>
        <ContentSection
          title="نتیجه فرصت‌های من"
          description="وضعیت و ارزش فرصت‌ها بر اساس مرحله فعلی"
          icon={BriefcaseBusiness}
        >
          <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
            <Outcome
              label="فعال"
              count={data.summary.opportunities.active}
              value={data.summary.opportunities.activeValue}
              tone="primary"
            />
            <Outcome
              label="موفق"
              count={data.summary.opportunities.won}
              value={data.summary.opportunities.wonValue}
              tone="success"
            />
            <Outcome
              label="از دست‌رفته"
              count={data.summary.opportunities.lost}
              value={data.summary.opportunities.lostValue}
              tone="error"
            />
          </div>
        </ContentSection>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <ContentSection
          title="اعلان‌های اخیر"
          description="آخرین اعلان‌های صادرشده برای شما"
          icon={Bell}
          action={
            can("notification:view") ? (
              <SectionLink to="/attention?tab=notifications">
                همه اعلان‌ها
              </SectionLink>
            ) : undefined
          }
        >
          {data.recent.notifications.length ? (
            <ContentList>
              {data.recent.notifications.map((notification) => {
                const path =
                  safeNotificationActionUrl(notification.actionUrl) ||
                  "/attention?tab=notifications"
                return (
                  <EntityLink
                    key={notification.id}
                    to={can("notification:view") ? path : undefined}
                    showArrow={false}
                  >
                    <div className="flex w-full items-start justify-between gap-3">
                      <div className="min-w-0">
                          <strong className="block truncate text-sm">
                            {notification.title}
                          </strong>
                          {notification.body ? (
                            <p className="mt-1 line-clamp-2 text-xs leading-5 text-[var(--app-text-secondary)]">
                              {notification.body}
                            </p>
                          ) : null}
                          <p className="mt-1 text-[11px] text-[var(--app-text-secondary)]">
                            {formatJalaliDateTime(notification.createdAt)}
                          </p>
                      </div>
                      <StatusBadge
                        tone={notification.readAt ? "neutral" : "primary"}
                      >
                        {notification.readAt ? "خوانده‌شده" : "جدید"}
                      </StatusBadge>
                    </div>
                  </EntityLink>
                )
              })}
            </ContentList>
          ) : (
            <EmptyState icon={Bell} title="اعلانی برای شما وجود ندارد" />
          )}
        </ContentSection>

        <ContentSection
          title="گفتگوهای اخیر"
          description="پیام‌ها و پرسش‌های مرتبط با رکوردهای شما"
          icon={MessageSquareText}
          action={
            can("activity:view") ? (
              <SectionLink to="/attention?tab=conversations">
                مرکز توجه
              </SectionLink>
            ) : undefined
          }
        >
          {data.recent.conversations.length ? (
            <ContentList>
              {data.recent.conversations.map((conversation) => (
                <EntityLink
                  key={conversation.id}
                  to={
                    can("activity:view")
                      ? conversation.actionUrl
                      : undefined
                  }
                  showArrow={false}
                >
                  <div className="flex w-full items-start justify-between gap-3">
                    <div className="min-w-0">
                        <strong className="block truncate text-sm">
                          {conversation.latestMessage?.author.fullName ||
                            "گفتگوی مرتبط"}
                        </strong>
                        <p className="mt-1 line-clamp-2 text-xs leading-5 text-[var(--app-text-secondary)]">
                          {conversation.latestMessage?.body ||
                            "پیامی ثبت نشده است."}
                        </p>
                        <p className="mt-1 text-[11px] text-[var(--app-text-secondary)]">
                          {formatJalaliDateTime(conversation.updatedAt)}
                        </p>
                    </div>
                    {conversation.unreadCount ? (
                      <StatusBadge tone="primary">
                        {conversation.unreadCount.toLocaleString("fa-IR")}{" "}
                        جدید
                      </StatusBadge>
                    ) : (
                      <StatusBadge tone="neutral">
                        {conversation.status === "RESOLVED"
                          ? "حل‌شده"
                          : "خوانده‌شده"}
                      </StatusBadge>
                    )}
                  </div>
                </EntityLink>
              ))}
            </ContentList>
          ) : (
            <EmptyState
              icon={MessageSquareText}
              title="گفتگویی برای شما وجود ندارد"
            />
          )}
        </ContentSection>
      </div>
    </div>
  )
}

function EntitySection({
  title,
  description,
  icon,
  href,
  canView,
  empty,
  children,
}: {
  title: string
  description: string
  icon: typeof ListChecks
  href: string
  canView: boolean
  empty: string
  children: ReactNode
}) {
  const hasChildren = Array.isArray(children)
    ? children.length > 0
    : Boolean(children)
  return (
    <ContentSection
      title={title}
      description={description}
      icon={icon}
      action={
        canView ? <SectionLink to={href}>مشاهده همه</SectionLink> : undefined
      }
    >
      {hasChildren ? (
        <ContentList>{children}</ContentList>
      ) : (
        <EmptyState icon={icon} title={empty} />
      )}
    </ContentSection>
  )
}

function EntityLink({
  to,
  children,
  showArrow = true,
}: {
  to?: string
  children: ReactNode
  showArrow?: boolean
}) {
  const content = (
    <ContentListItem className="flex items-center gap-3">
      <div className="flex min-w-0 flex-1 items-center gap-3">{children}</div>
      {to && showArrow ? (
        <ArrowLeft className="size-4 shrink-0 text-[var(--app-text-secondary)]" />
      ) : null}
    </ContentListItem>
  )

  return to ? <Link to={to}>{content}</Link> : content
}

function SectionLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link
      to={to}
      className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--app-primary)] hover:underline"
    >
      {children}
      <ArrowLeft className="size-3.5" />
    </Link>
  )
}

function CompanyAvatar({
  company,
}: {
  company?: WorkspaceCompanyIdentity | null
}) {
  const name = companyName(company)
  return (
    <IdentityAvatar
      name={name}
      mediaPath={company ? `/companies/${company.id}/logo` : null}
      hasMedia={Boolean(company?.logoObjectKey)}
      mediaVersion={company?.logoObjectKey}
      className="size-10 rounded-xl"
    />
  )
}

function Outcome({
  label,
  count,
  value,
  tone,
}: {
  label: string
  count: number
  value: number | null
  tone: StatusTone
}) {
  return (
    <div className="rounded-xl bg-[var(--app-background)] p-3">
      <div className="flex items-center justify-between gap-2">
        <StatusBadge tone={tone}>{label}</StatusBadge>
        <strong className="text-base">{count.toLocaleString("fa-IR")}</strong>
      </div>
      <p className="mt-2 text-xs text-[var(--app-text-secondary)]">
        {money(value)}
      </p>
    </div>
  )
}

function AccountDetails({ user }: { user: AuthUser | null }) {
  const items = [
    {
      label: profileText.account.fields.email,
      value: user?.email,
      icon: AtSign,
    },
    {
      label: profileText.cards.organizationRole,
      value: user?.roleName || user?.role,
      icon: ShieldCheck,
    },
    {
      label: profileText.cards.permissionCount,
      value: String(user?.permissions.length ?? 0),
      icon: KeyRound,
    },
    {
      label: profileText.cards.sessionStatus,
      value: profileText.cards.sessionActive,
      icon: CheckCircle2,
    },
  ]
  return (
    <ContentSection
      title={profileText.account.title}
      description="اطلاعات هویتی و سطح دسترسی فعال شما"
      icon={UserRound}
    >
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {items.map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="rounded-xl bg-[var(--app-background)] p-4"
          >
            <Icon className="size-5 text-[var(--app-primary)]" />
            <p className="mt-3 text-xs text-[var(--app-text-secondary)]">
              {label}
            </p>
            <p className="mt-1 truncate text-sm font-bold">
              {value || uiText.common.notAvailable}
            </p>
          </div>
        ))}
      </div>
    </ContentSection>
  )
}
