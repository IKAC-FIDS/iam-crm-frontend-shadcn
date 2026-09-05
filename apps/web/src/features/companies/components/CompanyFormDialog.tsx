import { zodResolver } from "@hookform/resolvers/zod"
import {
  Building2,
  CheckCircle2,
  Landmark,
  MapPin,
  Save,
  Sparkles,
} from "lucide-react"
import type { ReactNode } from "react"
import { useEffect, useMemo } from "react"
import { Controller, useForm, useWatch } from "react-hook-form"

import { Button } from "@workspace/ui/components/button"
import { Dialog, DialogContent } from "@workspace/ui/components/dialog"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"

import { PersianDatePicker } from "@/components/shared/date"
import { DialogHeroHeader } from "@/components/shared/DialogHeroHeader"
import { ProfileMediaEditor } from "@/components/shared/ProfileMediaEditor"
import { CurrencyInput, NumberInput } from "@/components/shared/inputs"
import { uiText } from "@/config/uiText"
import { getApiErrorMessage } from "@/lib/apiResponse"
import { applyServerFieldErrors } from "@/lib/formErrors"
import { toApiDate } from "@/lib/date/jalali"

import {
  COMPANY_ACTIVITY_STATUSES,
  COMPANY_OWNERSHIPS,
  COMPANY_PRIORITIES,
  type Company,
  type CompanyMutationPayload,
} from "../types/company.types"
import { useIndustries, useLeadSources } from "../hooks/useCompanyLookups"
import {
  companyFormSchema,
  type CompanyFormValues,
} from "../types/companyForm.schema"
import { companyDisplayName } from "../utils/companyFormatters"

type CompanyFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "create" | "edit"
  company?: Company | null
  isPending?: boolean
  submitError?: unknown
  onSubmit: (payload: CompanyMutationPayload) => void | Promise<void>
  onMediaChanged?: () => void | Promise<void>
}

