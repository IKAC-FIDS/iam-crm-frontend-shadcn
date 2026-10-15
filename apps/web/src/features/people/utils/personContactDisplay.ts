import type { PersonContact } from "../types/person.types"

export function getPersonContactDisplayLabel(
  contact: Pick<PersonContact, "type" | "typeOption">,
  fallback: string
) {
  return contact.typeOption?.label ?? contact.type ?? fallback
}
