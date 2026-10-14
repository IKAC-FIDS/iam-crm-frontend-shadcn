import { api } from "@/lib/api"
import { unwrapApiResponse } from "@/lib/apiResponse"
import { portalApi } from "@/features/portalAuth/portalAuth.api"
import type {
  CustomerRequest,
  FormSchema,
  Page,
  RequestStatus,
  RequestType,
  RequestCrmLink,
  RequestOperationalHistory,
  RequestPriority,
  RequestRoutingDestination,
  CreateLinkedTaskInput,
  CreateLinkedOpportunityInput,
  CreateLinkedTechnicalDocumentInput,
} from "./customerRequests.types"
const unwrap = <T>(p: Promise<{ data: unknown }>) =>
  p.then((r) => unwrapApiResponse<T>(r.data))
export const portalRequestApi = {
  types: () => unwrap<RequestType[]>(portalApi.get("/portal/request-types")),
  type: (id: string) =>
    unwrap<RequestType>(portalApi.get(`/portal/request-types/${id}`)),
  list: (params?: Record<string, unknown>) =>
    unwrap<Page<CustomerRequest>>(
      portalApi.get("/portal/requests", { params })
    ),
  detail: (id: string) =>
    unwrap<CustomerRequest>(portalApi.get(`/portal/requests/${id}`)),
  create: (input: {
    requestTypeId: string
    title: string
    answers?: Record<string, unknown>
  }) => unwrap<CustomerRequest>(portalApi.post("/portal/requests", input)),
  save: (
    id: string,
    input: { title?: string; answers: Record<string, unknown> }
  ) =>
    unwrap<CustomerRequest>(
      portalApi.patch(`/portal/requests/${id}/draft`, input)
    ),
  submit: (id: string) =>
    unwrap<CustomerRequest>(portalApi.post(`/portal/requests/${id}/submit`)),
  cancel: (id: string) =>
    unwrap<CustomerRequest>(portalApi.post(`/portal/requests/${id}/cancel`)),
  shares: (id: string) =>
    unwrap<unknown[]>(portalApi.get(`/portal/requests/${id}/shares`)),
  share: (id: string, membershipId: string) =>
    unwrap(portalApi.post(`/portal/requests/${id}/shares`, { membershipId })),
  revokeShare: (id: string, shareId: string) =>
    unwrap(portalApi.delete(`/portal/requests/${id}/shares/${shareId}`)),
  members: () =>
    unwrap<{
      memberships: Array<{
        id: string
        status: string
        user: { id: string; fullName: string; email: string }
      }>
    }>(portalApi.get("/portal/company/users")),
}
export const internalRequestApi = {
  types: (includeRetired = false) =>
    unwrap<RequestType[]>(
      api.get("/admin/customer-request-types", { params: { includeRetired } })
    ),
  createType: (input: {
    code: string
    displayName: string
    description?: string
  }) => unwrap<RequestType>(api.post("/admin/customer-request-types", input)),
  updateType: (id: string, input: Record<string, unknown>) =>
    unwrap<RequestType>(
      api.patch(`/admin/customer-request-types/${id}`, input)
    ),
  availability: (id: string, companyIds: string[]) =>
    unwrap(
      api.patch(`/admin/customer-request-types/${id}/availability`, {
        companyIds,
      })
    ),
  saveForm: (id: string, schema: FormSchema) =>
    unwrap(
      api.post(`/admin/customer-request-types/${id}/form-draft`, { schema })
    ),
  publish: (id: string) =>
    unwrap(api.post(`/admin/customer-request-types/${id}/form-publish`)),
  versions: (id: string) =>
    unwrap<
      Array<{
        id: string
        version: number
        status: string
        schema: FormSchema
        publishedAt?: string
      }>
    >(api.get(`/admin/customer-request-types/${id}/form-versions`)),
  list: (params?: Record<string, unknown>) =>
    unwrap<Page<CustomerRequest>>(api.get("/customer-requests", { params })),
  detail: (id: string) =>
    unwrap<CustomerRequest>(api.get(`/customer-requests/${id}`)),
  triageList: (params?: Record<string, unknown>) => unwrap<Page<CustomerRequest>>(api.get("/customer-requests/triage", { params })),
  triageOptions: () => unwrap<{ teams: Array<{ id: string; name: string; code: string }>; requestTypes: Array<{ id: string; displayName: string }> }>(api.get("/customer-requests/triage-options")),
  updateTriage: (id: string, input: { expectedRevision: number; priority?: RequestPriority; assignedToId?: string | null; responsibleTeamId?: string | null; routingDestination?: RequestRoutingDestination; internalReason?: string; completeTriage?: boolean }) => unwrap<CustomerRequest>(api.patch(`/customer-requests/${id}/triage`, input)),
  triageHistory: (id: string) => unwrap<RequestOperationalHistory[]>(api.get(`/customer-requests/${id}/triage-history`)),
  links: (id: string) => unwrap<RequestCrmLink[]>(api.get(`/customer-requests/${id}/crm-links`)),
  linkExisting: (id: string, input: { targetType: string; targetId: string; purpose?: string }) => unwrap<RequestCrmLink>(api.post(`/customer-requests/${id}/crm-links`, input)),
  unlink: (id: string, linkId: string, reason: string) => unwrap<RequestCrmLink>(api.delete(`/customer-requests/${id}/crm-links/${linkId}`, { data: { reason } })),
  createLinkedTask: (id: string, input: CreateLinkedTaskInput) => unwrap<RequestCrmLink>(api.post(`/customer-requests/${id}/crm-links/tasks`, input)),
  createLinkedOpportunity: (id: string, input: CreateLinkedOpportunityInput) => unwrap<RequestCrmLink>(api.post(`/customer-requests/${id}/crm-links/opportunities`, input)),
  createLinkedTechnicalDocument: (id: string, input: CreateLinkedTechnicalDocumentInput) => unwrap<RequestCrmLink>(api.post(`/customer-requests/${id}/crm-links/technical-documents`, input)),
  assignees: () => unwrap<{ data: Array<{ id: string; fullName?: string; label?: string; email?: string }> }>(api.get("/users/assignee-options", { params: { page: 1, limit: 100 } })).then((value) => value.data),
  status: (
    id: string,
    status: RequestStatus,
    customerVisibleExplanation?: string,
    internalReason?: string
  ) =>
    unwrap(
      api.patch(`/customer-requests/${id}/status`, {
        status,
        customerVisibleExplanation,
        internalReason,
      })
    ),
  companies: () =>
    unwrap<
      | Array<{ id: string; legalName: string; brandName?: string | null }>
      | {
          data: Array<{
            id: string
            legalName: string
            brandName?: string | null
          }>
        }
    >(api.get("/companies", { params: { page: 1, limit: 100 } })).then(
      (value) => (Array.isArray(value) ? value : value.data)
    ),
}
