import { useMemo, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
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
  LibraryBig,
  Package,
  Pencil,
  Plus,
  RefreshCcw,
  Search,
  Settings2,
  Sparkles,
  Tag,
  Trash2,
  UserRound,
} from "lucide-react"
import { useAuthStore } from "@/store/authStore"
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
  getLibraryItems,
  lookupGroups,
  removeLibraryItem,
  saveLibraryItem,
  getProducts,
  saveProduct,
  toggleProduct,
  type LibraryItem,
  type LibraryKind,
  type LibraryPayload,
  type LookupGroup,
  type Product,
  type ProductPayload,
} from "../api/adminLibrariesApi"

type Section = {
  id: LibraryKind | "products"
  label: string
  description: string
  icon: typeof BookOpen
  view: string
  manage: string
}
const sections: Section[] = [
  {
    id: "industries",
    label: "صنایع",
    description: "طبقه‌بندی شرکت‌ها و بازارها",
    icon: Building2,
    view: "library:industry:view",
    manage: "library:industry:manage",
  },
  {
    id: "leadSources",
    label: "منابع جذب",
    description: "کانال‌های ورود سرنخ و شرکت",
    icon: Sparkles,
    view: "library:lead-source:view",
    manage: "library:lead-source:manage",
  },
  {
    id: "painPoints",
    label: "نقاط درد",
    description: "مسائل و نیازهای مشتریان",
    icon: HeartPulse,
    view: "library:pain-point:view",
    manage: "library:pain-point:manage",
  },
  {
    id: "useCases",
    label: "کاربردها",
    description: "سناریوهای کاربرد محصول",
    icon: BriefcaseBusiness,
    view: "library:use-case:view",
    manage: "library:use-case:manage",
  },
  {
    id: "personas",
    label: "پرسوناها",
    description: "الگوهای نقش و پیشنهاد فروش",
    icon: UserRound,
    view: "library:persona:view",
    manage: "library:persona:manage",
  },
  {
    id: "lookupOptions",
    label: "گزینه‌های پایه",
    description: "گزینه‌های مشترک فرم‌ها",
    icon: Settings2,
    view: "lookup:view",
    manage: "lookup:manage",
  },
  {
    id: "universities",
    label: "دانشگاه‌ها",
    description: "مراجع سوابق تحصیلی افراد",
    icon: GraduationCap,
    view: "library:university:view",
    manage: "library:university:manage",
  },
  {
    id: "products",
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
const money = (value: string | number) =>
  `${new Intl.NumberFormat("fa-IR").format(Number(value || 0))} ریال`

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
  const kind = section.id as LibraryKind
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

function ProductForm({
  item,
  onClose,
}: {
  item?: Product
  onClose: () => void
}) {
  const client = useQueryClient()
  const [form, setForm] = useState<ProductPayload>({
    code: item?.code ?? "",
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
  })
  const mutation = useMutation({
    mutationFn: () => saveProduct(form, item?.id),
    onSuccess: async () => {
      toast.success(item ? "محصول ویرایش شد." : "محصول ایجاد شد.")
      await client.invalidateQueries({ queryKey: ["admin-products"] })
      onClose()
    },
    onError: (e) =>
      toast.error(getApiErrorMessage(e, "ذخیره محصول انجام نشد.")),
  })
  const field = (label: string, key: keyof ProductPayload, type = "text") => (
    <label className="grid gap-2 text-sm font-bold">
      {label}
      <Input
        type={type}
        className={inputClass}
        value={String(form[key] ?? "")}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
      />
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
        onSubmit={(e) => {
          e.preventDefault()
          mutation.mutate()
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {field("نام محصول", "name")}
          {field("کد محصول", "code")} {field("دسته‌بندی", "category")}
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
          {field("درصد سود حضوری", "inPersonProfitPercent", "number")}
          {field("قیمت ورودی دیجی‌کالا", "digikalaInputPrice", "number")}
          {field("درصد سود دیجی‌کالا", "digikalaProfitPercent", "number")}
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
          />
          محصول فعال باشد
        </label>
        <div className="flex justify-end gap-2 border-t pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            انصراف
          </Button>
          <Button
            type="submit"
            disabled={
              mutation.isPending || !form.name.trim() || !form.code.trim()
            }
          >
            ذخیره
          </Button>
        </div>
      </form>
    </ResponsiveModal>
  )
}

export function AdminLibrariesPage() {
  const permissions = useAuthStore((s) => s.user?.permissions ?? [])
  const available = sections.filter(
    (s) => permissions.includes(s.view) || permissions.includes(s.manage)
  )
  const [activeId, setActiveId] = useState<Section["id"]>(
    available[0]?.id ?? "industries"
  )
  const section = available.find((s) => s.id === activeId) ?? available[0]
  const [group, setGroup] = useState<LookupGroup>("departments")
  const [search, setSearch] = useState("")
  const [editing, setEditing] = useState<LibraryItem | null | undefined>()
  const [productEditing, setProductEditing] = useState<
    Product | null | undefined
  >()
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState("ALL")
  const client = useQueryClient()
  const canManage = Boolean(section && permissions.includes(section.manage))
  const kind = section?.id !== "products" ? section?.id : undefined
  const items = useQuery({
    queryKey: ["admin-library", kind, group],
    queryFn: () =>
      getLibraryItems(
        kind as LibraryKind,
        kind === "lookupOptions" ? group : undefined
      ),
    enabled: Boolean(kind),
  })
  const productParams = {
    page,
    limit: 20,
    search: search.trim() || undefined,
    active: status === "ALL" ? undefined : String(status === "ACTIVE"),
  }
  const products = useQuery({
    queryKey: ["admin-products", productParams],
    queryFn: () => getProducts(productParams),
    enabled: section?.id === "products",
  })
  const filtered = useMemo(
    () =>
      (items.data ?? []).filter(
        (i) =>
          `${i.label} ${i.code ?? ""} ${i.category ?? ""} ${i.description ?? ""}`
            .toLocaleLowerCase("fa")
            .includes(search.trim().toLocaleLowerCase("fa")) &&
          (status === "ALL" || i.isActive === (status === "ACTIVE"))
      ),
    [items.data, search, status]
  )
  const remove = useMutation({
    mutationFn: (item: LibraryItem) =>
      removeLibraryItem(
        kind as LibraryKind,
        item.id,
        kind === "lookupOptions" ? group : undefined
      ),
    onSuccess: async () => {
      toast.success("آیتم غیرفعال یا حذف شد.")
      await client.invalidateQueries({ queryKey: ["admin-library"] })
    },
    onError: (e) => toast.error(getApiErrorMessage(e, "حذف آیتم انجام نشد.")),
  })
  const productToggle = useMutation({
    mutationFn: toggleProduct,
    onSuccess: async (_, item) => {
      toast.success(item.isActive ? "محصول غیرفعال شد." : "محصول فعال شد.")
      await client.invalidateQueries({ queryKey: ["admin-products"] })
    },
    onError: (e) =>
      toast.error(getApiErrorMessage(e, "تغییر وضعیت انجام نشد.")),
  })
  if (!section)
    return (
      <div className="rounded-2xl border p-8 text-center">
        برای مشاهده کتابخانه‌ها دسترسی لازم را ندارید.
      </div>
    )
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
        <Badge
          className={
            r.isActive
              ? "bg-emerald-100 text-emerald-700"
              : "bg-slate-100 text-slate-600"
          }
        >
          {r.isActive ? "فعال" : "غیرفعال"}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "عملیات",
      cell: (r) => (
        <div className="flex">
          <Button
            variant="ghost"
            size="icon"
            disabled={!canManage}
            onClick={(e) => {
              e.stopPropagation()
              setEditing(r)
            }}
          >
            <Pencil className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            disabled={!canManage || remove.isPending}
            className="text-red-600"
            onClick={(e) => {
              e.stopPropagation()
              if (window.confirm(`آیا از حذف «${r.label}» مطمئن هستید؟`))
                remove.mutate(r)
            }}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      ),
    },
  ]
  const productCols: DataTableColumn<Product>[] = [
    {
      id: "name",
      header: "محصول",
      cell: (r) => (
        <div>
          <b>{r.name}</b>
          <div className="font-mono text-xs text-muted-foreground" dir="ltr">
            {r.code}
          </div>
        </div>
      ),
    },
    { id: "category", header: "دسته‌بندی", cell: (r) => r.category || "—" },
    {
      id: "in",
      header: "قیمت حضوری",
      cell: (r) => (
        <span className="whitespace-nowrap">{money(r.inPersonPriceIrr)}</span>
      ),
    },
    {
      id: "digi",
      header: "قیمت دیجی‌کالا",
      cell: (r) => (
        <span className="whitespace-nowrap">{money(r.digikalaPriceIrr)}</span>
      ),
    },
    {
      id: "status",
      header: "وضعیت",
      cell: (r) => (
        <Badge
          className={
            r.isActive
              ? "bg-emerald-100 text-emerald-700"
              : "bg-slate-100 text-slate-600"
          }
        >
          {r.isActive ? "فعال" : "غیرفعال"}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "عملیات",
      cell: (r) => (
        <div className="flex">
          <Button
            variant="ghost"
            size="icon"
            disabled={!canManage}
            onClick={(e) => {
              e.stopPropagation()
              setProductEditing(r)
            }}
            aria-label="ویرایش محصول"
          >
            <Pencil className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={
              r.isActive
                ? "text-amber-600 hover:text-amber-700"
                : "text-emerald-600 hover:text-emerald-700"
            }
            disabled={!canManage || productToggle.isPending}
            onClick={(e) => {
              e.stopPropagation()
              productToggle.mutate(r)
            }}
            aria-label={r.isActive ? "غیرفعال‌کردن محصول" : "فعال‌کردن محصول"}
            title={r.isActive ? "غیرفعال‌کردن" : "فعال‌کردن"}
          >
            {r.isActive ? (
              <CircleOff className="size-4" />
            ) : (
              <CircleCheckBig className="size-4" />
            )}
          </Button>
        </div>
      ),
    },
  ]
  return (
    <div className="grid gap-5" dir="rtl">
      <PageHero
        title="مرکز کتابخانه‌ها"
        eyebrow="داده‌های پایه CRM"
        icon={LibraryBig}
        description="داده‌های مرجع فرم‌ها، فرایند فروش و کاتالوگ محصولات را از یک فضای منظم مدیریت کنید."
        actions={
          <>
            <Button
              variant="outline"
              onClick={() => {
                void items.refetch()
                void products.refetch()
              }}
            >
              <RefreshCcw className="size-4" />
              به‌روزرسانی
            </Button>
            {canManage ? (
              <Button
                onClick={() =>
                  section.id === "products"
                    ? setProductEditing(null)
                    : setEditing(null)
                }
              >
                <Plus className="size-4" />
                افزودن {section.label}
              </Button>
            ) : null}
          </>
        }
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
            section.id === "products"
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
            section.id === "products"
              ? (products.data?.data.filter((i) => i.isActive).length ?? 0)
              : (items.data?.filter((i) => i.isActive).length ?? 0)
          )}
          helper={
            section.id === "products" ? "در صفحه جاری" : "در این کتابخانه"
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
                  setActiveId(s.id)
                  setSearch("")
                  setStatus("ALL")
                  setPage(1)
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
          <section className="rounded-[var(--app-radius-card)] border border-[var(--app-divider)] bg-[var(--app-surface)] p-4">
            <div className="mb-4">
              <h2 className="text-xl font-black">{section.label}</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                {section.description}
              </p>
            </div>
            {section.id === "lookupOptions" ? (
              <div className="mb-3 flex gap-2 overflow-x-auto pb-2">
                {lookupGroups.map(([id, label]) => (
                  <Button
                    key={id}
                    className="shrink-0 rounded-xl"
                    variant={group === id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setGroup(id)}
                  >
                    {label}
                  </Button>
                ))}
              </div>
            ) : null}
            <div className="grid gap-3 md:grid-cols-[minmax(220px,1fr)_180px]">
              <div className="relative">
                <Search className="absolute end-3 top-3.5 size-4 text-muted-foreground" />
                <Input
                  className="h-11 rounded-xl pe-10"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value)
                    setPage(1)
                  }}
                  placeholder={`جست‌وجو در ${section.label}...`}
                />
              </div>
              <select
                className={selectClass}
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value)
                  setPage(1)
                }}
              >
                <option value="ALL">همه وضعیت‌ها</option>
                <option value="ACTIVE">فعال</option>
                <option value="INACTIVE">غیرفعال</option>
              </select>
            </div>
          </section>
          {section.id === "products" ? (
            <>
              <DataTableShell
                rows={products.data?.data ?? []}
                columns={productCols}
                getRowKey={(r) => r.id}
                onRowClick={(r) => canManage && setProductEditing(r)}
                emptyState={<Empty />}
              />
              <PaginationControls
                page={page}
                pageCount={products.data?.meta.totalPages ?? 1}
                onPageChange={setPage}
                disabled={products.isFetching}
              />
            </>
          ) : (
            <DataTableShell
              rows={filtered}
              columns={cols}
              getRowKey={(r) => r.id}
              onRowClick={(r) => canManage && setEditing(r)}
              emptyState={<Empty />}
            />
          )}
        </main>
      </div>
      {editing !== undefined ? (
        <LibraryForm
          key={editing?.id ?? `new-${kind}-${group}`}
          section={section}
          group={kind === "lookupOptions" ? group : undefined}
          item={editing ?? undefined}
          onClose={() => setEditing(undefined)}
        />
      ) : null}
      {productEditing !== undefined ? (
        <ProductForm
          key={productEditing?.id ?? "new-product"}
          item={productEditing ?? undefined}
          onClose={() => setProductEditing(undefined)}
        />
      ) : null}
    </div>
  )
}
function Empty() {
  return (
    <div className="rounded-2xl border border-dashed p-12 text-center">
      <BookOpen className="mx-auto mb-3 size-8 text-muted-foreground" />
      <p className="text-sm font-bold">آیتمی پیدا نشد</p>
      <p className="mt-1 text-xs text-muted-foreground">
        عبارت جست‌وجو یا فیلتر وضعیت را تغییر دهید.
      </p>
    </div>
  )
}
