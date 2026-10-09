import { useQuery } from "@tanstack/react-query"
import {
  AlertTriangle,
  Bot,
  Building2,
  CalendarClock,
  Database,
  Gauge,
  HardDrive,
  InfinityIcon,
  Mail,
  Users,
  Webhook,
  Workflow,
  Zap,
} from "lucide-react"
import { PageHero } from "@/components/shared/PageHero"
import { MetricCard } from "@/components/shared/MetricCard"
import { getApiErrorMessage } from "@/lib/apiResponse"
import { useAuthStore } from "@/store/authStore"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import {
  getCurrentUsage,
  type QuotaMetric,
  type QuotaMetricName,
  type QuotaResetPeriod,
  type QuotaState,
} from "../api/accountUsageApi"

const inventory = new Set<QuotaMetricName>([
  "ACTIVE_USERS",
  "COMPANIES",
  "OPPORTUNITIES",
  "FILES",
  "STORAGE_BYTES",
])
const info: Record<
  QuotaMetricName,
  { label: string; description: string; icon: typeof Users }
> = {
  ACTIVE_USERS: {
    label: "کاربران فعال",
    description: "حساب‌های فعال سازمان",
    icon: Users,
  },
  COMPANIES: {
    label: "شرکت‌ها",
    description: "شرکت‌های ثبت‌شده در CRM",
    icon: Building2,
  },
  OPPORTUNITIES: {
    label: "فرصت‌های فروش",
    description: "فرصت‌های ثبت‌شده",
    icon: Zap,
  },
  FILES: {
    label: "فایل‌ها",
    description: "تعداد فایل‌های بارگذاری‌شده",
    icon: Database,
  },
  STORAGE_BYTES: {
    label: "فضای ذخیره‌سازی",
    description: "حجم مجموع فایل‌ها",
    icon: HardDrive,
  },
  API_CALLS: {
    label: "فراخوانی API",
    description: "درخواست‌های API در دوره جاری",
    icon: Gauge,
  },
  WORKFLOW_RUNS: {
    label: "اجرای گردش‌کار",
    description: "دفعات اجرای خودکارسازی",
    icon: Workflow,
  },
  WEBHOOK_DELIVERIES: {
    label: "ارسال Webhook",
    description: "پیام‌های خروجی Webhook",
    icon: Webhook,
  },
  EMAIL_SENDS: {
    label: "ارسال ایمیل",
    description: "ایمیل‌های ارسال‌شده",
    icon: Mail,
  },
  AI_REQUESTS: {
    label: "درخواست هوش مصنوعی",
    description: "درخواست‌های پردازش هوشمند",
    icon: Bot,
  },
}
const stateLabel: Record<QuotaState, string> = {
  ENFORCED: "دارای محدودیت",
  UNLIMITED: "نامحدود",
  DISABLED: "غیرفعال",
  UNCONFIGURED: "تعریف‌نشده",
  LEGACY_COMPATIBILITY: "بدون محدودیت",
  INACTIVE_ORGANIZATION: "سازمان غیرفعال",
  INACTIVE_SUBSCRIPTION: "اشتراک غیرفعال",
}
const periodLabel: Record<QuotaResetPeriod, string> = {
  NONE: "بدون بازنشانی",
  DAILY: "روزانه",
  MONTHLY: "ماهانه",
  SUBSCRIPTION_TERM: "دوره اشتراک",
}
const integer = (value?: string | null) => {
  if (!value || !/^\d+$/.test(value)) return "—"
  try {
    return new Intl.NumberFormat("fa-IR").format(BigInt(value))
  } catch {
    return value
  }
}
const date = (value?: string | null) =>
  value
    ? new Intl.DateTimeFormat("fa-IR", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(value))
    : "—"
