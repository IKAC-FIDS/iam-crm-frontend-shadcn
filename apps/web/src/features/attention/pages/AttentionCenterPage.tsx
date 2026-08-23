import {
  Bell,
  ClipboardCheck,
  MoreHorizontal,
  RotateCcw,
  Search,
} from "lucide-react"
import { useMemo, useState } from "react"
import {
  useNavigate,
  useSearchParams,
} from "react-router-dom"
import { toast } from "sonner"

import { PersianDateTimePicker } from "@/components/shared/PersianDateTimePicker"
import { getApiErrorMessage } from "@/lib/apiResponse"
import { useAuthStore } from "@/store/authStore"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { Input } from "@workspace/ui/components/input"

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
import type { Notification } from "@/features/notifications/types/notification.types"

export function AttentionCenterPage() {
  const [sp, setSp] = useSearchParams()
  const nav = useNavigate()
  const user = useAuthStore((state) => state.user)
  const permissions = user?.permissions ?? []

  const canFollow =
    permissions.includes("follow-up:view") ||
    permissions.includes("activity:view")
  const canNotifications =
    permissions.includes("notification:view")
  const canManageNotifications =
    permissions.includes("notification:manage")

  const tab =
    sp.get("tab") === "notifications" &&
    canNotifications
      ? "notifications"
      : canFollow
        ? "follow-ups"
        : "notifications"

  const followFilter = normalizeFilter(
    sp.get("quick")
  )
  const page = Math.max(
    1,
    Number(sp.get("page") || 1)
  )

  const followUps = useDueFollowUps(
    page,
    20,
    canFollow
  )
  const preview = useDueFollowUps(
    1,
    50,
    canFollow
  )
  const unread = useUnreadCount(canNotifications)

  const stats = useMemo(() => {
    const items = preview.data?.data ?? []

    return {
      overdue: items.filter(
        (item) =>
          dueStatus(item.nextActionDate) ===
          "overdue"
      ).length,
      today: items.filter(
        (item) =>
          dueStatus(item.nextActionDate) ===
          "today"
      ).length,
      unread: unread.data ?? 0,
    }
  }, [preview.data?.data, unread.data])

  function patch(
    values: Record<string, string | null>
  ) {
    const next = new URLSearchParams(sp)

    Object.entries(values).forEach(
      ([key, value]) => {
        if (value === null) next.delete(key)
        else next.set(key, value)
      }
    )

    setSp(next)
  }

  if (!canFollow && !canNotifications) {
    return (
      <div className="rounded-2xl border p-8 text-center">
        دسترسی مشاهده پیگیری‌ها یا اعلان‌ها فعال
        نیست.
      </div>
    )
  }

  return (
    <div className="grid gap-5" dir="rtl">
      <section className="relative overflow-hidden rounded-[30px] border border-[var(--app-divider)] bg-[var(--app-surface)] px-5 py-6 shadow-[var(--app-shadow-card)] sm:px-7">
        <div className="pointer-events-none absolute -end-20 -top-28 size-64 rounded-full bg-[var(--app-primary-soft)] blur-3xl" />

        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[var(--app-divider)] bg-[var(--app-background)]/70 px-3 py-1.5 text-[10px] font-bold text-[var(--app-primary)]">
              <Bell className="size-3.5" />
              مرکز توجه و پیگیری
            </div>

            <h1 className="text-2xl font-bold text-[var(--app-heading)] sm:text-3xl">
              مرکز پیگیری و اعلان‌ها
            </h1>

            <p className="mt-2 max-w-xl text-xs leading-6 text-[var(--app-text-secondary)]">
              مواردی که نیاز به توجه، پیگیری یا
              اقدام شما دارند در یک نمای متمرکز
              مدیریت می‌شوند.
            </p>
          </div>

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
                  patch({
                    tab: "follow-ups",
                    page: "1",
                  })
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
                  patch({
                    tab: "notifications",
                    page: "1",
                  })
                }
              >
                <Bell className="size-4" />
                اعلان‌ها
                {stats.unread > 0 ? (
                  <span className="rounded-full bg-[var(--destructive)] px-1.5 text-[9px] text-white">
                    {stats.unread.toLocaleString(
                      "fa-IR"
                    )}
                  </span>
                ) : null}
              </Button>
            ) : null}
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        {canFollow ? (
          <>
            <Kpi
              title="عقب‌افتاده"
              number={stats.overdue}
              active={
                tab === "follow-ups" &&
                followFilter === "OVERDUE"
              }
              onClick={() =>
                patch({
                  tab: "follow-ups",
                  quick: "OVERDUE",
                  page: "1",
                })
              }
            />
            <Kpi
              title="پیگیری امروز"
              number={stats.today}
              active={
                tab === "follow-ups" &&
                followFilter === "TODAY"
              }
              onClick={() =>
                patch({
                  tab: "follow-ups",
                  quick: "TODAY",
                  page: "1",
                })
              }
            />
          </>
        ) : null}

        {canNotifications ? (
          <Kpi
            title="اعلان خوانده‌نشده"
            number={stats.unread}
            active={tab === "notifications"}
            onClick={() =>
              patch({
                tab: "notifications",
                quick: null,
                page: "1",
              })
            }
          />
        ) : null}
      </section>

      {tab === "follow-ups" ? (
        <FollowUps
          items={followUps.data?.data ?? []}
          loading={followUps.isLoading}
          filter={followFilter}
          canComplete={permissions.includes(
            "follow-up:complete"
          )}
          canReschedule={permissions.includes(
            "follow-up:reschedule"
          )}
          onFilter={(value) =>
            patch({
              quick:
                value === "ALL"
                  ? null
                  : value,
              page: "1",
            })
          }
        />
      ) : (
        <Notifications
          canManage={canManageNotifications}
          nav={nav}
        />
      )}
    </div>
  )
}

