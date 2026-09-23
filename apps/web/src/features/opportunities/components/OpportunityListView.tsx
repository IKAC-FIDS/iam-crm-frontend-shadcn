import { EmptyState } from "@/components/shared/EmptyState"
import { PaginationControls } from "@/components/shared/PaginationControls"
import { QueryContent } from "@/components/shared/QueryContent"
import { uiText } from "@/config/uiText"
import { canViewFinancials } from "@/lib/permissions"
import { useListQueryState } from "@/lib/listQuery"
import { useAuthStore } from "@/store/authStore"
import { BriefcaseBusiness } from "lucide-react"

import { useOpportunityList } from "../hooks/useOpportunities"
import type {
  Opportunity,
  OpportunityFilters,
} from "../types/opportunity.types"
import {
  type OpportunityActionPermissions,
} from "./OpportunityActionsMenu"
import { OpportunityEntityCard } from "./OpportunityEntityCard"

type Action = (opportunity: Opportunity) => void

export function OpportunityListView({
  filters,
  isUpdatingFilters = false,
  permissions,
  onView,
  onEdit,
  onChangeOwner,
  onChangeStage,
  onArchiveToggle,
}: {
  filters: OpportunityFilters
  isUpdatingFilters?: boolean
  permissions: OpportunityActionPermissions
  onView: Action
  onEdit: Action
  onChangeOwner: Action
  onChangeStage: Action
  onArchiveToggle: Action
}) {
  const text = uiText.opportunities
  const { page, pageSize, setPage, setPageSize } = useListQueryState()
  const query = useOpportunityList(
    { ...filters, page, limit: pageSize },
    !isUpdatingFilters
  )
  const rows = Array.isArray(query.data?.data) ? query.data.data : []
  const financialVisible = canViewFinancials(
    useAuthStore((state) => state.user?.permissions)
  )

  return (
    <QueryContent query={query} errorTitle={text.errors.listTitle}>
      <div className="flex h-full min-h-0 flex-col gap-3 overflow-hidden">
        <div className="min-h-0 flex-1 overflow-hidden rounded-[var(--app-radius-card)] border border-[var(--app-divider)] bg-[var(--app-surface)]/55 p-2 shadow-[var(--app-shadow-card)]">
          <div
            className="ui-contained-scroll h-full overflow-y-auto overscroll-contain ps-2 pe-1 py-1 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--app-primary)]"
            aria-label={text.hero.title}
            tabIndex={0}
          >
            {rows.length ? (
              <div className="grid gap-2.5">
                {rows.map((opportunity) => (
                  <OpportunityEntityCard
                    key={opportunity.id}
                    opportunity={opportunity}
                    permissions={permissions}
                    financialVisible={financialVisible}
                    onView={() => onView(opportunity)}
                    onEdit={() => onEdit(opportunity)}
                    onChangeOwner={() => onChangeOwner(opportunity)}
                    onChangeStage={() => onChangeStage(opportunity)}
                    onArchiveToggle={() => onArchiveToggle(opportunity)}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={BriefcaseBusiness}
                title={text.empty.listTitle}
                description={text.empty.listDescription}
              />
            )}
          </div>
        </div>

        {query.data ? (
          <div className="shrink-0">
            <PaginationControls
              page={query.data.meta.page}
              pageCount={query.data.meta.totalPages}
              pageSize={pageSize}
              total={query.data.meta.total}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
              disabled={query.isFetching || isUpdatingFilters}
            />
          </div>
        ) : null}
      </div>
    </QueryContent>
  )
}
