import {
  Building2,
  Mail,
  Phone,
  Star,
  UserRound,
} from "lucide-react"

import { uiText } from "@/config/uiText"

import type { PersonDirectoryItem } from "../types/person.types"
import {
  personCompanyName,
  personJobTitle,
  personPersona,
} from "../utils/personFormatters"

export function PersonCard({
  person,
  onClick,
}: {
  person: PersonDirectoryItem
  onClick: () => void
}) {
  const text = uiText.people
  const company = personCompanyName(person)
  const jobTitle = personJobTitle(person)
  const persona = personPersona(person)

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
              {jobTitle || text.notSpecified}
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-2.5">
          <MetaRow
            icon={<Building2 className="size-3.5" />}
            value={company || text.notSpecified}
          />
          {person.department ? (
            <MetaRow
              icon={<span className="text-[10px] font-bold">D</span>}
              value={person.department}
            />
          ) : null}
          {persona ? (
            <div className="flex flex-wrap gap-1.5">
              <span className="rounded-full bg-[var(--app-primary-soft)] px-2.5 py-1 text-[10px] font-bold text-[var(--app-on-primary-container)]">
                {persona}
              </span>
              {person.seniorityLevel ? (
                <span className="rounded-full border border-[var(--app-divider)] bg-[var(--app-background)] px-2.5 py-1 text-[10px] text-[var(--app-text-secondary)]">
                  {person.seniorityLevel}
                </span>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="mt-5 flex min-h-8 flex-wrap items-center gap-2 border-t border-[var(--app-divider)] pt-4 text-[10px] text-[var(--app-text-secondary)]">
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
    <div className="flex min-w-0 items-center gap-2 text-[11px] text-[var(--app-text-secondary)]">
      <span className="grid size-6 shrink-0 place-items-center rounded-lg bg-[var(--app-background)] text-[var(--app-primary)]">
        {icon}
      </span>
      <span className="truncate">{value}</span>
    </div>
  )
}
