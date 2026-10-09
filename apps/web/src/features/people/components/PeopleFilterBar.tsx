import { DataTableToolbar } from "@/components/shared/DataTableToolbar"
import { AdvancedFilterPopover } from "@/components/shared/AdvancedFilterPopover"
import { Filter } from "lucide-react"

import { uiText } from "@/config/uiText"

import type {
  LookupOption,
  PeopleDirectoryQuery,
  PeopleLookupSet,
} from "../types/person.types"
import { SearchableCompanySelect } from "./SearchableCompanySelect"

type BooleanFilter = "all" | "true" | "false"

function booleanToSelect(value?: boolean): BooleanFilter {
  if (value === undefined) return "all"
  return value ? "true" : "false"
}

function selectToBoolean(value: string) {
  if (value === "all") return undefined
  return value === "true"
}

export function PeopleFilterBar({
  query,
  lookups,
  onChange,
  onClear,
}: {
  query: PeopleDirectoryQuery
  lookups: PeopleLookupSet
  onChange: (patch: Partial<PeopleDirectoryQuery>) => void
  onClear: () => void
}) {
  const text = uiText.people
  const hasAdvanced =
    Boolean(query.department) ||
    Boolean(query.jobTitle) ||
    Boolean(query.personaRole) ||
    Boolean(query.seniorityLevel) ||
    query.isPrimaryContact !== undefined
  const advancedCount = [
    query.department,
    query.jobTitle,
    query.personaRole,
    query.seniorityLevel,
    query.isPrimaryContact,
  ].filter((value) => value !== undefined && value !== "").length

  function clearAdvanced() {
    onChange({
      department: undefined,
      jobTitle: undefined,
      personaRole: undefined,
      seniorityLevel: undefined,
      isPrimaryContact: undefined,
      page: 1,
    })
  }

  return (
    <DataTableToolbar
      searchValue={query.search ?? ""}
      onSearchChange={(search) => onChange({ search, page: 1 })}
      searchPlaceholder={text.filters.searchPlaceholder}
      hasActiveFilters={
        hasAdvanced ||
        Boolean(query.search) ||
        Boolean(query.companyId) ||
        query.hasEmail === true ||
        query.hasPhone === true
      }
      onClearFilters={onClear}
      filtersClassName="grid grid-cols-1 sm:grid-cols-2"
      filters={
        <>
          <SearchableCompanySelect
            value={query.companyId}
            onChange={(companyId) => onChange({ companyId, page: 1 })}
            placeholder={text.filters.allCompanies}
          />

          <AdvancedFilterPopover
            activeCount={advancedCount}
            label="فیلترهای تکمیلی"
            title="فیلترهای تکمیلی افراد"
            description="سمت، دپارتمان، نقش خرید و سطح ارشدیت را ترکیب کنید."
            onClear={clearAdvanced}
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <LookupSelect
                value={query.jobTitle}
                options={lookups.jobTitles}
                placeholder={text.filters.allJobTitles}
                onChange={(jobTitle) => onChange({ jobTitle, page: 1 })}
              />

              <LookupSelect
                value={query.department}
                options={lookups.departments}
                placeholder={text.filters.allDepartments}
                onChange={(department) => onChange({ department, page: 1 })}
              />

              <NativeSelect
                value={booleanToSelect(query.isPrimaryContact)}
                onChange={(value) =>
                  onChange({
                    isPrimaryContact: selectToBoolean(value),
                    page: 1,
                  })
                }
              >
                <option value="all">{text.filters.allContactRoles}</option>
                <option value="true">{text.contactRole.primary}</option>
                <option value="false">{text.filters.notPrimary}</option>
              </NativeSelect>
              <LookupSelect
                value={query.personaRole}
                options={lookups.personaRoles}
                placeholder={text.filters.allPersonaRoles}
                onChange={(personaRole) => onChange({ personaRole, page: 1 })}
              />

              <LookupSelect
                value={query.seniorityLevel}
                options={lookups.seniorityLevels}
                placeholder={text.filters.allSeniorityLevels}
                onChange={(seniorityLevel) =>
                  onChange({ seniorityLevel, page: 1 })
                }
              />
            </div>
          </AdvancedFilterPopover>
        </>
      }
      quickFilters={
        <div className="flex min-w-max items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--app-text-secondary)]">
            <Filter className="size-3.5" />
            {text.filters.quickFilters}
          </span>

          <FilterPill
            active={query.hasPhone === true}
            onClick={() =>
              onChange({
                hasPhone: query.hasPhone === true ? undefined : true,
                page: 1,
              })
            }
          >
            {text.filters.hasPhone}
          </FilterPill>

          <FilterPill
            active={query.hasEmail === true}
            onClick={() =>
              onChange({
                hasEmail: query.hasEmail === true ? undefined : true,
                page: 1,
              })
            }
          >
            {text.filters.hasEmail}
          </FilterPill>
        </div>
      }
    />
  )
}

function LookupSelect({
  value,
  options,
  placeholder,
  onChange,
}: {
  value?: string
  options: LookupOption[]
  placeholder: string
  onChange: (value?: string) => void
}) {
  const safeOptions = Array.isArray(options) ? options : []
  return (
    <NativeSelect
      value={value ?? ""}
      onChange={(next) => onChange(next || undefined)}
    >
      <option value="">{placeholder}</option>
      {safeOptions.map((option) => (
        <option key={option.id} value={option.code}>
          {option.label}
        </option>
      ))}
    </NativeSelect>
  )
}

function NativeSelect({
  children,
  value,
  onChange,
}: {
  children: React.ReactNode
  value: string
  onChange: (value: string) => void
}) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-11 min-w-40 rounded-xl border border-input bg-background px-3 text-xs text-foreground outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
    >
      {children}
    </select>
  )
}

function FilterPill({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={[
        "rounded-full border px-3 py-1.5 text-xs font-bold transition-colors",
        active
          ? "border-[var(--app-primary)] bg-[var(--app-primary-soft)] text-[var(--app-on-primary-container)]"
          : "border-[var(--app-divider)] bg-[var(--app-background)] text-[var(--app-text-secondary)] hover:text-[var(--app-heading)]",
      ].join(" ")}
    >
      {children}
    </button>
  )
}
