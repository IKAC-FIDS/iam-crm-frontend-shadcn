import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useSearchParams, Link } from "react-router-dom"
import {
  BellRing,
  FileText,
  History,
  Eye,
  Mail,
  MessageSquare,
  Plus,
  Radio,
  Smartphone,
  Settings,
  Send,
  Power,
  PowerOff,
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
import { PersianDatePicker } from "@/components/shared/PersianDatePicker"
import { fromApiDate, toApiDate } from "@/lib/date/jalali"
import { QueryContent } from "@/components/shared/QueryContent"
import { ResponsiveModal } from "@/components/shared/ResponsiveModal"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { SearchableOptionSelect } from "@/components/shared/SearchableOptionSelect"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { getApiErrorMessage } from "@/lib/apiResponse"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { AdminNotificationRulesPage, RuleDialog } from "./AdminNotificationRulesPage"
import { useNotificationTargets } from "../hooks/useNotificationRules"
import {
  createNotificationTemplate,
  activateNotificationTemplate,
  deleteNotificationTemplate,
  getNotificationAdminCatalog,
  getNotificationChannelStatus,
  getNotificationDeliveries,
  getNotificationDelivery,
  getNotificationTemplates,
  getNotificationTemplateVariables,
  previewNotificationTemplate,
  updateNotificationTemplate,
  getSmsSettings,
  getPushSettings,
  updatePushSettings,
  testPushSettings,
  updateSmsSettings,
  testSmsSettings,
  dispatchNotificationDelivery,
  type TemplateInput,
} from "../api/notificationAdminApi"
import type {
  NotificationChannel,
  NotificationChannelStatus,
  NotificationDelivery,
  NotificationDeliveryStatus,
  NotificationTriggerType,
  NotificationTemplate,
} from "../types/rule-engine.types"

type Tab = "rules" | "templates" | "channels" | "deliveries"
const tabs: { id: Tab; label: string; icon: typeof BellRing }[] = [
  { id: "rules", label: "قوانین اعلان", icon: BellRing },
  { id: "templates", label: "قالب‌ها", icon: FileText },
  { id: "channels", label: "کانال‌ها", icon: Radio },
  { id: "deliveries", label: "تاریخچه ارسال", icon: History },
]
const channelLabels: Record<NotificationChannel, string> = {
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
const triggerLabels: Record<NotificationTriggerType, string> = {
  DOMAIN_EVENT: "رویداد سامانه", SCHEDULED: "زمان‌بندی‌شده", MANUAL_RETRY: "تلاش دستی",
  AUTOMATIC_RETRY: "تلاش خودکار", SYSTEM: "سیستمی",
}
const failureLabels: Record<string, string> = {
  NETWORK: "شبکه", AUTHENTICATION: "احراز هویت", PROVIDER_REJECTED: "رد ارائه‌دهنده",
  INVALID_DESTINATION: "مقصد نامعتبر", TEMPLATE_ERROR: "خطای قالب", RATE_LIMIT: "محدودیت نرخ",
  TIMEOUT: "پایان مهلت", CONFIGURATION: "پیکربندی", UNKNOWN: "نامشخص",
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
function eventLabel(value: string) {
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
  const [createRuleOpen, setCreateRuleOpen] = useState(false)
  const [createTemplateOpen, setCreateTemplateOpen] = useState(false)
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
        primaryAction={
          tab === "rules"
            ? {
                label: "ایجاد قانون",
                icon: Plus,
                onClick: () => setCreateRuleOpen(true),
              }
            : tab === "templates"
              ? {
                  label: "قالب جدید",
                  icon: Plus,
                  onClick: () => setCreateTemplateOpen(true),
                }
              : undefined
        }
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
      {createRuleOpen ? <RuleDialog open onOpenChange={setCreateRuleOpen} /> : null}
      {createTemplateOpen ? (
        <TemplateDialog
          item={null}
          events={catalog.data?.events.map((item) => item.eventName) ?? []}
          onClose={() => setCreateTemplateOpen(false)}
        />
      ) : null}
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
    [active, setActive] = useState(""),
    [editing, setEditing] = useState<NotificationTemplate | "NEW" | null>(null)
  const query = useQuery({
    queryKey: ["notification-templates", search, eventName, channel, locale, active],
    queryFn: () =>
      getNotificationTemplates({
        search: search || undefined,
        eventName: eventName || undefined,
        channel: channel || undefined,
        locale: locale || undefined,
        isActive: active || undefined,
      }),
  })
  const remove = useMutation({
    mutationFn: deleteNotificationTemplate,
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: ["notification-templates"] })
      toast.success("قالب غیرفعال شد و در تاریخچه باقی ماند.")
    },
    onError: (e) => toast.error(getApiErrorMessage(e, "حذف قالب ناموفق بود.")),
  })
  const activate = useMutation({
    mutationFn: activateNotificationTemplate,
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: ["notification-templates"] })
      toast.success("این نسخه فعال شد.")
    },
    onError: (e) => toast.error(getApiErrorMessage(e, "فعال‌سازی قالب ناموفق بود.")),
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
            نسخه جدید
          </Button>
          {!r.isActive ? (
            <Button size="icon-sm" variant="ghost" title="فعال‌کردن این نسخه" onClick={() => activate.mutate(r.id)}>
              <Power className="size-4" />
            </Button>
          ) : null}
          <Button
            size="icon-sm"
            variant="ghost"
            className="text-red-600"
            onClick={() => {
              if (confirm("این نسخه غیرفعال شود؟ تاریخچه حذف نخواهد شد.")) remove.mutate(r.id)
            }}
          >
            <PowerOff className="size-4" />
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
        hasActiveFilters={Boolean(search || eventName || channel || locale || active)}
        onClearFilters={() => {
          setSearch("")
          setEventName("")
          setChannel("")
          setLocale("")
          setActive("")
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
            <Select value={active} onChange={(e) => setActive(e.target.value)} aria-label="وضعیت قالب">
              <option value="">همه وضعیت‌ها</option>
              <option value="true">فعال</option>
              <option value="false">غیرفعال</option>
            </Select>
          </>
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
    [active, setActive] = useState(true),
    [insertTarget, setInsertTarget] = useState<"subject" | "body">("body")
  const variables = useQuery({
    queryKey: ["notification-template-variables", eventName],
    queryFn: () => getNotificationTemplateVariables(eventName),
    enabled: Boolean(eventName),
  })
  const preview = useMutation({
    mutationFn: () => previewNotificationTemplate({ eventName, channel, locale: locale.trim() || "fa-IR", subject: subject.trim() || null, body }),
    onError: (e) => toast.error(getApiErrorMessage(e, "پیش‌نمایش قالب ناموفق بود.")),
  })
  const save = useMutation({
    mutationFn: (input: TemplateInput) =>
      item
        ? updateNotificationTemplate(item.id, input)
        : createNotificationTemplate(input),
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: ["notification-templates"] })
      toast.success(item ? "نسخه جدید قالب ایجاد شد." : "قالب ایجاد شد.")
      onClose()
    },
    onError: (e) =>
      toast.error(getApiErrorMessage(e, "ذخیره قالب ناموفق بود.")),
  })
  return (
    <ResponsiveModal
      open
      onClose={onClose}
      title={item ? "ایجاد نسخه جدید قالب" : "ایجاد قالب اعلان"}
      description="محتوای هر کانال مستقل است؛ فقط متغیرهای مجاز را در متن قرار دهید."
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
            version: item?.version ?? 1,
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
          {item ? <div className="grid gap-2 text-sm font-bold">نسخه مبنا<Input value={`نسخه ${item.version.toLocaleString("fa-IR")}`} disabled /></div> : null}
        </div>
        <label className="grid gap-2 text-sm font-bold">
          موضوع (اختیاری)
          <Input value={subject} required={channel === "IN_APP"} onFocus={() => setInsertTarget("subject")} onChange={(e) => setSubject(e.target.value)} disabled={channel === "SMS"} />
          {channel === "IN_APP" ? <span className="text-xs font-normal text-muted-foreground">عنوان اعلان داخل سامانه الزامی است.</span> : null}
          {channel === "SMS" ? <span className="text-xs font-normal text-muted-foreground">پیامک موضوع ندارد.</span> : null}
        </label>
        <label className="grid gap-2 text-sm font-bold">
          <span className="flex items-center justify-between"><span>متن قالب</span>{channel === "SMS" ? <span className="text-xs font-normal text-muted-foreground">{body.length.toLocaleString("fa-IR")} نویسه؛ متن کوتاه نمی‌شود</span> : null}</span>
          <textarea
            className="min-h-40 rounded-xl border bg-background p-3 font-mono text-sm"
            value={body}
            onFocus={() => setInsertTarget("body")}
            onChange={(e) => setBody(e.target.value)}
          />
        </label>
        <section className="grid gap-3 rounded-2xl border border-[var(--app-divider)] bg-[var(--app-background)] p-4">
          <div>
            <h3 className="text-sm font-black">متغیرهای قابل استفاده</h3>
            <p className="mt-1 text-xs text-muted-foreground">با انتخاب هر متغیر، به {insertTarget === "subject" ? "موضوع" : "متن"} افزوده می‌شود.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {variables.data?.variables.map((variable) => (
              <Button key={variable.key} type="button" size="sm" variant="outline" title={variable.label} onClick={() => {
                if (insertTarget === "subject" && channel !== "SMS") setSubject((value) => `${value}${value ? " " : ""}${variable.token}`)
                else setBody((value) => `${value}${value ? " " : ""}${variable.token}`)
              }}>
                <span dir="ltr">{variable.token}</span>
              </Button>
            ))}
          </div>
        </section>
        {preview.data ? (
          <section className="grid gap-3 rounded-2xl border border-blue-200 bg-blue-50/60 p-4 text-sm dark:border-blue-900 dark:bg-blue-950/20">
            <div className="flex items-center justify-between"><h3 className="font-black">پیش‌نمایش با داده نمونه</h3><StatusBadge tone="neutral">نمونه؛ ذخیره نمی‌شود</StatusBadge></div>
            {preview.data.subject ? <div><span className="text-muted-foreground">موضوع: </span>{preview.data.subject}</div> : null}
            <div className="whitespace-pre-wrap">{preview.data.body}</div>
            {preview.data.missingVariables.length ? <p className="text-amber-700">متغیرهای بدون مقدار: {preview.data.missingVariables.join("، ")}</p> : null}
          </section>
        ) : null}
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
          <Button type="button" variant="outline" disabled={!body.trim() || preview.isPending} onClick={() => preview.mutate()}>
            <Eye className="size-4" />
            پیش‌نمایش
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
  const [smsOpen, setSmsOpen] = useState(false)
  const [pushOpen, setPushOpen] = useState(false)
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
              {item.channel === "EMAIL" && item.configurationPath ? (
                <Button
                  className="mt-4"
                  variant="outline"
                  render={<Link to={item.configurationPath} />}
                >
                  تنظیمات ایمیل
                </Button>
              ) : null}
              {item.channel === "SMS" ? (
                <Button className="mt-4" variant="outline" onClick={() => setSmsOpen(true)}>
                  <Settings className="size-4" />
                  تنظیمات پیامک
                </Button>
              ) : null}
              {item.channel === "PUSH" ? (
                <Button className="mt-4" variant="outline" onClick={() => setPushOpen(true)}>
                  <Settings className="size-4" />
                  تنظیمات پوش
                </Button>
              ) : null}
            </article>
          )
        })}
      </div>
      {smsOpen ? <SmsSettingsDialog onClose={() => setSmsOpen(false)} /> : null}
      {pushOpen ? <PushSettingsDialog onClose={() => setPushOpen(false)} /> : null}
    </QueryContent>
  )
}

