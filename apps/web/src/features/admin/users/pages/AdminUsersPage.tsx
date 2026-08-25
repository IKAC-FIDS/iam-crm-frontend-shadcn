import {
  BadgeCheck,
  Ban,
  ChevronLeft,
  ChevronRight,
  CircleGauge,
  Clock3,
  Filter,
  KeyRound,
  MoreHorizontal,
  Plus,
  RefreshCcw,
  Search,
  ShieldCheck,
  Sparkles,
  UserCheck,
  UserRoundCog,
  Users,
  UsersRound,
  X,
} from "lucide-react"
import { useEffect, useMemo, useState, type ReactNode, type SelectHTMLAttributes } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { getApiErrorMessage } from "@/lib/apiResponse"
import { useAuthStore } from "@/store/authStore"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import {
  USER_ROLES,
  USER_ROLE_LABELS,
  activateUser,
  createUser,
  deactivateUser,
  getQuotaSummary,
  getRolePermissions,
  getRoles,
  getTeams,
  getUser,
  getUserAuditLogs,
  getUsers,
  updateUserRole,
  type AdminUser,
  type Role,
  type Team,
  type UserRole,
} from "../api/adminUsersApi"

type StatusFilter = "ALL" | "ACTIVE" | "INACTIVE"
const fa = (v: number) => new Intl.NumberFormat("fa-IR").format(v)
const can = (p: string[], action: string) => p.includes(action)
const initials = (name: string) => name.trim().split(/\s+/).slice(0, 2).map((p) => p[0]).join("").toUpperCase() || "U"
const roleLabel = (u: AdminUser) => u.assignedRole?.name || USER_ROLE_LABELS[u.role] || u.role
const teamLabel = (u: AdminUser) => u.teamRef?.name || u.team || "بدون تیم"
function formatDate(value?: string) {
  if (!value) return "—"
  try { return new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)) } catch { return "—" }
}

