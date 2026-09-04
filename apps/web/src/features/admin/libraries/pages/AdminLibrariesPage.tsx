import { EntityRowActions } from "@/components/shared/EntityRowActions"
import { EntityTableCell } from "@/components/shared/EntityTableCell"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { EntityListPage } from "@/components/shared/EntityListPage"
import { EmptyState } from "@/components/shared/EmptyState"
import { useSaveProduct, useToggleProduct } from "../hooks/useLibraries"
import { DataTableToolbar } from "@/components/shared/DataTableToolbar"
import { useDebouncedValue } from "@/lib/useDebouncedValue"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { applyServerFieldErrors } from "@/lib/formErrors"
import { FormActions } from "@/components/shared/FormActions"
import { useLibraryItems, useProducts } from "../hooks/useLibraries"
import { useListQueryState, enumParam } from "@/lib/listQuery"
import { QueryContent } from "@/components/shared/QueryContent"
import { useState } from "react"
import { canViewFinancials } from "@/lib/permissions"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import {
  BookOpen,
  Boxes,
  BriefcaseBusiness,
  Building2,
  CircleCheckBig,
  CircleOff,
  GraduationCap,
  HeartPulse,
  ShoppingBag,
  LibraryBig,
  Package,
  Pencil,
  Plus,
  Settings2,
  Sparkles,
  Tag,
  Trash2,
  UserRound,
} from "lucide-react"
import { useAuthStore } from "@/store/authStore"
import { uiText } from "@/config/uiText"
import { getApiErrorMessage } from "@/lib/apiResponse"
import { PageHero } from "@/components/shared/PageHero"
import { MetricCard } from "@/components/shared/MetricCard"
import {
  DataTableShell,
  type DataTableColumn,
} from "@/components/shared/DataTableShell"
import { PaginationControls } from "@/components/shared/PaginationControls"
import { ResponsiveModal } from "@/components/shared/ResponsiveModal"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import {
  lookupGroups,
  removeLibraryItem,
  saveLibraryItem,
  type LibraryItem,
  type LibraryKind,
  type LibraryPayload,
  type LookupGroup,
  type Product,
  type ProductPayload,
  type ProductType,
} from "../api/adminLibrariesApi"

type Section = {
  id: string
  kind: LibraryKind | "products"
  group?: LookupGroup
  label: string
  description: string
  icon: typeof BookOpen
  view: string
  manage: string
}
const sections: Section[] = [
  {
    id: "industries",
    kind: "industries",
    label: "صنایع",
    description: "طبقه‌بندی شرکت‌ها و بازارها",
    icon: Building2,
    view: "library:industry:view",
    manage: "library:industry:manage",
  },
  {
    id: "leadSources",
    kind: "leadSources",
    label: "منابع جذب",
    description: "کانال‌های ورود سرنخ و شرکت",
    icon: Sparkles,
    view: "library:lead-source:view",
    manage: "library:lead-source:manage",
  },
  {
    id: "painPoints",
    kind: "painPoints",
    label: "نقاط درد",
    description: "مسائل و نیازهای مشتریان",
    icon: HeartPulse,
    view: "library:pain-point:view",
    manage: "library:pain-point:manage",
  },
  {
    id: "useCases",
    kind: "useCases",
    label: "کاربردها",
    description: "سناریوهای کاربرد محصول",
    icon: BriefcaseBusiness,
    view: "library:use-case:view",
    manage: "library:use-case:manage",
  },
  {
    id: "personas",
    kind: "personas",
    label: "پرسوناها",
    description: "الگوهای نقش و پیشنهاد فروش",
    icon: UserRound,
    view: "library:persona:view",
    manage: "library:persona:manage",
  },
  ...lookupGroups.map(([group, label]) => ({
    id: `lookup:${group}`,
    kind: "lookupOptions" as const,
    group,
    label: group === "teams" ? "گزینه‌های تیم" : label,
    description:
      group === "teams"
        ? "گزینه‌های تیم در فرم‌های پایه"
        : `مدیریت گزینه‌های ${label}`,
    icon: Settings2,
    view: "lookup:view",
    manage: "lookup:manage",
  })),
  {
    id: "universities",
    kind: "universities",
    label: "دانشگاه‌ها",
    description: "مراجع سوابق تحصیلی افراد",
    icon: GraduationCap,
    view: "library:university:view",
    manage: "library:university:manage",
  },
  {
    id: "products",
    kind: "products",
    label: "محصولات",
    description: "کاتالوگ، قیمت و کانال فروش",
    icon: Package,
    view: "product:view",
    manage: "product:manage",
  },
]
const inputClass = "h-11 rounded-xl"
const selectClass =
  "h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none"
