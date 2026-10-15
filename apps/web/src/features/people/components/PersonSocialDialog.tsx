import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { applyServerFieldErrors } from "@/lib/formErrors"
import { FormActions } from "@/components/shared/FormActions"
import {
  FormDialogBody,
  FormDialogFooter,
} from "@/components/shared/FormDialogLayout"
import { useEffect, useMemo } from "react"

import { uiText } from "@/config/uiText"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { FormField } from "@workspace/ui/components/form-field"
import { Input } from "@workspace/ui/components/input"
import { NativeSelect } from "@workspace/ui/components/native-select"
import { Textarea } from "@workspace/ui/components/textarea"

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
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (next || !isPending) onOpenChange(next)
      }}
    >
      <DialogContent
        closeButtonDisabled={isPending}
        dir="rtl"
        className="grid max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-lg grid-rows-[auto_minmax(0,1fr)_auto] gap-0 overflow-hidden rounded-[var(--app-radius-feature)] border-border bg-popover p-0 sm:max-h-[90dvh]"
      >
        <DialogHeader className="border-b border-border px-5 py-4 pe-16 text-start">
          <DialogTitle>{social ? text.edit : text.add}</DialogTitle>
          <DialogDescription>
            پلتفرم، شناسه و توضیحات ارتباط اجتماعی را ثبت کنید.
          </DialogDescription>
        </DialogHeader>
        <form
          noValidate
          onSubmit={handleSubmit(submit)}
          className="contents"
          aria-busy={isPending || undefined}
        >
          <FormDialogBody>
            {errors.root?.server?.message ? (
              <p role="alert" className="text-sm text-destructive">
                {errors.root.server.message}
              </p>
            ) : null}
            <FormField
              label={text.platform}
              required
              error={errors.platform?.message}
            >
              {(fieldProps) => (
                <NativeSelect
                  {...register("platform")}
                  {...fieldProps}
                  autoFocus
                  value={platform}
                  onChange={(event) =>
                    setPlatform(event.target.value as PersonSocialPlatform)
                  }
                >
                  {PERSON_SOCIAL_PLATFORM_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </NativeSelect>
              )}
            </FormField>
            <FormField
              label={text.handle}
              required
              error={errors.handle?.message}
            >
              {(fieldProps) => (
                <Input
                  {...register("handle")}
                  {...fieldProps}
                  dir="auto"
                  value={handle}
                  onChange={(event) => setHandle(event.target.value)}
                />
              )}
            </FormField>
            <FormField label={text.note} optional error={errors.note?.message}>
              {(fieldProps) => (
                <Textarea
                  {...register("note")}
                  {...fieldProps}
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                />
              )}
            </FormField>
            <label className="flex min-h-11 items-center gap-2 text-sm text-foreground">
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
          </FormDialogBody>
          <FormDialogFooter>
            <FormActions
              pending={isPending}
              onCancel={() => onOpenChange(false)}
              submitLabel={uiText.people.actions.save}
            />
          </FormDialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
function InlineError({ message }: { message: string }) {
  return (
    <p className="rounded-xl bg-[var(--destructive)]/5 p-3 text-xs text-[var(--destructive)]">
      {message}
    </p>
  )
}
