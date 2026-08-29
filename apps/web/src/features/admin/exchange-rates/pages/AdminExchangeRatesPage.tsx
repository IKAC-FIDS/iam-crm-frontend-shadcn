import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  ArrowDownRight,
  ArrowUpRight,
  Banknote,
  CalendarClock,
  CircleDollarSign,
  History,
  RefreshCcw,
  UserRound,
} from "lucide-react"
import { useMemo, useState } from "react"
import { useForm, useWatch } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import {
  DataTableShell,
  type DataTableColumn,
} from "@/components/shared/DataTableShell"
import { EmptyState } from "@/components/shared/EmptyState"
import { EntityListPage } from "@/components/shared/EntityListPage"
import { FormActions } from "@/components/shared/FormActions"
import { FormSection } from "@/components/shared/FormSection"
import { MetricCard } from "@/components/shared/MetricCard"
import { PageHero } from "@/components/shared/PageHero"
import { QueryContent } from "@/components/shared/QueryContent"
import { ResponsiveModal } from "@/components/shared/ResponsiveModal"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { SurfaceCard } from "@/components/shared/SurfaceCard"
import { applyServerFieldErrors } from "@/lib/formErrors"
import { getApiErrorMessage } from "@/lib/apiResponse"
import { useAuthStore } from "@/store/authStore"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"

import {
  createExchangeRate,
  getCurrentExchangeRate,
  getExchangeRates,
  type ExchangeRate,
} from "../api/adminExchangeRatesApi"

const rateSchema = z.object({
  rate: z
    .string()
    .trim()
    .min(1, "نرخ دلار الزامی است.")
    .refine(
      (value) => Number(value.replace(/,/g, "")) > 0,
      "نرخ دلار باید عددی بزرگ‌تر از صفر باشد."
    ),
  effectiveFrom: z.string().refine((value) => {
    if (!value) return true
    const date = new Date(value)
    return !Number.isNaN(date.getTime()) && date.getTime() <= Date.now()
  }, "تاریخ شروع اعتبار معتبر نیست یا در آینده است."),
  note: z.string().max(500, "توضیحات حداکثر ۵۰۰ کاراکتر است."),
})
type RateFormValues = z.infer<typeof rateSchema>

