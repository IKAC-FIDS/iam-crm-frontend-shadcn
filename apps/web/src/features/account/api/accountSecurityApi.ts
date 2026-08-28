import { browserSupportsWebAuthn, startRegistration, type PublicKeyCredentialCreationOptionsJSON, type RegistrationResponseJSON } from "@simplewebauthn/browser"
import { api } from "@/lib/api"
import { logoutSession, mutateBrowserSession } from "@/features/auth/services/session.service"
import { queryClient } from "@/lib/queryClient"
import { unwrapApiResponse } from "@/lib/apiResponse"

export type SecurityOverview = { id: string; fullName: string; email: string; role: string; isActive: boolean; passwordChangedAt: string | null; lastLoginAt: string | null; lastLoginIp: string | null; failedLoginAttempts: number; lockedUntil: string | null; createdAt: string; activeSessionsCount: number; isLocked: boolean }
export type Passkey = { id: string; deviceName: string | null; createdAt: string | null; updatedAt: string | null; lastUsedAt: string | null; transports: string[]; backedUp: boolean | null; credentialDeviceType: string | null }
export type UserSession = { id: string; userAgent: string | null; ipAddress: string | null; createdAt: string; lastUsedAt: string; expiresAt: string; current: boolean }

export async function getSecurityOverview() { const response = await api.get("/auth/account/security"); return unwrapApiResponse<SecurityOverview>(response.data) }
export async function getPasskeys() { const response = await api.get("/me/passkeys"); const value = unwrapApiResponse<unknown>(response.data); return (Array.isArray(value) ? value : []) as Passkey[] }
export async function deletePasskey(id: string) { await api.delete(`/me/passkeys/${id}`) }
export async function registerPasskey(deviceName: string) {
  if (!window.isSecureContext) throw new Error("ثبت Passkey فقط روی HTTPS یا localhost امکان‌پذیر است.")
  if (!browserSupportsWebAuthn()) throw new Error("مرورگر یا دستگاه شما از Passkey پشتیبانی نمی‌کند.")
  const optionResponse = await api.post("/me/passkeys/registration/options", { deviceName })
  const optionsJSON = unwrapApiResponse<PublicKeyCredentialCreationOptionsJSON>(optionResponse.data)
  if (!optionsJSON?.challenge || !optionsJSON?.rp?.id) throw new Error("اطلاعات ثبت Passkey از سرور ناقص دریافت شد.")
  let credential: RegistrationResponseJSON
  try { credential = await startRegistration({ optionsJSON }) }
  catch (error) { if (error instanceof DOMException && error.name === "NotAllowedError") throw new Error("عملیات توسط کاربر لغو شد یا زمان ثبت به پایان رسید.", { cause: error }); throw error }
  const verifyResponse = await api.post("/me/passkeys/registration/verify", { deviceName, response: credential })
  return unwrapApiResponse<Passkey>(verifyResponse.data)
}
export async function getSessions() { const response = await api.get("/auth/sessions"); const value = unwrapApiResponse<unknown>(response.data); return (Array.isArray(value) ? value : []) as UserSession[] }
export async function revokeSession(id: string) {
  // The displayed current row can have rotated since the list was fetched.
  if (queryClient.getQueryData<UserSession[]>(["account-sessions"])?.some(session => session.id === id && session.current)) {
    await logoutSession()
    return { revokedCurrentSession: true }
  }
  return mutateBrowserSession<{ revokedCurrentSession: boolean }>("delete", `/auth/sessions/${id}`)
}
export async function logoutOtherSessions() { return mutateBrowserSession<{ revokedCount: number; currentSessionKept: boolean }>("post", "/auth/account/logout-other-sessions") }
export async function changePassword(currentPassword: string, newPassword: string) { return mutateBrowserSession<{ message: string; requiresLogin: boolean }>("post", "/auth/account/change-password", { currentPassword, newPassword }) }
