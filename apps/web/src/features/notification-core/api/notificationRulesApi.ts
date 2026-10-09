import { api } from "@/lib/api"
import { unwrapApiResponse } from "@/lib/apiResponse"
import type {
  NotificationRule,
  NotificationRuleCatalog,
  NotificationRuleInput,
  NotificationRuleTarget,
} from "../types/rule-engine.types"

type UserTarget = { id: string; fullName: string; email: string }
type TeamTarget = { id: string; code: string; name: string }
type RoleTarget = {
  id: string
  code: string
  normalizedCode?: string | null
  name: string
  scope?: string
  baseRole?: string
}

export async function getNotificationRules() {
  const response = await api.get("/admin/notification-rules")
  return unwrapApiResponse<NotificationRule[]>(response.data)
}

export async function getNotificationRuleCatalog() {
  const response = await api.get("/admin/notification-rules/catalog")
  return unwrapApiResponse<NotificationRuleCatalog>(response.data)
}

export async function createNotificationRule(input: NotificationRuleInput) {
  const response = await api.post("/admin/notification-rules", input)
  return unwrapApiResponse<NotificationRule>(response.data)
}

export async function updateNotificationRule(
  id: string,
  input: Partial<NotificationRuleInput>,
) {
  const response = await api.patch(`/admin/notification-rules/${id}`, input)
  return unwrapApiResponse<NotificationRule>(response.data)
}

export async function deleteNotificationRule(id: string) {
  const response = await api.delete(`/admin/notification-rules/${id}`)
  return unwrapApiResponse<{ deleted: boolean }>(response.data)
}

export async function getNotificationUserTargets(search?: string) {
  const response = await api.get("/admin/notification-rules/targets/users", {
    params: { search: search?.trim() || undefined },
  })
  const data = unwrapApiResponse<UserTarget[]>(response.data)
  return data.map<NotificationRuleTarget>((item) => ({
    id: item.id,
    name: item.fullName,
    description: item.email,
  }))
}

export async function getNotificationTeamTargets() {
  const response = await api.get("/admin/notification-rules/targets/teams")
  const data = unwrapApiResponse<TeamTarget[]>(response.data)
  return data.map<NotificationRuleTarget>((item) => ({
    id: item.id,
    name: item.name,
    description: item.code,
  }))
}

export async function getNotificationRoleTargets() {
  const response = await api.get("/admin/notification-rules/targets/roles")
  const data = unwrapApiResponse<RoleTarget[]>(response.data)
  return data.map<NotificationRuleTarget>((item) => ({
    id: item.id,
    name: item.name,
    description: item.normalizedCode ?? item.code,
  }))
}
