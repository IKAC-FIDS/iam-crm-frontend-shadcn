import { EntityListPage } from "@/components/shared/EntityListPage"
import { useState } from "react"
import {
  Building2,
  Plus,
} from "lucide-react"
import { useNavigate } from "react-router-dom"

import { DataTableToolbar } from "@/components/shared/DataTableToolbar"
import { AdvancedFilterPopover } from "@/components/shared/AdvancedFilterPopover"
import { EmptyState } from "@/components/shared/EmptyState"
import { QueryContent } from "@/components/shared/QueryContent"
import { enumParam, useListQueryState } from "@/lib/listQuery"
import { PageHero } from "@/components/shared/PageHero"
import { PaginationControls } from "@/components/shared/PaginationControls"
import { SearchableOptionSelect } from "@/components/shared/SearchableOptionSelect"
import { uiText } from "@/config/uiText"
import { useAuthStore } from "@/store/authStore"
import { Button } from "@workspace/ui/components/button"

import { ArchiveCompanyDialog } from "../components/ArchiveCompanyDialog"
import { ChangeCompanyOwnerDialog } from "../components/ChangeCompanyOwnerDialog"
import { CompanyEntityCard } from "../components/CompanyEntityCard"
import { CompanyFormDialog } from "../components/CompanyFormDialog"
import { useCompanies } from "../hooks/useCompanies"
import {
  useCreateCompany,
  useUpdateCompany,
} from "../hooks/useCompanyMutations"
import type { Company } from "../types/company.types"

export function CompaniesPage() {
  const text = uiText.companies.list
  const navigate = useNavigate()
  const permissions = useAuthStore((state) => state.user?.permissions ?? [])
  const canCreate = permissions.includes("company:create")
  const createMutation = useCreateCompany()

  const { params, page, pageSize, patch, setPage, setPageSize } =
    useListQueryState()
  const [createOpen, setCreateOpen] = useState(false)
  const [editCompany, setEditCompany] = useState<Company | null>(null)
  const [ownerCompany, setOwnerCompany] = useState<Company | null>(null)
  const [archiveCompany, setArchiveCompany] = useState<Company | null>(null)
  const updateMutation = useUpdateCompany(editCompany?.id ?? "")
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
    <EntityListPage className="h-full min-h-0 grid-rows-[auto_auto_minmax(0,1fr)] overflow-hidden">
      <PageHero
        accessBadge={{ label: "مدیریت حساب‌های مشتری", icon: Building2 }}
        title={text.title}
        description={text.description}
        primaryAction={
          canCreate
            ? {
                label: text.create,
                icon: Plus,
                onClick: () => setCreateOpen(true),
              }
            : undefined
        }
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
        <div className="flex min-h-0 flex-col gap-3 overflow-hidden">
          {(query.data?.data ?? []).length ? (
            <div
              className="min-h-0 flex-1 overflow-y-auto overscroll-contain pe-1"
              aria-label={text.title}
              tabIndex={0}
            >
              <div className="grid gap-2.5 pb-1">
                {(query.data?.data ?? []).map((company) => (
                  <CompanyEntityCard
                    key={company.id}
                    company={company}
                    permissions={permissions}
                    onView={() => navigate(`/companies/${company.id}`)}
                    onEdit={() => setEditCompany(company)}
                    onChangeOwner={() => setOwnerCompany(company)}
                    onToggleArchive={() => setArchiveCompany(company)}
                  />
                ))}
              </div>
            </div>
          ) : (
            <EmptyState
              icon={Building2}
              title={text.emptyTitle}
              description={text.emptyDescription}
            />
          )}

          <div className="shrink-0">
            <PaginationControls
              page={query.data?.meta.page ?? page}
              pageCount={query.data?.meta.totalPages ?? 1}
              onPageChange={setPage}
              pageSize={pageSize}
              onPageSizeChange={setPageSize}
              total={query.data?.meta.total}
              disabled={query.isFetching}
            />
          </div>
        </div>
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

      {editCompany ? (
        <CompanyFormDialog
          open
          onOpenChange={(open) => {
            if (!open) setEditCompany(null)
          }}
          mode="edit"
          company={editCompany}
          isPending={updateMutation.isPending}
          submitError={updateMutation.error}
          onSubmit={async (payload) => {
            await updateMutation.mutateAsync(payload)
            setEditCompany(null)
          }}
        />
      ) : null}

      {ownerCompany ? (
        <ChangeCompanyOwnerDialog
          company={ownerCompany}
          open
          onOpenChange={(open) => {
            if (!open) setOwnerCompany(null)
          }}
        />
      ) : null}

      {archiveCompany ? (
        <ArchiveCompanyDialog
          company={archiveCompany}
          open
          onOpenChange={(open) => {
            if (!open) setArchiveCompany(null)
          }}
        />
      ) : null}
    </EntityListPage>
  )
}
