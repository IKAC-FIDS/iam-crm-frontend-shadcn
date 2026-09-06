import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useSearchParams, Link } from "react-router-dom"
import {
  BellRing,
  FileText,
  History,
  Mail,
  MessageSquare,
  Plus,
  Radio,
  Smartphone,
  Trash2,
} from "lucide-react"
import { toast } from "sonner"
import { PageHero } from "@/components/shared/PageHero"
import {
  DataTableShell,
  type DataTableColumn,
} from "@/components/shared/DataTableShell"
import { DataTableToolbar } from "@/components/shared/DataTableToolbar"
import { EmptyState } from "@/components/shared/EmptyState"
import { PaginationControls } from "@/components/shared/PaginationControls"
import { QueryContent } from "@/components/shared/QueryContent"
import { ResponsiveModal } from "@/components/shared/ResponsiveModal"
import { SearchableOptionSelect } from "@/components/shared/SearchableOptionSelect"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { getApiErrorMessage } from "@/lib/apiResponse"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { AdminNotificationRulesPage } from "./AdminNotificationRulesPage"
import { useNotificationTargets } from "../hooks/useNotificationRules"
import {
  createNotificationTemplate,
  deleteNotificationTemplate,
  getNotificationAdminCatalog,
  getNotificationChannelStatus,
  getNotificationDeliveries,
  getNotificationTemplates,
  updateNotificationTemplate,
  type TemplateInput,
} from "../api/notificationAdminApi"
import type {
  NotificationChannel,
  NotificationChannelStatus,
  NotificationDelivery,
  NotificationDeliveryStatus,
  NotificationTemplate,
} from "../types/rule-engine.types"

type Tab = "rules" | "templates" | "channels" | "deliveries"
const tabs: { id: Tab; label: string; icon: typeof BellRing }[] = [
  { id: "rules", label: "قوانین اعلان", icon: BellRing },
  { id: "templates", label: "قالب‌ها", icon: FileText },
  { id: "channels", label: "کانال‌ها", icon: Radio },
  { id: "deliveries", label: "تاریخچه ارسال", icon: History },
]
export const channelLabels: Record<NotificationChannel, string> = {
  EMAIL: "ایمیل",
  SMS: "پیامک",
  PUSH: "پوش",
  IN_APP: "اعلان داخل سامانه",
}
const deliveryLabels: Record<NotificationDeliveryStatus, string> = {
  PENDING: "در انتظار",
  PROCESSING: "در حال پردازش",
  SENT: "ارسال‌شده",
  DELIVERED: "تحویل‌شده",
  FAILED: "ناموفق",
  RETRYING: "تلاش مجدد",
  SKIPPED: "ردشده",
}
const serviceLabels: Record<string, string> = { MEETING: "جلسه", TASK: "کار" }
const actionLabels: Record<string, string> = {
  CREATED: "ایجاد",
  UPDATED: "ویرایش",
  CANCELLED: "لغو",
  ASSIGNED: "ارجاع",
  REASSIGNED: "ارجاع مجدد",
  COMPLETED: "تکمیل",
}
export function eventLabel(value: string) {
  const [service, action] = value.split(".")
  return `${serviceLabels[service ?? ""] ?? service} — ${actionLabels[action ?? ""] ?? action}`
}
const date = (value?: string | null) =>
  value
    ? new Intl.DateTimeFormat("fa-IR", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(value))
    : "—"
function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`h-11 rounded-xl border border-[var(--app-divider)] bg-[var(--app-background)] px-3 text-sm ${props.className ?? ""}`}
    />
  )
}

