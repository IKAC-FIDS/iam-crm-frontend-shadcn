import { EntityRowActions } from "@/components/shared/EntityRowActions"
import { EntityListPage } from "@/components/shared/EntityListPage"
import { useAuditQueries } from "../hooks/useAuditLogs"
import { useListQueryState } from "@/lib/listQuery"
import { QueryContent } from "@/components/shared/QueryContent"
import { EmptyState } from "@/components/shared/EmptyState"
import { DataTableToolbar } from "@/components/shared/DataTableToolbar"
import { useMemo, useState } from "react"
import { toast } from "sonner"
import {
  Activity,
  Braces,
  Clock3,
  Copy,
  Download,
  Filter,
  History,
  RefreshCcw,
  RotateCcw,
  ShieldCheck,
  UserRoundCheck,
} from "lucide-react"

import {
  DataTableShell,
  type DataTableColumn,
} from "@/components/shared/DataTableShell"
import { MetricCard } from "@/components/shared/MetricCard"
import { PageHero } from "@/components/shared/PageHero"
import { PaginationControls } from "@/components/shared/PaginationControls"
import { PersianDateRangePicker } from "@/components/shared/date"
import { ResponsiveModal } from "@/components/shared/ResponsiveModal"
import { getApiErrorMessage } from "@/lib/apiResponse"
import type { DateRangeValue } from "@/lib/date/jalali"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import {
  exportAuditLogs,
  type AuditLog,
  type AuditLogParams,
} from "../api/adminAuditLogsApi"

