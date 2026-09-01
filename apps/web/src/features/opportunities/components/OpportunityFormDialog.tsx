import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  opportunityFormSchema,
  type OpportunityFormValues as FormState,
} from "../schemas/opportunityForm"
import { applyServerFieldErrors } from "@/lib/formErrors"
import { FormActions } from "@/components/shared/FormActions"
import { BriefcaseBusiness } from "lucide-react"
import { useEffect, useMemo } from "react"
import type { ReactNode } from "react"

import { DialogHeroHeader } from "@/components/shared/DialogHeroHeader"
import { PersianDatePicker } from "@/components/shared/PersianDatePicker"
import { CurrencyInput } from "@/components/shared/inputs"
import { SearchableCompanySelect } from "@/features/people/components/SearchableCompanySelect"
import { uiText } from "@/config/uiText"
import { fromApiDate, toApiDate } from "@/lib/date/jalali"
import { Dialog, DialogContent } from "@workspace/ui/components/dialog"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { useAuthStore } from "@/store/authStore"
import { canViewFinancials } from "@/lib/permissions"

import {
  useOpportunityCompanyPeople,
  useOpportunityOwners,
  useOpportunitySources,
} from "../hooks/useOpportunities"
import type {
  Opportunity,
  OpportunityPayload,
  OpportunityStage,
  OpportunityUpdatePayload,
} from "../types/opportunity.types"

const selectClass =
  "h-11 w-full rounded-xl border border-input bg-transparent px-3 text-sm outline-none focus:border-[var(--app-primary)]"

function initialState(
  opportunity?: Opportunity | null,
  initialCompanyId?: string
): FormState {
  return {
    companyId: opportunity?.companyId ?? initialCompanyId ?? "",
    title: opportunity?.title ?? "",
    description: opportunity?.description ?? "",
    ownerId: opportunity?.ownerId ?? "",
    stageId: opportunity?.stageId ?? "",
    priority: opportunity?.priority ?? "MEDIUM",
    estimatedValue:
      opportunity?.estimatedValue == null
        ? ""
        : String(opportunity.estimatedValue),
    expectedCloseDate: fromApiDate(opportunity?.expectedCloseDate),
    sourceOptionId:
      opportunity?.sourceOptionId ?? opportunity?.sourceOption?.id ?? "",
    primaryContactId: opportunity?.primaryContactId ?? "",
    probability:
      opportunity?.probability == null ? "" : String(opportunity.probability),
    competitor: opportunity?.competitor ?? "",
  }
}