function toFormValues(company?: Company | null): CompanyFormValues {
  return {
    legalName: company?.legalName ?? "",
    brandName: company?.brandName ?? "",
    industryId: company?.industryRef?.id ?? company?.industryId ?? "",
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
  onMediaChanged,
}: CompanyFormDialogProps) {
  const text = uiText.companies.form
  const defaultValues = useMemo(() => toFormValues(company), [company])
  const { data: leadSources = [], isPending: isLeadSourcesPending } =
    useLeadSources(open)
  const { data: industries = [], isPending: isIndustriesPending } =
    useIndustries(open)

  const sourceOptions = useMemo(() => {
    const current = company?.sourceRef
    if (!current || leadSources.some((item) => item.id === current.id)) {
      return leadSources
    }
    return [current, ...leadSources]
  }, [company?.sourceRef, leadSources])

  const industryOptions = useMemo(() => {
    const current = company?.industryRef
    if (!current || industries.some((item) => item.id === current.id)) {
      return industries
    }
    return [current, ...industries]
  }, [company?.industryRef, industries])

  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    formState: { errors, isDirty },
  } = useForm<CompanyFormValues>({
    resolver: zodResolver(companyFormSchema),
    defaultValues,
  })

  useEffect(() => {
    if (open) reset(defaultValues)
  }, [defaultValues, open, reset])

  const legalName = useWatch({ control, name: "legalName" })
  const brandName = useWatch({ control, name: "brandName" })

  async function submit(values: CompanyFormValues) {
    clearErrors()
    const payload: CompanyMutationPayload = {
      legalName: values.legalName.trim(),
      brandName: clean(values.brandName),
      industryId: clean(values.industryId),
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

    try {
      await onSubmit(payload)
    } catch (error) {
      applyServerFieldErrors(
        error,
        setError,
        Object.keys(defaultValues) as (keyof CompanyFormValues)[]
      )
    }
  }

  const title = mode === "create" ? text.createTitle : text.editTitle
  const description =
    mode === "create" ? text.createDescription : text.editDescription

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        dir="rtl"
        className="h-[min(92dvh,900px)] max-h-[calc(100dvh-1rem)] w-[min(1120px,calc(100vw-16px))] max-w-none gap-0 overflow-hidden rounded-[28px] border-[var(--app-divider)] bg-[var(--app-surface)] p-0 shadow-[var(--app-shadow-elevated)] sm:w-[min(1120px,calc(100vw-24px))] sm:max-w-none"
      >
        <div className="grid h-full min-h-0 overflow-hidden lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="hidden overflow-y-auto border-e border-[var(--app-divider)] bg-[linear-gradient(160deg,var(--app-primary-soft),var(--app-background)_72%)] p-6 lg:flex lg:flex-col">
            <div className="grid size-12 place-items-center rounded-2xl bg-[var(--app-primary)] text-[var(--app-on-primary)] shadow-sm">
              <Building2 className="size-5" />
            </div>

            <p className="mt-5 text-xs font-bold text-[var(--app-primary)]">
              {text.sideBadge}
            </p>
            <h3 className="mt-2 text-lg leading-8 font-bold text-[var(--app-heading)]">
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
              <div className="flex items-center gap-2 text-xs font-bold text-[var(--app-heading)]">
                <CheckCircle2 className="size-4 text-[var(--success)]" />
                {text.qualityTitle}
              </div>
              <p className="mt-2 text-xs leading-5 text-[var(--app-text-secondary)]">
                {text.qualityDescription}
              </p>
            </div>
          </aside>

          <div className="flex min-h-0 flex-col">
            <DialogHeroHeader
              title={title}
              description={description}
              closeLabel={text.close}
              onClose={() => onOpenChange(false)}
            />

            <form
              onSubmit={handleSubmit(submit)}
              className="flex min-h-0 flex-1 flex-col"
            >
              <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-7 sm:py-6">
                <div className="grid gap-6">
                  {mode === "edit" && company ? (
                    <div className="rounded-2xl border border-[var(--app-divider)] bg-[var(--app-background)]/55 p-4">
                      <ProfileMediaEditor
                        name={companyDisplayName(company.legalName, company.brandName)}
                        mediaPath={`/companies/${company.id}/logo`}
                        hasMedia={Boolean(company.logoObjectKey)}
                        mediaVersion={company.logoObjectKey}
                        canEdit
                        label="لوگوی شرکت"
                        onChanged={onMediaChanged ?? (() => undefined)}
                      />
                    </div>
                  ) : null}
                  <FormSectionBlock
                    number="01"
                    title={text.sections.identity}
                    description={text.sections.identityDescription}
                  >
                    <Field
                      htmlFor="company-legalName"
                      label={text.fields.legalName}
                      error={errors.legalName?.message}
                      required
                    >
                      <Input
                        id="company-legalName"
                        aria-invalid={Boolean(errors.legalName)}
                        aria-describedby={
                          errors.legalName
                            ? "company-legalName-error"
                            : undefined
                        }
                        {...register("legalName")}
                        autoFocus
                        placeholder={text.placeholders.legalName}
                        className="h-11 rounded-xl"
                      />
                    </Field>

                    <Field
                      htmlFor="company-brandName"
                      label={text.fields.brandName}
                      error={errors.brandName?.message}
                    >
                      <Input
                        id="company-brandName"
                        aria-invalid={Boolean(errors.brandName)}
                        aria-describedby={
                          errors.brandName
                            ? "company-brandName-error"
                            : undefined
                        }
                        {...register("brandName")}
                        placeholder={text.placeholders.brandName}
                        className="h-11 rounded-xl"
                      />
                    </Field>

                    <Field
                      error={errors.ownership?.message}
                      htmlFor="company-ownership"
                      label={text.fields.ownership}
                    >
                      <select
                        id="company-ownership"
                        aria-invalid={Boolean(errors.ownership)}
                        aria-describedby={
                          errors.ownership
                            ? "company-ownership-error"
                            : undefined
                        }
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

                    <Field
                      error={errors.activityStatus?.message}
                      htmlFor="company-activityStatus"
                      label={text.fields.activityStatus}
                    >
                      <select
                        id="company-activityStatus"
                        aria-invalid={Boolean(errors.activityStatus)}
                        aria-describedby={
                          errors.activityStatus
                            ? "company-activityStatus-error"
                            : undefined
                        }
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
                      htmlFor="company-industryId"
                      label={text.fields.industry}
                      error={errors.industryId?.message}
                    >
                      <select
                        id="company-industryId"
                        aria-invalid={Boolean(errors.industryId)}
                        aria-describedby={
                          errors.industryId
                            ? "company-industryId-error"
                            : undefined
                        }
                        {...register("industryId")}
                        className={selectClass}
                        disabled={isIndustriesPending}
                      >
                        <option value="">{text.selectPlaceholder}</option>
                        {industryOptions.map((industry) => (
                          <option key={industry.id} value={industry.id}>
                            {industry.name}
                          </option>
                        ))}
                      </select>
                    </Field>

                    <Field
                      error={errors.priority?.message}
                      htmlFor="company-priority"
                      label={text.fields.priority}
                    >
                      <select
                        id="company-priority"
                        aria-invalid={Boolean(errors.priority)}
                        aria-describedby={
                          errors.priority ? "company-priority-error" : undefined
                        }
                        {...register("priority")}
                        className={selectClass}
                      >
                        <option value="">{text.selectPlaceholder}</option>
                        {COMPANY_PRIORITIES.map((value) => (
                          <option key={value} value={value}>
                            {text.priorities[value]}
                          </option>
                        ))}
                      </select>
                    </Field>

                    <Field
                      htmlFor="company-sourceId"
                      label={text.fields.source}
                      error={errors.sourceId?.message}
                    >
                      <select
                        id="company-sourceId"
                        aria-invalid={Boolean(errors.sourceId)}
                        aria-describedby={
                          errors.sourceId ? "company-sourceId-error" : undefined
                        }
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
                      htmlFor="company-headOfficeCity"
                      label={text.fields.city}
                      error={errors.headOfficeCity?.message}
                    >
                      <Input
                        id="company-headOfficeCity"
                        aria-invalid={Boolean(errors.headOfficeCity)}
                        aria-describedby={
                          errors.headOfficeCity
                            ? "company-headOfficeCity-error"
                            : undefined
                        }
                        {...register("headOfficeCity")}
                        placeholder={text.placeholders.city}
                        className="h-11 rounded-xl"
                      />
                    </Field>

                    <Field
                      htmlFor="company-centralPhone"
                      label={text.fields.phone}
                      error={errors.centralPhone?.message}
                    >
                      <Input
                        id="company-centralPhone"
                        aria-invalid={Boolean(errors.centralPhone)}
                        aria-describedby={
                          errors.centralPhone
                            ? "company-centralPhone-error"
                            : undefined
                        }
                        {...register("centralPhone")}
                        dir="ltr"
                        inputMode="tel"
                        placeholder={text.placeholders.phone}
                        className="h-11 rounded-xl text-left"
                      />
                    </Field>

                    <Field
                      htmlFor="company-website"
                      label={text.fields.website}
                      error={errors.website?.message}
                    >
                      <Input
                        id="company-website"
                        aria-invalid={Boolean(errors.website)}
                        aria-describedby={
                          errors.website ? "company-website-error" : undefined
                        }
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
                      htmlFor="company-registrationNumber"
                      label={text.fields.registrationNumber}
                      error={errors.registrationNumber?.message}
                    >
                      <Input
                        id="company-registrationNumber"
                        aria-invalid={Boolean(errors.registrationNumber)}
                        aria-describedby={
                          errors.registrationNumber
                            ? "company-registrationNumber-error"
                            : undefined
                        }
                        {...register("registrationNumber")}
                        className="h-11 rounded-xl"
                      />
                    </Field>

                    <Field
                      htmlFor="company-nationalId"
                      label={text.fields.nationalId}
                      error={errors.nationalId?.message}
                    >
                      <Input
                        id="company-nationalId"
                        aria-invalid={Boolean(errors.nationalId)}
                        aria-describedby={
                          errors.nationalId
                            ? "company-nationalId-error"
                            : undefined
                        }
                        {...register("nationalId")}
                        className="h-11 rounded-xl"
                      />
                    </Field>

                    <Field
                      htmlFor="company-economicCode"
                      label={text.fields.economicCode}
                      error={errors.economicCode?.message}
                    >
                      <Input
                        id="company-economicCode"
                        aria-invalid={Boolean(errors.economicCode)}
                        aria-describedby={
                          errors.economicCode
                            ? "company-economicCode-error"
                            : undefined
                        }
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
                            value={
                              field.value
                                ? new Date(`${field.value}T00:00:00`)
                                : undefined
                            }
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

                  {errors.root?.server || submitError ? (
                    <div
                      role="alert"
                      className="rounded-2xl border border-[var(--destructive)]/20 bg-[var(--destructive-soft)] px-4 py-3 text-xs leading-6 text-[var(--destructive)]"
                    >
                      {errors.root?.server?.message ??
                        getApiErrorMessage(submitError, text.submitError)}
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="flex flex-col-reverse gap-2 border-t border-[var(--app-divider)] bg-[var(--app-background)]/65 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
                <p className="text-xs text-[var(--app-text-secondary)]">
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
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[var(--app-primary-soft)] text-xs font-bold text-[var(--app-primary)]">
          {number}
        </span>
        <div>
          <h3 className="text-sm font-bold text-[var(--app-heading)]">
            {title}
          </h3>
          <p className="mt-1 text-xs leading-5 text-[var(--app-text-secondary)]">
            {description}
          </p>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">{children}</div>
    </section>
  )
}

function Field({
  htmlFor,
  label,
  error,
  required,
  children,
}: {
  htmlFor?: string
  label: string
  error?: string
  required?: boolean
  children: ReactNode
}) {
  return (
    <div className="grid content-start gap-2">
      <Label
        htmlFor={htmlFor}
        className="text-xs font-bold text-[var(--app-heading)]"
      >
        {label}
        {required ? (
          <span className="ms-1 text-[var(--destructive)]">*</span>
        ) : null}
      </Label>
      {children}
      {error ? (
        <p
          id={htmlFor ? `${htmlFor}-error` : undefined}
          className="text-xs text-[var(--destructive)]"
        >
          {error}
        </p>
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
        <p className="text-xs font-bold text-[var(--app-heading)]">{title}</p>
        <p className="mt-1 text-xs leading-4 text-[var(--app-text-secondary)]">
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
