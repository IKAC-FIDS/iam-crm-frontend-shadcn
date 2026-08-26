import {
  ArrowRight,
  BadgeCheck,
  Ban,
  Clock3,
  KeyRound,
  Save,
  ShieldCheck,
  UserRoundCog,
} from "lucide-react"
import { useEffect, useState, type SelectHTMLAttributes } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useNavigate, useParams } from "react-router-dom"
import { toast } from "sonner"

import { getApiErrorMessage } from "@/lib/apiResponse"
import { useAuthStore } from "@/store/authStore"
import { Button } from "@workspace/ui/components/button"
import {
  USER_ROLES,
  USER_ROLE_LABELS,
  activateUser,
  deactivateUser,
  getRolePermissions,
  getRoles,
  getTeams,
  getUser,
  getUserAuditLogs,
  updateUserRole,
  type UserRole,
} from "../api/adminUsersApi"

const can = (permissions: string[], action: string) => permissions.includes(action)
const initials = (name: string) => name.trim().split(/\s+/).slice(0, 2).map((p) => p[0]).join("").toUpperCase() || "U"

function formatDate(value?: string) {
  if (!value) return "—"
  try {
    return new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value))
  } catch {
    return "—"
  }
}

function NativeSelect(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`h-10 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20 ${props.className ?? ""}`} />
}

function auditLabel(action?: string) {
  return action === "user.created"
    ? "کاربر ایجاد شد"
    : action === "user.activated"
      ? "کاربر فعال شد"
      : action === "user.deactivated"
        ? "کاربر غیرفعال شد"
        : action === "user.role_changed"
          ? "نقش یا تیم کاربر تغییر کرد"
          : action || "تغییر مدیریتی"
}

