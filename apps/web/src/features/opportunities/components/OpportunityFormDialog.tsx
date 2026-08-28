import { BriefcaseBusiness, Loader2, Save } from "lucide-react"
import { useState } from "react"
import type { ReactNode } from "react"

import { DialogHeroHeader } from "@/components/shared/DialogHeroHeader"
import { PersianDatePicker } from "@/components/shared/PersianDatePicker"
import { CurrencyInput } from "@/components/shared/inputs"
import { SearchableCompanySelect } from "@/features/people/components/SearchableCompanySelect"
import { uiText } from "@/config/uiText"
import { fromApiDate, toApiDate } from "@/lib/date/jalali"
import { Button } from "@workspace/ui/components/button"
import { Dialog, DialogContent } from "@workspace/ui/components/dialog"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"

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

type FormState = {
  companyId: string
  title: string
  description: string
  ownerId: string
  stageId: string
  priority: "LOW" | "MEDIUM" | "HIGH" | "STRATEGIC"
  estimatedValue: string
  expectedCloseDate?: Date
  sourceOptionId: string
  primaryContactId: string
  probability: string
  competitor: string
}

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
  const editing = Boolean(opportunity)
  const [state, setState] = useState<FormState>(() =>
    initialState(opportunity, initialCompanyId)
  )
  const [validation, setValidation] = useState<string | null>(null)
  const people = useOpportunityCompanyPeople(state.companyId, open)
  const sources = useOpportunitySources(open)
  const owners = useOpportunityOwners(open && !editing)
  const contacts = Array.isArray(people.data) ? people.data : []
  const sourceOptions = Array.isArray(sources.data) ? sources.data : []
  const ownerOptions = Array.isArray(owners.data) ? owners.data : []

  const resetInputs0 = [initialCompanyId, open, opportunity] as const
  const [previousResetInputs0, setPreviousResetInputs0] = useState<typeof resetInputs0 | null>(null)
  if (previousResetInputs0 === null || previousResetInputs0[0] !== resetInputs0[0] || previousResetInputs0[1] !== resetInputs0[1] || previousResetInputs0[2] !== resetInputs0[2]) {
    setPreviousResetInputs0(resetInputs0)
    if (open) {
      setState(initialState(opportunity, initialCompanyId))
      setValidation(null)
    }
  }

  function patch(next: Partial<FormState>) {
    setState((current) => ({ ...current, ...next }))
  }

  async function submit() {
    if (!editing && !state.companyId)
      return setValidation(text.form.companyRequired)
    if (!state.title.trim()) return setValidation(text.form.titleRequired)
    const probability =
      state.probability === "" ? undefined : Number(state.probability)
    if (
      probability !== undefined &&
      (!Number.isFinite(probability) || probability < 0 || probability > 100)
    )
      return setValidation(text.form.invalidProbability)

    const common: OpportunityUpdatePayload = {
      title: state.title.trim(),
      description: state.description.trim() || undefined,
      priority: state.priority,
      estimatedValue:
        state.estimatedValue === "" ? undefined : Number(state.estimatedValue),
      expectedCloseDate: toApiDate(state.expectedCloseDate) ?? undefined,
      sourceOptionId: state.sourceOptionId || undefined,
      primaryContactId: state.primaryContactId || undefined,
      probability,
      competitor: state.competitor.trim() || undefined,
    }
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
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        dir="rtl"
        className="max-h-[92vh] w-full max-w-[calc(100%_-_1.5rem)] min-w-0 gap-0 overflow-hidden rounded-[26px] border-[var(--app-divider)] bg-[var(--app-surface)] p-0 sm:max-w-[860px]"
      >
        <DialogHeroHeader
          icon={BriefcaseBusiness}
          title={editing ? text.form.editTitle : text.form.createTitle}
          description={
            editing ? text.form.editDescription : text.form.createDescription
          }
          onClose={() => onOpenChange(false)}
        />

        <div className="min-h-0 max-w-full min-w-0 overflow-y-auto px-5 py-5 sm:px-7">
          <div className="grid min-w-0 gap-4 sm:grid-cols-2">
            <Field label={text.fields.company} required>
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
            <Field label={text.fields.title} required>
              <Input
                value={state.title}
                onChange={(event) => patch({ title: event.target.value })}
                className="h-11 rounded-xl"
              />
            </Field>

            {!editing ? (
              <Field label={text.fields.owner}>
                <select
                  className={selectClass}
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
              <Field label={text.fields.stage}>
                <select
                  className={selectClass}
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

            <Field label={text.fields.priority}>
              <select
                className={selectClass}
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
            <Field label={text.fields.estimatedValue}>
              <CurrencyInput
                value={state.estimatedValue}
                onValueChange={(estimatedValue) => patch({ estimatedValue })}
              />
            </Field>
            <Field label={text.fields.expectedCloseDate}>
              <PersianDatePicker
                value={state.expectedCloseDate}
                onChange={(expectedCloseDate) => patch({ expectedCloseDate })}
              />
            </Field>
            <Field label={text.fields.source}>
              <select
                className={selectClass}
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
            <Field label={text.fields.primaryContact}>
              <select
                className={selectClass}
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
            <Field label={text.fields.probability}>
              <Input
                type="number"
                min={0}
                max={100}
                value={state.probability}
                onChange={(event) => patch({ probability: event.target.value })}
                className="h-11 rounded-xl"
              />
              <p className="mt-1 text-xs text-[var(--app-text-secondary)]">
                {text.fields.probabilityHint}
              </p>
            </Field>
            <Field label={text.fields.competitor}>
              <Input
                value={state.competitor}
                onChange={(event) => patch({ competitor: event.target.value })}
                className="h-11 rounded-xl"
              />
            </Field>
            <Field label={text.fields.description} className="sm:col-span-2">
              <textarea
                value={state.description}
                onChange={(event) => patch({ description: event.target.value })}
                rows={4}
                className="w-full resize-none rounded-xl border border-input bg-transparent p-3 text-sm outline-none focus:border-[var(--app-primary)]"
              />
            </Field>
          </div>
          {validation ? (
            <div className="mt-4 rounded-xl border border-[var(--destructive)]/20 bg-[var(--destructive-soft)] p-3 text-xs text-[var(--destructive)]">
              {validation}
            </div>
          ) : null}
        </div>

        <div className="flex flex-wrap justify-end gap-2 border-t border-[var(--app-divider)] bg-[var(--app-background)]/60 px-5 py-4 sm:px-7">
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
            type="button"
            className="rounded-xl bg-[var(--app-primary)] text-[var(--app-on-primary)] hover:bg-[var(--app-primary-hover)]"
            disabled={isPending}
            onClick={() => void submit()}
          >
            {isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
            {isPending ? text.actions.saving : text.actions.save}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function Field({
  label,
  required,
  className,
  children,
}: {
  label: string
  required?: boolean
  className?: string
  children: ReactNode
}) {
  return (
    <div className={`min-w-0 ${className ?? ""}`}>
      <Label className="mb-2 block text-xs font-bold text-[var(--app-heading)]">
        {label}
        {required ? (
          <span className="text-[var(--destructive)]"> *</span>
        ) : null}
      </Label>
      {children}
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
