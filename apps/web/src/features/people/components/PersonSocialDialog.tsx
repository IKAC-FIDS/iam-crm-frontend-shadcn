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

import { PERSON_SOCIAL_PLATFORM_OPTIONS } from "../constants/personOptions"
import type {
  PersonSocial,
  PersonSocialPayload,
  PersonSocialPlatform,
} from "../types/person.types"
import { getPeopleErrorMessage } from "../utils/peopleError"

const schema = z.object({
  platform: z.custom<PersonSocialPlatform>(),
  handle: z.string().trim().min(1, uiText.common.forms.required),
  note: z.string(),
  isPrimary: z.boolean(),
})
type FormValues = z.infer<typeof schema>

export function PersonSocialDialog({
  open,
  onOpenChange,
  social,
  isPending,
  error,
  onSubmit,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  social?: PersonSocial | null
  isPending: boolean
  error?: unknown
  onSubmit: (payload: PersonSocialPayload) => Promise<void>
}) {
  const text = uiText.people.socialIdentity
  const defaultValues = useMemo<FormValues>(
    () => ({
      platform: PERSON_SOCIAL_PLATFORM_OPTIONS.some(
        (option) => option.value === social?.platform
      )
        ? (social?.platform as PersonSocialPlatform)
        : "LINKEDIN",
      handle: social?.handle || "",
      note: social?.note || "",
      isPrimary: Boolean(social?.isPrimary),
    }),
    [social]
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
  const { platform, handle, note, isPrimary } = useWatch({
    control,
  }) as FormValues
  const setPlatform = (value: FormValues["platform"]) =>
    setFieldValue("platform", value, {
      shouldDirty: true,
      shouldValidate: true,
    })
  const setHandle = (value: FormValues["handle"]) =>
    setFieldValue("handle", value, { shouldDirty: true, shouldValidate: true })
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
      if (handle.trim())
        await onSubmit({
          platform,
          handle: handle.trim(),
          note: note.trim() || undefined,
          isPrimary,
        })
    } catch (error) {
      applyServerFieldErrors(error, setError, [
        "platform",
        "handle",
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
          title={social ? text.edit : text.add}
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
          <Field label={text.platform} error={errors.platform?.message}>
            <select
              {...register("platform")}
              aria-invalid={Boolean(errors.platform)}
              value={platform}
              onChange={(event) =>
                setPlatform(event.target.value as PersonSocialPlatform)
              }
              className="h-11 rounded-xl border border-input bg-background px-3 text-sm"
            >
              {PERSON_SOCIAL_PLATFORM_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label={text.handle} error={errors.handle?.message}>
            <Input
              {...register("handle")}
              aria-invalid={Boolean(errors.handle)}
              dir="auto"
              value={handle}
              onChange={(event) => setHandle(event.target.value)}
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
