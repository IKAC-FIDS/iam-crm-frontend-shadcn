import {
  EntityCard,
  type EntityBadgeDescriptor,
  type EntityMetadataDescriptor,
} from "@/components/shared/EntityCard"
import type { EntityAction } from "@/components/shared/EntityRowActions"
import { IdentityAvatar } from "@/components/shared/IdentityAvatar"
import { safeNotificationActionUrl, notificationInboxState } from "@/features/notifications/utils/notificationDisplay"
import { Eye, Archive, Trash2, CalendarClock, Building2, UserRound } from "lucide-react"
import { PageHero } from "@/components/shared/PageHero"
import { EntityListPage } from "@/components/shared/EntityListPage"
import { MetricCard } from "@/components/shared/MetricCard"
import { useListQueryState, enumParam } from "@/lib/listQuery"
import { useDebouncedValue } from "@/lib/useDebouncedValue"
import { QueryContent } from "@/components/shared/QueryContent"
import { DataTableToolbar } from "@/components/shared/DataTableToolbar"
import { AlertTriangle, Bell, CheckCircle2, ClipboardCheck } from "lucide-react"
import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { EmptyState } from "@/components/shared/EmptyState"
import { ErrorState } from "@/components/shared/ErrorState"
import { PaginationControls } from "@/components/shared/PaginationControls"
import { PersianDateTimePicker } from "@/components/shared/PersianDateTimePicker"
import type { StatusTone } from "@/components/shared/StatusBadge"
import { getApiErrorMessage } from "@/lib/apiResponse"
import { useAuthStore } from "@/store/authStore"
import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"

import {
  useCompleteFollowUp,
  useDueFollowUps,
  useRescheduleFollowUp,
} from "@/features/followUps/hooks/useFollowUps"
import type {
  FollowUpActivity,
  FollowUpFilter,
} from "@/features/followUps/types/followUp.types"
import {
  activityLabel,
  dt,
  dueLabel,
  dueStatus,
} from "@/features/followUps/utils/followUpDisplay"
import {
  useArchive,
  useDeleteNotification,
  useMarkRead,
  useMarkUnread,
  useNotifications,
  useReadAll,
  useUnarchive,
  useUnreadCount,
} from "@/features/notifications/hooks/useNotifications"
import type {
  Notification,
  NotificationPriority,
} from "@/features/notifications/types/notification.types"

type NotificationQuick = "all" | "unread" | "important" | "archived"

