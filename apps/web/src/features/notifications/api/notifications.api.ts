import { api } from "@/lib/api"
import type {
  Notification,
  NotificationPage,
  NotificationQuery,
} from "../types/notification.types"

const clean = (value: object) =>
  Object.fromEntries(
    Object.entries(value).filter(([, item]) => item !== undefined && item !== "")
  )

type NotificationEnvelope = {
  success?: boolean
  data?: Notification[]
  items?: Notification[]
  meta?: Partial<NotificationPage["meta"]>
  total?: number
  page?: number
  limit?: number
  totalPages?: number
}

function normalizePage(
  value: unknown,
  fallbackPage = 1,
  fallbackLimit = 20
): NotificationPage {
  if (Array.isArray(value)) {
    return {
      data: value as Notification[],
      meta: {
        total: value.length,
        page: fallbackPage,
        limit: fallbackLimit,
        totalPages: Math.max(
          1,
          Math.ceil(value.length / Math.max(1, fallbackLimit))
        ),
      },
    }
  }

  const body = (value ?? {}) as NotificationEnvelope
  const data = Array.isArray(body.data)
    ? body.data
    : Array.isArray(body.items)
      ? body.items
      : []

  const total = body.meta?.total ?? body.total ?? data.length
  const page = body.meta?.page ?? body.page ?? fallbackPage
  const limit = body.meta?.limit ?? body.limit ?? fallbackLimit
  const totalPages =
    body.meta?.totalPages ??
    body.totalPages ??
    Math.max(1, Math.ceil(total / Math.max(1, limit)))

  return { data, meta: { total, page, limit, totalPages } }
}

export async function getNotifications(query: NotificationQuery = {}) {
  const response = await api.get("/notifications", { params: clean(query) })
  return normalizePage(response.data, query.page ?? 1, query.limit ?? 20)
}

export async function getUnreadCount() {
  const response = await api.get("/notifications/unread-count")
  const body = response.data as
    | { success?: boolean; data?: { total?: number } }
    | { total?: number }

  if (
    typeof body === "object" &&
    body !== null &&
    "data" in body &&
    typeof body.data === "object" &&
    body.data !== null
  ) {
    return body.data.total ?? 0
  }

  return body?.total ?? 0
}

function unwrapNotification(value: unknown): Notification {
  if (typeof value === "object" && value !== null && "data" in value) {
    return (value as { data: Notification }).data
  }
  return value as Notification
}

export async function markRead(id: string) {
  const response = await api.patch(`/notifications/${id}/read`)
  return unwrapNotification(response.data)
}

export async function markUnread(id: string) {
  const response = await api.patch(`/notifications/${id}/unread`)
  return unwrapNotification(response.data)
}

export async function readAll() {
  await api.patch("/notifications/read-all", {})
}

export async function archive(id: string) {
  const response = await api.patch(`/notifications/${id}/archive`)
  return unwrapNotification(response.data)
}

export async function unarchive(id: string) {
  const response = await api.patch(`/notifications/${id}/unarchive`)
  return unwrapNotification(response.data)
}

export async function removeNotification(id: string) {
  await api.delete(`/notifications/${id}`)
}
