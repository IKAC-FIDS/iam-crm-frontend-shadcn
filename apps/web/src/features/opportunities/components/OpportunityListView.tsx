import { EntityTableCell } from "@/components/shared/EntityTableCell"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { BriefcaseBusiness } from "lucide-react"
import { useListQueryState } from "@/lib/listQuery"

import {
  DataTableShell,
  type DataTableColumn,
} from "@/components/shared/DataTableShell"
import { EmptyState } from "@/components/shared/EmptyState"
import { QueryContent } from "@/components/shared/QueryContent"
import { uiText } from "@/config/uiText"
import { PaginationControls } from "@/components/shared/PaginationControls"
import { useAuthStore } from "@/store/authStore"
import { canViewFinancials } from "@/lib/permissions"

import { useOpportunityList } from "../hooks/useOpportunities"
import type {
  Opportunity,
  OpportunityFilters,
} from "../types/opportunity.types"
import {
  formatOpportunityDate,
  formatOpportunityValue,
  opportunityCompanyName,
  priorityLabel,
} from "../utils/opportunityFormatters"
import {
  OpportunityActionsMenu,
  type OpportunityActionPermissions,
} from "./OpportunityActionsMenu"

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

  const columns: DataTableColumn<Opportunity>[] = [
    {
      id: "opportunity",
      header: text.table.opportunity,
      cell: (item) => (
        <EntityTableCell
          title={item.title}
          avatar={<BriefcaseBusiness className="size-5" />}
        />
      ),
    },
    { id: "company", header: text.table.company, cell: opportunityCompanyName },
    {
      id: "stage",
      header: text.table.stage,
      cell: (item) => item.stage?.label || uiText.common.notAvailable,
    },
    ...(financialVisible ? [{
      id: "value",
      header: text.table.estimatedValue,
      cell: (item) =>
        `${formatOpportunityValue(item.estimatedValue)} ${text.fields.valueUnit}`,
      className: "whitespace-nowrap",
    } satisfies DataTableColumn<Opportunity>] : []),
    {
      id: "probability",
      header: text.table.probability,
      cell: (item) =>
        item.probability === null || item.probability === undefined
          ? uiText.common.notAvailable
          : `${item.probability.toLocaleString("fa-IR")}%`,
    },
    {
      id: "priority",
      header: text.table.priority,
      cell: (item) => (
        <StatusBadge
          tone={
            item.priority === "STRATEGIC"
              ? "primary"
              : item.priority === "HIGH"
                ? "warning"
                : item.priority === "MEDIUM"
                  ? "info"
                  : "neutral"
          }
        >
          {priorityLabel(item.priority)}
        </StatusBadge>
      ),
    },
    {
      id: "owner",
      header: text.table.owner,
      cell: (item) => item.owner?.fullName || text.fields.noOwner,
    },
    {
      id: "close",
      header: text.table.closeDate,
      cell: (item) => formatOpportunityDate(item.expectedCloseDate),
      className: "whitespace-nowrap",
    },
    {
      id: "status",
      header: text.table.status,
      cell: (item) => (
        <StatusBadge tone={item.archivedAt ? "warning" : "success"}>
          {item.archivedAt ? text.status.archived : text.status.active}
        </StatusBadge>
      ),
    },
    {
      id: "actions",
      header: text.fields.actions,
      headerClassName: "w-28 text-end",
      cell: (item) => (
        <OpportunityActionsMenu
          opportunity={item}
          permissions={permissions}
          onView={() => onView(item)}
          onEdit={() => onEdit(item)}
          onChangeOwner={() => onChangeOwner(item)}
          onChangeStage={() => onChangeStage(item)}
          onArchiveToggle={() => onArchiveToggle(item)}
        />
      ),
    },
  ]

  return (
    <QueryContent query={query} errorTitle={text.errors.listTitle}>
      <div className="grid gap-3">
        <DataTableShell
          entityRows
          rows={rows}
          columns={columns}
          getRowKey={(item) => item.id}
          onRowClick={onView}
          mobile={{
            title: (item) => item.title,
            subtitle: opportunityCompanyName,
            avatar: () => <BriefcaseBusiness className="size-5" />,
            status: (item) => <StatusBadge tone={item.archivedAt ? "warning" : "success"}>{item.archivedAt ? text.status.archived : text.status.active}</StatusBadge>,
            fields: [
              { id: "stage", label: text.table.stage, render: (item) => item.stage?.label || uiText.common.notAvailable },
              { id: "owner", label: text.table.owner, render: (item) => item.owner?.fullName || text.fields.noOwner },
              ...(financialVisible ? [{ id: "value", label: text.table.estimatedValue, render: (item: Opportunity) => `${formatOpportunityValue(item.estimatedValue)} ${text.fields.valueUnit}` }] : []),
              { id: "close", label: text.table.closeDate, render: (item) => formatOpportunityDate(item.expectedCloseDate) },
            ],
          }}
          emptyState={
            <EmptyState
              icon={BriefcaseBusiness}
              title={text.empty.listTitle}
              description={text.empty.listDescription}
            />
          }
        />
        {query.data ? (
          <PaginationControls
            page={query.data.meta.page}
            pageCount={query.data.meta.totalPages}
            pageSize={pageSize}
            total={query.data.meta.total}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            disabled={query.isFetching || isUpdatingFilters}
          />
        ) : null}
      </div>
    </QueryContent>
  )
}
