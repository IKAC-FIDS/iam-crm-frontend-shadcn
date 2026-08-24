import { AlertTriangle, Bell, CheckCircle2, ClipboardCheck, MoreHorizontal, RotateCcw, Search } from "lucide-react"
import { useMemo, useState, type ReactNode } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { toast } from "sonner"

import { DataTableShell, type DataTableColumn } from "@/components/shared/DataTableShell"
import { EmptyState } from "@/components/shared/EmptyState"
import { ErrorState } from "@/components/shared/ErrorState"
import { LoadingState } from "@/components/shared/LoadingState"
import { PaginationControls } from "@/components/shared/PaginationControls"
import { PersianDateTimePicker } from "@/components/shared/PersianDateTimePicker"
import { StatusBadge, type StatusTone } from "@/components/shared/StatusBadge"
import { getApiErrorMessage } from "@/lib/apiResponse"
import { useAuthStore } from "@/store/authStore"
import { Button } from "@workspace/ui/components/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@workspace/ui/components/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@workspace/ui/components/dropdown-menu"
import { Input } from "@workspace/ui/components/input"

import { useCompleteFollowUp, useDueFollowUps, useRescheduleFollowUp } from "@/features/followUps/hooks/useFollowUps"
import type { FollowUpActivity, FollowUpFilter } from "@/features/followUps/types/followUp.types"
import { activityLabel, dt, dueLabel, dueStatus } from "@/features/followUps/utils/followUpDisplay"
import { useArchive, useDeleteNotification, useMarkRead, useMarkUnread, useNotifications, useReadAll, useUnarchive, useUnreadCount } from "@/features/notifications/hooks/useNotifications"
import type { Notification, NotificationPriority } from "@/features/notifications/types/notification.types"

const PAGE_SIZE = 20
type NotificationQuick = "all" | "unread" | "important" | "archived"

