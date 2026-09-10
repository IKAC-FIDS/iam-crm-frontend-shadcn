import { EntityCardList, type EntityCardField } from "@/components/shared/EntityCardList"
import { EntityListPage } from "@/components/shared/EntityListPage"
import { useMemo, useState } from "react"
import { Building2, Eye, Plus, UsersRound } from "lucide-react"
import { useNavigate } from "react-router-dom"

import { DataTableToolbar } from "@/components/shared/DataTableToolbar"
import { AdvancedFilterPopover } from "@/components/shared/AdvancedFilterPopover"
import { EmptyState } from "@/components/shared/EmptyState"
import { QueryContent } from "@/components/shared/QueryContent"
import { enumParam, useListQueryState } from "@/lib/listQuery"
import { PageHero } from "@/components/shared/PageHero"
import { PaginationControls } from "@/components/shared/PaginationControls"
import { SearchableOptionSelect } from "@/components/shared/SearchableOptionSelect"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { uiText } from "@/config/uiText"
import { useAuthStore } from "@/store/authStore"
import { Button } from "@workspace/ui/components/button"

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
            <IdentityAvatar name={company.owner.fullName} mediaPath={`/users/${company.owner.id}/avatar`} hasMedia={Boolean(company.owner.id)} mediaVersion={company.owner.avatarObjectKey} className="size-7 rounded-lg text-[10px]" />
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
        accessBadge={{ label: "مدیریت حساب‌های مشتری", icon: Building2 }}
        title={text.title}
        description={text.description}
        primaryAction={canCreate ? {
          label: text.create,
          icon: Plus,
          onClick: () => setCreateOpen(true),
        } : undefined}
      />

      <DataTableToolbar
        filtersClassName="grid grid-cols-1 sm:grid-cols-2"
        searchValue={search}
        onSearchChange={(value) => {
          patch({ search: value }, { replace: true })
        }}
        searchPlaceholder={text.searchPlaceholder}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={clearFilters}
        quickFilters={(
          [
            ["ALL", text.filters.allOwners],
            ["MINE", text.filters.mine],
            ["TEAM", text.filters.team],
            ["UNASSIGNED", text.filters.unassigned],
          ] as const
        ).map(([value, label]) => (
          <Button
            key={value}
            type="button"
            size="sm"
            variant={ownershipScope === value ? "default" : "outline"}
            aria-pressed={ownershipScope === value}
            className="shrink-0 rounded-xl"
            onClick={() => patch({ ownershipScope: value })}
          >
            {label}
          </Button>
        ))}
        filters={
          <>
            <SearchableOptionSelect
              ariaLabel={text.filters.allPriorities}
              value={priority}
              options={[
                { id: "STRATEGIC", label: text.priorities.STRATEGIC },
                { id: "HIGH", label: text.priorities.HIGH },
                { id: "MEDIUM", label: text.priorities.MEDIUM },
                { id: "LOW", label: text.priorities.LOW },
              ]}
              search=""
              onSearchChange={() => undefined}
              onChange={(value) => patch({ priority: value })}
              placeholder={text.filters.allPriorities}
              searchable={false}
            />

            <AdvancedFilterPopover
              activeCount={archiveMode === "ACTIVE" ? 0 : 1}
              label={text.filters.allArchiveStates}
              title="فیلتر وضعیت شرکت"
              description="شرکت‌های فعال، بایگانی‌شده یا همه شرکت‌ها را نمایش دهید."
              onClear={() => patch({ archiveMode: undefined })}
            >
              <SearchableOptionSelect
                ariaLabel={text.filters.allArchiveStates}
                value={archiveMode}
                options={[
                  { id: "ACTIVE", label: text.filters.activeOnly },
                  { id: "ARCHIVED", label: text.filters.archivedOnly },
                  { id: "ALL", label: text.filters.allArchiveStates },
                ]}
                search=""
                onSearchChange={() => undefined}
                onChange={(value) => patch({ archiveMode: value })}
                searchable={false}
                allowEmpty={false}
              />
            </AdvancedFilterPopover>
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
              hasMedia={Boolean(company.id)}
              mediaVersion={company.logoObjectKey}
              fallbackIcon={<Building2 className="size-6" />}
              className="size-16 rounded-[22px] text-xl shadow-sm"
            />
          )}
          actions={(company) => (
            <Button
              type="button"
              variant="outline"
              size="sm"
              aria-label={text.openCompany}
              className="rounded-xl"
              onClick={() => navigate(`/companies/${company.id}`)}
            >
              <Eye className="size-4" />
              {uiText.common.view}
            </Button>
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
