import { useMemo, useState } from "react"

import { DialogHeroHeader } from "@/components/shared/DialogHeroHeader"
import { uiText } from "@/config/uiText"
import { Button } from "@workspace/ui/components/button"
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
  const [form, setForm] = useState<FormState>(() => ({
    ...stateFromPerson(person),
    companyId: person?.companyId || initialCompanyId || "",
  }))

  const resetInputs0 = [initialCompanyId, open, person] as const
  const [previousResetInputs0, setPreviousResetInputs0] = useState<typeof resetInputs0 | null>(null)
  if (previousResetInputs0 === null || previousResetInputs0[0] !== resetInputs0[0] || previousResetInputs0[1] !== resetInputs0[1] || previousResetInputs0[2] !== resetInputs0[2]) {
    setPreviousResetInputs0(resetInputs0)
    if (open) {
      setForm({
        ...stateFromPerson(person),
        companyId: person?.companyId || initialCompanyId || "",
      })
    }
  }

  const valid = useMemo(
    () =>
      Boolean(form.fullName.trim()) &&
      (mode === "edit" || Boolean(form.companyId)),
    [form.companyId, form.fullName, mode]
  )

  function patch(values: Partial<FormState>) {
    setForm((current) => ({ ...current, ...values }))
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    if (!valid) return

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

        <form onSubmit={submit} className="min-h-0 overflow-y-auto p-5 sm:p-7">
          <div className="grid gap-5 lg:grid-cols-2">
            <FormSection
              title={text.form.identityTitle}
              description={text.form.identityDescription}
            >
              <Field label={text.fields.fullName}>
                <Input
                  autoFocus
                  value={form.fullName}
                  onChange={(event) => patch({ fullName: event.target.value })}
                  className="h-11 rounded-xl"
                />
              </Field>

              {mode === "create" ? (
                <Field label={text.fields.company}>
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

              <Field label={text.fields.jobTitle}>
                <LookupSelect
                  value={form.jobTitle}
                  options={lookups.jobTitles}
                  placeholder={text.form.selectJobTitle}
                  onChange={(jobTitle) => patch({ jobTitle })}
                />
              </Field>

              <Field label={text.fields.department}>
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
              <Field label={text.fields.personaRole}>
                <LookupSelect
                  value={form.personaRole}
                  options={lookups.personaRoles}
                  placeholder={text.form.selectPersonaRole}
                  onChange={(personaRole) => patch({ personaRole })}
                />
              </Field>

              <Field label={text.fields.seniorityLevel}>
                <LookupSelect
                  value={form.seniorityLevel}
                  options={lookups.seniorityLevels}
                  placeholder={text.form.selectSeniority}
                  onChange={(seniorityLevel) => patch({ seniorityLevel })}
                />
              </Field>
            </FormSection>
          </div>

          <div className="mt-6 flex justify-end gap-2 border-t border-[var(--app-divider)] pt-5">
            <Button
              type="button"
              variant="outline"
              className="rounded-xl"
              disabled={isPending}
              onClick={() => onOpenChange(false)}
            >
              {uiText.common.cancel}
            </Button>
            <Button
              type="submit"
              disabled={!valid || isPending}
              className="rounded-xl bg-[var(--app-primary)] text-[var(--app-on-primary)] hover:bg-[var(--app-primary-hover)]"
            >
              {isPending
                ? uiText.common.processing
                : mode === "create"
                  ? text.actions.create
                  : text.actions.save}
            </Button>
          </div>
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

function FormSection({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-[24px] border border-[var(--app-divider)] bg-[var(--app-background)]/35 p-4 sm:p-5">
      <h3 className="text-sm font-bold text-[var(--app-heading)]">{title}</h3>
      <p className="mt-1 text-xs leading-5 text-[var(--app-text-secondary)]">
        {description}
      </p>
      <div className="mt-4 grid gap-4">{children}</div>
    </section>
  )
}

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font-bold text-[var(--app-heading)]">
        {label}
      </span>
      {children}
    </label>
  )
}
