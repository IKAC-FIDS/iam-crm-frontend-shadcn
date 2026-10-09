import axios from "axios"
import { uiText } from "@/config/uiText"
import { ApiContractError } from "./pagination"

export interface AppError {
  kind:
    | "unauthorized"
    | "forbidden"
    | "not-found"
    | "conflict"
    | "validation"
    | "server"
    | "network"
    | "unknown"
  status?: number
  message: string
  fieldErrors: Record<string, string[]>
  retryable: boolean
}
const text = uiText.app
function record(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}
function messages(value: unknown): string[] {
  return (Array.isArray(value) ? value : [value]).filter(
    (item): item is string => typeof item === "string" && Boolean(item.trim())
  )
}
export function normalizeAppError(
  error: unknown,
  fallback: string = text.unexpected
): AppError {
  if (error instanceof ApiContractError)
    return {
      kind: "unknown",
      message: error.message,
      fieldErrors: {},
      retryable: false,
    }
  if (!axios.isAxiosError(error))
    return {
      kind: "unknown",
      message: fallback,
      fieldErrors: {},
      retryable: false,
    }
  const status = error.response?.status
  const body: unknown = error.response?.data
  const details =
    record(body) && record(body.error) ? body.error : record(body) ? body : {}
  const fieldErrors: Record<string, string[]> = {}
  const nested = record(details.details) ? details.details : {}
  const fields =
    details.fieldErrors ??
    details.errors ??
    nested.fieldErrors ??
    nested.errors ??
    details.details
  if (Array.isArray(fields)) {
    for (const field of fields) {
      if (record(field) && typeof field.field === "string")
        fieldErrors[field.field] = messages(field.message)
    }
  } else if (record(fields)) {
    for (const [field, value] of Object.entries(fields)) {
      const list = messages(value)
      if (list.length) fieldErrors[field] = list
    }
  }
  const businessMessage = messages(details.message).join("؛ ")
  const common = { status, fieldErrors, retryable: false }
  if (!error.response)
    return {
      ...common,
      kind: "network",
      message: text.network,
      retryable: true,
    }
  if (status === 401)
    return { ...common, kind: "unauthorized", message: text.unauthorized }
  if (status === 403)
    return { ...common, kind: "forbidden", message: text.forbidden }
  if (status === 404)
    return { ...common, kind: "not-found", message: text.notFound }
  if (status === 409)
    return {
      ...common,
      kind: "conflict",
      message: businessMessage || text.conflict,
    }
  if (status === 422 || status === 400)
    return {
      ...common,
      kind: "validation",
      message: businessMessage || text.validation,
    }
  if (status && status >= 500)
    return { ...common, kind: "server", message: text.server, retryable: true }
  return { ...common, kind: "unknown", message: text.unexpected }
}
