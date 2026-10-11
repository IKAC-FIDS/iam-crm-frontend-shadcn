import { useMemo, useState } from "react"
import {
  FileArchive,
  FolderOpen,
  Plus,
  RefreshCw,
  UploadCloud,
} from "lucide-react"
import { toast } from "sonner"
import { useSearchParams } from "react-router-dom"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { ArtifactPanel } from "@/features/artifacts/components/ArtifactPanel"
import {
  DataTableShell,
  type DataTableColumn,
} from "@/components/shared/DataTableShell"
import { DataTableToolbar } from "@/components/shared/DataTableToolbar"
import { EmptyState } from "@/components/shared/EmptyState"
import { EntityListPage } from "@/components/shared/EntityListPage"
import { EntityRowActions } from "@/components/shared/EntityRowActions"
import { ErrorState } from "@/components/shared/ErrorState"
import { PageHero } from "@/components/shared/PageHero"
import { ResponsiveModal } from "@/components/shared/ResponsiveModal"
import { SearchableOptionSelect } from "@/components/shared/SearchableOptionSelect"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { getApiErrorMessage } from "@/lib/apiResponse"
import { useDebouncedValue } from "@/lib/useDebouncedValue"
import { useAuthStore } from "@/store/authStore"
import { useTechnicalList, useTechnicalSave } from "../hooks"
import { faDate, resourceTypeLabels } from "../presentation"
import type { ResourceType, TechnicalResource } from "../types"

const libraryTypes = [
  "RELEASE",
  "DOCUMENT",
  "TOOL",
] as const satisfies readonly ResourceType[]
type LibraryType = (typeof libraryTypes)[number]
const typeOptions = libraryTypes.map((id) => ({
  id,
  label: resourceTypeLabels[id],
}))

export function TechnicalLibraryPage() {
  const permissions = useAuthStore((state) => state.user?.permissions ?? [])
  const canView = permissions.includes("technical-resource:view")
  const canManage = permissions.includes("technical-resource:manage")
  const [params, setParams] = useSearchParams()
  const [searchInput, setSearchInput] = useState(params.get("search") ?? "")
  const [typeSearch, setTypeSearch] = useState("")
  const [createOpen, setCreateOpen] = useState(false)
  const [selected, setSelected] =
    useState<Pick<TechnicalResource, "id" | "title" | "resourceType">>()
  const page = Math.max(1, Number(params.get("page")) || 1)
  const selectedType = libraryTypes.includes(params.get("type") as LibraryType)
    ? (params.get("type") as LibraryType)
    : undefined
  const search = useDebouncedValue(searchInput.trim(), 300)
  const query = useTechnicalList(
    "resources",
    {
      page,
      limit: 20,
      search: search || undefined,
      type: selectedType,
      sort: "updatedAt",
      sortDirection: "desc",
    },
    canView
  )

  function patch(next: { page?: number; search?: string; type?: string }) {
    const copy = new URLSearchParams(params)
    for (const [key, value] of Object.entries(next)) {
      if (value == null || value === "" || (key === "page" && value === 1))
        copy.delete(key)
      else copy.set(key, String(value))
    }
    setParams(copy, { replace: true })
  }

  const columns = useMemo<DataTableColumn<TechnicalResource>[]>(
    () => [
      {
        id: "title",
        header: "عنوان",
        cell: (row) => (
          <div className="max-w-96 min-w-52">
            <b className="block truncate">{row.title}</b>
            {row.description ? (
              <span className="mt-1 block truncate text-xs text-muted-foreground">
                {row.description}
              </span>
            ) : null}
          </div>
        ),
      },
      {
        id: "type",
        header: "نوع",
        cell: (row) => (
          <StatusBadge tone="neutral" dot={false}>
            {libraryLabel(row.resourceType)}
          </StatusBadge>
        ),
      },
      {
        id: "artifacts",
        header: "فایل و لینک",
        cell: (row) =>
          `${(row.artifactCount ?? 0).toLocaleString("fa-IR")} مورد`,
      },
      {
        id: "updatedAt",
        header: "آخرین تغییر",
        cell: (row) => faDate(row.updatedAt),
      },
    ],
    []
  )

  return (
    <EntityListPage>
      <PageHero
        title="مستندات فنی"
        eyebrow="مرکز فنی"
        icon={FolderOpen}
        description="نسخه‌ها، اسناد و ابزارهای فنی را به‌صورت فایل یا مرجع لینک در یک کتابخانه نگه‌داری کنید."
        showRefresh
        onRefresh={() => void query.refetch()}
        refreshing={query.isFetching}
        primaryAction={
          canManage
            ? {
                label: "افزودن مورد",
                icon: Plus,
                onClick: () => setCreateOpen(true),
              }
            : undefined
        }
      />
      <DataTableToolbar
        searchValue={searchInput}
        onSearchChange={(value) => {
          setSearchInput(value)
          patch({ page: 1, search: value })
        }}
        searchPlaceholder="جستجو در مستندات فنی..."
        filters={
          <SearchableOptionSelect
            value={selectedType}
            options={typeOptions.filter((option) =>
              option.label.includes(typeSearch)
            )}
            onChange={(value) => patch({ page: 1, type: value })}
            search={typeSearch}
            onSearchChange={setTypeSearch}
            searchable={false}
            placeholder="همه انواع"
            ariaLabel="نوع محتوای فنی"
          />
        }
        hasActiveFilters={Boolean(searchInput || selectedType)}
        onClearFilters={() => {
          setSearchInput("")
          patch({ page: 1, search: "", type: "" })
        }}
      />
      {!canView ? (
        <ErrorState
          title="دسترسی ندارید"
          description="مجوز مشاهده منابع فنی برای شما فعال نیست."
        />
      ) : query.isError ? (
        <ErrorState
          title="دریافت مستندات انجام نشد"
          description="دوباره تلاش کنید."
          onRetry={() => void query.refetch()}
        />
      ) : (
        <DataTableShell
          rows={query.data?.data ?? []}
          columns={columns}
          getRowKey={(row) => row.id}
          loading={query.isLoading}
          onRowClick={(row) => setSelected(row)}
          emptyState={
            <EmptyState
              icon={FileArchive}
              title="موردی ثبت نشده است"
              description="یک نسخه، سند یا ابزار فنی را به‌صورت فایل یا لینک اضافه کنید."
            />
          }
          renderRowActions={(row) => (
            <EntityRowActions
              label="مشاهده فایل‌ها و لینک‌ها"
              onView={() => setSelected(row)}
            />
          )}
          mobile={{
            title: (row) => row.title,
            subtitle: (row) => row.description || "بدون توضیحات",
            avatar: () => <FileArchive className="size-5" />,
            status: (row) => (
              <StatusBadge tone="neutral" dot={false}>
                {libraryLabel(row.resourceType)}
              </StatusBadge>
            ),
            fields: [
              {
                id: "artifacts",
                label: "فایل و لینک",
                render: (row) =>
                  `${(row.artifactCount ?? 0).toLocaleString("fa-IR")} مورد`,
              },
              {
                id: "updatedAt",
                label: "آخرین تغییر",
                render: (row) => faDate(row.updatedAt),
              },
            ],
          }}
          pagination={
            query.data
              ? {
                  page: query.data.meta.page,
                  pageCount: query.data.meta.totalPages,
                  total: query.data.meta.total,
                  pageSize: query.data.meta.limit,
                  onPageChange: (next) => patch({ page: next }),
                  disabled: query.isFetching,
                }
              : undefined
          }
        />
      )}
      <CreateLibraryItemDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={(item) => {
          setCreateOpen(false)
          setSelected(item)
        }}
      />
      <ResponsiveModal
        open={Boolean(selected)}
        onClose={() => setSelected(undefined)}
        title={selected?.title ?? "مستند فنی"}
        description={
          selected ? `نوع: ${libraryLabel(selected.resourceType)}` : undefined
        }
        icon={FileArchive}
        width="max-w-5xl"
      >
        {selected ? (
          <ArtifactPanel
            entityType="TECHNICAL_RESOURCE"
            entityId={selected.id}
            title="فایل‌ها و مراجع"
          />
        ) : null}
      </ResponsiveModal>
    </EntityListPage>
  )
}

