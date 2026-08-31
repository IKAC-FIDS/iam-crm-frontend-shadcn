import {
  FormDialogBody,
  FormDialogFooter,
} from "@/components/shared/FormDialogLayout"
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
import { Button } from "@workspace/ui/components/button"

import {
  useActivityOpportunityOptions,
  useActivityPeopleOptions,
  useActivityTaskOptions,
  useCreateActivity,
  useUpdateActivity,
  useActivityTypes,
} from "../hooks/useActivities"
import {
  type Activity,
  type ActivityOption,
  type ActivityTargetType,
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
  targetType: z.enum(["COMPANY", "TASK"]),
  companyId: z.string(),
  task: z.custom<ActivityOption>().optional(),
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
  initialTargetType,
  initialTask,
  lockTarget = false,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  activity?: Activity | null
  initialTargetType?: ActivityTargetType
  initialTask?: ActivityOption
  lockTarget?: boolean
}) {
  const editing = Boolean(activity)
  const create = useCreateActivity()
  const update = useUpdateActivity()
  const pending = create.isPending || update.isPending
  const activityTypes = useActivityTypes(open)

  const defaultValues = useMemo<FormValues>(() => {
    const existingCompanyId = activity?.companyId || activity?.company?.id || ""
    const existingPersonId = activity?.personId || activity?.person?.id || ""
    const targetType =
      activity?.targetType ||
      initialTargetType ||
      (initialTask ? "TASK" : "COMPANY")
    return {
      targetType,
      companyId: targetType === "COMPANY" ? existingCompanyId : "",
      task:
        targetType === "TASK"
          ? initialTask ||
            (activity?.task
              ? {
                  id: activity.task.id,
                  label: activity.task.title,
                  secondary: activity.task.parentTask?.title
                    ? `زیرکار «${activity.task.parentTask.title}»`
                    : "کار اصلی",
                }
              : undefined)
          : undefined,
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
  }, [activity, initialTargetType, initialTask])

  const {
    control,
    register,
    setValue,
    reset,
    setError,
    clearErrors,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues,
    resolver: zodResolver(formSchema),
  })

  const values = useWatch({ control }) as FormValues
  const { targetType, companyId, task, person, opportunity, type, notes, outcome, occurredAt, nextActionDate } = values

  const [taskSearch, setTaskSearch] = useState("")
  const [opportunitySearch, setOpportunitySearch] = useState("")
  const [personSearch, setPersonSearch] = useState("")

  useEffect(() => {
    if (open) {
      reset(activity ? defaultValues : { ...defaultValues, occurredAt: new Date() })
    }
  }, [open, defaultValues, reset, activity])

  function handleDialogOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      setTaskSearch("")
      setOpportunitySearch("")
      setPersonSearch("")
    }
    onOpenChange(nextOpen)
  }

  const tasks = useActivityTaskOptions(
    useDebounced(taskSearch),
    open && !editing && targetType === "TASK" && !lockTarget
  )
  const people = useActivityPeopleOptions(
    companyId,
    useDebounced(personSearch),
    open && targetType === "COMPANY" && Boolean(companyId)
  )
  const opportunities = useActivityOpportunityOptions(
    companyId,
    useDebounced(opportunitySearch),
    open && !editing && targetType === "COMPANY" && Boolean(companyId)
  )

  const validation = useMemo(() => {
    if (targetType === "COMPANY" && !companyId)
      return "انتخاب شرکت الزامی است."
    if (targetType === "TASK" && !task?.id)
      return "انتخاب کار یا زیرکار الزامی است."
    if (!type) return "انتخاب نوع فعالیت الزامی است."
    if (activityTypes.isError)
      return "دریافت انواع فعالیت ناموفق بود؛ فرم را دوباره باز کنید."
    return ""
  }, [targetType, companyId, task?.id, type, activityTypes.isError])

  function changeTarget(next: ActivityTargetType) {
    if (editing || lockTarget) return
    setValue("targetType", next, { shouldDirty: true, shouldValidate: true })
    setValue("companyId", "", { shouldDirty: true })
    setValue("task", undefined, { shouldDirty: true })
    setValue("person", undefined, { shouldDirty: true })
    setValue("opportunity", undefined, { shouldDirty: true })
  }

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
          targetType,
          companyId: targetType === "COMPANY" ? companyId : undefined,
          taskId: targetType === "TASK" ? task?.id : undefined,
          type,
          personId: targetType === "COMPANY" ? person?.id : undefined,
          opportunityId:
            targetType === "COMPANY" ? opportunity?.id : undefined,
          notes: notes.trim() || undefined,
          outcome: outcome.trim() || undefined,
          occurredAt: occurredAt?.toISOString(),
          nextActionDate: nextActionDate?.toISOString(),
        }
        await create.mutateAsync(payload)
        toast.success("فعالیت با موفقیت ثبت شد.")
      }
      handleDialogOpenChange(false)
    } catch (error) {
      applyServerFieldErrors(
        error,
        setError,
        [
          "companyId",
          "task",
          "person",
          "opportunity",
          "type",
          "notes",
          "outcome",
          "occurredAt",
          "nextActionDate",
        ],
        {
          taskId: "task",
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
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent
        showCloseButton={false}
        dir="rtl"
        className="max-h-[94vh] w-full max-w-[calc(100%_-_1rem)] min-w-0 grid-rows-[auto_minmax(0,1fr)_auto] gap-0 overflow-hidden rounded-[26px] p-0 sm:max-w-[820px]"
      >
        <DialogHeroHeader
          title={editing ? "ویرایش فعالیت" : "ثبت فعالیت جدید"}
          description={
            editing
              ? "اطلاعات فعالیت را ویرایش کنید. مقصد اصلی فعالیت قابل تغییر نیست."
              : "فعالیت را مستقیماً برای یک شرکت یا برای یک کار/زیرکار ثبت کنید."
          }
          onClose={() => handleDialogOpenChange(false)}
        />

        <form className="contents" noValidate onSubmit={handleSubmit(submit)}>
          <FormDialogBody>
            {errors.root?.server?.message ? (
              <p role="alert" className="text-sm text-destructive">
                {errors.root.server.message}
              </p>
            ) : null}

            <FormSection
              title="مقصد فعالیت"
              description="مشخص کنید فعالیت برای شرکت ثبت می‌شود یا برای یک کار/زیرکار."
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <Button
                  type="button"
                  variant={targetType === "COMPANY" ? "default" : "outline"}
                  className="h-11 rounded-xl"
                  disabled={editing || lockTarget}
                  onClick={() => changeTarget("COMPANY")}
                >
                  شرکت
                </Button>
                <Button
                  type="button"
                  variant={targetType === "TASK" ? "default" : "outline"}
                  className="h-11 rounded-xl"
                  disabled={editing || lockTarget}
                  onClick={() => changeTarget("TASK")}
                >
                  کار / زیرکار
                </Button>
              </div>

              <div className="mt-4">
                {targetType === "COMPANY" ? (
                  <Field label="شرکت *" error={errors.companyId?.message}>
                    <SearchableCompanySelect
                      value={companyId || undefined}
                      onChange={(next) => {
                        if (editing) return
                        setValue("companyId", next || "", {
                          shouldDirty: true,
                          shouldValidate: true,
                        })
                        setValue("person", undefined, { shouldDirty: true })
                        setValue("opportunity", undefined, { shouldDirty: true })
                      }}
                      disabled={editing}
                      allowEmpty={!editing}
                      placeholder="انتخاب شرکت"
                    />
                  </Field>
                ) : (
                  <Field label="کار / زیرکار *" error={errors.task?.message}>
                    <ActivityOptionSelect
                      value={task?.id}
                      selectedOption={task}
                      options={tasks.data || (task ? [task] : [])}
                      onChange={(next) =>
                        setValue("task", next, {
                          shouldDirty: true,
                          shouldValidate: true,
                        })
                      }
                      search={taskSearch}
                      onSearchChange={setTaskSearch}
                      placeholder="جستجو و انتخاب کار یا زیرکار"
                      loading={tasks.isLoading}
                      disabled={editing || lockTarget}
                    />
                  </Field>
                )}
              </div>
            </FormSection>

            <FormSection
              title="اطلاعات فعالیت"
              description="نوع، زمان، نتیجه و توضیحات فعالیت"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="نوع فعالیت *" error={errors.type?.message}>
                  <select
                    {...register("type")}
                    aria-invalid={Boolean(errors.type)}
                    value={type}
                    onChange={(event) =>
                      setValue("type", event.target.value as ManualActivityType, {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
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
                          disabled={!item.isActive && item.code !== activity?.type}
                        >
                          {item.label}
                        </option>
                      ))}
                  </select>
                </Field>

                {targetType === "COMPANY" ? (
                  <Field label="شخص" error={errors.person?.message}>
                    <ActivityOptionSelect
                      value={person?.id}
                      selectedOption={person}
                      options={people.data || []}
                      onChange={(next) =>
                        setValue("person", next, { shouldDirty: true })
                      }
                      search={personSearch}
                      onSearchChange={setPersonSearch}
                      placeholder={
                        companyId
                          ? "انتخاب شخص"
                          : "ابتدا شرکت را انتخاب کنید"
                      }
                      loading={people.isLoading}
                      disabled={!companyId}
                    />
                  </Field>
                ) : null}

                {!editing && targetType === "COMPANY" ? (
                  <Field label="فرصت فروش" error={errors.opportunity?.message}>
                    <ActivityOptionSelect
                      value={opportunity?.id}
                      selectedOption={opportunity}
                      options={opportunities.data || []}
                      onChange={(next) =>
                        setValue("opportunity", next, { shouldDirty: true })
                      }
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
                    onChange={(next) =>
                      setValue("occurredAt", next, { shouldDirty: true })
                    }
                  />
                </Field>

                {!editing ? (
                  <Field
                    label="پیگیری بعدی"
                    error={errors.nextActionDate?.message}
                  >
                    <PersianDateTimePicker
                      value={nextActionDate}
                      onChange={(next) =>
                        setValue("nextActionDate", next, { shouldDirty: true })
                      }
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
                    onChange={(event) =>
                      setValue("outcome", event.target.value, {
                        shouldDirty: true,
                      })
                    }
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
                    onChange={(event) =>
                      setValue("notes", event.target.value, {
                        shouldDirty: true,
                      })
                    }
                    placeholder="توضیحات و نکات مرتبط با فعالیت"
                    className={textareaClass}
                  />
                </Field>
              </div>
            </FormSection>
          </FormDialogBody>

          <FormDialogFooter>
            <FormActions
              onCancel={() => handleDialogOpenChange(false)}
              pending={pending}
              disabled={Boolean(validation)}
            />
          </FormDialogFooter>
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