function Kpi({
  title,
  number,
  active,
  onClick,
}: {
  title: string
  number: number
  active?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "rounded-[20px] border p-4 text-start transition",
        active
          ? "border-[var(--app-primary)] bg-[var(--app-primary-soft)]"
          : "border-[var(--app-divider)] bg-[var(--app-surface)] hover:border-[var(--app-primary)]/40",
      ].join(" ")}
    >
      <div className="text-xs text-[var(--app-text-secondary)]">
        {title}
      </div>
      <div className="mt-2 text-2xl font-bold text-[var(--app-heading)]">
        {number.toLocaleString("fa-IR")}
      </div>
    </button>
  )
}

function normalizeFilter(
  value: string | null
): FollowUpFilter {
  return value === "OVERDUE" ||
    value === "TODAY" ||
    value === "UPCOMING"
    ? value
    : "ALL"
}

function FollowUps({
  items,
  loading,
  filter,
  canComplete,
  canReschedule,
  onFilter,
}: {
  items: FollowUpActivity[]
  loading: boolean
  filter: FollowUpFilter
  canComplete: boolean
  canReschedule: boolean
  onFilter: (value: FollowUpFilter) => void
}) {
  const shown =
    filter === "ALL"
      ? items
      : items.filter(
          (item) =>
            dueStatus(
              item.nextActionDate
            ) === filter.toLowerCase()
        )

  return (
    <div className="grid gap-4">
      {/* Attention list UI placeholder: migrated to Tasks-style rows */}
      <section className="rounded-[24px] border border-[var(--app-divider)] bg-[var(--app-surface)] p-3 shadow-[var(--app-shadow-card)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-1.5">
            {(
              [
                "ALL",
                "OVERDUE",
                "TODAY",
                "UPCOMING",
              ] as FollowUpFilter[]
            ).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() =>
                  onFilter(value)
                }
                className={[
                  "h-9 rounded-lg px-3 text-[10px] font-bold transition",
                  filter === value
                    ? "bg-[var(--app-primary)] text-[var(--app-on-primary)] shadow-sm"
                    : "border border-[var(--app-divider)] bg-[var(--app-background)] text-[var(--app-text-secondary)] hover:text-[var(--app-primary)]",
                ].join(" ")}
              >
                {followUpFilterLabel(value)}
              </button>
            ))}
          </div>

          {filter !== "ALL" ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="rounded-xl text-[var(--app-text-secondary)]"
              onClick={() =>
                onFilter("ALL")
              }
            >
              <RotateCcw className="size-3.5" />
              پاک کردن فیلتر
            </Button>
          ) : null}
        </div>
      </section>

      {loading ? (
        <div className="rounded-[20px] border border-[var(--app-divider)] bg-[var(--app-surface)] p-8 text-center text-sm text-[var(--app-text-secondary)]">
          در حال دریافت...
        </div>
      ) : shown.length ? (
        shown.map((item) => (
          <FollowCard
            key={item.id}
            item={item}
            canComplete={canComplete}
            canReschedule={canReschedule}
          />
        ))
      ) : (
        <div className="rounded-[20px] border border-dashed border-[var(--app-divider)] bg-[var(--app-surface)] p-8 text-center text-sm text-[var(--app-text-secondary)]">
          موردی وجود ندارد.
        </div>
      )}
    </div>
  )
}

function followUpFilterLabel(
  value: FollowUpFilter
) {
  if (value === "OVERDUE") return "عقب‌افتاده"
  if (value === "TODAY") return "امروز"
  if (value === "UPCOMING") return "پیش‌رو"
  return "همه"
}

