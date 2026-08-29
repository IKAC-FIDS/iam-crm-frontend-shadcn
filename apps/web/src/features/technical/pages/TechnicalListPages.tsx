import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { useNavigate, useSearchParams } from "react-router-dom"
import {
  BookOpen,
  FileText,
  FolderOpen,
  Gavel,
  PackageOpen,
  Plus,
} from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { PageHero } from "@/components/shared/PageHero"
import { EntityListPage } from "@/components/shared/EntityListPage"
import { DataTableToolbar } from "@/components/shared/DataTableToolbar"
import { EmptyState } from "@/components/shared/EmptyState"
import { QueryContent } from "@/components/shared/QueryContent"
import { EntityTableCell } from "@/components/shared/EntityTableCell"
import { EntityRowActions } from "@/components/shared/EntityRowActions"
import { PersianDatePicker } from "@/components/shared/PersianDatePicker"
import { useAuthStore } from "@/store/authStore"
import { useTechnicalList } from "../hooks"
import { technicalLookups } from "../api"
import {
  TechnicalStatusBadge,
  ResponsiveTechnicalList,
} from "../components/TechnicalPrimitives"
import { TechnicalFormDialog } from "../components/TechnicalFormDialog"
import {
  confidentialityLabels,
  documentPresentation,
  faDate,
  knowledgePresentation,
  relationName,
  releasePresentation,
  resourcePresentation,
  resourceTypeLabels,
  tenderPresentation,
  tenderTypeLabels,
} from "../presentation"
import type { DataTableColumn } from "@/components/shared/DataTableShell"
import type {
  KnowledgeArticle,
  TechnicalDocument,
  TechnicalRelease,
  TechnicalResource,
  Tender,
} from "../types"

function useListState() {
  const [sp, setSp] = useSearchParams(),
    page = Math.max(Number(sp.get("page")) || 1, 1),
    limit = [10, 20, 50, 100].includes(Number(sp.get("limit")))
      ? Number(sp.get("limit"))
      : 20
  const patch = (v: Record<string, string | number | undefined>) =>
    setSp(
      (p) => {
        const n = new URLSearchParams(p)
        Object.entries(v).forEach(([k, x]) =>
          x === undefined || x === "" ? n.delete(k) : n.set(k, String(x))
        )
        if (!("page" in v)) n.set("page", "1")
        return n
      },
      { replace: true }
    )
  return { sp, page, limit, patch }
}
function usePermission(name: string) {
  return useAuthStore((s) => s.user?.permissions.includes(name) ?? false)
}
const selectClass =
  "h-11 min-w-44 rounded-xl border border-[var(--app-divider)] bg-[var(--app-background)] px-3 text-sm"
