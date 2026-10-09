import { z } from 'zod'
import { api } from '@/lib/api'
import { unwrapApiResponse } from '@/lib/apiResponse'
import { parsePaginatedResponse, type PaginationMeta } from '@/lib/pagination'

export type Domain = 'timesheets' | 'leave-requests'
export type Entry = {
  id: string; userId: string; type: string; status: string; workDate?: string; startDate?: string; endDate?: string;
  startMinute: number | null; endMinute: number | null; spansMidnight?: boolean; durationMinutes?: number; requestedMinutes?: number | null;
  breakMinutes?: number; unit?: string; description?: string | null; reason?: string | null; rejectionReason?: string | null;
  teamNameSnapshot?: string | null; taskId?: string | null; companyId?: string | null;
  task?: { id: string; title: string } | null; company?: { id: string; legalName: string } | null;
  user?: { id: string; fullName: string }; reviewedByMembership?: { user: { fullName: string } } | null;
  approvalHistory?: { id: string; action: string; fromStatus: string; toStatus: string; reason?: string; createdAt: string; actorMembership?: { user: { fullName: string } } }[];
}
export type Metrics = { regularWorkedMinutes: number; approvedOvertimeMinutes: number; pendingOvertimeMinutes: number; actualWorkedMinutes: number;
  approvedLeaveMinutes: number | null; pendingLeaveMinutes: number | null; scheduledMinutes: number | null; attendanceVarianceMinutes: number | null }
export type EmployeeReport = Metrics & { employeeId: string; employeeName: string; historicalTeams: { id: string | null; name: string | null }[] }
export type Report = { data: EmployeeReport[]; totals: Metrics; meta: PaginationMeta; reportingMetadata: { boundaryLeaveRequests: number; leaveAuthorized: boolean } }
export type Filters = Record<string, string | number | undefined>
const clean = (filters: Filters) => Object.fromEntries(Object.entries(filters).filter(([, value]) => value !== '' && value !== undefined))
export async function listEntries(domain: Domain, manager: boolean, filters: Filters) {
  const response = await api.get(manager ? `/admin/${domain}` : `/${domain}/me`, { params: clean(filters) })
  return parsePaginatedResponse(response.data, z.custom<Entry>(value => !!value && typeof value === 'object' && 'id' in value && 'status' in value))
}
export async function timesheetReport(personal: boolean, filters: Filters) {
  return unwrapApiResponse<Report>((await api.get(personal ? '/timesheets/me/summary' : '/admin/timesheets/reports', { params: clean(filters) })).data)
}
export async function saveEntry(domain: Domain, payload: Record<string, unknown>, id?: string) {
  return unwrapApiResponse<Entry>((await (id ? api.patch(`/${domain}/${id}`, payload) : api.post(`/${domain}`, payload))).data)
}
export async function decideEntry(domain: Domain, id: string, action: string, reason?: string) {
  return api.post(`${action === 'approve' || action === 'reject' ? '/admin' : ''}/${domain}/${id}/${action}`, reason ? { reason } : {})
}
export async function filterOptions(domain: Domain) {
  return unwrapApiResponse<{ teams: { id: string; name: string }[]; employees: { id: string; fullName: string }[]; limited: boolean }>(
    (await api.get('/admin/timesheets/filter-options', { params: { domain: domain === 'timesheets' ? 'timesheet' : 'leave' } })).data)
}
export async function exportTimesheets(filters: Filters) {
  const response = await api.get('/admin/timesheets/export', { params: clean(filters), responseType: 'blob' })
  const url = URL.createObjectURL(response.data)
  const link = document.createElement('a'); link.href = url; link.download = `timesheets-${filters.dateFrom}-${filters.dateTo}.xlsx`
  document.body.append(link); link.click(); link.remove(); window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}
