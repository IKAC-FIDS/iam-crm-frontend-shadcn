import { useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  useForm,
  useWatch,
  type UseFormRegister,
  type UseFormRegisterReturn,
} from "react-hook-form"
import { useQuery } from "@tanstack/react-query"
import { z } from "zod"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { FormSection } from "@/components/shared/FormSection"
import { getApiErrorMessage } from "@/lib/apiResponse"
import { technicalApi, technicalLookups } from "../api"
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
const selectClass =
  "h-11 rounded-xl border border-[var(--app-divider)] bg-background px-3 text-sm"
const dateValue = (v?: string | null) =>
  v ? new Date(v).toISOString().slice(0, 10) : ""
function initial(kind: TechnicalKind, item?: Entity): TechnicalFormValues {
  if (!item) return { title: "" }
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
      content: x.content,
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
    setError,
    formState: { errors },
  } = useForm<TechnicalFormValues>({
    resolver: zodResolver(schema),
    defaultValues: initial(kind, item),
  })
  useEffect(() => reset(initial(kind, item)), [item, kind, reset])
  const productId = useWatch({ control, name: "productId" }),
    companyId = useWatch({ control, name: "companyId" })
  async function submit(v: TechnicalFormValues) {
    const required: Partial<Record<keyof TechnicalFormValues, string>> =
      kind === "releases"
        ? { productId: "محصول الزامی است", version: "نسخه الزامی است" }
        : kind === "knowledge-base"
          ? { slug: "نامک الزامی است", content: "محتوا الزامی است" }
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
    <form className="grid gap-4" onSubmit={handleSubmit(submit)} noValidate>
      <FormSection
        title="اطلاعات اصلی"
        description="فیلدهای الزامی و شناسه‌های اصلی را تکمیل کنید."
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
                registration={register("productId")}
                error={errors.productId?.message}
              />
              <Field label="نسخه" error={errors.version?.message}>
                <Input {...register("version")} className={inputClass} />
              </Field>
            </>
          ) : null}
          {kind === "knowledge-base" ? (
            <>
              <Field label="نامک" error={errors.slug?.message}>
                <Input dir="ltr" {...register("slug")} className={inputClass} />
              </Field>
              <Field label="دسته‌بندی">
                <Input {...register("category")} className={inputClass} />
              </Field>
              <Field label="سطح دسترسی">
                <Select
                  reg={register("visibility")}
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
                <Select
                  reg={register("confidentiality")}
                  options={confidentialityLabels}
                />
              </Field>
            </>
          ) : null}
          {kind === "resources" ? (
            <>
              <Field label="نوع منبع" error={errors.resourceType?.message}>
                <Select
                  reg={register("resourceType")}
                  options={resourceTypeLabels}
                />
              </Field>
              {item ? (
                <Field label="وضعیت">
                  <Select
                    reg={register("status")}
                    options={resourcePresentation.label}
                  />
                </Field>
              ) : null}
            </>
          ) : null}
          {kind === "tenders" ? (
            <>
              <Field label="نوع مناقصه" error={errors.tenderType?.message}>
                <Select
                  reg={register("tenderType")}
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
        register={register}
        productId={productId}
        companyId={companyId}
        errors={errors}
      />
      <DomainFields kind={kind} register={register} />
      {errors.root?.message ? (
        <p
          role="alert"
          className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive"
        >
          {errors.root.message}
        </p>
      ) : null}
      <div className="sticky bottom-0 flex flex-wrap justify-end gap-2 rounded-2xl border bg-background/95 p-3 backdrop-blur">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={pending}
        >
          انصراف
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? "در حال ذخیره..." : "ذخیره"}
        </Button>
      </div>
    </form>
  )
}
function Relations({
  kind,
  register,
  productId,
  companyId,
  errors,
}: {
  kind: TechnicalKind
  register: UseFormRegister<TechnicalFormValues>
  productId?: string
  companyId?: string
  errors: Partial<Record<keyof TechnicalFormValues, { message?: string }>>
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
              registration={register("productId")}
            />
            <ReleaseSelect
              productId={productId}
              registration={register("releaseId")}
            />
          </>
        ) : null}
        {["documents", "tenders"].includes(kind) ? (
          <>
            <LookupField
              kind="companies"
              label="شرکت"
              registration={register("companyId")}
            />
            <LookupField
              kind="opportunities"
              companyId={companyId}
              label="فرصت"
              registration={register("opportunityId")}
            />
          </>
        ) : null}
        {["knowledge-base", "documents", "resources", "tenders"].includes(
          kind
        ) ? (
          <LookupField
            kind="users"
            label="مالک"
            registration={register("ownerId")}
            error={errors.ownerId?.message}
          />
        ) : null}
        {kind === "tenders" ? (
          <>
            <LookupField
              kind="users"
              label="مسئول فنی"
              registration={register("technicalLeadId")}
            />
            <LookupField
              kind="users"
              label="مسئول تجاری"
              registration={register("commercialLeadId")}
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
}: {
  kind: TechnicalKind
  register: UseFormRegister<TechnicalFormValues>
}) {
  return (
    <FormSection title="محتوا و زمان‌بندی">
      <div className="grid gap-4 md:grid-cols-2">
        {kind === "releases" ? (
          <>
            <Area label="خلاصه" reg={register("summary")} />
            <Area label="یادداشت انتشار" reg={register("releaseNotes")} />
            <DateField label="تاریخ انتشار" reg={register("releaseDate")} />
            <DateField
              label="شروع پشتیبانی"
              reg={register("supportStartDate")}
            />
            <DateField
              label="پایان پشتیبانی"
              reg={register("supportEndDate")}
            />
            <DateField label="پایان عمر" reg={register("endOfLifeDate")} />
          </>
        ) : kind === "knowledge-base" ? (
          <>
            <Area label="خلاصه" reg={register("summary")} />
            <Area label="متن مقاله" reg={register("content")} large />
            <DateField label="بازبینی بعدی" reg={register("nextReviewAt")} />
          </>
        ) : kind === "documents" ? (
          <>
            <Area label="توضیحات" reg={register("description")} />
            <DateField label="تاریخ اثر" reg={register("effectiveFrom")} />
            <DateField label="انقضا" reg={register("expiresAt")} />
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
              reg={register("submissionDeadline")}
            />
            <DateField label="مهلت فنی" reg={register("technicalDeadline")} />
            <DateField
              label="تصمیم مورد انتظار"
              reg={register("expectedDecisionDate")}
            />
            <Field label="ارزش برآوردی">
              <Input
                inputMode="decimal"
                dir="ltr"
                {...register("estimatedValue")}
                className={inputClass}
              />
            </Field>
            <Field label="ارز">
              <Input
                dir="ltr"
                maxLength={3}
                {...register("currency")}
                className={inputClass}
              />
            </Field>
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
function LookupField({
  kind,
  label,
  registration,
  companyId,
  error,
}: {
  kind: "products" | "companies" | "opportunities" | "users"
  label: string
  registration: UseFormRegisterReturn
  companyId?: string
  error?: string
}) {
  const q = useQuery({
    queryKey: ["technical-lookups", kind, companyId],
    queryFn: () => technicalLookups(kind, "", companyId),
  })
  return (
    <Field label={label} error={error}>
      <select
        {...registration}
        className={selectClass}
        disabled={kind === "opportunities" && !companyId}
      >
        <option value="">انتخاب کنید</option>
        {q.data?.map((o) => (
          <option key={o.id} value={o.id}>
            {o.label}
          </option>
        ))}
      </select>
    </Field>
  )
}
function ReleaseSelect({
  productId,
  registration,
}: {
  productId?: string
  registration: UseFormRegisterReturn
}) {
  const q = useQuery({
    queryKey: ["technical-release-options", productId],
    queryFn: async () => {
      const result = await technicalApi.releases.list({
        page: 1,
        limit: 100,
        productId: productId || undefined,
      })
      return result.data
    },
    enabled: Boolean(productId),
  })
  return (
    <Field label="انتشار">
      <select {...registration} className={selectClass} disabled={!productId}>
        <option value="">انتخاب کنید</option>
        {q.data?.map((o) => (
          <option key={o.id} value={o.id}>
            {o.version} — {o.title}
          </option>
        ))}
      </select>
    </Field>
  )
}
function Select({
  reg,
  options,
}: {
  reg: UseFormRegisterReturn
  options: Record<string, string>
}) {
  return (
    <select {...reg} className={selectClass}>
      <option value="">انتخاب کنید</option>
      {Object.entries(options).map(([v, l]) => (
        <option key={v} value={v}>
          {l}
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
  children: React.ReactNode
  error?: string
}) {
  return (
    <label className="grid gap-2 text-sm font-bold">
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
}: {
  label: string
  reg: UseFormRegisterReturn
  large?: boolean
}) {
  return (
    <Field label={label}>
      <textarea
        {...reg}
        className={`${large ? "min-h-72 md:col-span-2" : "min-h-28"} rounded-xl border bg-background p-3 text-sm`}
      />
    </Field>
  )
}
function DateField({
  label,
  reg,
}: {
  label: string
  reg: UseFormRegisterReturn
}) {
  return (
    <Field label={label}>
      <Input type="date" dir="ltr" {...reg} className={inputClass} />
    </Field>
  )
}