export function AttentionCenterPage() {
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  const permissions = useAuthStore((state) => state.user?.permissions ?? [])

  const canFollow = permissions.includes("follow-up:view") || permissions.includes("activity:view")
  const canNotifications = permissions.includes("notification:view")
  const canManageNotifications = permissions.includes("notification:manage")
  const canComplete = permissions.includes("follow-up:complete")
  const canReschedule = permissions.includes("follow-up:reschedule")

  const tab = params.get("tab") === "notifications" && canNotifications ? "notifications" : canFollow ? "follow-ups" : "notifications"
  const quick = normalizeFollowFilter(params.get("quick"))
  const page = Math.max(1, Number(params.get("page") || 1))

  const followUps = useDueFollowUps(page, PAGE_SIZE, canFollow)
  const preview = useDueFollowUps(1, 50, canFollow)
  const unread = useUnreadCount(canNotifications)

  const stats = useMemo(() => {
    const items = preview.data?.data ?? []
    return {
      overdue: items.filter((item) => dueStatus(item.nextActionDate) === "overdue").length,
      today: items.filter((item) => dueStatus(item.nextActionDate) === "today").length,
      unread: unread.data ?? 0,
    }
  }, [preview.data?.data, unread.data])

  function patch(values: Record<string, string | null>) {
    setParams((current) => {
      const next = new URLSearchParams(current)
      Object.entries(values).forEach(([key, value]) => value === null ? next.delete(key) : next.set(key, value))
      return next
    })
  }

  if (!canFollow && !canNotifications) {
    return <ErrorState title="دسترسی محدود" description="دسترسی مشاهده پیگیری‌ها یا اعلان‌ها برای شما فعال نیست." />
  }

  return (
    <div className="grid min-w-0 gap-5" dir="rtl">
      <section className="relative overflow-hidden rounded-[30px] border border-[var(--app-divider)] bg-[var(--app-surface)] px-5 py-6 shadow-[var(--app-shadow-card)] sm:px-7">
        <div className="pointer-events-none absolute -end-20 -top-28 size-64 rounded-full bg-[var(--app-primary-soft)] blur-3xl" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[var(--app-divider)] bg-[var(--app-background)]/70 px-3 py-1.5 text-[10px] font-bold text-[var(--app-primary)]">
              <Bell className="size-3.5" /> مرکز توجه و پیگیری
            </div>
            <h1 className="text-2xl font-bold text-[var(--app-heading)] sm:text-3xl">مرکز پیگیری و اعلان‌ها</h1>
            <p className="mt-2 max-w-xl text-xs leading-6 text-[var(--app-text-secondary)]">موارد نیازمند اقدام، پیگیری و اعلان‌های مهم را در یک نمای متمرکز مدیریت کنید.</p>
          </div>
          <div className="flex rounded-xl border border-[var(--app-divider)] bg-[var(--app-background)] p-1">
            {canFollow ? <Button type="button" variant="ghost" size="sm" className={tab === "follow-ups" ? "rounded-lg bg-[var(--app-surface)] text-[var(--app-primary)] shadow-sm" : "rounded-lg"} onClick={() => patch({tab:"follow-ups",page:"1",quick:null})}><ClipboardCheck className="size-4" />پیگیری‌ها</Button> : null}
            {canNotifications ? <Button type="button" variant="ghost" size="sm" className={tab === "notifications" ? "rounded-lg bg-[var(--app-surface)] text-[var(--app-primary)] shadow-sm" : "rounded-lg"} onClick={() => patch({tab:"notifications",page:"1",quick:null})}><Bell className="size-4" />اعلان‌ها{stats.unread > 0 ? <span className="rounded-full bg-[var(--destructive)] px-1.5 text-[9px] text-white">{stats.unread.toLocaleString("fa-IR")}</span> : null}</Button> : null}
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        {canFollow ? <>
          <Kpi title="عقب‌افتاده" number={stats.overdue} icon={<AlertTriangle className="size-4" />} active={tab === "follow-ups" && quick === "OVERDUE"} onClick={() => patch({tab:"follow-ups",quick:"OVERDUE",page:"1"})} />
          <Kpi title="پیگیری امروز" number={stats.today} icon={<ClipboardCheck className="size-4" />} active={tab === "follow-ups" && quick === "TODAY"} onClick={() => patch({tab:"follow-ups",quick:"TODAY",page:"1"})} />
        </> : null}
        {canNotifications ? <Kpi title="اعلان خوانده‌نشده" number={stats.unread} icon={<Bell className="size-4" />} active={tab === "notifications"} onClick={() => patch({tab:"notifications",quick:null,page:"1"})} /> : null}
      </section>

      {tab === "follow-ups" ? (
        <FollowUpList items={followUps.data?.data ?? []} loading={followUps.isLoading} error={followUps.isError} fetching={followUps.isFetching} page={followUps.data?.meta.page ?? page} pageCount={followUps.data?.meta.totalPages ?? 1} filter={quick} canComplete={canComplete} canReschedule={canReschedule} onRetry={() => void followUps.refetch()} onPage={(next) => patch({page:String(next)})} onFilter={(value) => patch({quick:value === "ALL" ? null : value,page:"1"})} onCompany={(id) => navigate(`/companies/${id}`)} />
      ) : (
        <NotificationList canManage={canManageNotifications} navigate={navigate} />
      )}
    </div>
  )
}

function Kpi({title,number,icon,active,onClick}:{title:string;number:number;icon:ReactNode;active?:boolean;onClick:()=>void}) {
  return <button type="button" onClick={onClick} className={["rounded-[20px] border p-4 text-start transition",active ? "border-[var(--app-primary)] bg-[var(--app-primary-soft)]" : "border-[var(--app-divider)] bg-[var(--app-surface)] hover:border-[var(--app-primary)]/40"].join(" ")}><div className="flex items-center gap-2 text-xs text-[var(--app-text-secondary)]"><span className="text-[var(--app-primary)]">{icon}</span>{title}</div><div className="mt-2 text-2xl font-bold text-[var(--app-heading)]">{number.toLocaleString("fa-IR")}</div></button>
}