const fa = (value: number) => new Intl.NumberFormat("fa-IR").format(value)
const faDate = (value: string) =>
  new Intl.DateTimeFormat("fa-IR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))
const selectClass =
  "h-10 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/20"
const inputClass = "h-10 rounded-xl"
const ALL = "ALL"

type Filters = {
  search: string
  actorId: string
  entityType: string
  action: string
  method: string
  source: string
  result: string
  entityId: string
  requestId: string
  path: string
  ip: string
  dates?: DateRangeValue
}
const emptyFilters: Filters = {
  search: "",
  actorId: ALL,
  entityType: ALL,
  action: ALL,
  method: ALL,
  source: ALL,
  result: ALL,
  entityId: "",
  requestId: "",
  path: "",
  ip: "",
}

function filtersFromSearchParams(params: URLSearchParams): Filters {
  const value = (key: string) => params.get(key)?.trim() || ""
  const date = (key: string) => {
    const raw = value(key)
    const d = raw ? new Date(raw) : undefined
    return d && !Number.isNaN(d.getTime()) ? d : undefined
  }
  return {
    ...emptyFilters,
    method: value("method") || ALL,
    source: value("source") || ALL,
    result: value("result") || ALL,
    dates: { from: date("startDate"), to: date("endDate") },
    search: value("search"),
    actorId: value("actorId") || ALL,
    entityType: value("entityType") || ALL,
    action: value("action") || ALL,
    entityId: value("entityId"),
    requestId: value("requestId"),
    path: value("path"),
    ip: value("ip"),
  }
}

function toParams(filters: Filters): AuditLogParams {
  const value = (item: string) => (item && item !== ALL ? item : undefined)
  return {
    search: value(filters.search.trim()),
    actorId: value(filters.actorId),
    entityType: value(filters.entityType),
    action: value(filters.action),
    requestMethod: value(filters.method),
    source: value(filters.source),
    result: value(filters.result),
    entityId: value(filters.entityId.trim()),
    requestId: value(filters.requestId.trim()),
    requestPath: value(filters.path.trim()),
    ipAddress: value(filters.ip.trim()),
    startDate: filters.dates?.from?.toISOString(),
    endDate: filters.dates?.to?.toISOString(),
  }
}

function KeyValue({
  label,
  value,
  mono = false,
}: {
  label: string
  value?: string | number | null
  mono?: boolean
}) {
  return (
    <div className="rounded-2xl border border-[var(--app-divider)] bg-[var(--app-background)]/55 p-3">
      <div className="ui-caption">{label}</div>
      <div
        className={`mt-1 text-sm font-semibold break-all ${mono ? "text-left font-mono" : ""}`}
        dir={mono ? "ltr" : undefined}
      >
        {value ?? "—"}
      </div>
    </div>
  )
}
function JsonPanel({ title, value }: { title: string; value: unknown }) {
  const text = value == null ? "—" : JSON.stringify(value, null, 2)
  return (
    <section className="overflow-hidden rounded-2xl border border-[var(--app-divider)]">
      <header className="flex items-center justify-between bg-[var(--app-background)] px-4 py-2">
        <span className="text-sm font-bold">{title}</span>
        <Button
          size="icon"
          variant="ghost"
          className="size-8 rounded-lg"
          onClick={() => {
            void navigator.clipboard.writeText(text)
            toast.success("کپی شد.")
          }}
          aria-label={`کپی ${title}`}
        >
          <Copy className="size-4" />
        </Button>
      </header>
      <pre
        className="max-h-72 overflow-auto p-4 text-left font-mono text-xs leading-6"
        dir="ltr"
      >
        {text}
      </pre>
    </section>
  )
}

export function AdminAuditLogsPage() {
  const {
    params: searchParams,
    page,
    pageSize: limit,
    patch,
    setPage,
    setPageSize: setLimit,
  } = useListQueryState()
  const [draft, setDraft] = useState<Filters>(() =>
    filtersFromSearchParams(searchParams)
  )
  const filters = useMemo(
    () => filtersFromSearchParams(searchParams),
    [searchParams]
  )
  const [previousParams, setPreviousParams] = useState(searchParams)
  if (previousParams !== searchParams) {
    setPreviousParams(searchParams)
    setDraft(filters)
  }
  const [advanced, setAdvanced] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [exporting, setExporting] = useState(false)
  const [includePayload, setIncludePayload] = useState(false)
  const params = useMemo(() => toParams(filters), [filters])
  const { logs, summary, options, detail } = useAuditQueries(
    params,
    page,
    limit,
    selectedId
  )
  const apply = () =>
    patch({
      ...Object.fromEntries(
        Object.entries(draft)
          .filter(([key]) => key !== "dates")
          .map(([key, value]) => [
            key,
            value === ALL ? undefined : (value as string),
          ])
      ),
      startDate: draft.dates?.from?.toISOString(),
      endDate: draft.dates?.to?.toISOString(),
    })
  const reset = () => {
    setDraft(emptyFilters)
    patch(
      Object.fromEntries(
        [...Object.keys(emptyFilters), "startDate", "endDate"].map((key) => [
          key,
          undefined,
        ])
      )
    )
  }
  const refresh = () => {
    void logs.refetch()
    void summary.refetch()
    void options.refetch()
  }
  const doExport = async (format: "csv" | "xlsx" | "json") => {
    setExporting(true)
    try {
      await exportAuditLogs({ ...params, format, includePayload })
      toast.success("فایل خروجی آماده شد.")
    } catch (error) {
      toast.error(getApiErrorMessage(error, "دریافت خروجی انجام نشد."))
    } finally {
      setExporting(false)
    }
  }
  const topAction = summary.data?.byAction[0]
  const topEntity = summary.data?.byEntityType[0]

  const columns: DataTableColumn<AuditLog>[] = [
    {
      id: "date",
      header: "زمان",
      cell: (row) => (
        <span className="whitespace-nowrap">{faDate(row.createdAt)}</span>
      ),
    },
    {
      id: "actor",
      header: "انجام‌دهنده",
      cell: (row) => (
        <div>
          <div className="font-semibold">{row.actor?.fullName || "سیستم"}</div>
          <div className="text-xs text-muted-foreground">
            {row.actor?.email || row.actorType || "رویداد سیستمی"}
          </div>
        </div>
      ),
    },
    {
      id: "action",
      header: "عملیات",
      cell: (row) => (
        <Badge
          variant="secondary"
          className="font-mono text-[11px] whitespace-nowrap"
        >
          {row.action}
        </Badge>
      ),
    },
    {
      id: "entity",
      header: "موجودیت",
      cell: (row) => (
        <div>
          <div>{row.entityType}</div>
          <div
            className="max-w-40 truncate font-mono text-xs text-muted-foreground"
            dir="ltr"
          >
            {row.entityId || "—"}
          </div>
        </div>
      ),
    },
    {
      id: "request",
      header: "درخواست",
      cell: (row) => (
        <div className="max-w-52">
          <div className="flex items-center gap-2" dir="ltr">
            <Badge variant="outline">{row.request?.method || "—"}</Badge>
            <span className="truncate text-xs">{row.request?.path || "—"}</span>
          </div>
          <div
            className="mt-1 truncate font-mono text-[11px] text-muted-foreground"
            dir="ltr"
          >
            {row.request?.requestId || "—"}
          </div>
        </div>
      ),
    },
    {
      id: "result",
      header: "نتیجه",
      cell: (row) => (
        <div className="flex items-center gap-2">
          <span
            className={`size-2 rounded-full ${row.result === "FAILURE" ? "bg-red-500" : "bg-emerald-500"}`}
          />
          <span className="text-xs">
            {row.result === "FAILURE" ? "ناموفق" : "موفق"}
          </span>
          {row.durationMs != null ? (
            <span className="text-xs text-muted-foreground">
              {fa(row.durationMs)} ms
            </span>
          ) : null}
        </div>
      ),
    },
    {
      id: "actions",
      header: "عملیات",
      cell: (row) => <EntityRowActions onView={() => setSelectedId(row.id)} />,
    },
  ]

  return (
    <EntityListPage>
      <PageHero
        title="رویدادهای ممیزی"
        eyebrow="امنیت و انطباق"
        icon={ShieldCheck}
        description="ردیابی تغییرات، درخواست‌ها و فعالیت‌های کاربران سازمان در یک نمای قابل جست‌وجو و خروجی‌گیری."
        actions={
          <>
            <Button variant="outline" className="rounded-xl" onClick={refresh}>
              <RefreshCcw
                className={`size-4 ${logs.isFetching ? "animate-spin" : ""}`}
              />
              به‌روزرسانی
            </Button>
            <Button
              className="rounded-xl"
              disabled={exporting}
              onClick={() => void doExport("xlsx")}
            >
              <Download className="size-4" />
              خروجی اکسل
            </Button>
          </>
        }
      />
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="کل رویدادها"
          value={fa(summary.data?.totalEvents ?? logs.data?.meta?.total ?? 0)}
          helper="در بازه فیلترشده"
          icon={History}
        />
        <MetricCard
          label="کاربران یکتا"
          value={fa(summary.data?.uniqueActors ?? 0)}
          helper="انجام‌دهندگان رویداد"
          icon={UserRoundCheck}
          tone="info"
        />
        <MetricCard
          label="پرتکرارترین عملیات"
          value={topAction?.action || "—"}
          helper={topAction ? `${fa(topAction.count)} رویداد` : "بدون داده"}
          icon={Activity}
          tone="success"
        />
        <MetricCard
          label="پرتکرارترین موجودیت"
          value={topEntity?.entityType || "—"}
          helper={topEntity ? `${fa(topEntity.count)} رویداد` : "بدون داده"}
          icon={Braces}
          tone="warning"
        />
      </section>
      <section className="grid gap-3">
        <div
          onKeyDown={(event) => {
            if (
              event.key === "Enter" &&
              event.target instanceof HTMLInputElement
            ) {
              event.preventDefault()
              apply()
            }
          }}
        >
          <DataTableToolbar
            searchValue={draft.search}
            onSearchChange={(search) => setDraft({ ...draft, search })}
            searchPlaceholder="جست‌وجو در عملیات، موجودیت، مسیر یا شناسه..."
            filtersClassName="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4"
            filters={
              <>
                <select
                  aria-label="کاربر"
                  className={selectClass}
                  value={draft.actorId}
                  onChange={(e) =>
                    setDraft({ ...draft, actorId: e.target.value })
                  }
                >
                  <option value={ALL}>همه کاربران</option>
                  {options.data?.actors.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.fullName || item.email || item.id}
                    </option>
                  ))}
                </select>
                <select
                  aria-label="نوع موجودیت"
                  className={selectClass}
                  value={draft.entityType}
                  onChange={(e) =>
                    setDraft({ ...draft, entityType: e.target.value })
                  }
                >
                  <option value={ALL}>همه موجودیت‌ها</option>
                  {options.data?.entityTypes.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
                <select
                  aria-label="عملیات"
                  className={selectClass}
                  value={draft.action}
                  onChange={(e) =>
                    setDraft({ ...draft, action: e.target.value })
                  }
                >
                  <option value={ALL}>همه عملیات‌ها</option>
                  {options.data?.actions.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
                <Button
                  variant="outline"
                  className="rounded-xl"
                  onClick={() => setAdvanced((value) => !value)}
                >
                  <Filter className="size-4" />
                  فیلترهای بیشتر
                </Button>
              </>
            }
          />
        </div>
        {advanced ? (
          <div className="mt-4 grid gap-3 border-t border-[var(--app-divider)] pt-4 sm:grid-cols-2 xl:grid-cols-4">
            <select
              aria-label="متد درخواست"
              className={selectClass}
              value={draft.method}
              onChange={(e) => setDraft({ ...draft, method: e.target.value })}
            >
              <option value={ALL}>همه متدها</option>
              {options.data?.requestMethods.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
            <select
              aria-label="نتیجه"
              className={selectClass}
              value={draft.result}
              onChange={(e) => setDraft({ ...draft, result: e.target.value })}
            >
              <option value={ALL}>همه نتایج</option>
              <option value="SUCCESS">موفق</option>
              <option value="FAILURE">ناموفق</option>
            </select>
            <select
              aria-label="منبع"
              className={selectClass}
              value={draft.source}
              onChange={(e) => setDraft({ ...draft, source: e.target.value })}
            >
              <option value={ALL}>همه منابع</option>
              <option value="WEB">Web</option>
              <option value="API">API</option>
              <option value="AUTH">Auth</option>
              <option value="BACKGROUND_JOB">Background job</option>
              <option value="SCHEDULER">Scheduler</option>
              <option value="PLATFORM">Platform</option>
              <option value="SYSTEM">System</option>
              <option value="LEGACY">Legacy</option>
            </select>
            <Input
              className={inputClass}
              value={draft.entityId}
              onChange={(e) => setDraft({ ...draft, entityId: e.target.value })}
              placeholder="شناسه موجودیت"
            />
            <Input
              className={inputClass}
              value={draft.requestId}
              onChange={(e) =>
                setDraft({ ...draft, requestId: e.target.value })
              }
              placeholder="شناسه درخواست"
            />
            <Input
              className={inputClass}
              value={draft.path}
              onChange={(e) => setDraft({ ...draft, path: e.target.value })}
              placeholder="مسیر درخواست"
            />
            <Input
              className={inputClass}
              value={draft.ip}
              onChange={(e) => setDraft({ ...draft, ip: e.target.value })}
              placeholder="آدرس IP"
            />
            <PersianDateRangePicker
              value={draft.dates}
              onChange={(dates) => setDraft({ ...draft, dates })}
            />
          </div>
        ) : null}
        <div className="mt-4 flex flex-col gap-3 border-t border-[var(--app-divider)] pt-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            <Button className="rounded-xl" onClick={apply}>
              اعمال فیلترها
            </Button>
            <Button variant="ghost" className="rounded-xl" onClick={reset}>
              <RotateCcw className="size-4" />
              پاک‌کردن
            </Button>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              <input
                type="checkbox"
                className="size-4 accent-[var(--app-primary)]"
                checked={includePayload}
                onChange={(event) => setIncludePayload(event.target.checked)}
              />
              همراه جزئیات قبل و بعد
            </label>
            <Button
              size="sm"
              variant="outline"
              disabled={exporting}
              onClick={() => void doExport("csv")}
            >
              CSV
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={exporting}
              onClick={() => void doExport("json")}
            >
              JSON
            </Button>
          </div>
        </div>
      </section>
      {includePayload ? (
        <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-6 text-amber-800">
          خروجی همراه جزئیات به‌دلیل حجم و ملاحظات امنیتی حداکثر ۵٬۰۰۰ ردیف
          دارد.
        </p>
      ) : null}
      <QueryContent query={logs} errorTitle="دریافت رویدادها انجام نشد.">
        <DataTableShell
          rows={logs.data?.data ?? []}
          columns={columns}
          getRowKey={(row) => row.id}
          onRowClick={(row) => setSelectedId(row.id)}
          mobile={{
            title: (row) => row.action,
            subtitle: (row) => `${row.entityType}${row.entityId ? ` · ${row.entityId}` : ""}`,
            status: (row) => <Badge variant={row.result === "FAILURE" ? "destructive" : "secondary"}>{row.result === "FAILURE" ? "ناموفق" : "موفق"}</Badge>,
            fields: [
              { id: "date", label: "زمان", render: (row) => faDate(row.createdAt) },
              { id: "actor", label: "انجام‌دهنده", render: (row) => row.actor?.fullName || "سیستم" },
              { id: "request", label: "مسیر", render: (row) => row.request?.path || "—" },
              { id: "ip", label: "IP", render: (row) => row.request?.ipAddress || "—" },
            ],
          }}
          emptyState={
            <EmptyState
              title="رویدادی مطابق فیلترها پیدا نشد."
              description="فیلترهای جستجو را تغییر دهید."
            />
          }
        />
      </QueryContent>
      <PaginationControls
        page={page}
        pageCount={logs.data?.meta?.totalPages ?? 1}
        pageSize={limit}
        total={logs.data?.meta?.total}
        onPageChange={setPage}
        onPageSizeChange={setLimit}
        disabled={logs.isFetching}
      />
      <ResponsiveModal
        open={Boolean(selectedId)}
        onClose={() => setSelectedId(null)}
        title="جزئیات رویداد ممیزی"
        description={
          detail.data
            ? `${detail.data.action} • ${faDate(detail.data.createdAt)}`
            : "در حال دریافت اطلاعات..."
        }
        icon={Clock3}
        width="max-w-5xl"
      >
        {detail.isError ? (
          <div className="text-sm text-red-600">
            {getApiErrorMessage(detail.error, "دریافت جزئیات انجام نشد.")}
          </div>
        ) : detail.data ? (
          <div className="grid gap-5">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <KeyValue
                label="انجام‌دهنده"
                value={detail.data.actor?.fullName || "سیستم"}
              />
              <KeyValue label="عملیات" value={detail.data.action} mono />
              <KeyValue label="نوع موجودیت" value={detail.data.entityType} />
              <KeyValue
                label="شناسه موجودیت"
                value={detail.data.entityId}
                mono
              />
              <KeyValue label="نتیجه" value={detail.data.result} />
              <KeyValue label="منبع" value={detail.data.source} />
              <KeyValue
                label="مدت اجرا"
                value={
                  detail.data.durationMs != null
                    ? `${fa(detail.data.durationMs)} ms`
                    : null
                }
              />
              <KeyValue label="کد خطا" value={detail.data.errorCode} mono />
            </div>
            <section>
              <h3 className="mb-3 text-sm font-bold">اطلاعات درخواست</h3>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <KeyValue
                  label="شناسه درخواست"
                  value={detail.data.request.requestId}
                  mono
                />
                <KeyValue label="متد" value={detail.data.request.method} mono />
                <KeyValue label="مسیر" value={detail.data.request.path} mono />
                <KeyValue
                  label="IP"
                  value={detail.data.request.ipAddress}
                  mono
                />
              </div>
            </section>
            {detail.data.changedFields.length ? (
              <section>
                <h3 className="mb-3 text-sm font-bold">فیلدهای تغییرکرده</h3>
                <div className="flex flex-wrap gap-2">
                  {detail.data.changedFields.map((field) => (
                    <Badge
                      key={field}
                      variant="secondary"
                      className="font-mono"
                    >
                      {field}
                    </Badge>
                  ))}
                </div>
              </section>
            ) : null}
            <div className="grid gap-4 lg:grid-cols-2">
              <JsonPanel title="قبل از تغییر" value={detail.data.before} />
              <JsonPanel title="بعد از تغییر" value={detail.data.after} />
            </div>
            <JsonPanel title="فراداده" value={detail.data.metadata} />
          </div>
        ) : (
          <div className="grid min-h-52 place-items-center text-sm text-muted-foreground">
            در حال دریافت جزئیات...
          </div>
        )}
      </ResponsiveModal>
    </EntityListPage>
  )
}