export function AttentionCenterPage() {
  const { params, page, pageSize, patch: patchList } = useListQueryState()
  const navigate = useNavigate()
  const permissions = useAuthStore((state) => state.user?.permissions ?? [])

  const canFollow =
    permissions.includes("follow-up:view") ||
    permissions.includes("activity:view")
  const canNotifications = permissions.includes("notification:view")
  const canManageNotifications = permissions.includes("notification:manage")
  const canComplete = permissions.includes("follow-up:complete")
  const canReschedule = permissions.includes("follow-up:reschedule")

  const tab =
    params.get("tab") === "notifications" && canNotifications
      ? "notifications"
      : canFollow
        ? "follow-ups"
        : "notifications"
  const quick = normalizeFollowFilter(params.get("quick"))

  const followUps = useDueFollowUps(page, pageSize, canFollow)
  const preview = useDueFollowUps(1, 50, canFollow)
  const unread = useUnreadCount(canNotifications)
  const readAll = useReadAll()

  const stats = useMemo(() => {
    const items = preview.data?.data ?? []
    return {
      overdue: items.filter(
        (item) => dueStatus(item.nextActionDate) === "overdue"
      ).length,
      today: items.filter((item) => dueStatus(item.nextActionDate) === "today")
        .length,
      unread: unread.data ?? 0,
    }
  }, [preview.data?.data, unread.data])

  function patch(values: Record<string, string | null>) {
    patchList(
      Object.fromEntries(
        Object.entries(values).map(([key, value]) => [key, value ?? undefined])
      ),
      { resetPage: false }
    )
  }

  if (!canFollow && !canNotifications) {
    return (
      <ErrorState
        title="دسترسی محدود"
        description="دسترسی مشاهده پیگیری‌ها یا اعلان‌ها برای شما فعال نیست."
      />
    )
  }

  return (
    <EntityListPage className="min-h-0 grid-rows-[auto_auto_auto] overflow-visible lg:h-full lg:grid-rows-[auto_auto_minmax(0,1fr)] lg:overflow-hidden">
      <PageHero
        title="مرکز پیگیری و اعلان‌ها"
        eyebrow="مرکز توجه و پیگیری"
        icon={Bell}
        description="موارد نیازمند اقدام، پیگیری و اعلان‌های مهم را در یک نمای متمرکز مدیریت کنید."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {canManageNotifications ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => void readAll.mutateAsync()}
                disabled={readAll.isPending || stats.unread === 0}
              >
                <CheckCircle2 className="size-4" />
                خواندن همه
              </Button>
            ) : null}
            <div className="flex rounded-xl border border-[var(--app-divider)] bg-[var(--app-background)] p-1">
              {canFollow ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className={
                    tab === "follow-ups"
                      ? "rounded-lg bg-[var(--app-surface)] text-[var(--app-primary)] shadow-sm"
                      : "rounded-lg"
                  }
                  onClick={() =>
                    patch({ tab: "follow-ups", page: "1", quick: null })
                  }
                >
                  <ClipboardCheck className="size-4" />
                  پیگیری‌ها
                </Button>
              ) : null}
              {canNotifications ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className={
                    tab === "notifications"
                      ? "rounded-lg bg-[var(--app-surface)] text-[var(--app-primary)] shadow-sm"
                      : "rounded-lg"
                  }
                  onClick={() =>
                    patch({ tab: "notifications", page: "1", quick: null })
                  }
                >
                  <Bell className="size-4" />
                  اعلان‌ها
                  {stats.unread > 0 ? (
                    <span className="rounded-full bg-[var(--destructive)] px-1.5 text-xs text-white">
                      {stats.unread.toLocaleString("fa-IR")}
                    </span>
                  ) : null}
                </Button>
              ) : null}
            </div>
          </div>
        }
      />

      <section className="grid gap-3 sm:grid-cols-3">
        {canFollow ? (
          <>
            <MetricCard
              label="عقب‌افتاده"
              value={stats.overdue.toLocaleString("fa-IR")}
              icon={AlertTriangle}
              active={tab === "follow-ups" && quick === "OVERDUE"}
              onClick={() =>
                patch({ tab: "follow-ups", quick: "OVERDUE", page: "1" })
              }
            />
            <MetricCard
              label="پیگیری امروز"
              value={stats.today.toLocaleString("fa-IR")}
              icon={ClipboardCheck}
              active={tab === "follow-ups" && quick === "TODAY"}
              onClick={() =>
                patch({ tab: "follow-ups", quick: "TODAY", page: "1" })
              }
            />
          </>
        ) : null}
        {canNotifications ? (
          <MetricCard
            label="اعلان خوانده‌نشده"
            value={stats.unread.toLocaleString("fa-IR")}
            icon={Bell}
            active={tab === "notifications"}
            onClick={() =>
              patch({ tab: "notifications", quick: null, page: "1" })
            }
          />
        ) : null}
      </section>

      {tab === "follow-ups" ? (
        <FollowUpList
          items={followUps.data?.data ?? []}
          loading={followUps.isLoading}
          error={followUps.error}
          isError={followUps.isError}
          fetching={followUps.isFetching}
          page={followUps.data?.meta.page ?? page}
          pageCount={followUps.data?.meta.totalPages ?? 1}
          pageSize={pageSize}
          total={followUps.data?.meta.total}
          filter={quick}
          canComplete={canComplete}
          canReschedule={canReschedule}
          onRetry={() => void followUps.refetch()}
          onPage={(next) => patch({ page: String(next) })}
          onPageSize={(value) => patch({ limit: String(value), page: "1" })}
          onFilter={(value) =>
            patch({ quick: value === "ALL" ? null : value, page: "1" })
          }
          onCompany={(id) => navigate(`/companies/${id}`)}
        />
      ) : (
        <NotificationList
          canManage={canManageNotifications}
          navigate={navigate}
        />
      )}
    </EntityListPage>
  )
}