function toNumber(value: string | number | null | undefined) {
  const parsed = Number(String(value ?? 0).replace(/,/g, ""))
  return Number.isFinite(parsed) ? parsed : 0
}
function faNumber(value: number, digits = 0) {
  return new Intl.NumberFormat("fa-IR", {
    maximumFractionDigits: digits,
  }).format(value)
}
function formatIrr(value: string | number | null | undefined) {
  return `${faNumber(toNumber(value))} ریال`
}
function formatToman(value: string | number | null | undefined) {
  return `${faNumber(toNumber(value) / 10)} تومان`
}
function formatDateTime(value?: string | null) {
  if (!value) return "—"
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? "—"
    : new Intl.DateTimeFormat("fa-IR", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(date)
}
function percentChange(current: number, previous: number) {
  return previous ? ((current - previous) / previous) * 100 : null
}
function Change({ value }: { value: number | null }) {
  if (value == null)
    return <span className="text-xs text-muted-foreground">—</span>
  const rising = value >= 0
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-bold ${rising ? "text-rose-600" : "text-emerald-600"}`}
    >
      {rising ? (
        <ArrowUpRight className="size-4" />
      ) : (
        <ArrowDownRight className="size-4" />
      )}
      {rising ? "+" : ""}
      {faNumber(value, 2)}٪
    </span>
  )
}

export function AdminExchangeRatesPage() {
  const permissions = useAuthStore((state) => state.user?.permissions ?? [])
  const canManage = permissions.includes("exchange-rate:manage")
  const client = useQueryClient()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [createOpen, setCreateOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const currentQuery = useQuery({
    queryKey: ["exchange-rate-current"],
    queryFn: getCurrentExchangeRate,
  })
  const historyQuery = useQuery({
    queryKey: ["exchange-rate-history", page, pageSize],
    queryFn: () => getExchangeRates(page, pageSize),
  })
  const form = useForm<RateFormValues>({
    resolver: zodResolver(rateSchema),
    defaultValues: { rate: "", effectiveFrom: "", note: "" },
  })
  const values = useWatch({ control: form.control })
  const previewValue = toNumber(values.rate)
  const currentValue = toNumber(currentQuery.data?.rate)
  const previousRate = useMemo(() => {
    const rows = historyQuery.data?.data ?? []
    return (
      rows.find(
        (item) =>
          item.id !== currentQuery.data?.id && item.status === "HISTORICAL"
      ) ??
      rows.find((item) => item.id !== currentQuery.data?.id) ??
      null
    )
  }, [currentQuery.data?.id, historyQuery.data?.data])

  const mutation = useMutation({
    mutationFn: (payload: RateFormValues) =>
      createExchangeRate({
        rate: String(toNumber(payload.rate)),
        effectiveFrom: payload.effectiveFrom
          ? new Date(payload.effectiveFrom).toISOString()
          : undefined,
        note: payload.note.trim() || undefined,
      }),
    onSuccess: async (result) => {
      toast.success(
        `نرخ جدید ثبت شد و قیمت ${faNumber(result.recalculatedProductCount)} محصول باز‌محاسبه شد.`
      )
      form.reset()
      setConfirmOpen(false)
      setCreateOpen(false)
      setPage(1)
      await Promise.all([
        client.invalidateQueries({ queryKey: ["exchange-rate-current"] }),
        client.invalidateQueries({ queryKey: ["exchange-rate-history"] }),
      ])
    },
    onError: (error) => {
      applyServerFieldErrors(error, form.setError, [
        "rate",
        "effectiveFrom",
        "note",
      ])
      toast.error(getApiErrorMessage(error, "ثبت نرخ دلار انجام نشد."))
      setConfirmOpen(false)
    },
  })

  const rows = historyQuery.data?.data ?? []
  const columns: DataTableColumn<ExchangeRate>[] = [
    {
      id: "rate",
      header: "نرخ دلار",
      cell: (item) => (
        <div>
          <b>{formatIrr(item.rate)}</b>
          <div className="text-xs text-muted-foreground">
            {formatToman(item.rate)}
          </div>
        </div>
      ),
    },
    {
      id: "change",
      header: "تغییر",
      cell: (item) => {
        const index = rows.findIndex((row) => row.id === item.id)
        const older = rows[index + 1]
        return (
          <Change
            value={
              older
                ? percentChange(toNumber(item.rate), toNumber(older.rate))
                : null
            }
          />
        )
      },
    },
    {
      id: "validFrom",
      header: "شروع اعتبار",
      cell: (item) => formatDateTime(item.validFrom),
    },
    {
      id: "validTo",
      header: "پایان اعتبار",
      cell: (item) => (item.validTo ? formatDateTime(item.validTo) : "تاکنون"),
    },
    {
      id: "creator",
      header: "ثبت‌کننده",
      cell: (item) => item.createdBy?.fullName || "—",
    },
    {
      id: "status",
      header: "وضعیت",
      cell: (item) => (
        <StatusBadge tone={item.status === "ACTIVE" ? "success" : "neutral"}>
          {item.status === "ACTIVE" ? "فعال" : "تاریخی"}
        </StatusBadge>
      ),
    },
    {
      id: "note",
      header: "توضیحات",
      cell: (item) => (
        <span className="line-clamp-2 max-w-64 whitespace-normal">
          {item.note || "—"}
        </span>
      ),
    },
  ]

  const refresh = () =>
    Promise.all([currentQuery.refetch(), historyQuery.refetch()])
  return (
    <EntityListPage>
      <PageHero
        title="نرخ دلار"
        eyebrow="مرکز مدیریت نرخ ارز"
        icon={CircleDollarSign}
        description="نرخ مبنای تبدیل قیمت محصولات دلاری به ریال و تاریخچه تغییرات آن"
        actions={
          <Button variant="outline" onClick={() => void refresh()}>
            <RefreshCcw className="size-4" />
            به‌روزرسانی
          </Button>
        }
        primaryAction={
          canManage
            ? {
                label: "ثبت نرخ جدید",
                icon: CircleDollarSign,
                onClick: () => setCreateOpen(true),
              }
            : undefined
        }
      />

      <QueryContent
        query={currentQuery}
        errorTitle="خطا در دریافت نرخ فعلی دلار"
      >
        {currentQuery.data ? (
          <div className="grid gap-4 xl:grid-cols-[1.4fr_.8fr_.8fr]">
            <SurfaceCard className="relative overflow-hidden p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Banknote className="size-5 text-[var(--app-primary)]" />
                  نرخ فعال
                </span>
                <StatusBadge tone="success">فعال</StatusBadge>
              </div>
              <div className="mt-6 flex flex-wrap items-baseline gap-2">
                <span>۱ دلار =</span>
                <strong className="text-4xl sm:text-5xl">
                  {faNumber(currentValue)}
                </strong>
                <span>ریال</span>
              </div>
              <div className="mt-2 font-bold text-[var(--app-primary)]">
                معادل {formatToman(currentValue)}
              </div>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <Change
                  value={percentChange(
                    currentValue,
                    toNumber(previousRate?.rate)
                  )}
                />
                {previousRate ? (
                  <span className="text-xs text-muted-foreground">
                    نرخ قبلی: {formatIrr(previousRate.rate)}
                  </span>
                ) : null}
              </div>
            </SurfaceCard>
            <MetricCard
              label="شروع اعتبار"
              value={formatDateTime(currentQuery.data.validFrom)}
              helper="تا زمان ثبت نرخ جدید"
              icon={CalendarClock}
              tone="info"
            />
            <MetricCard
              label="ثبت‌کننده"
              value={currentQuery.data.createdBy?.fullName || "—"}
              helper={
                currentQuery.data.note ||
                currentQuery.data.createdBy?.email ||
                "بدون توضیح"
              }
              icon={UserRound}
              tone="neutral"
            />
          </div>
        ) : (
          <EmptyState
            title="هنوز نرخ فعال دلار ثبت نشده است"
            description="برای محاسبه قیمت محصولات دلاری، اولین نرخ را ثبت کنید."
            action={
              canManage ? (
                <Button onClick={() => setCreateOpen(true)}>
                  ثبت اولین نرخ
                </Button>
              ) : undefined
            }
          />
        )}
      </QueryContent>

      <FormSection
        title="تاریخچه نرخ دلار"
        description="آخرین نرخ‌ها در ابتدای فهرست قرار دارند."
        actions={<History className="size-5 text-[var(--app-primary)]" />}
      >
        <QueryContent
          query={historyQuery}
          errorTitle="خطا در دریافت تاریخچه نرخ دلار"
        >
          <DataTableShell
            rows={rows}
            columns={columns}
            getRowKey={(item) => item.id}
            emptyState={
              <EmptyState
                title="سابقه‌ای ثبت نشده است"
                description="نرخ‌های ثبت‌شده در این بخش نمایش داده می‌شوند."
              />
            }
            pagination={{
              page: historyQuery.data?.meta.page ?? page,
              pageCount: historyQuery.data?.meta.totalPages ?? 1,
              pageSize,
              total: historyQuery.data?.meta.total,
              onPageChange: setPage,
              onPageSizeChange: (size) => {
                setPageSize(size)
                setPage(1)
              },
              disabled: historyQuery.isFetching,
            }}
            mobile={{
              title: (item) => formatIrr(item.rate),
              subtitle: (item) => formatToman(item.rate),
              avatar: () => <Banknote className="size-5" />,
              status: (item) => (
                <StatusBadge
                  tone={item.status === "ACTIVE" ? "success" : "neutral"}
                >
                  {item.status === "ACTIVE" ? "فعال" : "تاریخی"}
                </StatusBadge>
              ),
              fields: [
                {
                  id: "from",
                  label: "شروع اعتبار",
                  render: (item) => formatDateTime(item.validFrom),
                },
                {
                  id: "to",
                  label: "پایان اعتبار",
                  render: (item) =>
                    item.validTo ? formatDateTime(item.validTo) : "تاکنون",
                },
                {
                  id: "creator",
                  label: "ثبت‌کننده",
                  render: (item) => item.createdBy?.fullName || "—",
                },
                {
                  id: "note",
                  label: "توضیحات",
                  render: (item) => item.note || "—",
                },
              ],
            }}
          />
        </QueryContent>
      </FormSection>

      <ResponsiveModal
        open={createOpen}
        onClose={() => !mutation.isPending && setCreateOpen(false)}
        title="ثبت نرخ جدید دلار"
        description="نرخ جدید مبنای قیمت ریالی محصولات دلاری خواهد بود."
        icon={CircleDollarSign}
      >
        <form
          className="grid gap-4"
          noValidate
          onSubmit={form.handleSubmit(() => setConfirmOpen(true))}
        >
          <label className="grid gap-2 text-sm font-bold">
            هر ۱ دلار چند ریال است؟
            <Input
              {...form.register("rate")}
              inputMode="decimal"
              dir="ltr"
              placeholder="1050000"
              aria-invalid={Boolean(form.formState.errors.rate)}
            />
            {form.formState.errors.rate ? (
              <span role="alert" className="text-xs text-destructive">
                {form.formState.errors.rate.message}
              </span>
            ) : null}
          </label>
          <label className="grid gap-2 text-sm font-bold">
            شروع اعتبار
            <Input {...form.register("effectiveFrom")} type="datetime-local" />
            {form.formState.errors.effectiveFrom ? (
              <span role="alert" className="text-xs text-destructive">
                {form.formState.errors.effectiveFrom.message}
              </span>
            ) : null}
          </label>
          <label className="grid gap-2 text-sm font-bold">
            توضیحات
            <textarea
              {...form.register("note")}
              className="min-h-24 rounded-xl border border-input bg-background p-3 text-sm"
              placeholder="دلیل تغییر نرخ..."
            />
            <span className="text-end text-xs text-muted-foreground">
              {faNumber(values.note?.length ?? 0)} / ۵۰۰
            </span>
            {form.formState.errors.note ? (
              <span role="alert" className="text-xs text-destructive">
                {form.formState.errors.note.message}
              </span>
            ) : null}
          </label>
          {previewValue > 0 ? (
            <SurfaceCard className="grid gap-2 p-4 text-sm sm:grid-cols-3">
              <span>
                نرخ فعلی: <b>{formatIrr(currentValue)}</b>
              </span>
              <span>
                نرخ جدید: <b>{formatIrr(previewValue)}</b>
              </span>
              <span>
                تغییر:{" "}
                <Change value={percentChange(previewValue, currentValue)} />
              </span>
            </SurfaceCard>
          ) : null}
          {form.formState.errors.root?.server ? (
            <p role="alert" className="text-sm text-destructive">
              {form.formState.errors.root.server.message}
            </p>
          ) : null}
          <FormActions
            onCancel={() => setCreateOpen(false)}
            pending={mutation.isPending}
            submitLabel="ادامه و بررسی اثر"
            disabled={!previewValue}
          />
        </form>
      </ResponsiveModal>

      <ResponsiveModal
        open={confirmOpen}
        onClose={() => !mutation.isPending && setConfirmOpen(false)}
        title="تأیید ثبت نرخ جدید"
        description="این عملیات روی قیمت محصولات دلاری اثر مستقیم دارد."
      >
        <div className="grid gap-4">
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm leading-8">
            با ثبت نرخ جدید، نرخ فعلی تاریخی و قیمت ریالی محصولات دلاری دوباره
            محاسبه می‌شود. اسناد قبلی تغییر نمی‌کنند.
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <MetricCard
              label="نرخ فعلی"
              value={currentValue ? formatIrr(currentValue) : "بدون نرخ فعلی"}
              icon={Banknote}
            />
            <MetricCard
              label="نرخ جدید"
              value={formatIrr(previewValue)}
              icon={CircleDollarSign}
              tone="warning"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setConfirmOpen(false)}
              disabled={mutation.isPending}
            >
              بازگشت
            </Button>
            <Button
              onClick={form.handleSubmit((payload) => mutation.mutate(payload))}
              disabled={mutation.isPending}
            >
              تأیید و ثبت نرخ
            </Button>
          </div>
        </div>
      </ResponsiveModal>
    </EntityListPage>
  )
}
