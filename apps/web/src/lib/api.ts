import axios, { AxiosHeaders, type InternalAxiosRequestConfig } from "axios"
import { refreshSession } from "@/features/auth/services/session.service"
import { useAuthStore } from "@/store/authStore"
import { apiBaseUrl } from "./httpConfig"
export { apiBaseUrl } from "./httpConfig"

interface Retryable extends InternalAxiosRequestConfig {
  _retry?: boolean
  _sessionRevision?: number
}
export const api = axios.create({
  baseURL: apiBaseUrl,
  timeout: 30_000,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
})
api.interceptors.request.use((config: Retryable) => {
  const { accessToken, revision } = useAuthStore.getState()
  config._sessionRevision ??= revision
  if (accessToken) config.headers.set("Authorization", `Bearer ${accessToken}`)
  else config.headers.delete("Authorization")
  if (config.data instanceof FormData) config.headers.delete("Content-Type")
  return config
})
api.interceptors.response.use(
  (response) => {
    const config = response.config as Retryable
    if (config._sessionRevision !== useAuthStore.getState().revision)
      throw new axios.CanceledError("Session changed")
    return response
  },
  async (error: unknown) => {
    if (!axios.isAxiosError(error)) throw error
    const original = error.config as Retryable | undefined
    if (error.response?.status !== 401 || !original) throw error
    if (
      [
        "/auth/login",
        "/auth/refresh",
        "/auth/logout",
        "/auth/passkeys/authentication/options",
        "/auth/passkeys/authentication/verify",
      ].includes(original.url ?? "")
    )
      throw error
    const state = useAuthStore.getState()
    if (
      original._sessionRevision !== state.revision ||
      state.status === "anonymous"
    )
      throw error
    if (original._retry) {
      state.clearUser()
      throw error
    }
    original._retry = true
    // A delayed 401 may belong to a token already refreshed by another request.
    const sentToken = AxiosHeaders.from(original.headers).get("Authorization")
    const session =
      state.accessToken && sentToken !== `Bearer ${state.accessToken}`
        ? { accessToken: state.accessToken }
        : await refreshSession()
    if (original._sessionRevision !== useAuthStore.getState().revision)
      throw error
    original.headers = AxiosHeaders.from(original.headers)
    original.headers.set("Authorization", `Bearer ${session.accessToken}`)
    return api(original)
  }
)