function FollowCard({
  item,
  canComplete,
  canReschedule,
}: {
  item: FollowUpActivity
  canComplete: boolean
  canReschedule: boolean
}) {
  const [mode, setMode] = useState<
    "complete" | "reschedule" | null
  >(null)
  const complete = useCompleteFollowUp()
  const reschedule = useRescheduleFollowUp()
  const [note, setNote] = useState("")
  const [outcome, setOutcome] = useState(
    item.outcome || ""
  )
  const [date, setDate] = useState<
    Date | undefined
  >(
    item.nextActionDate
      ? new Date(item.nextActionDate)
      : undefined
  )

  async function submit() {
    try {
      if (mode === "complete") {
        await complete.mutateAsync({
          id: item.id,
          outcome,
          note,
        })
      } else if (mode === "reschedule") {
        await reschedule.mutateAsync({
          id: item.id,
          nextActionDate:
            date?.toISOString() || "",
          note,
        })
      }

      toast.success(
        "پیگیری بروزرسانی شد."
      )
      setMode(null)
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error,
          "عملیات پیگیری انجام نشد."
        )
      )
    }
  }

  const status = dueStatus(
    item.nextActionDate
  )

  return (
    <>
      <article className="rounded-[20px] border border-[var(--app-divider)] bg-[var(--app-surface)] p-4 shadow-[var(--app-shadow-card)]">
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant={
              status === "overdue"
                ? "destructive"
                : "secondary"
            }
          >
            {dueLabel(status)}
          </Badge>

          <Badge variant="outline">
            {activityLabel(item.type)}
          </Badge>

          <b className="text-sm text-[var(--app-heading)]">
            {item.company?.legalName ||
              "شرکت"}
          </b>
        </div>

        <div className="mt-2 text-xs text-[var(--app-text-secondary)]">
          زمان پیگیری:{" "}
          {dt(item.nextActionDate)}
        </div>

        {item.notes ? (
          <p className="mt-3 text-sm leading-7 text-[var(--app-text-secondary)]">
            {item.notes}
          </p>
        ) : null}

        <div className="mt-4 flex flex-wrap gap-2">
          {canReschedule ? (
            <Button
              size="sm"
              variant="outline"
              className="rounded-xl"
              onClick={() =>
                setMode("reschedule")
              }
            >
              زمان‌بندی مجدد
            </Button>
          ) : null}

          {canComplete ? (
            <Button
              size="sm"
              className="rounded-xl"
              onClick={() =>
                setMode("complete")
              }
            >
              انجام شد
            </Button>
          ) : null}
        </div>
      </article>

      <Dialog
        open={Boolean(mode)}
        onOpenChange={(open) => {
          if (!open) setMode(null)
        }}
      >
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>
              {mode === "complete"
                ? "تکمیل پیگیری"
                : "زمان‌بندی مجدد"}
            </DialogTitle>
          </DialogHeader>

          {mode === "complete" ? (
            <textarea
              className="w-full rounded-xl border p-3"
              rows={4}
              value={outcome}
              onChange={(event) =>
                setOutcome(
                  event.target.value
                )
              }
            />
          ) : (
            <PersianDateTimePicker
              value={date}
              onChange={setDate}
            />
          )}

          <textarea
            className="w-full rounded-xl border p-3"
            rows={3}
            value={note}
            onChange={(event) =>
              setNote(event.target.value)
            }
            placeholder="یادداشت"
          />

          <Button
            onClick={() => void submit()}
            disabled={
              complete.isPending ||
              reschedule.isPending
            }
          >
            ذخیره
          </Button>
        </DialogContent>
      </Dialog>
    </>
  )
}

