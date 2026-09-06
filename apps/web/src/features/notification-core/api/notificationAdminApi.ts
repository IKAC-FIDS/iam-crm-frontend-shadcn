import { api } from "@/lib/api"
import { unwrapApiResponse } from "@/lib/apiResponse"
import type { NotificationChannel, NotificationChannelStatus, NotificationDelivery, NotificationDeliveryStatus, NotificationEventMeta, NotificationTemplate, PageMeta } from "../types/rule-engine.types"

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
export async function getNotificationChannelStatus() {
  const response = await api.get("/admin/notifications/channels/status")
  return unwrapApiResponse<NotificationChannelStatus[]>(response.data)
}
export async function getNotificationDeliveries(params: DeliveryFilters) {
  const response = await api.get("/admin/notification-deliveries", { params })
  const payload = response.data as { data?: NotificationDelivery[]; meta?: PageMeta }
  return { data: payload.data ?? [], meta: payload.meta ?? { total: 0, page: params.page, limit: params.pageSize, totalPages: 1, hasNext: false, hasPrevious: false } }
}
