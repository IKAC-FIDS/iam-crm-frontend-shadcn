import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { applyServerFieldErrors } from "@/lib/formErrors"
import { FormActions } from "@/components/shared/FormActions"
import { DialogHeroHeader } from "@/components/shared/DialogHeroHeader"
import { useEffect, useMemo } from "react"

import { PersianDatePicker } from "@/components/shared/PersianDatePicker"
import { uiText } from "@/config/uiText"
import { getApiErrorMessage } from "@/lib/apiResponse"
import { Dialog, DialogContent } from "@workspace/ui/components/dialog"
import { Input } from "@workspace/ui/components/input"

import type {
  EmploymentPosition,
  EmploymentPositionPayload,
} from "../types/person.types"

function toDate(value?: string | null) {
  if (!value) return undefined
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? undefined : date
}
function toApiDate(value?: Date) {
  if (!value) return undefined
  const year = value.getFullYear()
  const month = String(value.getMonth() + 1).padStart(2, "0")
  const day = String(value.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

const schema = z.object({
  title: z.string().trim().min(1, uiText.common.forms.required),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  isCurrent: z.boolean(),
  description: z.string(),
})
type FormValues = z.infer<typeof schema>

export function PersonPositionDialog({
  open,
  onOpenChange,
  position,
  isPending,
  error,
  onSubmit,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  position?: EmploymentPosition | null
  isPending: boolean
  error?: unknown
  onSubmit: (payload: EmploymentPositionPayload) => Promise<void>
}) {
  const text = uiText.people.career
  const defaultValues = useMemo<FormValues>(
    () => ({
      title: position?.title || "",
      startDate: toDate(position?.startDate),
      endDate: toDate(position?.endDate),
      isCurrent: Boolean(position?.isCurrent),
      description: position?.description || "",
    }),
    [position]
  )
  const {
    control,
    register,
    setValue: setFieldValue,
    reset,
    setError,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ defaultValues, resolver: zodResolver(schema) })
  const { title, startDate, endDate, isCurrent, description } = useWatch({
    control,
  }) as FormValues
  const setTitle = (value: FormValues["title"]) =>
    setFieldValue("title", value, { shouldDirty: true, shouldValidate: true })
  const setStartDate = (value: FormValues["startDate"]) =>
    setFieldValue("startDate", value, {
      shouldDirty: true,
      shouldValidate: true,
    })
  const setEndDate = (value: FormValues["endDate"]) =>
    setFieldValue("endDate", value, { shouldDirty: true, shouldValidate: true })
  const setIsCurrent = (value: FormValues["isCurrent"]) =>
    setFieldValue("isCurrent", value, {
      shouldDirty: true,
      shouldValidate: true,
    })
  const setDescription = (value: FormValues["description"]) =>
    setFieldValue("description", value, {
      shouldDirty: true,
      shouldValidate: true,
    })
  useEffect(() => {
    if (open) reset(defaultValues)
  }, [open, defaultValues, reset])
  const dateInvalid = useMemo(
    () => Boolean(startDate && endDate && endDate < startDate),
    [endDate, startDate]
  )
  async function submit() {
    try {
      if (!title.trim() || dateInvalid) return
      await onSubmit({
        title: title.trim(),
        startDate: toApiDate(startDate),
        endDate: isCurrent ? undefined : toApiDate(endDate),
        isCurrent,
        description: description.trim() || undefined,
      })
    } catch (error) {
      applyServerFieldErrors(error, setError, [
        "title",
        "startDate",
        "endDate",
        "isCurrent",
        "description",
      ])
    }
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        dir="rtl"
        className="max-h-[90vh] max-w-xl gap-0 overflow-y-auto rounded-[26px] border-[var(--app-divider)] bg-[var(--app-surface)] p-0"
      >
        <DialogHeroHeader
          title={position ? text.editPosition : text.addPosition}
          onClose={() => onOpenChange(false)}
        />
        <form
          noValidate
          onSubmit={handleSubmit(submit)}
          className="grid gap-4 p-5"
        >
          {errors.root?.server?.message ? (
            <p role="alert" className="text-sm text-destructive">
              {errors.root.server.message}
            </p>
          ) : null}
          <Field label={text.positionTitle} error={errors.title?.message}>
            <Input
              {...register("title")}
              aria-invalid={Boolean(errors.title)}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="h-11 rounded-xl"
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={text.startDate} error={errors.startDate?.message}>
              <PersianDatePicker value={startDate} onChange={setStartDate} />
            </Field>
            <Field label={text.endDate} error={errors.endDate?.message}>
              <PersianDatePicker
                value={endDate}
                onChange={setEndDate}
                minDate={startDate}
                disabled={isCurrent}
              />
            </Field>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={isCurrent}
              onChange={(event) => {
                setIsCurrent(event.target.checked)
                if (event.target.checked) setEndDate(undefined)
              }}
            />
            {text.currentQuestion}
          </label>
          {dateInvalid ? (
            <p className="text-xs text-[var(--destructive)]">
              {text.dateError}
            </p>
          ) : null}
          <Field label={text.description} error={errors.description?.message}>
            <textarea
              {...register("description")}
              aria-invalid={Boolean(errors.description)}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="min-h-24 rounded-xl border border-input bg-background p-3 text-sm"
            />
          </Field>
          {error ? (
            <p className="rounded-xl bg-[var(--destructive)]/5 p-3 text-xs text-[var(--destructive)]">
              {getApiErrorMessage(error, uiText.people.nested.mutationError)}
            </p>
          ) : null}
          <FormActions
            pending={isPending}
            onCancel={() => onOpenChange(false)}
            submitLabel={uiText.people.actions.save}
          />
        </form>
      </DialogContent>
    </Dialog>
  )
}
function Field({
  label,
  children,
  error,
}: {
  label: string
  children: React.ReactNode
  error?: string
}) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font-bold">{label}</span>
      {children}
      {error ? (
        <span role="alert" className="text-xs text-destructive">
          {error}
        </span>
      ) : null}
    </label>
  )
}
