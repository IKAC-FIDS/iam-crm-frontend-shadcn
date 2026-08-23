import { useMemo, useState } from "react"
import {
  Building2,
  Eye,
  Plus,
  RotateCcw,
  Search,
  UsersRound,
} from "lucide-react"
import { useNavigate } from "react-router-dom"

import {
  DataTableShell,
  type DataTableColumn,
} from "@/components/shared/DataTableShell"
import { EmptyState } from "@/components/shared/EmptyState"
import { ErrorState } from "@/components/shared/ErrorState"
import { LoadingState } from "@/components/shared/LoadingState"
import { PaginationControls } from "@/components/shared/PaginationControls"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { uiText } from "@/config/uiText"
import { useAuthStore } from "@/store/authStore"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"

import { CompanyAvatar } from "../components/CompanyAvatar"
import { CompanyFormDialog } from "../components/CompanyFormDialog"
import { CompanyPriorityBadge } from "../components/CompanyPriorityBadge"
import { useCompanies } from "../hooks/useCompanies"
import { useCreateCompany } from "../hooks/useCompanyMutations"
import type {
  Company,
  CompanyPriority,
  OwnershipScope,
} from "../types/company.types"
import {
  companyDisplayName,
  formatCompanyDate,
} from "../utils/companyFormatters"

const pageSize = 20