function Notifications({
  canManage,
  nav,
}: {
  canManage: boolean
  nav: (path: string) => void
}) {
  const [search, setSearch] = useState("")
  const [quick, setQuick] = useState<
    "all" | "unread" | "important" | "archived"
  >("all")

  const query = useNotifications({
    page: 1,
    limit: 20,
    search: search || undefined,
    status:
      quick === "unread"
        ? "unread"
        : "all",
    priority:
      quick === "important"
        ? "HIGH"
        : undefined,
    archivedOnly:
      quick === "archived"
        ? true
        : undefined,
  })

  const readAll = useReadAll()

  function clearFilters() {
    setSearch("")
    setQuick("all")
  }

  return (
    <div className="grid gap-4">
      {/* Attention list UI placeholder: migrated to Tasks-style rows */}
      <section className="rounded-[24px] border border-[var(--app-divider)] bg-[var(--app-surface)] p-3 shadow-[var(--app-shadow-card)]">
        <div className="grid gap-3 lg:grid-cols-[minmax(240px,1fr)_auto_auto] lg:items-center">
          <div className="relative min-w-0">
            <Search className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-[var(--app-icon-muted)]" />
            <Input
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="جستجو در اعلان‌ها..."
              className="h-11 rounded-xl pe-9"
            />
          </div>

          <div className="flex flex-wrap rounded-xl border border-[var(--app-divider)] bg-[var(--app-background)] p-1">
            {(
              [
                "all",
                "unread",
                "important",
                "archived",
              ] as const
            ).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() =>
                  setQuick(value)
                }
                className={[
                  "rounded-lg px-3 py-2 text-[10px] font-bold transition",
                  quick === value
                    ? "bg-[var(--app-primary)] text-[var(--app-on-primary)] shadow-sm"
                    : "text-[var(--app-text-secondary)] hover:text-[var(--app-primary)]",
                ].join(" ")}
              >
                {notificationFilterLabel(
                  value
                )}
              </button>
            ))}
          </div>

          {canManage ? (
            <Button
              type="button"
              variant="outline"
              className="h-11 rounded-xl"
              onClick={() =>
                void readAll.mutateAsync()
              }
            >
              خواندن همه
            </Button>
          ) : null}
        </div>

        {(search || quick !== "all") ? (
          <div className="mt-3 flex justify-end border-t border-[var(--app-divider)] pt-3">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="rounded-xl text-[var(--app-text-secondary)]"
              onClick={clearFilters}
            >
              <RotateCcw className="size-3.5" />
              پاک کردن فیلترها
            </Button>
          </div>
        ) : null}
      </section>

      {query.data?.data.length ? (
        query.data.data.map(
          (notification) => (
            <NotificationItem
              key={notification.id}
              notification={
                notification
              }
              canManage={canManage}
              nav={nav}
            />
          )
        )
      ) : (
        <div className="rounded-[20px] border border-dashed border-[var(--app-divider)] bg-[var(--app-surface)] p-8 text-center text-sm text-[var(--app-text-secondary)]">
          اعلانی وجود ندارد.
        </div>
      )}
    </div>
  )
}

function notificationFilterLabel(
  value:
    | "all"
    | "unread"
    | "important"
    | "archived"
) {
  if (value === "unread")
    return "خوانده‌نشده"
  if (value === "important") return "مهم"
  if (value === "archived") return "بایگانی"
  return "همه"
}

function NotificationItem({
  notification,
  canManage,
  nav,
}: {
  notification: Notification
  canManage: boolean
  nav: (path: string) => void
}) {
  const markRead = useMarkRead()
  const markUnread = useMarkUnread()
  const archive = useArchive()
  const unarchive = useUnarchive()
  const remove = useDeleteNotification()

  async function open() {
    if (
      canManage &&
      !notification.readAt
    ) {
      await markRead.mutateAsync(
        notification.id
      )
    }

    if (
      notification.actionUrl?.startsWith(
        "/"
      ) &&
      !notification.actionUrl.startsWith(
        "//"
      )
    ) {
      nav(notification.actionUrl)
    }
  }

  return (
    <article
      className={[
        "rounded-[20px] border border-[var(--app-divider)] p-4 shadow-[var(--app-shadow-card)]",
        !notification.readAt
          ? "bg-[var(--app-primary-soft)]/40"
          : "bg-[var(--app-surface)]",
      ].join(" ")}
    >
      <div className="flex justify-between gap-3">
        <div>
          <b className="text-sm text-[var(--app-heading)]">
            {notification.title}
          </b>

          {notification.body ? (
            <p className="mt-1 text-sm leading-6 text-[var(--app-text-secondary)]">
              {notification.body}
            </p>
          ) : null}
        </div>

        <span className="shrink-0 text-xs text-[var(--app-text-secondary)]">
          {dt(notification.createdAt)}
        </span>
      </div>

      <div className="mt-3 flex gap-2">
        {notification.actionUrl ? (
          <Button
            size="sm"
            variant="outline"
            className="rounded-xl"
            onClick={() => void open()}
          >
            مشاهده
          </Button>
        ) : null}

        {canManage ? (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  size="sm"
                  variant="ghost"
                  className="rounded-xl"
                />
              }
            >
              <MoreHorizontal className="size-4" />
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              dir="rtl"
            >
              <DropdownMenuItem
                onClick={() =>
                  void (!notification.readAt
                    ? markRead.mutateAsync(
                        notification.id
                      )
                    : markUnread.mutateAsync(
                        notification.id
                      ))
                }
              >
                {!notification.readAt
                  ? "خوانده شد"
                  : "خوانده‌نشده"}
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() =>
                  void (notification.archivedAt
                    ? unarchive.mutateAsync(
                        notification.id
                      )
                    : archive.mutateAsync(
                        notification.id
                      ))
                }
              >
                {notification.archivedAt
                  ? "خروج از بایگانی"
                  : "بایگانی"}
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={() => {
                  if (
                    window.confirm(
                      "حذف شود؟"
                    )
                  ) {
                    void remove.mutateAsync(
                      notification.id
                    )
                  }
                }}
              >
                حذف
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}
      </div>
    </article>
  )
}

