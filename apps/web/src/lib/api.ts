import axios, { AxiosHeaders, type InternalAxiosRequestConfig } from "axios"
import { unwrapApiResponse, type ApiWrappedResponse } from "@/lib/apiResponse"
import { applyAuthenticatedSession } from "@/features/auth/utils/authSession"
import { useAuthStore, type AuthUser } from "@/store/authStore"
export const apiBaseUrl = (import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api").replace(/\/+$/, "")
interface RefreshResponse { accessToken: string; user: AuthUser }
interface Retryable extends InternalAxiosRequestConfig { _retry?: boolean }
let refreshPromise: Promise<RefreshResponse> | null = null
function clearAndRedirect() { useAuthStore.getState().clearUser(); if (window.location.pathname !== "/login") window.location.assign("/login") }
function refreshSession(): Promise<RefreshResponse> {
  if (!refreshPromise) refreshPromise = axios.post<ApiWrappedResponse<RefreshResponse>>("/auth/refresh",undefined,{baseURL:apiBaseUrl,timeout:30000,withCredentials:true})
    .then(r=>{ const s=unwrapApiResponse<RefreshResponse>(r.data); if(!s.accessToken||!s.user) throw new Error("Invalid refresh response"); applyAuthenticatedSession(s); return s })
    .catch(e=>{ clearAndRedirect(); throw e }).finally(()=>{ refreshPromise=null })
  return refreshPromise
}
export const api = axios.create({ baseURL:apiBaseUrl, timeout:30000, withCredentials:true, headers:{"Content-Type":"application/json"} })
api.interceptors.request.use(config=>{ const token=localStorage.getItem("accessToken"); if(token) config.headers.Authorization=`Bearer ${token}`; if(config.data instanceof FormData) delete config.headers["Content-Type"]; return config })
api.interceptors.response.use(r=>r, async error=>{
  const original=error.config as Retryable|undefined; const url=original?.url ?? ""
  if(error.response?.status!==401 || !original) return Promise.reject(error)
  if(url.includes("/auth/refresh") || original._retry){ clearAndRedirect(); return Promise.reject(error) }
  if(url.includes("/auth/login")) return Promise.reject(error)
  original._retry=true
  try { const s=await refreshSession(); original.headers=AxiosHeaders.from(original.headers); original.headers.set("Authorization",`Bearer ${s.accessToken}`); return api(original) }
  catch { return Promise.reject(error) }
})