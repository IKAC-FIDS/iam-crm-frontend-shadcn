import {
  ArrowDownRight,
  ArrowUpRight,
  Banknote,
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  History,
  RefreshCcw,
  Sparkles,
  UserRound,
} from "lucide-react"
import { useMemo, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { getApiErrorMessage } from "@/lib/apiResponse"
import { useAuthStore } from "@/store/authStore"
import { ResponsiveModal as Modal } from "@/components/shared/ResponsiveModal"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"

import {
  createExchangeRate,
  getCurrentExchangeRate,
  getExchangeRates,
} from "../api/adminExchangeRatesApi"

function can(permissions: string[] | undefined, permission: string) {
  return Boolean(permissions?.includes(permission))
}

function toNumber(value: string | number | null | undefined) {
  if (value == null) return 0
  const parsed = Number(String(value).replace(/,/g, ""))
  return Number.isFinite(parsed) ? parsed : 0
}

function faNumber(value: number, maximumFractionDigits = 0) {
  return new Intl.NumberFormat("fa-IR", {
    maximumFractionDigits,
  }).format(value)
}

function formatIrr(value: string | number | null | undefined) {
  return `${faNumber(toNumber(value), 0)} ریال`
}

function formatToman(value: string | number | null | undefined) {
  return `${faNumber(toNumber(value) / 10, 0)} تومان`
}

function formatDateTime(value?: string | null) {
  if (!value) return "—"

  try {
    return new Intl.DateTimeFormat("fa-IR", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value))
  } catch {
    return "—"
  }
}

function percentChange(current: number, previous: number) {
  if (!previous) return null
  return ((current - previous) / previous) * 100
}

function toApiDateTime(localValue: string) {
  if (!localValue) return undefined

  const date = new Date(localValue)
  if (Number.isNaN(date.getTime())) return undefined
  return date.toISOString()
}