function normalizeFollowFilter(value:string|null):FollowUpFilter { return value === "OVERDUE" || value === "TODAY" || value === "UPCOMING" ? value : "ALL" }

function FollowUpList({items,loading,error,fetching,page,pageCount,filter,canComplete,canReschedule,onRetry,onPage,onFilter,onCompany}:{items:FollowUpActivity[];loading:boolean;error:boolean;fetching:boolean;page:number;pageCount:number;filter:FollowUpFilter;canComplete:boolean;canReschedule:boolean;onRetry:()=>void;onPage:(page:number)=>void;onFilter:(value:FollowUpFilter)=>void;onCompany:(id:string)=>void}) {
  const [selected,setSelected] = useState<FollowUpActivity|null>(null)
  const [mode,setMode] = useState<"complete"|"reschedule"|null>(null)
  const shown = filter === "ALL" ? items : items.filter((item) => dueStatus(item.nextActionDate) === filter.toLowerCase())

  const columns:DataTableColumn<FollowUpActivity>[] = [
    {id:"followUp",header:"پیگیری",className:"min-w-60",cell:(item)=><div className="min-w-0"><p className="truncate text-xs font-bold text-[var(--app-heading)]">{item.outcome || activityLabel(item.type)}</p><p className="mt-1 line-clamp-1 text-[9px] text-[var(--app-text-secondary)]">{item.notes || "بدون یادداشت"}</p></div>},
    {id:"status",header:"وضعیت",className:"min-w-28",cell:(item)=>{const status=dueStatus(item.nextActionDate);return <StatusBadge tone={followUpTone(status)}>{dueLabel(status)}</StatusBadge>}},
    {id:"type",header:"نوع",className:"min-w-32",cell:(item)=>activityLabel(item.type)},
    {id:"company",header:"شرکت",className:"min-w-44",cell:(item)=>item.company?.brandName || item.company?.legalName || "—"},
    {id:"person",header:"شخص",className:"min-w-40",cell:(item)=>item.person?.fullName || "—"},
    {id:"owner",header:"ثبت‌کننده",className:"min-w-40",cell:(item)=>item.user?.fullName || item.user?.email || "—"},
    {id:"due",header:"موعد پیگیری",className:"min-w-44",cell:(item)=><span className={dueStatus(item.nextActionDate) === "overdue" ? "font-bold text-[var(--destructive)]" : undefined}>{dt(item.nextActionDate)}</span>},
    {id:"actions",header:"عملیات",className:"w-16",cell:(item)=><div onClick={(event)=>event.stopPropagation()} onKeyDown={(event)=>event.stopPropagation()}><DropdownMenu><DropdownMenuTrigger render={<Button type="button" size="icon-sm" variant="ghost" className="rounded-xl"/>}><MoreHorizontal className="size-4"/></DropdownMenuTrigger><DropdownMenuContent align="end" dir="rtl">{item.companyId ? <DropdownMenuItem onClick={()=>onCompany(item.companyId)}>مشاهده شرکت</DropdownMenuItem> : null}{canReschedule ? <DropdownMenuItem onClick={()=>{setSelected(item);setMode("reschedule")}}>زمان‌بندی مجدد</DropdownMenuItem> : null}{canComplete ? <DropdownMenuItem onClick={()=>{setSelected(item);setMode("complete")}}>انجام شد</DropdownMenuItem> : null}</DropdownMenuContent></DropdownMenu></div>},
  ]

  return <div className="grid min-w-0 gap-4">
    <section className="rounded-[24px] border border-[var(--app-divider)] bg-[var(--app-surface)] p-3 shadow-[var(--app-shadow-card)]"><div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between"><div className="flex min-w-0 flex-wrap gap-1.5">{(["ALL","OVERDUE","TODAY","UPCOMING"] as FollowUpFilter[]).map((value)=><button key={value} type="button" onClick={()=>onFilter(value)} className={["inline-flex h-8 items-center rounded-lg px-3 text-[10px] font-bold transition",filter===value ? "bg-[var(--app-primary)] text-[var(--app-on-primary)] shadow-sm" : "border border-[var(--app-divider)] bg-[var(--app-background)] text-[var(--app-text-secondary)] hover:text-[var(--app-primary)]"].join(" ")}>{followUpFilterLabel(value)}</button>)}</div>{filter!=="ALL" ? <Button type="button" variant="ghost" size="sm" className="shrink-0 rounded-xl text-[var(--app-text-secondary)]" onClick={()=>onFilter("ALL")}><RotateCcw className="size-3.5"/>پاک کردن فیلتر</Button> : null}</div></section>

    {loading ? <LoadingState rows={6}/> : error ? <ErrorState title="دریافت پیگیری‌ها ناموفق بود" description="اطلاعات پیگیری‌ها دریافت نشد." retryLabel="تلاش مجدد" onRetry={onRetry}/> : <><div className="w-full max-w-full overflow-x-auto"><div className="min-w-[1050px]"><DataTableShell rows={shown} columns={columns} getRowKey={(item)=>item.id} emptyState={<EmptyState icon={ClipboardCheck} title="پیگیری‌ای وجود ندارد" description="در این فیلتر موردی برای نمایش وجود ندارد."/>}/></div></div>{pageCount>1 ? <PaginationControls page={page} pageCount={pageCount} disabled={fetching} onPageChange={onPage}/> : null}</>}

    <FollowUpActionDialog item={selected} mode={mode} onClose={()=>{setSelected(null);setMode(null)}}/>
  </div>
}