function Filters({
  search,
  status,
  statuses,
  type,
  types,
  patch,
  extra,
  hasExtra,
  clearExtra,
}: {
  search: string
  status: string
  statuses: Record<string, string>
  type?: string
  types?: Record<string, string>
  patch: (v: Record<string, string | number | undefined>) => void
  extra?: React.ReactNode
  hasExtra?: boolean
  clearExtra?: Record<string, undefined>
}) {
  return (
    <DataTableToolbar
      searchValue={search}
      onSearchChange={(v) => patch({ search: v || undefined })}
      searchPlaceholder="جست‌وجو در مرکز فنی..."
      hasActiveFilters={Boolean(search || status || type || hasExtra)}
      onClearFilters={() =>
        patch({
          search: undefined,
          status: undefined,
          type: undefined,
          ...clearExtra,
        })
      }
      filters={
        <>
          <select
            aria-label="وضعیت"
            className={selectClass}
            value={status}
            onChange={(e) => patch({ status: e.target.value || undefined })}
          >
            <option value="">همه وضعیت‌ها</option>
            {Object.entries(statuses).map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
          {types ? (
            <select
              aria-label="نوع"
              className={selectClass}
              value={type}
              onChange={(e) => patch({ type: e.target.value || undefined })}
            >
              <option value="">همه نوع‌ها</option>
              {Object.entries(types).map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
          ) : null}
          {extra}
        </>
      }
    />
  )
}
function Shell<T extends { id: string }>({
  title,
  description,
  icon: Icon,
  kind,
  viewPermission,
  managePermission,
  statuses,
  types,
  columns,
  mobile,
}: {
  title: string
  description: string
  icon: typeof PackageOpen
  kind: "releases" | "knowledge-base" | "documents" | "resources" | "tenders"
  viewPermission: string
  managePermission: string
  statuses: Record<string, string>
  types?: Record<string, string>
  columns: DataTableColumn<T>[]
  mobile: {
    title: (r: T) => React.ReactNode
    subtitle?: (r: T) => React.ReactNode
    avatar?: (r: T) => React.ReactNode
    status?: (r: T) => React.ReactNode
    fields: {
      id: string
      label: React.ReactNode
      render: (r: T) => React.ReactNode
    }[]
  }
}) {
  const nav = useNavigate(),
    { sp, page, limit, patch } = useListState(),
    canView = usePermission(viewPermission),
    canManage = usePermission(managePermission),
    createOpen = sp.get("create") === "1",
    search = sp.get("search") || "",
    status = sp.get("status") || "",
    type = sp.get("type") || "",
    productId = sp.get("productId") || "",
    companyId = sp.get("companyId") || "",
    tenderId = sp.get("tenderId") || "",
    confidentiality = sp.get("confidentiality") || "",
    ownerId = sp.get("ownerId") || "",
    version = sp.get("version") || "",
    category = sp.get("category") || "",
    reviewDue = sp.get("reviewDue") || "",
    from = sp.get("from") || "",
    to = sp.get("to") || "",
    sort = sp.get("sort") || "updatedAt",
    sortDirection = (sp.get("sortDirection") === "asc" ? "asc" : "desc") as
      "asc" | "desc"
  const params = useMemo(
    () => ({
      page,
      limit,
      search: search || undefined,
      status: status || undefined,
      type: type || undefined,
      productId: productId || undefined,
      companyId: companyId || undefined,
      tenderId: tenderId || undefined,
      confidentiality:
        (confidentiality as "INTERNAL" | "CONFIDENTIAL" | "RESTRICTED") ||
        undefined,
      ownerId: ownerId || undefined,
      version: version || undefined,
      category: category || undefined,
      reviewDue: reviewDue || undefined,
      from: from || undefined,
      to: to || undefined,
      sort,
      sortDirection,
    }),
    [
      page,
      limit,
      search,
      status,
      type,
      productId,
      companyId,
      tenderId,
      confidentiality,
      ownerId,
      version,
      category,
      reviewDue,
      from,
      to,
      sort,
      sortDirection,
    ]
  )
  const query = useTechnicalList(kind, params, canView)
  return (
    <EntityListPage>
      <PageHero
        title={title}
        description={description}
        eyebrow="مرکز فنی"
        icon={Icon}
        actions={
          canManage ? (
            <Button onClick={() => patch({ create: 1 })}>
              <Plus className="size-4" />
              ایجاد
            </Button>
          ) : null
        }
      />
      <Filters
        search={search}
        status={status}
        statuses={statuses}
        type={type}
        types={types}
        patch={patch}
        hasExtra={Boolean(
          productId ||
          companyId ||
          tenderId ||
          confidentiality ||
          ownerId ||
          version ||
          category ||
          reviewDue ||
          from ||
          to
        )}
        clearExtra={{
          productId: undefined,
          companyId: undefined,
          tenderId: undefined,
          confidentiality: undefined,
          ownerId: undefined,
          version: undefined,
          category: undefined,
          reviewDue: undefined,
          from: undefined,
          to: undefined,
          sort: undefined,
          sortDirection: undefined,
        }}
        extra={
          <SupportedFilters
            kind={kind}
            values={{
              productId,
              companyId,
              tenderId,
              confidentiality,
              ownerId,
              version,
              category,
              reviewDue,
              from,
              to,
              sort,
              sortDirection,
            }}
            patch={patch}
          />
        }
      />
      <QueryContent query={query} errorTitle={`دریافت ${title} ناموفق بود`}>
        <ResponsiveTechnicalList
          rows={(query.data?.data ?? []) as unknown as T[]}
          columns={columns}
          mobile={mobile}
          getKey={(r) => r.id}
          onOpen={(r) => nav(`/technical/${kind}/${r.id}`)}
          renderRowActions={(r) => (
            <EntityRowActions
              label="مشاهده جزئیات"
              onView={() => nav(`/technical/${kind}/${r.id}`)}
            />
          )}
          meta={query.data?.meta}
          pageSize={limit}
          onPage={(p) => patch({ page: p })}
          onPageSize={(n) => patch({ limit: n, page: 1 })}
          emptyState={
            <EmptyState
              icon={Icon}
              title="موردی یافت نشد"
              description="فیلترها را تغییر دهید یا مورد جدیدی ایجاد کنید."
            />
          }
        />
      </QueryContent>
      <TechnicalFormDialog
        open={canManage && createOpen}
        onOpenChange={(open) => patch({ create: open ? 1 : undefined })}
        kind={kind}
        onSaved={(row) => nav(`/technical/${kind}/${row.id}`)}
      />
    </EntityListPage>
  )
}

function SupportedFilters({
  kind,
  values,
  patch,
}: {
  kind: "releases" | "knowledge-base" | "documents" | "resources" | "tenders"
  values: Record<string, string>
  patch: (v: Record<string, string | number | undefined>) => void
}) {
  const usesProduct = kind !== "tenders",
    usesCompany = kind === "documents" || kind === "tenders",
    usesOwner = [
      "knowledge-base",
      "documents",
      "resources",
      "tenders",
    ].includes(kind),
    products = useQuery({
      queryKey: ["technical-list-lookups", "products"],
      queryFn: () => technicalLookups("products"),
      enabled: usesProduct,
    }),
    companies = useQuery({
      queryKey: ["technical-list-lookups", "companies"],
      queryFn: () => technicalLookups("companies"),
      enabled: usesCompany,
    }),
    owners = useQuery({
      queryKey: ["technical-list-lookups", "users"],
      queryFn: () => technicalLookups("users"),
      enabled: usesOwner,
    }),
    tenders = useQuery({
      queryKey: ["technical-list-lookups", "tenders"],
      queryFn: () => technicalLookups("tenders"),
      enabled: kind === "documents",
    })
  const lookup = (
    label: string,
    key: string,
    options?: { id: string; label: string }[]
  ) => (
    <select
      aria-label={label}
      className={selectClass}
      value={values[key] || ""}
      onChange={(e) => patch({ [key]: e.target.value || undefined })}
    >
      <option value="">{label}: همه</option>
      {options?.map((o) => (
        <option key={o.id} value={o.id}>
          {o.label}
        </option>
      ))}
    </select>
  )
  const sortOptions: Record<string, string> =
    kind === "releases"
      ? {
          updatedAt: "آخرین تغییر",
          releaseDate: "تاریخ انتشار",
          title: "عنوان",
          version: "نسخه",
        }
      : kind === "knowledge-base"
        ? {
            updatedAt: "آخرین تغییر",
            title: "عنوان",
            nextReviewAt: "تاریخ بازبینی",
          }
        : kind === "documents"
          ? {
              updatedAt: "آخرین تغییر",
              title: "عنوان",
              effectiveFrom: "تاریخ اثر",
              expiresAt: "انقضا",
            }
          : kind === "resources"
            ? { updatedAt: "آخرین تغییر", title: "عنوان", version: "نسخه" }
            : {
                updatedAt: "آخرین تغییر",
                title: "عنوان",
                submissionDeadline: "مهلت ارسال",
                estimatedValue: "ارزش",
              }
  return (
    <>
      {usesProduct ? lookup("محصول", "productId", products.data) : null}
      {usesCompany ? lookup("شرکت", "companyId", companies.data) : null}
      {usesOwner ? lookup("مالک", "ownerId", owners.data) : null}
      {kind === "documents" ? lookup("مناقصه", "tenderId", tenders.data) : null}
      {kind === "documents" ? (
        <select
          aria-label="محرمانگی"
          className={selectClass}
          value={values.confidentiality || ""}
          onChange={(e) =>
            patch({ confidentiality: e.target.value || undefined })
          }
        >
          <option value="">همه سطوح محرمانگی</option>
          {Object.entries(confidentialityLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      ) : null}
      {kind === "releases" ? (
        <Input
          aria-label="نسخه"
          className={selectClass}
          value={values.version || ""}
          onChange={(e) => patch({ version: e.target.value || undefined })}
          placeholder="نسخه"
        />
      ) : null}
      {kind === "knowledge-base" ? (
        <Input
          aria-label="دسته‌بندی"
          className={selectClass}
          value={values.category || ""}
          onChange={(e) => patch({ category: e.target.value || undefined })}
          placeholder="دسته‌بندی"
        />
      ) : null}
      {kind === "knowledge-base" ? (
        <select
          aria-label="موعد بازبینی"
          className={selectClass}
          value={values.reviewDue || ""}
          onChange={(e) => patch({ reviewDue: e.target.value || undefined })}
        >
          <option value="">همه موعدهای بازبینی</option>
          <option value="true">سررسیدشده</option>
          <option value="false">سررسیدنشده</option>
        </select>
      ) : null}
      {kind === "releases" || kind === "tenders" ? (
        <div className="min-w-44" aria-label="از تاریخ">
          <PersianDatePicker
            value={filterDate(values.from)}
            onChange={(date) => patch({ from: dateParam(date) })}
            placeholder="از تاریخ"
          />
        </div>
      ) : null}
      {kind === "releases" || kind === "tenders" ? (
        <div className="min-w-44" aria-label="تا تاریخ">
          <PersianDatePicker
            value={filterDate(values.to)}
            onChange={(date) => patch({ to: dateParam(date) })}
            placeholder="تا تاریخ"
          />
        </div>
      ) : null}
      <select
        aria-label="مرتب‌سازی"
        className={selectClass}
        value={values.sort}
        onChange={(e) => patch({ sort: e.target.value })}
      >
        {Object.entries(sortOptions).map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </select>
      <select
        aria-label="جهت مرتب‌سازی"
        className={selectClass}
        value={values.sortDirection}
        onChange={(e) => patch({ sortDirection: e.target.value })}
      >
        <option value="desc">نزولی</option>
        <option value="asc">صعودی</option>
      </select>
    </>
  )
}

function filterDate(value?: string) {
  return value ? new Date(`${value.slice(0, 10)}T12:00:00`) : undefined
}

function dateParam(date?: Date) {
  return date
    ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
    : undefined
}

export function TechnicalReleasesPage() {
  const columns: DataTableColumn<TechnicalRelease>[] = [
    {
      id: "release",
      header: "انتشار",
      cell: (r) => (
        <EntityTableCell
          title={r.title}
          subtitle={r.version}
          avatar={<PackageOpen className="size-5" />}
        />
      ),
    },
    { id: "product", header: "محصول", cell: (r) => relationName(r.product) },
    {
      id: "status",
      header: "وضعیت",
      cell: (r) => (
        <TechnicalStatusBadge
          status={r.status}
          presentation={releasePresentation}
        />
      ),
    },
    {
      id: "releaseDate",
      header: "تاریخ انتشار",
      cell: (r) => faDate(r.releaseDate),
    },
    {
      id: "support",
      header: "پشتیبانی / پایان عمر",
      cell: (r) => (
        <div className="text-xs">
          <div>{faDate(r.supportEndDate)}</div>
          <div className="text-muted-foreground">
            EOL: {faDate(r.endOfLifeDate)}
          </div>
        </div>
      ),
    },
    { id: "updated", header: "آخرین تغییر", cell: (r) => faDate(r.updatedAt) },
  ]
  return (
    <Shell
      title="انتشارهای فنی"
      description="نسخه‌ها، زمان‌بندی انتشار و چرخه پشتیبانی محصولات"
      icon={PackageOpen}
      kind="releases"
      viewPermission="technical-release:view"
      managePermission="technical-release:manage"
      statuses={releasePresentation.label}
      columns={columns}
      mobile={{
        title: (r) => r.title,
        subtitle: (r) => `${relationName(r.product)} · ${r.version}`,
        avatar: () => <PackageOpen className="size-5" />,
        status: (r) => (
          <TechnicalStatusBadge
            status={r.status}
            presentation={releasePresentation}
          />
        ),
        fields: [
          { id: "date", label: "انتشار", render: (r) => faDate(r.releaseDate) },
          {
            id: "support",
            label: "پایان پشتیبانی",
            render: (r) => faDate(r.supportEndDate),
          },
        ],
      }}
    />
  )
}
export function TechnicalKnowledgeBasePage() {
  const columns: DataTableColumn<KnowledgeArticle>[] = [
    {
      id: "title",
      header: "مقاله",
      cell: (r) => (
        <EntityTableCell
          title={r.title}
          subtitle={r.summary || r.slug}
          avatar={<BookOpen className="size-5" />}
        />
      ),
    },
    { id: "category", header: "دسته", cell: (r) => r.category || "—" },
    {
      id: "status",
      header: "وضعیت",
      cell: (r) => (
        <TechnicalStatusBadge
          status={r.status}
          presentation={knowledgePresentation}
        />
      ),
    },
    {
      id: "visibility",
      header: "دسترسی",
      cell: (r) => (r.visibility === "RESTRICTED" ? "محدود" : "داخلی"),
    },
    {
      id: "review",
      header: "بازبینی بعدی",
      cell: (r) => faDate(r.nextReviewAt),
    },
    { id: "updated", header: "آخرین تغییر", cell: (r) => faDate(r.updatedAt) },
  ]
  return (
    <Shell
      title="پایگاه دانش"
      description="دانش فنی قابل استفاده مجدد، قابل بازبینی و انتشار"
      icon={BookOpen}
      kind="knowledge-base"
      viewPermission="technical-knowledge:view"
      managePermission="technical-knowledge:manage"
      statuses={knowledgePresentation.label}
      columns={columns}
      mobile={{
        title: (r) => r.title,
        subtitle: (r) => r.summary || r.category || "—",
        avatar: () => <BookOpen className="size-5" />,
        status: (r) => (
          <TechnicalStatusBadge
            status={r.status}
            presentation={knowledgePresentation}
          />
        ),
        fields: [
          { id: "category", label: "دسته", render: (r) => r.category || "—" },
          {
            id: "updated",
            label: "آخرین تغییر",
            render: (r) => faDate(r.updatedAt),
          },
        ],
      }}
    />
  )
}
export function TechnicalDocumentsPage() {
  const columns: DataTableColumn<TechnicalDocument>[] = [
    {
      id: "title",
      header: "سند",
      cell: (r) => (
        <EntityTableCell
          title={r.title}
          subtitle={r.documentType}
          avatar={<FileText className="size-5" />}
        />
      ),
    },
    {
      id: "version",
      header: "نسخه فعلی",
      cell: (r) => r.versions?.[0]?.version || "—",
    },
    {
      id: "status",
      header: "وضعیت",
      cell: (r) => (
        <TechnicalStatusBadge
          status={r.status}
          presentation={documentPresentation}
        />
      ),
    },
    {
      id: "conf",
      header: "محرمانگی",
      cell: (r) => confidentialityLabels[r.confidentiality],
    },
    {
      id: "relation",
      header: "ارتباط",
      cell: (r) =>
        r.product
          ? relationName(r.product)
          : r.company
            ? relationName(r.company)
            : r.opportunity
              ? relationName(r.opportunity)
              : "—",
    },
    { id: "updated", header: "آخرین تغییر", cell: (r) => faDate(r.updatedAt) },
  ]
  return (
    <Shell
      title="اسناد فنی"
      description="مستندات نسخه‌بندی‌شده با چرخه تأیید و محرمانگی"
      icon={FileText}
      kind="documents"
      viewPermission="technical-document:view"
      managePermission="technical-document:manage"
      statuses={documentPresentation.label}
      columns={columns}
      mobile={{
        title: (r) => r.title,
        subtitle: (r) =>
          `${r.documentType} · ${r.versions?.[0]?.version || "بدون نسخه"}`,
        avatar: () => <FileText className="size-5" />,
        status: (r) => (
          <TechnicalStatusBadge
            status={r.status}
            presentation={documentPresentation}
          />
        ),
        fields: [
          {
            id: "conf",
            label: "محرمانگی",
            render: (r) => confidentialityLabels[r.confidentiality],
          },
          {
            id: "updated",
            label: "آخرین تغییر",
            render: (r) => faDate(r.updatedAt),
          },
        ],
      }}
    />
  )
}
export function TechnicalResourcesPage() {
  const columns: DataTableColumn<TechnicalResource>[] = [
    {
      id: "title",
      header: "منبع",
      cell: (r) => (
        <EntityTableCell
          title={r.title}
          subtitle={r.version || resourceTypeLabels[r.resourceType]}
          avatar={<FolderOpen className="size-5" />}
        />
      ),
    },
    {
      id: "type",
      header: "نوع",
      cell: (r) => resourceTypeLabels[r.resourceType],
    },
    {
      id: "status",
      header: "وضعیت",
      cell: (r) => (
        <TechnicalStatusBadge
          status={r.status}
          presentation={resourcePresentation}
        />
      ),
    },
    {
      id: "source",
      header: "دسترسی",
      cell: (r) =>
        r.url ? (
          <a
            href={r.url}
            target="_blank"
            rel="noreferrer"
            className="text-primary underline"
            onClick={(e) => e.stopPropagation()}
          >
            پیوند خارجی
          </a>
        ) : r.attachmentId ? (
          "فایل پیوست"
        ) : (
          "—"
        ),
    },
    { id: "updated", header: "آخرین تغییر", cell: (r) => faDate(r.updatedAt) },
  ]
  return (
    <Shell
      title="منابع فنی"
      description="SDK، نمونه‌کد، اسکریپت، Firmware و پیوندهای قابل استفاده مجدد"
      icon={FolderOpen}
      kind="resources"
      viewPermission="technical-resource:view"
      managePermission="technical-resource:manage"
      statuses={resourcePresentation.label}
      types={resourceTypeLabels}
      columns={columns}
      mobile={{
        title: (r) => r.title,
        subtitle: (r) => resourceTypeLabels[r.resourceType],
        avatar: () => <FolderOpen className="size-5" />,
        status: (r) => (
          <TechnicalStatusBadge
            status={r.status}
            presentation={resourcePresentation}
          />
        ),
        fields: [
          { id: "version", label: "نسخه", render: (r) => r.version || "—" },
          {
            id: "source",
            label: "منبع",
            render: (r) => (r.url ? "پیوند" : r.attachmentId ? "پیوست" : "—"),
          },
        ],
      }}
    />
  )
}
export function TechnicalTendersPage() {
  const columns: DataTableColumn<Tender>[] = [
    {
      id: "title",
      header: "مناقصه",
      cell: (r) => (
        <EntityTableCell
          title={r.title}
          subtitle={r.referenceNumber || "بدون شماره مرجع"}
          avatar={<Gavel className="size-5" />}
        />
      ),
    },
    { id: "company", header: "شرکت", cell: (r) => relationName(r.company) },
    {
      id: "opportunity",
      header: "فرصت",
      cell: (r) => relationName(r.opportunity),
    },
    { id: "type", header: "نوع", cell: (r) => tenderTypeLabels[r.tenderType] },
    {
      id: "status",
      header: "وضعیت",
      cell: (r) => (
        <TechnicalStatusBadge
          status={r.status}
          presentation={tenderPresentation}
        />
      ),
    },
    {
      id: "deadline",
      header: "مهلت ارسال",
      cell: (r) => <Deadline value={r.submissionDeadline} />,
    },
    {
      id: "value",
      header: "ارزش",
      cell: (r) =>
        r.estimatedValue
          ? `${Number(r.estimatedValue).toLocaleString("fa-IR")} ${r.currency || ""}`
          : "—",
    },
  ]
  return (
    <Shell
      title="مناقصه‌ها"
      description="فضای فنی–تجاری RFP/RFQ/RFI و الزامات تحویل"
      icon={Gavel}
      kind="tenders"
      viewPermission="technical-tender:view"
      managePermission="technical-tender:manage"
      statuses={tenderPresentation.label}
      types={tenderTypeLabels}
      columns={columns}
      mobile={{
        title: (r) => r.title,
        subtitle: (r) => r.referenceNumber || relationName(r.company),
        avatar: () => <Gavel className="size-5" />,
        status: (r) => (
          <TechnicalStatusBadge
            status={r.status}
            presentation={tenderPresentation}
          />
        ),
        fields: [
          {
            id: "company",
            label: "شرکت",
            render: (r) => relationName(r.company),
          },
          {
            id: "deadline",
            label: "مهلت ارسال",
            render: (r) => <Deadline value={r.submissionDeadline} />,
          },
        ],
      }}
    />
  )
}
export function Deadline({ value }: { value?: string | null }) {
  if (!value) return <>—</>
  const end = new Date(value),
    days = Math.ceil((end.getTime() - Date.now()) / 86400000),
    tone =
      days < 0
        ? "text-destructive"
        : days <= 7
          ? "text-amber-700"
          : "text-foreground"
  return (
    <span className={tone}>
      {faDate(value)}{" "}
      <span className="sr-only">
        {days < 0 ? "گذشته" : days <= 7 ? "نزدیک" : "آینده"}
      </span>
      {days < 0
        ? "(گذشته)"
        : days <= 7
          ? `(${days.toLocaleString("fa-IR")} روز)`
          : null}
    </span>
  )
}
