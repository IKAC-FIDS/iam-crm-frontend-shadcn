import { zodResolver } from "@hookform/resolvers/zod"
import {
  Building2,
  CheckCircle2,
  Landmark,
  MapPin,
  Save,
  Sparkles,
  X,
} from "lucide-react"
import type { ReactNode } from "react"
import { useEffect, useMemo } from "react"
import { Controller, useForm } from "react-hook-form"

import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"

import { PersianDatePicker } from "@/components/shared/date"
import { CurrencyInput, NumberInput } from "@/components/shared/inputs"
import { uiText } from "@/config/uiText"
import { getApiErrorMessage } from "@/lib/apiResponse"
import { toApiDate } from "@/lib/date/jalali"

import {
  COMPANY_ACTIVITY_STATUSES,
  COMPANY_OWNERSHIPS,
  COMPANY_PRIORITIES,
  type Company,
  type CompanyMutationPayload,
} from "../types/company.types"
import { useLeadSources } from "../hooks/useCompanyLookups"
import {
  companyFormSchema,
  type CompanyFormValues,
} from "../types/companyForm.schema"

type CompanyFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "create" | "edit"
  company?: Company | null
  isPending?: boolean
  submitError?: unknown
  onSubmit: (payload: CompanyMutationPayload) => void | Promise<void>
}

function toFormValues(company?: Company | null): CompanyFormValues {
  return {
    legalName: company?.legalName ?? "",
    brandName: company?.brandName ?? "",
    industry: company?.industryRef?.name ?? company?.industry ?? "",
    ownership: company?.ownership ?? undefined,
    priority: company?.priority ?? undefined,
    website: company?.website ?? "",
    headOfficeCity: company?.headOfficeCity ?? "",
    centralPhone: company?.centralPhone ?? "",
    sourceId: company?.sourceRef?.id ?? company?.sourceId ?? "",
    registrationNumber: company?.registrationNumber ?? "",
    nationalId: company?.nationalId ?? "",
    economicCode: company?.economicCode ?? "",
    establishmentDate: company?.establishmentDate?.slice(0, 10) ?? "",
    activityStatus: company?.activityStatus ?? undefined,
    registeredCapital:
      company?.registeredCapital === null ||
      company?.registeredCapital === undefined
        ? ""
        : String(company.registeredCapital),
    employeeCount:
      company?.employeeCount === null || company?.employeeCount === undefined
        ? ""
        : String(company.employeeCount),
  }
}

