import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { FilePenLine, History, Settings2 } from "lucide-react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { toast } from "sonner"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { Input } from "@workspace/ui/components/input"
import { FormField as FormFieldControl } from "@workspace/ui/components/form-field"
import { NativeSelect } from "@workspace/ui/components/native-select"
import { ContentSection } from "@/components/shared/ContentSection"
import { ErrorState } from "@/components/shared/ErrorState"
import { FormSection } from "@/components/shared/FormSection"
import { PageHero } from "@/components/shared/PageHero"
import { QueryContent } from "@/components/shared/QueryContent"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { normalizeAppError } from "@/lib/appError"
import { DynamicRequestForm } from "./DynamicRequestForm"
import { internalRequestApi } from "./customerRequests.api"
import type {
  FieldType,
  FormField,
  FormSchema,
  RequestRoutingDestination,
} from "./customerRequests.types"

const fieldTypes: { value: FieldType; label: string }[] = [
  { value: "TEXT", label: "متن کوتاه" },
  { value: "TEXTAREA", label: "متن بلند" },
  { value: "NUMBER", label: "عدد" },
  { value: "EMAIL", label: "ایمیل" },
  { value: "PHONE", label: "تلفن" },
  { value: "DATE", label: "تاریخ" },
  { value: "SELECT", label: "انتخاب تکی" },
  { value: "MULTI_SELECT", label: "انتخاب چندتایی" },
  { value: "RADIO", label: "رادیویی" },
  { value: "CHECKBOX", label: "تأیید" },
  { value: "BOOLEAN", label: "بله/خیر" },
  { value: "INFO", label: "متن راهنما" },
  { value: "SECTION", label: "عنوان بخش" },
]
const blankField = (index: number): FormField => ({
  key: `field_${index}`,
  type: "TEXT",
  label: "فیلد جدید",
  required: false,
})
const routingFa: Record<RequestRoutingDestination, string> = {
  MANUAL: "رسیدگی دستی",
  TASK: "کار داخلی",
  TECHNICAL_DOCUMENT: "مرکز فنی",
  OPPORTUNITY: "فرصت فروش",
}

