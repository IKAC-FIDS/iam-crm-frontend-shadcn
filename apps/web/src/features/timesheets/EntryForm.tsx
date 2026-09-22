import { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { ResponsiveModal } from '@/components/shared/ResponsiveModal'
import { FormSection } from '@/components/shared/FormSection'
import { FormActions } from '@/components/shared/FormActions'
import { PersianDatePicker } from '@/components/shared/date/PersianDatePicker'
import { TimeInput } from '@/components/shared/inputs/TimeInput'
import { NumberInput } from '@/components/shared/inputs/NumberInput'
import { SearchableCompanySelect } from '@/features/people/components/SearchableCompanySelect'
import { TaskOptionSelect } from '@/features/tasks/components/TaskOptionSelect'
import { getTasks } from '@/features/tasks/api/tasks.api'
import { useDebouncedValue } from '@/lib/useDebouncedValue'
import { getApiErrorMessage } from '@/lib/apiResponse'
import { useAuthStore } from '@/store/authStore'
import { saveEntry, type Domain, type Entry } from './api'
import { labels, localDate, parseDate, timeText, timeMinute } from './presentation'

export function EntryForm({ domain, entry, onClose, onSaved }: { domain: Domain; entry?: Entry; onClose: () => void; onSaved: () => void }) {
  const leave = domain === 'leave-requests'
  const permissions = useAuthStore(s => s.user?.permissions ?? [])
  const [date, setDate] = useState(parseDate(entry?.workDate ?? entry?.startDate) ?? new Date())
  const [endDate, setEndDate] = useState(parseDate(entry?.endDate) ?? date)
  const [type, setType] = useState(entry?.type ?? (leave ? 'ANNUAL' : 'REGULAR'))
  const [unit, setUnit] = useState(entry?.unit ?? 'FULL_DAY')
  const [range, setRange] = useState(entry ? entry.startMinute != null : false)
  const [start, setStart] = useState(timeText(entry?.startMinute) || '09:00')
  const [end, setEnd] = useState(timeText(entry?.endMinute) || '17:00')
  const [overnight, setOvernight] = useState(entry?.spansMidnight ?? false)
  const [duration, setDuration] = useState(String(entry?.durationMinutes ?? 480))
  const [rest, setRest] = useState(String(entry?.breakMinutes ?? 0))
  const [description, setDescription] = useState(entry?.description ?? entry?.reason ?? '')
  const [companyId, setCompanyId] = useState(entry?.companyId ?? undefined)
  const [taskId, setTaskId] = useState(entry?.taskId ?? undefined)
  const [search, setSearch] = useState('')
  const debounced = useDebouncedValue(search, 250)
  const tasks = useQuery({ queryKey: ['timesheet-task-options', debounced], queryFn: () => getTasks({ page: 1, limit: 20, search: debounced }), enabled: !leave && permissions.includes('task:view') })
  const save = useMutation({ mutationFn: () => saveEntry(domain, leave ? {
    type, unit, startDate: localDate(date), endDate: localDate(endDate), reason: description,
    ...(unit === 'HOURLY' ? { startMinute: timeMinute(start), endMinute: timeMinute(end) } : {}),
  } : { type, workDate: localDate(date), breakMinutes: Number(rest), description, companyId, taskId,
    ...(range ? { startMinute: timeMinute(start), endMinute: timeMinute(end), spansMidnight: overnight } : { durationMinutes: Number(duration) }),
  }, entry?.id), onSuccess: onSaved })
  const invalid = leave ? localDate(endDate) < localDate(date) : !range && Number(duration) <= 0
  return <ResponsiveModal open onClose={() => { if (!save.isPending) onClose() }} title={leave ? 'درخواست مرخصی' : entry ? 'ویرایش کارکرد' : 'ثبت کارکرد'}>
    <form className="grid gap-4" onSubmit={event => { event.preventDefault(); if (!invalid && !save.isPending) save.mutate() }}>
      <FormSection title="اطلاعات درخواست" description={leave ? 'مدت مرخصی طبق برنامه کاری توسط سرور محاسبه می‌شود.' : 'مدت خالص پس از کسر استراحت محاسبه می‌شود. ثبت مدت، به معنی تأیید آن نیست.'}>
        <div className="grid min-w-0 gap-4 sm:grid-cols-2">
          <label className="grid gap-2">نوع<select className="h-11 rounded-xl border bg-background px-3" value={type} onChange={e => setType(e.target.value)}>{(leave ? ['ANNUAL', 'SICK', 'UNPAID', 'OTHER'] : ['REGULAR', 'OVERTIME']).map(value => <option key={value} value={value}>{labels[value]}</option>)}</select></label>
          <div className="grid gap-2"><label htmlFor="work-date">{leave ? 'شروع مرخصی' : 'تاریخ کارکرد'}</label><PersianDatePicker id="work-date" value={date} onChange={value => { if (value) setDate(value) }} /></div>
          {leave ? <><label className="grid gap-2">واحد<select className="h-11 rounded-xl border bg-background px-3" value={unit} onChange={e => setUnit(e.target.value)}>{['FULL_DAY', 'HALF_DAY', 'HOURLY'].map(value => <option key={value} value={value}>{labels[value]}</option>)}</select></label><div className="grid gap-2"><label htmlFor="leave-end">پایان مرخصی</label><PersianDatePicker id="leave-end" value={endDate} minDate={date} onChange={value => { if (value) setEndDate(value) }} /></div></>
          : <label className="flex items-center gap-2"><input type="checkbox" checked={range} onChange={e => setRange(e.target.checked)} />ثبت بازه ساعت</label>}
          {(leave ? unit === 'HOURLY' : range) ? <><label className="grid gap-2">ساعت شروع<TimeInput value={start} onValueChange={setStart} /></label><label className="grid gap-2">ساعت پایان<TimeInput value={end} onValueChange={setEnd} /></label>{!leave && <label className="flex items-center gap-2"><input type="checkbox" checked={overnight} onChange={e => setOvernight(e.target.checked)} />پایان در روز بعد</label>}</> : !leave && <label className="grid gap-2">مدت خالص (دقیقه)<NumberInput value={duration} onValueChange={setDuration} required /></label>}
          {!leave && <><label className="grid gap-2">استراحت (دقیقه)<NumberInput value={rest} onValueChange={setRest} /></label>
            {permissions.includes('company:view') && <div className="grid gap-2">شرکت مرتبط<SearchableCompanySelect value={companyId} onChange={setCompanyId} /></div>}
            {permissions.includes('task:view') && <div className="grid gap-2">کار مرتبط<TaskOptionSelect value={taskId} selectedOption={entry?.task ? { id: entry.task.id, label: entry.task.title } : undefined} options={(tasks.data?.data ?? []).map(task => ({ id: task.id, label: task.title }))} search={search} onSearchChange={setSearch} onChange={option => setTaskId(option?.id)} placeholder="انتخاب کار (با جست‌وجو)" loading={tasks.isFetching} /></div>}</>}
          <label className="grid gap-2 sm:col-span-2">{leave ? 'دلیل' : 'شرح کار'}<textarea className="min-h-24 rounded-xl border bg-background p-3" maxLength={4000} value={description} onChange={e => setDescription(e.target.value)} /></label>
        </div>
      </FormSection>
      {!leave && range && <p className="text-xs text-muted-foreground">بازه انتخابی پیش از اعمال تغییر ساعت رسمی و استراحت: {timeMinute(end) + (overnight ? 1440 : 0) - timeMinute(start)} دقیقه. محاسبه نهایی با سرور است.</p>}
      {invalid && <p role="alert">تاریخ پایان یا مدت را اصلاح کنید.</p>}
      {save.isError && <p role="alert" className="text-destructive">{getApiErrorMessage(save.error, 'ذخیره انجام نشد.')}</p>}
      <FormActions onCancel={onClose} pending={save.isPending} disabled={invalid} submitLabel="ذخیره پیش‌نویس" />
    </form>
  </ResponsiveModal>
}