function PushSettingsDialog({ onClose }: { onClose: () => void }) {
  const query = useQuery({ queryKey: ["push-settings"], queryFn: getPushSettings })
  return <ResponsiveModal open onClose={onClose} title="تنظیمات کانال پوش" description="کلید خصوصی رمزنگاری می‌شود و پس از ذخیره هرگز نمایش داده نخواهد شد." icon={Smartphone}>
    <QueryContent query={query} errorTitle="دریافت تنظیمات پوش ناموفق بود">{query.data ? <PushSettingsForm initial={query.data} onClose={onClose} /> : null}</QueryContent>
  </ResponsiveModal>
}

function PushSettingsForm({ initial, onClose }: { initial: import("../types/rule-engine.types").PushSettings; onClose: () => void }) {
  const client = useQueryClient()
  const [publicKey, setPublicKey] = useState(initial.publicKey), [privateKey, setPrivateKey] = useState(""), [clearPrivateKey, setClearPrivateKey] = useState(false), [subject, setSubject] = useState(initial.subject), [enabled, setEnabled] = useState(initial.enabled), [timeoutMs, setTimeoutMs] = useState(initial.timeoutMs), [recipientUserId, setRecipientUserId] = useState(""), [recipientSearch, setRecipientSearch] = useState("")
  const recipients = useNotificationTargets("USER", recipientSearch)
  const save = useMutation({ mutationFn: updatePushSettings, onSuccess: async () => { setPrivateKey(""); await Promise.all([client.invalidateQueries({ queryKey: ["push-settings"] }), client.invalidateQueries({ queryKey: ["notification-channels"] })]); toast.success("تنظیمات پوش ذخیره شد.") }, onError: e => toast.error(getApiErrorMessage(e, "ذخیره تنظیمات پوش ناموفق بود.")) })
  const test = useMutation({ mutationFn: testPushSettings, onSuccess: result => result.successful ? toast.success(`${result.successful.toLocaleString("fa-IR")} مقصد اعلان را دریافت کرد.`) : toast.error(result.attempted ? "ارسال به همه مقصدها ناموفق بود." : "این کاربر اشتراک پوش فعالی ندارد."), onError: e => toast.error(getApiErrorMessage(e, "ارسال پوش آزمایشی ناموفق بود.")) })
  return <div className="grid gap-5"><form className="grid gap-4" onSubmit={event => { event.preventDefault(); save.mutate({ provider: initial.provider || "WEB_PUSH", publicKey: publicKey.trim(), privateKey: clearPrivateKey ? undefined : privateKey.trim() || undefined, clearPrivateKey, subject: subject.trim(), enabled, timeoutMs }) }}>
    <div className="grid gap-4 sm:grid-cols-2"><label className="grid gap-2 text-sm font-bold">ارائه‌دهنده<Select value="WEB_PUSH" disabled><option value="WEB_PUSH">Web Push</option></Select></label><label className="grid gap-2 text-sm font-bold">مهلت اتصال<Input type="number" min={1000} max={60000} value={timeoutMs} onChange={e => setTimeoutMs(Number(e.target.value) || 10000)} /></label><label className="grid gap-2 text-sm font-bold sm:col-span-2">Subject / اطلاعات تماس<Input dir="ltr" placeholder="mailto:admin@neshane.co" value={subject} onChange={e => setSubject(e.target.value)} /></label><label className="grid gap-2 text-sm font-bold sm:col-span-2">کلید عمومی VAPID<Input dir="ltr" value={publicKey} onChange={e => setPublicKey(e.target.value)} /></label><label className="grid gap-2 text-sm font-bold sm:col-span-2">کلید خصوصی VAPID<Input type="password" dir="ltr" disabled={clearPrivateKey} value={privateKey} onChange={e => setPrivateKey(e.target.value)} placeholder={initial.privateKeyConfigured ? "تنظیم شده است؛ برای حفظ آن خالی بگذارید" : "کلید خصوصی"} /></label></div>
    {initial.privateKeyConfigured ? <label className="flex gap-2 text-sm text-red-700"><input type="checkbox" checked={clearPrivateKey} onChange={e => setClearPrivateKey(e.target.checked)} />کلید خصوصی ذخیره‌شده پاک شود</label> : null}<label className="flex gap-2 text-sm font-bold"><input type="checkbox" checked={enabled} onChange={e => setEnabled(e.target.checked)} />کانال پوش فعال باشد</label><p className="text-xs text-muted-foreground">برای ساخت کلیدها اجرا کنید: <code dir="ltr">npx web-push generate-vapid-keys</code></p><div className="flex justify-end gap-2 border-b pb-5"><Button type="button" variant="outline" onClick={onClose}>انصراف</Button><Button type="submit" disabled={save.isPending}>ذخیره تنظیمات</Button></div>
  </form><section className="grid gap-3 rounded-2xl border p-4"><h3 className="font-black">ارسال آزمایشی</h3><SearchableOptionSelect value={recipientUserId || undefined} onChange={value => setRecipientUserId(value ?? "")} options={(recipients.data ?? []).map(item => ({ id: item.id, label: item.name, secondary: item.description }))} search={recipientSearch} onSearchChange={setRecipientSearch} loading={recipients.isFetching} placeholder="انتخاب کاربر دارای اشتراک" ariaLabel="گیرنده تست پوش" /><Button variant="outline" disabled={!recipientUserId || test.isPending} onClick={() => test.mutate({ recipientUserId })}><Send className="size-4" />ارسال اعلان آزمایشی</Button></section></div>
}

