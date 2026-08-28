import { useDebouncedValue as useDebounced } from "@/lib/useDebouncedValue"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { applyServerFieldErrors } from "@/lib/formErrors"
import { FormActions } from "@/components/shared/FormActions"
import { uiText } from "@/config/uiText"
import { useEffect, useMemo, useState, type ReactNode } from "react"
import { toast } from "sonner"

import { DialogHeroHeader } from "@/components/shared/DialogHeroHeader"
import { FormSection } from "@/components/shared/FormSection"
import { PersianDateTimePicker } from "@/components/shared/PersianDateTimePicker"
import { SearchableCompanySelect } from "@/features/people/components/SearchableCompanySelect"
import { getApiErrorMessage } from "@/lib/apiResponse"
import { Dialog, DialogContent } from "@workspace/ui/components/dialog"
import { Input } from "@workspace/ui/components/input"

import {
  useActivityOpportunityOptions,
  useActivityPeopleOptions,
  useCreateActivity,
  useUpdateActivity,
  useActivityTypes,
} from "../hooks/useActivities"
import {
  type Activity,
  type ActivityOption,
  type CreateActivityPayload,
  type ManualActivityType,
  type UpdateActivityPayload,
} from "../types/activity.types"
import { ActivityOptionSelect } from "./ActivityOptionSelect"

const selectClass =
  "h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
const textareaClass =
  "w-full rounded-xl border border-input bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-ring"

function safeDate(value?: string | null) {
  if (!value) return undefined
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? undefined : date
}

const formSchema = z.object({
  companyId: z.string().min(1, uiText.common.forms.required),
  person: z.custom<ActivityOption>().optional(),
  opportunity: z.custom<ActivityOption>().optional(),
  type: z.string().min(1, uiText.common.forms.required),
  notes: z.string(),
  outcome: z.string(),
  occurredAt: z.date().optional(),
  nextActionDate: z.date().optional(),
})
type FormValues = z.infer<typeof formSchema>