export function AdminNotificationsPage() {
  const [params, setParams] = useSearchParams()
  const tab = (
    tabs.some((item) => item.id === params.get("tab"))
      ? params.get("tab")
      : "rules"
  ) as Tab
  const catalog = useQuery({
    queryKey: ["notification-admin", "catalog"],
    queryFn: getNotificationAdminCatalog,
    staleTime: 300_000,
  })
  const setTab = (next: Tab) =>
    setParams(next === "rules" ? {} : { tab: next }, { replace: true })
  return (
    <div className="grid gap-5" dir="rtl">
      <PageHero
        title="تنظیمات اعلان‌ها"
        description="مدیریت قوانین، قالب‌ها، کانال‌های ارسال و تاریخچه اعلان‌ها"
        accessBadge={{ label: "مدیریت اعلان‌ها", icon: BellRing }}
        backFallback="/dashboard"
      />
      <nav
        aria-label="بخش‌های تنظیمات اعلان"
        className="grid grid-cols-2 gap-2 rounded-[var(--app-radius-card)] border border-[var(--app-divider)] bg-[var(--app-surface)] p-2 md:flex"
      >
        {tabs.map(({ id, label, icon: Icon }) => (
          <Button
            key={id}
            variant={tab === id ? "default" : "ghost"}
            onClick={() => setTab(id)}
            className="justify-start rounded-xl"
          >
            <Icon className="size-4" />
            {label}
          </Button>
        ))}
      </nav>
      {tab === "rules" ? <AdminNotificationRulesPage embedded /> : null}
      {tab === "templates" ? (
        <TemplatesTab
          events={catalog.data?.events.map((item) => item.eventName) ?? []}
        />
      ) : null}
      {tab === "channels" ? <ChannelsTab /> : null}
      {tab === "deliveries" ? (
        <DeliveriesTab
          events={catalog.data?.events.map((item) => item.eventName) ?? []}
        />
      ) : null}
    </div>
  )
}

function TemplatesTab({ events }: { events: string[] }) {
  const client = useQueryClient(),
    [search, setSearch] = useState(""),
    [eventName, setEventName] = useState(""),
    [channel, setChannel] = useState(""),
    [locale, setLocale] = useState(""),
    [editing, setEditing] = useState<NotificationTemplate | "NEW" | null>(null)
  const query = useQuery({
    queryKey: ["notification-templates", search, eventName, channel, locale],
    queryFn: () =>
      getNotificationTemplates({
        search: search || undefined,
        eventName: eventName || undefined,
        channel: channel || undefined,
        locale: locale || undefined,
      }),
  })
  const remove = useMutation({
    mutationFn: deleteNotificationTemplate,
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: ["notification-templates"] })
      toast.success("قالب حذف شد.")
    },
    onError: (e) => toast.error(getApiErrorMessage(e, "حذف قالب ناموفق بود.")),
  })
  const columns: DataTableColumn<NotificationTemplate>[] = [
    { id: "event", header: "رویداد", cell: (r) => eventLabel(r.eventName) },
    { id: "channel", header: "کانال", cell: (r) => channelLabels[r.channel] },
    { id: "locale", header: "زبان", cell: (r) => r.locale },
    { id: "subject", header: "موضوع", cell: (r) => r.subject || "—" },
    {
      id: "version",
      header: "نسخه",
      cell: (r) => r.version.toLocaleString("fa-IR"),
    },
    {
      id: "active",
      header: "وضعیت",
      cell: (r) => (
        <StatusBadge tone={r.isActive ? "success" : "neutral"}>
          {r.isActive ? "فعال" : "غیرفعال"}
        </StatusBadge>
      ),
    },
    { id: "date", header: "آخرین تغییر", cell: (r) => date(r.updatedAt) },
    {
      id: "actions",
      header: "عملیات",
      cell: (r) => (
        <div className="flex gap-1">
          <Button size="sm" variant="outline" onClick={() => setEditing(r)}>
            ویرایش
          </Button>
          <Button
            size="icon-sm"
            variant="ghost"
            className="text-red-600"
            onClick={() => {
              if (confirm("این قالب حذف شود؟")) remove.mutate(r.id)
            }}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      ),
    },
  ]
  return (
    <section className="grid gap-4">
      <DataTableToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="جستجو در موضوع و متن قالب"
        hasActiveFilters={Boolean(search || eventName || channel || locale)}
        onClearFilters={() => {
          setSearch("")
          setEventName("")
          setChannel("")
          setLocale("")
        }}
        filters={
          <>
            <Select
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              aria-label="رویداد"
            >
              <option value="">همه رویدادها</option>
              {events.map((e) => (
                <option key={e} value={e}>
                  {eventLabel(e)}
                </option>
              ))}
            </Select>
            <Select
              value={channel}
              onChange={(e) => setChannel(e.target.value)}
              aria-label="کانال"
            >
              <option value="">همه کانال‌ها</option>
              {Object.entries(channelLabels).map(([id, label]) => (
                <option key={id} value={id}>
                  {label}
                </option>
              ))}
            </Select>
            <Input
              className="h-11 rounded-xl"
              value={locale}
              onChange={(e) => setLocale(e.target.value)}
              placeholder="زبان؛ مانند fa-IR"
            />
          </>
        }
        actions={
          <Button onClick={() => setEditing("NEW")}>
            <Plus className="size-4" />
            قالب جدید
          </Button>
        }
      />
      <QueryContent query={query} errorTitle="دریافت قالب‌ها ناموفق بود">
        <DataTableShell
          rows={query.data ?? []}
          columns={columns}
          getRowKey={(r) => r.id}
          emptyState={
            <EmptyState
              icon={FileText}
              title="قالبی تعریف نشده است"
              description="برای رویداد و کانال موردنظر یک قالب بسازید."
            />
          }
        />
      </QueryContent>
      {editing ? (
        <TemplateDialog
          item={editing === "NEW" ? null : editing}
          events={events}
          onClose={() => setEditing(null)}
        />
      ) : null}
    </section>
  )
}

