import { uiText } from "@/config/uiText"

import type { PersonContactType, PersonSocialPlatform } from "../types/person.types"

export const PERSON_CONTACT_TYPE_OPTIONS: ReadonlyArray<{
  value: PersonContactType
  label: string
}> = [
  { value: "MOBILE", label: uiText.people.contactHub.types.MOBILE },
  { value: "WORK", label: uiText.people.contactHub.types.WORK },
  { value: "PERSONAL_EMAIL", label: uiText.people.contactHub.types.PERSONAL_EMAIL },
  { value: "WORK_EMAIL", label: uiText.people.contactHub.types.WORK_EMAIL },
  { value: "OTHER", label: uiText.people.contactHub.types.OTHER },
]

export const PERSON_SOCIAL_PLATFORM_OPTIONS: ReadonlyArray<{
  value: PersonSocialPlatform
  label: string
}> = [
  { value: "LINKEDIN", label: uiText.people.socialIdentity.platforms.LINKEDIN },
  { value: "INSTAGRAM", label: uiText.people.socialIdentity.platforms.INSTAGRAM },
  { value: "TELEGRAM", label: uiText.people.socialIdentity.platforms.TELEGRAM },
  { value: "BALE", label: uiText.people.socialIdentity.platforms.BALE },
  { value: "EITAA", label: uiText.people.socialIdentity.platforms.EITAA },
  { value: "SOROUSH", label: uiText.people.socialIdentity.platforms.SOROUSH },
  { value: "ROOBIKA", label: uiText.people.socialIdentity.platforms.ROOBIKA },
  { value: "APARAT", label: uiText.people.socialIdentity.platforms.APARAT },
  { value: "YOUTUBE", label: uiText.people.socialIdentity.platforms.YOUTUBE },
  { value: "WEBSITE", label: uiText.people.socialIdentity.platforms.WEBSITE },
  { value: "OTHER", label: uiText.people.socialIdentity.platforms.OTHER },
]

export function getPersonContactTypeLabel(value?: string | null) {
  return PERSON_CONTACT_TYPE_OPTIONS.find((option) => option.value === value)?.label || value || ""
}

export function getPersonSocialPlatformLabel(value?: string | null) {
  return PERSON_SOCIAL_PLATFORM_OPTIONS.find((option) => option.value === value)?.label || value || ""
}
