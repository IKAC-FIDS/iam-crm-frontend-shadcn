import axios from "axios"

import { uiText } from "@/config/uiText"
import { getApiErrorMessage } from "@/lib/apiResponse"

export function getPeopleErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError(error) && error.response?.status === 403) {
    return uiText.people.nested.forbiddenError
  }
  return getApiErrorMessage(error, fallback)
}