function bytes(value?: string | null) {
  if (!value || !/^\d+$/.test(value)) return "—"
  const size = Number(value)
  if (!Number.isFinite(size)) return integer(value)
  const units = ["بایت", "کیلوبایت", "مگابایت", "گیگابایت", "ترابایت"]
  let n = size,
    i = 0
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024
    i++
  }
  return `${new Intl.NumberFormat("fa-IR", { maximumFractionDigits: i ? 1 : 0 }).format(n)} ${units[i]}`
}
function ratio(item: QuotaMetric) {
  if (
    !/^\d+$/.test(item.current) ||
    !item.hardLimit ||
    !/^\d+$/.test(item.hardLimit)
  )
    return null
  const limit = BigInt(item.hardLimit)
  if (limit <= 0n) return null
  return Math.min(100, Number((BigInt(item.current) * 1000n) / limit) / 10)
}
const display = (metric: QuotaMetricName, value?: string | null) =>
  metric === "STORAGE_BYTES" ? bytes(value) : integer(value)

function UsageCard({ item }: { item: QuotaMetric }) {
  const data = info[item.metric]
  const Icon = data.icon
  const percent = ratio(item)
  const unlimited =
    item.state === "UNLIMITED" ||
    item.state === "LEGACY_COMPATIBILITY" ||
    item.hardLimit == null
  const danger = percent !== null && percent >= 90
  const warning = percent !== null && percent >= 80
  return (
    <article
      className={`grid content-between gap-5 rounded-[var(--app-radius-card)] border bg-[var(--app-surface)] p-5 shadow-[var(--app-shadow-card)] ${danger ? "border-red-300" : warning ? "border-amber-300" : "border-[var(--app-divider)]"}`}
    >
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[var(--app-primary-soft)] text-[var(--app-primary)]">
              <Icon className="size-5" />
            </span>
            <div>
              <h3 className="font-black">{data.label}</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                {data.description}
              </p>
            </div>
          </div>
          <Badge
            variant="outline"
            className={
              danger
                ? "border-red-200 bg-red-50 text-red-700"
                : warning
                  ? "border-amber-200 bg-amber-50 text-amber-700"
                  : ""
            }
          >
            {stateLabel[item.state]}
          </Badge>
        </div>
        <div className="mt-5 flex items-end justify-between gap-3">
          <div>
            <div className="text-3xl font-black">
              {display(item.metric, item.current)}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              از{" "}
              {unlimited
                ? "ظرفیت نامحدود"
                : display(item.metric, item.hardLimit)}
            </div>
          </div>
          {percent !== null ? (
            <div
              className={`text-sm font-bold ${danger ? "text-red-600" : warning ? "text-amber-600" : "text-[var(--app-primary)]"}`}
            >
              {new Intl.NumberFormat("fa-IR", {
                maximumFractionDigits: 1,
              }).format(percent)}
              ٪
            </div>
          ) : (
            <InfinityIcon className="size-6 text-muted-foreground" />
          )}
        </div>
        {percent !== null ? (
          <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-[var(--app-background)]">
            <div
              className={`h-full rounded-full transition-all ${danger ? "bg-red-500" : warning ? "bg-amber-500" : "bg-[var(--app-primary)]"}`}
              style={{ width: `${percent}%` }}
            />
          </div>
        ) : null}
      </div>
      <footer className="grid grid-cols-2 gap-2 border-t border-[var(--app-divider)] pt-3 text-xs text-muted-foreground">
        <div>
          حد هشدار:{" "}
          <b className="text-[var(--app-heading)]">
            {item.softLimit ? display(item.metric, item.softLimit) : "—"}
          </b>
        </div>
        <div className="text-end">
          دوره:{" "}
          <b className="text-[var(--app-heading)]">
            {periodLabel[item.resetPeriod]}
          </b>
        </div>
        {item.resetAt ? (
          <div className="col-span-2 flex items-center gap-1">
            <CalendarClock className="size-3.5" />
            بازنشانی در {date(item.resetAt)}
          </div>
        ) : null}
      </footer>
    </article>
  )
}

