import {
  EntityCardList,
  type EntityCardField,
} from "@/components/shared/EntityCardList"
import { EmptyState } from "@/components/shared/EmptyState"
import { IdentityAvatar } from "@/components/shared/IdentityAvatar"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { uiText } from "@/config/uiText"
import { Button } from "@workspace/ui/components/button"
import {
  Building2,
  ContactRound,
  Eye,
  Mail,
  Phone,
  Star,
  UsersRound,
} from "lucide-react"
import { useMemo } from "react"

import type {
  PeopleLookupSet,
  PersonDirectoryItem,
} from "../types/person.types"
import {
  personCompanyName,
  personDisplayValues,
} from "../utils/personFormatters"

export function PersonCardList({
  people,
  lookups,
  canViewPerson,
  onOpen,
}: {
  people: PersonDirectoryItem[]
  lookups: PeopleLookupSet
  canViewPerson: boolean
  onOpen: (person: PersonDirectoryItem) => void
}) {
  const text = uiText.people
  const fields = useMemo<EntityCardField<PersonDirectoryItem>[]>(
    () => [
      {
        id: "company",
        label: text.fields.company,
        icon: Building2,
        render: (person) => personCompanyName(person) || text.notSpecified,
      },
      {
        id: "department",
        label: text.fields.department,
        icon: UsersRound,
        render: (person) =>
          personDisplayValues(person, lookups).department || text.notSpecified,
      },
      {
        id: "phone",
        label: text.fields.phone,
        icon: Phone,
        render: (person) =>
          person.phoneSummary || person.phone ? (
            <span dir="ltr" className="block truncate text-end">
              {person.phoneSummary || person.phone}
            </span>
          ) : (
            text.notSpecified
          ),
      },
      {
        id: "email",
        label: text.fields.email,
        icon: Mail,
        render: (person) =>
          person.emailSummary || person.email ? (
            <span dir="ltr" className="block truncate text-end">
              {person.emailSummary || person.email}
            </span>
          ) : (
            text.notSpecified
          ),
      },
    ],
    [lookups, text]
  )

  return (
    <EntityCardList
      rows={people}
      fields={fields}
      getRowKey={(person) => person.id}
      layout="tile"
      density="compact"
      className="grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
      onRowClick={canViewPerson ? onOpen : undefined}
      title={(person) => person.fullName}
      subtitle={(person) =>
        personDisplayValues(person, lookups).jobTitle || text.notSpecified
      }
      media={(person) => (
        <IdentityAvatar
          name={person.fullName}
          fallbackIcon={<ContactRound className="size-6" />}
          className="size-16 rounded-[22px] text-xl shadow-sm"
        />
      )}
      badges={(person) => (
        <>
          {person.isPrimaryContact ? (
            <StatusBadge tone="primary" dot={false}>
              <Star className="size-3.5 fill-current" />
              {text.contactRole.primary}
            </StatusBadge>
          ) : person.isSecondaryContact ? (
            <StatusBadge tone="neutral" dot={false}>
              <Star className="size-3.5" />
              {text.contactRole.secondary}
            </StatusBadge>
          ) : null}
        </>
      )}
      tags={(person) => {
        const display = personDisplayValues(person, lookups)
        return (
          <>
            {display.personaRole ? (
              <StatusBadge tone="primary" dot={false}>
                {display.personaRole}
              </StatusBadge>
            ) : null}
            {display.seniorityLevel ? (
              <StatusBadge tone="neutral" dot={false}>
                {display.seniorityLevel}
              </StatusBadge>
            ) : null}
          </>
        )
      }}
      actions={
        canViewPerson
          ? (person) => (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-xl"
                aria-label={`${uiText.common.view} ${person.fullName}`}
                onClick={() => onOpen(person)}
              >
                <Eye className="size-4" />
                {uiText.common.view}
              </Button>
            )
          : undefined
      }
      emptyState={
        <EmptyState
          icon={UsersRound}
          title={text.empty.listTitle}
          description={text.empty.listDescription}
        />
      }
    />
  )
}
