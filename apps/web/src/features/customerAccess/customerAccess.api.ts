import { api } from "@/lib/api"
import { unwrapApiResponse } from "@/lib/apiResponse"
export type CustomerRole="CUSTOMER_ADMIN"|"CUSTOMER_USER"; export type MembershipStatus="INVITED"|"ACTIVE"|"SUSPENDED"|"REVOKED"
export interface PortalMembership { id:string; role:CustomerRole; status:MembershipStatus; activatedAt:string|null; lastAccessAt:string|null; user:{id:string;fullName:string;email:string;isActive:boolean} }
export interface PortalInvitation { id:string;normalizedEmail:string;role:CustomerRole;expiresAt:string;createdAt:string }
export interface CompanyPortalAccess { portalEnabled:boolean;portalEnabledAt:string|null;memberships:PortalMembership[];invitations:PortalInvitation[] }
const base=(companyId:string)=>`/companies/${companyId}/portal-access`
export async function getCompanyPortalAccess(companyId:string){return unwrapApiResponse<CompanyPortalAccess>((await api.get(base(companyId))).data)}
export async function setCompanyPortalAccess(companyId:string,enabled:boolean){return unwrapApiResponse<CompanyPortalAccess>((await api.patch(base(companyId),{enabled})).data)}
export async function inviteCustomer(companyId:string,email:string,role:CustomerRole){return unwrapApiResponse((await api.post(`${base(companyId)}/invitations`,{email,role})).data)}
export async function resendCustomerInvitation(companyId:string,id:string){return unwrapApiResponse((await api.post(`${base(companyId)}/invitations/${id}/resend`)).data)}
export async function revokeCustomerInvitation(companyId:string,id:string){return unwrapApiResponse((await api.delete(`${base(companyId)}/invitations/${id}`)).data)}
export async function updateCustomerMembership(companyId:string,id:string,input:{role?:CustomerRole;status?:MembershipStatus}){return unwrapApiResponse<CompanyPortalAccess>((await api.patch(`${base(companyId)}/memberships/${id}`,input)).data)}
