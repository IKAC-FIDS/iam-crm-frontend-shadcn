import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { applyServerFieldErrors } from "@/lib/formErrors"
import { FormActions } from "@/components/shared/FormActions"
import { FormSection } from "@/components/shared/FormSection"
import { useMemo, useEffect } from "react"

import { DialogHeroHeader } from "@/components/shared/DialogHeroHeader"
import { uiText } from "@/config/uiText"
import { Dialog, DialogContent } from "@workspace/ui/components/dialog"
import { Input } from "@workspace/ui/components/input"

import type {
  LookupOption,
  PeopleLookupSet,
  PersonDetail,
  PersonMutationPayload,
} from "../types/person.types"
import { SearchableCompanySelect } from "./SearchableCompanySelect"

type FormState = {
  companyId: string
  fullName: string
  jobTitle: string
  department: string
  personaRole: string
  seniorityLevel: string
  isPrimaryContact: boolean
  isSecondaryContact: boolean
}

const emptyForm: FormState = {
  companyId: "",
  fullName: "",
  jobTitle: "",
  department: "",
  personaRole: "",
  seniorityLevel: "",
  isPrimaryContact: false,
  isSecondaryContact: false,
}

function stateFromPerson(person?: PersonDetail | null): FormState {
  if (!person) return emptyForm
  return {
    companyId: person.companyId ?? "",
    fullName: person.fullName ?? "",
    jobTitle: person.jobTitle || person.title || "",
    department: person.department ?? "",
    personaRole: person.personaRole || person.personaTag || "",
    seniorityLevel: person.seniorityLevel ?? "",
    isPrimaryContact: Boolean(person.isPrimaryContact),
    isSecondaryContact: Boolean(person.isSecondaryContact),
  }
}

