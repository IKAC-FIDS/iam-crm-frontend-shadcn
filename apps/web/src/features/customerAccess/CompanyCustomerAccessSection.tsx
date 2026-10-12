import { useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { RefreshCw, Send, ShieldCheck, UserRoundPlus } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { SurfaceCard } from "@/components/shared/SurfaceCard"
import { ResponsiveModal } from "@/components/shared/ResponsiveModal"
import { EmptyState } from "@/components/shared/EmptyState"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { getApiErrorMessage } from "@/lib/apiResponse"
import { getCompanyPortalAccess, inviteCustomer, resendCustomerInvitation, revokeCustomerInvitation, setCompanyPortalAccess, updateCustomerMembership, type CustomerRole, type MembershipStatus } from "./customerAccess.api"

export function CompanyCustomerAccessSection({ companyId, canManage }: { companyId: string; canManage: boolean }) {
  const client = useQueryClient(), [open, setOpen] = useState(false), [email, setEmail] = useState(""), [role, setRole] = useState<CustomerRole>("CUSTOMER_USER")
  const key = ["company-portal-access", companyId] as const
  const query = useQuery({ queryKey: key, queryFn: () => getCompanyPortalAccess(companyId) })
  const run = (action: () => Promise<unknown>, message: string) => action().then(() => { toast.success(message); return client.invalidateQueries({ queryKey: key }) }).catch(error => toast.error(getApiErrorMessage(error, "عملیات انجام نشد")))
  if (query.isLoading) return <SurfaceCard><p className="p-5 text-sm text-muted-foreground">در حال بارگذاری کاربران پرتال…</p></SurfaceCard>
  if (!query.data) return <SurfaceCard><p className="p-5 text-sm text-destructive">دریافت اطلاعات پرتال انجام نشد.</p></SurfaceCard>
  const data = query.data
  return <>
    <SurfaceCard>
      <div className="flex flex-wrap items-center gap-3 border-b p-5">
        <ShieldCheck className="size-5 text-[var(--app-primary)]" /><div><h2 className="font-bold">کاربران پرتال</h2><p className="text-xs text-muted-foreground">دسترسی مشتریان این شرکت</p></div>
        <div className="me-auto flex items-center gap-2"><span className="text-sm">{data.portalEnabled ? "فعال" : "غیرفعال"}</span>
          <button type="button" role="switch" aria-label="فعال‌سازی پرتال" aria-checked={data.portalEnabled} disabled={!canManage} className={`relative h-6 w-11 rounded-full disabled:opacity-50 ${data.portalEnabled ? "bg-primary" : "bg-muted"}`} onClick={() => void run(() => setCompanyPortalAccess(companyId, !data.portalEnabled), !data.portalEnabled ? "پرتال فعال شد" : "پرتال غیرفعال شد")}><span className={`absolute top-1 size-4 rounded-full bg-background ${data.portalEnabled ? "end-1" : "start-1"}`} /></button>
          {canManage && <Button size="sm" disabled={!data.portalEnabled} onClick={() => setOpen(true)}><UserRoundPlus className="size-4" />دعوت کاربر</Button>}
        </div>
      </div>
      <div className="grid gap-5 p-5">
        <section><h3 className="mb-3 text-sm font-semibold">اعضای پرتال</h3>{data.memberships.length ? <div className="grid gap-2">{data.memberships.map(m => <div key={m.id} className="flex flex-wrap items-center gap-3 rounded-xl border p-3"><div><div className="font-medium">{m.user.fullName}</div><div dir="ltr" className="text-xs text-muted-foreground">{m.user.email}</div></div><StatusBadge className="me-auto" tone={m.status === "ACTIVE" ? "success" : m.status === "SUSPENDED" ? "warning" : "neutral"}>{m.status === "ACTIVE" ? "فعال" : m.status === "SUSPENDED" ? "تعلیق‌شده" : "لغوشده"}</StatusBadge>{canManage && <><select aria-label="نقش کاربر پرتال" className="h-9 rounded-lg border bg-background px-2 text-sm" value={m.role} onChange={e => void run(() => updateCustomerMembership(companyId, m.id, { role: e.target.value as CustomerRole }), "نقش به‌روزرسانی شد")}><option value="CUSTOMER_ADMIN">مدیر پرتال</option><option value="CUSTOMER_USER">کاربر پرتال</option></select><select aria-label="وضعیت کاربر پرتال" className="h-9 rounded-lg border bg-background px-2 text-sm" value={m.status} onChange={e => void run(() => updateCustomerMembership(companyId, m.id, { status: e.target.value as MembershipStatus }), "وضعیت به‌روزرسانی شد")}><option value="ACTIVE">فعال</option><option value="SUSPENDED">تعلیق</option><option value="REVOKED">لغو</option></select></>}</div>)}</div> : <EmptyState title="هنوز کاربری عضو پرتال نیست" description="پس از فعال‌سازی پرتال، نخستین مدیر مشتری را دعوت کنید." />}</section>
        {data.invitations.length > 0 && <section><h3 className="mb-3 text-sm font-semibold">دعوت‌های در انتظار</h3><div className="grid gap-2">{data.invitations.map(i => <div key={i.id} className="flex flex-wrap items-center gap-2 rounded-xl border p-3"><span dir="ltr" className="text-sm">{i.normalizedEmail}</span><StatusBadge className="me-auto" tone="info">{i.role === "CUSTOMER_ADMIN" ? "مدیر پرتال" : "کاربر پرتال"}</StatusBadge>{canManage && <><Button size="sm" variant="outline" onClick={() => void run(() => resendCustomerInvitation(companyId, i.id), "دعوت‌نامه دوباره ارسال شد")}><RefreshCw className="size-4" />ارسال مجدد</Button><Button size="sm" variant="ghost" onClick={() => void run(() => revokeCustomerInvitation(companyId, i.id), "دعوت لغو شد")}>لغو دعوت</Button></>}</div>)}</div></section>}
      </div>
    </SurfaceCard>
    <ResponsiveModal open={open} onClose={() => setOpen(false)} title="دعوت کاربر پرتال" description="دعوت‌نامه امن و زمان‌دار ارسال می‌شود." icon={Send}>
      <form className="grid gap-4" onSubmit={e => { e.preventDefault(); void run(() => inviteCustomer(companyId, email, role), "دعوت‌نامه ارسال شد").then(() => { setOpen(false); setEmail("") }) }}><div className="grid gap-2"><Label>ایمیل</Label><Input dir="ltr" type="email" required value={email} onChange={e => setEmail(e.target.value)} /></div><div className="grid gap-2"><Label>نقش</Label><select className="h-10 rounded-lg border bg-background px-3" value={role} onChange={e => setRole(e.target.value as CustomerRole)}><option value="CUSTOMER_ADMIN">مدیر پرتال</option><option value="CUSTOMER_USER">کاربر پرتال</option></select></div><div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setOpen(false)}>انصراف</Button><Button>ارسال دعوت</Button></div></form>
    </ResponsiveModal>
  </>
}