export function CustomerRequestTypesAdminPage() {
  const client = useQueryClient(),
    types = useQuery({
      queryKey: ["customer-request-types-admin"],
      queryFn: () => internalRequestApi.types(true),
    }),
    [name, setName] = useState(""),
    [code, setCode] = useState("")
  const create = useMutation({
    mutationFn: () =>
      internalRequestApi.createType({ code, displayName: name }),
    onSuccess: () => {
      setName("")
      setCode("")
      void client.invalidateQueries({
        queryKey: ["customer-request-types-admin"],
      })
    },
    onError: () => toast.error("ایجاد نوع درخواست انجام نشد."),
  })
  return (
    <section className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">انواع درخواست خدمات</h1>
        <p className="text-sm text-muted-foreground">
          کاتالوگ، فرم نسخه‌دار و دسترسی شرکت‌ها را مدیریت کنید.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">نوع درخواست جدید</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
          <Input
            placeholder="نام نمایشی فارسی"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            dir="ltr"
            placeholder="MACHINE_CODE"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <Button
            disabled={!name || !code || create.isPending}
            onClick={() => create.mutate()}
          >
            ایجاد
          </Button>
        </CardContent>
      </Card>
      <div className="grid gap-3">
        {types.data?.map((t) => (
          <Card key={t.id}>
            <CardContent className="flex flex-wrap items-center gap-3 pt-6">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <strong>{t.displayName}</strong>
                  <Badge
                    variant={
                      t.isEnabled && !t.retiredAt ? "default" : "secondary"
                    }
                  >
                    {t.retiredAt
                      ? "بازنشسته"
                      : t.isEnabled
                        ? "فعال"
                        : "غیرفعال"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground" dir="ltr">
                  {t.code} · {t._count?.requests ?? 0} requests ·{" "}
                  {t._count?.formVersions ?? 0} versions
                </p>
              </div>
              <Button
                variant="outline"
                render={<Link to={`/admin/customer-request-types/${t.id}`} />}
              >
                تنظیمات و فرم
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}

export function CustomerRequestTypeEditorPage() {
  const { id = "" } = useParams(),
    navigate = useNavigate(),
    client = useQueryClient(),
    types = useQuery({
      queryKey: ["customer-request-types-admin"],
      queryFn: () => internalRequestApi.types(true),
    }),
    versions = useQuery({
      queryKey: ["customer-request-form-versions", id],
      queryFn: () => internalRequestApi.versions(id),
      enabled: !!id,
    }),
    companies = useQuery({
      queryKey: ["customer-request-companies"],
      queryFn: internalRequestApi.companies,
    }),
    type = types.data?.find((x) => x.id === id),
    latest =
      versions.data?.find((v) => v.status === "DRAFT")?.schema ??
      type?.currentPublishedVersion?.schema,
    [schema, setSchema] = useState<FormSchema | null>(null)
  const value = schema ?? latest ?? { fields: [] }
  const save = useMutation({
      mutationFn: () => internalRequestApi.saveForm(id, value),
      onSuccess: () => {
        toast.success("نسخه پیش‌نویس فرم ذخیره شد.")
        void client.invalidateQueries({
          queryKey: ["customer-request-form-versions", id],
        })
      },
      onError: (error: unknown) =>
        toast.error(
          normalizeAppError(error, "ذخیره نسخه پیش‌نویس انجام نشد.").message
        ),
    }),
    publish = useMutation({
      mutationFn: () => internalRequestApi.publish(id),
      onSuccess: () => {
        toast.success("فرم منتشر شد.")
        void client.invalidateQueries({
          queryKey: ["customer-request-form-versions", id],
        })
        void client.invalidateQueries({
          queryKey: ["customer-request-types-admin"],
        })
      },
      onError: (error: unknown) =>
        toast.error(normalizeAppError(error, "انتشار فرم انجام نشد.").message),
    }),
    metadata = useMutation({
      mutationFn: (input: Record<string, unknown>) =>
        internalRequestApi.updateType(id, input),
      onSuccess: () =>
        void client.invalidateQueries({
          queryKey: ["customer-request-types-admin"],
        }),
      onError: (error: unknown) =>
        toast.error(
          normalizeAppError(error, "به‌روزرسانی تنظیمات انجام نشد.").message
        ),
    }),
    availability = useMutation({
      mutationFn: (companyIds: string[]) =>
        internalRequestApi.availability(id, companyIds),
      onSuccess: () =>
        void client.invalidateQueries({
          queryKey: ["customer-request-types-admin"],
        }),
      onError: (error: unknown) =>
        toast.error(
          normalizeAppError(error, "به‌روزرسانی دسترسی شرکت‌ها انجام نشد.")
            .message
        ),
    })
  const selectedCompanies = new Set(
    type?.companyAvailability?.map((item) => item.companyId) ?? []
  )
  const update = (index: number, patch: Partial<FormField>) =>
    setSchema({
      fields: value.fields.map((f, i) =>
        i === index ? { ...f, ...patch } : f
      ),
    })
  const editorQuery = {
    isLoading: types.isLoading || versions.isLoading || companies.isLoading,
    isError: types.isError || versions.isError || companies.isError,
    error: types.error || versions.error || companies.error,
    refetch: () =>
      Promise.all([types.refetch(), versions.refetch(), companies.refetch()]),
  }

  if (!types.isLoading && !types.isError && !type) {
    return (
      <ErrorState
        title="نوع درخواست در دسترس نیست"
        description="این نوع درخواست پیدا نشد یا دیگر در دسترس نیست."
      />
    )
  }

  return (
    <QueryContent
      query={editorQuery}
      errorTitle="دریافت تنظیمات نوع درخواست انجام نشد"
    >
      <section className="space-y-5">
        <PageHero
          title={`طراحی فرم: ${type?.displayName || "..."}`}
          description="نسخه منتشرشده قابل ویرایش نیست؛ تغییرات در یک نسخه پیش‌نویس جدید ذخیره می‌شوند."
          accessBadge={{ label: "مدیریت نوع درخواست", icon: FilePenLine }}
          onBack={() => navigate("/admin/customer-request-types")}
          onRefresh={() => editorQuery.refetch()}
          refreshing={
            types.isFetching || versions.isFetching || companies.isFetching
          }
          metadata={
            <>
              <StatusBadge
                tone={
                  type?.retiredAt
                    ? "error"
                    : type?.isEnabled
                      ? "success"
                      : "secondary"
                }
              >
                {type?.retiredAt
                  ? "بازنشسته"
                  : type?.isEnabled
                    ? "فعال"
                    : "غیرفعال"}
              </StatusBadge>
              <StatusBadge tone="info" dot={false}>
                {type?.currentPublishedVersion
                  ? `نسخه منتشرشده ${type.currentPublishedVersion.version}`
                  : "بدون نسخه منتشرشده"}
              </StatusBadge>
            </>
          }
        />
        <FormSection
          title="وضعیت و دسترسی شرکت‌ها"
          description="وضعیت انتشار، مسیر پیش‌فرض و شرکت‌های مجاز را مدیریت کنید."
        >
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={metadata.isPending}
                aria-busy={metadata.isPending || undefined}
                onClick={() => metadata.mutate({ isEnabled: !type?.isEnabled })}
              >
                {type?.isEnabled ? "غیرفعال‌کردن" : "فعال‌کردن"}
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={metadata.isPending}
                onClick={() => metadata.mutate({ retired: !type?.retiredAt })}
              >
                {type?.retiredAt ? "بازگردانی" : "بازنشسته‌کردن"}
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={metadata.isPending}
                onClick={() =>
                  metadata.mutate({
                    availabilityPolicy: "ALL_PORTAL_COMPANIES",
                  })
                }
              >
                در دسترس همه شرکت‌ها
              </Button>
            </div>
            <FormFieldControl
              label="مسیر پیشنهادی پیش‌فرض"
              className="max-w-sm"
            >
              {(fieldProps) => (
                <NativeSelect
                  {...fieldProps}
                  value={type?.defaultRoutingDestination ?? "MANUAL"}
                  disabled={metadata.isPending}
                  onChange={(event) =>
                    metadata.mutate({
                      defaultRoutingDestination: event.target.value,
                    })
                  }
                >
                  {Object.entries(routingFa).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </NativeSelect>
              )}
            </FormFieldControl>
            <div>
              <p className="mb-2 text-sm font-medium">
                محدود به شرکت‌های منتخب
              </p>
              <div className="grid max-h-48 gap-2 overflow-auto rounded-lg border p-3 sm:grid-cols-2">
                {companies.data?.map((company) => (
                  <label
                    key={company.id}
                    className="flex items-center gap-2 text-sm"
                  >
                    <input
                      type="checkbox"
                      disabled={availability.isPending}
                      checked={selectedCompanies.has(company.id)}
                      onChange={(event) => {
                        const next = new Set(selectedCompanies)
                        if (event.target.checked) next.add(company.id)
                        else next.delete(company.id)
                        availability.mutate([...next])
                      }}
                    />
                    {company.brandName || company.legalName}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </FormSection>
        <div className="grid gap-5 xl:grid-cols-2">
          <FormSection
            title="ویرایشگر فرم"
            description="فیلدهای نسخه پیش‌نویس را با حفظ ترتیب فعلی ویرایش کنید."
            footer={
              <div className="flex flex-wrap justify-end gap-2">
                <Button
                  type="button"
                  onClick={() => save.mutate()}
                  disabled={save.isPending || publish.isPending}
                  aria-busy={save.isPending || undefined}
                >
                  {save.isPending ? "در حال ذخیره..." : "ذخیره پیش‌نویس"}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => publish.mutate()}
                  disabled={
                    save.isPending ||
                    publish.isPending ||
                    !versions.data?.some(
                      (version) => version.status === "DRAFT"
                    )
                  }
                  aria-busy={publish.isPending || undefined}
                >
                  {publish.isPending ? "در حال انتشار..." : "انتشار نسخه"}
                </Button>
              </div>
            }
          >
            <div className="space-y-3">
              {value.fields.map((f, i) => (
                <div
                  key={`field-${i}`}
                  className="grid gap-2 rounded-xl border p-3 sm:grid-cols-2"
                >
                  <FormFieldControl label="کلید فیلد">
                    {(fieldProps) => (
                      <Input
                        {...fieldProps}
                        dir="ltr"
                        value={f.key}
                        onChange={(event) =>
                          update(i, { key: event.target.value })
                        }
                      />
                    )}
                  </FormFieldControl>
                  <FormFieldControl label="عنوان فیلد">
                    {(fieldProps) => (
                      <Input
                        {...fieldProps}
                        value={f.label}
                        onChange={(event) =>
                          update(i, { label: event.target.value })
                        }
                      />
                    )}
                  </FormFieldControl>
                  <FormFieldControl label="نوع فیلد">
                    {(fieldProps) => (
                      <NativeSelect
                        {...fieldProps}
                        value={f.type}
                        onChange={(event) =>
                          update(i, { type: event.target.value as FieldType })
                        }
                      >
                        {fieldTypes.map((fieldType) => (
                          <option key={fieldType.value} value={fieldType.value}>
                            {fieldType.label}
                          </option>
                        ))}
                      </NativeSelect>
                    )}
                  </FormFieldControl>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={!!f.required}
                      onChange={(e) =>
                        update(i, { required: e.target.checked })
                      }
                    />{" "}
                    الزامی
                  </label>
                  {["SELECT", "MULTI_SELECT", "RADIO"].includes(f.type) && (
                    <FormFieldControl
                      className="sm:col-span-2"
                      label="گزینه‌های قابل انتخاب"
                      description="گزینه‌ها را با ویرگول از هم جدا کنید."
                    >
                      {(fieldProps) => (
                        <Input
                          {...fieldProps}
                          placeholder="مثلاً فوری، عادی، کم‌اهمیت"
                          value={f.options?.map((o) => o.label).join(",") ?? ""}
                          onChange={(event) =>
                            update(i, {
                              options: event.target.value
                                .split(",")
                                .filter(Boolean)
                                .map((option) => ({
                                  value: option.trim().replace(/\s+/g, "_"),
                                  label: option.trim(),
                                })),
                            })
                          }
                        />
                      )}
                    </FormFieldControl>
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    className="sm:col-span-2"
                    onClick={() =>
                      setSchema({
                        fields: value.fields.filter((_, n) => n !== i),
                      })
                    }
                  >
                    حذف فیلد
                  </Button>
                </div>
              ))}
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    setSchema({
                      fields: [
                        ...value.fields,
                        blankField(value.fields.length + 1),
                      ],
                    })
                  }
                >
                  افزودن فیلد
                </Button>
              </div>
            </div>
          </FormSection>
          <div className="space-y-5">
            <ContentSection
              title="پیش‌نمایش"
              description="نمای نهایی فرم را هم‌زمان با ویرایش فیلدها بررسی کنید."
              icon={Settings2}
            >
              <DynamicRequestForm
                schema={value}
                value={{}}
                onChange={() => {}}
              />
            </ContentSection>
            <ContentSection
              title="تاریخچه نسخه‌ها"
              description="وضعیت نسخه‌های ذخیره‌شده این نوع درخواست."
              icon={History}
            >
              <div className="space-y-2">
                {versions.data?.map((version) => (
                  <div
                    key={version.id}
                    className="flex items-center justify-between gap-3 rounded-lg border p-3 text-sm"
                  >
                    <span>نسخه {version.version}</span>
                    <StatusBadge
                      tone={
                        version.status === "PUBLISHED" ? "success" : "warning"
                      }
                    >
                      {version.status === "PUBLISHED" ? "منتشرشده" : "پیش‌نویس"}
                    </StatusBadge>
                  </div>
                ))}
              </div>
            </ContentSection>
          </div>
        </div>
      </section>
    </QueryContent>
  )
}

export { CustomerRequestsInboxPage } from "./CustomerRequestsInboxPage"
export { CustomerRequestInternalDetailPage } from "./CustomerRequestInternalDetailPage"