function FollowUpActionDialog({item,mode,onClose}:{item:FollowUpActivity|null;mode:"complete"|"reschedule"|null;onClose:()=>void}) {
  const complete=useCompleteFollowUp(), reschedule=useRescheduleFollowUp()
  const [note,setNote]=useState(""), [outcome,setOutcome]=useState(""), [date,setDate]=useState<Date|undefined>()
  const open=Boolean(item&&mode)
  async function submit(){if(!item||!mode)return;try{if(mode==="complete")await complete.mutateAsync({id:item.id,outcome:outcome||item.outcome||"",note});else await reschedule.mutateAsync({id:item.id,nextActionDate:date?.toISOString()||item.nextActionDate||"",note});toast.success("پیگیری بروزرسانی شد.");setNote("");setOutcome("");setDate(undefined);onClose()}catch(error){toast.error(getApiErrorMessage(error,"عملیات پیگیری انجام نشد."))}}
  return <Dialog open={open} onOpenChange={(next)=>{if(!next)onClose()}}><DialogContent dir="rtl"><DialogHeader><DialogTitle>{mode==="complete" ? "تکمیل پیگیری" : "زمان‌بندی مجدد"}</DialogTitle></DialogHeader>{mode==="complete" ? <textarea className="w-full rounded-xl border border-input bg-transparent p-3 text-sm outline-none" rows={4} value={outcome} onChange={(e)=>setOutcome(e.target.value)} placeholder={item?.outcome||"نتیجه پیگیری"}/> : <PersianDateTimePicker value={date ?? (item?.nextActionDate ? new Date(item.nextActionDate) : undefined)} onChange={setDate}/>}<textarea className="w-full rounded-xl border border-input bg-transparent p-3 text-sm outline-none" rows={3} value={note} onChange={(e)=>setNote(e.target.value)} placeholder="یادداشت"/><Button type="button" className="rounded-xl" onClick={()=>void submit()} disabled={complete.isPending||reschedule.isPending}>{mode==="complete" ? <CheckCircle2 className="size-4"/> : null}ذخیره</Button></DialogContent></Dialog>
}

function followUpTone(status:ReturnType<typeof dueStatus>):StatusTone { if(status==="overdue")return "error";if(status==="today")return "warning";return "info" }
function followUpFilterLabel(value:FollowUpFilter){if(value==="OVERDUE")return "عقب‌افتاده";if(value==="TODAY")return "امروز";if(value==="UPCOMING")return "پیش‌رو";return "همه"}