function normalizeFollowFilter(value: string | null): FollowUpFilter {
  return value === "OVERDUE" || value === "TODAY" || value === "UPCOMING"
    ? value
    : "ALL"
}

function FollowUpList({
  items,
  loading,
  error,
  isError,
  fetching,
  page,
  pageCount,
  pageSize,
  total,
  filter,
  canComplete,
  canReschedule,
  onRetry,
  onPage,
  onPageSize,
  onFilter,
  onCompany,
}: {
  items: FollowUpActivity[]
  loading: boolean
  error: unknown
  isError: boolean
  fetching: boolean
  page: number
  pageCount: number
  pageSize: number
  total?: number
  filter: FollowUpFilter
  canComplete: boolean
  canReschedule: boolean
  onRetry: () => void
  onPage: (page: number) => void
  onPageSize: (value: number) => void
  onFilter: (value: FollowUpFilter) => void
  onCompany: (id: string) => void
}) {
  const [selected, setSelected] = useState<FollowUpActivity | null>(null)
  const [mode, setMode] = useState<"complete" | "reschedule" | null>(null)
  const shown =
    filter === "ALL"
      ? items
      : items.filter(
          (item) => dueStatus(item.nextActionDate) === filter.toLowerCase()
        )

  return (
    <div className="flex min-w-0 flex-col gap-3 lg:min-h-0 lg:overflow-hidden">
      <DataTableToolbar
        hasActiveFilters={filter !== "ALL"}
        onClearFilters={() => onFilter("ALL")}
        filters={
          <div className="flex min-w-0 flex-wrap gap-1.5">
            {(["ALL", "OVERDUE", "TODAY", "UPCOMING"] as FollowUpFilter[]).map(
              (value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => onFilter(value)}
                  className={[
                    "inline-flex h-8 items-center rounded-lg px-3 text-xs font-bold transition",
                    filter === value
                      ? "bg-[var(--app-primary)] text-[var(--app-on-primary)] shadow-sm"
                      : "border border-[var(--app-divider)] bg-[var(--app-background)] text-[var(--app-text-secondary)] hover:text-[var(--app-primary)]",
                  ].join(" ")}
                >
                  {followUpFilterLabel(value)}
                </button>
              )
            )}
          </div>
        }
      />
      <QueryContent
        query={{ isLoading: loading, isError, error, refetch: onRetry }}
        errorTitle="دریافت پیگیری‌ها ناموفق بود"
      >
        <div className="flex flex-col gap-3 lg:min-h-0 lg:flex-1 lg:overflow-hidden">
          {shown.length ? (
            <div className="rounded-[var(--app-radius-card)] border border-[var(--app-divider)] bg-[var(--app-surface)]/55 p-2 shadow-[var(--app-shadow-card)] lg:min-h-0 lg:flex-1 lg:overflow-hidden">
              <div className="ui-contained-scroll overflow-visible ps-2 pe-1 py-1 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--app-primary)] lg:h-full lg:overflow-y-auto lg:overscroll-contain" aria-label="فهرست پیگیری‌ها" tabIndex={0}>
                <div className="grid gap-2.5">
                  {shown.map((item) => (
                    <FollowUpEntityCard
                      key={item.id}
                      item={item}
                      canComplete={canComplete}
                      canReschedule={canReschedule}
                      onCompany={() => onCompany(item.companyId)}
                      onReschedule={() => { setSelected(item); setMode("reschedule") }}
                      onComplete={() => { setSelected(item); setMode("complete") }}
                    />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <EmptyState
              icon={ClipboardCheck}
              title="پیگیری‌ای وجود ندارد"
              description="در این فیلتر موردی برای نمایش وجود ندارد."
            />
          )}
          <div className="shrink-0">
            <PaginationControls page={page} pageCount={pageCount} pageSize={pageSize} total={total} disabled={fetching} onPageChange={onPage} onPageSizeChange={onPageSize} />
          </div>
        </div>
      </QueryContent>
      <FollowUpActionDialog
        item={selected}
        mode={mode}
        onClose={() => {
          setSelected(null)
          setMode(null)
        }}
      />
    </div>
  )
}

function FollowUpActionDialog({
  item,
  mode,
  onClose,
}: {
  item: FollowUpActivity | null
  mode: "complete" | "reschedule" | null
  onClose: () => void
}) {
  const complete = useCompleteFollowUp(),
    reschedule = useRescheduleFollowUp()
  const [note, setNote] = useState(""),
    [outcome, setOutcome] = useState(""),
    [date, setDate] = useState<Date | undefined>()
  const open = Boolean(item && mode)
  async function submit() {
    if (!item || !mode) return
    try {
      if (mode === "complete")
        await complete.mutateAsync({
          id: item.id,
          outcome: outcome || item.outcome || "",
          note,
        })
      else
        await reschedule.mutateAsync({
          id: item.id,
          nextActionDate: date?.toISOString() || item.nextActionDate || "",
          note,
        })
      toast.success("پیگیری بروزرسانی شد.")
      setNote("")
      setOutcome("")
      setDate(undefined)
      onClose()
    } catch (error) {
      toast.error(getApiErrorMessage(error, "عملیات پیگیری انجام نشد."))
    }
  }
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose()
      }}
    >
      <DialogContent dir="rtl">
        <DialogHeader>
          <DialogTitle>
            {mode === "complete" ? "تکمیل پیگیری" : "زمان‌بندی مجدد"}
          </DialogTitle>
        </DialogHeader>
        {mode === "complete" ? (
          <textarea
            className="w-full rounded-xl border border-input bg-transparent p-3 text-sm outline-none"
            rows={4}
            value={outcome}
            onChange={(e) => setOutcome(e.target.value)}
            placeholder={item?.outcome || "نتیجه پیگیری"}
          />
        ) : (
          <PersianDateTimePicker
            value={
              date ??
              (item?.nextActionDate ? new Date(item.nextActionDate) : undefined)
            }
            onChange={setDate}
          />
        )}
        <textarea
          className="w-full rounded-xl border border-input bg-transparent p-3 text-sm outline-none"
          rows={3}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="یادداشت"
        />
        <Button
          type="button"
          className="rounded-xl"
          onClick={() => void submit()}
          disabled={complete.isPending || reschedule.isPending}
        >
          {mode === "complete" ? <CheckCircle2 className="size-4" /> : null}
          ذخیره
        </Button>
      </DialogContent>
    </Dialog>
  )
}