export function CompaniesPage() {
  const text = uiText.companies.list
  const navigate = useNavigate()
  const permissions = useAuthStore(
    (state) => state.user?.permissions ?? []
  )
  const canCreate = permissions.includes("company:create")
  const createMutation = useCreateCompany()

  const [page, setPage] = useState(1)
  const [createOpen, setCreateOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [priority, setPriority] =
    useState<CompanyPriority | "">("")
  const [ownershipScope, setOwnershipScope] =
    useState<OwnershipScope>("ALL")
  const [archiveMode, setArchiveMode] = useState<
    "ACTIVE" | "ARCHIVED" | "ALL"
  >("ACTIVE")

  const query = useCompanies({
    page,
    limit: pageSize,
    search: search.trim() || undefined,
    priority: priority || undefined,
    ownershipScope,
    includeArchived: archiveMode === "ALL",
    archivedOnly: archiveMode === "ARCHIVED",
  })

  const columns = useMemo<DataTableColumn<Company>[]>(
    () => [
      {
        id: "company",
        header: text.columns.company,
        cell: (company) => (
          <button
            type="button"
            className="flex min-w-64 items-center gap-3 text-start"
            onClick={(event) => {
              event.stopPropagation()
              navigate(`/companies/${company.id}`)
            }}
          >
            <CompanyAvatar
              name={companyDisplayName(
                company.legalName,
                company.brandName
              )}
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-[var(--app-heading)]">
                {companyDisplayName(
                  company.legalName,
                  company.brandName
                )}
              </p>
              {company.brandName &&
              company.brandName !== company.legalName ? (
                <p className="mt-1 truncate text-[10px] text-[var(--app-text-secondary)]">
                  {company.legalName}
                </p>
              ) : null}
            </div>
          </button>
        ),
      },
      {
        id: "industry",
        header: text.columns.industry,
        cell: (company) =>
          company.industryRef?.name ||
          company.industry ||
          uiText.common.notAvailable,
      },
      {
        id: "priority",
        header: text.columns.priority,
        cell: (company) => (
          <CompanyPriorityBadge
            priority={company.priority}
          />
        ),
      },
      {
        id: "owner",
        header: text.columns.owner,
        cell: (company) => (
          <span className="inline-flex items-center gap-2">
            <UsersRound className="size-3.5 text-[var(--app-icon-muted)]" />
            {company.owner?.fullName || text.unassigned}
          </span>
        ),
      },
      {
        id: "status",
        header: text.columns.status,
        cell: (company) =>
          company.archivedAt ? (
            <StatusBadge tone="warning">
              {text.archived}
            </StatusBadge>
          ) : (
            <StatusBadge tone="success">
              {text.active}
            </StatusBadge>
          ),
      },
      {
        id: "updatedAt",
        header: text.columns.updatedAt,
        cell: (company) =>
          formatCompanyDate(company.updatedAt),
      },
      {
        id: "actions",
        header: "",
        headerClassName: "w-16",
        cell: (company) => (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="rounded-xl text-[var(--app-primary)]"
            aria-label={text.openCompany}
            onClick={(event) => {
              event.stopPropagation()
              navigate(`/companies/${company.id}`)
            }}
          >
            <Eye className="size-4" />
          </Button>
        ),
      },
    ],
    [navigate, text]
  )

  const hasActiveFilters =
    Boolean(search.trim()) ||
    Boolean(priority) ||
    ownershipScope !== "ALL" ||
    archiveMode !== "ACTIVE"

  function clearFilters() {
    setSearch("")
    setPriority("")
    setOwnershipScope("ALL")
    setArchiveMode("ACTIVE")
    setPage(1)
  }

  return (
    <div className="grid gap-5" dir="rtl">
      <section className="relative overflow-hidden rounded-[30px] border border-[var(--app-divider)] bg-[var(--app-surface)] px-5 py-6 shadow-[var(--app-shadow-card)] sm:px-7">
        <div className="pointer-events-none absolute -end-20 -top-28 size-64 rounded-full bg-[var(--app-primary-soft)] blur-3xl" />

        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[var(--app-divider)] bg-[var(--app-background)]/70 px-3 py-1.5 text-[10px] font-bold text-[var(--app-primary)]">
              <Building2 className="size-3.5" />
              مدیریت حساب‌های مشتری
            </div>

            <h1 className="text-2xl font-bold text-[var(--app-heading)] sm:text-3xl">
              {text.title}
            </h1>

            <p className="mt-2 max-w-xl text-xs leading-6 text-[var(--app-text-secondary)]">
              {text.description}
            </p>
          </div>

          {canCreate ? (
            <Button
              type="button"
              className="rounded-xl bg-[var(--app-primary)] text-[var(--app-on-primary)] hover:bg-[var(--app-primary-hover)]"
              onClick={() => setCreateOpen(true)}
            >
              <Plus className="size-4" />
              {text.create}
            </Button>
          ) : null}
        </div>
      </section>

      <section className="rounded-[24px] border border-[var(--app-divider)] bg-[var(--app-surface)] p-3 shadow-[var(--app-shadow-card)]">
        <div className="grid gap-3 xl:grid-cols-[minmax(260px,1.45fr)_auto_minmax(165px,.72fr)_minmax(165px,.72fr)] xl:items-center">
          <div className="relative min-w-0">
            <Search className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-[var(--app-icon-muted)]" />
            <Input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value)
                setPage(1)
              }}
              placeholder={text.searchPlaceholder}
              className="h-11 rounded-xl pe-9"
            />
          </div>

          <div className="flex min-w-max rounded-xl border border-[var(--app-divider)] bg-[var(--app-background)] p-1">
            {(
              [
                ["ALL", text.filters.allOwners],
                ["MINE", text.filters.mine],
                ["TEAM", text.filters.team],
                ["UNASSIGNED", text.filters.unassigned],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => {
                  setOwnershipScope(value)
                  setPage(1)
                }}
                className={[
                  "rounded-lg px-3 py-2 text-[10px] font-bold transition",
                  ownershipScope === value
                    ? "bg-[var(--app-primary)] text-[var(--app-on-primary)] shadow-sm"
                    : "text-[var(--app-text-secondary)] hover:text-[var(--app-primary)]",
                ].join(" ")}
              >
                {label}
              </button>
            ))}
          </div>

          <select
            value={priority}
            onChange={(event) => {
              setPriority(
                event.target.value as CompanyPriority | ""
              )
              setPage(1)
            }}
            className={selectClass}
          >
            <option value="">
              {text.filters.allPriorities}
            </option>
            <option value="STRATEGIC">
              {text.priorities.STRATEGIC}
            </option>
            <option value="HIGH">
              {text.priorities.HIGH}
            </option>
            <option value="MEDIUM">
              {text.priorities.MEDIUM}
            </option>
            <option value="LOW">
              {text.priorities.LOW}
            </option>
          </select>

          <select
            value={archiveMode}
            onChange={(event) => {
              setArchiveMode(
                event.target.value as
                  | "ACTIVE"
                  | "ARCHIVED"
                  | "ALL"
              )
              setPage(1)
            }}
            className={selectClass}
          >
            <option value="ACTIVE">
              {text.filters.activeOnly}
            </option>
            <option value="ARCHIVED">
              {text.filters.archivedOnly}
            </option>
            <option value="ALL">
              {text.filters.allArchiveStates}
            </option>
          </select>
        </div>

        {hasActiveFilters ? (
          <div className="mt-3 flex justify-end border-t border-[var(--app-divider)] pt-3">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="rounded-xl text-[var(--app-text-secondary)]"
              onClick={clearFilters}
            >
              <RotateCcw className="size-3.5" />
              پاک کردن فیلترها
            </Button>
          </div>
        ) : null}
      </section>

      {query.isLoading ? (
        <LoadingState />
      ) : query.isError ? (
        <ErrorState
          title={text.errorTitle}
          description={text.errorDescription}
          retryLabel={uiText.common.retry}
          onRetry={() => void query.refetch()}
        />
      ) : (
        <>
          <DataTableShell
            rows={query.data?.data ?? []}
            columns={columns}
            getRowKey={(company) => company.id}
            onRowClick={(company) =>
              navigate(`/companies/${company.id}`)
            }
            emptyState={
              <EmptyState
                icon={Building2}
                title={text.emptyTitle}
                description={text.emptyDescription}
              />
            }
          />

          <PaginationControls
            page={query.data?.meta.page ?? page}
            pageCount={
              query.data?.meta.totalPages ?? 1
            }
            onPageChange={setPage}
            disabled={query.isFetching}
          />
        </>
      )}

      <CompanyFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        mode="create"
        isPending={createMutation.isPending}
        submitError={createMutation.error}
        onSubmit={async (payload) => {
          const company =
            await createMutation.mutateAsync(payload)
          setCreateOpen(false)
          navigate(`/companies/${company.id}`)
        }}
      />
    </div>
  )
}

const selectClass =
  "h-11 w-full rounded-xl border border-input bg-transparent px-3 text-xs text-[var(--app-heading)] outline-none focus:border-[var(--app-primary)]"