function NativeSelect(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`h-10 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20 ${props.className ?? ""}`} />
}
function FieldLabel({ children }: { children: ReactNode }) { return <label className="mb-1.5 block text-xs font-bold text-muted-foreground">{children}</label> }
function Modal({ open, onClose, title, description, children }: { open: boolean; onClose: () => void; title: string; description?: string; children: ReactNode }) {
  if (!open) return null
  return <div className="fixed inset-0 z-[80] grid place-items-center bg-black/20 p-4 backdrop-blur-[2px]" dir="rtl">
    <button className="absolute inset-0 cursor-default" onClick={onClose} aria-label="بستن" />
    <section className="relative z-10 max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-[28px] border border-[var(--app-divider)] bg-[var(--app-surface)] p-5 shadow-2xl">
      <div className="mb-5 flex items-start justify-between gap-4"><div><h2 className="text-xl font-black">{title}</h2>{description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}</div><Button size="icon-sm" variant="ghost" onClick={onClose}><X className="size-4" /></Button></div>
      {children}
    </section>
  </div>
}
function StatCard({ label, value, helper, icon: Icon, tone = "primary" }: { label: string; value: string; helper: string; icon: typeof Users; tone?: "primary" | "success" | "warning" | "neutral" }) {
  const tones = { primary: "bg-[var(--app-primary-soft)] text-[var(--app-primary)]", success: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400", warning: "bg-amber-500/10 text-amber-700 dark:text-amber-400", neutral: "bg-muted text-muted-foreground" }
  return <article className="rounded-[24px] border border-[var(--app-divider)] bg-[var(--app-surface)] p-5 shadow-[var(--app-shadow-card)]"><div className="flex items-start justify-between gap-4"><div><p className="text-sm text-muted-foreground">{label}</p><p className="mt-2 text-3xl font-black">{value}</p><p className="mt-1 text-xs leading-6 text-muted-foreground">{helper}</p></div><div className={`rounded-2xl p-3 ${tones[tone]}`}><Icon className="size-5" /></div></div></article>
}

export function AdminUsersPage() {
  const current = useAuthStore((s) => s.user)
  const permissions = current?.permissions ?? []
  const qc = useQueryClient()
  const canCreate = can(permissions, "user:create"), canChangeRole = can(permissions, "user:change-role"), canActivate = can(permissions, "user:activate"), canDeactivate = can(permissions, "user:deactivate"), canViewTeams = can(permissions, "team:view") || can(permissions, "team:manage"), canViewRoles = can(permissions, "role:view"), canViewAudit = can(permissions, "audit-log:view")

  const [page, setPage] = useState(1), [searchInput, setSearchInput] = useState(""), [search, setSearch] = useState(""), [role, setRole] = useState<UserRole | "ALL">("ALL"), [teamId, setTeamId] = useState("ALL"), [status, setStatus] = useState<StatusFilter>("ALL"), [selectedId, setSelectedId] = useState<string | null>(null), [createOpen, setCreateOpen] = useState(false), [editOpen, setEditOpen] = useState(false), [statusTarget, setStatusTarget] = useState<AdminUser | null>(null)
  useEffect(() => { const h = window.setTimeout(() => { setSearch(searchInput.trim()); setPage(1) }, 350); return () => window.clearTimeout(h) }, [searchInput])
  const filters = useMemo(() => ({ page, limit: 20, search: search || undefined, role: role === "ALL" ? undefined : role, teamId: teamId === "ALL" ? undefined : teamId, isActive: status === "ALL" ? undefined : status === "ACTIVE" }), [page, search, role, teamId, status])

  const users = useQuery({ queryKey: ["admin-users", filters], queryFn: () => getUsers(filters) })
  const activeCount = useQuery({ queryKey: ["admin-users-count", "active"], queryFn: () => getUsers({ page: 1, limit: 1, isActive: true }) })
  const inactiveCount = useQuery({ queryKey: ["admin-users-count", "inactive"], queryFn: () => getUsers({ page: 1, limit: 1, isActive: false }) })
  const teams = useQuery({ queryKey: ["admin-users-teams"], queryFn: getTeams, enabled: canViewTeams })
  const roles = useQuery({ queryKey: ["admin-users-roles"], queryFn: getRoles, enabled: canViewRoles })
  const quota = useQuery({ queryKey: ["quota-current"], queryFn: getQuotaSummary })
  const detail = useQuery({ queryKey: ["admin-user-detail", selectedId], queryFn: () => getUser(selectedId as string), enabled: Boolean(selectedId) })
  const audit = useQuery({ queryKey: ["admin-user-audit", selectedId], queryFn: () => getUserAuditLogs(selectedId as string), enabled: Boolean(selectedId) && canViewAudit })
  const selected = detail.data ?? users.data?.data.find((u) => u.id === selectedId) ?? null
  const rolePerms = useQuery({ queryKey: ["admin-role-permissions", selected?.roleId], queryFn: () => getRolePermissions(selected?.roleId as string), enabled: Boolean(selected?.roleId) && canViewRoles })

  async function refresh() { await qc.invalidateQueries({ queryKey: ["admin-users"] }); await qc.invalidateQueries({ queryKey: ["admin-users-count"] }); await qc.invalidateQueries({ queryKey: ["quota-current"] }) }
  const statusMutation = useMutation({ mutationFn: (u: AdminUser) => u.isActive ? deactivateUser(u.id) : activateUser(u.id), onSuccess: async (_, u) => { toast.success(u.isActive ? "کاربر غیرفعال شد." : "کاربر فعال شد."); setStatusTarget(null); await refresh(); await qc.invalidateQueries({ queryKey: ["admin-user-detail", u.id] }); await qc.invalidateQueries({ queryKey: ["admin-user-audit", u.id] }) }, onError: (e) => toast.error(getApiErrorMessage(e, "تغییر وضعیت کاربر انجام نشد.")) })

  const active = activeCount.data?.meta.total ?? 0, inactive = inactiveCount.data?.meta.total ?? 0, total = active + inactive
  const activeQuota = quota.data?.metrics?.find((m) => m.metric === "ACTIVE_USERS"), quotaCurrent = activeQuota ? Number(activeQuota.current) : active, quotaLimit = activeQuota?.hardLimit ? Number(activeQuota.hardLimit) : null
  const hasFilters = Boolean(search || role !== "ALL" || teamId !== "ALL" || status !== "ALL")
  const clearFilters = () => { setSearchInput(""); setSearch(""); setRole("ALL"); setTeamId("ALL"); setStatus("ALL"); setPage(1) }

  return <div className="grid gap-5" dir="rtl">
    <section className="relative overflow-hidden rounded-[30px] border border-[var(--app-divider)] bg-[var(--app-surface)] px-5 py-6 shadow-[var(--app-shadow-card)] sm:px-7"><div className="pointer-events-none absolute -end-16 -top-20 size-64 rounded-full bg-[var(--app-primary-soft)] blur-3xl" /><div className="relative flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between"><div><div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[var(--app-divider)] bg-background/70 px-3 py-1 text-xs text-muted-foreground"><Sparkles className="size-4" />مرکز مدیریت کاربران</div><h1 className="text-2xl font-black tracking-tight sm:text-3xl">مدیریت کاربران</h1><p className="mt-2 max-w-3xl text-sm leading-7 text-muted-foreground">کاربران، نقش‌ها، تیم‌ها، وضعیت دسترسی و تاریخچه تغییرات را از یک فضای واحد مدیریت کنید.</p></div><div className="flex flex-wrap gap-2"><Button variant="outline" onClick={() => void refresh()}><RefreshCcw className="ms-2 size-4" />به‌روزرسانی</Button>{canCreate ? <Button onClick={() => setCreateOpen(true)}><Plus className="ms-2 size-4" />افزودن کاربر</Button> : null}</div></div></section>

    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><StatCard label="کل کاربران" value={fa(total)} helper="تمام کاربران ثبت‌شده در سازمان" icon={UsersRound} /><StatCard label="کاربران فعال" value={fa(active)} helper="حساب‌هایی که امکان استفاده از سامانه دارند" icon={UserCheck} tone="success" /><StatCard label="کاربران غیرفعال" value={fa(inactive)} helper="حساب‌هایی که دسترسی آن‌ها متوقف شده است" icon={Ban} tone={inactive ? "warning" : "neutral"} /><StatCard label="ظرفیت کاربران فعال" value={quotaLimit ? `${fa(quotaCurrent)} / ${fa(quotaLimit)}` : fa(quotaCurrent)} helper={quotaLimit ? "مصرف فعلی از سقف مجاز کاربران فعال" : "مصرف فعلی؛ سقف مشخص نشده است"} icon={CircleGauge} /></section>

    <section className="rounded-[24px] border border-[var(--app-divider)] bg-[var(--app-surface)] p-4 shadow-[var(--app-shadow-card)]"><div className="grid gap-3 xl:grid-cols-[minmax(280px,1.4fr)_repeat(3,minmax(150px,.65fr))_auto]"><div className="relative"><Search className="absolute end-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="جستجو بر اساس نام یا ایمیل" className="pe-10" /></div><NativeSelect value={role} onChange={(e) => { setRole(e.target.value as UserRole | "ALL"); setPage(1) }}><option value="ALL">همه نقش‌ها</option>{USER_ROLES.map((r) => <option key={r} value={r}>{USER_ROLE_LABELS[r]}</option>)}</NativeSelect><NativeSelect value={teamId} disabled={!canViewTeams || teams.isLoading} onChange={(e) => { setTeamId(e.target.value); setPage(1) }}><option value="ALL">{canViewTeams ? "همه تیم‌ها" : "بدون دسترسی به تیم‌ها"}</option>{(teams.data ?? []).map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</NativeSelect><NativeSelect value={status} onChange={(e) => { setStatus(e.target.value as StatusFilter); setPage(1) }}><option value="ALL">همه وضعیت‌ها</option><option value="ACTIVE">فعال</option><option value="INACTIVE">غیرفعال</option></NativeSelect><Button variant="outline" onClick={clearFilters} disabled={!hasFilters}><Filter className="ms-2 size-4" />پاک کردن</Button></div></section>

    <section className="overflow-hidden rounded-[24px] border border-[var(--app-divider)] bg-[var(--app-surface)] shadow-[var(--app-shadow-card)]"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--app-divider)] px-5 py-4"><div><h2 className="font-bold">فهرست کاربران</h2><p className="mt-1 text-xs text-muted-foreground">{users.data ? `${fa(users.data.meta.total)} کاربر مطابق فیلتر فعلی` : "در حال دریافت کاربران"}</p></div><div className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">صفحه {fa(users.data?.meta.page ?? page)} از {fa(Math.max(1, users.data?.meta.totalPages ?? 1))}</div></div>
      {users.isError ? <div className="p-8 text-center"><p className="font-bold text-red-600">دریافت کاربران با خطا مواجه شد.</p><Button className="mt-3" variant="outline" onClick={() => void users.refetch()}>تلاش مجدد</Button></div> : users.isLoading ? <div className="grid min-h-72 place-items-center text-sm text-muted-foreground">در حال دریافت کاربران...</div> : !users.data?.data.length ? <div className="grid min-h-72 place-items-center p-6 text-center"><div><Users className="mx-auto size-9 text-muted-foreground" /><p className="mt-3 font-bold">کاربری پیدا نشد</p><p className="mt-1 text-sm text-muted-foreground">فیلترها را تغییر دهید یا یک کاربر جدید اضافه کنید.</p></div></div> : <div className="overflow-x-auto"><table className="w-full min-w-[980px] text-sm"><thead className="bg-muted/45 text-xs text-muted-foreground"><tr><th className="px-5 py-3 text-right font-medium">کاربر</th><th className="px-4 py-3 text-right font-medium">نقش</th><th className="px-4 py-3 text-right font-medium">تیم</th><th className="px-4 py-3 text-right font-medium">وضعیت</th><th className="px-4 py-3 text-right font-medium">آخرین تغییر</th><th className="px-4 py-3 text-center font-medium">عملیات</th></tr></thead><tbody>{users.data.data.map((u) => <tr key={u.id} className="border-t border-[var(--app-divider)] transition hover:bg-muted/25"><td className="px-5 py-4"><button className="flex items-center gap-3 text-right" onClick={() => setSelectedId(u.id)}><span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-[var(--app-primary-soft)] font-black text-[var(--app-primary)]">{initials(u.fullName)}</span><span><span className="block font-bold">{u.fullName}</span><span className="mt-0.5 block text-xs text-muted-foreground" dir="ltr">{u.email}</span></span></button></td><td className="px-4 py-4"><span className="inline-flex rounded-full bg-violet-500/10 px-2.5 py-1 text-xs font-bold text-violet-700 dark:text-violet-300">{roleLabel(u)}</span></td><td className="px-4 py-4 text-muted-foreground">{teamLabel(u)}</td><td className="px-4 py-4"><span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${u.isActive ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" : "bg-muted text-muted-foreground"}`}><span className={`size-1.5 rounded-full ${u.isActive ? "bg-emerald-500" : "bg-slate-400"}`} />{u.isActive ? "فعال" : "غیرفعال"}</span></td><td className="px-4 py-4 text-xs text-muted-foreground">{formatDate(u.updatedAt || u.createdAt)}</td><td className="px-4 py-4"><div className="flex justify-center gap-1"><Button size="sm" variant="ghost" onClick={() => setSelectedId(u.id)}>جزئیات</Button>{canChangeRole ? <Button size="icon-sm" variant="ghost" onClick={() => { setSelectedId(u.id); setEditOpen(true) }}><MoreHorizontal className="size-4" /></Button> : null}</div></td></tr>)}</tbody></table></div>}
      <div className="flex items-center justify-between gap-3 border-t border-[var(--app-divider)] px-5 py-4"><Button variant="outline" size="sm" disabled={!users.data?.meta.hasPrevious} onClick={() => setPage((v) => Math.max(1, v - 1))}><ChevronRight className="ms-1 size-4" />قبلی</Button><span className="text-xs text-muted-foreground">نمایش {fa(users.data?.data.length ?? 0)} از {fa(users.data?.meta.total ?? 0)} کاربر</span><Button variant="outline" size="sm" disabled={!users.data?.meta.hasNext} onClick={() => setPage((v) => v + 1)}>بعدی<ChevronLeft className="me-1 size-4" /></Button></div>
    </section>

    {selectedId ? <><button className="fixed inset-0 z-[60] bg-black/15 backdrop-blur-[1px]" onClick={() => { setSelectedId(null); setEditOpen(false) }} aria-label="بستن جزئیات" /><aside className="fixed inset-y-0 start-0 z-[70] w-full max-w-[460px] overflow-y-auto border-e border-[var(--app-divider)] bg-[var(--app-surface)] p-5 shadow-2xl" dir="rtl"><div className="flex items-center justify-between"><div className="text-xs font-bold text-muted-foreground">پرونده کاربر</div><Button size="icon-sm" variant="ghost" onClick={() => setSelectedId(null)}><X className="size-4" /></Button></div>{detail.isLoading || !selected ? <div className="grid h-72 place-items-center text-sm text-muted-foreground">در حال دریافت اطلاعات کاربر...</div> : <div className="mt-4"><div className="flex items-start gap-4"><div className="grid size-16 shrink-0 place-items-center rounded-[22px] bg-[var(--app-primary-soft)] text-xl font-black text-[var(--app-primary)]">{initials(selected.fullName)}</div><div className="min-w-0 flex-1"><h2 className="text-xl font-black">{selected.fullName}</h2><p className="mt-1 truncate text-sm text-muted-foreground" dir="ltr">{selected.email}</p><div className="mt-3 flex gap-2"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${selected.isActive ? "bg-emerald-500/10 text-emerald-700" : "bg-muted text-muted-foreground"}`}>{selected.isActive ? "فعال" : "غیرفعال"}</span><span className="rounded-full bg-violet-500/10 px-2.5 py-1 text-xs font-bold text-violet-700">{roleLabel(selected)}</span></div></div></div><div className="mt-6 grid grid-cols-2 gap-3"><Info label="تیم" value={teamLabel(selected)} /><Info label="نوع نقش" value={selected.assignedRole ? "نقش سفارشی" : "نقش پایه"} /><Info label="تاریخ ایجاد" value={formatDate(selected.createdAt)} small /><Info label="آخرین تغییر" value={formatDate(selected.updatedAt)} small /></div><div className="mt-5 flex flex-wrap gap-2">{canChangeRole ? <Button onClick={() => setEditOpen(true)}><UserRoundCog className="ms-2 size-4" />نقش و تیم</Button> : null}{selected.id !== current?.id && ((selected.isActive && canDeactivate) || (!selected.isActive && canActivate)) ? <Button variant="outline" onClick={() => setStatusTarget(selected)}>{selected.isActive ? <Ban className="ms-2 size-4" /> : <BadgeCheck className="ms-2 size-4" />}{selected.isActive ? "غیرفعال‌سازی" : "فعال‌سازی"}</Button> : null}</div><section className="mt-7"><div className="mb-3 flex items-center gap-2"><ShieldCheck className="size-4 text-[var(--app-primary)]" /><h3 className="font-bold">دسترسی‌های نقش</h3></div>{!selected.roleId ? <p className="rounded-xl bg-muted/50 p-3 text-xs text-muted-foreground">این کاربر از نقش پایه «{USER_ROLE_LABELS[selected.role]}» استفاده می‌کند.</p> : !canViewRoles ? <p className="rounded-xl bg-muted/50 p-3 text-xs text-muted-foreground">مجوز مشاهده نقش‌ها موجود نیست.</p> : <div className="flex flex-wrap gap-2">{(rolePerms.data?.assignedActions ?? []).slice(0, 12).map((a) => <span key={a} className="rounded-lg border border-[var(--app-divider)] bg-muted/35 px-2 py-1 text-[11px]" dir="ltr">{a}</span>)}</div>}</section><section className="mt-7"><div className="mb-3 flex items-center gap-2"><Clock3 className="size-4 text-[var(--app-primary)]" /><h3 className="font-bold">تاریخچه مدیریتی</h3></div>{!canViewAudit ? <p className="rounded-xl bg-muted/50 p-3 text-xs text-muted-foreground">مجوز مشاهده Audit Log موجود نیست.</p> : audit.isLoading ? <p className="text-xs text-muted-foreground">در حال دریافت تاریخچه...</p> : !(audit.data ?? []).length ? <p className="rounded-xl bg-muted/50 p-3 text-xs text-muted-foreground">رویدادی یافت نشد.</p> : <div className="space-y-3">{(audit.data ?? []).map((a) => <div key={a.id} className="relative pe-5"><span className="absolute end-0 top-1.5 size-2 rounded-full bg-[var(--app-primary)]" /><div className="text-sm font-bold">{auditLabel(a.action)}</div><div className="mt-1 text-[11px] text-muted-foreground">{formatDate(a.createdAt)}</div></div>)}</div>}</section></div>}</aside></> : null}

    <CreateUserModal open={createOpen} onClose={() => setCreateOpen(false)} teams={teams.data ?? []} roles={roles.data ?? []} canChangeRole={canChangeRole} canUseTeams={canViewTeams} onCreated={async (id) => { setCreateOpen(false); await refresh(); setSelectedId(id) }} />
    {selected ? <EditAccessModal open={editOpen} onClose={() => setEditOpen(false)} user={selected} teams={teams.data ?? []} roles={roles.data ?? []} canUseTeams={canViewTeams} onUpdated={async () => { setEditOpen(false); await refresh(); await qc.invalidateQueries({ queryKey: ["admin-user-detail", selected.id] }); await qc.invalidateQueries({ queryKey: ["admin-user-audit", selected.id] }) }} /> : null}
    <Modal open={Boolean(statusTarget)} onClose={() => setStatusTarget(null)} title={statusTarget?.isActive ? "غیرفعال‌سازی کاربر" : "فعال‌سازی کاربر"} description="این عملیات روی امکان ورود و دسترسی کاربر اثر می‌گذارد."><p className="rounded-2xl bg-muted/50 p-4 text-sm leading-7 text-muted-foreground">آیا از {statusTarget?.isActive ? "غیرفعال کردن" : "فعال کردن"} حساب «{statusTarget?.fullName}» مطمئن هستید؟</p><div className="mt-5 flex justify-end gap-2"><Button variant="outline" onClick={() => setStatusTarget(null)}>انصراف</Button><Button onClick={() => statusTarget && statusMutation.mutate(statusTarget)} disabled={statusMutation.isPending}>تأیید</Button></div></Modal>
  </div>
}