function SmsSettingsDialog({ onClose }: { onClose: () => void }) {
  const query = useQuery({ queryKey: ["sms-settings"], queryFn: getSmsSettings })
  return (
    <ResponsiveModal open onClose={onClose} title="تنظیمات کانال پیامک" description="تنظیمات به سازمان جاری تعلق دارد و کلید API پس از ذخیره قابل مشاهده نیست." icon={MessageSquare}>
      <QueryContent query={query} errorTitle="دریافت تنظیمات پیامک ناموفق بود">
        {query.data ? <SmsSettingsForm initial={query.data} onClose={onClose} /> : null}
      </QueryContent>
    </ResponsiveModal>
  )
}

function SmsSettingsForm({ initial, onClose }: { initial: import("../types/rule-engine.types").SmsSettings; onClose: () => void }) {
  const client = useQueryClient()
  const [provider, setProvider] = useState(initial.provider)
  const [apiUrl, setApiUrl] = useState(initial.apiUrl)
  const [apiKey, setApiKey] = useState("")
  const [clearApiKey, setClearApiKey] = useState(false)
  const [senderNumber, setSenderNumber] = useState(initial.senderNumber)
  const [enabled, setEnabled] = useState(initial.enabled)
  const [timeoutMs, setTimeoutMs] = useState(initial.timeoutMs)
  const [recipient, setRecipient] = useState("")
  const [message, setMessage] = useState("پیامک آزمایشی سامانه CRM")
  const save = useMutation({
    mutationFn: updateSmsSettings,
    onSuccess: async () => {
      setApiKey("")
      await Promise.all([client.invalidateQueries({ queryKey: ["sms-settings"] }), client.invalidateQueries({ queryKey: ["notification-channels"] })])
      toast.success("تنظیمات پیامک ذخیره شد.")
    },
    onError: (e) => toast.error(getApiErrorMessage(e, "ذخیره تنظیمات پیامک ناموفق بود.")),
  })
  const test = useMutation({
    mutationFn: testSmsSettings,
    onSuccess: (result) => {
      if (result.success) toast.success(`پیامک آزمایشی ارسال شد${result.providerMessageId ? `؛ شناسه ${result.providerMessageId}` : ""}.`)
      else toast.error(result.errorMessage || "ارسال پیامک آزمایشی ناموفق بود.")
    },
    onError: (e) => toast.error(getApiErrorMessage(e, "ارسال پیامک آزمایشی ناموفق بود.")),
  })
  return (
    <>
        <form className="grid gap-5" onSubmit={(e) => { e.preventDefault(); save.mutate({ provider, apiUrl: apiUrl.trim(), apiKey: clearApiKey ? undefined : apiKey.trim() || undefined, clearApiKey, senderNumber: senderNumber.trim(), enabled, timeoutMs }) }}>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-bold">ارائه‌دهنده<Select value={provider} onChange={(e) => setProvider(e.target.value)}>{initial.providers.map((value) => <option key={value} value={value}>{value === "GENERIC_HTTP_JSON" ? "HTTP JSON عمومی" : value}</option>)}</Select></label>
            <label className="grid gap-2 text-sm font-bold">شماره فرستنده<Input value={senderNumber} onChange={(e) => setSenderNumber(e.target.value)} dir="ltr" /></label>
            <label className="grid gap-2 text-sm font-bold sm:col-span-2">آدرس API<Input value={apiUrl} onChange={(e) => setApiUrl(e.target.value)} placeholder="https://sms.example.com/messages" dir="ltr" /></label>
            <label className="grid gap-2 text-sm font-bold">کلید API<Input type="password" value={apiKey} disabled={clearApiKey} onChange={(e) => setApiKey(e.target.value)} placeholder={initial.apiKeyConfigured ? "کلید API تنظیم شده است؛ برای حفظ آن خالی بگذارید" : "کلید API"} dir="ltr" /></label>
            <label className="grid gap-2 text-sm font-bold">مهلت اتصال (میلی‌ثانیه)<Input type="number" min={1000} max={60000} value={timeoutMs} onChange={(e) => setTimeoutMs(Number(e.target.value) || 10000)} /></label>
          </div>
          {initial.apiKeyConfigured ? <label className="flex items-center gap-2 text-sm text-red-700"><input type="checkbox" checked={clearApiKey} onChange={(e) => setClearApiKey(e.target.checked)} />کلید API ذخیره‌شده پاک شود</label> : null}
          <label className="flex items-center gap-2 text-sm font-bold"><input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />کانال پیامک فعال باشد</label>
          <div className="flex flex-wrap items-center gap-2"><StatusBadge tone={initial.configured ? "success" : "warning"}>{initial.configured ? "پیکربندی‌شده" : "ناقص"}</StatusBadge>{initial.apiKeyConfigured ? <StatusBadge tone="neutral">کلید API تنظیم شده است</StatusBadge> : null}</div>
          <div className="flex justify-end gap-2 border-b pb-5"><Button type="button" variant="outline" onClick={onClose}>انصراف</Button><Button type="submit" disabled={save.isPending}>{save.isPending ? "در حال ذخیره..." : "ذخیره تنظیمات"}</Button></div>
        </form>
        <section className="mt-5 grid gap-3 rounded-2xl border border-[var(--app-divider)] p-4">
          <h3 className="font-black">ارسال پیامک آزمایشی</h3>
          <div className="grid gap-3 sm:grid-cols-2"><Input value={recipient} onChange={(e) => setRecipient(e.target.value)} placeholder="شماره موبایل گیرنده" dir="ltr" /><Input value={message} maxLength={1000} onChange={(e) => setMessage(e.target.value)} placeholder="متن آزمایشی" /></div>
          <div className="flex items-center justify-between text-xs text-muted-foreground"><span>{message.length.toLocaleString("fa-IR")} نویسه</span><Button type="button" variant="outline" disabled={!recipient.trim() || test.isPending} onClick={() => test.mutate({ recipient: recipient.trim(), message: message.trim() || undefined })}><Send className="size-4" />{test.isPending ? "در حال ارسال..." : "ارسال پیامک آزمایشی"}</Button></div>
        </section>
    </>
  )
}