function RateChangeBadge({
  current,
  previous,
}: {
  current: number
  previous: number
}) {
  const change = percentChange(current, previous)

  if (change == null) {
    return (
      <span className="rounded-full bg-muted px-3 py-1.5 text-xs font-bold text-muted-foreground">
        نرخ قبلی موجود نیست
      </span>
    )
  }

  const rising = change >= 0

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold ${
        rising
          ? "bg-rose-500/10 text-rose-700 dark:text-rose-300"
          : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
      }`}
    >
      {rising ? (
        <ArrowUpRight className="size-4" />
      ) : (
        <ArrowDownRight className="size-4" />
      )}
      {rising ? "افزایش" : "کاهش"} {faNumber(Math.abs(change), 2)}٪
    </span>
  )
}

export function AdminExchangeRatesPage() {
  const currentUser = useAuthStore((state) => state.user)
  const permissions = currentUser?.permissions ?? []
  const canManage = can(permissions, "exchange-rate:manage")
  const queryClient = useQueryClient()

  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [createOpen, setCreateOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [rateInput, setRateInput] = useState("")
  const [effectiveFrom, setEffectiveFrom] = useState("")
  const [note, setNote] = useState("")

  const currentQuery = useQuery({
    queryKey: ["exchange-rate-current"],
    queryFn: getCurrentExchangeRate,
  })

  const historyQuery = useQuery({
    queryKey: ["exchange-rate-history", page, pageSize],
    queryFn: () => getExchangeRates(page, pageSize),
  })

  const previousRate = useMemo(() => {
    const rows = historyQuery.data?.data ?? []
    const activeId = currentQuery.data?.id

    return (
      rows.find(
        (item) => item.id !== activeId && item.status === "HISTORICAL"
      ) ??
      rows.find((item) => item.id !== activeId) ??
      null
    )
  }, [historyQuery.data?.data, currentQuery.data?.id])

  const currentValue = toNumber(currentQuery.data?.rate)
  const previousValue = toNumber(previousRate?.rate)
  const previewValue = toNumber(rateInput)
  const previewChange = percentChange(previewValue, currentValue)

  const createMutation = useMutation({
    mutationFn: () =>
      createExchangeRate({
        rate: String(previewValue),
        effectiveFrom: toApiDateTime(effectiveFrom),
        note: note.trim() || undefined,
      }),
    onSuccess: async (result) => {
      toast.success(
        `نرخ جدید ثبت شد و قیمت ${faNumber(
          result.recalculatedProductCount
        )} محصول دلاری مجدداً محاسبه شد.`
      )

      setRateInput("")
      setEffectiveFrom("")
      setNote("")
      setConfirmOpen(false)
      setCreateOpen(false)
      setPage(1)

      await queryClient.invalidateQueries({
        queryKey: ["exchange-rate-current"],
      })
      await queryClient.invalidateQueries({
        queryKey: ["exchange-rate-history"],
      })
    },
    onError: (error) =>
      toast.error(getApiErrorMessage(error, "ثبت نرخ دلار انجام نشد.")),
  })

  const refresh = async () => {
    await queryClient.invalidateQueries({
      queryKey: ["exchange-rate-current"],
    })
    await queryClient.invalidateQueries({
      queryKey: ["exchange-rate-history"],
    })
  }

  const openCreate = () => {
    setCreateOpen(true)
    setConfirmOpen(false)
  }

  const validateAndConfirm = () => {
    if (!previewValue || previewValue <= 0) {
      toast.error("نرخ دلار باید عددی بزرگ‌تر از صفر باشد.")
      return
    }

    if (effectiveFrom) {
      const parsed = new Date(effectiveFrom)

      if (Number.isNaN(parsed.getTime())) {
        toast.error("تاریخ شروع اعتبار معتبر نیست.")
        return
      }

      if (parsed.getTime() > Date.now()) {
        toast.error("تاریخ شروع اعتبار نمی‌تواند در آینده باشد.")
        return
      }
    }

    setConfirmOpen(true)
  }

  return (
    <div className="grid gap-5" dir="rtl">
      <section className="relative overflow-hidden rounded-[30px] border border-[var(--app-divider)] bg-[var(--app-surface)] px-5 py-6 shadow-[var(--app-shadow-card)] sm:px-7">
        <div className="pointer-events-none absolute -end-16 -top-20 size-64 rounded-full bg-[var(--app-primary-soft)] blur-3xl" />

        <div className="relative flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className="ui-eyebrow mb-3 inline-flex items-center gap-2">
              <Sparkles className="size-4" />
              مرکز مدیریت نرخ ارز
            </div>

            <h1 className="ui-page-title">نرخ دلار</h1>

            <p className="mt-2 max-w-3xl text-sm leading-7 text-muted-foreground">
              نرخ مبنای تبدیل قیمت محصولات دلاری به ریال و تاریخچه تغییرات آن
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => void refresh()}>
              <RefreshCcw className="ms-2 size-4" />
              به‌روزرسانی
            </Button>

            {canManage ? (
              <Button onClick={openCreate}>
                <CircleDollarSign className="ms-2 size-4" />
                ثبت نرخ جدید
              </Button>
            ) : null}
          </div>
        </div>
      </section>

      {currentQuery.isLoading ? (
        <section className="grid min-h-56 place-items-center rounded-[28px] border border-[var(--app-divider)] bg-[var(--app-surface)] text-sm text-muted-foreground">
          در حال دریافت نرخ فعلی...
        </section>
      ) : currentQuery.isError ? (
        <section className="rounded-[28px] border border-[var(--app-divider)] bg-[var(--app-surface)] p-6 text-center">
          <p className="font-bold text-red-600">خطا در دریافت نرخ فعلی دلار</p>
          <Button
            className="mt-3"
            variant="outline"
            onClick={() => void currentQuery.refetch()}
          >
            تلاش مجدد
          </Button>
        </section>
      ) : currentQuery.data ? (
        <section className="grid gap-4 xl:grid-cols-[1.4fr_.8fr_.8fr]">
          <article className="relative overflow-hidden rounded-[30px] border border-[var(--app-divider)] bg-[var(--app-surface)] p-6 shadow-[var(--app-shadow-card)]">
            <div className="absolute -start-20 -bottom-20 size-52 rounded-full bg-[var(--app-primary-soft)] blur-3xl" />

            <div className="relative">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Banknote className="size-5 text-[var(--app-primary)]" />
                  نرخ فعال
                </div>

                <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                  فعال
                </span>
              </div>

              <div className="mt-6 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="text-sm text-muted-foreground">۱ دلار =</span>
                <span className="text-4xl font-black tracking-tight sm:text-5xl">
                  {faNumber(currentValue)}
                </span>
                <span className="font-bold text-muted-foreground">ریال</span>
              </div>

              <div className="mt-3 text-lg font-bold text-[var(--app-primary)]">
                معادل {formatToman(currentValue)}
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <RateChangeBadge
                  current={currentValue}
                  previous={previousValue}
                />

                {previousRate ? (
                  <span className="text-xs text-muted-foreground">
                    نرخ قبلی: {formatIrr(previousRate.rate)}
                  </span>
                ) : null}
              </div>
            </div>
          </article>

          <article className="rounded-[26px] border border-[var(--app-divider)] bg-[var(--app-surface)] p-5 shadow-[var(--app-shadow-card)]">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CalendarClock className="size-5 text-[var(--app-primary)]" />
              شروع اعتبار
            </div>
            <div className="mt-4 font-black">
              {formatDateTime(currentQuery.data.validFrom)}
            </div>
            <div className="mt-4 rounded-2xl bg-muted/35 p-3 text-xs leading-6 text-muted-foreground">
              این نرخ تا زمان ثبت نرخ جدید معتبر باقی می‌ماند.
            </div>
          </article>

          <article className="rounded-[26px] border border-[var(--app-divider)] bg-[var(--app-surface)] p-5 shadow-[var(--app-shadow-card)]">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <UserRound className="size-5 text-[var(--app-primary)]" />
              ثبت‌کننده
            </div>
            <div className="mt-4 font-black">
              {currentQuery.data.createdBy?.fullName || "—"}
            </div>
            <div className="mt-1 text-xs text-muted-foreground" dir="ltr">
              {currentQuery.data.createdBy?.email || ""}
            </div>
            <div className="mt-4 rounded-2xl bg-muted/35 p-3 text-xs leading-6 text-muted-foreground">
              {currentQuery.data.note || "برای این نرخ توضیحی ثبت نشده است."}
            </div>
          </article>
        </section>
      ) : (
        <section className="rounded-[28px] border border-dashed border-[var(--app-divider)] bg-[var(--app-surface)] p-8 text-center">
          <CircleDollarSign className="mx-auto size-8 text-muted-foreground" />
          <h2 className="mt-3 font-black">هنوز نرخ فعال دلار ثبت نشده است</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            برای شروع محاسبه قیمت محصولات دلاری، اولین نرخ را ثبت کنید.
          </p>
          {canManage ? (
            <Button className="mt-4" onClick={openCreate}>
              ثبت اولین نرخ
            </Button>
          ) : null}
        </section>
      )}

      <section className="overflow-hidden rounded-[26px] border border-[var(--app-divider)] bg-[var(--app-surface)] shadow-[var(--app-shadow-card)]">
        <div className="flex flex-col gap-3 border-b border-[var(--app-divider)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <History className="size-5 text-[var(--app-primary)]" />
              <h2 className="font-black">تاریخچه نرخ دلار</h2>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              آخرین نرخ‌ها در ابتدای فهرست قرار دارند.
            </p>
          </div>

          <select
            value={pageSize}
            onChange={(event) => {
              setPageSize(Number(event.target.value))
              setPage(1)
            }}
            className="h-9 rounded-xl border border-input bg-background px-3 text-xs"
          >
            <option value={10}>۱۰ رکورد</option>
            <option value={20}>۲۰ رکورد</option>
            <option value={50}>۵۰ رکورد</option>
            <option value={100}>۱۰۰ رکورد</option>
          </select>
        </div>

        {historyQuery.isLoading ? (
          <div className="grid min-h-64 place-items-center text-sm text-muted-foreground">
            در حال دریافت تاریخچه...
          </div>
        ) : historyQuery.isError ? (
          <div className="p-8 text-center">
            <p className="font-bold text-red-600">
              خطا در دریافت تاریخچه نرخ دلار
            </p>
            <Button
              className="mt-3"
              variant="outline"
              onClick={() => void historyQuery.refetch()}
            >
              تلاش مجدد
            </Button>
          </div>
        ) : !(historyQuery.data?.data.length ?? 0) ? (
          <div className="grid min-h-64 place-items-center text-sm text-muted-foreground">
            سابقه‌ای برای نرخ دلار ثبت نشده است.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px] text-sm">
              <thead className="bg-muted/45 text-xs text-muted-foreground">
                <tr>
                  <th className="px-5 py-3 text-right">نرخ دلار</th>
                  <th className="px-4 py-3 text-right">تغییر</th>
                  <th className="px-4 py-3 text-right">شروع اعتبار</th>
                  <th className="px-4 py-3 text-right">پایان اعتبار</th>
                  <th className="px-4 py-3 text-right">ثبت‌کننده</th>
                  <th className="px-4 py-3 text-right">وضعیت</th>
                  <th className="px-4 py-3 text-right">توضیحات</th>
                </tr>
              </thead>

              <tbody>
                {historyQuery.data?.data.map((item, index, rows) => {
                  const older = rows[index + 1]
                  const change = older
                    ? percentChange(toNumber(item.rate), toNumber(older.rate))
                    : null

                  return (
                    <tr
                      key={item.id}
                      className="border-t border-[var(--app-divider)] hover:bg-muted/25"
                    >
                      <td className="px-5 py-4">
                        <div className="font-black">{formatIrr(item.rate)}</div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          {formatToman(item.rate)}
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        {change == null ? (
                          <span className="text-xs text-muted-foreground">
                            —
                          </span>
                        ) : (
                          <span
                            className={`text-xs font-bold ${
                              change >= 0 ? "text-rose-600" : "text-emerald-600"
                            }`}
                          >
                            {change >= 0 ? "+" : ""}
                            {faNumber(change, 2)}٪
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-4 text-xs">
                        {formatDateTime(item.validFrom)}
                      </td>

                      <td className="px-4 py-4 text-xs">
                        {item.validTo ? formatDateTime(item.validTo) : "تاکنون"}
                      </td>

                      <td className="px-4 py-4">
                        {item.createdBy?.fullName || "—"}
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                            item.status === "ACTIVE"
                              ? "bg-emerald-500/10 text-emerald-700"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {item.status === "ACTIVE" ? "فعال" : "تاریخی"}
                        </span>
                      </td>

                      <td className="max-w-[280px] px-4 py-4 text-xs leading-6 text-muted-foreground">
                        <span className="line-clamp-2">{item.note || "—"}</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex items-center justify-between border-t border-[var(--app-divider)] px-5 py-4">
          <Button
            variant="outline"
            size="sm"
            disabled={!historyQuery.data?.meta.hasPrevious}
            onClick={() => setPage((value) => Math.max(1, value - 1))}
          >
            <ChevronRight className="ms-1 size-4" />
            قبلی
          </Button>

          <span className="text-xs text-muted-foreground">
            صفحه {faNumber(historyQuery.data?.meta.page ?? page)} از{" "}
            {faNumber(Math.max(1, historyQuery.data?.meta.totalPages ?? 1))}
          </span>

          <Button
            variant="outline"
            size="sm"
            disabled={!historyQuery.data?.meta.hasNext}
            onClick={() => setPage((value) => value + 1)}
          >
            بعدی
            <ChevronLeft className="me-1 size-4" />
          </Button>
        </div>
      </section>

      <Modal
        open={createOpen}
        onClose={() => {
          if (!createMutation.isPending) setCreateOpen(false)
        }}
        title="ثبت نرخ جدید دلار"
        description="نرخ جدید مبنای محاسبه قیمت ریالی محصولات دلاری خواهد بود."
      >
        <div className="grid gap-4">
          <div>
            <label className="mb-1.5 block text-xs font-bold text-muted-foreground">
              هر ۱ دلار چند ریال است؟
            </label>

            <Input
              value={rateInput}
              onChange={(event) =>
                setRateInput(event.target.value.replace(/[^\d.,]/g, ""))
              }
              inputMode="decimal"
              dir="ltr"
              placeholder="1050000"
            />

            {previewValue > 0 ? (
              <div className="mt-2 rounded-2xl bg-muted/35 p-3 text-sm">
                <div className="font-bold">{formatIrr(previewValue)}</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  معادل {formatToman(previewValue)}
                </div>
              </div>
            ) : null}
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold text-muted-foreground">
              تاریخ شروع اعتبار
            </label>

            <Input
              type="datetime-local"
              value={effectiveFrom}
              onChange={(event) => setEffectiveFrom(event.target.value)}
              dir="ltr"
            />

            <p className="mt-1.5 text-xs leading-6 text-muted-foreground">
              اگر خالی باشد، زمان فعلی به‌عنوان شروع اعتبار ثبت می‌شود.
            </p>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold text-muted-foreground">
              توضیحات
            </label>

            <textarea
              value={note}
              maxLength={500}
              onChange={(event) => setNote(event.target.value)}
              className="min-h-24 w-full rounded-xl border border-input bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-ring/20"
              placeholder="دلیل یا منبع تغییر نرخ..."
            />

            <div className="mt-1 text-left text-xs text-muted-foreground">
              {faNumber(note.length)} / ۵۰۰
            </div>
          </div>

          {previewValue > 0 && currentValue > 0 ? (
            <div className="rounded-2xl border border-[var(--app-divider)] bg-muted/25 p-4">
              <div className="text-xs font-bold text-muted-foreground">
                پیش‌نمایش اثر نرخ
              </div>

              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                <div>
                  <div className="text-xs text-muted-foreground">نرخ فعلی</div>
                  <div className="mt-1 font-bold">
                    {formatIrr(currentValue)}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-muted-foreground">نرخ جدید</div>
                  <div className="mt-1 font-bold">
                    {formatIrr(previewValue)}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-muted-foreground">
                    درصد تغییر
                  </div>
                  <div
                    className={`mt-1 font-black ${
                      (previewChange ?? 0) >= 0
                        ? "text-rose-600"
                        : "text-emerald-600"
                    }`}
                  >
                    {(previewChange ?? 0) >= 0 ? "+" : ""}
                    {faNumber(previewChange ?? 0, 2)}٪
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setCreateOpen(false)}
              disabled={createMutation.isPending}
            >
              انصراف
            </Button>

            <Button
              onClick={validateAndConfirm}
              disabled={!previewValue || createMutation.isPending}
            >
              ادامه و بررسی اثر
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={confirmOpen}
        onClose={() => {
          if (!createMutation.isPending) setConfirmOpen(false)
        }}
        title="تأیید ثبت نرخ جدید"
        description="این عملیات روی قیمت محصولات دلاری اثر مستقیم دارد."
      >
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm leading-8 text-amber-900 dark:text-amber-200">
          با ثبت نرخ جدید، بازه نرخ فعلی بسته می‌شود و قیمت ریالی تمام محصولات
          دلاری مجدداً محاسبه خواهد شد. قیمت فروش‌ها و اسناد قبلی تغییر نمی‌کند.
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl bg-muted/35 p-4">
            <div className="text-xs text-muted-foreground">نرخ فعلی</div>
            <div className="mt-1 font-black">
              {currentValue ? formatIrr(currentValue) : "بدون نرخ فعلی"}
            </div>
          </div>

          <div className="rounded-2xl bg-muted/35 p-4">
            <div className="text-xs text-muted-foreground">نرخ جدید</div>
            <div className="mt-1 font-black">{formatIrr(previewValue)}</div>
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => setConfirmOpen(false)}
            disabled={createMutation.isPending}
          >
            بازگشت
          </Button>

          <Button
            onClick={() => createMutation.mutate()}
            disabled={createMutation.isPending}
          >
            تأیید و ثبت نرخ
          </Button>
        </div>
      </Modal>
    </div>
  )
}