function CreateLibraryItemDialog({
  open,
  onClose,
  onCreated,
}: {
  open: boolean
  onClose: () => void
  onCreated: (
    item: Pick<TechnicalResource, "id" | "title" | "resourceType">
  ) => void
}) {
  const save = useTechnicalSave("resources")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [resourceType, setResourceType] = useState<LibraryType>("DOCUMENT")
  function close() {
    if (save.isPending) return
    setTitle("")
    setDescription("")
    setResourceType("DOCUMENT")
    onClose()
  }
  async function submit() {
    if (!title.trim()) return
    try {
      const finalTitle = title.trim()
      const created = await save.mutateAsync({
        payload: {
          title: finalTitle,
          description: description.trim() || undefined,
          resourceType,
        },
      })
      toast.success("مورد فنی ایجاد شد؛ اکنون فایل یا لینک آن را اضافه کنید.")
      setTitle("")
      setDescription("")
      onCreated({ id: created.id, title: finalTitle, resourceType })
    } catch (error) {
      toast.error(getApiErrorMessage(error, "ایجاد مورد فنی انجام نشد."))
    }
  }
  return (
    <ResponsiveModal
      open={open}
      onClose={close}
      title="افزودن مستند فنی"
      description="نوع و عنوان را مشخص کنید؛ در مرحله بعد فایل بارگذاری یا لینک مرجع ثبت می‌کنید."
      icon={UploadCloud}
    >
      <div className="grid gap-5">
        <div className="grid gap-2">
          <Label htmlFor="technical-library-title">عنوان</Label>
          <Input
            id="technical-library-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="مثلاً راهنمای نصب نسخه ۲.۴"
            autoFocus
          />
        </div>
        <fieldset className="grid gap-2">
          <legend className="text-sm font-medium">نوع محتوا</legend>
          <div className="grid gap-2 sm:grid-cols-3">
            {typeOptions.map((option) => (
              <Button
                key={option.id}
                type="button"
                variant={resourceType === option.id ? "default" : "outline"}
                className="h-11 rounded-xl"
                onClick={() => setResourceType(option.id)}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </fieldset>
        <div className="grid gap-2">
          <Label htmlFor="technical-library-description">
            توضیحات (اختیاری)
          </Label>
          <textarea
            id="technical-library-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={3}
            className="w-full resize-y rounded-xl border border-input bg-transparent p-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="توضیح کوتاه برای پیدا کردن سریع‌تر این مورد"
          />
        </div>
        <div className="flex justify-end gap-2 border-t pt-4">
          <Button
            type="button"
            variant="outline"
            disabled={save.isPending}
            onClick={close}
          >
            انصراف
          </Button>
          <Button
            type="button"
            disabled={save.isPending || !title.trim()}
            onClick={() => void submit()}
          >
            {save.isPending ? (
              <RefreshCw className="size-4 animate-spin" />
            ) : (
              <Plus className="size-4" />
            )}
            ایجاد و افزودن فایل یا لینک
          </Button>
        </div>
      </div>
    </ResponsiveModal>
  )
}

function libraryLabel(type: ResourceType) {
  return libraryTypes.includes(type as LibraryType)
    ? resourceTypeLabels[type]
    : "ابزار فنی"
}