function DeliveryDetailDialog({ id, onClose }: { id: string; onClose: () => void }) {
  const query = useQuery({ queryKey: ["notification-delivery", id], queryFn: () => getNotificationDelivery(id) })
  const item = query.data
  const field = (label: string, value: React.ReactNode) => <div className="grid gap-1 rounded-xl border border-[var(--app-divider)] p-3"><span className="text-xs text-muted-foreground">{label}</span><span className="break-words text-sm font-medium">{value || "—"}</span></div>
  return <ResponsiveModal open onClose={onClose} title="جزئیات ارسال اعلان" description="وضعیت، منشأ و تاریخچه تلاش‌های این ارسال" icon={History} width="max-w-3xl">
    <QueryContent query={query} errorTitle="دریافت جزئیات ارسال ناموفق بود">
      {item ? <div className="grid gap-5 p-4 sm:p-6">
        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {field("رویداد", eventLabel(item.event.eventName))}
          {field("گیرنده", item.recipientUser?.fullName ?? "—")}
          {field("مقصد محافظت‌شده", item.destination)}
          {field("کانال", channelLabels[item.channel])}
          {field("وضعیت", <StatusBadge tone={item.status === "FAILED" ? "error" : item.status === "DELIVERED" || item.status === "SENT" ? "success" : "neutral"}>{deliveryLabels[item.status]}</StatusBadge>)}
          {field("نوع اجرا", triggerLabels[item.triggerType])}
          {field("قانون", item.rule?.name)}
          {field("قالب", item.template ? `نسخه ${item.template.version.toLocaleString("fa-IR")} · ${item.template.locale}` : "—")}
          {item.channel === "EMAIL" ? field("عنوان ایمیل", item.template?.subject) : null}
          {field("موجودیت مرتبط", item.event.aggregateType && item.event.aggregateId ? `${item.event.aggregateType} · ${item.event.aggregateId}` : "—")}
          {field("شناسه رویداد", item.event.id)}
          {field("کلید یکتایی رویداد", item.event.idempotencyKey)}
          {field("قاعده گیرنده", item.recipientRule ? `${item.recipientRule.type} · ${item.recipientRule.id}` : "—")}
          {field("ایجاد", date(item.createdAt))}
          {field("ارسال", date(item.sentAt))}
          {field("تحویل", date(item.deliveredAt))}
          {field("کلید جلوگیری از تکرار", item.deduplicationKey)}
        </section>
        {(item.failureCode || item.failureMessage) ? <section className="rounded-2xl border border-destructive/25 bg-destructive/5 p-4"><h3 className="font-bold text-destructive">آخرین خطا</h3><p className="mt-2 text-sm">{item.failureCode || "—"}</p><p className="mt-1 break-words text-sm text-muted-foreground">{item.failureMessage || "—"}</p></section> : null}
        <section className="grid gap-3"><h3 className="font-bold">تاریخچه تلاش‌ها</h3>
          {item.attempts.length ? <ol className="grid gap-3">{item.attempts.map((attempt) => <li key={attempt.id} className="grid gap-2 rounded-2xl border border-[var(--app-divider)] p-4 sm:grid-cols-[auto_1fr_auto]">
            <span className="grid size-9 place-items-center rounded-full bg-[var(--app-primary-soft)] text-sm font-bold text-[var(--app-primary)]">{attempt.attemptNumber.toLocaleString("fa-IR")}</span>
            <div><div className="flex flex-wrap items-center gap-2"><StatusBadge tone={attempt.status === "FAILED" ? "error" : attempt.status === "SENT" || attempt.status === "DELIVERED" ? "success" : "neutral"}>{deliveryLabels[attempt.status]}</StatusBadge><span className="text-sm">{triggerLabels[attempt.triggerType]}</span><span className="text-xs text-muted-foreground">{attempt.triggeredByUser?.fullName ?? "سامانه"}</span></div>
            {(attempt.failureCode || attempt.failureReason) ? <p className="mt-2 break-words text-xs text-destructive">{attempt.failureCategory ? `${failureLabels[attempt.failureCategory] ?? attempt.failureCategory} · ` : ""}{attempt.failureCode ?? ""} {attempt.failureReason ?? ""}</p> : null}</div>
            <time className="text-xs text-muted-foreground">{date(attempt.startedAt)}</time>
          </li>)}</ol> : <p className="text-sm text-muted-foreground">هنوز تلاشی ثبت نشده است.</p>}
        </section>
      </div> : null}
    </QueryContent>
  </ResponsiveModal>
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
    [dateTo, setDateTo] = useState(""),
    [triggerType, setTriggerType] = useState(""),
    [selectedId, setSelectedId] = useState<string | null>(null),
    [retryItem, setRetryItem] = useState<NotificationDelivery | null>(null)
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
      triggerType,
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
        triggerType: (triggerType as NotificationTriggerType) || undefined,
      }),
  })
  const client = useQueryClient()
  const dispatch = useMutation({
    mutationFn: dispatchNotificationDelivery,
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: ["notification-deliveries"] })
      await client.invalidateQueries({ queryKey: ["notifications"] })
      toast.success("ارسال برای تلاش مجدد در صف قرار گرفت.")
      setRetryItem(null)
    },
    onError: (e) => toast.error(getApiErrorMessage(e, "پردازش Delivery ناموفق بود.")),
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
    { id: "trigger", header: "نوع اجرا", cell: (r) => triggerLabels[r.triggerType] },
    {
      id: "attempts",
      header: "تلاش",
      cell: (r) => r.attemptCount.toLocaleString("fa-IR"),
    },
    {
      id: "actions",
      header: "عملیات",
      cell: (r) => <div className="flex items-center gap-1" onClick={(event) => event.stopPropagation()}>
        <Button size="icon" variant="ghost" aria-label="مشاهده جزئیات" onClick={() => setSelectedId(r.id)}><Eye className="size-4" /></Button>
        {r.status === "FAILED" ? <Button size="icon" variant="ghost" aria-label="تلاش مجدد" disabled={dispatch.isPending} onClick={() => setRetryItem(r)}><Send className="size-4" /></Button> : null}
      </div>,
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
          || triggerType
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
          setTriggerType("")
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
            <Select value={triggerType} onChange={(e) => { setTriggerType(e.target.value); setPage(1) }}>
              <option value="">همه انواع اجرا</option>
              {Object.entries(triggerLabels).map(([id, label]) => <option key={id} value={id}>{label}</option>)}
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
              <PersianDatePicker
                ariaLabel="از تاریخ"
                placeholder="از تاریخ"
                value={fromApiDate(dateFrom)}
                maxDate={fromApiDate(dateTo)}
                onChange={(value) => {
                  setDateFrom(toApiDate(value) ?? "")
                  setPage(1)
                }}
              />
            </label>
            <label className="grid gap-1 text-xs text-muted-foreground">
              تا تاریخ
              <PersianDatePicker
                ariaLabel="تا تاریخ"
                placeholder="تا تاریخ"
                value={fromApiDate(dateTo)}
                minDate={fromApiDate(dateFrom)}
                onChange={(value) => {
                  setDateTo(toApiDate(value) ?? "")
                  setPage(1)
                }}
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
          onRowClick={(r) => setSelectedId(r.id)}
          mobile={{
            title: (r) => eventLabel(r.event.eventName),
            subtitle: (r) => r.recipientUser?.fullName || r.destination || "—",
            status: (r) => <StatusBadge tone={r.status === "FAILED" ? "error" : r.status === "SENT" || r.status === "DELIVERED" ? "success" : "neutral"}>{deliveryLabels[r.status]}</StatusBadge>,
            fields: [
              { id: "channel", label: "کانال", render: (r) => channelLabels[r.channel] },
              { id: "trigger", label: "نوع اجرا", render: (r) => triggerLabels[r.triggerType] },
              { id: "attempts", label: "تعداد تلاش", render: (r) => r.attemptCount.toLocaleString("fa-IR") },
              { id: "date", label: "زمان", render: (r) => date(r.createdAt) },
            ],
          }}
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
      {selectedId ? <DeliveryDetailDialog id={selectedId} onClose={() => setSelectedId(null)} /> : null}
      <ConfirmDialog open={Boolean(retryItem)} onOpenChange={(open) => { if (!open) setRetryItem(null) }} title="تلاش مجدد برای ارسال؟" description="همین Delivery با همان رویداد، گیرنده و قالب دوباره در صف قرار می‌گیرد و رکورد تکراری ساخته نمی‌شود." confirmLabel="قرار دادن در صف" tone="primary" isPending={dispatch.isPending} onConfirm={() => { if (retryItem) dispatch.mutate(retryItem.id) }} />
    </section>
  )
}