export function PersonFormDialog({
  open,
  onOpenChange,
  mode,
  person,
  initialCompanyId,
  lockCompany = false,
  lookups,
  isPending,
  onSubmit,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "create" | "edit"
  person?: PersonDetail | null
  initialCompanyId?: string
  lockCompany?: boolean
  lookups: PeopleLookupSet
  isPending?: boolean
  onSubmit: (payload: PersonMutationPayload) => Promise<void>
}) {
  const text = uiText.people
  const defaultValues = useMemo(
    () => ({
      ...stateFromPerson(person),
      companyId: person?.companyId || initialCompanyId || "",
    }),
    [person, initialCompanyId]
  )
  const schema = z
    .object({
      companyId: z.string(),
      fullName: z.string().trim().min(1, uiText.common.forms.required),
      jobTitle: z.string(),
      department: z.string(),
      personaRole: z.string(),
      seniorityLevel: z.string(),
      isPrimaryContact: z.boolean(),
      isSecondaryContact: z.boolean(),
    })
    .refine((value) => mode === "edit" || Boolean(value.companyId), {
      path: ["companyId"],
      message: uiText.common.forms.required,
    })
  const {
    control,
    register,
    setValue,
    reset,
    setError,
    clearErrors,
    handleSubmit,
    formState: { errors },
  } = useForm<FormState>({ defaultValues, resolver: zodResolver(schema) })
  const form = useWatch({ control }) as FormState
  useEffect(() => {
    if (open) reset(defaultValues)
  }, [open, defaultValues, reset])
  const valid = useMemo(
    () =>
      Boolean(form.fullName.trim()) &&
      (mode === "edit" || Boolean(form.companyId)),
    [form.companyId, form.fullName, mode]
  )

  function patch(values: Partial<FormState>) {
    Object.entries(values).forEach(([key, value]) =>
      setValue(key as keyof FormState, value, {
        shouldDirty: true,
        shouldValidate: true,
      })
    )
  }

  async function submit() {
    clearErrors()
    if (!valid) return

    try {
      await onSubmit({
        ...(mode === "create" ? { companyId: form.companyId } : {}),
        fullName: form.fullName.trim(),
        jobTitle: form.jobTitle || undefined,
        department: form.department || undefined,
        personaRole: form.personaRole || undefined,
        seniorityLevel: form.seniorityLevel || undefined,
        isPrimaryContact: form.isPrimaryContact,
        isSecondaryContact: form.isSecondaryContact,
      })
    } catch (error) {
      applyServerFieldErrors(
        error,
        setError,
        Object.keys(emptyForm) as (keyof FormState)[]
      )
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        dir="rtl"
        className="max-h-[90vh] w-[min(900px,calc(100vw-24px))] max-w-none gap-0 overflow-hidden rounded-[30px] border-[var(--app-divider)] bg-[var(--app-surface)] p-0 shadow-[var(--app-shadow-elevated)] sm:max-w-none"
      >
        <DialogHeroHeader
          title={
            mode === "create" ? text.form.createTitle : text.form.editTitle
          }
          description={text.form.description}
          closeLabel={text.actions.close}
          onClose={() => onOpenChange(false)}
        />

        <form
          noValidate
          onSubmit={handleSubmit(submit)}
          className="min-h-0 overflow-y-auto p-5 sm:p-7"
        >
          <div className="grid gap-5 lg:grid-cols-2">
            <FormSection
              title={text.form.identityTitle}
              description={text.form.identityDescription}
            >
              <Field
                label={text.fields.fullName}
                error={errors.fullName?.message}
              >
                <Input
                  {...register("fullName")}
                  aria-invalid={Boolean(errors.fullName)}
                  autoFocus
                  value={form.fullName}
                  onChange={(event) => patch({ fullName: event.target.value })}
                  className="h-11 rounded-xl"
                />
              </Field>

              {mode === "create" ? (
                <Field
                  label={text.fields.company}
                  error={errors.companyId?.message}
                >
                  <SearchableCompanySelect
                    value={form.companyId || undefined}
                    onChange={(companyId) => {
                      if (!lockCompany) {
                        patch({ companyId: companyId ?? "" })
                      }
                    }}
                    placeholder={text.form.selectCompany}
                    allowEmpty={false}
                    disabled={lockCompany}
                  />
                </Field>
              ) : null}

              <Field
                label={text.fields.jobTitle}
                error={errors.jobTitle?.message}
              >
                <LookupSelect
                  value={form.jobTitle}
                  options={lookups.jobTitles}
                  placeholder={text.form.selectJobTitle}
                  onChange={(jobTitle) => patch({ jobTitle })}
                />
              </Field>

              <Field
                label={text.fields.department}
                error={errors.department?.message}
              >
                <LookupSelect
                  value={form.department}
                  options={lookups.departments}
                  placeholder={text.form.selectDepartment}
                  onChange={(department) => patch({ department })}
                />
              </Field>

              <div>
                <p className="mb-2 text-xs font-bold text-[var(--app-heading)]">
                  {text.fields.contactRole}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <label className="flex items-center gap-2 rounded-xl border border-[var(--app-divider)] bg-[var(--app-background)] px-3 py-2.5 text-xs font-bold text-[var(--app-heading)]">
                    <input
                      type="checkbox"
                      checked={form.isPrimaryContact}
                      onChange={(event) =>
                        patch({ isPrimaryContact: event.target.checked })
                      }
                    />
                    {text.contactRole.primary}
                  </label>
                  <label className="flex items-center gap-2 rounded-xl border border-[var(--app-divider)] bg-[var(--app-background)] px-3 py-2.5 text-xs font-bold text-[var(--app-heading)]">
                    <input
                      type="checkbox"
                      checked={form.isSecondaryContact}
                      onChange={(event) =>
                        patch({ isSecondaryContact: event.target.checked })
                      }
                    />
                    {text.contactRole.secondary}
                  </label>
                </div>
              </div>
            </FormSection>

            <FormSection
              title={text.form.salesProfileTitle}
              description={text.form.salesProfileDescription}
            >
              <Field
                label={text.fields.personaRole}
                error={errors.personaRole?.message}
              >
                <LookupSelect
                  value={form.personaRole}
                  options={lookups.personaRoles}
                  placeholder={text.form.selectPersonaRole}
                  onChange={(personaRole) => patch({ personaRole })}
                />
              </Field>

              <Field
                label={text.fields.seniorityLevel}
                error={errors.seniorityLevel?.message}
              >
                <LookupSelect
                  value={form.seniorityLevel}
                  options={lookups.seniorityLevels}
                  placeholder={text.form.selectSeniority}
                  onChange={(seniorityLevel) => patch({ seniorityLevel })}
                />
              </Field>
            </FormSection>
          </div>

          {errors.root?.server?.message ? (
            <p role="alert" className="text-sm text-destructive">
              {errors.root.server.message}
            </p>
          ) : null}
          <FormActions
            onCancel={() => onOpenChange(false)}
            pending={Boolean(isPending)}
            disabled={!valid}
          />
        </form>
      </DialogContent>
    </Dialog>
  )
}

function LookupSelect({
  value,
  options,
  placeholder,
  onChange,
}: {
  value: string
  options: LookupOption[]
  placeholder: string
  onChange: (value: string) => void
}) {
  const safeOptions = Array.isArray(options) ? options : []
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
    >
      <option value="">{placeholder}</option>
      {safeOptions.map((option) => (
        <option key={option.id} value={option.code}>
          {option.label}
        </option>
      ))}
    </select>
  )
}

function Field({
  label,
  children,
  error,
}: {
  label: string
  error?: string
  children: React.ReactNode
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
