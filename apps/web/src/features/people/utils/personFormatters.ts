import type { PersonDirectoryItem } from "../types/person.types"

export function personCompanyName(person: PersonDirectoryItem) {
  return (
    person.company?.brandName ||
    person.company?.legalName ||
    ""
  )
}

export function personJobTitle(person: PersonDirectoryItem) {
  return person.jobTitle || person.title || ""
}

export function personPersona(person: PersonDirectoryItem) {
  return person.personaRole || person.personaTag || ""
}

export function primaryContactValue(person: PersonDirectoryItem) {
  const primary = person.contacts?.find(
    (item) => item.isPrimary && item.value?.trim(),
  )
  return (
    primary?.value ||
    person.phoneSummary ||
    person.emailSummary ||
    person.phone ||
    person.email ||
    ""
  )
}

export function formatPersonDate(value?: string | null) {
  if (!value) return ""
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date)
}
