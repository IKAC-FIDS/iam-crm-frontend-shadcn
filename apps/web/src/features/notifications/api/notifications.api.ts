import { z } from "zod"
import { parsePaginatedResponse } from "@/lib/pagination"
import { api } from "@/lib/api"
import type {
  Notification,
  NotificationQuery,
} from "../types/notification.types"

const clean = (value: object) =>
  Object.fromEntries(
    Object.entries(value).filter(
      ([, item]) => item !== undefined && item !== ""
    )
  )

export async function getNotifications(query: NotificationQuery = {}) {
  const response = await api.get("/notifications", { params: clean(query) })
  return parsePaginatedResponse(
    response.data,
    z.custom<Notification>(
      (value) =>
        !!value &&
        typeof value === "object" &&
        "id" in value &&
        typeof value.id === "string"
    )
  )
}

export async function getUnreadCount() {
  const response = await api.get("/notifications/unread-count")
  const body = response.data as
    { success?: boolean; data?: { total?: number } } | { total?: number }

  if (
    typeof body === "object" &&
    body !== null &&
    "data" in body &&
    typeof body.data === "object" &&
    body.data !== null
  ) {
    return body.data.total ?? 0
  }

  if (
    typeof body === "object" &&
    body !== null &&
    "total" in body &&
    typeof body.total === "number"
  ) {
    return body.total
  }

  return 0
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
