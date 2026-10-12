import axios, { AxiosHeaders, type InternalAxiosRequestConfig } from "axios"
import { apiBaseUrl } from "@/lib/httpConfig"
import { unwrapApiResponse } from "@/lib/apiResponse"
import { withSessionLock } from "@/features/auth/services/sessionCoordinator"
import { usePortalAuthStore, type PortalCompany, type PortalUser } from "./portalAuth.store"

export interface PortalSession { accessToken: string; user: PortalUser; activeCompany: PortalCompany }
export interface PortalSelection { requiresCompanySelection: true; selectionToken: string; companies: PortalCompany[] }
interface Retryable extends InternalAxiosRequestConfig { _retry?: boolean; _revision?: number }

const raw = axios.create({ baseURL: apiBaseUrl, withCredentials: true, timeout: 30_000 })
export const portalApi = axios.create({ baseURL: apiBaseUrl, withCredentials: true, timeout: 30_000 })
let portalRefreshPromise: Promise<PortalSession> | null = null

portalApi.interceptors.request.use((config: Retryable) => {
  const state = usePortalAuthStore.getState(); config._revision ??= state.revision
  if (state.accessToken) config.headers.set("Authorization", `Bearer ${state.accessToken}`)
  return config
})
portalApi.interceptors.response.use((r) => r, async (error: unknown) => {
  if (!axios.isAxiosError(error) || error.response?.status !== 401 || !error.config) throw error
  const original = error.config as Retryable
  if (original._retry || original.url?.includes("/portal/auth/")) { usePortalAuthStore.getState().clear(); throw error }
  original._retry = true
  const session = await refreshPortalSession()
  original.headers = AxiosHeaders.from(original.headers); original.headers.set("Authorization", `Bearer ${session.accessToken}`)
  return portalApi(original)
})

function apply(session: PortalSession) { usePortalAuthStore.getState().setSession(session); return session }
export async function loginPortal(email: string, password: string) {
  const data = unwrapApiResponse<PortalSession | PortalSelection>((await raw.post("/portal/auth/login", { email, password })).data)
  if ("requiresCompanySelection" in data) usePortalAuthStore.getState().requireSelection(data.companies, data.selectionToken); else apply(data)
  return data
}
export async function selectPortalCompany(companyId: string) {
  const token = usePortalAuthStore.getState().selectionToken
  const data = unwrapApiResponse<PortalSession>((await raw.post("/portal/auth/select-company", { companyId, selectionToken: token })).data); return apply(data)
}
export function refreshPortalSession(): Promise<PortalSession> {
  if (portalRefreshPromise) return portalRefreshPromise
  const revision = usePortalAuthStore.getState().revision
  portalRefreshPromise = withSessionLock(
    () => raw.post("/portal/auth/refresh"),
    45_000,
    "crm-portal-refresh-cookie-v1",
  ).then((response) => {
    if (revision !== usePortalAuthStore.getState().revision) throw new Error("Portal session superseded")
    return apply(unwrapApiResponse<PortalSession>(response.data))
  }).finally(() => { portalRefreshPromise = null })
  return portalRefreshPromise
}
export async function switchPortalCompany(companyId: string) { const data = unwrapApiResponse<PortalSession>((await portalApi.post("/portal/auth/switch-company", { companyId })).data); return apply(data) }
export async function logoutPortal() { try { await raw.post("/portal/auth/logout") } finally { usePortalAuthStore.getState().clear() } }
export async function listPortalCompanies() { const data = unwrapApiResponse<PortalCompany[]>((await portalApi.get("/portal/auth/companies")).data); usePortalAuthStore.getState().setCompanies(data); return data }
export async function acceptPortalInvitation(token: string, password: string, fullName?: string) { const data = unwrapApiResponse<PortalSession>((await raw.post("/portal/auth/accept-invitation", { token, password, fullName })).data); return apply(data) }
