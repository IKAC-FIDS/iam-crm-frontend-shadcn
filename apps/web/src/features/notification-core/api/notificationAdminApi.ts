import { api } from "@/lib/api"
import { unwrapApiResponse } from "@/lib/apiResponse"
import type { NotificationChannel, NotificationChannelStatus, NotificationDelivery, NotificationDeliveryStatus, NotificationEventMeta, NotificationTemplate, NotificationTemplatePreview, NotificationTemplateVariable, PageMeta, SmsSettings } from "../types/rule-engine.types"

export type TemplateInput = Pick<NotificationTemplate, "eventName" | "channel" | "locale" | "body" | "isActive" | "version"> & { subject?: string | null }
export type DeliveryFilters = { page: number; pageSize: number; eventName?: string; channel?: NotificationChannel; status?: NotificationDeliveryStatus; recipientUserId?: string; dateFrom?: string; dateTo?: string; search?: string }

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
export async function dispatchNotificationDelivery(id: string) {
  const response = await api.post(`/admin/notification-deliveries/${id}/dispatch`)
  return unwrapApiResponse<{ deliveryId: string; status: string; sent: boolean; reason?: string }>(response.data)
}
export async function getNotificationDeliveries(params: DeliveryFilters) {
  const response = await api.get("/admin/notification-deliveries", { params })
  const payload = response.data as { data?: NotificationDelivery[]; meta?: PageMeta }
  return { data: payload.data ?? [], meta: payload.meta ?? { total: 0, page: params.page, limit: params.pageSize, totalPages: 1, hasNext: false, hasPrevious: false } }
}