function Info({ label, value, small = false }: { label: string; value: string; small?: boolean }) { return <div className="rounded-2xl border border-[var(--app-divider)] p-3"><div className="text-xs text-muted-foreground">{label}</div><div className={`mt-1 font-bold ${small ? "text-xs" : ""}`}>{value}</div></div> }
function auditLabel(action?: string) { return action === "user.created" ? "کاربر ایجاد شد" : action === "user.activated" ? "کاربر فعال شد" : action === "user.deactivated" ? "کاربر غیرفعال شد" : action === "user.role_changed" ? "نقش یا تیم کاربر تغییر کرد" : action || "تغییر مدیریتی" }

function CreateUserModal({ open, onClose, teams, roles, canChangeRole, canUseTeams, onCreated }: { open: boolean; onClose: () => void; teams: Team[]; roles: Role[]; canChangeRole: boolean; canUseTeams: boolean; onCreated: (id: string) => Promise<void> }) {
  const [fullName, setFullName] = useState(""), [email, setEmail] = useState(""), [password, setPassword] = useState(""), [roleChoice, setRoleChoice] = useState("BASE:REP"), [teamId, setTeamId] = useState("")
  useEffect(() => { if (!open) { setFullName(""); setEmail(""); setPassword(""); setRoleChoice("BASE:REP"); setTeamId("") } }, [open])
  const custom = roleChoice.startsWith("ROLE:") ? roles.find((r) => r.id === roleChoice.slice(5)) : null
  const baseRole = (custom?.baseRole ?? roleChoice.replace("BASE:", "")) as UserRole
  const mutation = useMutation({ mutationFn: async () => { if (!fullName.trim()) throw new Error("نام کامل الزامی است."); if (!email.includes("@")) throw new Error("ایمیل معتبر نیست."); if (password.length < 6) throw new Error("رمز عبور باید حداقل ۶ کاراکتر باشد."); const created = await createUser({ fullName: fullName.trim(), email: email.trim(), password, role: baseRole, teamId: teamId || undefined }); if (custom && canChangeRole) await updateUserRole(created.id, { roleId: custom.id, teamId: teamId || null }); return created }, onSuccess: (u) => { toast.success("کاربر با موفقیت ایجاد شد."); void onCreated(u.id) }, onError: (e) => toast.error(getApiErrorMessage(e, "ایجاد کاربر انجام نشد.")) })
  return <Modal open={open} onClose={onClose} title="افزودن کاربر" description="هویت، نقش و تیم اولیه کاربر را مشخص کنید."><div className="grid gap-4 sm:grid-cols-2"><div className="sm:col-span-2"><FieldLabel>نام کامل</FieldLabel><Input value={fullName} onChange={(e) => setFullName(e.target.value)} /></div><div><FieldLabel>ایمیل</FieldLabel><Input value={email} onChange={(e) => setEmail(e.target.value)} dir="ltr" /></div><div><FieldLabel>رمز عبور اولیه</FieldLabel><Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="حداقل ۶ کاراکتر" dir="ltr" /></div><div><FieldLabel>نقش</FieldLabel><NativeSelect value={roleChoice} onChange={(e) => setRoleChoice(e.target.value)}><optgroup label="نقش‌های پایه">{USER_ROLES.map((r) => <option key={r} value={`BASE:${r}`}>{USER_ROLE_LABELS[r]}</option>)}</optgroup>{canChangeRole && roles.length ? <optgroup label="نقش‌های سفارشی">{roles.filter((r) => r.isActive !== false).map((r) => <option key={r.id} value={`ROLE:${r.id}`}>{r.name} — {USER_ROLE_LABELS[r.baseRole]}</option>)}</optgroup> : null}</NativeSelect></div><div><FieldLabel>تیم</FieldLabel><NativeSelect value={teamId} onChange={(e) => setTeamId(e.target.value)} disabled={!canUseTeams}><option value="">بدون تیم</option>{teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</NativeSelect></div></div><div className="mt-5 rounded-2xl bg-muted/45 p-4 text-xs leading-6 text-muted-foreground">نقش سفارشی در صورت داشتن مجوز تغییر نقش، بلافاصله پس از ساخت حساب تخصیص داده می‌شود.</div><div className="mt-5 flex justify-end gap-2"><Button variant="outline" onClick={onClose}>انصراف</Button><Button onClick={() => mutation.mutate()} disabled={mutation.isPending}><Plus className="ms-2 size-4" />ثبت کاربر</Button></div></Modal>
}

function EditAccessModal({ open, onClose, user, teams, roles, canUseTeams, onUpdated }: { open: boolean; onClose: () => void; user: AdminUser; teams: Team[]; roles: Role[]; canUseTeams: boolean; onUpdated: () => Promise<void> }) {
  const [roleChoice, setRoleChoice] = useState(user.roleId ? `ROLE:${user.roleId}` : `BASE:${user.role}`), [teamId, setTeamId] = useState(user.teamId ?? "")
  useEffect(() => { if (open) { setRoleChoice(user.roleId ? `ROLE:${user.roleId}` : `BASE:${user.role}`); setTeamId(user.teamId ?? "") } }, [open, user.id, user.roleId, user.role, user.teamId])
  const mutation = useMutation({ mutationFn: () => roleChoice.startsWith("ROLE:") ? updateUserRole(user.id, { roleId: roleChoice.slice(5), teamId: teamId || null }) : updateUserRole(user.id, { role: roleChoice.replace("BASE:", "") as UserRole, teamId: teamId || null }), onSuccess: () => { toast.success("نقش و تیم کاربر به‌روزرسانی شد."); void onUpdated() }, onError: (e) => toast.error(getApiErrorMessage(e, "ویرایش دسترسی انجام نشد.")) })
  return <Modal open={open} onClose={onClose} title="نقش و تیم کاربر" description={`ویرایش دسترسی سازمانی ${user.fullName}`}><div className="grid gap-4 sm:grid-cols-2"><div><FieldLabel>نقش</FieldLabel><NativeSelect value={roleChoice} onChange={(e) => setRoleChoice(e.target.value)}><optgroup label="نقش‌های پایه">{USER_ROLES.map((r) => <option key={r} value={`BASE:${r}`}>{USER_ROLE_LABELS[r]}</option>)}</optgroup>{roles.length ? <optgroup label="نقش‌های سفارشی">{roles.filter((r) => r.isActive !== false).map((r) => <option key={r.id} value={`ROLE:${r.id}`}>{r.name} — {USER_ROLE_LABELS[r.baseRole]}</option>)}</optgroup> : null}</NativeSelect></div><div><FieldLabel>تیم</FieldLabel><NativeSelect value={teamId} onChange={(e) => setTeamId(e.target.value)} disabled={!canUseTeams}><option value="">بدون تیم</option>{teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</NativeSelect></div></div><div className="mt-5 rounded-2xl border border-[var(--app-divider)] p-4"><div className="flex items-center gap-2 text-sm font-bold"><KeyRound className="size-4 text-[var(--app-primary)]" />کنترل دسترسی</div><p className="mt-2 text-xs leading-6 text-muted-foreground">Backend از حذف دسترسی‌های حیاتی مدیریت RBAC از حساب ادمین جاری جلوگیری می‌کند.</p></div><div className="mt-5 flex justify-end gap-2"><Button variant="outline" onClick={onClose}>انصراف</Button><Button onClick={() => mutation.mutate()} disabled={mutation.isPending}><UserRoundCog className="ms-2 size-4" />ذخیره تغییرات</Button></div></Modal>
}