export function CompanyFormDialog({
  open,
  onOpenChange,
  mode,
  company,
  isPending = false,
  submitError,
  onSubmit,
}: CompanyFormDialogProps) {
  const text = uiText.companies.form
  const defaultValues = useMemo(() => toFormValues(company), [company])
  const {
    data: leadSources = [],
    isPending: isLeadSourcesPending,
  } = useLeadSources(open)

  const sourceOptions = useMemo(() => {
    const current = company?.sourceRef
    if (!current || leadSources.some((item) => item.id === current.id)) {
      return leadSources
    }
    return [current, ...leadSources]
  }, [company?.sourceRef, leadSources])

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isDirty },
  } = useForm<CompanyFormValues>({
    resolver: zodResolver(companyFormSchema),
    defaultValues,
  })

  useEffect(() => {
    if (open) reset(defaultValues)
  }, [defaultValues, open, reset])

  const legalName = watch("legalName")
  const brandName = watch("brandName")

  async function submit(values: CompanyFormValues) {
    const payload: CompanyMutationPayload = {
      legalName: values.legalName.trim(),
      brandName: clean(values.brandName),
      industry: clean(values.industry),
      ownership: values.ownership,
      priority: values.priority,
      website: clean(values.website),
      headOfficeCity: clean(values.headOfficeCity),
      centralPhone: clean(values.centralPhone)?.replace(/\s|-/g, "") ?? null,
      sourceId: clean(values.sourceId),
      registrationNumber: clean(values.registrationNumber),
      nationalId: clean(values.nationalId),
      economicCode: clean(values.economicCode),
      establishmentDate: clean(values.establishmentDate),
      activityStatus: values.activityStatus,
      registeredCapital: clean(values.registeredCapital),
      employeeCount: values.employeeCount
        ? Number(values.employeeCount)
        : undefined,
    }

    await onSubmit(payload)
  }

  const title = mode === "create" ? text.createTitle : text.editTitle
  const description =
    mode === "create" ? text.createDescription : text.editDescription

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        dir="rtl"
        className="max-h-[92vh] w-[min(1120px,calc(100vw-24px))] max-w-none gap-0 overflow-hidden rounded-[28px] border-[var(--app-divider)] bg-[var(--app-surface)] p-0 shadow-[var(--app-shadow-elevated)] sm:max-w-none"
      >
        <div className="grid min-h-0 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="hidden border-e border-[var(--app-divider)] bg-[linear-gradient(160deg,var(--app-primary-soft),var(--app-background)_72%)] p-6 lg:flex lg:flex-col">
            <div className="grid size-12 place-items-center rounded-2xl bg-[var(--app-primary)] text-[var(--app-on-primary)] shadow-sm">
              <Building2 className="size-5" />
            </div>

            <p className="mt-5 text-[11px] font-bold text-[var(--app-primary)]">
              {text.sideBadge}
            </p>
            <h3 className="mt-2 text-lg font-bold leading-8 text-[var(--app-heading)]">
              {brandName?.trim() || legalName?.trim() || text.previewFallback}
            </h3>
            <p className="mt-2 text-xs leading-6 text-[var(--app-text-secondary)]">
              {text.sideDescription}
            </p>

            <div className="mt-7 grid gap-3">
              <FormJourneyItem
                icon={Sparkles}
                title={text.journey.identity}
                description={text.journey.identityHint}
              />
              <FormJourneyItem
                icon={MapPin}
                title={text.journey.market}
                description={text.journey.marketHint}
              />
              <FormJourneyItem
                icon={Landmark}
                title={text.journey.legal}
                description={text.journey.legalHint}
              />
            </div>

            <div className="mt-auto rounded-2xl border border-[var(--app-primary)]/10 bg-[var(--app-surface)]/70 p-4">
              <div className="flex items-center gap-2 text-[11px] font-bold text-[var(--app-heading)]">
                <CheckCircle2 className="size-4 text-[var(--success)]" />
                {text.qualityTitle}
              </div>
              <p className="mt-2 text-[10px] leading-5 text-[var(--app-text-secondary)]">
                {text.qualityDescription}
              </p>
            </div>
          </aside>

          <div className="flex min-h-0 flex-col">
            <DialogHeader className="border-b border-[var(--app-divider)] px-5 py-5 sm:px-7">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <DialogTitle className="text-xl font-bold text-[var(--app-heading)]">
                    {title}
                  </DialogTitle>
                  <DialogDescription className="mt-1.5 leading-6 text-[var(--app-text-secondary)]">
                    {description}
                  </DialogDescription>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="shrink-0 rounded-xl"
                  aria-label={text.close}
                  onClick={() => onOpenChange(false)}
                >
                  <X className="size-4" />
                </Button>
              </div>
            </DialogHeader>

            <form
              onSubmit={handleSubmit(submit)}
              className="flex min-h-0 flex-1 flex-col"
            >
              <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-7 sm:py-6">
                <div className="grid gap-6">
                  <FormSectionBlock
                    number="01"
                    title={text.sections.identity}
                    description={text.sections.identityDescription}
                  >
                    <Field
                      label={text.fields.legalName}
                      error={errors.legalName?.message}
                      required
                    >
                      <Input
                        {...register("legalName")}
                        autoFocus
                        placeholder={text.placeholders.legalName}
                        className="h-11 rounded-xl"
                      />
                    </Field>

                    <Field
                      label={text.fields.brandName}
                      error={errors.brandName?.message}
                    >
                      <Input
                        {...register("brandName")}
                        placeholder={text.placeholders.brandName}
                        className="h-11 rounded-xl"
                      />
                    </Field>

                    <Field label={text.fields.ownership}>
                      <select
                        {...register("ownership")}
                        className={selectClass}
                      >
                        <option value="">{text.selectPlaceholder}</option>
                        {COMPANY_OWNERSHIPS.map((value) => (
                          <option key={value} value={value}>
                            {text.ownerships[value]}
                          </option>
                        ))}
                      </select>
                    </Field>

                    <Field label={text.fields.activityStatus}>
                      <select
                        {...register("activityStatus")}
                        className={selectClass}
                      >
                        <option value="">{text.selectPlaceholder}</option>
                        {COMPANY_ACTIVITY_STATUSES.map((value) => (
                          <option key={value} value={value}>
                            {text.activityStatuses[value]}
                          </option>
                        ))}
                      </select>
                    </Field>
                  </FormSectionBlock>

                  <FormSectionBlock
                    number="02"
                    title={text.sections.market}
                    description={text.sections.marketDescription}
                  >
                    <Field
                      label={text.fields.industry}
                      error={errors.industry?.message}
                    >
                      <Input
                        {...register("industry")}
                        placeholder={text.placeholders.industry}
                        className="h-11 rounded-xl"
                      />
                    </Field>

                    <Field label={text.fields.priority}>
                      <select {...register("priority")} className={selectClass}>
                        <option value="">{text.selectPlaceholder}</option>
                        {COMPANY_PRIORITIES.map((value) => (
                          <option key={value} value={value}>
                            {text.priorities[value]}
                          </option>
                        ))}
                      </select>
                    </Field>

                    <Field
                      label={text.fields.source}
                      error={errors.sourceId?.message}
                    >
                      <select
                        {...register("sourceId")}
                        className={selectClass}
                        disabled={isLeadSourcesPending}
                      >
                        <option value="">{text.selectPlaceholder}</option>
                        {sourceOptions.map((source) => (
                          <option key={source.id} value={source.id}>
                            {source.name}
                          </option>
                        ))}
                      </select>
                    </Field>

                    <Field
                      label={text.fields.city}
                      error={errors.headOfficeCity?.message}
                    >
                      <Input
                        {...register("headOfficeCity")}
                        placeholder={text.placeholders.city}
                        className="h-11 rounded-xl"
                      />
                    </Field>

                    <Field
                      label={text.fields.phone}
                      error={errors.centralPhone?.message}
                    >
                      <Input
                        {...register("centralPhone")}
                        dir="ltr"
                        inputMode="tel"
                        placeholder={text.placeholders.phone}
                        className="h-11 rounded-xl text-left"
                      />
                    </Field>

                    <Field
                      label={text.fields.website}
                      error={errors.website?.message}
                    >
                      <Input
                        {...register("website")}
                        dir="ltr"
                        placeholder={text.placeholders.website}
                        className="h-11 rounded-xl text-left"
                      />
                    </Field>
                  </FormSectionBlock>

                  <FormSectionBlock
                    number="03"
                    title={text.sections.legal}
                    description={text.sections.legalDescription}
                  >
                    <Field
                      label={text.fields.registrationNumber}
                      error={errors.registrationNumber?.message}
                    >
                      <Input
                        {...register("registrationNumber")}
                        className="h-11 rounded-xl"
                      />
                    </Field>

                    <Field
                      label={text.fields.nationalId}
                      error={errors.nationalId?.message}
                    >
                      <Input
                        {...register("nationalId")}
                        className="h-11 rounded-xl"
                      />
                    </Field>

                    <Field
                      label={text.fields.economicCode}
                      error={errors.economicCode?.message}
                    >
                      <Input
                        {...register("economicCode")}
                        className="h-11 rounded-xl"
                      />
                    </Field>

                    <Field
                      label={text.fields.establishmentDate}
                      error={errors.establishmentDate?.message}
                    >
                      <Controller
                        control={control}
                        name="establishmentDate"
                        render={({ field }) => (
                          <PersianDatePicker
                            value={field.value ? new Date(`${field.value}T00:00:00`) : undefined}
                            onChange={(date) =>
                              field.onChange(date ? toApiDate(date) : "")
                            }
                            placeholder={text.placeholders.establishmentDate}
                          />
                        )}
                      />
                    </Field>

                    <Field
                      label={text.fields.employeeCount}
                      error={errors.employeeCount?.message}
                    >
                      <Controller
                        control={control}
                        name="employeeCount"
                        render={({ field }) => (
                          <NumberInput
                            value={field.value}
                            onValueChange={field.onChange}
                          />
                        )}
                      />
                    </Field>

                    <Field
                      label={text.fields.registeredCapital}
                      error={errors.registeredCapital?.message}
                    >
                      <Controller
                        control={control}
                        name="registeredCapital"
                        render={({ field }) => (
                          <CurrencyInput
                            value={field.value}
                            onValueChange={field.onChange}
                            decimalScale={2}
                          />
                        )}
                      />
                    </Field>
                  </FormSectionBlock>

                  {submitError ? (
                    <div className="rounded-2xl border border-[var(--destructive)]/20 bg-[var(--destructive-soft)] px-4 py-3 text-xs leading-6 text-[var(--destructive)]">
                      {getApiErrorMessage(submitError, text.submitError)}
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="flex flex-col-reverse gap-2 border-t border-[var(--app-divider)] bg-[var(--app-background)]/65 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
                <p className="text-[10px] text-[var(--app-text-secondary)]">
                  {isDirty ? text.unsavedHint : text.savedStateHint}
                </p>
                <div className="flex items-center gap-2">
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
                    className="rounded-xl bg-[var(--app-primary)] text-[var(--app-on-primary)] hover:bg-[var(--app-primary-hover)]"
                    disabled={isPending}
                  >
                    <Save className="size-4" />
                    {isPending
                      ? uiText.common.processing
                      : mode === "create"
                        ? text.createSubmit
                        : text.editSubmit}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function FormSectionBlock({
  number,
  title,
  description,
  children,
}: {
  number: string
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <section className="rounded-[22px] border border-[var(--app-divider)] bg-[var(--app-background)]/35 p-4 sm:p-5">
      <div className="mb-5 flex items-start gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[var(--app-primary-soft)] text-[11px] font-bold text-[var(--app-primary)]">
          {number}
        </span>
        <div>
          <h3 className="text-sm font-bold text-[var(--app-heading)]">{title}</h3>
          <p className="mt-1 text-[10px] leading-5 text-[var(--app-text-secondary)]">
            {description}
          </p>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">{children}</div>
    </section>
  )
}

function Field({
  label,
  error,
  required,
  children,
}: {
  label: string
  error?: string
  required?: boolean
  children: ReactNode
}) {
  return (
    <div className="grid content-start gap-2">
      <Label className="text-xs font-bold text-[var(--app-heading)]">
        {label}
        {required ? (
          <span className="ms-1 text-[var(--destructive)]">*</span>
        ) : null}
      </Label>
      {children}
      {error ? (
        <p className="text-[10px] text-[var(--destructive)]">{error}</p>
      ) : null}
    </div>
  )
}

function FormJourneyItem({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof Sparkles
  title: string
  description: string
}) {
  return (
    <div className="flex gap-3 rounded-2xl bg-[var(--app-surface)]/55 p-3">
      <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-[var(--app-primary-soft)] text-[var(--app-primary)]">
        <Icon className="size-4" />
      </div>
      <div>
        <p className="text-[11px] font-bold text-[var(--app-heading)]">{title}</p>
        <p className="mt-1 text-[9px] leading-4 text-[var(--app-text-secondary)]">
          {description}
        </p>
      </div>
    </div>
  )
}

function clean(value?: string) {
  const result = value?.trim()
  return result || undefined
}

const selectClass =
  "h-11 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
