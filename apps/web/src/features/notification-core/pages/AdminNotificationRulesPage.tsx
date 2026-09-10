import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { BellRing, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { PageHero } from "@/components/shared/PageHero"
import { DataTableToolbar } from "@/components/shared/DataTableToolbar"
import { SearchableOptionSelect } from "@/components/shared/SearchableOptionSelect"
import { getApiErrorMessage } from "@/lib/apiResponse"
import { getDigestPolicies } from "../api/notificationAdminApi"
import { RuleConditionBuilder } from "../components/RuleConditionBuilder"
import { RuleScheduleEditor } from "../components/RuleScheduleEditor"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent } from "@workspace/ui/components/card"
import { Input } from "@workspace/ui/components/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import {
  useNotificationRuleCatalog,
  useNotificationRuleMutations,
  useNotificationRules,
  useNotificationTargets,
} from "../hooks/useNotificationRules"
import type {
  NotificationChannel,
  NotificationRecipientType,
  NotificationRule,
  NotificationRuleConditions,
  NotificationRuleInput,
  NotificationPriority,
  NotificationScheduleInput,
  RecipientRuleInput,
} from "../types/rule-engine.types"

const eventLabels: Record<string, string> = {
  "MEETING.CREATED": "ایجاد جلسه",
  "MEETING.UPDATED": "ویرایش جلسه",
  "MEETING.CANCELLED": "لغو جلسه",
  "MEETING.REMINDER": "یادآوری جلسه",
  "TASK.ASSIGNED": "ارجاع کار",
  "TASK.REASSIGNED": "ارجاع مجدد کار",
  "TASK.COMPLETED": "تکمیل کار",
  "TASK.DUE_SOON": "نزدیک‌شدن سررسید کار",
  "TASK.OVERDUE": "سررسید گذشته کار",
  "OPPORTUNITY.STAGE_CHANGED": "تغییر مرحله فرصت",
}
const actionLabels: Record<string, string> = {
  CREATED: "ایجاد",
  UPDATED: "ویرایش",
  CANCELLED: "لغو",
  ASSIGNED: "ارجاع",
  REASSIGNED: "ارجاع مجدد",
  COMPLETED: "تکمیل",
  STAGE_CHANGED: "تغییر مرحله",
  REMINDER: "یادآوری",
  DUE_SOON: "نزدیک‌شدن سررسید",
  OVERDUE: "سررسید گذشته",
}

const recipientLabels: Record<NotificationRecipientType, string> = {
  USER: "کاربر مشخص",
  ROLE: "نقش",
  TEAM: "تیم",
  ASSIGNEE: "مسئول/مسئولان",
  OWNER: "مالک",
  CREATOR: "ایجادکننده",
  MANAGER: "مدیر",
}

const channelLabels: Record<NotificationChannel, string> = {
  EMAIL: "ایمیل",
  SMS: "پیامک",
  PUSH: "Push",
  IN_APP: "اعلان سامانه",
}

const defaultRecipient = (): RecipientRuleInput => ({
  type: "ASSIGNEE",
  targetId: null,
  channels: ["EMAIL"],
  enabled: true,
})

function NativeSelect(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`h-10 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/20 ${props.className ?? ""}`}
    />
  )
}