function NotificationList({canManage,navigate}:{canManage:boolean;navigate:(path:string)=>void}) {
  const [search,setSearch]=useState("")
  const [quick,setQuick]=useState<NotificationQuick>("all")
  const [page,setPage]=useState(1)
  const query=useNotifications({page,limit:PAGE_SIZE,search:search.trim()||undefined,status:quick==="unread"?"unread":"all",priority:quick==="important"?"HIGH":undefined,archivedOnly:quick==="archived"?true:undefined})
  const readAll=useReadAll(), markRead=useMarkRead(), markUnread=useMarkUnread(), archive=useArchive(), unarchive=useUnarchive(), remove=useDeleteNotification()

  async function openNotification(notification:Notification){if(canManage&&!notification.readAt)await markRead.mutateAsync(notification.id);if(notification.actionUrl?.startsWith("/")&&!notification.actionUrl.startsWith("//"))navigate(notification.actionUrl)}

  const columns:DataTableColumn<Notification>[]=[
    {id:"notification",header:"اعلان",className:"min-w-72",cell:(n)=><div className="min-w-0"><div className="flex items-center gap-2">{!n.readAt?<span className="size-2 shrink-0 rounded-full bg-[var(--app-primary)]"/>:null}<p className="truncate text-xs font-bold text-[var(--app-heading)]">{n.title}</p></div><p className="mt-1 line-clamp-1 text-[9px] text-[var(--app-text-secondary)]">{n.body||"بدون توضیح"}</p></div>},
    {id:"status",header:"وضعیت",className:"min-w-32",cell:(n)=><StatusBadge tone={n.readAt?"neutral":"primary"}>{n.readAt?"خوانده‌شده":"خوانده‌نشده"}</StatusBadge>},
    {id:"priority",header:"اولویت",className:"min-w-28",cell:(n)=><StatusBadge tone={notificationPriorityTone(n.priority)} dot={false}>{notificationPriorityLabel(n.priority)}</StatusBadge>},
    {id:"type",header:"نوع",className:"min-w-44",cell:(n)=>notificationTypeLabel(n.type)},
    {id:"actor",header:"ایجادکننده",className:"min-w-40",cell:(n)=>n.actor?.fullName||n.actor?.email||"سیستم"},
    {id:"createdAt",header:"تاریخ",className:"min-w-44",cell:(n)=>dt(n.createdAt)},
    {id:"actions",header:"عملیات",className:"w-16",cell:(n)=><div onClick={(event)=>event.stopPropagation()} onKeyDown={(event)=>event.stopPropagation()}><DropdownMenu><DropdownMenuTrigger render={<Button type="button" size="icon-sm" variant="ghost" className="rounded-xl"/>}><MoreHorizontal className="size-4"/></DropdownMenuTrigger><DropdownMenuContent align="end" dir="rtl">{n.actionUrl?<DropdownMenuItem onClick={()=>void openNotification(n)}>مشاهده</DropdownMenuItem>:null}{canManage?<><DropdownMenuItem onClick={()=>void(!n.readAt?markRead.mutateAsync(n.id):markUnread.mutateAsync(n.id))}>{!n.readAt?"علامت‌گذاری به‌عنوان خوانده‌شده":"علامت‌گذاری به‌عنوان خوانده‌نشده"}</DropdownMenuItem><DropdownMenuItem onClick={()=>void(n.archivedAt?unarchive.mutateAsync(n.id):archive.mutateAsync(n.id))}>{n.archivedAt?"خروج از بایگانی":"بایگانی"}</DropdownMenuItem><DropdownMenuSeparator/><DropdownMenuItem onClick={()=>{if(window.confirm("این اعلان حذف شود؟"))void remove.mutateAsync(n.id)}}>حذف</DropdownMenuItem></>:null}</DropdownMenuContent></DropdownMenu></div>},
  ]

  return <div className="grid min-w-0 gap-4">
    <section className="rounded-[24px] border border-[var(--app-divider)] bg-[var(--app-surface)] p-3 shadow-[var(--app-shadow-card)]"><div className="grid gap-3 lg:grid-cols-[minmax(260px,1fr)_auto_auto] lg:items-center"><div className="relative min-w-0"><Search className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-[var(--app-icon-muted)]"/><Input value={search} onChange={(e)=>{setSearch(e.target.value);setPage(1)}} placeholder="جستجو در اعلان‌ها..." className="h-11 rounded-xl pe-9"/></div><div className="flex min-w-max rounded-xl border border-[var(--app-divider)] bg-[var(--app-background)] p-1">{(["all","unread","important","archived"] as NotificationQuick[]).map((value)=><button key={value} type="button" onClick={()=>{setQuick(value);setPage(1)}} className={["rounded-lg px-3 py-2 text-[10px] font-bold transition",quick===value?"bg-[var(--app-primary)] text-[var(--app-on-primary)] shadow-sm":"text-[var(--app-text-secondary)] hover:text-[var(--app-primary)]"].join(" ")}>{notificationFilterLabel(value)}</button>)}</div>{canManage?<Button type="button" variant="outline" className="h-11 rounded-xl" onClick={()=>void readAll.mutateAsync()} disabled={readAll.isPending}>خواندن همه</Button>:null}</div>{search||quick!=="all"?<div className="mt-3 flex justify-end border-t border-[var(--app-divider)] pt-3"><Button type="button" variant="ghost" size="sm" className="rounded-xl text-[var(--app-text-secondary)]" onClick={()=>{setSearch("");setQuick("all");setPage(1)}}><RotateCcw className="size-3.5"/>پاک کردن فیلترها</Button></div>:null}</section>

    {query.isLoading?<LoadingState rows={6}/>:query.isError?<ErrorState title="دریافت اعلان‌ها ناموفق بود" description="اطلاعات اعلان‌ها دریافت نشد." retryLabel="تلاش مجدد" onRetry={()=>void query.refetch()}/>:<><div className="w-full max-w-full overflow-x-auto"><div className="min-w-[1050px]"><DataTableShell rows={query.data?.data??[]} columns={columns} getRowKey={(n)=>n.id} onRowClick={(n)=>void openNotification(n)} emptyState={<EmptyState icon={Bell} title="اعلانی وجود ندارد" description="در این فیلتر اعلانی برای نمایش وجود ندارد."/>}/></div></div>{(query.data?.meta.totalPages??1)>1?<PaginationControls page={query.data?.meta.page??page} pageCount={query.data?.meta.totalPages??1} disabled={query.isFetching} onPageChange={setPage}/>:null}</>}
  </div>
}

