import { useState } from 'react'
import type { ReactNode } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Check, Clock, Download, Pencil, Send, X } from 'lucide-react'
import { Button } from '@workspace/ui/components/button'
import { EntityListPage } from '@/components/shared/EntityListPage'
import { PageHero } from '@/components/shared/PageHero'
import { DataTableToolbar } from '@/components/shared/DataTableToolbar'
import { DataTableShell } from '@/components/shared/DataTableShell'
import { QueryContent } from '@/components/shared/QueryContent'
import { EntityRowActions, type EntityAction } from '@/components/shared/EntityRowActions'
import { ResponsiveModal } from '@/components/shared/ResponsiveModal'
import { FormActions } from '@/components/shared/FormActions'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { PersianDateRangePicker } from '@/components/shared/date/PersianDateRangePicker'
import { SurfaceCard } from '@/components/shared/SurfaceCard'
import { MetricCard } from '@/components/shared/MetricCard'
import { useAuthStore } from '@/store/authStore'
import { getApiErrorMessage } from '@/lib/apiResponse'
import { normalizeAppError } from '@/lib/appError'
import { formatJalaliDate, type DateRangeValue } from '@/lib/date/jalali'
import { decideEntry, exportTimesheets, filterOptions, listEntries, timesheetReport, type Domain, type Entry, type Metrics } from './api'
import { editable, labels, localDate, minutesLabel, parseDate } from './presentation'
import { EntryForm } from './EntryForm'

