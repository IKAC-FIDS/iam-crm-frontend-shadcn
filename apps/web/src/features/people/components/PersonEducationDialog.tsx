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

import { useUniversities } from "../hooks/usePeople"
import type {
  EducationHistory,
  EducationHistoryPayload,
  PersonEducationDegree,
} from "../types/person.types"
import { SearchableUniversitySelect } from "./SearchableUniversitySelect"

const degrees: PersonEducationDegree[] = [
  "DIPLOMA",
  "ASSOCIATE",
  "BACHELOR",
  "PHD",
  "POSTDOC",
]
function toDate(value?: string | null) {
  if (!value) return undefined
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? undefined : date
}
function toApiDate(value?: Date) {
  if (!value) return undefined
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`
}

const schema = z.object({
  degree: z.custom<PersonEducationDegree | "">(),
  universityId: z.string(),
  educationDate: z.date().optional(),
  description: z.string(),
})
type FormValues = z.infer<typeof schema>

export function PersonEducationDialog({
  open,
  onOpenChange,
  education,
  isPending,
  error,
  onSubmit,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  education?: EducationHistory | null
  isPending: boolean
  error?: unknown
  onSubmit: (payload: EducationHistoryPayload) => Promise<void>
}) {
  const text = uiText.people.education
  const universities = useUniversities(open)
  const defaultValues = useMemo<FormValues>(
    () => ({
      degree: education?.degree || "",
      universityId: education?.universityId || education?.university?.id || "",
      educationDate: toDate(education?.educationDate),
      description: education?.description || "",
    }),
    [education]
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
  const { degree, universityId, educationDate, description } = useWatch({
    control,
  }) as FormValues
  const setDegree = (value: FormValues["degree"]) =>
    setFieldValue("degree", value, { shouldDirty: true, shouldValidate: true })
  const setUniversityId = (value: FormValues["universityId"]) =>
    setFieldValue("universityId", value, {
      shouldDirty: true,
      shouldValidate: true,
    })
  const setEducationDate = (value: FormValues["educationDate"]) =>
    setFieldValue("educationDate", value, {
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
  const valid = Boolean(
    degree || universityId || educationDate || description.trim()
  )
  async function submit() {
    try {
      if (valid)
        await onSubmit({
          degree: degree || undefined,
          universityId: universityId || undefined,
          educationDate: toApiDate(educationDate),
          description: description.trim() || undefined,
        })
    } catch (error) {
      applyServerFieldErrors(error, setError, [
        "degree",
        "universityId",
        "educationDate",
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
          title={education ? text.edit : text.add}
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
          <Field label={text.degree} error={errors.degree?.message}>
            <select
              {...register("degree")}
              aria-invalid={Boolean(errors.degree)}
              value={degree}
              onChange={(event) =>
                setDegree(event.target.value as PersonEducationDegree | "")
              }
              className="h-11 rounded-xl border border-input bg-background px-3 text-sm"
            >
              <option value="">{text.selectDegree}</option>
              {degrees.map((item) => (
                <option key={item} value={item}>
                  {text.degrees[item]}
                </option>
              ))}
            </select>
          </Field>
          <Field label={text.university} error={errors.universityId?.message}>
            <SearchableUniversitySelect
              value={universityId || undefined}
              options={universities.data}
              onChange={(value) => setUniversityId(value || "")}
              disabled={universities.isError}
            />
          </Field>
          {universities.isError ? (
            <p className="rounded-xl bg-[var(--destructive)]/5 p-3 text-xs text-[var(--destructive)]">
              {text.universityPermissionError}
            </p>
          ) : null}
          <Field
            label={text.educationDate}
            error={errors.educationDate?.message}
          >
            <PersianDatePicker
              value={educationDate}
              onChange={setEducationDate}
            />
          </Field>
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
