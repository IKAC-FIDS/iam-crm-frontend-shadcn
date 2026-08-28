import { useQuery } from "@tanstack/react-query"
import { useQueryScope } from "@/lib/queryScope"
import {
  getAuditLogs,
  getAuditSummary,
  getAuditFilterOptions,
  getAuditLog,
  type AuditLogParams,
} from "../api/adminAuditLogsApi"
export const auditKeys = {
  list: (params: AuditLogParams) => ["admin-audit-logs", params] as const,
  summary: (params: AuditLogParams) => ["admin-audit-summary", params] as const,
  options: () => ["admin-audit-options"] as const,
  detail: (id: string | null) => ["admin-audit-detail", id] as const,
}
export function useAuditQueries(
  params: AuditLogParams,
  page: number,
  limit: number,
  selectedId: string | null
) {
  const scope = useQueryScope()
  const listParams = { ...params, page, limit, compact: true as const }
  const logs = useQuery({
    queryKey: [...auditKeys.list(listParams), scope],
    queryFn: () => getAuditLogs(listParams),
  })
  const summary = useQuery({
    queryKey: [...auditKeys.summary(params), scope],
    queryFn: () => getAuditSummary(params),
  })
  const options = useQuery({
    queryKey: [...auditKeys.options(), scope],
    queryFn: () => getAuditFilterOptions({}),
  })
  const detail = useQuery({
    queryKey: [...auditKeys.detail(selectedId), scope],
    queryFn: () => getAuditLog(selectedId!),
    enabled: Boolean(selectedId),
  })
  return { logs, summary, options, detail }
}
