import { EntityCardList, type EntityCardField } from "@/components/shared/EntityCardList"
import { EntityListPage } from "@/components/shared/EntityListPage"
import { useMemo, useState } from "react"
import { Building2, Plus, UsersRound } from "lucide-react"
import { useNavigate } from "react-router-dom"

import { DataTableToolbar } from "@/components/shared/DataTableToolbar"
import { EmptyState } from "@/components/shared/EmptyState"
import { QueryContent } from "@/components/shared/QueryContent"
import { enumParam, useListQueryState } from "@/lib/listQuery"
import { PageHero } from "@/components/shared/PageHero"
import { PaginationControls } from "@/components/shared/PaginationControls"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { uiText } from "@/config/uiText"
import { useAuthStore } from "@/store/authStore"
import { Button } from "@workspace/ui/components/button"

import { EntityRowActions } from "@/components/shared/EntityRowActions"
import { IdentityAvatar } from "@/components/shared/IdentityAvatar"
import { CompanyFormDialog } from "../components/CompanyFormDialog"
import { CompanyPriorityBadge } from "../components/CompanyPriorityBadge"
import { useCompanies } from "../hooks/useCompanies"
import { useCreateCompany } from "../hooks/useCompanyMutations"
import type { Company } from "../types/company.types"
import {
  companyDisplayName,
  formatCompanyDate,
} from "../utils/companyFormatters"