function TemplateDialog({
  item,
  events,
  onClose,
}: {
  item: NotificationTemplate | null
  events: string[]
  onClose: () => void
}) {
  const client = useQueryClient(),
    [eventName, setEventName] = useState(
      item?.eventName ?? events[0] ?? "MEETING.CREATED"
    ),
    [channel, setChannel] = useState<NotificationChannel>(
      item?.channel ?? "IN_APP"
    ),
    [locale, setLocale] = useState(item?.locale ?? "fa-IR"),
    [subject, setSubject] = useState(item?.subject ?? ""),
    [body, setBody] = useState(item?.body ?? ""),
    [version, setVersion] = useState(item?.version ?? 1),
    [active, setActive] = useState(item?.isActive ?? true)
  const save = useMutation({
    mutationFn: (input: TemplateInput) =>
      item
        ? updateNotificationTemplate(item.id, input)
        : createNotificationTemplate(input),
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: ["notification-templates"] })
      toast.success(item ? "قالب ویرایش شد." : "قالب ایجاد شد.")
      onClose()
    },
    onError: (e) =>
      toast.error(getApiErrorMessage(e, "ذخیره قالب ناموفق بود.")),
  })
  return (
    <ResponsiveModal
      open
      onClose={onClose}
      title={item ? "ویرایش قالب اعلان" : "ایجاد قالب اعلان"}
      description="متن ساده و جای‌نگهدارهای مورد پشتیبانی سرویس را وارد کنید."
      icon={FileText}
    >
      <form
        className="grid gap-4"
        onSubmit={(e) => {
          e.preventDefault()
          if (!body.trim()) return toast.error("متن قالب الزامی است.")
          save.mutate({
            eventName,
            channel,
            locale: locale.trim() || "fa-IR",
            subject: subject.trim() || null,
            body: body.trim(),
            version,
            isActive: active,
          })
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-bold">
            رویداد
            <Select
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
            >
              {events.map((v) => (
                <option key={v} value={v}>
                  {eventLabel(v)}
                </option>
              ))}
            </Select>
          </label>
          <label className="grid gap-2 text-sm font-bold">
            کانال
            <Select
              value={channel}
              onChange={(e) =>
                setChannel(e.target.value as NotificationChannel)
              }
            >
              {Object.entries(channelLabels).map(([id, label]) => (
                <option key={id} value={id}>
                  {label}
                </option>
              ))}
            </Select>
          </label>
          <label className="grid gap-2 text-sm font-bold">
            زبان
            <Input value={locale} onChange={(e) => setLocale(e.target.value)} />
          </label>
          <label className="grid gap-2 text-sm font-bold">
            نسخه
            <Input
              type="number"
              min={1}
              value={version}
              onChange={(e) =>
                setVersion(Math.max(1, Number(e.target.value) || 1))
              }
            />
          </label>
        </div>
        <label className="grid gap-2 text-sm font-bold">
          موضوع (اختیاری)
          <Input value={subject} onChange={(e) => setSubject(e.target.value)} />
        </label>
        <label className="grid gap-2 text-sm font-bold">
          متن قالب
          <textarea
            className="min-h-40 rounded-xl border bg-background p-3 font-mono text-sm"
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
          />
          فعال
        </label>
        <div className="flex justify-end gap-2 border-t pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            انصراف
          </Button>
          <Button type="submit" disabled={save.isPending}>
            {save.isPending ? "در حال ذخیره..." : "ذخیره"}
          </Button>
        </div>
      </form>
    </ResponsiveModal>
  )
}

function ChannelsTab() {
  const query = useQuery({
    queryKey: ["notification-channels"],
    queryFn: getNotificationChannelStatus,
  })
  const icons: Record<NotificationChannel, typeof Mail> = {
    EMAIL: Mail,
    SMS: MessageSquare,
    PUSH: Smartphone,
    IN_APP: BellRing,
  }
  const descriptions: Record<NotificationChannel, string> = {
    EMAIL: "ارسال از طریق SMTP سازمان",
    SMS: "ارسال پیامک از طریق ارائه‌دهنده سازمان",
    PUSH: "اعلان پوش برای دستگاه و مرورگر",
    IN_APP: "نمایش در مرکز اعلان‌های سامانه",
  }
  return (
    <QueryContent query={query} errorTitle="دریافت وضعیت کانال‌ها ناموفق بود">
      <div className="grid gap-4 sm:grid-cols-2">
        {query.data?.map((item: NotificationChannelStatus) => {
          const Icon = icons[item.channel]
          return (
            <article
              key={item.channel}
              className="rounded-[var(--app-radius-card)] border border-[var(--app-divider)] bg-[var(--app-surface)] p-5 shadow-[var(--app-shadow-card)]"
            >
              <div className="flex items-start justify-between">
                <span className="grid size-11 place-items-center rounded-2xl bg-[var(--app-primary-soft)] text-[var(--app-primary)]">
                  <Icon className="size-5" />
                </span>
                <StatusBadge tone={item.usable ? "success" : "warning"}>
                  {item.usable ? "قابل استفاده" : "پیکربندی نشده"}
                </StatusBadge>
              </div>
              <h3 className="mt-4 font-black">{channelLabels[item.channel]}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {descriptions[item.channel]}
              </p>
              <p className="mt-3 text-xs">
                ارائه‌دهنده: {item.provider || "تعریف نشده"}
              </p>
              {item.configurationPath ? (
                <Button
                  className="mt-4"
                  variant="outline"
                  render={<Link to={item.configurationPath} />}
                >
                  تنظیمات ایمیل
                </Button>
              ) : null}
            </article>
          )
        })}
      </div>
    </QueryContent>
  )
}

function DeliveriesTab({ events }: { events: string[] }) {
  const [page, setPage] = useState(1),
    [pageSize, setPageSize] = useState(20),
    [search, setSearch] = useState(""),
    [eventName, setEventName] = useState(""),
    [channel, setChannel] = useState(""),
    [status, setStatus] = useState(""),
    [recipientUserId, setRecipientUserId] = useState(""),
    [recipientSearch, setRecipientSearch] = useState(""),
    [dateFrom, setDateFrom] = useState(""),
    [dateTo, setDateTo] = useState("")
  const recipients = useNotificationTargets("USER", recipientSearch)
  const query = useQuery({
    queryKey: [
      "notification-deliveries",
      page,
      pageSize,
      search,
      eventName,
      channel,
      status,
      recipientUserId,
      dateFrom,
      dateTo,
    ],
    queryFn: () =>
      getNotificationDeliveries({
        page,
        pageSize,
        search: search || undefined,
        eventName: eventName || undefined,
        channel: (channel as NotificationChannel) || undefined,
        status: (status as NotificationDeliveryStatus) || undefined,
        recipientUserId: recipientUserId || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      }),
  })
  const columns: DataTableColumn<NotificationDelivery>[] = [
    { id: "date", header: "زمان", cell: (r) => date(r.createdAt) },
    {
      id: "event",
      header: "رویداد",
      cell: (r) => eventLabel(r.event.eventName),
    },
    {
      id: "recipient",
      header: "گیرنده",
      cell: (r) => r.recipientUser?.fullName || r.destination || "—",
    },
    { id: "channel", header: "کانال", cell: (r) => channelLabels[r.channel] },
    {
      id: "status",
      header: "وضعیت",
      cell: (r) => (
        <StatusBadge
          tone={
            r.status === "FAILED"
              ? "error"
              : r.status === "DELIVERED"
                ? "success"
                : "neutral"
          }
        >
          {deliveryLabels[r.status]}
        </StatusBadge>
      ),
    },
    { id: "destination", header: "مقصد", cell: (r) => r.destination || "—" },
    {
      id: "attempts",
      header: "تلاش",
      cell: (r) => r.attemptCount.toLocaleString("fa-IR"),
    },
    { id: "failure", header: "خطا", cell: (r) => r.failureMessage || "—" },
    {
      id: "provider",
      header: "شناسه ارائه‌دهنده",
      cell: (r) => r.providerMessageId || "—",
    },
    {
      id: "sent",
      header: "ارسال/تحویل",
      cell: (r) => (
        <span>
          {date(r.sentAt)}
          <br />
          {date(r.deliveredAt)}
        </span>
      ),
    },
  ]
  return (
    <section className="grid gap-4">
      <DataTableToolbar
        searchValue={search}
        onSearchChange={(v) => {
          setSearch(v)
          setPage(1)
        }}
        searchPlaceholder="جستجو در مقصد، خطا یا شناسه ارائه‌دهنده"
        hasActiveFilters={Boolean(
          search ||
          eventName ||
          channel ||
          status ||
          recipientUserId ||
          dateFrom ||
          dateTo
        )}
        onClearFilters={() => {
          setSearch("")
          setEventName("")
          setChannel("")
          setStatus("")
          setRecipientUserId("")
          setRecipientSearch("")
          setDateFrom("")
          setDateTo("")
          setPage(1)
        }}
        filters={
          <>
            <Select
              value={eventName}
              onChange={(e) => {
                setEventName(e.target.value)
                setPage(1)
              }}
            >
              <option value="">همه رویدادها</option>
              {events.map((v) => (
                <option key={v} value={v}>
                  {eventLabel(v)}
                </option>
              ))}
            </Select>
            <Select
              value={channel}
              onChange={(e) => {
                setChannel(e.target.value)
                setPage(1)
              }}
            >
              <option value="">همه کانال‌ها</option>
              {Object.entries(channelLabels).map(([id, label]) => (
                <option key={id} value={id}>
                  {label}
                </option>
              ))}
            </Select>
            <Select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value)
                setPage(1)
              }}
            >
              <option value="">همه وضعیت‌ها</option>
              {Object.entries(deliveryLabels).map(([id, label]) => (
                <option key={id} value={id}>
                  {label}
                </option>
              ))}
            </Select>
            <div className="min-w-52">
              <SearchableOptionSelect
                value={recipientUserId || undefined}
                onChange={(value) => {
                  setRecipientUserId(value ?? "")
                  setPage(1)
                }}
                options={(recipients.data ?? []).map((item) => ({
                  id: item.id,
                  label: item.name,
                  secondary: item.description,
                }))}
                search={recipientSearch}
                onSearchChange={setRecipientSearch}
                loading={recipients.isFetching}
                placeholder="همه گیرندگان"
                ariaLabel="گیرنده"
              />
            </div>
            <label className="grid gap-1 text-xs text-muted-foreground">
              از تاریخ
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => {
                  setDateFrom(e.target.value)
                  setPage(1)
                }}
                className="h-11 rounded-xl"
              />
            </label>
            <label className="grid gap-1 text-xs text-muted-foreground">
              تا تاریخ
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => {
                  setDateTo(e.target.value)
                  setPage(1)
                }}
                className="h-11 rounded-xl"
              />
            </label>
          </>
        }
      />
      <QueryContent query={query} errorTitle="دریافت تاریخچه ارسال ناموفق بود">
        <DataTableShell
          rows={query.data?.data ?? []}
          columns={columns}
          getRowKey={(r) => r.id}
          emptyState={
            <EmptyState
              icon={History}
              title="سابقه‌ای یافت نشد"
              description="ارسال‌های اعلان پس از ایجاد در این قسمت دیده می‌شوند."
            />
          }
        />
        <PaginationControls
          page={query.data?.meta.page ?? page}
          pageCount={query.data?.meta.totalPages ?? 1}
          pageSize={pageSize}
          total={query.data?.meta.total}
          disabled={query.isFetching}
          onPageChange={setPage}
          onPageSizeChange={(v) => {
            setPageSize(v)
            setPage(1)
          }}
        />
      </QueryContent>
    </section>
  )
}