export function OpportunityFormDialog({
  open,
  onOpenChange,
  opportunity,
  initialCompanyId,
  lockCompany = false,
  stages,
  isPending,
  onSubmit,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  opportunity?: Opportunity | null
  initialCompanyId?: string
  lockCompany?: boolean
  stages: OpportunityStage[]
  isPending: boolean
  onSubmit: (
    payload: OpportunityPayload | OpportunityUpdatePayload
  ) => void | Promise<void>
}) {
  const text = uiText.opportunities
  const financialVisible = canViewFinancials(
    useAuthStore((state) => state.user?.permissions)
  )
  const editing = Boolean(opportunity)
  const defaults = useMemo(
    () => initialState(opportunity, initialCompanyId),
    [opportunity, initialCompanyId]
  )
  const {
    register,
    control,
    setValue,
    setError,
    clearErrors,
    reset,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormState>({
    resolver: zodResolver(opportunityFormSchema),
    defaultValues: defaults,
  })
  const state = useWatch({ control, defaultValue: defaults }) as FormState
  const people = useOpportunityCompanyPeople(state.companyId, open)
  const sources = useOpportunitySources(open)
  const owners = useOpportunityOwners(open && !editing)
  const contacts = Array.isArray(people.data) ? people.data : []
  const sourceOptions = Array.isArray(sources.data) ? sources.data : []
  const ownerOptions = Array.isArray(owners.data) ? owners.data : []

  useEffect(() => {
    if (open) reset(defaults)
  }, [open, defaults, reset])

  function patch(next: Partial<FormState>) {
    for (const key of Object.keys(next) as (keyof FormState)[])
      setValue(key, next[key], { shouldDirty: true, shouldValidate: true })
  }

  async function submit(state: FormState) {
    clearErrors("root")
    if (!editing && !state.companyId) {
      setError("companyId", {
        type: "required",
        message: text.form.companyRequired,
      })
      return
    }
    const probability =
      state.probability === "" ? undefined : Number(state.probability)
    const common: OpportunityUpdatePayload = {
      title: state.title.trim(),
      description: state.description.trim() || undefined,
      priority: state.priority,
      estimatedValue: financialVisible
        ? state.estimatedValue === "" ? undefined : Number(state.estimatedValue)
        : undefined,
      expectedCloseDate: toApiDate(state.expectedCloseDate) ?? undefined,
      sourceOptionId: state.sourceOptionId || undefined,
      primaryContactId: state.primaryContactId || undefined,
      probability,
      competitor: state.competitor.trim() || undefined,
    }
    try {
      await onSubmit(
        editing
          ? common
          : ({
              ...common,
              companyId: state.companyId,
              ownerId: state.ownerId || undefined,
              stageId: state.stageId || undefined,
            } as OpportunityPayload)
      )
    } catch (error) {
      applyServerFieldErrors(
        error,
        setError,
        Object.keys(defaults) as (keyof FormState)[]
      )
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        dir="rtl"
        className="grid max-h-[92dvh] w-full max-w-[calc(100%_-_1.5rem)] min-w-0 grid-rows-[auto_minmax(0,1fr)] gap-0 overflow-hidden rounded-[26px] border-[var(--app-divider)] bg-[var(--app-surface)] p-0 sm:max-w-[860px]"
      >
        <DialogHeroHeader
          icon={BriefcaseBusiness}
          title={editing ? text.form.editTitle : text.form.createTitle}
          description={
            editing ? text.form.editDescription : text.form.createDescription
          }
          onClose={() => onOpenChange(false)}
        />

        <form
          onSubmit={handleSubmit(submit)}
          noValidate
          className="flex min-h-0 flex-col"
        >
          <div className="min-h-0 max-w-full min-w-0 overflow-y-auto px-5 py-5 sm:px-7">
            <div className="grid min-w-0 gap-4 sm:grid-cols-2">
              <Field
                name="companyId"
                error={errors.companyId?.message}
                label={text.fields.company}
                required
              >
                <SearchableCompanySelect
                  value={state.companyId}
                  allowEmpty={false}
                  disabled={editing || lockCompany}
                  onChange={(companyId) =>
                    patch({ companyId: companyId ?? "", primaryContactId: "" })
                  }
                />
                {lockCompany ? (
                  <p className="mt-1 text-xs text-[var(--app-text-secondary)]">
                    {text.form.lockedCompany}
                  </p>
                ) : null}
              </Field>
              <Field
                name="title"
                error={errors.title?.message}
                label={text.fields.title}
                required
              >
                <Input
                  {...register("title")}
                  id="opportunity-title"
                  aria-invalid={Boolean(errors.title)}
                  aria-describedby={
                    errors.title ? "opportunity-title-error" : undefined
                  }
                  value={state.title}
                  onChange={(event) => patch({ title: event.target.value })}
                  className="h-11 rounded-xl"
                />
              </Field>

              {!editing ? (
                <Field
                  name="ownerId"
                  error={errors.ownerId?.message}
                  label={text.fields.owner}
                >
                  <select
                    className={selectClass}
                    {...register("ownerId")}
                    id="opportunity-ownerId"
                    aria-invalid={Boolean(errors.ownerId)}
                    aria-describedby={
                      errors.ownerId ? "opportunity-ownerId-error" : undefined
                    }
                    value={state.ownerId}
                    disabled={owners.isLoading || owners.isError}
                    onChange={(event) => patch({ ownerId: event.target.value })}
                  >
                    <option value="">{text.fields.defaultOwner}</option>
                    {ownerOptions.map((owner) => (
                      <option key={owner.id} value={owner.id}>
                        {owner.fullName}
                      </option>
                    ))}
                  </select>
                  {owners.isError ? (
                    <InlineMessage>{text.form.ownersError}</InlineMessage>
                  ) : null}
                </Field>
              ) : null}

              {!editing ? (
                <Field
                  name="stageId"
                  error={errors.stageId?.message}
                  label={text.fields.stage}
                >
                  <select
                    className={selectClass}
                    {...register("stageId")}
                    id="opportunity-stageId"
                    aria-invalid={Boolean(errors.stageId)}
                    aria-describedby={
                      errors.stageId ? "opportunity-stageId-error" : undefined
                    }
                    value={state.stageId}
                    onChange={(event) => patch({ stageId: event.target.value })}
                  >
                    <option value="">{text.fields.defaultStage}</option>
                    {stages.map((stage) => (
                      <option key={stage.id} value={stage.id}>
                        {stage.label}
                      </option>
                    ))}
                  </select>
                </Field>
              ) : null}

              <Field
                name="priority"
                error={errors.priority?.message}
                label={text.fields.priority}
              >
                <select
                  className={selectClass}
                  {...register("priority")}
                  id="opportunity-priority"
                  aria-invalid={Boolean(errors.priority)}
                  aria-describedby={
                    errors.priority ? "opportunity-priority-error" : undefined
                  }
                  value={state.priority}
                  onChange={(event) =>
                    patch({
                      priority: event.target.value as FormState["priority"],
                    })
                  }
                >
                  <option value="STRATEGIC">{text.priorities.STRATEGIC}</option>
                  <option value="HIGH">{text.priorities.HIGH}</option>
                  <option value="MEDIUM">{text.priorities.MEDIUM}</option>
                  <option value="LOW">{text.priorities.LOW}</option>
                </select>
              </Field>
              {financialVisible ? <Field
                name="estimatedValue"
                error={errors.estimatedValue?.message}
                label={text.fields.estimatedValue}
              >
                <CurrencyInput
                  value={state.estimatedValue}
                  onValueChange={(estimatedValue) => patch({ estimatedValue })}
                />
              </Field> : null}
              <Field
                name="expectedCloseDate"
                error={errors.expectedCloseDate?.message}
                label={text.fields.expectedCloseDate}
              >
                <PersianDatePicker
                  id="opportunity-expectedCloseDate"
                  value={state.expectedCloseDate}
                  onChange={(expectedCloseDate) => patch({ expectedCloseDate })}
                  ariaInvalid={Boolean(errors.expectedCloseDate)}
                  ariaDescribedBy={
                    errors.expectedCloseDate
                      ? "opportunity-expectedCloseDate-error"
                      : undefined
                  }
                />
              </Field>
              <Field
                name="sourceOptionId"
                error={errors.sourceOptionId?.message}
                label={text.fields.source}
              >
                <select
                  className={selectClass}
                  {...register("sourceOptionId")}
                  id="opportunity-sourceOptionId"
                  aria-invalid={Boolean(errors.sourceOptionId)}
                  aria-describedby={
                    errors.sourceOptionId
                      ? "opportunity-sourceOptionId-error"
                      : undefined
                  }
                  value={state.sourceOptionId}
                  disabled={sources.isLoading || sources.isError}
                  onChange={(event) =>
                    patch({ sourceOptionId: event.target.value })
                  }
                >
                  <option value="">{text.fields.selectPlaceholder}</option>
                  {sourceOptions.map((source) => (
                    <option key={source.id} value={source.id}>
                      {source.label}
                    </option>
                  ))}
                </select>
                {sources.isError ? (
                  <InlineMessage>{text.form.sourcesError}</InlineMessage>
                ) : null}
              </Field>
              <Field
                name="primaryContactId"
                error={errors.primaryContactId?.message}
                label={text.fields.primaryContact}
              >
                <select
                  className={selectClass}
                  {...register("primaryContactId")}
                  id="opportunity-primaryContactId"
                  aria-invalid={Boolean(errors.primaryContactId)}
                  aria-describedby={
                    errors.primaryContactId
                      ? "opportunity-primaryContactId-error"
                      : undefined
                  }
                  value={state.primaryContactId}
                  disabled={
                    !state.companyId || people.isLoading || people.isError
                  }
                  onChange={(event) =>
                    patch({ primaryContactId: event.target.value })
                  }
                >
                  <option value="">{text.fields.selectPlaceholder}</option>
                  {contacts.map((person) => (
                    <option key={person.id} value={person.id}>
                      {person.fullName}
                    </option>
                  ))}
                </select>
                {people.isError ? (
                  <InlineMessage>{text.form.peopleError}</InlineMessage>
                ) : !people.isLoading && state.companyId && !contacts.length ? (
                  <InlineMessage>{text.form.contactsEmpty}</InlineMessage>
                ) : null}
              </Field>
              <Field
                name="probability"
                error={errors.probability?.message}
                label={text.fields.probability}
              >
                <Input
                  type="number"
                  min={0}
                  max={100}
                  {...register("probability")}
                  id="opportunity-probability"
                  aria-invalid={Boolean(errors.probability)}
                  aria-describedby={
                    errors.probability
                      ? "opportunity-probability-error"
                      : undefined
                  }
                  value={state.probability}
                  onChange={(event) =>
                    patch({ probability: event.target.value })
                  }
                  className="h-11 rounded-xl"
                />
                <p className="mt-1 text-xs text-[var(--app-text-secondary)]">
                  {text.fields.probabilityHint}
                </p>
              </Field>
              <Field
                name="competitor"
                error={errors.competitor?.message}
                label={text.fields.competitor}
              >
                <Input
                  {...register("competitor")}
                  id="opportunity-competitor"
                  aria-invalid={Boolean(errors.competitor)}
                  aria-describedby={
                    errors.competitor
                      ? "opportunity-competitor-error"
                      : undefined
                  }
                  value={state.competitor}
                  onChange={(event) =>
                    patch({ competitor: event.target.value })
                  }
                  className="h-11 rounded-xl"
                />
              </Field>
              <Field
                name="description"
                error={errors.description?.message}
                label={text.fields.description}
                className="sm:col-span-2"
              >
                <textarea
                  {...register("description")}
                  id="opportunity-description"
                  aria-invalid={Boolean(errors.description)}
                  aria-describedby={
                    errors.description
                      ? "opportunity-description-error"
                      : undefined
                  }
                  value={state.description}
                  onChange={(event) =>
                    patch({ description: event.target.value })
                  }
                  rows={4}
                  className="w-full resize-none rounded-xl border border-input bg-transparent p-3 text-sm outline-none focus:border-[var(--app-primary)]"
                />
              </Field>
            </div>
            {errors.root?.server ? (
              <div
                role="alert"
                className="mt-4 rounded-xl border border-[var(--destructive)]/20 bg-[var(--destructive-soft)] p-3 text-xs text-[var(--destructive)]"
              >
                {errors.root?.server.message}
              </div>
            ) : null}
          </div>

          <div className="shrink-0 border-t border-[var(--app-divider)] bg-[var(--app-background)]/60 px-5 py-4 sm:px-7">
            <FormActions
              onCancel={() => onOpenChange(false)}
              pending={isPending || isSubmitting}
              submitLabel={text.actions.save}
            />
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function Field({
  name,
  error,
  label,
  required,
  className,
  children,
}: {
  name: string
  error?: string
  label: string
  required?: boolean
  className?: string
  children: ReactNode
}) {
  return (
    <div className={`min-w-0 ${className ?? ""}`}>
      <Label
        htmlFor={`opportunity-${name}`}
        className="mb-2 block text-xs font-bold text-[var(--app-heading)]"
      >
        {label}
        {required ? (
          <span className="text-[var(--destructive)]"> *</span>
        ) : null}
      </Label>
      {children}
      {error ? (
        <p
          id={`opportunity-${name}-error`}
          className="mt-1 text-xs text-destructive"
        >
          {error}
        </p>
      ) : null}
    </div>
  )
}

function InlineMessage({ children }: { children: ReactNode }) {
  return (
    <p className="mt-1 text-xs leading-5 text-[var(--destructive)]">
      {children}
    </p>
  )
}