export function AdminUserDetailsPage() {
  const { userId } = useParams<{ userId: string }>()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const current = useAuthStore((s) => s.user)
  const permissions = current?.permissions ?? []

  const canChangeRole = can(permissions, "user:change-role")
  const canActivate = can(permissions, "user:activate")
  const canDeactivate = can(permissions, "user:deactivate")
  const canViewTeams = can(permissions, "team:view") || can(permissions, "team:manage")
  const canViewRoles = can(permissions, "role:view")
  const canViewAudit = can(permissions, "audit-log:view")

  const userQuery = useQuery({
    queryKey: ["admin-user-detail", userId],
    queryFn: () => getUser(userId as string),
    enabled: Boolean(userId),
  })
  const teams = useQuery({ queryKey: ["admin-users-teams"], queryFn: getTeams, enabled: canViewTeams })
  const roles = useQuery({ queryKey: ["admin-users-roles"], queryFn: getRoles, enabled: canViewRoles })
  const audit = useQuery({
    queryKey: ["admin-user-audit", userId],
    queryFn: () => getUserAuditLogs(userId as string),
    enabled: Boolean(userId) && canViewAudit,
  })

  const user = userQuery.data
  const rolePerms = useQuery({
    queryKey: ["admin-role-permissions", user?.roleId],
    queryFn: () => getRolePermissions(user?.roleId as string),
    enabled: Boolean(user?.roleId) && canViewRoles,
  })

  const [roleChoice, setRoleChoice] = useState("")
  const [teamId, setTeamId] = useState("")

  useEffect(() => {
    if (!user) return
    setRoleChoice(user.roleId ? `ROLE:${user.roleId}` : `BASE:${user.role}`)
    setTeamId(user.teamId ?? "")
  }, [user])

  const statusMutation = useMutation({
    mutationFn: async () => {
      if (!user) return null
      return user.isActive ? deactivateUser(user.id) : activateUser(user.id)
    },
    onSuccess: async () => {
      toast.success(user?.isActive ? "کاربر غیرفعال شد." : "کاربر فعال شد.")
      await qc.invalidateQueries({ queryKey: ["admin-user-detail", userId] })
      await qc.invalidateQueries({ queryKey: ["admin-users"] })
      await qc.invalidateQueries({ queryKey: ["admin-users-count"] })
      await qc.invalidateQueries({ queryKey: ["quota-current"] })
      await qc.invalidateQueries({ queryKey: ["admin-user-audit", userId] })
    },
    onError: (e) => toast.error(getApiErrorMessage(e, "تغییر وضعیت کاربر انجام نشد.")),
  })

  const accessMutation = useMutation({
    mutationFn: async () => {
      if (!user) return null
      return roleChoice.startsWith("ROLE:")
        ? updateUserRole(user.id, { roleId: roleChoice.slice(5), teamId: teamId || null })
        : updateUserRole(user.id, { role: roleChoice.replace("BASE:", "") as UserRole, teamId: teamId || null })
    },
    onSuccess: async () => {
      toast.success("نقش و تیم کاربر ذخیره شد.")
      await qc.invalidateQueries({ queryKey: ["admin-user-detail", userId] })
      await qc.invalidateQueries({ queryKey: ["admin-users"] })
      await qc.invalidateQueries({ queryKey: ["admin-user-audit", userId] })
    },
    onError: (e) => toast.error(getApiErrorMessage(e, "ذخیره تغییرات انجام نشد.")),
  })

  if (userQuery.isLoading) return <div className="grid min-h-72 place-items-center text-sm text-muted-foreground">در حال دریافت اطلاعات کاربر...</div>
  if (userQuery.isError || !user) return <div className="grid min-h-72 place-items-center"><Button variant="outline" onClick={() => navigate("/admin/users")}>بازگشت به کاربران</Button></div>

  const roleName = user.assignedRole?.name || USER_ROLE_LABELS[user.role] || user.role
  const teamName = user.teamRef?.name || user.team || "بدون تیم"
  const canToggle = user.id !== current?.id && ((user.isActive && canDeactivate) || (!user.isActive && canActivate))

  return <div className="grid gap-5" dir="rtl">
    <section className="rounded-[28px] border border-[var(--app-divider)] bg-[var(--app-surface)] p-6 shadow-[var(--app-shadow-card)]">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div className="flex items-start gap-4">
          <Button size="icon-sm" variant="ghost" onClick={() => navigate("/admin/users")}><ArrowRight className="size-4" /></Button>
          <div className="grid size-16 shrink-0 place-items-center rounded-[22px] bg-[var(--app-primary-soft)] text-xl font-black text-[var(--app-primary)]">{initials(user.fullName)}</div>
          <div>
            <div className="flex flex-wrap items-center gap-2"><h1 className="text-2xl font-black">{user.fullName}</h1><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${user.isActive ? "bg-emerald-500/10 text-emerald-700" : "bg-muted text-muted-foreground"}`}>{user.isActive ? "فعال" : "غیرفعال"}</span></div>
            <p className="mt-1 text-sm text-muted-foreground" dir="ltr">{user.email}</p>
            <div className="mt-3 flex gap-2"><span className="rounded-full bg-violet-500/10 px-2.5 py-1 text-xs font-bold text-violet-700">{roleName}</span><span className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">{teamName}</span></div>
          </div>
        </div>
        {canToggle ? <Button variant={user.isActive ? "outline" : "default"} onClick={() => statusMutation.mutate()} disabled={statusMutation.isPending}>{user.isActive ? <Ban className="ms-2 size-4" /> : <BadgeCheck className="ms-2 size-4" />}{user.isActive ? "غیرفعال‌سازی" : "فعال‌سازی مجدد"}</Button> : null}
      </div>
    </section>

    <section className="grid gap-5 xl:grid-cols-2">
      <article className="rounded-[24px] border border-[var(--app-divider)] bg-[var(--app-surface)] p-5 shadow-[var(--app-shadow-card)]">
        <div className="mb-4 flex items-center gap-2"><UserRoundCog className="size-5 text-[var(--app-primary)]" /><h2 className="font-bold">اطلاعات سازمانی</h2></div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Info label="نقش" value={roleName} /><Info label="تیم" value={teamName} /><Info label="تاریخ ایجاد" value={formatDate(user.createdAt)} /><Info label="آخرین تغییر" value={formatDate(user.updatedAt)} />
        </div>
        {canChangeRole ? <div className="mt-5 border-t border-[var(--app-divider)] pt-5"><h3 className="mb-3 text-sm font-bold">تغییر نقش و تیم</h3><div className="grid gap-3 sm:grid-cols-2"><NativeSelect value={roleChoice} onChange={(e) => setRoleChoice(e.target.value)}><optgroup label="نقش‌های پایه">{USER_ROLES.map((r) => <option key={r} value={`BASE:${r}`}>{USER_ROLE_LABELS[r]}</option>)}</optgroup>{(roles.data ?? []).length ? <optgroup label="نقش‌های سفارشی">{(roles.data ?? []).filter((r) => r.isActive !== false).map((r) => <option key={r.id} value={`ROLE:${r.id}`}>{r.name}</option>)}</optgroup> : null}</NativeSelect><NativeSelect value={teamId} onChange={(e) => setTeamId(e.target.value)} disabled={!canViewTeams}><option value="">بدون تیم</option>{(teams.data ?? []).map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</NativeSelect></div><Button className="mt-3" onClick={() => accessMutation.mutate()} disabled={accessMutation.isPending}><Save className="ms-2 size-4" />ذخیره تغییرات</Button></div> : null}
      </article>

      <article className="rounded-[24px] border border-[var(--app-divider)] bg-[var(--app-surface)] p-5 shadow-[var(--app-shadow-card)]">
        <div className="mb-4 flex items-center gap-2"><ShieldCheck className="size-5 text-[var(--app-primary)]" /><h2 className="font-bold">دسترسی‌ها و امنیت</h2></div>
        {!user.roleId ? <p className="rounded-2xl bg-muted/35 p-4 text-sm text-muted-foreground">این کاربر از نقش پایه «{USER_ROLE_LABELS[user.role]}» استفاده می‌کند.</p> : !canViewRoles ? <p className="text-sm text-muted-foreground">مجوز مشاهده نقش‌ها موجود نیست.</p> : <div className="flex flex-wrap gap-2">{(rolePerms.data?.assignedActions ?? []).map((a) => <span key={a} className="rounded-lg border border-[var(--app-divider)] bg-muted/35 px-2.5 py-1.5 text-xs" dir="ltr">{a}</span>)}</div>}
        <div className="mt-6 rounded-2xl border border-dashed border-[var(--app-divider)] p-4"><div className="flex items-center gap-2 text-sm font-bold"><KeyRound className="size-4 text-muted-foreground" />امنیت حساب</div><p className="mt-2 text-xs leading-6 text-muted-foreground">در Backend فعلی سرویس تغییر یا Reset کلمه عبور توسط مدیر وجود ندارد؛ بنابراین این عملیات در UI نمایش داده نشده است.</p></div>
      </article>
    </section>

    <section className="rounded-[24px] border border-[var(--app-divider)] bg-[var(--app-surface)] p-5 shadow-[var(--app-shadow-card)]">
      <div className="mb-5 flex items-center gap-2"><Clock3 className="size-5 text-[var(--app-primary)]" /><h2 className="font-bold">تاریخچه مدیریتی</h2></div>
      {!canViewAudit ? <p className="text-sm text-muted-foreground">مجوز مشاهده Audit Log موجود نیست.</p> : audit.isLoading ? <p className="text-sm text-muted-foreground">در حال دریافت تاریخچه...</p> : !(audit.data ?? []).length ? <p className="text-sm text-muted-foreground">رویدادی ثبت نشده است.</p> : <div className="grid gap-3">{(audit.data ?? []).map((a) => <div key={a.id} className="flex items-start gap-3 rounded-2xl bg-muted/30 p-4"><span className="mt-1 size-2 rounded-full bg-[var(--app-primary)]" /><div><div className="font-bold">{auditLabel(a.action)}</div><div className="mt-1 text-xs text-muted-foreground">{formatDate(a.createdAt)}</div></div></div>)}</div>}
    </section>
  </div>
}

function Info({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl bg-muted/35 p-4"><div className="text-xs text-muted-foreground">{label}</div><div className="mt-1 text-sm font-bold">{value}</div></div>
}