function FollowUpEntityCard({
  item,
  canComplete,
  canReschedule,
  onCompany,
  onReschedule,
  onComplete,
}: {
  item: FollowUpActivity
  canComplete: boolean
  canReschedule: boolean
  onCompany: () => void
  onReschedule: () => void
  onComplete: () => void
}) {
  const companyName = item.company?.brandName || item.company?.legalName || "شرکت ثبت نشده"
  const ownerName = item.user?.fullName || item.user?.email || "—"
  const status = dueStatus(item.nextActionDate)
  const badges: EntityBadgeDescriptor[] = [
    { id: "due", label: dueLabel(status), tone: followUpTone(status) },
    { id: "type", label: activityLabel(item.type), tone: "primary", dot: false },
  ]
  const metadata: EntityMetadataDescriptor[] = [
    { id: "person", label: "شخص مرتبط", value: item.person?.fullName || "—", icon: UserRound },
    { id: "due", label: "موعد پیگیری", value: dt(item.nextActionDate), icon: CalendarClock },
  ]
  const actions: EntityAction[] = [
    { id: "view", label: "مشاهده شرکت", accessibleLabel: `مشاهده شرکت ${companyName}`, icon: Eye, onClick: onCompany, visible: Boolean(item.companyId) },
    { id: "reschedule", label: "زمان‌بندی مجدد", icon: CalendarClock, onClick: onReschedule, visible: canReschedule },
    { id: "complete", label: "انجام شد", icon: CheckCircle2, onClick: onComplete, visible: canComplete },
  ]
  const accentColor = status === "overdue"
    ? "var(--destructive)"
    : status === "today"
      ? "var(--warning)"
      : status === "upcoming"
        ? "var(--info)"
        : "var(--app-text-secondary)"

  return (
    <EntityCard
      id={item.id}
      title={item.outcome || activityLabel(item.type)}
      subtitle={item.notes || companyName}
      ariaLabel={`پیگیری: ${item.outcome || activityLabel(item.type)}`}
      accentColor={accentColor}
      onClick={item.companyId ? onCompany : undefined}
      logo={(
        <IdentityAvatar
          name={companyName}
          mediaPath={item.companyId ? `/companies/${item.companyId}/logo` : null}
          hasMedia={Boolean(item.company?.logoObjectKey)}
          mediaVersion={item.company?.logoObjectKey}
          fallbackIcon={<Building2 className="size-5" />}
          className="size-14 rounded-2xl text-lg"
          imageClassName="bg-white object-contain p-1"
        />
      )}
      badges={badges}
      owner={item.user ? {
        name: ownerName,
        role: "ثبت‌کننده",
        avatar: <IdentityAvatar name={ownerName} mediaPath={`/users/${item.user.id}/avatar`} hasMedia={Boolean(item.user.avatarObjectKey)} mediaVersion={item.user.avatarObjectKey} className="size-10 rounded-full text-xs" />,
      } : null}
      ownerFallback="ثبت‌کننده نامشخص"
      metadata={metadata}
      actions={actions}
      actionLabel="عملیات پیگیری"
    />
  )
}

