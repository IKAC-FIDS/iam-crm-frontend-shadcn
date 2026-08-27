import {
  Activity,
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  List,
  Plus,
  RefreshCcw,
  Search,
  Sparkles,
  UserCog,
  UsersRound,
} from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { getApiErrorMessage } from "@/lib/apiResponse"
import { useAuthStore } from "@/store/authStore"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"

import {
  activateTeam,
  createTeam,
  deactivateTeam,
  getAllUsers,
  getTeams,
  type AdminUser,
  type Team,
} from "../api/adminTeamsApi"

type StatusFilter = "ALL" | "ACTIVE" | "INACTIVE"
type ViewMode = "CARDS" | "TABLE"

function fa(value: number) {
  return new Intl.NumberFormat("fa-IR").format(value)
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  return parts.length ? parts.slice(0, 2).map((item) => item[0]).join("") : "T"
}

function can(permissions: string[] | undefined, permission: string) {
  return Boolean(permissions?.includes(permission))
}

function NativeSelect(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`h-10 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/20 ${props.className ?? ""}`}
    />
  )
}

function Modal({
  open,
  onClose,
  title,
  description,
  children,
}: {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children: React.ReactNode
}) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-black/20 p-4 backdrop-blur-[2px]" dir="rtl">
      <button className="absolute inset-0 cursor-default" onClick={onClose} aria-label="بستن" />
      <section className="relative z-10 max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-[28px] border border-[var(--app-divider)] bg-[var(--app-surface)] p-5 shadow-2xl">
        <div className="mb-5">
          <h2 className="text-xl font-black">{title}</h2>
          {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
        </div>
        {children}
      </section>
    </div>
  )
}

function StatCard({
  title,
  value,
  helper,
  icon: Icon,
}: {
  title: string
  value: string
  helper: string
  icon: typeof UsersRound
}) {
  return (
    <article className="rounded-[24px] border border-[var(--app-divider)] bg-[var(--app-surface)] p-5 shadow-[var(--app-shadow-card)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="mt-2 text-3xl font-black">{value}</p>
          <p className="mt-1 text-xs leading-6 text-muted-foreground">{helper}</p>
        </div>
        <div className="rounded-2xl bg-[var(--app-primary-soft)] p-3 text-[var(--app-primary)]">
          <Icon className="size-5" />
        </div>
      </div>
    </article>
  )
}

