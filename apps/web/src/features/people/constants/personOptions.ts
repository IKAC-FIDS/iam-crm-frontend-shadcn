import { uiText } from "@/config/uiText"

import type { PersonSocialPlatform } from "../types/person.types"

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

export function getPersonSocialPlatformLabel(value?: string | null) {
  return PERSON_SOCIAL_PLATFORM_OPTIONS.find((option) => option.value === value)?.label || value || ""
}
