import { Filter, Search, X } from "lucide-react"

import { uiText } from "@/config/uiText"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"

import type {
  CompanyOption,
  PeopleDirectoryQuery,
} from "../types/person.types"

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
  companies,
  onChange,
  onClear,
}: {
  query: PeopleDirectoryQuery
  companies: CompanyOption[]
  onChange: (patch: Partial<PeopleDirectoryQuery>) => void
  onClear: () => void
}) {
  const text = uiText.people
  const hasAdvanced =
    Boolean(query.companyId) ||
    Boolean(query.department) ||
    Boolean(query.jobTitle) ||
    Boolean(query.personaRole) ||
    Boolean(query.seniorityLevel) ||
    query.isPrimaryContact !== undefined ||
    query.hasEmail !== undefined ||
    query.hasPhone !== undefined

  return (
    <section className="rounded-[26px] border border-[var(--app-divider)] bg-[var(--app-surface)] p-4 shadow-[var(--app-shadow-card)] sm:p-5">
      <div className="flex flex-col gap-3 xl:flex-row">
        <div className="relative min-w-0 flex-1">
          <Search className="absolute end-3 top-1/2 size-4 -translate-y-1/2 text-[var(--app-icon-muted)]" />
          <Input
            value={query.search ?? ""}
            onChange={(event) =>
              onChange({ search: event.target.value, page: 1 })
            }
            placeholder={text.filters.searchPlaceholder}
            className="h-11 rounded-xl pe-10"
          />
        </div>

        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
          <NativeSelect
            value={query.companyId ?? ""}
            onChange={(value) =>
              onChange({ companyId: value || undefined, page: 1 })
            }
          >
            <option value="">{text.filters.allCompanies}</option>
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.brandName || company.legalName}
              </option>
            ))}
          </NativeSelect>

          <Input
            value={query.jobTitle ?? ""}
            onChange={(event) =>
              onChange({ jobTitle: event.target.value || undefined, page: 1 })
            }
            placeholder={text.filters.jobTitle}
            className="h-11 rounded-xl"
          />

          <Input
            value={query.department ?? ""}
            onChange={(event) =>
              onChange({
                department: event.target.value || undefined,
                page: 1,
              })
            }
            placeholder={text.filters.department}
            className="h-11 rounded-xl"
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
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-[var(--app-divider)] pt-3">
        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-[var(--app-text-secondary)]">
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

        {hasAdvanced || query.search ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="me-auto rounded-xl text-xs"
            onClick={onClear}
          >
            <X className="size-3.5" />
            {uiText.common.table.clearFilters}
          </Button>
        ) : null}
      </div>
    </section>
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
      onClick={onClick}
      className={[
        "rounded-full border px-3 py-1.5 text-[10px] font-bold transition-colors",
        active
          ? "border-[var(--app-primary)] bg-[var(--app-primary-soft)] text-[var(--app-on-primary-container)]"
          : "border-[var(--app-divider)] bg-[var(--app-background)] text-[var(--app-text-secondary)] hover:text-[var(--app-heading)]",
      ].join(" ")}
    >
      {children}
    </button>
  )
}
