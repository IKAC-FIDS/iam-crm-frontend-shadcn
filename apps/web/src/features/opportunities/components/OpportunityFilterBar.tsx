import { AdvancedFilterPopover } from "@/components/shared/AdvancedFilterPopover"
import { DataTableToolbar } from "@/components/shared/DataTableToolbar"
import {
  PersianDateRangePicker,
  type PersianDateRangePickerProps,
} from "@/components/shared/date"
import { SearchableOptionSelect } from "@/components/shared/SearchableOptionSelect"
import { uiText } from "@/config/uiText"
import { SearchableCompanySelect } from "@/features/people/components/SearchableCompanySelect"
import { fromApiDate, toApiDate } from "@/lib/date/jalali"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"

import { useOpportunityCompanyPeople } from "../hooks/useOpportunities"
import type {
  OpportunityFilters,
  OpportunityOwnerOption,
  OpportunitySourceOption,
  OpportunityStage,
} from "../types/opportunity.types"

export function OpportunityFilterBar({
  filters,
  stages,
  owners,
  sources,
  onChange,
  onClear,
}: {
  filters: OpportunityFilters
  stages: OpportunityStage[]
  owners: OpportunityOwnerOption[]
  sources: OpportunitySourceOption[]
  onChange: (patch: Partial<OpportunityFilters>) => void
  onClear: () => void
}) {
  const text = uiText.opportunities
  const people = useOpportunityCompanyPeople(filters.companyId)
  const contacts = Array.isArray(people.data) ? people.data : []
  const dateRange: PersianDateRangePickerProps["value"] = {
    from: fromApiDate(filters.expectedCloseFrom),
    to: fromApiDate(filters.expectedCloseTo),
  }
  const advancedCount = [
    filters.team,
    filters.ownerId,
    filters.stageId,
    filters.sourceOptionId,
    filters.primaryContactId,
    filters.archiveState !== "active" ? filters.archiveState : undefined,
  ].filter(Boolean).length
  const hasActiveFilters =
    Boolean(filters.search) ||
    filters.ownershipScope !== "all" ||
    Boolean(filters.companyId) ||
    Boolean(filters.priority) ||
    Boolean(filters.expectedCloseFrom) ||
    Boolean(filters.expectedCloseTo) ||
    advancedCount > 0

  function clearAdvanced() {
    onChange({
      team: undefined,
      ownerId: undefined,
      stageId: undefined,
      sourceOptionId: undefined,
      primaryContactId: undefined,
      archiveState: "active",
    })
  }

  return (
    <DataTableToolbar
      filtersClassName="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4"
      searchValue={filters.search ?? ""}
      onSearchChange={(search) => onChange({ search })}
      searchPlaceholder={text.filters.search}
      hasActiveFilters={hasActiveFilters}
      onClearFilters={onClear}
      quickFilters={(["all", "mine", "team", "unassigned"] as const).map(
        (scope) => (
          <Button
            key={scope}
            type="button"
            size="sm"
            variant={filters.ownershipScope === scope ? "default" : "outline"}
            aria-pressed={filters.ownershipScope === scope}
            className="shrink-0 rounded-xl"
            onClick={() => onChange({ ownershipScope: scope })}
          >
            {scope === "all"
              ? text.filters.all
              : scope === "mine"
                ? text.filters.mine
                : scope === "team"
                  ? text.filters.teamMine
                  : text.filters.unassigned}
          </Button>
        )
      )}
      filters={
        <>
          <SearchableCompanySelect
            value={filters.companyId}
            onChange={(companyId) =>
              onChange({ companyId, primaryContactId: undefined })
            }
          />

          <StaticSelect
            ariaLabel={text.filters.priority}
            value={filters.priority}
            placeholder={`${text.filters.priority}: ${text.filters.allOptions}`}
            options={[
              { id: "STRATEGIC", label: text.priorities.STRATEGIC },
              { id: "HIGH", label: text.priorities.HIGH },
              { id: "MEDIUM", label: text.priorities.MEDIUM },
              { id: "LOW", label: text.priorities.LOW },
            ]}
            onChange={(priority) =>
              onChange({
                priority: priority as OpportunityFilters["priority"],
              })
            }
          />

          <PersianDateRangePicker
            value={dateRange}
            onChange={(range) =>
              onChange({
                expectedCloseFrom: toApiDate(range?.from) ?? undefined,
                expectedCloseTo: toApiDate(range?.to) ?? undefined,
              })
            }
          />

          <AdvancedFilterPopover
            activeCount={advancedCount}
            label={text.filters.more}
            title={text.filters.more}
            description="مرحله، مالک، منبع، مخاطب اصلی و وضعیت بایگانی را دقیق‌تر کنید."
            onClear={clearAdvanced}
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                aria-label={text.filters.teamPlaceholder}
                value={filters.team ?? ""}
                onChange={(event) =>
                  onChange({ team: event.target.value || undefined })
                }
                placeholder={text.filters.teamPlaceholder}
                className="h-11 rounded-xl"
              />
              <StaticSelect
                ariaLabel={text.filters.owner}
                value={filters.ownerId}
                placeholder={`${text.filters.owner}: ${text.filters.allOptions}`}
                options={owners.map((owner) => ({
                  id: owner.id,
                  label: owner.fullName,
                  secondary: owner.email || undefined,
                }))}
                onChange={(ownerId) => onChange({ ownerId })}
              />
              <StaticSelect
                ariaLabel={text.filters.stage}
                value={filters.stageId}
                placeholder={`${text.filters.stage}: ${text.filters.allOptions}`}
                options={stages.map((stage) => ({
                  id: stage.id,
                  label: stage.label,
                }))}
                onChange={(stageId) => onChange({ stageId })}
              />
              <StaticSelect
                ariaLabel={text.filters.source}
                value={filters.sourceOptionId}
                placeholder={`${text.filters.source}: ${text.filters.allOptions}`}
                options={sources.map((source) => ({
                  id: source.id,
                  label: source.label,
                }))}
                onChange={(sourceOptionId) => onChange({ sourceOptionId })}
              />
              <SearchableOptionSelect
                ariaLabel={text.filters.primaryContact}
                value={filters.primaryContactId}
                options={contacts.map((person) => ({
                  id: person.id,
                  label: person.fullName,
                }))}
                search=""
                onSearchChange={() => undefined}
                onChange={(primaryContactId) => onChange({ primaryContactId })}
                placeholder={`${text.filters.primaryContact}: ${text.filters.allOptions}`}
                searchable={false}
                disabled={
                  !filters.companyId || people.isLoading || people.isError
                }
              />
              <StaticSelect
                ariaLabel={text.filters.allArchive}
                value={filters.archiveState}
                placeholder={text.filters.active}
                allowEmpty={false}
                options={[
                  { id: "active", label: text.filters.active },
                  { id: "all", label: text.filters.allArchive },
                  { id: "archived", label: text.filters.archived },
                ]}
                onChange={(archiveState) =>
                  onChange({
                    archiveState:
                      archiveState as OpportunityFilters["archiveState"],
                  })
                }
              />
            </div>
          </AdvancedFilterPopover>
        </>
      }
    />
  )
}

function StaticSelect({
  ariaLabel,
  value,
  placeholder,
  options,
  allowEmpty = true,
  onChange,
}: {
  ariaLabel: string
  value?: string
  placeholder: string
  options: Array<{ id: string; label: string; secondary?: string }>
  allowEmpty?: boolean
  onChange: (value?: string) => void
}) {
  return (
    <SearchableOptionSelect
      ariaLabel={ariaLabel}
      value={value}
      options={options}
      search=""
      onSearchChange={() => undefined}
      onChange={onChange}
      placeholder={placeholder}
      searchable={false}
      allowEmpty={allowEmpty}
    />
  )
}
