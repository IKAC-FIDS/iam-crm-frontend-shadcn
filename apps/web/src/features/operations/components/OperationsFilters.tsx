import { Button } from "@workspace/ui/components/button"
import { DataTableToolbar } from "@/components/shared/DataTableToolbar"
import { SearchableOptionSelect } from "@/components/shared/SearchableOptionSelect"
import type {
  OperationsAttentionState,
  OperationsOwnershipScope,
  OperationsPriority,
  CompanyEngagementStatus,
} from "../types/operations.types"

export type OperationsFilterState = {
  search: string
  priority?: OperationsPriority
  engagementStatus?: CompanyEngagementStatus
  pinnedOnly?: boolean
  includeInactivePortfolio?: boolean
  attentionState?: OperationsAttentionState
  hasUnreadMessages?: boolean
  hasActiveOpportunity?: boolean
  hasNoNextAction?: boolean
  ownershipScope: OperationsOwnershipScope
}

const quickFilters = [
  { id: "operational", label: "عملیاتی" },
  { id: "all", label: "کل سبد", includeInactivePortfolio: true },
  { id: "pinned", label: "مهم‌های من", pinnedOnly: true },
  { id: "today", label: "اقدام امروز", attentionState: "TODAY" },
  { id: "overdue", label: "عقب‌افتاده", attentionState: "OVERDUE" },
  { id: "unread", label: "پیام جدید", hasUnreadMessages: true },
  { id: "no-next", label: "بدون پیگیری", attentionState: "NO_NEXT_ACTION" },
  { id: "active", label: "فرصت فعال", hasActiveOpportunity: true },
] as const

function activeQuickFilter(filters: OperationsFilterState) {
  if (filters.pinnedOnly) return "pinned"
  if (filters.includeInactivePortfolio && !filters.engagementStatus)
    return "all"
  if (filters.attentionState === "TODAY") return "today"
  if (filters.attentionState === "OVERDUE") return "overdue"
  if (filters.attentionState === "NO_NEXT_ACTION") return "no-next"
  if (filters.hasUnreadMessages) return "unread"
  if (filters.hasActiveOpportunity) return "active"
  return "operational"
}

export function OperationsFilters({
  filters,
  onPatch,
  onClear,
}: {
  filters: OperationsFilterState
  onPatch: (patch: Partial<OperationsFilterState>) => void
  onClear: () => void
}) {
  const active = activeQuickFilter(filters)
  const filtered = Boolean(
    filters.search ||
    filters.priority ||
    filters.engagementStatus ||
    filters.pinnedOnly ||
    filters.includeInactivePortfolio ||
    filters.attentionState ||
    filters.hasUnreadMessages ||
    filters.hasActiveOpportunity ||
    filters.hasNoNextAction ||
    filters.ownershipScope !== "mine"
  )
  return (
    <DataTableToolbar
      searchValue={filters.search}
      onSearchChange={(search) => onPatch({ search })}
      searchPlaceholder="جست‌وجوی نام یا شناسه شرکت..."
      hasActiveFilters={filtered}
      onClearFilters={onClear}
      quickFilters={quickFilters.map((item) => (
        <Button
          key={item.id}
          type="button"
          size="sm"
          variant={active === item.id ? "default" : "outline"}
          aria-pressed={active === item.id}
          className="shrink-0 rounded-xl"
          onClick={() =>
            onPatch({
              engagementStatus: undefined,
              attentionState:
                "attentionState" in item ? item.attentionState : undefined,
              hasUnreadMessages:
                "hasUnreadMessages" in item
                  ? item.hasUnreadMessages
                  : undefined,
              hasActiveOpportunity:
                "hasActiveOpportunity" in item
                  ? item.hasActiveOpportunity
                  : undefined,
              hasNoNextAction: undefined,
              pinnedOnly: "pinnedOnly" in item ? item.pinnedOnly : undefined,
              includeInactivePortfolio:
                "includeInactivePortfolio" in item
                  ? item.includeInactivePortfolio
                  : undefined,
            })
          }
        >
          {item.label}
        </Button>
      ))}
      filtersClassName="grid grid-cols-1 sm:grid-cols-3"
      filters={
        <>
          <SearchableOptionSelect
            ariaLabel="اولویت شرکت"
            value={filters.priority ?? ""}
            options={[
              { id: "STRATEGIC", label: "راهبردی" },
              { id: "HIGH", label: "زیاد" },
              { id: "MEDIUM", label: "متوسط" },
              { id: "LOW", label: "کم" },
            ]}
            search=""
            onSearchChange={() => undefined}
            onChange={(value) =>
              onPatch({
                priority: (value || undefined) as
                  OperationsPriority | undefined,
              })
            }
            placeholder="همه اولویت‌ها"
            searchable={false}
          />
          <SearchableOptionSelect
            ariaLabel="وضعیت سبد فروش"
            value={filters.engagementStatus ?? ""}
            options={[
              { id: "ACTIVE", label: "فعال" },
              { id: "NEEDS_ACTION", label: "نیازمند اقدام" },
              { id: "NURTURE", label: "پرورش" },
              { id: "SNOOZED", label: "پیگیری در آینده" },
              { id: "DORMANT", label: "راکد" },
              { id: "DISQUALIFIED", label: "نامناسب" },
            ]}
            search=""
            onSearchChange={() => undefined}
            onChange={(value) =>
              onPatch({
                engagementStatus: (value || undefined) as
                  CompanyEngagementStatus | undefined,
                includeInactivePortfolio: Boolean(value) || undefined,
              })
            }
            placeholder="همه وضعیت‌های سبد فروش"
            searchable={false}
          />
          <SearchableOptionSelect
            ariaLabel="محدوده مالکیت"
            value={filters.ownershipScope}
            options={[
              { id: "mine", label: "شرکت‌های من" },
              { id: "team", label: "شرکت‌های تیم" },
              { id: "all", label: "همه شرکت‌ها" },
              { id: "unassigned", label: "بدون مالک" },
            ]}
            search=""
            onSearchChange={() => undefined}
            onChange={(value) =>
              onPatch({
                ownershipScope: (value || "mine") as OperationsOwnershipScope,
              })
            }
            searchable={false}
            allowEmpty={false}
          />
        </>
      }
    />
  )
}
