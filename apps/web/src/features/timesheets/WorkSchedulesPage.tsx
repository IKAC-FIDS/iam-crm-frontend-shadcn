import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { unwrapApiResponse, getApiErrorMessage } from '@/lib/apiResponse'
import { EntityListPage } from '@/components/shared/EntityListPage'
import { PageHero } from '@/components/shared/PageHero'
import { QueryContent } from '@/components/shared/QueryContent'
import { MobileEntityCard } from '@/components/shared/MobileEntityCard'
import { ResponsiveModal } from '@/components/shared/ResponsiveModal'
import { FormSection } from '@/components/shared/FormSection'
import { FormActions } from '@/components/shared/FormActions'
import { PersianDatePicker } from '@/components/shared/date/PersianDatePicker'
import { NumberInput } from '@/components/shared/inputs/NumberInput'
import { formatJalaliDate } from '@/lib/date/jalali'
import { localDate, parseDate, minutesLabel } from './presentation'

export const weekDays = [{ id: 6, label: 'شنبه' }, { id: 0, label: 'یکشنبه' }, { id: 1, label: 'دوشنبه' }, { id: 2, label: 'سه‌شنبه' }, { id: 3, label: 'چهارشنبه' }, { id: 4, label: 'پنجشنبه' }, { id: 5, label: 'جمعه' }]
type Schedule = { id: string; effectiveFrom: string; effectiveTo: string | null; days: { weekday: number; regularMinutes: number }[] }
export function WorkSchedulesPage() {
  const [open, setOpen] = useState(false), client = useQueryClient()
  const query = useQuery({ queryKey: ['work-schedules'], queryFn: async () => unwrapApiResponse<Schedule[]>((await api.get('/admin/work-schedules')).data) })
  return <EntityListPage>
    <PageHero title="برنامه کاری سازمان" description="ساعات موظفی روزهای هفته؛ مبنای محاسبه مرخصی روزانه و نیم‌روز" onRefresh={() => query.refetch()} primaryAction={{ label: 'ثبت برنامه کاری', onClick: () => setOpen(true) }} />
    <p className="text-sm leading-7 text-muted-foreground">برنامه پایه سازمان برای همه اعضا اعمال می‌شود، مگر اینکه برنامه اختصاصی تیم یا کاربر داشته باشند. زمان‌ها خالص و بدون استراحت هستند. تاریخ شروع باید روز درخواست مرخصی را پوشش دهد. ساعات پیش‌فرضی تعیین نشده است.</p>
    <QueryContent query={query}>
      {!query.data?.length && <p role="status">هنوز برنامه کاری سازمان تعریف نشده است.</p>}
      <div className="grid gap-4 md:grid-cols-2">{query.data?.map(row => <MobileEntityCard key={row.id} row={row} config={{ title: () => 'برنامه پایه سازمان', subtitle: schedule => `از ${formatJalaliDate(parseDate(schedule.effectiveFrom)!)} تا ${schedule.effectiveTo ? formatJalaliDate(parseDate(schedule.effectiveTo)!) : 'بدون تاریخ پایان'}`, fields: weekDays.map(day => ({ id: String(day.id), label: day.label, render: (schedule: Schedule) => minutesLabel(schedule.days.find(item => item.weekday === day.id)?.regularMinutes) })) }} />)}</div>
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
        <div className="grid gap-2"><label htmlFor="schedule-from">شروع اعتبار (الزامی)</label><PersianDatePicker id="schedule-from" value={from} onChange={setFrom} maxDate={to} /></div>
        <div className="grid gap-2"><label htmlFor="schedule-to">پایان اعتبار (اختیاری)</label><PersianDatePicker id="schedule-to" value={to} onChange={setTo} minDate={from} /></div>
      </div></FormSection>
      <FormSection title="مدت کار خالص هر روز" description="مقدار هر روز را صریح وارد کنید. برای روز تعطیل صفر وارد کنید؛ مثلاً ۴۵۰ دقیقه برابر ۷ ساعت و ۳۰ دقیقه است.">
        <div className="grid gap-3 sm:grid-cols-2">{weekDays.map(day => <label key={day.id} className="grid gap-2">{day.label} (دقیقه)<NumberInput aria-label={`${day.label} (دقیقه)`} required value={minutes[day.id] ?? ''} onValueChange={value => { setMinutes(current => ({ ...current, [day.id]: value })); setConfirmed(false) }} /><span className="text-xs text-muted-foreground">{minutes[day.id] !== undefined && minutes[day.id] !== '' ? minutesLabel(Number(minutes[day.id])) : 'وارد نشده'}</span></label>)}</div>
      </FormSection>
      <label className="flex items-start gap-2 text-sm"><input type="checkbox" checked={confirmed} onChange={e => setConfirmed(e.target.checked)} />ساعات و تاریخ اعتبار مطابق برنامه واقعی سازمان است.</label>
      {save.isError && <p role="alert" className="text-destructive">{getApiErrorMessage(save.error, 'ثبت برنامه کاری انجام نشد.')}</p>}
      <FormActions pending={save.isPending} disabled={Boolean(invalid) || !confirmed} onCancel={onClose} submitLabel="ثبت برنامه کاری" />
    </form>
  </ResponsiveModal>
}
