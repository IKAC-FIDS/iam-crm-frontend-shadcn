import {
  EntityCardList,
  type EntityCardField,
} from "@/components/shared/EntityCardList"
import { EmptyState } from "@/components/shared/EmptyState"
import { IdentityAvatar } from "@/components/shared/IdentityAvatar"
import { PaginationControls } from "@/components/shared/PaginationControls"
import { QueryContent } from "@/components/shared/QueryContent"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { uiText } from "@/config/uiText"
import { canViewFinancials } from "@/lib/permissions"
import { useListQueryState } from "@/lib/listQuery"
import { useAuthStore } from "@/store/authStore"
import {
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  CircleDollarSign,
  Percent,
  UserRound,
} from "lucide-react"

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

  const fields: EntityCardField<Opportunity>[] = [
    {
      id: "owner",
      label: text.table.owner,
      icon: UserRound,
      render: (item) =>
        item.owner ? (
          <span className="flex min-w-0 items-center gap-2">
            <IdentityAvatar
              name={item.owner.fullName}
              className="size-7 rounded-lg text-xs"
            />
            <span className="truncate">{item.owner.fullName}</span>
          </span>
        ) : (
          text.fields.noOwner
        ),
    },
    ...(financialVisible
      ? [
          {
            id: "value",
            label: text.table.estimatedValue,
            icon: CircleDollarSign,
            render: (item: Opportunity) =>
              `${formatOpportunityValue(item.estimatedValue)} ${text.fields.valueUnit}`,
          } satisfies EntityCardField<Opportunity>,
        ]
      : []),
    {
      id: "probability",
      label: text.table.probability,
      icon: Percent,
      render: (item) =>
        item.probability === null || item.probability === undefined
          ? uiText.common.notAvailable
          : `${item.probability.toLocaleString("fa-IR")}%`,
    },
    {
      id: "close",
      label: text.table.closeDate,
      icon: CalendarDays,
      priority: "secondary",
      render: (item) => formatOpportunityDate(item.expectedCloseDate),
    },
  ]

  return (
    <QueryContent query={query} errorTitle={text.errors.listTitle}>
      <div className="grid gap-3">
        <EntityCardList
          rows={rows}
          fields={fields}
          getRowKey={(item) => item.id}
          layout="row"
          density="compact"
          fieldsClassName="sm:grid-cols-2 xl:grid-cols-4"
          title={(item) => item.title}
          subtitle={opportunityCompanyName}
          media={(item) => (
            <IdentityAvatar
              name={opportunityCompanyName(item)}
              fallbackIcon={<Building2 className="size-5" />}
              className="size-12 rounded-2xl text-sm"
            />
          )}
          badges={(item) => (
            <StatusBadge tone={item.archivedAt ? "warning" : "success"}>
              {item.archivedAt ? text.status.archived : text.status.active}
            </StatusBadge>
          )}
          tags={(item) => (
            <>
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
                dot={false}
              >
                {priorityLabel(item.priority)}
              </StatusBadge>
              <StatusBadge tone="neutral" dot={false}>
                {item.stage?.label || uiText.common.notAvailable}
              </StatusBadge>
            </>
          )}
          onRowClick={onView}
          actions={(item) => (
            <OpportunityActionsMenu
              opportunity={item}
              permissions={permissions}
              presentation="buttons"
              onView={() => onView(item)}
              onEdit={() => onEdit(item)}
              onChangeOwner={() => onChangeOwner(item)}
              onChangeStage={() => onChangeStage(item)}
              onArchiveToggle={() => onArchiveToggle(item)}
            />
          )}
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
