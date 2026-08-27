import {
  Building2,
  Mail,
  Phone,
  Star,
  UserRound,
} from "lucide-react"

import { uiText } from "@/config/uiText"

import type {
  PeopleLookupSet,
  PersonDirectoryItem,
} from "../types/person.types"
import {
  personCompanyName,
  personDisplayValues,
} from "../utils/personFormatters"

export function PersonCard({
  person,
  lookups,
  onClick,
}: {
  person: PersonDirectoryItem
  lookups: PeopleLookupSet
  onClick: () => void
}) {
  const text = uiText.people
  const company = personCompanyName(person)
  const display = personDisplayValues(person, lookups)

  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative min-h-[220px] overflow-hidden rounded-[26px] border border-[var(--app-divider)] bg-[var(--app-surface)] p-5 text-start shadow-[var(--app-shadow-card)] transition-all duration-200 hover:-translate-y-1 hover:border-[var(--app-primary)]/25 hover:shadow-lg"
    >
      <div className="pointer-events-none absolute -end-12 -top-12 size-32 rounded-full bg-[var(--app-primary-soft)]/70 blur-2xl transition-transform duration-300 group-hover:scale-125" />
      <div className="relative">
        <div className="flex items-start gap-3">
          <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[var(--app-primary-soft)] text-[var(--app-primary)]">
            <UserRound className="size-5" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="truncate text-sm font-bold text-[var(--app-heading)]">
                {person.fullName}
              </h3>
              {person.isPrimaryContact ? (
                <span
                  title={text.contactRole.primary}
                  className="grid size-6 shrink-0 place-items-center rounded-full bg-[var(--app-primary-soft)] text-[var(--app-primary)]"
                >
                  <Star className="size-3.5 fill-current" />
                </span>
              ) : person.isSecondaryContact ? (
                <span
                  title={text.contactRole.secondary}
                  className="grid size-6 shrink-0 place-items-center rounded-full border border-[var(--app-outline)] text-[var(--app-primary-alt)]"
                >
                  <Star className="size-3.5" />
                </span>
              ) : null}
            </div>
            <p className="mt-1 truncate text-xs text-[var(--app-text-secondary)]">
              {display.jobTitle || text.notSpecified}
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-2.5">
          <MetaRow
            icon={<Building2 className="size-3.5" />}
            value={company || text.notSpecified}
          />

          {display.department ? (
            <MetaRow
              icon={<span className="text-xs font-bold">D</span>}
              value={display.department}
            />
          ) : null}

          {display.personaRole || display.seniorityLevel ? (
            <div className="flex flex-wrap gap-1.5">
              {display.personaRole ? (
                <span className="rounded-full bg-[var(--app-primary-soft)] px-2.5 py-1 text-xs font-bold text-[var(--app-on-primary-container)]">
                  {display.personaRole}
                </span>
              ) : null}
              {display.seniorityLevel ? (
                <span className="rounded-full border border-[var(--app-divider)] bg-[var(--app-background)] px-2.5 py-1 text-xs text-[var(--app-text-secondary)]">
                  {display.seniorityLevel}
                </span>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="mt-5 flex min-h-8 flex-wrap items-center gap-2 border-t border-[var(--app-divider)] pt-4 text-xs text-[var(--app-text-secondary)]">
          {person.phoneSummary || person.phone ? (
            <span className="inline-flex max-w-full items-center gap-1.5 truncate">
              <Phone className="size-3.5 text-[var(--app-primary)]" />
              <span dir="ltr">{person.phoneSummary || person.phone}</span>
            </span>
          ) : null}
          {person.emailSummary || person.email ? (
            <span className="inline-flex max-w-full items-center gap-1.5 truncate">
              <Mail className="size-3.5 text-[var(--app-primary)]" />
              <span dir="ltr" className="truncate">
                {person.emailSummary || person.email}
              </span>
            </span>
          ) : null}
        </div>
      </div>
    </button>
  )
}

function MetaRow({
  icon,
  value,
}: {
  icon: React.ReactNode
  value: string
}) {
  return (
    <div className="flex min-w-0 items-center gap-2 text-xs text-[var(--app-text-secondary)]">
      <span className="grid size-6 shrink-0 place-items-center rounded-lg bg-[var(--app-background)] text-[var(--app-primary)]">
        {icon}
      </span>
      <span className="truncate">{value}</span>
    </div>
  )
}
