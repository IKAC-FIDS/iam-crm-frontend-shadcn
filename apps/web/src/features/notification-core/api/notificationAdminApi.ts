import { api } from "@/lib/api"
import { unwrapApiResponse } from "@/lib/apiResponse"
import { parsePaginatedResponse } from "@/lib/pagination"
import { z } from "zod"
import type { DigestPolicy, EscalationPolicy, NotificationChannel, NotificationChannelStatus, NotificationDelivery, NotificationDeliveryDetail, NotificationDeliveryStatus, NotificationEventMeta, NotificationTemplate, NotificationTemplatePreview, NotificationTemplateVariable, NotificationTriggerType, PushSettings, QuietHoursPolicy, SmsSettings } from "../types/rule-engine.types"

export type TemplateInput = Pick<NotificationTemplate, "eventName" | "channel" | "locale" | "body" | "isActive" | "version"> & { subject?: string | null }
export type DeliveryFilters = { page: number; pageSize: number; eventName?: string; channel?: NotificationChannel; status?: NotificationDeliveryStatus; recipientUserId?: string; ruleId?: string; templateId?: string; triggerType?: NotificationTriggerType; provider?: string; aggregateType?: string; aggregateId?: string; dateFrom?: string; dateTo?: string; search?: string; sortBy?: "createdAt" | "sentAt" | "deliveredAt" | "status" | "channel"; sortDirection?: "asc" | "desc" }

export async function getNotificationAdminCatalog() {
  const response = await api.get("/admin/notifications/catalog")
  return unwrapApiResponse<{ events: NotificationEventMeta[] }>(response.data)
}
export async function getNotificationTemplates(params?: Record<string, string | undefined>) {
  const response = await api.get("/admin/notification-templates", { params })
  return unwrapApiResponse<NotificationTemplate[]>(response.data)
}
export async function createNotificationTemplate(input: TemplateInput) {
  const response = await api.post("/admin/notification-templates", input)
  return unwrapApiResponse<NotificationTemplate>(response.data)
}
export async function updateNotificationTemplate(id: string, input: Partial<TemplateInput>) {
  const response = await api.patch(`/admin/notification-templates/${id}`, input)
  return unwrapApiResponse<NotificationTemplate>(response.data)
}
export async function deleteNotificationTemplate(id: string) {
  const response = await api.delete(`/admin/notification-templates/${id}`)
  return unwrapApiResponse<{ deleted: boolean }>(response.data)
}
export async function activateNotificationTemplate(id: string) {
  const response = await api.post(`/admin/notification-templates/${id}/activate`)
  return unwrapApiResponse<NotificationTemplate>(response.data)
}
export async function getNotificationTemplateVariables(eventName: string) {
  const response = await api.get("/admin/notification-templates/variables", { params: { eventName } })
  return unwrapApiResponse<{ eventName: string; variables: NotificationTemplateVariable[] }>(response.data)
}
export async function previewNotificationTemplate(input: Pick<TemplateInput, "eventName" | "channel" | "locale" | "subject" | "body">) {
  const response = await api.post("/admin/notification-templates/preview", input)
  return unwrapApiResponse<NotificationTemplatePreview>(response.data)
}
export async function getNotificationChannelStatus() {
  const response = await api.get("/admin/notifications/channels/status")
  return unwrapApiResponse<NotificationChannelStatus[]>(response.data)
}
export async function getSmsSettings() {
  const response = await api.get("/admin/notification-channels/sms")
  return unwrapApiResponse<SmsSettings>(response.data)
}
export async function updateSmsSettings(input: { provider: string; apiUrl: string; apiKey?: string; clearApiKey?: boolean; senderNumber: string; enabled: boolean; timeoutMs: number }) {
  const response = await api.patch("/admin/notification-channels/sms", input)
  return unwrapApiResponse<SmsSettings>(response.data)
}
export async function testSmsSettings(input: { recipient: string; message?: string }) {
  const response = await api.post("/admin/notification-channels/sms/test", input)
  return unwrapApiResponse<{ success: boolean; providerMessageId?: string | null; errorCode?: string | null; errorMessage?: string | null }>(response.data)
}
export async function getPushSettings() {
  const response = await api.get("/admin/notification-channels/push")
  return unwrapApiResponse<PushSettings>(response.data)
}
export async function updatePushSettings(input: { provider: string; publicKey?: string; privateKey?: string; clearPrivateKey?: boolean; subject?: string; enabled: boolean; timeoutMs: number }) {
  const response = await api.patch("/admin/notification-channels/push", input)
  return unwrapApiResponse<PushSettings>(response.data)
}
export async function testPushSettings(input: { recipientUserId: string; title?: string; body?: string }) {
  const response = await api.post("/admin/notification-channels/push/test", input)
  return unwrapApiResponse<{ attempted: number; successful: number; failed: number }>(response.data)
}
export async function dispatchNotificationDelivery(id: string) {
  const response = await api.post(`/admin/notification-deliveries/${id}/retry`)
  return unwrapApiResponse<NotificationDelivery>(response.data)
}
export async function getNotificationDeliveries(params: DeliveryFilters) {
  const response = await api.get("/admin/notification-deliveries", { params })
  return parsePaginatedResponse(response.data, z.unknown() as z.ZodType<NotificationDelivery>)
}
export async function getNotificationDelivery(id: string) {
  const response = await api.get(`/admin/notification-deliveries/${id}`)
  return unwrapApiResponse<NotificationDeliveryDetail>(response.data)
}
export async function getQuietHours() { const response = await api.get("/admin/notification-policies/quiet-hours"); return unwrapApiResponse<QuietHoursPolicy | null>(response.data) }
export async function updateQuietHours(input: QuietHoursPolicy) { const response = await api.patch("/admin/notification-policies/quiet-hours", input); return unwrapApiResponse<QuietHoursPolicy>(response.data) }
export async function getDigestPolicies() { const response = await api.get("/admin/notification-policies/digests"); return unwrapApiResponse<DigestPolicy[]>(response.data) }
export async function createDigestPolicy(input: Omit<DigestPolicy, "id">) { const response = await api.post("/admin/notification-policies/digests", input); return unwrapApiResponse<DigestPolicy>(response.data) }
export async function updateDigestPolicy(id: string, input: Partial<Omit<DigestPolicy, "id">>) { const response = await api.patch(`/admin/notification-policies/digests/${id}`, input); return unwrapApiResponse<DigestPolicy>(response.data) }
export async function deleteDigestPolicy(id: string) { const response = await api.delete(`/admin/notification-policies/digests/${id}`); return unwrapApiResponse<{ disabled: boolean }>(response.data) }
export async function getEscalationPolicies() { const response = await api.get("/admin/notification-policies/escalations"); return unwrapApiResponse<EscalationPolicy[]>(response.data) }
export async function createEscalationPolicy(input: Omit<EscalationPolicy, "id">) { const response = await api.post("/admin/notification-policies/escalations", input); return unwrapApiResponse<EscalationPolicy>(response.data) }
export async function updateEscalationPolicy(id: string, input: Partial<Omit<EscalationPolicy, "id">>) { const response = await api.patch(`/admin/notification-policies/escalations/${id}`, input); return unwrapApiResponse<EscalationPolicy>(response.data) }
export async function deleteEscalationPolicy(id: string) { const response = await api.delete(`/admin/notification-policies/escalations/${id}`); return unwrapApiResponse<{ disabled: boolean }>(response.data) }