const fa = (n: number) => new Intl.NumberFormat("fa-IR").format(n)
const money = (value: string | number | null | undefined) =>
  value == null
    ? uiText.common.notAvailable
    : `${new Intl.NumberFormat("fa-IR").format(Number(value || 0))} ریال`
const safeExternalUrl = (value?: string | null) => {
  if (!value) return undefined
  try {
    const url = new URL(value)
    return url.protocol === "https:" || url.protocol === "http:"
      ? url.toString()
      : undefined
  } catch {
    return undefined
  }
}

function LibraryForm({
  section,
  group,
  item,
  onClose,
}: {
  section: Section
  group?: LookupGroup
  item?: LibraryItem
  onClose: () => void
}) {
  const client = useQueryClient()
  const kind = section.kind as LibraryKind
  const [form, setForm] = useState<LibraryPayload>({
    primary: item?.label ?? "",
    code: item?.code ?? "",
    description: item?.description ?? "",
    category: item?.category ?? "",
    sortOrder: item?.sortOrder ?? 0,
    isActive: item?.isActive ?? true,
    defaultPainPoint: item?.defaultPainPoint ?? "",
    defaultUseCase: item?.defaultUseCase ?? "",
  })
  const coded = kind === "leadSources" || kind === "lookupOptions"
  const categorized = kind === "painPoints" || kind === "useCases"
  const persona = kind === "personas"
  const university = kind === "universities"
  const mutation = useMutation({
    mutationFn: () =>
      saveLibraryItem(
        kind,
        { ...form, primary: form.primary.trim(), code: form.code?.trim() },
        group,
        item?.id
      ),
    onSuccess: async () => {
      toast.success(item ? "آیتم ویرایش شد." : "آیتم جدید اضافه شد.")
      await client.invalidateQueries({ queryKey: ["admin-library"] })
      if (group === "activity-types")
        await client.invalidateQueries({ queryKey: ["activities"] })
      onClose()
    },
    onError: (error) =>
      toast.error(getApiErrorMessage(error, "ذخیره آیتم انجام نشد.")),
  })
  const label = university
    ? "نام دانشگاه"
    : persona
      ? "الگوی عنوان شغلی"
      : kind === "lookupOptions"
        ? "عنوان نمایشی"
        : "عنوان"
  return (
    <ResponsiveModal
      open
      onClose={onClose}
      title={item ? `ویرایش ${section.label}` : `افزودن به ${section.label}`}
      description="اطلاعات این بخش در فرم‌های مختلف CRM استفاده می‌شود."
      icon={section.icon}
    >
      <form
        className="grid gap-4"
        onSubmit={(e) => {
          e.preventDefault()
          mutation.mutate()
        }}
      >
        <label className="grid gap-2 text-sm font-bold">
          {label}
          <Input
            autoFocus
            className={inputClass}
            value={form.primary}
            onChange={(e) => setForm({ ...form, primary: e.target.value })}
          />
        </label>
        {coded || university ? (
          <label className="grid gap-2 text-sm font-bold">
            کد {coded ? "*" : ""}
            <Input
              className={inputClass}
              dir="ltr"
              value={form.code}
              disabled={group === "activity-types" && Boolean(item)}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
            />
          </label>
        ) : null}
        {categorized ? (
          <label className="grid gap-2 text-sm font-bold">
            دسته‌بندی
            <Input
              className={inputClass}
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            />
          </label>
        ) : null}
        {persona ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-bold">
              نقطه درد پیش‌فرض
              <Input
                className={inputClass}
                value={form.defaultPainPoint}
                onChange={(e) =>
                  setForm({ ...form, defaultPainPoint: e.target.value })
                }
              />
            </label>
            <label className="grid gap-2 text-sm font-bold">
              کاربرد پیش‌فرض
              <Input
                className={inputClass}
                value={form.defaultUseCase}
                onChange={(e) =>
                  setForm({ ...form, defaultUseCase: e.target.value })
                }
              />
            </label>
          </div>
        ) : null}
        <label className="grid gap-2 text-sm font-bold">
          {persona ? "یادداشت" : "توضیحات"}
          <textarea
            className="min-h-28 rounded-xl border border-input bg-background p-3 text-sm"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </label>
        {coded ? (
          <label className="grid gap-2 text-sm font-bold">
            ترتیب نمایش
            <Input
              type="number"
              className={inputClass}
              value={form.sortOrder}
              onChange={(e) =>
                setForm({ ...form, sortOrder: Number(e.target.value) })
              }
            />
          </label>
        ) : null}
        {coded || university ? (
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="size-4 accent-[var(--app-primary)]"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
            />
            آیتم فعال باشد
          </label>
        ) : null}
        <div className="flex justify-end gap-2 border-t border-[var(--app-divider)] pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            انصراف
          </Button>
          <Button
            type="submit"
            disabled={
              mutation.isPending ||
              !form.primary.trim() ||
              (coded && !form.code?.trim())
            }
          >
            {mutation.isPending ? "در حال ذخیره..." : "ذخیره"}
          </Button>
        </div>
      </form>
    </ResponsiveModal>
  )
}

