import {
  AxiosError,
  AxiosHeaders,
  type InternalAxiosRequestConfig,
} from "axios"
import { normalizeAuthUser } from "@/store/authStore"
export const user = normalizeAuthUser({
  id: "test-user",
  fullName: "Test",
  email: "test@example.test",
  role: "USER",
  permissions: ["company:view"],
})!
export function response(
  data: unknown,
  config: InternalAxiosRequestConfig = { headers: new AxiosHeaders() }
) {
  return { data, status: 200, statusText: "OK", headers: {}, config }
}
export function httpError(
  status?: number,
  data: unknown = {},
  config: InternalAxiosRequestConfig = { headers: new AxiosHeaders() }
) {
  return new AxiosError(
    "DO NOT DISPLAY raw transport details",
    undefined,
    config,
    undefined,
    status ? { ...response(data, config), status } : undefined
  )
}
