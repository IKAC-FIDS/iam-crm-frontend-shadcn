import axios from "axios"
import { publishSessionEvent, readSessionEvent, subscribeSessionEvents, withSessionLock } from "./sessionCoordinator"
import { apiBaseUrl } from "@/lib/httpConfig"
import { unwrapApiResponse } from "@/lib/apiResponse"
import { removeLegacySessionStorage, useAuthStore } from "@/store/authStore"
import {
  applyAuthenticatedSession,
  type AuthenticatedSession,
} from "../utils/authSession"

// Cookie endpoints must never recurse through the API's 401 interceptor.
export const sessionClient = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
  timeout: 30_000,
})
let refreshPromise: Promise<AuthenticatedSession> | null = null

export function refreshSession(): Promise<AuthenticatedSession> {
  if (refreshPromise) return refreshPromise
  const revision = useAuthStore.getState().revision
  const generation = readSessionEvent()?.id
  refreshPromise = withSessionLock(async () => {
    if (revision !== useAuthStore.getState().revision || generation !== readSessionEvent()?.id) throw new Error("Session superseded")
    return sessionClient.post("/auth/refresh")
  })
    .then((response) => {
      const session = unwrapApiResponse<AuthenticatedSession>(response.data)
      if (revision !== useAuthStore.getState().revision || generation !== readSessionEvent()?.id)
        throw new Error("Session superseded")
      applyAuthenticatedSession(session, false)
      return session
    })
    .catch((error: unknown) => {
      if (
        revision === useAuthStore.getState().revision &&
        axios.isAxiosError(error) &&
        (error.response?.status === 401 || error.response?.status === 403)
      )
        useAuthStore.getState().clearUser()
      throw error
    })
    .finally(() => {
      refreshPromise = null
    })
  return refreshPromise
}

export async function restoreSession() {
  removeLegacySessionStorage()
  const state = useAuthStore.getState()
  if (state.status === "authenticated" || state.status === "anonymous") return
  const revision = state.revision
  state.setStatus("loading")
  try {
    // A newly opened tab may have missed the logout storage event entirely.
    if (readSessionEvent()?.kind === "logout") {
      state.clearUser()
      return
    }
    await refreshSession()
  } catch {
    if (revision === useAuthStore.getState().revision)
      useAuthStore.getState().setStatus("error")
  }
}

export async function logoutSession() {
  useAuthStore.getState().clearUser()
  const revision = useAuthStore.getState().revision
  useAuthStore.getState().setStatus("loading")
  try {
    const generation = publishSessionEvent("logout")
    // Finish cookie rotation before revoking the resulting cookie.
    if (refreshPromise) await refreshPromise.catch(() => undefined)
    await withSessionLock(async () => {
      if (generation !== readSessionEvent()?.id) return
      await sessionClient.post("/auth/logout")
    })
  } finally {
    if (revision === useAuthStore.getState().revision) useAuthStore.getState().setStatus("anonymous")
  }
}

export async function createBrowserSession(path: string, data: unknown) {
  const generation = readSessionEvent()?.id
  return withSessionLock(async () => {
    if (generation !== readSessionEvent()?.id) throw new Error("Session superseded")
    const response = await sessionClient.post(path, data)
    if (generation !== readSessionEvent()?.id) throw new Error("Session superseded")
    const session = unwrapApiResponse<AuthenticatedSession>(response.data)
    applyAuthenticatedSession(session)
    publishSessionEvent("changed")
    return session
  })
}

export function watchBrowserSession() {
  return subscribeSessionEvents(event => {
    useAuthStore.getState().clearUser()
    if (event.kind === "changed") {
      useAuthStore.getState().setStatus("loading")
      // An older pending refresh must settle before bootstrap can create another one.
      void (refreshPromise ?? Promise.resolve()).catch(() => undefined).then(() => restoreSession())
    }
  })
}

// Never rotate eagerly here: a selected current session ID would become stale.
// The raw client cannot recursively acquire the same lock on 401.
export async function mutateBrowserSession<T>(method: "post" | "delete", url: string, data?: unknown): Promise<T> {
  const revision = useAuthStore.getState().revision
  const generation = readSessionEvent()?.id
  const send = () => withSessionLock(async () => {
    const state = useAuthStore.getState()
    if (state.revision !== revision || generation !== readSessionEvent()?.id || !state.accessToken) throw new Error("Session superseded")
    const response = await sessionClient.request({ method, url, data, headers: { Authorization: `Bearer ${state.accessToken}` } })
    const result = unwrapApiResponse<T>(response.data)
    if (result && typeof result === "object" && (("revokedCurrentSession" in result && result.revokedCurrentSession) || ("requiresLogin" in result && result.requiresLogin) || url === "/auth/logout-all")) {
      useAuthStore.getState().clearUser()
      publishSessionEvent("logout")
    }
    return result
  })
  try {
    return await send()
  } catch (error) {
    if (!axios.isAxiosError(error) || error.response?.status !== 401) throw error
    // Only retry after releasing ownership; refresh cannot deadlock on our lock.
    await refreshSession()
    return send()
  }
}
