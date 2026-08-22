import {api} from "@/lib/api"
import {unwrapApiResponse} from "@/lib/apiResponse"
import type {Notification,NotificationPage,NotificationQuery} from "../types/notification.types"
const clean=(x:object)=>Object.fromEntries(Object.entries(x).filter(([,v])=>v!==undefined&&v!==""))
function pg(v:unknown):NotificationPage{const b=unwrapApiResponse<any>(v)||{},data=b.data??b.items??[],total=b.meta?.total??b.total??data.length,page=b.meta?.page??b.page??1,limit=b.meta?.limit??b.limit??20;return{data,meta:{total,page,limit,totalPages:b.meta?.totalPages??b.totalPages??Math.max(1,Math.ceil(total/Math.max(1,limit)))}}}
export async function getNotifications(q:NotificationQuery={}){const r=await api.get("/notifications",{params:clean(q)});return pg(r.data)}
export async function getUnreadCount(){const r=await api.get("/notifications/unread-count");return unwrapApiResponse<{total?:number}>(r.data)?.total??0}
export async function markRead(id:string){const r=await api.patch(`/notifications/${id}/read`);return unwrapApiResponse<Notification>(r.data)}
export async function markUnread(id:string){const r=await api.patch(`/notifications/${id}/unread`);return unwrapApiResponse<Notification>(r.data)}
export async function readAll(){await api.patch("/notifications/read-all",{})}
export async function archive(id:string){const r=await api.patch(`/notifications/${id}/archive`);return unwrapApiResponse<Notification>(r.data)}
export async function unarchive(id:string){const r=await api.patch(`/notifications/${id}/unarchive`);return unwrapApiResponse<Notification>(r.data)}
export async function removeNotification(id:string){await api.delete(`/notifications/${id}`)}
