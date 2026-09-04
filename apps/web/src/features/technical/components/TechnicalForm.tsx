import { useEffect, useMemo, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  useForm,
  useWatch,
  Controller,
  type Control,
  type FieldPath,
  type UseFormRegister,
  type UseFormRegisterReturn,
} from "react-hook-form"
import { useQuery } from "@tanstack/react-query"
import { z } from "zod"
import { Input } from "@workspace/ui/components/input"
import { FormSection } from "@/components/shared/FormSection"
import {
  FormDialogBody,
  FormDialogFooter,
} from "@/components/shared/FormDialogLayout"
import { FormActions } from "@/components/shared/FormActions"
import { PersianDatePicker } from "@/components/shared/PersianDatePicker"
import { SearchableOptionSelect } from "@/components/shared/SearchableOptionSelect"
import { getApiErrorMessage } from "@/lib/apiResponse"
import { useDebouncedValue } from "@/lib/useDebouncedValue"
import { technicalApi, technicalLookups } from "../api"
import { ScopedUserSelect } from "./ScopedUserSelect"
import type {
  KnowledgeArticle,
  TechnicalDocument,
  TechnicalKind,
  TechnicalRelease,
  TechnicalResource,
  Tender,
} from "../types"
import {
  confidentialityLabels,
  resourcePresentation,
  resourceTypeLabels,
  tenderTypeLabels,
} from "../presentation"

const schema = z.object({
  title: z.string().trim().min(1, "عنوان الزامی است").max(200),
  version: z.string().max(80).optional(),
  productId: z.string().optional(),
  summary: z.string().max(1000).optional(),
  releaseNotes: z.string().optional(),
  releaseDate: z.string().optional(),
  supportStartDate: z.string().optional(),
  supportEndDate: z.string().optional(),
  endOfLifeDate: z.string().optional(),
  slug: z.string().max(160).optional(),
  content: z.string().optional(),
  contentType: z.enum(["ARTICLE", "EXTERNAL_LINK"]).optional(),
  externalUrl: z.union([z.literal(""), z.string().url("آدرس معتبر وارد کنید")]).optional(),
  category: z.string().max(120).optional(),
  visibility: z.string().optional(),
  releaseId: z.string().optional(),
  ownerId: z.string().optional(),
  reviewerId: z.string().optional(),
  nextReviewAt: z.string().optional(),
  documentType: z.string().max(100).optional(),
  description: z.string().optional(),
  confidentiality: z.string().optional(),
  companyId: z.string().optional(),
  opportunityId: z.string().optional(),
  tenderId: z.string().optional(),
  effectiveFrom: z.string().optional(),
  expiresAt: z.string().optional(),
  resourceType: z.string().optional(),
  url: z
    .union([z.literal(""), z.string().url("آدرس معتبر وارد کنید")])
    .optional(),
  checksum: z.string().max(128).optional(),
  status: z.string().optional(),
  tenderType: z.string().optional(),
  referenceNumber: z.string().max(100).optional(),
  teamId: z.string().optional(),
  source: z.string().max(120).optional(),
  submissionDeadline: z.string().optional(),
  technicalDeadline: z.string().optional(),
  expectedDecisionDate: z.string().optional(),
  estimatedValue: z.string().optional(),
  currency: z.string().max(3).optional(),
  probability: z.string().optional(),
  technicalLeadId: z.string().optional(),
  commercialLeadId: z.string().optional(),
})

export type TechnicalFormValues = z.infer<typeof schema>
type Entity =
  | TechnicalRelease
  | KnowledgeArticle
  | TechnicalDocument
  | TechnicalResource
  | Tender
const inputClass = "h-11 rounded-xl"
const dateValue = (v?: string | null) =>
  v ? new Date(v).toISOString().slice(0, 10) : ""
const dateToValue = (date?: Date) =>
  date
    ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
    : ""
const valueToDate = (value?: unknown) =>
  value ? new Date(`${String(value).slice(0, 10)}T12:00:00`) : undefined