export function CompaniesPage() {
  const text = uiText.companies.list
  const navigate = useNavigate()
  const permissions = useAuthStore((state) => state.user?.permissions ?? [])
  const canCreate = permissions.includes("company:create")
  const createMutation = useCreateCompany()

  const { params, page, pageSize, patch, setPage, setPageSize } =
    useListQueryState()
  const [createOpen, setCreateOpen] = useState(false)
  const search = params.get("search") ?? ""
  const priority = enumParam(
    params.get("priority"),
    ["", "LOW", "MEDIUM", "HIGH", "STRATEGIC"],
    ""
  )
  const ownershipScope = enumParam(
    params.get("ownershipScope"),
    ["ALL", "MINE", "TEAM", "UNASSIGNED"],
    "ALL"
  )
  const archiveMode = enumParam(
    params.get("archiveMode"),
    ["ACTIVE", "ARCHIVED", "ALL"],
    "ACTIVE"
  )

  const query = useCompanies({
    page,
    limit: pageSize,
    search: search.trim() || undefined,
    priority: priority || undefined,
    ownershipScope,
    includeArchived: archiveMode === "ALL",
    archivedOnly: archiveMode === "ARCHIVED",
  })

  const fields = useMemo<EntityCardField<Company>[]>(
    () => [
      {
        id: "industry",
        label: text.columns.industry,
        render: (company) =>
          company.industryRef?.name ||
          company.industry ||
          uiText.common.notAvailable,
      },
      {
        id: "priority",
        label: text.columns.priority,
        render: (company) => (
          <CompanyPriorityBadge priority={company.priority} />
        ),
      },
      {
        id: "owner",
        label: text.columns.owner,
        icon: UsersRound,
        render: (company) => company.owner ? (
          <span className="flex items-center gap-2">
            <IdentityAvatar name={company.owner.fullName} mediaPath={`/users/${company.owner.id}/avatar`} hasMedia={Boolean(company.owner.avatarObjectKey)} className="size-7 rounded-lg text-[10px]" />
            <span className="truncate">{company.owner.fullName}</span>
          </span>
        ) : text.unassigned,
      },
      {
        id: "status",
        label: text.columns.status,
        render: (company) =>
          company.archivedAt ? (
            <StatusBadge tone="warning">{text.archived}</StatusBadge>
          ) : (
            <StatusBadge tone="success">{text.active}</StatusBadge>
          ),
      },
      {
        id: "updatedAt",
        label: text.columns.updatedAt,
        priority: "secondary",
        render: (company) => formatCompanyDate(company.updatedAt),
      },
    ],
    [text],
  )

  const hasActiveFilters =
    Boolean(search.trim()) ||
    Boolean(priority) ||
    ownershipScope !== "ALL" ||
    archiveMode !== "ACTIVE"

  function clearFilters() {
    patch({
      search: undefined,
      priority: undefined,
      ownershipScope: undefined,
      archiveMode: undefined,
    })
  }

  return (
    <EntityListPage>
      <PageHero
        eyebrow="مدیریت حساب‌های مشتری"
        icon={Building2}
        title={text.title}
        description={text.description}
        actions={
          canCreate ? (
            <Button
              type="button"
              className="rounded-xl bg-[var(--app-primary)] text-[var(--app-on-primary)] hover:bg-[var(--app-primary-hover)]"
              onClick={() => setCreateOpen(true)}
            >
              <Plus className="size-4" />
              {text.create}
            </Button>
          ) : null
        }
      />

      <DataTableToolbar
        filtersClassName="grid grid-cols-1 xl:grid-cols-2 [&>div]:xl:col-span-2"
        searchValue={search}
        onSearchChange={(value) => {
          patch({ search: value }, { replace: true })
        }}
        searchPlaceholder={text.searchPlaceholder}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={clearFilters}
        filters={
          <>
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
                  aria-pressed={ownershipScope === value}
                  type="button"
                  onClick={() => {
                    patch({ ownershipScope: value })
                  }}
                  className={[
                    "rounded-lg px-3 py-2 text-xs font-bold transition",
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
              aria-label={text.filters.allPriorities}
              value={priority}
              onChange={(event) => {
                patch({ priority: event.target.value })
              }}
              className={selectClass}
            >
              <option value="">{text.filters.allPriorities}</option>
              <option value="STRATEGIC">{text.priorities.STRATEGIC}</option>
              <option value="HIGH">{text.priorities.HIGH}</option>
              <option value="MEDIUM">{text.priorities.MEDIUM}</option>
              <option value="LOW">{text.priorities.LOW}</option>
            </select>

            <select
              aria-label={text.filters.allArchiveStates}
              value={archiveMode}
              onChange={(event) => {
                patch({ archiveMode: event.target.value })
              }}
              className={selectClass}
            >
              <option value="ACTIVE">{text.filters.activeOnly}</option>
              <option value="ARCHIVED">{text.filters.archivedOnly}</option>
              <option value="ALL">{text.filters.allArchiveStates}</option>
            </select>
          </>
        }
      />

      <QueryContent query={query} errorTitle={text.errorTitle}>
        <EntityCardList
          rows={query.data?.data ?? []}
          fields={fields}
          getRowKey={(company) => company.id}
          onRowClick={(company) => navigate(`/companies/${company.id}`)}
          className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4"
          title={(company) => companyDisplayName(company.legalName, company.brandName)}
          subtitle={(company) => company.brandName && company.brandName !== company.legalName ? company.legalName : uiText.common.notAvailable}
          media={(company) => (
            <IdentityAvatar
              name={companyDisplayName(company.legalName, company.brandName)}
              mediaPath={`/companies/${company.id}/logo`}
              hasMedia={Boolean(company.logoObjectKey)}
              mediaVersion={company.logoObjectKey}
              fallbackIcon={<Building2 className="size-6" />}
              className="size-16 rounded-[22px] text-xl shadow-sm"
            />
          )}
          actions={(company) => (
            <EntityRowActions
              label={text.openCompany}
              onView={() => navigate(`/companies/${company.id}`)}
            />
          )}
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
          pageCount={query.data?.meta.totalPages ?? 1}
          onPageChange={setPage}
          pageSize={pageSize}
          onPageSizeChange={setPageSize}
          total={query.data?.meta.total}
          disabled={query.isFetching}
        />
      </QueryContent>

      <CompanyFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        mode="create"
        isPending={createMutation.isPending}
        submitError={createMutation.error}
        onSubmit={async (payload) => {
          const company = await createMutation.mutateAsync(payload)
          setCreateOpen(false)
          navigate(`/companies/${company.id}`)
        }}
      />
    </EntityListPage>
  )
}

const selectClass =
  "h-11 w-full rounded-xl border border-input bg-transparent px-3 text-xs text-[var(--app-heading)] outline-none focus:border-[var(--app-primary)]"
