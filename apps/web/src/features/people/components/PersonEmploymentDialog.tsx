import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { applyServerFieldErrors } from "@/lib/formErrors"
import { FormActions } from "@/components/shared/FormActions"
import { DialogHeroHeader } from "@/components/shared/DialogHeroHeader"
import { useEffect, useMemo } from "react"

import { uiText } from "@/config/uiText"
import { getApiErrorMessage } from "@/lib/apiResponse"
import { Dialog, DialogContent } from "@workspace/ui/components/dialog"

import type {
  EmploymentHistory,
  EmploymentHistoryPayload,
} from "../types/person.types"
import { SearchableCompanySelect } from "./SearchableCompanySelect"

const schema = z.object({
  companyId: z.string().min(1, uiText.common.forms.required),
  description: z.string(),
})
type FormValues = z.infer<typeof schema>

export function PersonEmploymentDialog({
  open,
  onOpenChange,
  employment,
  isPending,
  error,
  onSubmit,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  employment?: EmploymentHistory | null
  isPending: boolean
  error?: unknown
  onSubmit: (payload: EmploymentHistoryPayload) => Promise<void>
}) {
  const text = uiText.people.career
  const defaultValues = useMemo<FormValues>(
    () => ({
      companyId: employment?.companyId || employment?.company?.id || "",
      description: employment?.description || "",
    }),
    [employment]
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
  const { companyId, description } = useWatch({ control }) as FormValues
  const setCompanyId = (value: FormValues["companyId"]) =>
    setFieldValue("companyId", value, {
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
  async function submit() {
    try {
      if (companyId)
        await onSubmit({
          companyId,
          description: description.trim() || undefined,
        })
    } catch (error) {
      applyServerFieldErrors(error, setError, ["companyId", "description"])
    }
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        dir="rtl"
        className="max-h-[90vh] max-w-lg gap-0 overflow-y-auto rounded-[26px] border-[var(--app-divider)] bg-[var(--app-surface)] p-0"
      >
        <DialogHeroHeader
          title={employment ? text.editEmployment : text.addEmployment}
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
          <label className="grid gap-2">
            <span className="text-xs font-bold">
              {uiText.people.fields.company}
            </span>
            <SearchableCompanySelect
              value={companyId || undefined}
              onChange={(value) => setCompanyId(value || "")}
              allowEmpty={false}
            />
            {errors.companyId?.message ? (
              <span role="alert" className="text-xs text-destructive">
                {errors.companyId.message}
              </span>
            ) : null}
          </label>
          <label className="grid gap-2">
            <span className="text-xs font-bold">{text.companyDescription}</span>
            <textarea
              {...register("description")}
              aria-invalid={Boolean(errors.description)}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="min-h-28 rounded-xl border border-input bg-background p-3 text-sm"
            />
          </label>
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
