import {api} from "@/lib/api"
import {unwrapApiResponse} from "@/lib/apiResponse"
import type {FollowUpActivity,FollowUpPage} from "../types/followUp.types"
function page(v:unknown,p:number,l:number):FollowUpPage{
 const b=unwrapApiResponse<any>(v)||{}; const data=Array.isArray(b)?b:(b.data??b.items??[]);
 const total=b.meta?.total??b.total??data.length, pg=b.meta?.page??b.page??p, lim=b.meta?.limit??b.limit??l;
 return {data,meta:{total,page:pg,limit:lim,totalPages:b.meta?.totalPages??b.totalPages??Math.max(1,Math.ceil(total/Math.max(1,lim)))}}
}
export async function getDueFollowUps(p=1,l=20){const r=await api.get("/activities/follow-ups/due",{params:{page:p,limit:l}});return page(r.data,p,l)}
export async function completeFollowUp(id:string,outcome?:string,note?:string){const r=await api.patch(`/activities/${id}/complete`,{outcome:outcome?.trim()||undefined,completionNote:note?.trim()||undefined});return unwrapApiResponse<FollowUpActivity>(r.data)}
export async function rescheduleFollowUp(id:string,nextActionDate:string,note?:string){const r=await api.patch(`/activities/${id}/reschedule`,{nextActionDate,note:note?.trim()||undefined});return unwrapApiResponse<FollowUpActivity>(r.data)}