export function AccountUsagePage() {
  const organizationId = useAuthStore((s) => s.user?.organizationId ?? null)
  const query = useQuery({
    queryKey: ["account-usage", organizationId],
    queryFn: getCurrentUsage,
    enabled: Boolean(organizationId),
    refetchInterval: 60_000,
  })
  const metrics = query.data?.metrics ?? []
  const limited = metrics.filter((i) => ratio(i) !== null)
  const nearLimit = limited.filter((i) => (ratio(i) ?? 0) >= 80)
  const unlimited = metrics.filter(
    (i) =>
      i.state === "UNLIMITED" ||
      i.state === "LEGACY_COMPATIBILITY" ||
      i.hardLimit == null
  )
  const inventoryItems = metrics.filter((i) => inventory.has(i.metric))
  const eventItems = metrics.filter((i) => !inventory.has(i.metric))
  if (!organizationId)
    return (
      <div className="rounded-2xl border border-blue-200 bg-blue-50 p-6 text-sm text-blue-800">
        برای مشاهده مصرف، ابتدا باید یک سازمان فعال انتخاب شده باشد.
      </div>
    )
  return (
    <div className="grid gap-5" dir="rtl">
      <PageHero
        title="مصرف و سهمیه"
        eyebrow="ظرفیت سازمان"
        icon={Gauge}
        description="مصرف منابع سازمان و محدودیت‌های مؤثر پلن را به‌صورت لحظه‌ای بررسی کنید."
        onRefresh={() => query.refetch()}
        refreshing={query.isFetching}
      />
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="شاخص‌های اندازه‌گیری"
          value={new Intl.NumberFormat("fa-IR").format(metrics.length)}
          helper={`آخرین محاسبه: ${date(query.data?.generatedAt)}`}
          icon={Gauge}
        />
        <MetricCard
          label="سهمیه‌های محدود"
          value={new Intl.NumberFormat("fa-IR").format(limited.length)}
          helper="دارای سقف مصرف مشخص"
          icon={Database}
          tone="info"
        />
        <MetricCard
          label="ظرفیت‌های نامحدود"
          value={new Intl.NumberFormat("fa-IR").format(unlimited.length)}
          helper="بدون سقف سخت"
          icon={InfinityIcon}
          tone="success"
        />
        <MetricCard
          label="نزدیک به سقف"
          value={new Intl.NumberFormat("fa-IR").format(nearLimit.length)}
          helper="مصرف بیشتر از ۸۰ درصد"
          icon={AlertTriangle}
          tone={nearLimit.length ? "warning" : "neutral"}
        />
      </section>
      {query.isError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {getApiErrorMessage(
            query.error,
            "دریافت اطلاعات مصرف و سهمیه انجام نشد."
          )}
          <Button
            size="sm"
            variant="outline"
            className="me-3"
            onClick={() => void query.refetch()}
          >
            تلاش مجدد
          </Button>
        </div>
      ) : null}
      {nearLimit.length ? (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-7 text-amber-800">
          <AlertTriangle className="mt-1 size-5 shrink-0" />
          <div>
            <b>توجه به ظرفیت مصرف</b>
            <p>
              {nearLimit.map((i) => info[i.metric].label).join("، ")} به بیش از
              ۸۰ درصد سقف مجاز رسیده است.
            </p>
          </div>
        </div>
      ) : null}
      {!query.isError ? (
        <>
          <section className="grid gap-3">
            <div>
              <h2 className="text-lg font-black">منابع سازمان</h2>
              <p className="text-xs text-muted-foreground">
                موجودی فعلی داده‌ها و فضای ذخیره‌سازی
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
              {inventoryItems.map((item) => (
                <UsageCard key={item.metric} item={item} />
              ))}
            </div>
          </section>
          <section className="grid gap-3">
            <div>
              <h2 className="text-lg font-black">مصرف دوره‌ای</h2>
              <p className="text-xs text-muted-foreground">
                عملیات‌هایی که در بازه‌های زمانی بازنشانی می‌شوند
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
              {eventItems.map((item) => (
                <UsageCard key={item.metric} item={item} />
              ))}
            </div>
          </section>
          {!query.isLoading && !metrics.length ? (
            <div className="rounded-2xl border border-dashed p-10 text-center text-sm text-muted-foreground">
              برای این سازمان سهمیه‌ای گزارش نشده است.
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  )
}