type ProductFormValues = Omit<ProductPayload, "type"> & {
  type: ProductType | ""
}
const productFormSchema = z.object({
  type: z
    .enum(["", "HARDWARE", "SOFTWARE"])
    .refine(Boolean, uiText.products.chooseType),
  code: z.string().trim().min(1, uiText.common.forms.required),
  name: z.string().trim().min(1, uiText.common.forms.required),
  digikalaCode: z.string().nullable().optional(),
  digikalaUrl: z
    .string()
    .refine(
      (value) => !value || Boolean(safeExternalUrl(value)),
      uiText.common.invalidWebUrl
    )
    .nullable()
    .optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  unit: z.string().optional(),
  pricingCurrency: z.enum(["IRR", "USD"]),
  inPersonInputPrice: z.string(),
  digikalaInputPrice: z.string(),
  inPersonProfitPercent: z.string().optional(),
  digikalaProfitPercent: z.string().optional(),
  isActive: z.boolean(),
  sortOrder: z.number(),
})
function ProductForm({
  item,
  onClose,
}: {
  item?: Product
  onClose: () => void
}) {
  const {
    control,
    register,
    setValue,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      type: item?.type ?? "",
      code: item?.code ?? "",
      digikalaCode: item?.digikalaCode ?? "",
      digikalaUrl: item?.digikalaUrl ?? "",
      name: item?.name ?? "",
      description: item?.description ?? "",
      category: item?.category ?? "",
      unit: item?.unit ?? "",
      pricingCurrency: item?.pricingCurrency ?? "IRR",
      inPersonInputPrice: String(item?.inPersonInputPrice ?? ""),
      digikalaInputPrice: String(item?.digikalaInputPrice ?? ""),
      inPersonProfitPercent: String(item?.inPersonProfitPercent ?? ""),
      digikalaProfitPercent: String(item?.digikalaProfitPercent ?? ""),
      isActive: item?.isActive ?? true,
      sortOrder: item?.sortOrder ?? 0,
    },
  })
  const form = useWatch({ control }) as ProductFormValues
  const setForm = (values: ProductFormValues) =>
    Object.entries(values).forEach(([key, value]) =>
      setValue(key as keyof ProductFormValues, value, { shouldDirty: true })
    )
  const mutation = useSaveProduct()
  async function submitProduct() {
    if (!form.type) return
    clearErrors()
    try {
      await mutation.mutateAsync({
        payload: {
          ...form,
          type: form.type,
          inPersonInputPrice: form.inPersonInputPrice || "0",
          digikalaInputPrice: form.digikalaInputPrice || "0",
          inPersonProfitPercent:
            form.pricingCurrency === "USD"
              ? form.inPersonProfitPercent || "0"
              : undefined,
          digikalaProfitPercent:
            form.pricingCurrency === "USD"
              ? form.digikalaProfitPercent || "0"
              : undefined,
        },
        id: item?.id,
      })
      toast.success(item ? "محصول ویرایش شد." : "محصول ایجاد شد.")
      onClose()
    } catch (error) {
      applyServerFieldErrors(
        error,
        setError,
        Object.keys(productFormSchema.shape) as (keyof ProductFormValues)[]
      )
      toast.error(getApiErrorMessage(error, "ذخیره محصول انجام نشد."))
    }
  }
  const field = (label: string, key: keyof ProductPayload, type = "text") => (
    <label className="grid gap-2 text-sm font-bold">
      {label}
      <Input
        {...register(key)}
        aria-invalid={Boolean(errors[key])}
        type={type}
        className={inputClass}
        value={String(form[key] ?? "")}
        onChange={(e) =>
          setValue(
            key,
            key === "sortOrder" ? Number(e.target.value) : e.target.value,
            { shouldDirty: true }
          )
        }
      />
      {errors[key]?.message ? (
        <span role="alert" className="text-xs text-destructive">
          {errors[key].message}
        </span>
      ) : null}
    </label>
  )
  return (
    <ResponsiveModal
      open
      onClose={onClose}
      title={item ? "ویرایش محصول" : "افزودن محصول"}
      description="قیمت ورودی و حاشیه سود هر کانال، قیمت نهایی ریالی را تعیین می‌کند."
      icon={Package}
      width="max-w-3xl"
    >
      <form
        className="grid gap-4"
        noValidate
        onSubmit={handleSubmit(submitProduct)}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {field("نام محصول", "name")}
          {field("کد محصول", "code")}
          <label className="grid gap-2 text-sm font-bold">
            {uiText.products.type} *
            <select
              required
              className={selectClass}
              value={form.type}
              onChange={(e) =>
                setForm({ ...form, type: e.target.value as ProductType })
              }
            >
              <option value="" disabled>
                {uiText.products.chooseType}
              </option>
              {Object.entries(uiText.products.types).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          {field("کد دیجی‌کالا", "digikalaCode")}
          {field("صفحه دیجی‌کالا", "digikalaUrl", "url")}
          {field("دسته‌بندی", "category")}
          {field("واحد", "unit")}
        </div>
        <label className="grid gap-2 text-sm font-bold">
          توضیحات
          <textarea
            className="min-h-24 rounded-xl border border-input bg-background p-3 text-sm"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-bold">
            ارز قیمت‌گذاری
            <select
              className={selectClass}
              value={form.pricingCurrency}
              onChange={(e) =>
                setForm({
                  ...form,
                  pricingCurrency: e.target.value as "IRR" | "USD",
                })
              }
            >
              <option value="IRR">ریال</option>
              <option value="USD">دلار</option>
            </select>
          </label>
          {field("ترتیب نمایش", "sortOrder", "number")}
          {field("قیمت ورودی حضوری", "inPersonInputPrice", "number")}
          {form.pricingCurrency === "USD" &&
            field("درصد سود حضوری", "inPersonProfitPercent", "number")}
          {field("قیمت ورودی دیجی‌کالا", "digikalaInputPrice", "number")}
          {form.pricingCurrency === "USD" &&
            field("درصد سود دیجی‌کالا", "digikalaProfitPercent", "number")}
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
          />
          محصول فعال باشد
        </label>
        {errors.type?.message ? (
          <p role="alert" className="text-sm text-destructive">
            {errors.type.message}
          </p>
        ) : null}
        {errors.root?.server?.message ? (
          <p role="alert" className="text-sm text-destructive">
            {errors.root.server.message}
          </p>
        ) : null}
        <FormActions onCancel={onClose} pending={mutation.isPending} />
      </form>
    </ResponsiveModal>
  )
}

