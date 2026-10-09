import { api } from "@/lib/api"
import { unwrapApiResponse } from "@/lib/apiResponse"

export type EmailSettings = { enabled: boolean; host: string; port: number; secure: boolean; username: string; hasPassword: boolean; fromEmail: string; fromName: string; replyTo: string }
export type EmailSettingsPayload = Omit<EmailSettings, "hasPassword"> & { password?: string }

export async function getEmailSettings() { const response = await api.get("/admin/email-settings"); return unwrapApiResponse<EmailSettings>(response.data) }
export async function updateEmailSettings(payload: EmailSettingsPayload) { const response = await api.put("/admin/email-settings", payload); return unwrapApiResponse<EmailSettings>(response.data) }
export async function sendTestEmail(to: string) { const response = await api.post("/admin/email-settings/test", { to }); return unwrapApiResponse<{ success: boolean; messageId: string }>(response.data) }
