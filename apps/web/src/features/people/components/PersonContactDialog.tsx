import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { applyServerFieldErrors } from "@/lib/formErrors"
import { FormActions } from "@/components/shared/FormActions"
import { DialogHeroHeader } from "@/components/shared/DialogHeroHeader"
import { useEffect, useMemo } from "react"

import { uiText } from "@/config/uiText"
import { Dialog, DialogContent } from "@workspace/ui/components/dialog"
import { Input } from "@workspace/ui/components/input"

import { usePeopleLookup } from "../hooks/usePeople"
import type { PersonContact, PersonContactPayload } from "../types/person.types"
import { getPeopleErrorMessage } from "../utils/peopleError"

const schema = z.object({
  typeOptionId: z.string().min(1, uiText.common.forms.required),
  value: z.string().trim().min(1, uiText.common.forms.required),
  note: z.string(),
  isPrimary: z.boolean(),
})
type FormValues = z.infer<typeof schema>

export function PersonContactDialog({
  open,
  onOpenChange,
  contact,
  isPending,
  error,
  onSubmit,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  contact?: PersonContact | null
  isPending: boolean
  error?: unknown
  onSubmit: (payload: PersonContactPayload) => Promise<void>
}) {
  const text = uiText.people.contactHub
  const contactTypesQuery = usePeopleLookup("contact_types")
  const contactTypes = Array.isArray(contactTypesQuery.data)
    ? contactTypesQuery.data
    : []
  const legacyType = contact && !contact.typeOptionId ? contact.type : null
  const defaultValues = useMemo<FormValues>(
    () => ({
      typeOptionId: contact?.typeOptionId || "",
      value: contact?.value || "",
      note: contact?.note || "",
      isPrimary: Boolean(contact?.isPrimary),
    }),
    [contact]
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
  const { typeOptionId, value, note, isPrimary } = useWatch({ control }) as FormValues
  const setTypeOptionId = (value: FormValues["typeOptionId"]) =>
    setFieldValue("typeOptionId", value, { shouldDirty: true, shouldValidate: true })
  const setValue = (value: FormValues["value"]) =>
    setFieldValue("value", value, { shouldDirty: true, shouldValidate: true })
  const setNote = (value: FormValues["note"]) =>
    setFieldValue("note", value, { shouldDirty: true, shouldValidate: true })
  const setIsPrimary = (value: FormValues["isPrimary"]) =>
    setFieldValue("isPrimary", value, {
      shouldDirty: true,
      shouldValidate: true,
    })
  useEffect(() => {
    if (open) reset(defaultValues)
  }, [open, defaultValues, reset])
  async function submit() {
    try {
      if (!value.trim() || !contactTypes.some((option) => option.id === typeOptionId)) return
      await onSubmit({
        typeOptionId,
        value: value.trim(),
        note: note.trim() || undefined,
        isPrimary,
      })
    } catch (error) {
      applyServerFieldErrors(error, setError, [
        "typeOptionId",
        "value",
        "note",
        "isPrimary",
      ])
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
          title={contact ? text.edit : text.add}
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
          <Field label={text.type} error={errors.typeOptionId?.message}>
            <select
              {...register("typeOptionId")}
              aria-invalid={Boolean(errors.typeOptionId)}
              value={typeOptionId}
              onChange={(event) => setTypeOptionId(event.target.value)}
              disabled={contactTypesQuery.isLoading || contactTypesQuery.isError}
              className="h-11 rounded-xl border border-input bg-background px-3 text-sm"
            >
              <option value="">{text.selectType}</option>
              {contactTypes.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
            {legacyType ? (
              <span className="text-xs text-[var(--app-text-secondary)]">
                نوع قدیمی «{legacyType}» فقط برای نمایش نگه‌داری شده است؛ برای ذخیره، یک نوع معتبر انتخاب کنید.
              </span>
            ) : null}
          </Field>
          {contactTypesQuery.isError ? (
            <InlineError
              message={getPeopleErrorMessage(
                contactTypesQuery.error,
                uiText.people.nested.loadError
              )}
            />
          ) : null}
          <Field label={text.value} error={errors.value?.message}>
            <Input
              {...register("value")}
              aria-invalid={Boolean(errors.value)}
              dir="auto"
              value={value}
              onChange={(event) => setValue(event.target.value)}
              className="h-11 rounded-xl"
            />
          </Field>
          <Field label={text.note} error={errors.note?.message}>
            <textarea
              {...register("note")}
              aria-invalid={Boolean(errors.note)}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              className="min-h-24 rounded-xl border border-input bg-background p-3 text-sm"
            />
          </Field>
          <label className="flex items-center gap-2 text-sm text-[var(--app-heading)]">
            <input
              type="checkbox"
              checked={isPrimary}
              onChange={(event) => setIsPrimary(event.target.checked)}
            />
            {text.primary}
          </label>
          {error ? (
            <InlineError
              message={getPeopleErrorMessage(
                error,
                uiText.people.nested.mutationError
              )}
            />
          ) : null}
          <FormActions
            pending={isPending}
            disabled={
              contactTypesQuery.isLoading ||
              contactTypesQuery.isError ||
              !contactTypes.some((option) => option.id === typeOptionId)
            }
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
      <span className="text-xs font-bold text-[var(--app-heading)]">
        {label}
      </span>
      {children}
      {error ? (
        <span role="alert" className="text-xs text-destructive">
          {error}
        </span>
      ) : null}
    </label>
  )
}
function InlineError({ message }: { message: string }) {
  return (
    <p className="rounded-xl bg-[var(--destructive)]/5 p-3 text-xs text-[var(--destructive)]">
      {message}
    </p>
  )
}
