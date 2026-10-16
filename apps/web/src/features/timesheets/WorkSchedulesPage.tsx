import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { unwrapApiResponse, getApiErrorMessage } from '@/lib/apiResponse'
import { EntityListPage } from '@/components/shared/EntityListPage'
import { PageHero } from '@/components/shared/PageHero'
import { QueryContent } from '@/components/shared/QueryContent'
import { DataTableShell, type DataTableColumn } from '@/components/shared/DataTableShell'
import { EmptyState } from '@/components/shared/EmptyState'
import { ResponsiveModal } from '@/components/shared/ResponsiveModal'
import { FormSection } from '@/components/shared/FormSection'
import { FormActions } from '@/components/shared/FormActions'
import { PersianDatePicker } from '@/components/shared/date/PersianDatePicker'
import { NumberInput } from '@/components/shared/inputs/NumberInput'
import { Button } from '@workspace/ui/components/button'
import { FormField } from '@workspace/ui/components/form-field'
import { formatJalaliDate } from '@/lib/date/jalali'
import { localDate, parseDate, minutesLabel, weekDays } from './presentation'
type Schedule = { id: string; effectiveFrom: string; effectiveTo: string | null; days: { weekday: number; regularMinutes: number }[] }
const scheduleMinutes = (schedule: Schedule, weekday: number) => schedule.days.find(item => item.weekday === weekday)?.regularMinutes ?? 0
const schedulePeriod = (schedule: Schedule) => `از ${formatJalaliDate(parseDate(schedule.effectiveFrom)!)} تا ${schedule.effectiveTo ? formatJalaliDate(parseDate(schedule.effectiveTo)!) : 'بدون تاریخ پایان'}`
const scheduleDays = (schedule: Schedule, working: boolean) => weekDays.filter(day => (scheduleMinutes(schedule, day.id) > 0) === working).map(day => day.label).join('، ') || '—'
const scheduleTotal = (schedule: Schedule) => minutesLabel(weekDays.reduce((total, day) => total + scheduleMinutes(schedule, day.id), 0))
const scheduleColumns: DataTableColumn<Schedule>[] = [
  { id: 'period', header: 'بازه اعتبار', cell: schedulePeriod },
  ...weekDays.map(day => ({ id: String(day.id), header: day.label, cell: (schedule: Schedule) => { const minutes = scheduleMinutes(schedule, day.id); return minutes === 0 ? 'تعطیل' : minutesLabel(minutes) } })),
  { id: 'total', header: 'مجموع هفتگی', cell: scheduleTotal },
]
export function WorkSchedulesPage() {
  const [open, setOpen] = useState(false), client = useQueryClient()
  const query = useQuery({ queryKey: ['work-schedules'], queryFn: async () => unwrapApiResponse<Schedule[]>((await api.get('/admin/work-schedules')).data) })
  return <EntityListPage>
    <PageHero title="برنامه کاری سازمان" description="ساعات موظفی روزهای هفته؛ مبنای محاسبه مرخصی روزانه و نیم‌روز" onRefresh={() => query.refetch()} primaryAction={{ label: 'ثبت برنامه کاری', onClick: () => setOpen(true) }} />
    <p className="text-sm leading-7 text-muted-foreground">برنامه پایه سازمان برای همه اعضا اعمال می‌شود، مگر اینکه برنامه اختصاصی تیم یا کاربر داشته باشند. زمان‌ها خالص و بدون استراحت هستند. تاریخ شروع باید روز درخواست مرخصی را پوشش دهد. ساعات پیش‌فرضی تعیین نشده است.</p>
    <QueryContent query={query}>
      <DataTableShell rows={query.data ?? []} columns={scheduleColumns} getRowKey={row => row.id} caption="برنامه‌های کاری سازمان"
        mobile={{ title: () => 'برنامه پایه سازمان', subtitle: schedulePeriod, fields: [
          { id: 'working-days', label: 'روزهای کاری', render: schedule => scheduleDays(schedule, true) },
          { id: 'holidays', label: 'روزهای تعطیل', render: schedule => scheduleDays(schedule, false) },
          { id: 'weekly-total', label: 'مجموع هفتگی', render: scheduleTotal },
        ] }}
        emptyState={<EmptyState title="برنامه کاری تعریف نشده است" description="برای محاسبه مرخصی، برنامه واقعی سازمان و تاریخ اعتبار آن را ثبت کنید." action={<Button type="button" onClick={() => setOpen(true)}>ثبت برنامه کاری</Button>} />} />
      <p className="text-xs text-muted-foreground">نمایش حداکثر ۱۰۰ برنامه اخیر. برای حفظ سوابق، این صفحه برنامه‌های قبلی را تغییر یا حذف نمی‌کند؛ بازه‌های برنامه جدید نباید هم‌پوشانی داشته باشند.</p>
    </QueryContent>
    {open && <ScheduleForm onClose={() => setOpen(false)} onSaved={() => { setOpen(false); void client.invalidateQueries({ queryKey: ['work-schedules'] }) }} />}
  </EntityListPage>
}
export function ScheduleForm({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [from, setFrom] = useState<Date>(), [to, setTo] = useState<Date>()
  const [minutes, setMinutes] = useState<Record<number, string>>({})
  const [confirmed, setConfirmed] = useState(false)
  const invalid = !from || (to && localDate(to) < localDate(from)) || weekDays.some(day => minutes[day.id] == null || minutes[day.id] === '' || Number(minutes[day.id]) > 1440)
  const save = useMutation({ mutationFn: () => api.post('/admin/work-schedules', { effectiveFrom: localDate(from!), effectiveTo: to ? localDate(to) : undefined,
    days: weekDays.map(day => ({ weekday: day.id, regularMinutes: Number(minutes[day.id]) })) }), onSuccess: onSaved })
  return <ResponsiveModal open onClose={() => { if (!save.isPending) onClose() }} title="ثبت برنامه کاری سازمان" description="ساعات را طبق سیاست واقعی سازمان وارد کنید.">
    <form className="grid gap-4" onSubmit={e => { e.preventDefault(); if (!invalid && confirmed && !save.isPending) save.mutate() }}>
      <FormSection title="بازه اعتبار"><div className="grid gap-3 sm:grid-cols-2">
        <FormField label="شروع اعتبار" id="schedule-from" required>{props => <PersianDatePicker {...props} value={from} onChange={setFrom} maxDate={to} />}</FormField>
        <FormField label="پایان اعتبار" id="schedule-to" optional>{props => <PersianDatePicker {...props} value={to} onChange={setTo} minDate={from} />}</FormField>
      </div></FormSection>
      <FormSection title="مدت کار خالص هر روز" description="مقدار هر روز را صریح وارد کنید. برای روز تعطیل صفر وارد کنید؛ مثلاً ۴۵۰ دقیقه برابر ۷ ساعت و ۳۰ دقیقه است.">
        <div className="grid gap-3 sm:grid-cols-2">{weekDays.map(day => <FormField key={day.id} label={`${day.label} (دقیقه)`} required description={minutes[day.id] !== undefined && minutes[day.id] !== '' ? minutesLabel(Number(minutes[day.id])) : 'وارد نشده'}>{props => <NumberInput {...props} value={minutes[day.id] ?? ''} onValueChange={value => { setMinutes(current => ({ ...current, [day.id]: value })); setConfirmed(false) }} />}</FormField>)}</div>
      </FormSection>
      <label className="flex items-start gap-2 text-sm"><input type="checkbox" checked={confirmed} onChange={e => setConfirmed(e.target.checked)} />ساعات و تاریخ اعتبار مطابق برنامه واقعی سازمان است.</label>
      {save.isError && <p role="alert" className="text-destructive">{getApiErrorMessage(save.error, 'ثبت برنامه کاری انجام نشد.')}</p>}
      <FormActions pending={save.isPending} disabled={Boolean(invalid) || !confirmed} onCancel={onClose} submitLabel="ثبت برنامه کاری" />
    </form>
  </ResponsiveModal>
}
