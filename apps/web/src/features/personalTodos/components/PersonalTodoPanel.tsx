import { useMemo, useState } from "react"
import { Check, ChevronDown, ClipboardCheck, Pencil, Plus, RefreshCcw, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { PersianDateTimePicker } from "@/components/shared/PersianDateTimePicker"
import { SearchableCompanySelect } from "@/features/people/components/SearchableCompanySelect"
import { getApiErrorMessage } from "@/lib/apiResponse"
import { useAuthStore } from "@/store/authStore"
import type { PersonalTodo, PersonalTodoInput, PersonalTodoRecurrence } from "../types/personalTodo.types"
import { usePersonalTodoMutations } from "../hooks/usePersonalTodos"

type Tab = "today" | "upcoming" | "completed"
const recurrenceLabels: Record<PersonalTodoRecurrence, string> = { NONE: "تکرار نمی‌شود", DAILY: "هر روز", WEEKLY: "هر هفته", MONTHLY: "هر ماه", CUSTOM: "سفارشی" }

export function PersonalTodoPanel({ data }: { data?: { today: PersonalTodo[]; upcoming: PersonalTodo[]; completed: PersonalTodo[]; counts: { today: number; overdue: number; upcoming: number } } }) {
  const canCreateTask = useAuthStore((state) => state.user?.permissions.includes("task:create") ?? false)
  const [tab, setTab] = useState<Tab>("today")
  const [title, setTitle] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [expanded, setExpanded] = useState(false)
  const [details, setDetails] = useState<Omit<PersonalTodoInput, "title">>({ recurrenceType: "NONE" })
  const mutations = usePersonalTodoMutations()
  const items = useMemo(() => data?.[tab] ?? [], [data, tab])
  const submit = async () => {
    if (!title.trim()) return
    try {
      if (editingId) await mutations.update.mutateAsync({ id: editingId, input: { title: title.trim(), ...details } })
      else await mutations.create.mutateAsync({ title: title.trim(), ...details })
      setTitle(""); setEditingId(null); setDetails({ recurrenceType: "NONE" }); setExpanded(false)
    } catch (error) { toast.error(getApiErrorMessage(error, "ثبت کار شخصی انجام نشد.")) }
  }
  const act = async (action: () => Promise<unknown>, success: string) => {
    try { await action(); toast.success(success) } catch (error) { toast.error(getApiErrorMessage(error, "عملیات انجام نشد.")) }
  }
  return <section className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-4" aria-labelledby="personal-todos-title">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div><h2 id="personal-todos-title" className="ui-section-title">کارهای شخصی من</h2><p className="mt-1 text-xs text-[var(--app-text-secondary)]">یادآورهای خصوصی و سریع روزانه</p></div>
      {data?.counts.overdue ? <span className="rounded-full bg-red-500/10 px-3 py-1 text-xs text-red-500">{data.counts.overdue} عقب‌افتاده</span> : null}
    </div>
    <div className="mt-4 flex gap-2" role="tablist">
      {(["today", "upcoming", "completed"] as Tab[]).map((value) => <Button key={value} type="button" size="sm" variant={tab === value ? "default" : "outline"} onClick={() => setTab(value)}>{value === "today" ? "امروز" : value === "upcoming" ? "آینده" : "تکمیل‌شده"}</Button>)}
    </div>
    <div className="mt-3 flex gap-2"><Input value={title} onChange={(event) => setTitle(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") void submit() }} placeholder={editingId ? "ویرایش عنوان..." : "افزودن کار شخصی..."} aria-label="عنوان کار شخصی"/><Button type="button" onClick={() => void submit()} disabled={!title.trim() || mutations.create.isPending || mutations.update.isPending}><Plus className="size-4"/><span className="sr-only">{editingId ? "ذخیره ویرایش" : "افزودن"}</span></Button><Button type="button" variant="outline" onClick={() => setExpanded((value) => !value)} aria-expanded={expanded}><ChevronDown className="size-4"/><span className="sr-only">جزئیات</span></Button></div>
    {expanded ? <div className="mt-3 grid gap-3 rounded-xl border border-[var(--app-border)] p-3 md:grid-cols-2">
      <textarea value={details.note ?? ""} onChange={(event) => setDetails((value) => ({ ...value, note: event.target.value }))} placeholder="یادداشت" className="min-h-20 rounded-xl border border-[var(--app-border)] bg-transparent p-3 md:col-span-2"/>
      <PersianDateTimePicker value={details.dueAt ? new Date(details.dueAt) : undefined} onChange={(date) => setDetails((value) => ({ ...value, dueAt: date?.toISOString() }))}/>
      <PersianDateTimePicker value={details.reminderAt ? new Date(details.reminderAt) : undefined} onChange={(date) => setDetails((value) => ({ ...value, reminderAt: date?.toISOString() }))}/>
      <select className="h-11 rounded-xl border border-[var(--app-border)] bg-transparent px-3" value={details.recurrenceType} onChange={(event) => setDetails((value) => ({ ...value, recurrenceType: event.target.value as PersonalTodoRecurrence }))}>{Object.entries(recurrenceLabels).map(([value,label]) => <option key={value} value={value}>{label}</option>)}</select>
      <SearchableCompanySelect value={details.companyId} onChange={(companyId) => setDetails((value) => ({ ...value, companyId }))} placeholder="شرکت مرتبط (اختیاری)"/>
      {details.recurrenceType === "CUSTOM" ? <Input type="number" min={1} value={details.recurrenceInterval ?? 1} onChange={(event) => setDetails((value) => ({ ...value, recurrenceInterval: Math.max(1, Number(event.target.value)) }))} placeholder="فاصله تکرار به روز"/> : null}
    </div> : null}
    <div className="mt-4 grid gap-2">
      {items.length === 0 ? <p className="rounded-xl border border-dashed border-[var(--app-border)] p-5 text-center text-sm text-[var(--app-text-secondary)]">موردی در این بخش نیست.</p> : items.map((todo) => <article key={todo.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-[var(--app-border)] p-3">
        <Button type="button" size="icon" variant="outline" onClick={() => void act(() => todo.status === "DONE" ? mutations.reopen.mutateAsync(todo.id) : mutations.complete.mutateAsync(todo.id), todo.status === "DONE" ? "کار دوباره باز شد." : "انجام شد.")}>{todo.status === "DONE" ? <RefreshCcw className="size-4"/> : <Check className="size-4"/>}</Button>
        <div className="min-w-0 flex-1"><p className={todo.status === "DONE" ? "line-through opacity-60" : "font-medium"}>{todo.title}</p><p className="mt-1 text-xs text-[var(--app-text-secondary)]">{todo.company ? (todo.company.brandName || todo.company.legalName) : "بدون ارتباط CRM"}{todo.dueAt ? ` · ${new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(todo.dueAt))}` : ""}</p></div>
        {canCreateTask && !todo.task && todo.status !== "DONE" ? <Button type="button" size="sm" variant="outline" onClick={() => void act(() => mutations.convert.mutateAsync(todo.id), "به کار رسمی تبدیل شد.")}><ClipboardCheck className="size-4"/>تبدیل به کار</Button> : null}
        <Button type="button" size="icon" variant="ghost" onClick={() => { setEditingId(todo.id); setTitle(todo.title); setDetails({ note: todo.note ?? undefined, dueAt: todo.dueAt ?? undefined, reminderAt: todo.reminderAt ?? undefined, recurrenceType: todo.recurrenceType, recurrenceInterval: todo.recurrenceInterval, companyId: todo.company?.id }); setExpanded(true) }}><Pencil className="size-4"/><span className="sr-only">ویرایش</span></Button>
        <Button type="button" size="icon" variant="ghost" className="text-red-500" onClick={() => void act(() => mutations.remove.mutateAsync(todo.id), "حذف شد.")}><Trash2 className="size-4"/><span className="sr-only">حذف</span></Button>
      </article>)}
    </div>
  </section>
}
