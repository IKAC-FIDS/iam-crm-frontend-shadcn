import { Loader2, Save } from "lucide-react"
import { useEffect, useMemo, useState, type ReactNode } from "react"
import { toast } from "sonner"

import { FormSection } from "@/components/shared/FormSection"
import { PersianDateTimePicker } from "@/components/shared/PersianDateTimePicker"
import { SearchableCompanySelect } from "@/features/people/components/SearchableCompanySelect"
import { getApiErrorMessage } from "@/lib/apiResponse"
import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { Input } from "@workspace/ui/components/input"

import {
  useActivityOpportunityOptions,
  useActivityPeopleOptions,
  useCreateActivity,
  useUpdateActivity,
} from "../hooks/useActivities"
import {
  MANUAL_ACTIVITY_TYPE_OPTIONS,
  type Activity,
  type ActivityOption,
  type CreateActivityPayload,
  type ManualActivityType,
  type UpdateActivityPayload,
} from "../types/activity.types"
import { ActivityOptionSelect } from "./ActivityOptionSelect"

const selectClass = "h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
const textareaClass = "w-full rounded-xl border border-input bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-ring"

function useDebounced(value: string) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), 300)
    return () => window.clearTimeout(timer)
  }, [value])
  return debounced
}

function safeDate(value?: string | null) {
  if (!value) return undefined
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? undefined : date
}

