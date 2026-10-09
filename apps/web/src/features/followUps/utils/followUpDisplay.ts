import type {ActivityType} from "../types/followUp.types"
export function dueStatus(v?:string|null){if(!v)return"unknown";const d=new Date(v),n=new Date(),t=new Date(n.getFullYear(),n.getMonth(),n.getDate()),tm=new Date(n.getFullYear(),n.getMonth(),n.getDate()+1);if(d<t)return"overdue";if(d<tm)return"today";return"upcoming"}
export function dueLabel(s:string){return s==="overdue"?"عقب‌افتاده":s==="today"?"امروز":s==="upcoming"?"پیش‌رو":"نامشخص"}
export function activityLabel(t:ActivityType){return ({CALL:"تماس",EMAIL:"ایمیل",LINKEDIN_MESSAGE:"پیام لینکدین",LINKEDIN_ENGAGEMENT:"تعامل لینکدین",MEETING:"جلسه",NOTE:"یادداشت",STAGE_CHANGE:"تغییر مرحله"} as Record<ActivityType,string>)[t]}
export function dt(v?:string|null){if(!v)return"—";const d=new Date(v);return Number.isNaN(d.getTime())?"—":new Intl.DateTimeFormat("fa-IR",{dateStyle:"medium",timeStyle:"short"}).format(d)}