export function ActivityFormDialog({
  open,
  onOpenChange,
  activity,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  activity?: Activity | null
}) {
  const editing = Boolean(activity)
  const create = useCreateActivity()
  const update = useUpdateActivity()
  const pending = create.isPending || update.isPending
  const activityTypes = useActivityTypes(open)

  const defaultValues = useMemo<FormValues>(() => {
    const existingCompanyId = activity?.companyId || activity?.company?.id || ""
    const existingPersonId = activity?.personId || activity?.person?.id || ""
    return {
      companyId: existingCompanyId,
      person: existingPersonId
        ? {
            id: existingPersonId,
            label: activity?.person?.fullName || existingPersonId,
            secondary:
              activity?.person?.title ||
              activity?.person?.department ||
              undefined,
          }
        : undefined,
      opportunity: undefined,
      type:
        activity?.type && activity.type !== "STAGE_CHANGE" ? activity.type : "",
      notes: activity?.notes || "",
      outcome: activity?.outcome || "",
      occurredAt:
        safeDate(activity?.occurredAt || activity?.activityDate) ||
        (activity ? undefined : new Date()),
      nextActionDate: undefined,
    }
  }, [activity])
  const {
    control,
    register,
    setValue,
    reset,
    setError,
    clearErrors,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ defaultValues, resolver: zodResolver(formSchema) })
  const {
    companyId,
    person,
    opportunity,
    type,
    notes,
    outcome,
    occurredAt,
    nextActionDate,
  } = useWatch({ control }) as FormValues
  const setCompanyId = (value: FormValues["companyId"]) =>
    setValue("companyId", value, { shouldDirty: true, shouldValidate: true })
  const setPerson = (value: FormValues["person"]) =>
    setValue("person", value, { shouldDirty: true, shouldValidate: true })
  const setOpportunity = (value: FormValues["opportunity"]) =>
    setValue("opportunity", value, { shouldDirty: true, shouldValidate: true })
  const setType = (value: FormValues["type"]) =>
    setValue("type", value, { shouldDirty: true, shouldValidate: true })
  const setNotes = (value: FormValues["notes"]) =>
    setValue("notes", value, { shouldDirty: true, shouldValidate: true })
  const setOutcome = (value: FormValues["outcome"]) =>
    setValue("outcome", value, { shouldDirty: true, shouldValidate: true })
  const setOccurredAt = (value: FormValues["occurredAt"]) =>
    setValue("occurredAt", value, { shouldDirty: true, shouldValidate: true })
  const setNextActionDate = (value: FormValues["nextActionDate"]) =>
    setValue("nextActionDate", value, {
      shouldDirty: true,
      shouldValidate: true,
    })
  const [previousOpen, setPreviousOpen] = useState(open)
  const [opportunitySearch, setOpportunitySearch] = useState("")
  const [personSearch, setPersonSearch] = useState("")
  if (previousOpen !== open) {
    setPreviousOpen(open)
    if (open) {
      setOpportunitySearch("")
      setPersonSearch("")
    }
  }
  useEffect(() => {
    if (open) {
      reset(
        activity ? defaultValues : { ...defaultValues, occurredAt: new Date() }
      )
    }
  }, [open, defaultValues, reset, activity])

  const people = useActivityPeopleOptions(
    companyId,
    useDebounced(personSearch),
    open && Boolean(companyId)
  )
  const opportunities = useActivityOpportunityOptions(
    companyId,
    useDebounced(opportunitySearch),
    open && !editing && Boolean(companyId)
  )
  const validation = useMemo(
    () =>
      !companyId
        ? "انتخاب شرکت الزامی است."
        : !type
          ? "انتخاب نوع فعالیت الزامی است."
          : activityTypes.isError
            ? "دریافت انواع فعالیت ناموفق بود؛ فرم را دوباره باز کنید."
            : "",
    [companyId, type, activityTypes.isError]
  )

  async function submit() {
    clearErrors()
    if (validation) {
      toast.error(validation)
      return
    }
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
      applyServerFieldErrors(
        error,
        setError,
        [
          "companyId",
          "person",
          "opportunity",
          "type",
          "notes",
          "outcome",
          "occurredAt",
          "nextActionDate",
        ],
        {
          personId: "person",
          opportunityId: "opportunity",
          activityDate: "occurredAt",
        }
      )
      toast.error(
        getApiErrorMessage(
          error,
          editing ? "ویرایش فعالیت ناموفق بود." : "ثبت فعالیت ناموفق بود."
        )
      )
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        dir="rtl"
        className="max-h-[94vh] w-full max-w-[calc(100%_-_1rem)] min-w-0 grid-rows-[auto_minmax(0,1fr)_auto] gap-0 overflow-hidden rounded-[26px] p-0 sm:max-w-[820px]"
      >
        <DialogHeroHeader
          title={editing ? "ویرایش فعالیت" : "ثبت فعالیت جدید"}
          description={
            editing
              ? "اطلاعات پایه فعالیت را ویرایش کنید. ارتباط فرصت فروش و زمان پیگیری موجود دست‌نخورده باقی می‌ماند."
              : "تعامل انجام‌شده را ثبت کنید و در صورت نیاز زمان پیگیری بعدی را مشخص کنید."
          }
          onClose={() => onOpenChange(false)}
        />

        <form className="contents" noValidate onSubmit={handleSubmit(submit)}>
          <div className="min-h-0 space-y-4 overflow-y-auto bg-[var(--app-background)]/45 p-4 sm:p-5">
            {errors.root?.server?.message ? (
              <p role="alert" className="text-sm text-destructive">
                {errors.root.server.message}
              </p>
            ) : null}
            <FormSection
              title="اطلاعات فعالیت"
              description="نوع، زمان، نتیجه و توضیحات فعالیت"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="شرکت *" error={errors.companyId?.message}>
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

                <Field label="نوع فعالیت *" error={errors.type?.message}>
                  <select
                    {...register("type")}
                    aria-invalid={Boolean(errors.type)}
                    value={type}
                    onChange={(event) =>
                      setType(event.target.value as ManualActivityType)
                    }
                    className={selectClass}
                  >
                    <option value="">
                      {activityTypes.isLoading
                        ? "در حال دریافت..."
                        : "انتخاب نوع فعالیت"}
                    </option>
                    {(activityTypes.data ?? [])
                      .filter(
                        (item) => item.isActive || item.code === activity?.type
                      )
                      .map((item) => (
                        <option
                          key={item.id}
                          value={item.code}
                          disabled={
                            !item.isActive && item.code !== activity?.type
                          }
                        >
                          {item.label}
                        </option>
                      ))}
                  </select>
                </Field>

                <Field label="شخص" error={errors.person?.message}>
                  <ActivityOptionSelect
                    value={person?.id}
                    selectedOption={person}
                    options={people.data || []}
                    onChange={setPerson}
                    search={personSearch}
                    onSearchChange={setPersonSearch}
                    placeholder={
                      companyId ? "انتخاب شخص" : "ابتدا شرکت را انتخاب کنید"
                    }
                    loading={people.isLoading}
                    disabled={!companyId}
                  />
                </Field>

                {!editing ? (
                  <Field label="فرصت فروش" error={errors.opportunity?.message}>
                    <ActivityOptionSelect
                      value={opportunity?.id}
                      selectedOption={opportunity}
                      options={opportunities.data || []}
                      onChange={setOpportunity}
                      search={opportunitySearch}
                      onSearchChange={setOpportunitySearch}
                      placeholder={
                        companyId
                          ? "انتخاب فرصت فروش"
                          : "ابتدا شرکت را انتخاب کنید"
                      }
                      loading={opportunities.isLoading}
                      disabled={!companyId}
                    />
                  </Field>
                ) : null}

                <Field label="زمان فعالیت" error={errors.occurredAt?.message}>
                  <PersianDateTimePicker
                    value={occurredAt}
                    onChange={setOccurredAt}
                  />
                </Field>
                {!editing ? (
                  <Field
                    label="پیگیری بعدی"
                    error={errors.nextActionDate?.message}
                  >
                    <PersianDateTimePicker
                      value={nextActionDate}
                      onChange={setNextActionDate}
                    />
                  </Field>
                ) : null}

                <Field
                  label="نتیجه"
                  className={!editing ? "sm:col-span-2" : ""}
                  error={errors.outcome?.message}
                >
                  <Input
                    {...register("outcome")}
                    aria-invalid={Boolean(errors.outcome)}
                    value={outcome}
                    onChange={(event) => setOutcome(event.target.value)}
                    placeholder="نتیجه فعالیت"
                    className="h-11 rounded-xl"
                  />
                </Field>

                <Field
                  label="یادداشت"
                  className="sm:col-span-2"
                  error={errors.notes?.message}
                >
                  <textarea
                    {...register("notes")}
                    aria-invalid={Boolean(errors.notes)}
                    rows={5}
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    placeholder="توضیحات و نکات مرتبط با فعالیت"
                    className={textareaClass}
                  />
                </Field>
              </div>
            </FormSection>
          </div>

          <div className="border-t border-[var(--app-divider)] px-5 py-4">
            <FormActions
              onCancel={() => onOpenChange(false)}
              pending={pending}
              disabled={Boolean(validation)}
            />
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function Field({
  label,
  children,
  className = "",
  error,
}: {
  label: string
  children: ReactNode
  className?: string
  error?: string
}) {
  return (
    <label className={`grid gap-2 ${className}`}>
      <span className="text-xs font-bold text-[var(--app-heading)]">
        {label}
      </span>
      {children}
      {error ? (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      ) : null}
    </label>
  )
}