export function AdminTeamsPage() {
  const navigate = useNavigate()
  const current = useAuthStore((state) => state.user)
  const permissions = current?.permissions ?? []
  const queryClient = useQueryClient()

  const canManage = can(permissions, "team:manage")

  const [page, setPage] = useState(1)
  const [searchInput, setSearchInput] = useState("")
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState<StatusFilter>("ALL")
  const [managerId, setManagerId] = useState("ALL")
  const [view, setView] = useState<ViewMode>("CARDS")
  const [createOpen, setCreateOpen] = useState(false)
  const [statusTarget, setStatusTarget] = useState<Team | null>(null)

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setSearch(searchInput.trim())
      setPage(1)
    }, 350)
    return () => window.clearTimeout(handle)
  }, [searchInput])

  const filters = useMemo(
    () => ({
      page,
      limit: 20,
      search: search || undefined,
      managerId: managerId === "ALL" ? undefined : managerId,
      includeInactive: status === "ALL",
      isActive:
        status === "ALL"
          ? undefined
          : status === "ACTIVE",
    }),
    [page, search, managerId, status],
  )

  const teamsQuery = useQuery({
    queryKey: ["admin-teams", filters],
    queryFn: () => getTeams(filters),
  })

  const activeCountQuery = useQuery({
    queryKey: ["admin-teams-count", "active"],
    queryFn: () => getTeams({ page: 1, limit: 1, isActive: true }),
  })

  const inactiveCountQuery = useQuery({
    queryKey: ["admin-teams-count", "inactive"],
    queryFn: () => getTeams({ page: 1, limit: 1, isActive: false, includeInactive: true }),
  })

  const usersQuery = useQuery({
    queryKey: ["admin-teams-users"],
    queryFn: getAllUsers,
  })

  const managers = useMemo(
    () =>
      (usersQuery.data ?? []).filter(
        (user) =>
          user.isActive &&
          (user.role === "ADMIN" || user.role === "MANAGER"),
      ),
    [usersQuery.data],
  )

  const activeTeams = activeCountQuery.data?.meta.total ?? 0
  const inactiveTeams = inactiveCountQuery.data?.meta.total ?? 0
  const totalTeams = activeTeams + inactiveTeams
  const pageTeams = teamsQuery.data?.data ?? []
  const totalMembersOnPage = pageTeams.reduce((sum, item) => sum + item.memberCount, 0)
  const withoutManagerOnPage = pageTeams.filter((item) => !item.managerId && !item.manager).length

  const refreshAll = async () => {
    await queryClient.invalidateQueries({ queryKey: ["admin-teams"] })
    await queryClient.invalidateQueries({ queryKey: ["admin-teams-count"] })
    await queryClient.invalidateQueries({ queryKey: ["admin-teams-users"] })
  }

  const statusMutation = useMutation({
    mutationFn: async (team: Team) =>
      team.isActive ? deactivateTeam(team.id) : activateTeam(team.id),
    onSuccess: async (_, team) => {
      toast.success(team.isActive ? "تیم غیرفعال شد." : "تیم فعال شد.")
      setStatusTarget(null)
      await refreshAll()
    },
    onError: (error) =>
      toast.error(getApiErrorMessage(error, "تغییر وضعیت تیم انجام نشد.")),
  })

  return (
    <div className="grid gap-5" dir="rtl">
      <section className="relative overflow-hidden rounded-[30px] border border-[var(--app-divider)] bg-[var(--app-surface)] px-5 py-6 shadow-[var(--app-shadow-card)] sm:px-7">
        <div className="pointer-events-none absolute -end-16 -top-20 size-64 rounded-full bg-[var(--app-primary-soft)] blur-3xl" />
        <div className="relative flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className="ui-eyebrow mb-3 inline-flex items-center gap-2">
              <Sparkles className="size-4" />
              مرکز مدیریت تیم‌ها
            </div>
            <h1 className="ui-page-title">مدیریت تیم‌ها</h1>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-muted-foreground">
              ساختار تیم‌ها، مدیران، اعضا و وضعیت فعالیت را از یک فضای واحد مدیریت کنید.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => void refreshAll()}>
              <RefreshCcw className="ms-2 size-4" />
              به‌روزرسانی
            </Button>
            {canManage ? (
              <Button onClick={() => setCreateOpen(true)}>
                <Plus className="ms-2 size-4" />
                ایجاد تیم
              </Button>
            ) : null}
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="کل تیم‌ها" value={fa(totalTeams)} helper="تیم‌های فعال و غیرفعال" icon={UsersRound} />
        <StatCard title="تیم‌های فعال" value={fa(activeTeams)} helper="تیم‌های قابل استفاده برای تخصیص" icon={BadgeCheck} />
        <StatCard title="اعضای این صفحه" value={fa(totalMembersOnPage)} helper="مجموع اعضای تیم‌های نمایش‌داده‌شده" icon={Activity} />
        <StatCard title="بدون مدیر در این صفحه" value={fa(withoutManagerOnPage)} helper="تیم‌هایی که مدیر مشخص ندارند" icon={UserCog} />
      </section>

      <section className="rounded-[24px] border border-[var(--app-divider)] bg-[var(--app-surface)] p-4 shadow-[var(--app-shadow-card)]">
        <div className="grid gap-3 xl:grid-cols-[minmax(280px,1.3fr)_minmax(180px,.7fr)_minmax(180px,.7fr)_auto]">
          <div className="relative">
            <Search className="absolute end-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="جستجو در نام، کد یا توضیحات تیم"
              className="pe-10"
            />
          </div>

          <NativeSelect value={managerId} onChange={(event) => { setManagerId(event.target.value); setPage(1) }}>
            <option value="ALL">همه مدیران</option>
            {managers.map((manager) => <option key={manager.id} value={manager.id}>{manager.fullName}</option>)}
          </NativeSelect>

          <NativeSelect value={status} onChange={(event) => { setStatus(event.target.value as StatusFilter); setPage(1) }}>
            <option value="ALL">همه وضعیت‌ها</option>
            <option value="ACTIVE">فعال</option>
            <option value="INACTIVE">غیرفعال</option>
          </NativeSelect>

          <div className="flex rounded-xl border border-input p-1">
            <Button size="icon-sm" variant={view === "CARDS" ? "default" : "ghost"} onClick={() => setView("CARDS")} aria-label="نمای کارت">
              <LayoutGrid className="size-4" />
            </Button>
            <Button size="icon-sm" variant={view === "TABLE" ? "default" : "ghost"} onClick={() => setView("TABLE")} aria-label="نمای جدول">
              <List className="size-4" />
            </Button>
          </div>
        </div>
      </section>

      {teamsQuery.isLoading ? (
        <div className="grid min-h-72 place-items-center text-sm text-muted-foreground">در حال دریافت تیم‌ها...</div>
      ) : teamsQuery.isError ? (
        <div className="rounded-[24px] border border-[var(--app-divider)] bg-[var(--app-surface)] p-8 text-center">
          <p className="font-bold text-red-600">دریافت تیم‌ها با خطا مواجه شد.</p>
          <Button className="mt-3" variant="outline" onClick={() => void teamsQuery.refetch()}>تلاش مجدد</Button>
        </div>
      ) : !pageTeams.length ? (
        <div className="grid min-h-72 place-items-center rounded-[24px] border border-[var(--app-divider)] bg-[var(--app-surface)] text-sm text-muted-foreground">
          تیمی پیدا نشد.
        </div>
      ) : view === "CARDS" ? (
        <section className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {pageTeams.map((team) => (
            <article key={team.id} className="rounded-[24px] border border-[var(--app-divider)] bg-[var(--app-surface)] p-5 shadow-[var(--app-shadow-card)] transition hover:-translate-y-0.5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="grid size-12 place-items-center rounded-2xl bg-[var(--app-primary-soft)] font-black text-[var(--app-primary)]">
                    {initials(team.name)}
                  </div>
                  <div>
                    <h2 className="font-black">{team.name}</h2>
                    <p className="mt-0.5 text-xs text-muted-foreground" dir="ltr">{team.code}</p>
                  </div>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${team.isActive ? "bg-emerald-500/10 text-emerald-700" : "bg-muted text-muted-foreground"}`}>
                  {team.isActive ? "فعال" : "غیرفعال"}
                </span>
              </div>

              <p className="mt-4 min-h-12 text-sm leading-6 text-muted-foreground">
                {team.description || "برای این تیم توضیحی ثبت نشده است."}
              </p>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-muted/35 p-3">
                  <div className="text-xs text-muted-foreground">مدیر تیم</div>
                  <div className="mt-1 truncate text-sm font-bold">{team.manager?.fullName || "بدون مدیر"}</div>
                </div>
                <div className="rounded-2xl bg-muted/35 p-3">
                  <div className="text-xs text-muted-foreground">اعضا</div>
                  <div className="mt-1 text-sm font-bold">{fa(team.memberCount)} نفر</div>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between">
                <Button variant="outline" size="sm" onClick={() => navigate(`/admin/teams/${team.id}`)}>
                  مشاهده تیم
                </Button>
                {canManage ? (
                  <Button size="sm" variant="ghost" onClick={() => setStatusTarget(team)}>
                    {team.isActive ? "غیرفعال‌سازی" : "فعال‌سازی"}
                  </Button>
                ) : null}
              </div>
            </article>
          ))}
        </section>
      ) : (
        <section className="overflow-hidden rounded-[24px] border border-[var(--app-divider)] bg-[var(--app-surface)] shadow-[var(--app-shadow-card)]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm">
              <thead className="bg-muted/45 text-xs text-muted-foreground">
                <tr>
                  <th className="px-5 py-3 text-right">تیم</th>
                  <th className="px-4 py-3 text-right">مدیر</th>
                  <th className="px-4 py-3 text-right">اعضا</th>
                  <th className="px-4 py-3 text-right">وضعیت</th>
                  <th className="px-4 py-3 text-center">عملیات</th>
                </tr>
              </thead>
              <tbody>
                {pageTeams.map((team) => (
                  <tr key={team.id} className="border-t border-[var(--app-divider)] hover:bg-muted/25">
                    <td className="px-5 py-4">
                      <button className="text-right" onClick={() => navigate(`/admin/teams/${team.id}`)}>
                        <div className="font-bold">{team.name}</div>
                        <div className="text-xs text-muted-foreground" dir="ltr">{team.code}</div>
                      </button>
                    </td>
                    <td className="px-4 py-4">{team.manager?.fullName || "بدون مدیر"}</td>
                    <td className="px-4 py-4">{fa(team.memberCount)}</td>
                    <td className="px-4 py-4">{team.isActive ? "فعال" : "غیرفعال"}</td>
                    <td className="px-4 py-4 text-center">
                      <Button size="sm" variant="ghost" onClick={() => navigate(`/admin/teams/${team.id}`)}>جزئیات</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" disabled={!teamsQuery.data?.meta.hasPrevious} onClick={() => setPage((value) => Math.max(1, value - 1))}>
          <ChevronRight className="ms-1 size-4" />قبلی
        </Button>
        <span className="text-xs text-muted-foreground">
          صفحه {fa(teamsQuery.data?.meta.page ?? page)} از {fa(Math.max(1, teamsQuery.data?.meta.totalPages ?? 1))}
        </span>
        <Button variant="outline" size="sm" disabled={!teamsQuery.data?.meta.hasNext} onClick={() => setPage((value) => value + 1)}>
          بعدی<ChevronLeft className="me-1 size-4" />
        </Button>
      </div>

      <CreateTeamModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        managers={managers}
        onCreated={async (teamId) => {
          setCreateOpen(false)
          await refreshAll()
          navigate(`/admin/teams/${teamId}`)
        }}
      />

      <Modal
        open={Boolean(statusTarget)}
        onClose={() => setStatusTarget(null)}
        title={statusTarget?.isActive ? "غیرفعال‌سازی تیم" : "فعال‌سازی تیم"}
        description="وضعیت تیم روی تخصیص عضو جدید اثر می‌گذارد."
      >
        <p className="rounded-2xl bg-muted/50 p-4 text-sm leading-7 text-muted-foreground">
          {statusTarget?.isActive
            ? "غیرفعال‌سازی اعضای فعلی را حذف نمی‌کند، اما تخصیص عضو جدید به این تیم امکان‌پذیر نخواهد بود."
            : "با فعال‌سازی مجدد، این تیم دوباره برای تخصیص اعضا قابل استفاده خواهد بود."}
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setStatusTarget(null)}>انصراف</Button>
          <Button onClick={() => statusTarget && statusMutation.mutate(statusTarget)} disabled={statusMutation.isPending}>تأیید</Button>
        </div>
      </Modal>
    </div>
  )
}

function CreateTeamModal({
  open,
  onClose,
  managers,
  onCreated,
}: {
  open: boolean
  onClose: () => void
  managers: AdminUser[]
  onCreated: (teamId: string) => Promise<void>
}) {
  const [name, setName] = useState("")
  const [code, setCode] = useState("")
  const [description, setDescription] = useState("")
  const [managerId, setManagerId] = useState("")

  const mutation = useMutation({
    mutationFn: async () => {
      if (!name.trim()) throw new Error("نام تیم الزامی است.")
      if (!code.trim()) throw new Error("کد تیم الزامی است.")

      return createTeam({
        name: name.trim(),
        code: code.trim(),
        description: description.trim() || undefined,
        managerId: managerId || undefined,
      })
    },
    onSuccess: (team) => {
      toast.success("تیم ایجاد شد.")
      void onCreated(team.id)
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "ایجاد تیم انجام نشد.")),
  })

  return (
    <Modal open={open} onClose={onClose} title="ایجاد تیم" description="نام، کد، توضیح و مدیر تیم را مشخص کنید.">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-bold text-muted-foreground">نام تیم</label>
          <Input value={name} onChange={(event) => setName(event.target.value)} />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-bold text-muted-foreground">کد تیم</label>
          <Input value={code} onChange={(event) => setCode(event.target.value)} dir="ltr" placeholder="ENTERPRISE_SALES" />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-xs font-bold text-muted-foreground">توضیحات</label>
          <textarea
            className="min-h-24 w-full rounded-xl border border-input bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-ring/20"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-xs font-bold text-muted-foreground">مدیر تیم</label>
          <NativeSelect value={managerId} onChange={(event) => setManagerId(event.target.value)}>
            <option value="">بدون مدیر</option>
            {managers.map((manager) => <option key={manager.id} value={manager.id}>{manager.fullName}</option>)}
          </NativeSelect>
        </div>
      </div>

      <div className="mt-5 flex justify-end gap-2">
        <Button variant="outline" onClick={onClose}>انصراف</Button>
        <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>ایجاد تیم</Button>
      </div>
    </Modal>
  )
}
