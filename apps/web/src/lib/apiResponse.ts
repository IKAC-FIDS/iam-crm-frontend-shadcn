import axios from "axios"
export interface ApiSuccessResponse<T> { success: true; data: T }
export type ApiWrappedResponse<T> = T | ApiSuccessResponse<T> | { data: T }
function isRecord(value: unknown): value is Record<string, unknown> { return typeof value === "object" && value !== null }
export function unwrapApiResponse<T>(value: ApiWrappedResponse<T> | unknown): T {
  if (isRecord(value) && value.success === true && "data" in value) return value.data as T
  if (isRecord(value) && "data" in value && !("success" in value)) return value.data as T
  return value as T
}
export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError<unknown>(error)) {
    const body = error.response?.data
    if (isRecord(body)) {
      const standard = body.error
      if (isRecord(standard) && typeof standard.message === "string" && standard.message.trim()) return standard.message
      if (typeof body.message === "string" && body.message.trim()) return body.message
    }
    if (error.message) return error.message
  }
  if (error instanceof Error && error.message) return error.message
  return fallback
}