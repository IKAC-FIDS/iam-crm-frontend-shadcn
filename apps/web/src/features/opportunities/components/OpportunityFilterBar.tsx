import { DataTableToolbar } from "@/components/shared/DataTableToolbar"
import { Filter, SlidersHorizontal } from "lucide-react"

import {
  PersianDateRangePicker,
  type PersianDateRange,
} from "@/components/shared/PersianDateRangePicker"
import { uiText } from "@/config/uiText"
import { fromApiDate, toApiDate } from "@/lib/date/jalali"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover"
import { SearchableCompanySelect } from "@/features/people/components/SearchableCompanySelect"

import { useOpportunityCompanyPeople } from "../hooks/useOpportunities"
import type {
  OpportunityFilters,
  OpportunityOwnerOption,
  OpportunitySourceOption,
  OpportunityStage,
} from "../types/opportunity.types"

const selectClass =
  "h-11 w-full rounded-xl border border-input bg-transparent px-3 text-xs outline-none focus:border-[var(--app-primary)]"

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
  const dateRange: PersianDateRange = {
    from: fromApiDate(filters.expectedCloseFrom),
    to: fromApiDate(filters.expectedCloseTo),
  }
  const activeAdvanced = [
    filters.team,
    filters.ownerId,
    filters.stageId,
    filters.sourceOptionId,
    filters.primaryContactId,
    filters.archiveState !== "active",
  ].filter(Boolean).length

  return (
    <DataTableToolbar
      filtersClassName="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3"
      searchValue={filters.search ?? ""}
      onSearchChange={(search) => onChange({ search })}
      searchPlaceholder={text.filters.search}
      hasActiveFilters
      onClearFilters={onClear}
      filters={
        <>
          <div className="flex min-w-max rounded-xl border border-[var(--app-divider)] bg-[var(--app-background)] p-1">
            {(["all", "mine", "team"] as const).map((scope) => (
              <button
                key={scope}
                aria-pressed={filters.ownershipScope === scope}
                type="button"
                onClick={() => onChange({ ownershipScope: scope })}
                className={[
                  "rounded-lg px-3 py-2 text-xs font-bold transition",
                  filters.ownershipScope === scope
                    ? "bg-[var(--app-primary)] text-[var(--app-on-primary)] shadow-sm"
                    : "text-[var(--app-text-secondary)] hover:text-[var(--app-primary)]",
                ].join(" ")}
              >
                {scope === "all"
                  ? text.filters.all
                  : scope === "mine"
                    ? text.filters.mine
                    : text.filters.teamMine}
              </button>
            ))}
          </div>

          <SearchableCompanySelect
            value={filters.companyId}
            onChange={(companyId) =>
              onChange({ companyId, primaryContactId: undefined })
            }
          />

          <select
            aria-label={text.filters.priority}
            className={selectClass}
            value={filters.priority ?? ""}
            onChange={(event) =>
              onChange({
                priority: (event.target.value ||
                  undefined) as OpportunityFilters["priority"],
              })
            }
          >
            <option value="">
              {text.filters.priority}: {text.filters.allOptions}
            </option>
            <option value="STRATEGIC">{text.priorities.STRATEGIC}</option>
            <option value="HIGH">{text.priorities.HIGH}</option>
            <option value="MEDIUM">{text.priorities.MEDIUM}</option>
            <option value="LOW">{text.priorities.LOW}</option>
          </select>

          <PersianDateRangePicker
            value={dateRange}
            onChange={(range) =>
              onChange({
                expectedCloseFrom: toApiDate(range?.from) ?? undefined,
                expectedCloseTo: toApiDate(range?.to) ?? undefined,
              })
            }
            placeholder={text.filters.closeDate}
          />

          <Popover>
            <PopoverTrigger
              render={
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 rounded-xl"
                />
              }
            >
              <SlidersHorizontal className="size-4" />
              {text.filters.more}
              {activeAdvanced ? (
                <span className="rounded-full bg-[var(--app-primary-soft)] px-1.5 text-xs text-[var(--app-primary)]">
                  {activeAdvanced.toLocaleString("fa-IR")}
                </span>
              ) : null}
            </PopoverTrigger>
            <PopoverContent
              align="end"
              className="w-[min(680px,calc(100vw-24px))] rounded-2xl p-4"
              dir="rtl"
            >
              <div className="mb-4 flex items-center gap-2 text-sm font-bold text-[var(--app-heading)]">
                <Filter className="size-4 text-[var(--app-primary)]" />
                {text.filters.more}
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <select
                  aria-label={text.filters.all}
                  className={selectClass}
                  value={filters.ownershipScope}
                  onChange={(event) =>
                    onChange({
                      ownershipScope: event.target
                        .value as OpportunityFilters["ownershipScope"],
                    })
                  }
                >
                  <option value="all">{text.filters.all}</option>
                  <option value="mine">{text.filters.mine}</option>
                  <option value="team">{text.filters.teamMine}</option>
                  <option value="unassigned">{text.filters.unassigned}</option>
                </select>
                <Input
                  aria-label={text.filters.teamPlaceholder}
                  value={filters.team ?? ""}
                  onChange={(event) =>
                    onChange({ team: event.target.value || undefined })
                  }
                  placeholder={text.filters.teamPlaceholder}
                  className="h-11 rounded-xl"
                />
                <select
                  aria-label={text.filters.owner}
                  className={selectClass}
                  value={filters.ownerId ?? ""}
                  onChange={(event) =>
                    onChange({ ownerId: event.target.value || undefined })
                  }
                >
                  <option value="">
                    {text.filters.owner}: {text.filters.allOptions}
                  </option>
                  {owners.map((owner) => (
                    <option key={owner.id} value={owner.id}>
                      {owner.fullName}
                    </option>
                  ))}
                </select>
                <select
                  aria-label={text.filters.stage}
                  className={selectClass}
                  value={filters.stageId ?? ""}
                  onChange={(event) =>
                    onChange({ stageId: event.target.value || undefined })
                  }
                >
                  <option value="">
                    {text.filters.stage}: {text.filters.allOptions}
                  </option>
                  {stages.map((stage) => (
                    <option key={stage.id} value={stage.id}>
                      {stage.label}
                    </option>
                  ))}
                </select>
                <select
                  aria-label={text.filters.source}
                  className={selectClass}
                  value={filters.sourceOptionId ?? ""}
                  onChange={(event) =>
                    onChange({
                      sourceOptionId: event.target.value || undefined,
                    })
                  }
                >
                  <option value="">
                    {text.filters.source}: {text.filters.allOptions}
                  </option>
                  {sources.map((source) => (
                    <option key={source.id} value={source.id}>
                      {source.label}
                    </option>
                  ))}
                </select>
                <select
                  aria-label={text.filters.primaryContact}
                  className={selectClass}
                  disabled={
                    !filters.companyId || people.isLoading || people.isError
                  }
                  value={filters.primaryContactId ?? ""}
                  onChange={(event) =>
                    onChange({
                      primaryContactId: event.target.value || undefined,
                    })
                  }
                >
                  <option value="">
                    {text.filters.primaryContact}: {text.filters.allOptions}
                  </option>
                  {contacts.map((person) => (
                    <option key={person.id} value={person.id}>
                      {person.fullName}
                    </option>
                  ))}
                </select>
                <select
                  aria-label={text.filters.allArchive}
                  className={selectClass}
                  value={filters.archiveState}
                  onChange={(event) =>
                    onChange({
                      archiveState: event.target
                        .value as OpportunityFilters["archiveState"],
                    })
                  }
                >
                  <option value="active">{text.filters.active}</option>
                  <option value="all">{text.filters.allArchive}</option>
                  <option value="archived">{text.filters.archived}</option>
                </select>
              </div>
            </PopoverContent>
          </Popover>
        </>
      }
    />
  )
}
