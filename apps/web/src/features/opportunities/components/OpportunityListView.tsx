import { BriefcaseBusiness } from "lucide-react"
import { useState } from "react"

import { DataTableShell, type DataTableColumn } from "@/components/shared/DataTableShell"
import { EmptyState } from "@/components/shared/EmptyState"
import { ErrorState } from "@/components/shared/ErrorState"
import { LoadingState } from "@/components/shared/LoadingState"
import { uiText } from "@/config/uiText"
import { PaginationControls } from "@/components/shared/PaginationControls"

import { useOpportunityList } from "../hooks/useOpportunities"
import type { Opportunity, OpportunityFilters } from "../types/opportunity.types"
import { formatOpportunityDate, formatOpportunityValue, opportunityCompanyName, priorityLabel } from "../utils/opportunityFormatters"
import { OpportunityActionsMenu, type OpportunityActionPermissions } from "./OpportunityActionsMenu"

type Action = (opportunity: Opportunity) => void

export function OpportunityListView({ filters, permissions, onView, onEdit, onChangeOwner, onChangeStage, onArchiveToggle }: {
  filters: OpportunityFilters
  permissions: OpportunityActionPermissions
  onView: Action
  onEdit: Action
  onChangeOwner: Action
  onChangeStage: Action
  onArchiveToggle: Action
}) {
  const text = uiText.opportunities
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const fingerprint = JSON.stringify(filters)
  const resetInputs0 = [fingerprint] as const
  const [previousResetInputs0, setPreviousResetInputs0] = useState<typeof resetInputs0 | null>(null)
  if (previousResetInputs0 === null || previousResetInputs0[0] !== resetInputs0[0]) {
    setPreviousResetInputs0(resetInputs0)
    setPage(1);
  }
  const query = useOpportunityList({ ...filters, page, limit: pageSize })
  const rows = Array.isArray(query.data?.data) ? query.data.data : []

  const columns: DataTableColumn<Opportunity>[] = [
    { id: "opportunity", header: text.table.opportunity, cell: (item) => <span className="font-bold">{item.title}</span> },
    { id: "company", header: text.table.company, cell: opportunityCompanyName },
    { id: "stage", header: text.table.stage, cell: (item) => item.stage?.label || uiText.common.notAvailable },
    { id: "value", header: text.table.estimatedValue, cell: (item) => `${formatOpportunityValue(item.estimatedValue)} ${text.fields.valueUnit}`, className: "whitespace-nowrap" },
    { id: "probability", header: text.table.probability, cell: (item) => item.probability === null || item.probability === undefined ? uiText.common.notAvailable : `${item.probability.toLocaleString("fa-IR")}%` },
    { id: "priority", header: text.table.priority, cell: (item) => <span className="rounded-full bg-[var(--app-primary-soft)] px-2 py-1 text-xs font-bold text-[var(--app-primary)]">{priorityLabel(item.priority)}</span> },
    { id: "owner", header: text.table.owner, cell: (item) => item.owner?.fullName || text.fields.noOwner },
    { id: "close", header: text.table.closeDate, cell: (item) => formatOpportunityDate(item.expectedCloseDate), className: "whitespace-nowrap" },
    { id: "status", header: text.table.status, cell: (item) => <span className={item.archivedAt ? "text-[var(--app-text-secondary)]" : "text-[var(--success)]"}>{item.archivedAt ? text.status.archived : text.status.active}</span> },
    { id: "actions", header: text.fields.actions, headerClassName: "text-center", className: "text-center", cell: (item) => <OpportunityActionsMenu opportunity={item} permissions={permissions} onView={() => onView(item)} onEdit={() => onEdit(item)} onChangeOwner={() => onChangeOwner(item)} onChangeStage={() => onChangeStage(item)} onArchiveToggle={() => onArchiveToggle(item)} /> },
  ]

  if (query.isLoading) return <LoadingState />
  if (query.isError) return <ErrorState title={text.errors.listTitle} description={text.errors.listDescription} retryLabel={uiText.common.retry} onRetry={() => void query.refetch()} />

  return (
    <div className="grid gap-3">
      <DataTableShell rows={rows} columns={columns} getRowKey={(item) => item.id} onRowClick={onView} emptyState={<EmptyState icon={BriefcaseBusiness} title={text.empty.listTitle} description={text.empty.listDescription} />} />
      {query.data ? (
        <PaginationControls page={query.data.meta.page} pageCount={query.data.meta.totalPages} pageSize={pageSize} total={query.data.meta.total} onPageChange={setPage} onPageSizeChange={(value) => { setPageSize(value); setPage(1) }} disabled={query.isFetching} />
      ) : null}
    </div>
  )
}