function initial(kind: TechnicalKind, item?: Entity): TechnicalFormValues {
  if (!item) return { title: "", contentType: kind === "knowledge-base" ? "ARTICLE" : undefined }
  const common = { title: item.title }
  if (kind === "releases") {
    const x = item as TechnicalRelease
    return {
      ...common,
      productId: x.productId,
      version: x.version,
      summary: x.summary || "",
      releaseNotes: x.releaseNotes || "",
      releaseDate: dateValue(x.releaseDate),
      supportStartDate: dateValue(x.supportStartDate),
      supportEndDate: dateValue(x.supportEndDate),
      endOfLifeDate: dateValue(x.endOfLifeDate),
    }
  }
  if (kind === "knowledge-base") {
    const x = item as KnowledgeArticle
    return {
      ...common,
      slug: x.slug,
      content: x.content || "",
      contentType: x.contentType || "ARTICLE",
      externalUrl: x.externalUrl || "",
      summary: x.summary || "",
      category: x.category || "",
      visibility: x.visibility,
      productId: x.productId || "",
      releaseId: x.releaseId || "",
      ownerId: x.ownerId || "",
      reviewerId: x.reviewerId || "",
      nextReviewAt: dateValue(x.nextReviewAt),
    }
  }
  if (kind === "documents") {
    const x = item as TechnicalDocument
    return {
      ...common,
      documentType: x.documentType,
      ownerId: x.ownerId,
      description: x.description || "",
      confidentiality: x.confidentiality,
      productId: x.productId || "",
      releaseId: x.releaseId || "",
      companyId: x.companyId || "",
      opportunityId: x.opportunityId || "",
      tenderId: x.tenderId || "",
      effectiveFrom: dateValue(x.effectiveFrom),
      expiresAt: dateValue(x.expiresAt),
    }
  }
  if (kind === "resources") {
    const x = item as TechnicalResource
    return {
      ...common,
      resourceType: x.resourceType,
      status: x.status,
      description: x.description || "",
      productId: x.productId || "",
      releaseId: x.releaseId || "",
      url: x.url || "",
      version: x.version || "",
      checksum: x.checksum || "",
      ownerId: x.ownerId || "",
    }
  }
  const x = item as Tender
  return {
    ...common,
    tenderType: x.tenderType,
    ownerId: x.ownerId,
    referenceNumber: x.referenceNumber || "",
    companyId: x.companyId || "",
    opportunityId: x.opportunityId || "",
    teamId: x.teamId || "",
    source: x.source || "",
    description: x.description || "",
    submissionDeadline: dateValue(x.submissionDeadline),
    technicalDeadline: dateValue(x.technicalDeadline),
    expectedDecisionDate: dateValue(x.expectedDecisionDate),
    estimatedValue: x.estimatedValue || "",
    currency: x.currency || "IRR",
    probability: String(x.probability ?? 0),
    technicalLeadId: x.technicalLeadId || "",
    commercialLeadId: x.commercialLeadId || "",
  }
}
export function TechnicalForm({
  kind,
  item,
  onSubmit,
  onCancel,
  pending,
}: {
  kind: TechnicalKind
  item?: Entity
  onSubmit: (v: TechnicalFormValues) => Promise<void>
  onCancel: () => void
  pending: boolean
}) {
  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    setError,
    formState: { errors },
  } = useForm<TechnicalFormValues>({
    resolver: zodResolver(schema),
    defaultValues: initial(kind, item),
  })
  useEffect(() => reset(initial(kind, item)), [item, kind, reset])
  const productId = useWatch({ control, name: "productId" }),
    companyId = useWatch({ control, name: "companyId" })
  const releaseIdentityLocked =
    kind === "releases" &&
    item !== undefined &&
    ["RELEASED", "DEPRECATED", "END_OF_LIFE"].includes(
      (item as TechnicalRelease).status
    )
  async function submit(v: TechnicalFormValues) {
    const required: Partial<Record<keyof TechnicalFormValues, string>> =
      kind === "releases"
        ? { productId: "محصول الزامی است", version: "نسخه الزامی است" }
        : kind === "knowledge-base"
          ? { slug: "نامک الزامی است" }
          : kind === "documents"
            ? {
                documentType: "نوع سند الزامی است",
                ownerId: "مالک سند الزامی است",
              }
            : kind === "resources"
              ? { resourceType: "نوع منبع الزامی است" }
              : {
                  tenderType: "نوع مناقصه الزامی است",
                  ownerId: "مالک مناقصه الزامی است",
                }
    let invalid = false
    Object.entries(required).forEach(([field, message]) => {
      if (!String(v[field as keyof TechnicalFormValues] ?? "").trim()) {
        setError(field as keyof TechnicalFormValues, { message })
        invalid = true
      }
    })
    if (kind === "knowledge-base") {
      if ((v.contentType || "ARTICLE") === "ARTICLE" && !v.content?.trim()) {
        setError("content", { message: "متن مقاله الزامی است" })
        invalid = true
      }
      if (v.contentType === "EXTERNAL_LINK" && !v.externalUrl?.trim()) {
        setError("externalUrl", { message: "آدرس منبع الزامی است" })
        invalid = true
      }
    }
    if (kind === "releases") {
      const schedule: Array<{
        field: keyof TechnicalFormValues
        label: string
        value?: string
      }> = [
        { field: "releaseDate", label: "تاریخ انتشار", value: v.releaseDate },
        {
          field: "supportStartDate",
          label: "شروع پشتیبانی",
          value: v.supportStartDate,
        },
        {
          field: "supportEndDate",
          label: "پایان پشتیبانی",
          value: v.supportEndDate,
        },
        { field: "endOfLifeDate", label: "پایان عمر", value: v.endOfLifeDate },
      ]
      const populatedSchedule = schedule.filter((entry) => Boolean(entry.value))
      for (let index = 1; index < populatedSchedule.length; index += 1) {
        const currentDate = populatedSchedule[index]
        const previousDate = populatedSchedule[index - 1]
        if (
          currentDate?.value &&
          previousDate?.value &&
          currentDate.value < previousDate.value
        ) {
          setError(currentDate.field, {
            message: `${currentDate.label} نمی‌تواند قبل از ${previousDate.label} باشد`,
          })
          invalid = true
          break
        }
      }
    }
    if (invalid) return
    try {
      await onSubmit(v)
    } catch (e) {
      setError("root", {
        message: getApiErrorMessage(e, "ذخیره اطلاعات انجام نشد"),
      })
    }
  }
  return (
    <form className="contents" onSubmit={handleSubmit(submit)} noValidate>
      <FormDialogBody>
        <FormSection
          title="اطلاعات اصلی"
          description={
            kind === "documents" && !item
              ? "ابتدا مشخصات سند را ذخیره کنید؛ سپس در صفحه سند، شماره نسخه و فایل اصلی را یکجا بارگذاری می‌کنید."
              : "فیلدهای الزامی و شناسه‌های اصلی را تکمیل کنید."
          }
        >
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="عنوان" error={errors.title?.message}>
              <Input {...register("title")} className={inputClass} />
            </Field>
            {kind === "releases" ? (
              <>
                <LookupField
                  kind="products"
                  label="محصول"
                  name="productId"
                  control={control}
                  error={errors.productId?.message}
                  onValueChange={() => setValue("releaseId", "")}
                  disabled={releaseIdentityLocked}
                />
                <Field label="نسخه" error={errors.version?.message}>
                  <Input
                    dir="ltr"
                    {...register("version")}
                    className={inputClass}
                    disabled={releaseIdentityLocked}
                  />
                </Field>
                {releaseIdentityLocked ? (
                  <p className="text-xs leading-5 text-muted-foreground md:col-span-2">
                    محصول و شماره نسخه پس از انتشار ثابت می‌مانند؛ سایر
                    اطلاعات و زمان‌بندی همچنان قابل ویرایش‌اند.
                  </p>
                ) : null}
              </>
            ) : null}
            {kind === "knowledge-base" ? (
              <>
                <Field label="نامک" error={errors.slug?.message}>
                  <Input
                    dir="ltr"
                    {...register("slug")}
                    className={inputClass}
                  />
                </Field>
                <KnowledgeCategoryField control={control} />
                <Field label="سطح دسترسی">
                  <ControlledSelect
                    name="visibility"
                    control={control}
                    options={{ INTERNAL: "داخلی", RESTRICTED: "محدود" }}
                  />
                </Field>
              </>
            ) : null}
            {kind === "documents" ? (
              <>
                <Field label="نوع سند" error={errors.documentType?.message}>
                  <Input {...register("documentType")} className={inputClass} />
                </Field>
                <Field label="محرمانگی">
                  <ControlledSelect
                    name="confidentiality"
                    control={control}
                    options={confidentialityLabels}
                  />
                </Field>
              </>
            ) : null}
            {kind === "resources" ? (
              <>
                <Field label="نوع منبع" error={errors.resourceType?.message}>
                  <ControlledSelect
                    name="resourceType"
                    control={control}
                    options={resourceTypeLabels}
                  />
                </Field>
                {item ? (
                  <Field label="وضعیت">
                    <ControlledSelect
                      name="status"
                      control={control}
                      options={resourcePresentation.label}
                    />
                  </Field>
                ) : null}
              </>
            ) : null}
            {kind === "tenders" ? (
              <>
                <Field label="نوع مناقصه" error={errors.tenderType?.message}>
                  <ControlledSelect
                    name="tenderType"
                    control={control}
                    options={tenderTypeLabels}
                  />
                </Field>
                <Field label="شماره مرجع">
                  <Input
                    {...register("referenceNumber")}
                    className={inputClass}
                  />
                </Field>
              </>
            ) : null}
          </div>
        </FormSection>
        <Relations
          kind={kind}
          control={control}
          productId={productId}
          companyId={companyId}
          errors={errors}
          clearRelease={() => setValue("releaseId", "")}
          clearOpportunity={() => setValue("opportunityId", "")}
        />
        <DomainFields kind={kind} register={register} control={control} errors={errors} />
        {errors.root?.message ? (
          <p
            role="alert"
            className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive"
          >
            {errors.root.message}
          </p>
        ) : null}
      </FormDialogBody>
      <FormDialogFooter>
        <FormActions onCancel={onCancel} pending={pending} />
      </FormDialogFooter>
    </form>
  )
}
function Relations({
  kind,
  control,
  productId,
  companyId,
  errors,
  clearRelease,
  clearOpportunity,
}: {
  kind: TechnicalKind
  control: Control<TechnicalFormValues>
  productId?: string
  companyId?: string
  errors: Partial<Record<keyof TechnicalFormValues, { message?: string }>>
  clearRelease: () => void
  clearOpportunity: () => void
}) {
  if (kind === "releases") return null
  return (
    <FormSection
      title="ارتباطات"
      description="ارتباط با داده‌های موجود CRM؛ Release باید متعلق به Product انتخابی باشد."
    >
      <div className="grid gap-4 md:grid-cols-2">
        {["knowledge-base", "documents", "resources"].includes(kind) ? (
          <>
            <LookupField
              kind="products"
              label="محصول"
              name="productId"
              control={control}
              onValueChange={clearRelease}
            />
            <ReleaseSelect productId={productId} control={control} />
          </>
        ) : null}
        {["documents", "tenders"].includes(kind) ? (
          <>
            <LookupField
              kind="companies"
              label="شرکت"
              name="companyId"
              control={control}
              onValueChange={clearOpportunity}
            />
            <LookupField
              kind="opportunities"
              companyId={companyId}
              label="فرصت"
              name="opportunityId"
              control={control}
            />
          </>
        ) : null}
        {["knowledge-base", "documents", "resources"].includes(
          kind
        ) ? (
          <ScopedUserField
            label="مالک"
            name="ownerId"
            control={control}
            error={errors.ownerId?.message}
          />
        ) : null}
        {kind === "tenders" ? (
          <>
            <ScopedUserField
              label="مالک"
              name="ownerId"
              control={control}
              error={errors.ownerId?.message}
              required
            />
            <ScopedUserField
              label="مسئول فنی"
              name="technicalLeadId"
              control={control}
            />
            <ScopedUserField
              label="مسئول تجاری"
              name="commercialLeadId"
              control={control}
            />
          </>
        ) : null}
      </div>
    </FormSection>
  )
}
function DomainFields({
  kind,
  register,
  control,
  errors,
}: {
  kind: TechnicalKind
  register: UseFormRegister<TechnicalFormValues>
  control: Control<TechnicalFormValues>
  errors: Partial<Record<keyof TechnicalFormValues, { message?: string }>>
}) {
  const contentType = useWatch({ control, name: "contentType" }) || "ARTICLE"
  return (
    <FormSection title="محتوا و زمان‌بندی">
      <div className="grid gap-4 md:grid-cols-2">
        {kind === "releases" ? (
          <>
            <Area label="خلاصه" reg={register("summary")} />
            <Area label="یادداشت انتشار" reg={register("releaseNotes")} />
            <DateField
              label="تاریخ انتشار"
              name="releaseDate"
              control={control}
            />
            <DateField
              label="شروع پشتیبانی"
              name="supportStartDate"
              control={control}
            />
            <DateField
              label="پایان پشتیبانی"
              name="supportEndDate"
              control={control}
            />
            <DateField
              label="پایان عمر"
              name="endOfLifeDate"
              control={control}
            />
          </>
        ) : kind === "knowledge-base" ? (
          <>
            <Area label="خلاصه" reg={register("summary")} />
            <Field label="شیوه ارائه محتوا">
              <ControlledSelect name="contentType" control={control} options={{ ARTICLE: "متن داخل سامانه", EXTERNAL_LINK: "لینک خارجی" }} />
            </Field>
            {contentType === "EXTERNAL_LINK" ? (
              <Field label="لینک مقاله، Google Docs یا Google Sheets" error={errors.externalUrl?.message} className="md:col-span-2">
                <Input dir="ltr" inputMode="url" placeholder="https://docs.google.com/..." {...register("externalUrl")} className={inputClass} />
              </Field>
            ) : (
              <Area label="متن مقاله" reg={register("content")} large error={errors.content?.message} />
            )}
            <DateField
              label="بازبینی بعدی"
              name="nextReviewAt"
              control={control}
            />
          </>
        ) : kind === "documents" ? (
          <>
            <Area label="توضیحات" reg={register("description")} />
            <DateField
              label="تاریخ اثر"
              name="effectiveFrom"
              control={control}
            />
            <DateField label="انقضا" name="expiresAt" control={control} />
          </>
        ) : kind === "resources" ? (
          <>
            <Area label="توضیحات" reg={register("description")} />
            <Field label="URL">
              <Input dir="ltr" {...register("url")} className={inputClass} />
            </Field>
            <Field label="نسخه">
              <Input
                dir="ltr"
                {...register("version")}
                className={inputClass}
              />
            </Field>
            <Field label="Checksum">
              <Input
                dir="ltr"
                {...register("checksum")}
                className={inputClass}
              />
            </Field>
          </>
        ) : (
          <>
            <Area label="شرح" reg={register("description")} />
            <Field label="منبع">
              <Input {...register("source")} className={inputClass} />
            </Field>
            <DateField
              label="مهلت ارسال"
              name="submissionDeadline"
              control={control}
            />
            <DateField
              label="مهلت فنی"
              name="technicalDeadline"
              control={control}
            />
            <DateField
              label="تصمیم مورد انتظار"
              name="expectedDecisionDate"
              control={control}
            />
            <Field label="ارزش برآوردی">
              <Input
                inputMode="decimal"
                dir="ltr"
                {...register("estimatedValue")}
                className={inputClass}
              />
            </Field>
            <CurrencyField control={control} />
            <Field label="احتمال موفقیت">
              <Input
                type="number"
                min={0}
                max={100}
                {...register("probability")}
                className={inputClass}
              />
            </Field>
          </>
        )}
      </div>
    </FormSection>
  )
}
function CurrencyField({ control }: { control: Control<TechnicalFormValues> }) {
  const [search, setSearch] = useState("")
  const debouncedSearch = useDebouncedValue(search, 250)
  const options = useQuery({
    queryKey: ["technical-tender-currencies", debouncedSearch],
    queryFn: () => technicalLookups("currencies", debouncedSearch),
  })
  return (
    <Field label="ارز">
      <Controller
        name="currency"
        control={control}
        render={({ field }) => (
          <SearchableOptionSelect
            value={typeof field.value === "string" ? field.value : "IRR"}
            onChange={(value) => field.onChange(value || "IRR")}
            options={options.data ?? []}
            search={search}
            onSearchChange={setSearch}
            loading={options.isLoading || options.isFetching}
            allowEmpty={false}
            placeholder="انتخاب ارز"
            ariaLabel="ارز"
          />
        )}
      />
    </Field>
  )
}
function ScopedUserField({ label, name, control, error, required }: { label: string; name: FieldPath<TechnicalFormValues>; control: Control<TechnicalFormValues>; error?: string; required?: boolean }) {
  return <Field label={label} error={error}><Controller name={name} control={control} render={({ field }) => <ScopedUserSelect value={typeof field.value === "string" ? field.value : undefined} onChange={(value) => field.onChange(value || "")} ariaLabel={label} required={required} />} /></Field>
}
function KnowledgeCategoryField({ control }: { control: Control<TechnicalFormValues> }) {
  const [search, setSearch] = useState("")
  const debouncedSearch = useDebouncedValue(search, 250)
  const q = useQuery({
    queryKey: ["technical-knowledge-categories", debouncedSearch],
    queryFn: () => technicalLookups("knowledge-categories", debouncedSearch),
  })
  return (
    <Field label="دسته‌بندی">
      <Controller
        name="category"
        control={control}
        render={({ field }) => (
          <SearchableOptionSelect
            value={typeof field.value === "string" ? field.value : undefined}
            onChange={(value) => field.onChange(value || "")}
            options={q.data ?? []}
            search={search}
            onSearchChange={setSearch}
            loading={q.isLoading || q.isFetching}
            placeholder="انتخاب یا ایجاد دسته‌بندی"
            searchPlaceholder="جست‌وجو یا نوشتن دسته جدید..."
            emptyText="دسته‌ای ثبت نشده است؛ نام دسته جدید را بنویسید."
            allowCustom
            customLabel="ایجاد دسته‌بندی"
            ariaLabel="دسته‌بندی"
          />
        )}
      />
    </Field>
  )
}
function LookupField({
  kind,
  label,
  name,
  control,
  companyId,
  error,
  onValueChange,
  disabled = false,
}: {
  kind: "products" | "companies" | "opportunities" | "users"
  label: string
  name: FieldPath<TechnicalFormValues>
  control: Control<TechnicalFormValues>
  companyId?: string
  error?: string
  onValueChange?: () => void
  disabled?: boolean
}) {
  const [search, setSearch] = useState("")
  const debouncedSearch = useDebouncedValue(search, 250)
  const q = useQuery({
    queryKey: ["technical-lookups", kind, companyId, debouncedSearch],
    queryFn: () => technicalLookups(kind, debouncedSearch, companyId),
    enabled: kind !== "opportunities" || Boolean(companyId),
  })
  return (
    <Field label={label} error={error}>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <SearchableOptionSelect
            value={String(field.value || "") || undefined}
            onChange={(value) => {
              field.onChange(value || "")
              onValueChange?.()
            }}
            options={q.data ?? []}
            search={search}
            onSearchChange={setSearch}
            placeholder={
              kind === "opportunities" && !companyId
                ? "ابتدا شرکت را انتخاب کنید"
                : "انتخاب کنید"
            }
            ariaLabel={label}
            disabled={disabled || (kind === "opportunities" && !companyId)}
            loading={q.isLoading || q.isFetching}
            emptyText={q.isError ? "دریافت گزینه‌ها انجام نشد." : undefined}
          />
        )}
      />
    </Field>
  )
}
function ReleaseSelect({
  productId,
  control,
}: {
  productId?: string
  control: Control<TechnicalFormValues>
}) {
  const [search, setSearch] = useState("")
  const debouncedSearch = useDebouncedValue(search, 250)
  const q = useQuery({
    queryKey: ["technical-release-options", productId, debouncedSearch],
    queryFn: async () => {
      const result = await technicalApi.releases.list({
        page: 1,
        limit: 100,
        productId: productId || undefined,
        search: debouncedSearch || undefined,
      })
      return result.data
    },
    enabled: Boolean(productId),
  })
  return (
    <Field label="انتشار">
      <Controller
        name="releaseId"
        control={control}
        render={({ field }) => (
          <SearchableOptionSelect
            value={String(field.value || "") || undefined}
            onChange={(value) => field.onChange(value || "")}
            options={(q.data ?? []).map((option) => ({
              id: option.id,
              label: option.title,
              secondary: option.version,
            }))}
            search={search}
            onSearchChange={setSearch}
            placeholder={
              productId ? "انتخاب انتشار" : "ابتدا محصول را انتخاب کنید"
            }
            ariaLabel="انتشار"
            disabled={!productId}
            loading={q.isLoading || q.isFetching}
            emptyText={q.isError ? "دریافت انتشارها انجام نشد." : undefined}
          />
        )}
      />
    </Field>
  )
}
function ControlledSelect({
  name,
  control,
  options,
}: {
  name: FieldPath<TechnicalFormValues>
  control: Control<TechnicalFormValues>
  options: Record<string, string>
}) {
  const [search, setSearch] = useState("")
  const normalized = search.trim().toLocaleLowerCase("fa")
  const visibleOptions = useMemo(
    () =>
      Object.entries(options)
        .filter(
          ([value, label]) =>
            !normalized ||
            value.toLocaleLowerCase("en").includes(normalized) ||
            label.toLocaleLowerCase("fa").includes(normalized)
        )
        .map(([id, label]) => ({ id, label })),
    [normalized, options]
  )
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <SearchableOptionSelect
          value={String(field.value || "") || undefined}
          onChange={(value) => field.onChange(value || "")}
          options={visibleOptions}
          search={search}
          onSearchChange={setSearch}
          placeholder="انتخاب کنید"
        />
      )}
    />
  )
}
function Field({
  label,
  children,
  error,
  className,
}: {
  label: string
  children: React.ReactNode
  error?: string
  className?: string
}) {
  return (
    <label className={`grid gap-2 text-sm font-bold ${className || ""}`}>
      {label}
      {children}
      {error ? <span className="text-xs text-destructive">{error}</span> : null}
    </label>
  )
}
function Area({
  label,
  reg,
  large,
  error,
}: {
  label: string
  reg: UseFormRegisterReturn
  large?: boolean
  error?: string
}) {
  return (
    <Field label={label} error={error} className={large ? "md:col-span-2" : undefined}>
      <textarea
        {...reg}
        className={`${large ? "min-h-72" : "min-h-28"} rounded-xl border bg-background p-3 text-sm`}
      />
    </Field>
  )
}
function DateField({
  label,
  name,
  control,
}: {
  label: string
  name: FieldPath<TechnicalFormValues>
  control: Control<TechnicalFormValues>
}) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Field label={label} error={fieldState.error?.message}>
          <PersianDatePicker
            value={valueToDate(field.value)}
            onChange={(date) => field.onChange(dateToValue(date))}
          />
        </Field>
      )}
    />
  )
}