function notificationFilterLabel(value:NotificationQuick){if(value==="unread")return "خوانده‌نشده";if(value==="important")return "مهم";if(value==="archived")return "بایگانی";return "همه"}
function notificationPriorityLabel(priority:NotificationPriority){if(priority==="URGENT")return "فوری";if(priority==="HIGH")return "بالا";if(priority==="LOW")return "پایین";return "عادی"}
function notificationPriorityTone(priority:NotificationPriority):StatusTone{if(priority==="URGENT")return "error";if(priority==="HIGH")return "warning";if(priority==="LOW")return "neutral";return "info"}
function notificationTypeLabel(type:Notification["type"]){const labels:Partial<Record<Notification["type"],string>>={SYSTEM:"سیستمی",TASK_CREATED:"ایجاد کار",TASK_ASSIGNED:"تخصیص کار",TASK_STATUS_CHANGED:"تغییر وضعیت کار",TASK_COMPLETED:"تکمیل کار",TASK_RESCHEDULED:"زمان‌بندی مجدد کار",OPPORTUNITY_UPDATED:"بروزرسانی فرصت",COMMERCIAL_DOCUMENT_UPDATED:"بروزرسانی سند تجاری",PAYMENT_UPDATED:"بروزرسانی پرداخت",ATTACHMENT_UPLOADED:"بارگذاری پیوست",MEETING_REMINDER:"یادآوری جلسه"};return labels[type]||type}
