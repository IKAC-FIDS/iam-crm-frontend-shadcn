import { EntityCard, type EntityBadgeDescriptor, type EntityMetadataDescriptor } from "@/components/shared/EntityCard"
import type { EntityAction } from "@/components/shared/EntityRowActions"
import { EmptyState } from "@/components/shared/EmptyState"
import { IdentityAvatar } from "@/components/shared/IdentityAvatar"
import { uiText } from "@/config/uiText"
import { Building2, CalendarDays, ContactRound, Eye, Mail, Phone, Star, UsersRound } from "lucide-react"

import type { PeopleLookupSet, PersonDirectoryItem } from "../types/person.types"
import { formatPersonDate, personCompanyName, personDisplayValues } from "../utils/personFormatters"

export function PersonCardList({ people, lookups, canViewPerson, onOpen }: {
  people: PersonDirectoryItem[]
  lookups: PeopleLookupSet
  canViewPerson: boolean
  onOpen: (person: PersonDirectoryItem) => void
}) {
  const text = uiText.people

  if (!people.length) {
    return <EmptyState icon={UsersRound} title={text.empty.listTitle} description={text.empty.listDescription} />
  }

  return (
    <div className="grid gap-2.5">
      {people.map((person) => {
        const display = personDisplayValues(person, lookups)
        const companyName = personCompanyName(person)
        const phone = person.phoneSummary || person.phone
        const email = person.emailSummary || person.email
        const badges: EntityBadgeDescriptor[] = []

        if (person.isPrimaryContact) {
          badges.push({ id: "contact-role", label: text.contactRole.primary, tone: "primary", icon: Star })
        } else if (person.isSecondaryContact) {
          badges.push({ id: "contact-role", label: text.contactRole.secondary, tone: "neutral", icon: Star })
        }
        if (display.personaRole) badges.push({ id: "persona", label: display.personaRole, tone: "info" })
        if (display.seniorityLevel) badges.push({ id: "seniority", label: display.seniorityLevel, tone: "secondary" })

        const metadata: EntityMetadataDescriptor[] = [
          { id: "department", label: text.fields.department, value: display.department || text.notSpecified, icon: UsersRound },
          { id: "phone", label: text.fields.phone, value: phone ? <span dir="ltr">{phone}</span> : text.notSpecified, icon: Phone },
          { id: "email", label: text.fields.email, value: email ? <span dir="ltr">{email}</span> : text.notSpecified, icon: Mail },
        ]
        if (person.updatedAt) metadata.push({ id: "updated-at", label: "آخرین بروزرسانی", value: formatPersonDate(person.updatedAt), icon: CalendarDays })

        const actions: EntityAction[] = canViewPerson
          ? [{ id: "view", label: uiText.common.view, accessibleLabel: `${uiText.common.view} ${person.fullName}`, icon: Eye, onClick: () => onOpen(person) }]
          : []

        return (
          <EntityCard
            key={person.id}
            id={person.id}
            title={person.fullName}
            subtitle={display.jobTitle || text.notSpecified}
            ariaLabel={`${text.fields.fullName}: ${person.fullName}`}
            accentColor={person.isPrimaryContact ? "var(--app-primary)" : person.isSecondaryContact ? "var(--info)" : "var(--app-text-secondary)"}
            onClick={canViewPerson ? () => onOpen(person) : undefined}
            logo={<IdentityAvatar name={person.fullName} fallbackIcon={<ContactRound className="size-5" />} className="size-14 rounded-2xl text-lg" />}
            badges={badges}
            owner={companyName ? { name: companyName, role: text.fields.company, fallback: <Building2 className="size-4" aria-hidden="true" /> } : null}
            ownerFallback={`${text.fields.company}: ${text.notSpecified}`}
            metadata={metadata}
            actions={actions}
          />
        )
      })}
    </div>
  )
}