function initialPeriod() { const to = new Date(), from = new Date(to); from.setDate(from.getDate() - 29); return { from, to } }
function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: { value: string; label: string }[] }) {
  return <label className="grid min-w-0 gap-1 text-xs">{label}<select className="h-11 min-w-0 rounded-xl border bg-background px-3" value={value} onChange={e => onChange(e.target.value)}><option value="">همه</option>{options.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
}
function status(row: Entry) { return <StatusBadge tone={row.status === 'APPROVED' ? 'success' : row.status === 'REJECTED' ? 'error' : 'neutral'}>{labels[row.status] ?? 'نامشخص'}</StatusBadge> }
const day = (value?: string) => value ? formatJalaliDate(parseDate(value)!) : '—'
const metricLabels: [keyof Metrics, string][] = [['regularWorkedMinutes', 'کار عادی تأییدشده'], ['approvedOvertimeMinutes', 'اضافه‌کاری تأییدشده'], ['pendingOvertimeMinutes', 'اضافه‌کاری در انتظار'], ['actualWorkedMinutes', 'کل کار واقعی'], ['approvedLeaveMinutes', 'مرخصی تأییدشده'], ['pendingLeaveMinutes', 'مرخصی در انتظار']]
function Summary({ metrics }: { metrics?: Metrics }) { return metrics ? <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{metricLabels.map(([key, label]) => <MetricCard key={key} icon={Clock} label={label} value={minutesLabel(metrics[key])} helper="ساعت:دقیقه" />)}</div> : null }
function useFilters() {
  const [period, setPeriod] = useState<DateRangeValue>(initialPeriod)
  const [page, setPage] = useState(1), [pageSize, setPageSize] = useState(20), [status, setStatus] = useState(''), [employee, setEmployee] = useState(''), [team, setTeam] = useState('')
  return { period, page, pageSize, status, employee, team, setPage,
    setPageSize: (value: number) => { setPageSize(value); setPage(1) },
    setPeriod: (value: DateRangeValue) => { setPeriod(value); setPage(1) },
    setStatus: (value: string) => { setStatus(value); setPage(1) }, setEmployee: (value: string) => { setEmployee(value); setPage(1) }, setTeam: (value: string) => { setTeam(value); setEmployee(''); setPage(1) },
    valid: !!period.from && !!period.to, from: period.from ? localDate(period.from) : '', to: period.to ? localDate(period.to) : '' }
}
function Filters({ filters, domain, manager, extra }: { filters: ReturnType<typeof useFilters>; domain: Domain; manager: boolean; extra?: ReactNode }) {
  const options = useQuery({ queryKey: ['timesheet-options', domain], queryFn: () => filterOptions(domain), enabled: manager })
  return <><DataTableToolbar filters={<>
    <div className="w-full sm:w-auto"><PersianDateRangePicker value={filters.period} onChange={filters.setPeriod} /></div>
    <Select label="وضعیت" value={filters.status} onChange={filters.setStatus} options={['DRAFT', domain === 'timesheets' ? 'SUBMITTED' : 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'].map(value => ({ value, label: labels[value] }))} />
    {manager && <><Select label="تیم" value={filters.team} onChange={filters.setTeam} options={(options.data?.teams ?? []).map(team => ({ value: team.id, label: team.name }))} />
      <Select label="کارمند" value={filters.employee} onChange={filters.setEmployee} options={(options.data?.employees ?? []).map(user => ({ value: user.id, label: user.fullName }))} /></>}{extra}
  </>} />{options.isError && manager && <p role="alert">فهرست فیلترها دریافت نشد. <Button variant="ghost" onClick={() => void options.refetch()}>تلاش دوباره</Button></p>}{options.data?.limited && <p>فهرست انتخاب به هزار مورد محدود شده است.</p>}</>
}
export function PersonalTimesheetsPage() { return <EntriesPage manager={false} initialDomain="timesheets" /> }
export function PersonalLeavePage() { return <EntriesPage manager={false} initialDomain="leave-requests" /> }
export function ManagerTimesheetsPage() { return <EntriesPage manager initialDomain="timesheets" /> }

function EntriesPage({ manager, initialDomain }: { manager: boolean; initialDomain: Domain }) {
  const user = useAuthStore(s => s.user), permissions = user?.permissions ?? []
  const canList = (domain: Domain) => (domain === 'timesheets' ? ['timesheet:approve', 'timesheet:approve-organization', 'timesheet:view-organization'] : ['leave:approve', 'leave:approve-organization', 'leave:view-organization']).some(p => permissions.includes(p))
  const [tab, setTab] = useState(manager && !canList('timesheets') ? 'leave' : initialDomain === 'leave-requests' ? 'leave' : 'regular')
  const domain: Domain = tab === 'leave' ? 'leave-requests' : 'timesheets'
  const [type, setType] = useState('')
  const filters = useFilters(), client = useQueryClient()
  const [form, setForm] = useState<{ entry?: Entry } | null>(null), [detail, setDetail] = useState<Entry | null>(null), [reject, setReject] = useState<Entry | null>(null), [reason, setReason] = useState('')
  const [message, setMessage] = useState('')
  const query = useQuery({ queryKey: ['timesheet-entries', domain, manager, filters.from, filters.to, filters.page, filters.pageSize, filters.status, filters.team, filters.employee, tab, type],
    queryFn: () => listEntries(domain, manager, { startDate: filters.from, endDate: filters.to, page: filters.page, limit: filters.pageSize, status: filters.status,
      ...(manager ? { employeeId: filters.employee, teamId: filters.team, type: tab === 'leave' ? undefined : tab === 'overtime' ? 'OVERTIME' : 'REGULAR' } : { type }) }), enabled: filters.valid && (!manager || canList(domain)) })
  const summary = useQuery({ queryKey: ['timesheet-summary', filters.from, filters.to], queryFn: () => timesheetReport(true, { dateFrom: filters.from, dateTo: filters.to }), enabled: !manager && filters.valid && permissions.includes('timesheet:view') })
  async function refresh() { await Promise.all([client.invalidateQueries({ queryKey: ['timesheet-entries'] }), client.invalidateQueries({ queryKey: ['timesheet-summary'] }), client.invalidateQueries({ queryKey: ['timesheet-report'] })]) }
  const decision = useMutation({ mutationFn: ({ row, action, reason }: { row: Entry; action: string; reason?: string }) => decideEntry(domain, row.id, action, reason),
    onSuccess: async () => { setReject(null); setMessage('عملیات انجام شد.'); await refresh() }, onError: async error => { setMessage(normalizeAppError(error).status === 409 ? 'وضعیت این درخواست تغییر کرده است؛ اطلاعات تازه دریافت شد. تصمیم را دوباره بررسی کنید.' : getApiErrorMessage(error, 'عملیات انجام نشد.')); await refresh() } })
  const manageable = permissions.includes(domain === 'timesheets' ? 'timesheet:manage' : 'leave:manage')
  const approvable = permissions.some(p => (domain === 'timesheets' ? ['timesheet:approve', 'timesheet:approve-organization'] : ['leave:approve', 'leave:approve-organization']).includes(p))
  const actions = (row: Entry) => {
    const items: EntityAction[] = []
    if (!manager && manageable && editable(row.status)) items.push({ id: 'edit', label: 'ویرایش', icon: Pencil, onClick: () => setForm({ entry: row }) },
      { id: 'submit', label: 'ارسال برای تأیید', icon: Send, onClick: () => decision.mutateAsync({ row, action: 'submit' }), confirmation: { title: 'ارسال درخواست', description: 'پس از ارسال امکان ویرایش وجود ندارد.' } },
      { id: 'cancel', label: 'لغو', icon: X, tone: 'danger', onClick: () => decision.mutateAsync({ row, action: 'cancel' }), confirmation: { title: 'لغو درخواست', description: 'این درخواست لغو شود؟' } })
    if (manager && approvable && row.userId !== user?.id && ['SUBMITTED', 'PENDING'].includes(row.status)) items.push(
      { id: 'approve', label: 'تأیید', icon: Check, onClick: () => decision.mutateAsync({ row, action: 'approve' }), confirmation: { title: 'تأیید درخواست', description: 'این درخواست تأیید شود؟' } },
      { id: 'reject', label: 'رد', icon: X, onClick: () => { setReason(''); setReject(row) } })
    return <EntityRowActions presentation="buttons" onView={() => setDetail(row)} actions={items.map(item => ({ ...item, disabled: decision.isPending }))} />
  }
  const columns = [
    ...(manager ? [{ id: 'employee', header: 'کارمند', cell: (row: Entry) => row.user?.fullName ?? '—' }] : []),
    { id: 'date', header: 'تاریخ', cell: (row: Entry) => domain === 'timesheets' ? day(row.workDate) : `${day(row.startDate)} تا ${day(row.endDate)}` },
    { id: 'type', header: 'نوع', cell: (row: Entry) => `${labels[row.type] ?? 'نامشخص'}${row.unit ? ` / ${labels[row.unit]}` : ''}` },
    { id: 'time', header: 'ساعت', cell: (row: Entry) => row.startMinute == null ? 'ثبت مدت' : `${minutesLabel(row.startMinute)} تا ${minutesLabel(row.endMinute)}${row.spansMidnight ? ' (روز بعد)' : ''}` },
    { id: 'duration', header: 'مدت (ساعت:دقیقه)', cell: (row: Entry) => minutesLabel(row.durationMinutes ?? row.requestedMinutes) },
    ...(domain === 'timesheets' ? [{ id: 'task', header: 'کار مرتبط', cell: (row: Entry) => row.task?.title ?? '—' }, { id: 'company', header: 'شرکت', cell: (row: Entry) => row.company?.legalName ?? '—' }] : []),
    { id: 'reviewer', header: 'بررسی‌کننده', cell: (row: Entry) => row.reviewedByMembership?.user.fullName ?? '—' }, { id: 'status', header: 'وضعیت', cell: status },
  ]
  return <EntityListPage><PageHero title={manager ? 'مدیریت کارکرد تیم' : domain === 'timesheets' ? 'کارکرد من' : 'مرخصی‌های من'} description="ثبت، پیگیری و بررسی ساعات کاری و درخواست‌های مرخصی" onRefresh={refresh}
    primaryAction={!manager && manageable ? { label: domain === 'timesheets' ? 'ثبت کارکرد' : 'درخواست مرخصی', onClick: () => setForm({}) } : undefined} />
    {manager && <div className="flex flex-wrap gap-2" role="group" aria-label="نوع درخواست">{[{ id: 'regular', label: 'کارکردها', domain: 'timesheets' as const }, { id: 'overtime', label: 'اضافه‌کاری‌ها', domain: 'timesheets' as const }, { id: 'leave', label: 'مرخصی‌ها', domain: 'leave-requests' as const }].filter(item => canList(item.domain)).map(item => <Button key={item.id} aria-pressed={tab === item.id} variant={tab === item.id ? 'default' : 'outline'} onClick={() => { setTab(item.id); filters.setStatus(''); setMessage('') }}>{item.label}</Button>)}</div>}
    <Filters filters={filters} domain={domain} manager={manager} extra={!manager && domain === 'timesheets' ? <Select label="نوع کار" value={type} onChange={value => { setType(value); filters.setPage(1) }} options={['REGULAR', 'OVERTIME'].map(value => ({ value, label: labels[value] }))} /> : undefined} />
    {!manager && <Summary metrics={summary.data?.totals} />}{summary.isError && !manager && <p role="alert">خلاصه دریافت نشد.</p>}
    {message && <p role="status">{message}</p>}
    <QueryContent query={query}><DataTableShell rows={query.data?.data ?? []} columns={columns} getRowKey={row => row.id} renderRowActions={actions}
      mobile={{ title: row => manager ? row.user?.fullName ?? '—' : labels[row.type], status, fields: columns.filter(column => column.id !== 'status').map(column => ({ id: column.id, label: column.header, render: column.cell })) }}
      pagination={{ page: filters.page, pageCount: query.data?.meta.totalPages ?? 1, total: query.data?.meta.total, onPageChange: filters.setPage, pageSize: filters.pageSize, onPageSizeChange: filters.setPageSize, disabled: query.isFetching }} /></QueryContent>
    {form && <EntryForm domain={domain} entry={form.entry} onClose={() => setForm(null)} onSaved={() => { setForm(null); void refresh() }} />}
    {reject && <ResponsiveModal open title="رد درخواست" onClose={() => { if (!decision.isPending) setReject(null) }}><form className="grid gap-4" onSubmit={e => { e.preventDefault(); if (reason.trim() && !decision.isPending) decision.mutate({ row: reject, action: 'reject', reason: reason.trim() }) }}><label className="grid gap-2">دلیل رد<textarea className="min-h-24 rounded-xl border bg-background p-3" required maxLength={2000} value={reason} onChange={e => setReason(e.target.value)} /></label>{message && <p role="alert">{message}</p>}<FormActions onCancel={() => setReject(null)} pending={decision.isPending} disabled={!reason.trim()} submitLabel="رد درخواست" /></form></ResponsiveModal>}
    {detail && <ResponsiveModal open title="جزئیات درخواست" onClose={() => setDetail(null)}><div className="grid gap-4"><p>{detail.description || detail.reason || 'بدون توضیح'}</p><p>تیم هنگام ثبت: {detail.teamNameSnapshot ?? '—'}</p>{detail.rejectionReason && <p>دلیل رد: {detail.rejectionReason}</p>}<h3>سوابق تصمیم‌گیری (حداکثر ۱۰۰ رویداد)</h3>{detail.approvalHistory?.map(item => <SurfaceCard key={item.id} className="p-3"><p>{item.actorMembership?.user.fullName ?? '—'}؛ {labels[item.action] ?? 'تغییر وضعیت'}</p><p>{labels[item.fromStatus] ?? '—'} ← {labels[item.toStatus] ?? '—'}</p><p>{new Date(item.createdAt).toLocaleString('fa-IR')}</p><p>{item.reason}</p></SurfaceCard>)}</div></ResponsiveModal>}
  </EntityListPage>
}

export function TimesheetReportsPage() {
  const filters = useFilters(), permissions = useAuthStore(s => s.user?.permissions ?? []), [type, setType] = useState('')
  const params = { dateFrom: filters.from, dateTo: filters.to, page: filters.page, limit: filters.pageSize, employeeId: filters.employee, teamId: filters.team, status: filters.status, entryType: type }
  const query = useQuery({ queryKey: ['timesheet-report', params], queryFn: () => timesheetReport(false, params), enabled: filters.valid })
  const download = useMutation({ mutationFn: () => exportTimesheets(params) })
  const columns = [{ id: 'name', header: 'کارمند', cell: (row: import('./api').EmployeeReport) => row.employeeName }, { id: 'team', header: 'تیم تاریخی', cell: (row: import('./api').EmployeeReport) => row.historicalTeams.map(team => team.name ?? '—').join('، ') },
    ...[...metricLabels, ['scheduledMinutes', 'ساعات موظفی'], ['attendanceVarianceMinutes', 'اختلاف حضور']].map(([key, label]) => ({ id: key, header: label, cell: (row: import('./api').EmployeeReport) => minutesLabel(row[key as keyof Metrics]) }))]
  return <EntityListPage><PageHero title="گزارش عملکرد کارکنان" description="کار عادی، اضافه‌کاری و مرخصی به تفکیک؛ تمام مدت‌ها ساعت:دقیقه هستند." onRefresh={() => query.refetch()}
    primaryAction={permissions.includes('timesheet:export') ? { label: download.isPending ? 'آماده‌سازی خروجی…' : 'دریافت خروجی Excel', icon: Download, disabled: download.isPending || !filters.valid, onClick: () => download.mutate() } : undefined} />
    <Filters filters={filters} domain="timesheets" manager extra={<Select label="نوع کار" value={type} onChange={value => { setType(value); filters.setPage(1) }} options={['REGULAR', 'OVERTIME'].map(value => ({ value, label: labels[value] }))} />} />
    <p className="text-xs leading-6 text-muted-foreground">تیم بر اساس اطلاعات زمان ثبت است، نه تیم فعلی. ساعات موظفی و اختلاف حضور به دلیل نبود تاریخچه کامل عضویت و برنامه کاری محاسبه نمی‌شوند. مرخصی عبوری از مرز بازه، «نامشخص» گزارش می‌شود. فیلتر نوع کار، مرخصی را از گزارش خارج می‌کند. فقط کارکنان دارای رکورد منطبق نمایش داده می‌شوند.</p>
    {download.isError && <p role="alert">{getApiErrorMessage(download.error, 'خروجی دریافت نشد؛ بازه را محدود و دوباره تلاش کنید.')}</p>}
    <QueryContent query={query}><Summary metrics={query.data?.totals} /><DataTableShell rows={query.data?.data ?? []} columns={columns} getRowKey={row => row.employeeId}
      mobile={{ title: row => row.employeeName, fields: columns.slice(1).map(column => ({ id: column.id, label: column.header, render: column.cell })) }}
      pagination={{ page: filters.page, pageCount: query.data?.meta.totalPages ?? 1, total: query.data?.meta.total, onPageChange: filters.setPage, pageSize: filters.pageSize, onPageSizeChange: filters.setPageSize, disabled: query.isFetching }} /></QueryContent>
  </EntityListPage>
}
