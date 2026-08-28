import { useQueryScope } from "@/lib/queryScope"
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import {
  archive,
  getNotifications,
  getUnreadCount,
  markRead,
  markUnread,
  readAll,
  removeNotification,
  unarchive,
} from "../api/notifications.api"
import type { NotificationQuery } from "../types/notification.types"
export const notificationKeys = {
  all: ["notifications"] as const,
  list: (q: NotificationQuery) => ["notifications", "list", q] as const,
  count: ["notifications", "unread-count"] as const,
}
export function useNotifications(q: NotificationQuery, enabled = true) {
  return useQuery({
    queryKey: [...notificationKeys.list(q), useQueryScope()],
    queryFn: () => getNotifications(q),
    enabled,
    placeholderData: keepPreviousData,
  })
}
export function useUnreadCount(enabled = true) {
  return useQuery({
    queryKey: [...notificationKeys.count, useQueryScope()],
    queryFn: getUnreadCount,
    enabled,
    refetchInterval: 60000,
  })
}
function useInvalidation() {
  const c = useQueryClient()
  return () => c.invalidateQueries({ queryKey: notificationKeys.all })
}
export function useMarkRead() {
  const i = useInvalidation()
  return useMutation({ mutationFn: markRead, onSuccess: i })
}
export function useMarkUnread() {
  const i = useInvalidation()
  return useMutation({ mutationFn: markUnread, onSuccess: i })
}
export function useReadAll() {
  const i = useInvalidation()
  return useMutation({ mutationFn: readAll, onSuccess: i })
}
export function useArchive() {
  const i = useInvalidation()
  return useMutation({ mutationFn: archive, onSuccess: i })
}
export function useUnarchive() {
  const i = useInvalidation()
  return useMutation({ mutationFn: unarchive, onSuccess: i })
}
export function useDeleteNotification() {
  const i = useInvalidation()
  return useMutation({ mutationFn: removeNotification, onSuccess: i })
}