export function AdminLibrariesPage() {
  const permissions = useAuthStore((s) => s.user?.permissions ?? [])
  const financialVisible = canViewFinancials(permissions)
  const available = sections.filter(
    (s) => permissions.includes(s.view) || permissions.includes(s.manage)
  )
  const { params, page, pageSize, patch, setPage, setPageSize } =
    useListQueryState()
  const activeId = params.get("section") || available[0]?.id || "industries"
  const section = available.find((s) => s.id === activeId) ?? available[0]
  const search = params.get("search") || ""
  const status = enumParam(
    params.get("status"),
    ["ALL", "ACTIVE", "INACTIVE"],
    "ALL"
  )
  const productType = enumParam(
    params.get("type"),
    ["ALL", "HARDWARE", "SOFTWARE"],
    "ALL"
  )
  const setSearch = (search: string) => patch({ search }, { replace: true })
  const setStatus = (status: string) => patch({ status })
  const setProductType = (type: ProductType | "ALL") => patch({ type })
  const [editing, setEditing] = useState<LibraryItem | null | undefined>()
  const [productEditing, setProductEditing] = useState<
    Product | null | undefined
  >()
  const client = useQueryClient()
  const canManage = Boolean(section && permissions.includes(section.manage))
  const canManageCurrent =
    canManage && (section?.kind !== "products" || financialVisible)
  const kind = section?.kind !== "products" ? section?.kind : undefined
  const group = section?.group
  const items = useLibraryItems(kind, group)
  const productParams = {
    type: productType === "ALL" ? undefined : productType,
    page,
    limit: pageSize,
    search: search.trim() || undefined,
    active: status === "ALL" ? undefined : String(status === "ACTIVE"),
  }
  const debouncedSearch = useDebouncedValue(search, 300)
  const products = useProducts(
    { ...productParams, search: debouncedSearch.trim() || undefined },
    section?.kind === "products" && search === debouncedSearch
  )
  const filtered = (items.data ?? []).filter(
    (i) =>
      `${i.label} ${i.code ?? ""} ${i.category ?? ""} ${i.description ?? ""}`
        .toLocaleLowerCase("fa")
        .includes(search.trim().toLocaleLowerCase("fa")) &&
      (status === "ALL" || i.isActive === (status === "ACTIVE"))
  )
  const remove = useMutation({
    mutationFn: (item: LibraryItem) =>
      removeLibraryItem(kind as LibraryKind, item.id, group),
    onSuccess: async () => {
      toast.success("آیتم غیرفعال یا حذف شد.")
      await client.invalidateQueries({ queryKey: ["admin-library"] })
      if (group === "activity-types")
        await client.invalidateQueries({ queryKey: ["activities"] })
    },
    onError: (e) => toast.error(getApiErrorMessage(e, "حذف آیتم انجام نشد.")),
  })
  const productToggle = useToggleProduct()

  const cols: DataTableColumn<LibraryItem>[] = [
    {
      id: "title",
      header: "عنوان",
      cell: (r) => (
        <div>
          <div className="font-bold">{r.label}</div>
          <div className="mt-1 line-clamp-1 max-w-xl text-xs text-muted-foreground">
            {r.description || "بدون توضیحات"}
          </div>
        </div>
      ),
    },
    ...(kind === "leadSources" ||
    kind === "lookupOptions" ||
    kind === "universities"
      ? [
          {
            id: "code",
            header: "کد",
            cell: (r: LibraryItem) => <code dir="ltr">{r.code || "—"}</code>,
          },
        ]
      : []),
    ...(kind === "painPoints" || kind === "useCases"
      ? [
          {
            id: "category",
            header: "دسته‌بندی",
            cell: (r: LibraryItem) => (
              <Badge variant="outline">{r.category || "بدون دسته"}</Badge>
            ),
          },
        ]
      : []),
    {
      id: "status",
      header: "وضعیت",
      cell: (r) => (
        <StatusBadge tone={r.isActive ? "success" : "neutral"}>
          {r.isActive ? uiText.common.active : uiText.common.inactive}
        </StatusBadge>
      ),
    },
    {
      id: "actions",
      header: "عملیات",
      cell: (r) => (
        <EntityRowActions
          actions={[
            {
              id: "edit",
              label: "ویرایش آیتم",
              icon: Pencil,
              onClick: () => setEditing(r),
              enabled: canManage,
            },
            {
              id: "delete",
              label: "حذف آیتم",
              icon: Trash2,
              onClick: () => remove.mutateAsync(r),
              enabled: canManage,
              disabled: remove.isPending,
              tone: "danger",
              confirmation: {
                title: "حذف آیتم",
                description: `آیا از حذف «${r.label}» مطمئن هستید؟`,
              },
            },
          ]}
        />
      ),
    },
  ]
  const productCols: DataTableColumn<Product>[] = [
    {
      id: "type",
      header: uiText.products.type,
      cell: (r) => (
        <StatusBadge tone="primary" dot={false}>
          {uiText.products.types[r.type] ?? "—"}
        </StatusBadge>
      ),
    },
    {
      id: "name",
      header: "محصول",
      cell: (r) => (
        <EntityTableCell
          title={r.name}
          subtitle={r.code}
          subtitleDir="ltr"
          avatar={<Package className="size-5" />}
        />
      ),
    },
    { id: "category", header: "دسته‌بندی", cell: (r) => r.category || "—" },
    {
      id: "digikalaCode",
      header: "کد دیجی‌کالا",
      cell: (r) => (
        <code className="whitespace-nowrap" dir="ltr">
          {r.digikalaCode || "—"}
        </code>
      ),
    },
    ...(financialVisible ? [{
      id: "in",
      header: "قیمت حضوری",
      cell: (r) => (
        <span className="whitespace-nowrap">{money(r.inPersonPriceIrr)}</span>
      ),
    } satisfies DataTableColumn<Product>,
    {
      id: "digi",
      header: "قیمت دیجی‌کالا",
      cell: (r) => (
        <span className="whitespace-nowrap">{money(r.digikalaPriceIrr)}</span>
      ),
    } satisfies DataTableColumn<Product>] : []),
    {
      id: "status",
      header: "وضعیت",
      cell: (r) => (
        <StatusBadge tone={r.isActive ? "success" : "neutral"}>
          {r.isActive ? uiText.common.active : uiText.common.inactive}
        </StatusBadge>
      ),
    },
    {
      id: "actions",
      header: "عملیات",
      cell: (r) => (
        <EntityRowActions
          actions={[
            {
              id: "edit",
              label: "ویرایش محصول",
              icon: Pencil,
              onClick: () => setProductEditing(r),
              enabled: canManageCurrent,
            },
            {
              id: "digikala",
              label: "مشاهده صفحه محصول در دیجی‌کالا",
              icon: ShoppingBag,
              onClick: () => {
                const url = safeExternalUrl(r.digikalaUrl)
                if (url) window.open(url, "_blank", "noopener,noreferrer")
              },
              enabled: Boolean(safeExternalUrl(r.digikalaUrl)),
            },
            {
              id: "toggle",
              label: r.isActive ? "غیرفعال‌کردن محصول" : "فعال‌کردن محصول",
              icon: r.isActive ? CircleOff : CircleCheckBig,
              enabled: canManage,
              disabled: productToggle.isPending,
              tone: r.isActive ? "danger" : "default",
              confirmation: r.isActive
                ? {
                    title: "غیرفعال‌کردن محصول",
                    description: `آیا از غیرفعال‌کردن «${r.name}» مطمئن هستید؟`,
                  }
                : undefined,
              onClick: async () => {
                await productToggle.mutateAsync(r)
                toast.success("وضعیت محصول به‌روزرسانی شد.")
              },
            },
          ]}
        />
      ),
    },
  ]
  const SectionIcon = section.icon
  return (
    <EntityListPage>
      <PageHero
        title="مرکز کتابخانه‌ها"
        eyebrow="داده‌های پایه CRM"
        icon={LibraryBig}
        description="داده‌های مرجع فرم‌ها، فرایند فروش و کاتالوگ محصولات را از یک فضای منظم مدیریت کنید."
        actions={
          canManageCurrent ? (
              <Button
                onClick={() =>
                  section.kind === "products"
                    ? setProductEditing(null)
                    : setEditing(null)
                }
              >
                <Plus className="size-4" />
                افزودن {section.label}
              </Button>
          ) : null
        }
        onRefresh={() => Promise.all([items.refetch(), products.refetch()])}
        refreshing={items.isFetching || products.isFetching}
      />
      <section className="grid gap-3 sm:grid-cols-3">
        <MetricCard
          label="بخش‌های در دسترس"
          value={fa(available.length)}
          helper="براساس سطح دسترسی شما"
          icon={Boxes}
        />
        <MetricCard
          label={`آیتم‌های ${section.label}`}
          value={fa(
            section.kind === "products"
              ? (products.data?.meta.total ?? 0)
              : (items.data?.length ?? 0)
          )}
          helper="فعال و غیرفعال"
          icon={section.icon}
          tone="info"
        />
        <MetricCard
          label="آیتم‌های فعال"
          value={fa(
            section.kind === "products"
              ? (products.data?.data.filter((i) => i.isActive).length ?? 0)
              : (items.data?.filter((i) => i.isActive).length ?? 0)
          )}
          helper={
            section.kind === "products" ? "در صفحه جاری" : "در این کتابخانه"
          }
          icon={Tag}
          tone="success"
        />
      </section>
      <div className="grid min-w-0 gap-4 xl:h-[680px] xl:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="max-h-[360px] overflow-y-auto overscroll-contain rounded-[var(--app-radius-card)] border border-[var(--app-divider)] bg-[var(--app-surface)] p-3 shadow-[var(--app-shadow-card)] xl:max-h-none xl:min-h-0">
          <div className="mb-2 px-2 text-xs font-bold text-muted-foreground">
            انتخاب کتابخانه
          </div>
          <div className="grid gap-1 sm:grid-cols-2 xl:grid-cols-1">
            {available.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  patch({
                    section: s.id,
                    search: undefined,
                    status: undefined,
                    type: undefined,
                  })
                }}
                className={`flex items-center gap-3 rounded-2xl p-3 text-start transition ${s.id === section.id ? "bg-[var(--app-primary-soft)] text-[var(--app-primary)]" : "hover:bg-[var(--app-background)]"}`}
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[var(--app-surface)] shadow-sm">
                  <s.icon className="size-5" />
                </span>
                <span>
                  <b className="block text-sm">{s.label}</b>
                  <small className="line-clamp-1 text-muted-foreground">
                    {s.description}
                  </small>
                </span>
              </button>
            ))}
          </div>
        </aside>
        <main className="grid min-w-0 content-start gap-4 xl:min-h-0 xl:overflow-y-auto xl:overscroll-contain xl:pe-1">
          <section className="grid gap-3">
            <div className="mb-4">
              <h2 className="text-xl font-black">{section.label}</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                {section.description}
              </p>
            </div>
            <DataTableToolbar
              searchValue={search}
              onSearchChange={setSearch}
              searchPlaceholder={`جست‌وجو در ${section.label}...`}
              hasActiveFilters={Boolean(
                search || status !== "ALL" || productType !== "ALL"
              )}
              onClearFilters={() =>
                patch({ search: undefined, status: undefined, type: undefined })
              }
              filters={
                <>
                  {section.kind === "products" && (
                    <select
                      aria-label={uiText.products.type}
                      className={selectClass}
                      value={productType}
                      onChange={(e) => {
                        setProductType(e.target.value as ProductType | "ALL")
                      }}
                    >
                      <option value="ALL">{uiText.products.allTypes}</option>
                      {Object.entries(uiText.products.types).map(
                        ([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        )
                      )}
                    </select>
                  )}

                  <select
                    aria-label={uiText.common.filters.status}
                    className={selectClass}
                    value={status}
                    onChange={(e) => {
                      setStatus(e.target.value)
                    }}
                  >
                    <option value="ALL">
                      {uiText.common.filters.allStatuses}
                    </option>
                    <option value="ACTIVE">فعال</option>
                    <option value="INACTIVE">غیرفعال</option>
                  </select>
                </>
              }
            />
          </section>
          {section.kind === "products" ? (
            <QueryContent query={products}>
              <DataTableShell
                rows={products.data?.data ?? []}
                columns={productCols}
                getRowKey={(r) => r.id}
                onRowClick={(r) => canManageCurrent && setProductEditing(r)}
                emptyState={<Empty />}
                mobile={{
                  title: (r) => r.name,
                  subtitle: (r) => r.code,
                  avatar: () => <Package className="size-5" />,
                  status: (r) => (
                    <StatusBadge tone={r.isActive ? "success" : "neutral"}>
                      {r.isActive
                        ? uiText.common.active
                        : uiText.common.inactive}
                    </StatusBadge>
                  ),
                  fields: [
                    {
                      id: "type",
                      label: uiText.products.type,
                      render: (r) => uiText.products.types[r.type] ?? "—",
                    },
                    {
                      id: "category",
                      label: "دسته‌بندی",
                      render: (r) => r.category || "—",
                    },
                    ...(financialVisible ? [{
                      id: "in",
                      label: "قیمت حضوری",
                      render: (r: Product) => money(r.inPersonPriceIrr),
                    },
                    {
                      id: "digi",
                      label: "قیمت دیجی‌کالا",
                      render: (r: Product) => money(r.digikalaPriceIrr),
                    }] : []),
                  ],
                }}
              />
              <PaginationControls
                page={page}
                pageCount={products.data?.meta.totalPages ?? 1}
                onPageChange={setPage}
                pageSize={pageSize}
                onPageSizeChange={setPageSize}
                total={products.data?.meta.total}
                disabled={products.isFetching}
              />
            </QueryContent>
          ) : (
            <QueryContent query={items}>
              <DataTableShell
                rows={filtered}
                columns={cols}
                getRowKey={(r) => r.id}
                onRowClick={(r) => canManage && setEditing(r)}
                emptyState={<Empty />}
                mobile={{
                  title: (r) => r.label,
                  subtitle: (r) => r.code || r.description || "—",
                  avatar: () => <SectionIcon className="size-5" />,
                  status: (r) => (
                    <StatusBadge tone={r.isActive ? "success" : "neutral"}>
                      {r.isActive
                        ? uiText.common.active
                        : uiText.common.inactive}
                    </StatusBadge>
                  ),
                  fields: [
                    {
                      id: "category",
                      label: "دسته‌بندی",
                      render: (r) => r.category || "—",
                    },
                    {
                      id: "description",
                      label: "توضیحات",
                      render: (r) => r.description || "—",
                    },
                  ],
                }}
              />
            </QueryContent>
          )}
        </main>
      </div>
      {editing !== undefined ? (
        <LibraryForm
          key={editing?.id ?? `new-${kind}-${group}`}
          section={section}
          group={group}
          item={editing ?? undefined}
          onClose={() => setEditing(undefined)}
        />
      ) : null}
      {financialVisible && productEditing !== undefined ? (
        <ProductForm
          key={productEditing?.id ?? "new-product"}
          item={productEditing ?? undefined}
          onClose={() => setProductEditing(undefined)}
        />
      ) : null}
    </EntityListPage>
  )
}
function Empty() {
  return (
    <EmptyState
      icon={BookOpen}
      title={uiText.common.table.noResults}
      description={uiText.common.table.noResultsDescription}
    />
  )
}
