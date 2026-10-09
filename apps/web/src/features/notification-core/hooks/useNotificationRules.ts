import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  createNotificationRule,
  deleteNotificationRule,
  getNotificationRoleTargets,
  getNotificationRuleCatalog,
  getNotificationRules,
  getNotificationTeamTargets,
  getNotificationUserTargets,
  updateNotificationRule,
} from "../api/notificationRulesApi"
import type {
  NotificationRecipientType,
  NotificationRuleInput,
} from "../types/rule-engine.types"

export const notificationRuleKeys = {
  all: ["notification-rules"] as const,
  catalog: ["notification-rules", "catalog"] as const,
  targets: (type: NotificationRecipientType, search = "") =>
    ["notification-rules", "targets", type, search] as const,
}

export function useNotificationRules() {
  return useQuery({ queryKey: notificationRuleKeys.all, queryFn: getNotificationRules })
}

export function useNotificationRuleCatalog() {
  return useQuery({
    queryKey: notificationRuleKeys.catalog,
    queryFn: getNotificationRuleCatalog,
    staleTime: 5 * 60_000,
  })
}

export function useNotificationTargets(
  type: NotificationRecipientType,
  search = "",
) {
  return useQuery({
    queryKey: notificationRuleKeys.targets(type, search),
    queryFn: () => {
      if (type === "USER") return getNotificationUserTargets(search)
      if (type === "TEAM") return getNotificationTeamTargets()
      if (type === "ROLE") return getNotificationRoleTargets()
      return Promise.resolve([])
    },
    enabled: type === "USER" || type === "TEAM" || type === "ROLE",
    staleTime: 60_000,
  })
}

export function useNotificationRuleMutations() {
  const client = useQueryClient()
  const invalidate = () => client.invalidateQueries({ queryKey: notificationRuleKeys.all })

  const create = useMutation({
    mutationFn: (input: NotificationRuleInput) => createNotificationRule(input),
    onSuccess: invalidate,
  })

  const update = useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<NotificationRuleInput> }) =>
      updateNotificationRule(id, input),
    onSuccess: invalidate,
  })

  const remove = useMutation({
    mutationFn: deleteNotificationRule,
    onSuccess: invalidate,
  })

  return { create, update, remove }
}