export function RuleDialog({
  open,
  onOpenChange,
  rule,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  rule?: NotificationRule | null
}) {
  const catalog = useNotificationRuleCatalog()
  const mutations = useNotificationRuleMutations()
  const [name, setName] = useState(rule?.name ?? "")
  const [eventName, setEventName] = useState(
    rule?.eventName ?? "MEETING.CREATED"
  )
  const [priority, setPriority] = useState(rule?.priority ?? 100)
  const [deliveryPriority, setDeliveryPriority] = useState<NotificationPriority>(rule?.deliveryPriority ?? "NORMAL")
  const [digestPolicyId, setDigestPolicyId] = useState(rule?.digestPolicyId ?? "")
  const digestPolicies = useQuery({ queryKey: ["notification-digests"], queryFn: getDigestPolicies })
  const [mandatory, setMandatory] = useState(rule?.mandatory ?? false)
  const [conditions, setConditions] = useState<NotificationRuleConditions | null>(rule?.conditions ?? null)
  const [schedule, setSchedule] = useState<NotificationScheduleInput | null>(rule?.schedule ? { enabled: rule.schedule.enabled, type: rule.schedule.scheduleType, sourceField: rule.schedule.sourceField, triggerMode: rule.schedule.triggerMode, offsetMinutes: rule.schedule.offsetMinutes, gracePeriodMinutes: rule.schedule.gracePeriodMinutes } : null)
  const [recipients, setRecipients] = useState<RecipientRuleInput[]>(
    rule?.recipientRules?.length
      ? rule.recipientRules.map((item) => ({
          type: item.type,
          targetId: item.targetId ?? null,
          channels: item.channels,
          enabled: item.enabled,
        }))
      : [defaultRecipient()]
  )

  const events = catalog.data?.events ?? Object.keys(eventLabels)
  const services = [
    ...new Set(events.map((event) => event.split(".")[0]).filter(Boolean)),
  ]
  const selectedService = eventName.split(".")[0] ?? ""
  const selectedAction = eventName.split(".")[1] ?? ""
  const actions = events
    .filter((event) => event.startsWith(`${selectedService}.`))
    .map((event) => event.split(".")[1] ?? "")
  const recipientTypes =
    catalog.data?.recipientTypes ??
    (Object.keys(recipientLabels) as NotificationRecipientType[])
  const channels =
    catalog.data?.channels ??
    (Object.keys(channelLabels) as NotificationChannel[])
  const conditionFields = catalog.data?.conditionEvents?.find(item => item.eventName === eventName)?.conditionFields ?? []
  const scheduleDefinition = catalog.data?.scheduleEvents?.find(item => item.eventName === eventName)
  const selectEvent = (nextEvent: string) => {
    setEventName(nextEvent); setConditions(null)
    const definition = catalog.data?.scheduleEvents?.find(item => item.eventName === nextEvent)
    setSchedule(definition ? { enabled: true, type: definition.scheduleOptions.type, sourceField: definition.scheduleOptions.sourceField, triggerMode: definition.scheduleOptions.triggerModes[0]!, offsetMinutes: definition.scheduleOptions.suggestedOffsetsMinutes[0] ?? 0, gracePeriodMinutes: definition.scheduleOptions.defaultGracePeriodMinutes } : null)
  }

  const updateRecipient = (
    index: number,
    patch: Partial<RecipientRuleInput>
  ) => {
    setRecipients((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...patch } : item
      )
    )
  }

  const submit = async () => {
    if (!name.trim()) {
      toast.error("نام قانون الزامی است.")
      return
    }
    if (
      !recipients.length ||
      recipients.some((item) => !item.channels.length)
    ) {
      toast.error("برای هر گیرنده حداقل یک کانال انتخاب کنید.")
      return
    }
    if (
      recipients.some(
        (item) => ["USER", "ROLE", "TEAM"].includes(item.type) && !item.targetId
      )
    ) {
      toast.error("گیرنده قانون را انتخاب کنید.")
      return
    }

    const input: NotificationRuleInput = {
      name: name.trim(),
      eventName,
      priority,
      deliveryPriority,
      digestPolicyId: digestPolicyId || null,
      mandatory,
      enabled: rule?.enabled ?? true,
      conditions,
      schedule,
      recipientRules: recipients,
    }

    try {
      if (rule) {
        await mutations.update.mutateAsync({ id: rule.id, input })
        toast.success("قانون اعلان ویرایش شد.")
      } else {
        await mutations.create.mutateAsync(input)
        toast.success("قانون اعلان ایجاد شد.")
      }
      onOpenChange(false)
    } catch (error) {
      toast.error(getApiErrorMessage(error, "ذخیره قانون اعلان ناموفق بود."))
    }
  }

  const pending = mutations.create.isPending || mutations.update.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[90vh] max-w-3xl overflow-y-auto"
        dir="rtl"
      >
        <DialogHeader>
          <DialogTitle>
            {rule ? "ویرایش قانون اعلان" : "قانون اعلان جدید"}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-5">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm">
              <span>نام قانون</span>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </label>
            <label className="grid gap-2 text-sm">
              <span>سرویس</span>
              <NativeSelect
                value={selectedService}
                onChange={(e) => {
                  const service = e.target.value
                  const first = events.find((event) =>
                    event.startsWith(`${service}.`)
                  )
                  if (first) selectEvent(first)
                }}
              >
                {services.map((service) => (
                  <option key={service} value={service}>
                    {service === "MEETING"
                      ? "جلسه"
                      : service === "TASK"
                        ? "کار"
                        : service === "OPPORTUNITY"
                          ? "فرصت"
                        : service}
                  </option>
                ))}
              </NativeSelect>
            </label>
            <label className="grid gap-2 text-sm">
              <span>اکشن</span>
              <NativeSelect
                value={selectedAction}
                onChange={(e) => selectEvent(`${selectedService}.${e.target.value}`)}
              >
                {actions.map((action) => {
                  const value = `${selectedService}.${action}`
                  return (
                    <option key={action} value={action}>
                      {actionLabels[action] ?? eventLabels[value] ?? action}
                    </option>
                  )
                })}
              </NativeSelect>
            </label>
            <label className="grid gap-2 text-sm">
              <span>اولویت اجرا</span>
              <Input
                type="number"
                min={0}
                max={10000}
                value={priority}
                onChange={(e) => setPriority(Number(e.target.value) || 0)}
              />
            </label>
            <label className="grid gap-2 text-sm">
              <span>فوریت اعلان</span>
              <NativeSelect value={deliveryPriority} onChange={event => setDeliveryPriority(event.target.value as NotificationPriority)}>
                <option value="LOW">کم</option><option value="NORMAL">عادی</option><option value="HIGH">زیاد</option><option value="URGENT">فوری</option><option value="CRITICAL">بحرانی (عبور از ساعات سکوت)</option>
              </NativeSelect>
            </label>
            <label className="grid gap-2 text-sm">
              <span>خلاصه دوره‌ای</span>
              <NativeSelect value={digestPolicyId} onChange={event => setDigestPolicyId(event.target.value)}>
                <option value="">ارسال مستقیم</option>
                {digestPolicies.data?.filter(item => item.enabled && item.eventNames.includes(eventName)).map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
              </NativeSelect>
            </label>
            <label className="flex items-center gap-3 rounded-xl border p-3 text-sm">
              <input
                type="checkbox"
                checked={mandatory}
                onChange={(event) => setMandatory(event.target.checked)}
                className="size-4 accent-current"
              />
              <span>اعلان سازمانی اجباری</span>
            </label>
          </div>

          <RuleScheduleEditor definition={scheduleDefinition} value={schedule} onChange={setSchedule} />
          <RuleConditionBuilder fields={conditionFields} value={conditions} onChange={setConditions} />

          <div className="grid gap-3">
            <div className="flex items-center justify-between">
              <strong>گیرندگان و کانال‌ها</strong>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setRecipients((items) => [...items, defaultRecipient()])
                }
              >
                <Plus className="size-4" /> افزودن گیرنده
              </Button>
            </div>
            {recipients.map((recipient, index) => (
              <RecipientEditor
                key={index}
                recipient={recipient}
                recipientTypes={recipientTypes}
                channels={channels}
                onChange={(patch) => updateRecipient(index, patch)}
                onRemove={() =>
                  setRecipients((items) => items.filter((_, i) => i !== index))
                }
                removable={recipients.length > 1}
              />
            ))}
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              انصراف
            </Button>
            <Button disabled={pending} onClick={() => void submit()}>
              {pending ? "در حال ذخیره..." : "ذخیره قانون"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function RecipientEditor({
  recipient,
  recipientTypes,
  channels,
  onChange,
  onRemove,
  removable,
}: {
  recipient: RecipientRuleInput
  recipientTypes: NotificationRecipientType[]
  channels: NotificationChannel[]
  onChange: (patch: Partial<RecipientRuleInput>) => void
  onRemove: () => void
  removable: boolean
}) {
  const [targetSearch, setTargetSearch] = useState("")
  const targets = useNotificationTargets(recipient.type, targetSearch)
  const needsTarget = ["USER", "ROLE", "TEAM"].includes(recipient.type)

  const toggleChannel = (channel: NotificationChannel) => {
    onChange({
      channels: recipient.channels.includes(channel)
        ? recipient.channels.filter((item) => item !== channel)
        : [...recipient.channels, channel],
    })
  }

  return (
    <div className="grid gap-3 rounded-2xl border bg-muted/20 p-4 md:grid-cols-[1fr_1.2fr]">
      <label className="grid gap-2 text-sm">
        <span>نوع گیرنده</span>
        <NativeSelect
          value={recipient.type}
          onChange={(e) =>
            onChange({
              type: e.target.value as NotificationRecipientType,
              targetId: null,
            })
          }
        >
          {recipientTypes.map((type) => (
            <option key={type} value={type}>
              {recipientLabels[type]}
            </option>
          ))}
        </NativeSelect>
      </label>
      {needsTarget ? (
        <label className="grid gap-2 text-sm">
          <span>انتخاب گیرنده</span>
          <SearchableOptionSelect
            value={recipient.targetId ?? undefined}
            onChange={(value) => onChange({ targetId: value ?? null })}
            options={(targets.data ?? []).map((target) => ({
              id: target.id,
              label: target.name,
              secondary: target.description,
            }))}
            search={targetSearch}
            onSearchChange={setTargetSearch}
            loading={targets.isFetching}
            allowEmpty={false}
            placeholder="جستجو و انتخاب کنید"
            ariaLabel="انتخاب گیرنده"
          />
        </label>
      ) : (
        <div className="rounded-xl border border-dashed p-3 text-xs text-muted-foreground">
          گیرنده به‌صورت پویا از موجودیت رویداد تعیین می‌شود.
        </div>
      )}
      <div className="flex flex-wrap items-center gap-2 md:col-span-2">
        {channels.map((channel) => (
          <Button
            key={channel}
            type="button"
            size="sm"
            variant={
              recipient.channels.includes(channel) ? "default" : "outline"
            }
            onClick={() => toggleChannel(channel)}
          >
            {channelLabels[channel]}
          </Button>
        ))}
        {removable ? (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="mr-auto text-destructive"
            onClick={onRemove}
          >
            <Trash2 className="size-4" /> حذف گیرنده
          </Button>
        ) : null}
      </div>
    </div>
  )
}

export function AdminNotificationRulesPage({
  embedded = false,
}: {
  embedded?: boolean
}) {
  const rules = useNotificationRules()
  const mutations = useNotificationRuleMutations()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingRule, setEditingRule] = useState<NotificationRule | null>(null)
  const [search, setSearch] = useState("")
  const [eventFilter, setEventFilter] = useState("")
  const [enabledFilter, setEnabledFilter] = useState("")
  const [channelFilter, setChannelFilter] = useState("")
  const [recipientFilter, setRecipientFilter] = useState("")

  const counts = useMemo(() => {
    const data = rules.data ?? []
    return {
      total: data.length,
      active: data.filter((item) => item.enabled).length,
    }
  }, [rules.data])
  const visibleRules = useMemo(
    () =>
      (rules.data ?? []).filter(
        (rule) =>
          (!search.trim() ||
            rule.name
              .toLocaleLowerCase("fa")
              .includes(search.trim().toLocaleLowerCase("fa"))) &&
          (!eventFilter || rule.eventName === eventFilter) &&
          (!enabledFilter || String(rule.enabled) === enabledFilter) &&
          (!channelFilter ||
            rule.recipientRules.some((item) =>
              item.channels.includes(channelFilter as NotificationChannel)
            )) &&
          (!recipientFilter ||
            rule.recipientRules.some((item) => item.type === recipientFilter))
      ),
    [
      rules.data,
      search,
      eventFilter,
      enabledFilter,
      channelFilter,
      recipientFilter,
    ]
  )

  return (
    <div className="grid gap-6" dir="rtl">
      {!embedded ? (
        <PageHero
          title="قوانین اعلان"
          description="مدیریت رویدادها، گیرندگان و کانال‌های ارسال اعلان"
          accessBadge={{ label: "مدیریت", icon: BellRing }}
          backFallback="/dashboard"
          onRefresh={async () => {
            await rules.refetch()
          }}
          refreshing={rules.isFetching}
          facts={[
            { id: "total", label: "کل قوانین", value: counts.total },
            {
              id: "active",
              label: "فعال",
              value: counts.active,
              tone: "success",
            },
          ]}
          primaryAction={{
            label: "قانون جدید",
            icon: Plus,
            onClick: () => {
              setEditingRule(null)
              setDialogOpen(true)
            },
          }}
        />
      ) : null}

      <DataTableToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="جستجو در نام قانون"
        hasActiveFilters={Boolean(
          search ||
          eventFilter ||
          enabledFilter ||
          channelFilter ||
          recipientFilter
        )}
        onClearFilters={() => {
          setSearch("")
          setEventFilter("")
          setEnabledFilter("")
          setChannelFilter("")
          setRecipientFilter("")
        }}
        filters={
          <>
            <NativeSelect
              aria-label="رویداد"
              value={eventFilter}
              onChange={(e) => setEventFilter(e.target.value)}
            >
              <option value="">همه رویدادها</option>
              {Object.entries(eventLabels).map(([id, label]) => (
                <option key={id} value={id}>
                  {label}
                </option>
              ))}
            </NativeSelect>
            <NativeSelect
              aria-label="وضعیت"
              value={enabledFilter}
              onChange={(e) => setEnabledFilter(e.target.value)}
            >
              <option value="">همه وضعیت‌ها</option>
              <option value="true">فعال</option>
              <option value="false">غیرفعال</option>
            </NativeSelect>
            <NativeSelect
              aria-label="کانال"
              value={channelFilter}
              onChange={(e) => setChannelFilter(e.target.value)}
            >
              <option value="">همه کانال‌ها</option>
              {Object.entries(channelLabels).map(([id, label]) => (
                <option key={id} value={id}>
                  {label}
                </option>
              ))}
            </NativeSelect>
            <NativeSelect
              aria-label="نوع گیرنده"
              value={recipientFilter}
              onChange={(e) => setRecipientFilter(e.target.value)}
            >
              <option value="">همه گیرندگان</option>
              {Object.entries(recipientLabels).map(([id, label]) => (
                <option key={id} value={id}>
                  {label}
                </option>
              ))}
            </NativeSelect>
          </>
        }
      />

      {rules.isLoading ? (
        <p className="text-sm text-muted-foreground">در حال دریافت قوانین...</p>
      ) : null}
      {rules.isError ? (
        <Card>
          <CardContent className="p-6 text-sm text-destructive">
            دریافت قوانین اعلان ناموفق بود.
          </CardContent>
        </Card>
      ) : null}
      {!rules.isLoading && !rules.isError && !rules.data?.length ? (
        <Card>
          <CardContent className="p-8 text-center text-sm text-muted-foreground">
            هنوز قانونی تعریف نشده است.
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-3">
        {visibleRules.map((rule) => (
          <Card key={rule.id}>
            <CardContent className="grid gap-4 p-5 lg:grid-cols-[1fr_auto] lg:items-center">
              <button
                type="button"
                className="grid gap-2 text-right"
                onClick={() => {
                  setEditingRule(rule)
                  setDialogOpen(true)
                }}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <strong className="text-base">{rule.name}</strong>
                  <span className="rounded-full bg-muted px-2 py-1 text-xs">
                    {eventLabels[rule.eventName] ?? rule.eventName}
                  </span>
                  {rule.mandatory ? (
                    <span className="rounded-full bg-amber-100 px-2 py-1 text-xs text-amber-800">
                      اجباری
                    </span>
                  ) : null}
                  {rule.schedule ? (
                    <span className="rounded-full bg-blue-50 px-2 py-1 text-xs text-blue-700">
                      {rule.schedule.offsetMinutes === 0 ? "در سررسید" : `${Math.abs(rule.schedule.offsetMinutes)} دقیقه قبل`}
                    </span>
                  ) : null}
                </div>
                <div className="text-sm text-muted-foreground">
                  {rule.recipientRules
                    .map(
                      (recipient) =>
                        `${recipientLabels[recipient.type]}: ${recipient.channels.map((channel) => channelLabels[channel]).join(" + ")}`
                    )
                    .join(" | ")}
                </div>
              </button>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant={rule.enabled ? "default" : "outline"}
                  size="sm"
                  disabled={mutations.update.isPending}
                  onClick={async () => {
                    const enabled = !rule.enabled
                    try {
                      await mutations.update.mutateAsync({
                        id: rule.id,
                        input: { enabled },
                      })
                      toast.success(
                        enabled ? "قانون فعال شد." : "قانون غیرفعال شد."
                      )
                    } catch (error) {
                      toast.error(
                        getApiErrorMessage(error, "تغییر وضعیت ناموفق بود.")
                      )
                    }
                  }}
                >
                  {rule.enabled ? "فعال" : "غیرفعال"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingRule(rule)
                    setDialogOpen(true)
                  }}
                >
                  ویرایش
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive"
                  onClick={async () => {
                    if (!window.confirm("این قانون اعلان حذف شود؟")) return
                    try {
                      await mutations.remove.mutateAsync(rule.id)
                      toast.success("قانون حذف شد.")
                    } catch (error) {
                      toast.error(
                        getApiErrorMessage(error, "حذف قانون ناموفق بود.")
                      )
                    }
                  }}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {dialogOpen ? (
        <RuleDialog
          key={editingRule?.id ?? "new"}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          rule={editingRule}
        />
      ) : null}
    </div>
  )
}
