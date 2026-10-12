import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Link, useParams, useSearchParams } from "react-router-dom"
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
import { DynamicRequestForm } from "./DynamicRequestForm"
import { internalRequestApi } from "./customerRequests.api"
import type {
  FieldType,
  FormField,
  FormSchema,
  RequestStatus,
} from "./customerRequests.types"
import { requestStatusFa } from "./customerRequests.presentation"

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
    }),
    metadata = useMutation({
      mutationFn: (input: Record<string, unknown>) =>
        internalRequestApi.updateType(id, input),
      onSuccess: () =>
        void client.invalidateQueries({
          queryKey: ["customer-request-types-admin"],
        }),
    }),
    availability = useMutation({
      mutationFn: (companyIds: string[]) =>
        internalRequestApi.availability(id, companyIds),
      onSuccess: () =>
        void client.invalidateQueries({
          queryKey: ["customer-request-types-admin"],
        }),
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
  return (
    <section className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">
          طراحی فرم: {type?.displayName || "..."}
        </h1>
        <p className="text-sm text-muted-foreground">
          نسخه منتشرشده قابل ویرایش نیست؛ تغییرات در یک نسخه پیش‌نویس جدید ذخیره
          می‌شوند.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>وضعیت و دسترسی شرکت‌ها</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => metadata.mutate({ isEnabled: !type?.isEnabled })}
            >
              {type?.isEnabled ? "غیرفعال‌کردن" : "فعال‌کردن"}
            </Button>
            <Button
              variant="outline"
              onClick={() => metadata.mutate({ retired: !type?.retiredAt })}
            >
              {type?.retiredAt ? "بازگردانی" : "بازنشسته‌کردن"}
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                metadata.mutate({ availabilityPolicy: "ALL_PORTAL_COMPANIES" })
              }
            >
              در دسترس همه شرکت‌ها
            </Button>
          </div>
          <div>
            <p className="mb-2 text-sm font-medium">محدود به شرکت‌های منتخب</p>
            <div className="grid max-h-48 gap-2 overflow-auto rounded-lg border p-3 sm:grid-cols-2">
              {companies.data?.map((company) => (
                <label
                  key={company.id}
                  className="flex items-center gap-2 text-sm"
                >
                  <input
                    type="checkbox"
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
        </CardContent>
      </Card>
      <div className="grid gap-5 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>ویرایشگر فرم</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {value.fields.map((f, i) => (
              <div
                key={`${f.key}-${i}`}
                className="grid gap-2 rounded-xl border p-3 sm:grid-cols-2"
              >
                <Input
                  aria-label="کلید فیلد"
                  dir="ltr"
                  value={f.key}
                  onChange={(e) => update(i, { key: e.target.value })}
                />
                <Input
                  aria-label="عنوان فیلد"
                  value={f.label}
                  onChange={(e) => update(i, { label: e.target.value })}
                />
                <select
                  className="h-10 rounded-md border bg-background px-2"
                  value={f.type}
                  onChange={(e) =>
                    update(i, { type: e.target.value as FieldType })
                  }
                >
                  {fieldTypes.map((x) => (
                    <option key={x.value} value={x.value}>
                      {x.label}
                    </option>
                  ))}
                </select>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={!!f.required}
                    onChange={(e) => update(i, { required: e.target.checked })}
                  />{" "}
                  الزامی
                </label>
                {["SELECT", "MULTI_SELECT", "RADIO"].includes(f.type) && (
                  <Input
                    className="sm:col-span-2"
                    placeholder="گزینه‌ها با کاما"
                    value={f.options?.map((o) => o.label).join(",") ?? ""}
                    onChange={(e) =>
                      update(i, {
                        options: e.target.value
                          .split(",")
                          .filter(Boolean)
                          .map((x) => ({
                            value: x.trim().replace(/\s+/g, "_"),
                            label: x.trim(),
                          })),
                      })
                    }
                  />
                )}
                <Button
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
              <Button onClick={() => save.mutate()} disabled={save.isPending}>
                ذخیره پیش‌نویس
              </Button>
              <Button
                variant="secondary"
                onClick={() => publish.mutate()}
                disabled={
                  publish.isPending ||
                  !versions.data?.some((v) => v.status === "DRAFT")
                }
              >
                انتشار نسخه
              </Button>
            </div>
          </CardContent>
        </Card>
        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle>پیش‌نمایش</CardTitle>
            </CardHeader>
            <CardContent>
              <DynamicRequestForm
                schema={value}
                value={{}}
                onChange={() => {}}
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>تاریخچه نسخه‌ها</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {versions.data?.map((v) => (
                <div
                  key={v.id}
                  className="flex justify-between rounded-lg border p-3 text-sm"
                >
                  <span>نسخه {v.version}</span>
                  <Badge variant="secondary">
                    {v.status === "PUBLISHED" ? "منتشرشده" : "پیش‌نویس"}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}

export function CustomerRequestsInboxPage() {
  const [params, setParams] = useSearchParams(),
    status = params.get("status") || "",
    search = params.get("search") || "",
    query = useQuery({
      queryKey: ["customer-requests-inbox", status, search],
      queryFn: () =>
        internalRequestApi.list({
          ...(status && { status }),
          ...(search && { search }),
        }),
    })
  return (
    <section className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">صندوق درخواست‌های مشتریان</h1>
        <p className="text-sm text-muted-foreground">
          درخواست‌های ثبت‌شده را بررسی و وضعیت آن‌ها را مدیریت کنید.
        </p>
      </div>
      <div className="grid gap-3 rounded-xl border bg-card p-4 sm:grid-cols-2">
        <Input
          placeholder="عنوان یا شماره پیگیری"
          defaultValue={search}
          onChange={(e) => {
            const p = new URLSearchParams(params)
            if (e.target.value) p.set("search", e.target.value)
            else p.delete("search")
            setParams(p, { replace: true })
          }}
        />
        <select
          className="h-10 rounded-md border bg-background px-3"
          value={status}
          onChange={(e) => {
            const p = new URLSearchParams(params)
            if (e.target.value) p.set("status", e.target.value)
            else p.delete("status")
            setParams(p)
          }}
        >
          <option value="">همه وضعیت‌ها</option>
          {Object.entries(requestStatusFa)
            .filter(([k]) => k !== "DRAFT")
            .map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
        </select>
      </div>
      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full text-sm">
          <thead className="bg-muted/60">
            <tr>
              <th className="p-3 text-start">پیگیری</th>
              <th className="p-3 text-start">عنوان</th>
              <th className="p-3 text-start">شرکت</th>
              <th className="p-3 text-start">نوع</th>
              <th className="p-3 text-start">وضعیت</th>
            </tr>
          </thead>
          <tbody>
            {query.data?.data.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="p-3">
                  <Link
                    className="text-primary"
                    to={`/customer-requests/${r.id}`}
                    dir="ltr"
                  >
                    {r.trackingNumber}
                  </Link>
                </td>
                <td className="p-3">{r.title}</td>
                <td className="p-3">
                  {r.company?.brandName || r.company?.legalName}
                </td>
                <td className="p-3">{r.requestType.displayName}</td>
                <td className="p-3">
                  <Badge variant="secondary">{requestStatusFa[r.status]}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export function CustomerRequestInternalDetailPage() {
  const { id = "" } = useParams(),
    client = useQueryClient(),
    query = useQuery({
      queryKey: ["customer-request-internal", id],
      queryFn: () => internalRequestApi.detail(id),
      enabled: !!id,
    }),
    [next, setNext] = useState<RequestStatus | "">(""),
    [customerNote, setCustomerNote] = useState(""),
    [reason, setReason] = useState("")
  const change = useMutation({
    mutationFn: () =>
      internalRequestApi.status(
        id,
        next as RequestStatus,
        customerNote,
        reason
      ),
    onSuccess: () => {
      toast.success("وضعیت به‌روزرسانی شد.")
      void client.invalidateQueries({
        queryKey: ["customer-request-internal", id],
      })
    },
  })
  if (!query.data) return <p>در حال دریافت درخواست...</p>
  const r = query.data
  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold">{r.title}</h1>
          <p className="text-sm text-muted-foreground">
            {r.company?.brandName || r.company?.legalName} ·{" "}
            <span dir="ltr">{r.trackingNumber}</span>
          </p>
        </div>
        <Badge>{requestStatusFa[r.status]}</Badge>
      </div>
      <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader>
            <CardTitle>پاسخ‌های ثبت‌شده</CardTitle>
          </CardHeader>
          <CardContent>
            {r.formVersion && (
              <DynamicRequestForm
                schema={r.formVersion.schema}
                value={r.answers ?? {}}
                onChange={() => {}}
                disabled
              />
            )}
          </CardContent>
        </Card>
        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle>تغییر وضعیت</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <select
                className="h-10 w-full rounded-md border bg-background px-3"
                value={next}
                onChange={(e) => setNext(e.target.value as RequestStatus)}
              >
                <option value="">انتخاب وضعیت مجاز</option>
                {r.allowedTransitions?.map((s) => (
                  <option key={s} value={s}>
                    {requestStatusFa[s]}
                  </option>
                ))}
              </select>
              <textarea
                className="min-h-20 w-full rounded-md border bg-background p-3 text-sm"
                placeholder="توضیح قابل مشاهده برای مشتری"
                value={customerNote}
                onChange={(e) => setCustomerNote(e.target.value)}
              />
              <textarea
                className="min-h-20 w-full rounded-md border bg-background p-3 text-sm"
                placeholder="دلیل داخلی (برای مشتری نمایش داده نمی‌شود)"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
              <Button
                disabled={!next || change.isPending}
                onClick={() => change.mutate()}
              >
                ثبت وضعیت
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>تاریخچه</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {r.histories?.map((h) => (
                <div key={h.id} className="border-s ps-3 text-sm">
                  <strong>{requestStatusFa[h.newStatus]}</strong>
                  <p className="text-muted-foreground">
                    {h.customerVisibleExplanation ||
                      h.internalReason ||
                      "بدون توضیح"}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