export function ActivityFormDialog({ open, onOpenChange, activity }: {
  open: boolean
  onOpenChange: (open: boolean) => void
  activity?: Activity | null
}) {
  const editing = Boolean(activity)
  const create = useCreateActivity()
  const update = useUpdateActivity()
  const pending = create.isPending || update.isPending

  const [companyId, setCompanyId] = useState("")
  const [person, setPerson] = useState<ActivityOption>()
  const [opportunity, setOpportunity] = useState<ActivityOption>()
  const [type, setType] = useState<ManualActivityType>("CALL")
  const [notes, setNotes] = useState("")
  const [outcome, setOutcome] = useState("")
  const [occurredAt, setOccurredAt] = useState<Date>()
  const [nextActionDate, setNextActionDate] = useState<Date>()
  const [personSearch, setPersonSearch] = useState("")
  const [opportunitySearch, setOpportunitySearch] = useState("")

  useEffect(() => {
    if (!open) return
    const existingCompanyId = activity?.companyId || activity?.company?.id || ""
    const existingPersonId = activity?.personId || activity?.person?.id || ""

    setCompanyId(existingCompanyId)
    setPerson(existingPersonId ? {
      id: existingPersonId,
      label: activity?.person?.fullName || existingPersonId,
      secondary: activity?.person?.title || activity?.person?.department || undefined,
    } : undefined)
    setOpportunity(undefined)
    setType(activity?.type && activity.type !== "STAGE_CHANGE" ? activity.type : "CALL")
    setNotes(activity?.notes || "")
    setOutcome(activity?.outcome || "")
    setOccurredAt(safeDate(activity?.occurredAt || activity?.activityDate) || (activity ? undefined : new Date()))
    setNextActionDate(undefined)
    setPersonSearch("")
    setOpportunitySearch("")
  }, [activity, open])

  const people = useActivityPeopleOptions(companyId, useDebounced(personSearch), open && Boolean(companyId))
  const opportunities = useActivityOpportunityOptions(companyId, useDebounced(opportunitySearch), open && !editing && Boolean(companyId))
  const validation = useMemo(() => !companyId ? "انتخاب شرکت الزامی است." : "", [companyId])

  async function submit() {
    if (validation) { toast.error(validation); return }
    try {
      if (activity) {
        const payload: UpdateActivityPayload = {
          type,
          personId: person?.id ?? null,
          notes: notes.trim() || null,
          outcome: outcome.trim() || null,
          occurredAt: occurredAt?.toISOString(),
        }
        await update.mutateAsync({ id: activity.id, payload })
        toast.success("فعالیت با موفقیت ویرایش شد.")
      } else {
        const payload: CreateActivityPayload = {
          companyId,
          type,
          personId: person?.id,
          opportunityId: opportunity?.id,
          notes: notes.trim() || undefined,
          outcome: outcome.trim() || undefined,
          occurredAt: occurredAt?.toISOString(),
          nextActionDate: nextActionDate?.toISOString(),
        }
        await create.mutateAsync(payload)
        toast.success("فعالیت با موفقیت ثبت شد.")
      }
      onOpenChange(false)
    } catch (error) {
      toast.error(getApiErrorMessage(error, editing ? "ویرایش فعالیت ناموفق بود." : "ثبت فعالیت ناموفق بود."))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} dir="rtl" className="max-h-[94vh] w-full max-w-[calc(100%_-_1rem)] min-w-0 grid-rows-[auto_minmax(0,1fr)_auto] gap-0 overflow-hidden rounded-[26px] p-0 sm:max-w-[820px]">
        <DialogHeader className="border-b border-[var(--app-divider)] px-5 py-4 sm:px-6">
          <DialogTitle className="text-base font-bold text-[var(--app-heading)]">{editing ? "ویرایش فعالیت" : "ثبت فعالیت جدید"}</DialogTitle>
          <DialogDescription className="text-xs text-[var(--app-text-secondary)]">
            {editing
              ? "اطلاعات پایه فعالیت را ویرایش کنید. ارتباط فرصت فروش و زمان پیگیری موجود دست‌نخورده باقی می‌ماند."
              : "تعامل انجام‌شده را ثبت کنید و در صورت نیاز زمان پیگیری بعدی را مشخص کنید."}
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 space-y-4 overflow-y-auto bg-[var(--app-background)]/45 p-4 sm:p-5">
          <FormSection title="اطلاعات فعالیت" description="نوع، زمان، نتیجه و توضیحات فعالیت">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="شرکت *">
                <SearchableCompanySelect
                  value={companyId || undefined}
                  onChange={(next) => {
                    if (editing) return
                    setCompanyId(next || "")
                    setPerson(undefined)
                    setOpportunity(undefined)
                  }}
                  disabled={editing}
                  allowEmpty={!editing}
                  placeholder="انتخاب شرکت"
                />
              </Field>

              <Field label="نوع فعالیت *">
                <select value={type} onChange={(event) => setType(event.target.value as ManualActivityType)} className={selectClass}>
                  {MANUAL_ACTIVITY_TYPE_OPTIONS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                </select>
              </Field>

              <Field label="شخص">
                <ActivityOptionSelect
                  value={person?.id}
                  selectedOption={person}
                  options={people.data || []}
                  onChange={setPerson}
                  search={personSearch}
                  onSearchChange={setPersonSearch}
                  placeholder={companyId ? "انتخاب شخص" : "ابتدا شرکت را انتخاب کنید"}
                  loading={people.isLoading}
                  disabled={!companyId}
                />
              </Field>

              {!editing ? (
                <Field label="فرصت فروش">
                  <ActivityOptionSelect
                    value={opportunity?.id}
                    selectedOption={opportunity}
                    options={opportunities.data || []}
                    onChange={setOpportunity}
                    search={opportunitySearch}
                    onSearchChange={setOpportunitySearch}
                    placeholder={companyId ? "انتخاب فرصت فروش" : "ابتدا شرکت را انتخاب کنید"}
                    loading={opportunities.isLoading}
                    disabled={!companyId}
                  />
                </Field>
              ) : null}

              <Field label="زمان فعالیت"><PersianDateTimePicker value={occurredAt} onChange={setOccurredAt} /></Field>
              {!editing ? <Field label="پیگیری بعدی"><PersianDateTimePicker value={nextActionDate} onChange={setNextActionDate} /></Field> : null}

              <Field label="نتیجه" className={!editing ? "sm:col-span-2" : ""}>
                <Input value={outcome} onChange={(event) => setOutcome(event.target.value)} placeholder="نتیجه فعالیت" className="h-11 rounded-xl" />
              </Field>

              <Field label="یادداشت" className="sm:col-span-2">
                <textarea rows={5} value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="توضیحات و نکات مرتبط با فعالیت" className={textareaClass} />
              </Field>
            </div>
          </FormSection>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-[var(--app-divider)] bg-[var(--app-surface)] px-5 py-4 sm:px-6">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>انصراف</Button>
          <Button type="button" disabled={pending || Boolean(validation)} onClick={() => void submit()}>
            {pending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            {pending ? "در حال ذخیره..." : "ذخیره"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function Field({ label, children, className = "" }: { label: string; children: ReactNode; className?: string }) {
  return (
    <label className={`grid gap-2 ${className}`}>
      <span className="text-xs font-bold text-[var(--app-heading)]">{label}</span>
      {children}
    </label>
  )
}