function followUpTone(status: ReturnType<typeof dueStatus>): StatusTone {
  if (status === "overdue") return "error"
  if (status === "today") return "warning"
  return "info"
}
function followUpFilterLabel(value: FollowUpFilter) {
  if (value === "OVERDUE") return "عقب‌افتاده"
  if (value === "TODAY") return "امروز"
  if (value === "UPCOMING") return "پیش‌رو"
  return "همه"
}

function NotificationList({
  canManage,
  navigate,
}: {
  canManage: boolean
  navigate: (path: string) => void
}) {
  const { params, page, pageSize, patch, setPage, setPageSize } =
    useListQueryState()
  const search = params.get("notificationSearch") || ""
  const quick = enumParam(
    params.get("notificationQuick"),
    ["all", "unread", "important", "archived"],
    "all"
  )
  const setSearch = (value: string) =>
    patch({ notificationSearch: value }, { replace: true })
  const setQuick = (value: NotificationQuick) =>
    patch({ notificationQuick: value })
  const debouncedSearch = useDebouncedValue(search, 300)
  const query = useNotifications(
    {
      page,
      limit: pageSize,
      search: debouncedSearch.trim() || undefined,
      status: quick === "unread" ? "unread" : "all",
      priority: quick === "important" ? "HIGH" : undefined,
      archivedOnly: quick === "archived" ? true : undefined,
    },
    search === debouncedSearch
  )
  const markRead = useMarkRead(),
    markUnread = useMarkUnread(),
    archive = useArchive(),
    unarchive = useUnarchive(),
    remove = useDeleteNotification()

  async function openNotification(notification: Notification) {
    try {
      if (canManage && !notification.readAt) await markRead.mutateAsync(notification.id)
      const actionUrl = safeNotificationActionUrl(notification.actionUrl)
      if (actionUrl) navigate(actionUrl)
      else setDetail(notification)
    } catch (error) { toast.error(getApiErrorMessage(error, "باز کردن اعلان ناموفق بود")) }
  }

  const [detail, setDetail] = useState<Notification | null>(null)

  return (
    <div className="flex min-w-0 flex-col gap-3 lg:min-h-0 lg:overflow-hidden">
      <Dialog open={Boolean(detail)} onOpenChange={(open) => { if (!open) setDetail(null) }}>
        <DialogContent className="max-h-[85dvh] overflow-y-auto" dir="rtl">
          <DialogHeader><DialogTitle>{detail?.title}</DialogTitle></DialogHeader>
          <p className="whitespace-pre-wrap break-words text-sm leading-7">{detail?.body || "این اعلان متن بیشتری ندارد."}</p>
        </DialogContent>
      </Dialog>
      <DataTableToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="جستجو در اعلان‌ها..."
        hasActiveFilters={Boolean(search || quick !== "all")}
        onClearFilters={() =>
          patch({ notificationSearch: undefined, notificationQuick: undefined })
        }
        filters={
          <div className="flex flex-wrap gap-1">
            {(
              ["all", "unread", "important", "archived"] as NotificationQuick[]
            ).map((value) => (
              <Button
                key={value}
                type="button"
                size="sm"
                variant={quick === value ? "default" : "outline"}
                aria-pressed={quick === value}
                onClick={() => setQuick(value)}
              >
                {notificationFilterLabel(value)}
              </Button>
            ))}
          </div>
        }
      />

      <QueryContent query={query} errorTitle="دریافت اعلان‌ها ناموفق بود">
        <div className="flex flex-col gap-3 lg:min-h-0 lg:flex-1 lg:overflow-hidden">
          {(query.data?.data ?? []).length ? (
            <div className="rounded-[var(--app-radius-card)] border border-[var(--app-divider)] bg-[var(--app-surface)]/55 p-2 shadow-[var(--app-shadow-card)] lg:min-h-0 lg:flex-1 lg:overflow-hidden">
              <div className="ui-contained-scroll overflow-visible ps-2 pe-1 py-1 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--app-primary)] lg:h-full lg:overflow-y-auto lg:overscroll-contain" aria-label="فهرست اعلان‌ها" tabIndex={0}>
                <div className="grid gap-2.5">
                  {(query.data?.data ?? []).map((notification) => (
                    <NotificationEntityCard
                      key={notification.id}
                      notification={notification}
                      canManage={canManage}
                      onView={() => void openNotification(notification)}
                      onToggleRead={() => notification.readAt ? markUnread.mutateAsync(notification.id) : markRead.mutateAsync(notification.id)}
                      onToggleArchive={() => notification.archivedAt ? unarchive.mutateAsync(notification.id) : archive.mutateAsync(notification.id)}
                      onDelete={() => remove.mutateAsync(notification.id)}
                    />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <EmptyState
              icon={Bell}
              title="اعلانی وجود ندارد"
              description="در این فیلتر اعلانی برای نمایش وجود ندارد."
            />
          )}
          <div className="shrink-0">
            <PaginationControls page={query.data?.meta.page ?? page} pageCount={query.data?.meta.totalPages ?? 1} pageSize={pageSize} total={query.data?.meta.total} disabled={query.isFetching} onPageChange={setPage} onPageSizeChange={setPageSize} />
          </div>
        </div>
      </QueryContent>
    </div>
  )
}

function NotificationEntityCard({
  notification,
  canManage,
  onView,
  onToggleRead,
  onToggleArchive,
  onDelete,
}: {
  notification: Notification
  canManage: boolean
  onView: () => void
  onToggleRead: () => Promise<unknown>
  onToggleArchive: () => Promise<unknown>
  onDelete: () => Promise<unknown>
}) {
  const actorName = notification.actor?.fullName || notification.actor?.email || "سیستم"
  const unread = !notification.readAt && !notification.archivedAt
  const badges: EntityBadgeDescriptor[] = [
    {
      id: "inbox-state",
      label: notificationInboxState(notification),
      tone: unread ? "primary" : "neutral",
    },
    {
      id: "priority",
      label: notificationPriorityLabel(notification.priority),
      tone: notificationPriorityTone(notification.priority),
      dot: false,
    },
  ]
  const metadata: EntityMetadataDescriptor[] = [
    { id: "type", label: "نوع اعلان", value: notificationTypeLabel(notification.type), icon: Bell },
    { id: "created-at", label: "تاریخ اعلان", value: dt(notification.createdAt), icon: CalendarClock },
  ]
  const actions: EntityAction[] = [
    { id: "view", label: "مشاهده", accessibleLabel: "مشاهده", icon: Eye, onClick: onView },
    {
      id: "read",
      label: notification.readAt ? "علامت‌گذاری به‌عنوان خوانده‌نشده" : "علامت‌گذاری به‌عنوان خوانده‌شده",
      icon: CheckCircle2,
      onClick: onToggleRead,
      visible: canManage,
    },
    {
      id: "archive",
      label: notification.archivedAt ? "خروج از بایگانی" : "بایگانی",
      icon: Archive,
      onClick: onToggleArchive,
      visible: canManage,
    },
    {
      id: "delete",
      label: "حذف",
      icon: Trash2,
      onClick: onDelete,
      visible: canManage,
      variant: "danger",
      confirmation: { title: "حذف اعلان", description: "این اعلان حذف شود؟" },
    },
  ]
  const accentColor = notification.archivedAt
    ? "var(--app-text-secondary)"
    : notification.priority === "URGENT"
      ? "var(--destructive)"
      : notification.priority === "HIGH"
        ? "var(--warning)"
        : unread
          ? "var(--app-primary)"
          : "var(--info)"

  return (
    <EntityCard
      id={notification.id}
      title={notification.title}
      subtitle={notification.body}
      ariaLabel={`اعلان: ${notification.title}`}
      accentColor={accentColor}
      archived={Boolean(notification.archivedAt)}
      onClick={onView}
      fallback={<Bell className="size-5" />}
      badges={badges}
      owner={notification.actor ? {
        name: actorName,
        role: "ایجادکننده اعلان",
        avatar: <IdentityAvatar name={actorName} mediaPath={`/users/${notification.actor.id}/avatar`} hasMedia={Boolean(notification.actor.avatarObjectKey)} mediaVersion={notification.actor.avatarObjectKey} className="size-10 rounded-full text-xs" />,
      } : { name: "سیستم", role: "اعلان سیستمی", fallback: <Bell className="size-4" /> }}
      metadata={metadata}
      actions={actions}
      actionLabel="عملیات اعلان"
    />
  )
}

function notificationFilterLabel(value: NotificationQuick) {
  if (value === "unread") return "خوانده‌نشده"
  if (value === "important") return "مهم"
  if (value === "archived") return "بایگانی"
  return "همه"
}
function notificationPriorityLabel(priority: NotificationPriority) {
  if (priority === "URGENT") return "فوری"
  if (priority === "HIGH") return "بالا"
  if (priority === "LOW") return "پایین"
  return "عادی"
}
function notificationPriorityTone(priority: NotificationPriority): StatusTone {
  if (priority === "URGENT") return "error"
  if (priority === "HIGH") return "warning"
  if (priority === "LOW") return "neutral"
  return "info"
}
function notificationTypeLabel(type: Notification["type"]) {
  const labels: Partial<Record<Notification["type"], string>> = {
    SYSTEM: "سیستمی",
    TASK_CREATED: "ایجاد کار",
    TASK_ASSIGNED: "تخصیص کار",
    TASK_STATUS_CHANGED: "تغییر وضعیت کار",
    TASK_COMPLETED: "تکمیل کار",
    TASK_RESCHEDULED: "زمان‌بندی مجدد کار",
    OPPORTUNITY_UPDATED: "بروزرسانی فرصت",
    COMMERCIAL_DOCUMENT_UPDATED: "بروزرسانی سند تجاری",
    PAYMENT_UPDATED: "بروزرسانی پرداخت",
    ATTACHMENT_UPLOADED: "بارگذاری پیوست",
    MEETING_REMINDER: "یادآوری جلسه",
  }
  return labels[type] || type
}
