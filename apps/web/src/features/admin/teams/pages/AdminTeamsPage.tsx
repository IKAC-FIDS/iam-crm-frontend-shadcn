import {uiText} from "@/config/uiText"
import { DataTableToolbar } from "@/components/shared/DataTableToolbar"
import { QueryContent } from "@/components/shared/QueryContent"
import { EmptyState } from "@/components/shared/EmptyState"
import { PageHero } from "@/components/shared/PageHero"
import { DataTableShell } from "@/components/shared/DataTableShell"
import { EntityTableCell } from "@/components/shared/EntityTableCell"
import { EntityRowActions } from "@/components/shared/EntityRowActions"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { useTeamsQueries } from "../hooks/useTeams"
import { useListQueryState, enumParam } from "@/lib/listQuery"
import { useDebouncedValue } from "@/lib/useDebouncedValue"
import {
  Activity,
  BadgeCheck,
  LayoutGrid,
  List,
  Plus,
  RefreshCcw,
  Sparkles,
  UserCog,
  UsersRound,
} from "lucide-react"
import { useMemo, useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { getApiErrorMessage } from "@/lib/apiResponse"
import { useAuthStore } from "@/store/authStore"
import { PaginationControls } from "@/components/shared/PaginationControls"
import { ResponsiveModal as Modal } from "@/components/shared/ResponsiveModal"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"

import {
  activateTeam,
  createTeam,
  deactivateTeam,
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
  return parts.length
    ? parts
        .slice(0, 2)
        .map((item) => item[0])
        .join("")
    : "T"
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
          <p className="mt-1 text-xs leading-6 text-muted-foreground">
            {helper}
          </p>
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

  const { params, page, pageSize, patch, setPage, setPageSize } =
    useListQueryState()
  const searchInput = params.get("search") || ""
  const search = useDebouncedValue(searchInput.trim(), 350)
  const status = enumParam(
    params.get("status"),
    ["ALL", "ACTIVE", "INACTIVE"],
    "ALL"
  )
  const managerId = params.get("managerId") || "ALL"
  const view = enumParam(params.get("view"), ["CARDS", "TABLE"], "CARDS")
  const setSearchInput = (search: string) =>
    patch({ search }, { replace: true })
  const setStatus = (status: StatusFilter) => patch({ status })
  const setManagerId = (managerId: string) => patch({ managerId })
  const setView = (view: ViewMode) => patch({ view }, { resetPage: false })
  const [createOpen, setCreateOpen] = useState(false)
  const [statusTarget, setStatusTarget] = useState<Team | null>(null)

  const filters = useMemo(
    () => ({
      page,
      limit: pageSize,
      search: search || undefined,
      managerId: managerId === "ALL" ? undefined : managerId,
      includeInactive: status === "ALL",
      isActive: status === "ALL" ? undefined : status === "ACTIVE",
    }),
    [page, pageSize, search, managerId, status]
  )

  const { teamsQuery, activeCountQuery, inactiveCountQuery, usersQuery } =
    useTeamsQueries(filters, search === searchInput.trim())

  const managers = useMemo(
    () =>
      (usersQuery.data ?? []).filter(
        (user) =>
          user.isActive && (user.role === "ADMIN" || user.role === "MANAGER")
      ),
    [usersQuery.data]
  )

  const activeTeams = activeCountQuery.data?.meta.total ?? 0
  const inactiveTeams = inactiveCountQuery.data?.meta.total ?? 0
  const totalTeams = activeTeams + inactiveTeams
  const pageTeams = teamsQuery.data?.data ?? []
  const totalMembersOnPage = pageTeams.reduce(
    (sum, item) => sum + item.memberCount,
    0
  )
  const withoutManagerOnPage = pageTeams.filter(
    (item) => !item.managerId && !item.manager
  ).length

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
      <PageHero
        title={"مدیریت تیم‌ها"}
        description={
          "ساختار تیم‌ها، مدیران، اعضا و وضعیت فعالیت را از یک فضای واحد مدیریت کنید."
        }
        eyebrow={"مرکز مدیریت تیم‌ها"}
        icon={Sparkles}
        actions={
          <div className="flex flex-wrap gap-2">
            <div className="flex rounded-xl border border-[var(--app-divider)] bg-[var(--app-background)] p-1">
              <Button
                size="sm"
                variant="ghost"
                className={
                  view === "CARDS"
                    ? "rounded-lg bg-[var(--app-surface)] text-[var(--app-primary)] shadow-sm"
                    : "rounded-lg"
                }
                onClick={() => setView("CARDS")}
                aria-label="نمای کارت"
              >
                <LayoutGrid className="size-4" />
                کارت‌ها
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className={
                  view === "TABLE"
                    ? "rounded-lg bg-[var(--app-surface)] text-[var(--app-primary)] shadow-sm"
                    : "rounded-lg"
                }
                onClick={() => setView("TABLE")}
                aria-label="نمای جدول"
              >
                <List className="size-4" />
                جدول
              </Button>
            </div>
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
        }
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="کل تیم‌ها"
          value={fa(totalTeams)}
          helper="تیم‌های فعال و غیرفعال"
          icon={UsersRound}
        />
        <StatCard
          title="تیم‌های فعال"
          value={fa(activeTeams)}
          helper="تیم‌های قابل استفاده برای تخصیص"
          icon={BadgeCheck}
        />
        <StatCard
          title="اعضای این صفحه"
          value={fa(totalMembersOnPage)}
          helper="مجموع اعضای تیم‌های نمایش‌داده‌شده"
          icon={Activity}
        />
        <StatCard
          title="بدون مدیر در این صفحه"
          value={fa(withoutManagerOnPage)}
          helper="تیم‌هایی که مدیر مشخص ندارند"
          icon={UserCog}
        />
      </section>

      <DataTableToolbar
        searchValue={searchInput}
        onSearchChange={setSearchInput}
        searchPlaceholder="جستجو در نام، کد یا توضیحات تیم"
        hasActiveFilters={Boolean(
          searchInput || managerId !== "ALL" || status !== "ALL"
        )}
        onClearFilters={() =>
          patch({ search: undefined, managerId: undefined, status: undefined })
        }
        filters={
          <>
            <NativeSelect
              aria-label="مدیر تیم"
              value={managerId}
              onChange={(event) => {
                setManagerId(event.target.value)
              }}
            >
              <option value="ALL">همه مدیران</option>
              {managers.map((manager) => (
                <option key={manager.id} value={manager.id}>
                  {manager.fullName}
                </option>
              ))}
            </NativeSelect>

            <NativeSelect
              aria-label="وضعیت تیم"
              value={status}
              onChange={(event) => {
                setStatus(event.target.value as StatusFilter)
              }}
            >
              <option value="ALL">{uiText.common.filters.allStatuses}</option>
              <option value="ACTIVE">فعال</option>
              <option value="INACTIVE">غیرفعال</option>
            </NativeSelect>
          </>
        }
      />

      <QueryContent query={teamsQuery}>
        {!pageTeams.length ? (
          <EmptyState title="تیمی پیدا نشد." />
        ) : view === "CARDS" ? (
          <section className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
            {pageTeams.map((team) => (
              <article
                key={team.id}
                className="rounded-[24px] border border-[var(--app-divider)] bg-[var(--app-surface)] p-5 shadow-[var(--app-shadow-card)] transition hover:-translate-y-0.5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="grid size-12 place-items-center rounded-2xl bg-[var(--app-primary-soft)] font-black text-[var(--app-primary)]">
                      {initials(team.name)}
                    </div>
                    <div>
                      <h2 className="font-black">{team.name}</h2>
                      <p
                        className="mt-0.5 text-xs text-muted-foreground"
                        dir="ltr"
                      >
                        {team.code}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-bold ${team.isActive ? "bg-emerald-500/10 text-emerald-700" : "bg-muted text-muted-foreground"}`}
                  >
                    {team.isActive ? uiText.common.active : uiText.common.inactive}
                  </span>
                </div>

                <p className="mt-4 min-h-12 text-sm leading-6 text-muted-foreground">
                  {team.description || "برای این تیم توضیحی ثبت نشده است."}
                </p>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-muted/35 p-3">
                    <div className="text-xs text-muted-foreground">
                      مدیر تیم
                    </div>
                    <div className="mt-1 truncate text-sm font-bold">
                      {team.manager?.fullName || "بدون مدیر"}
                    </div>
                  </div>
                  <div className="rounded-2xl bg-muted/35 p-3">
                    <div className="text-xs text-muted-foreground">اعضا</div>
                    <div className="mt-1 text-sm font-bold">
                      {fa(team.memberCount)} نفر
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/admin/teams/${team.id}`)}
                  >
                    مشاهده تیم
                  </Button>
                  {canManage ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setStatusTarget(team)}
                    >
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
              <DataTableShell
                entityRows
                rows={pageTeams}
                getRowKey={(team) => team.id}
                onRowClick={(team) => navigate(`/admin/teams/${team.id}`)}
                columns={[
                  {
                    id: "team",
                    header: "تیم",
                    cell: (team) => (
                      <EntityTableCell
                        title={team.name}
                        subtitle={team.code}
                        subtitleDir="ltr"
                        avatar={team.name.slice(0, 1)}
                      />
                    ),
                  },
                  {
                    id: "manager",
                    header: "مدیر",
                    cell: (team) => team.manager?.fullName || "بدون مدیر",
                  },
                  {
                    id: "members",
                    header: "اعضا",
                    cell: (team) => fa(team.memberCount),
                  },
                  {
                    id: "status",
                    header: "وضعیت",
                    cell: (team) => (
                      <StatusBadge tone={team.isActive ? "success" : "neutral"}>
                        {team.isActive ? uiText.common.active : uiText.common.inactive}
                      </StatusBadge>
                    ),
                  },
                  {
                    id: "actions",
                    header: "عملیات",
                    headerClassName: "text-end",
                    cell: (team) => (
                      <EntityRowActions
                        label="مشاهده جزئیات تیم"
                        onView={() => navigate(`/admin/teams/${team.id}`)}
                      />
                    ),
                  },
                ]}
              />
            </div>
          </section>
        )}
      </QueryContent>
      <PaginationControls
        page={teamsQuery.data?.meta.page ?? page}
        pageCount={teamsQuery.data?.meta.totalPages ?? 1}
        onPageChange={setPage}
        pageSize={pageSize}
        onPageSizeChange={setPageSize}
        total={teamsQuery.data?.meta.total}
        disabled={teamsQuery.isFetching}
      />

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
          <Button variant="outline" onClick={() => setStatusTarget(null)}>
            انصراف
          </Button>
          <Button
            onClick={() => statusTarget && statusMutation.mutate(statusTarget)}
            disabled={statusMutation.isPending}
          >
            تأیید
          </Button>
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
    onError: (error) =>
      toast.error(getApiErrorMessage(error, "ایجاد تیم انجام نشد.")),
  })

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="ایجاد تیم"
      description="نام، کد، توضیح و مدیر تیم را مشخص کنید."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-bold text-muted-foreground">
            نام تیم
          </label>
          <Input
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-bold text-muted-foreground">
            کد تیم
          </label>
          <Input
            value={code}
            onChange={(event) => setCode(event.target.value)}
            dir="ltr"
            placeholder="ENTERPRISE_SALES"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-xs font-bold text-muted-foreground">
            توضیحات
          </label>
          <textarea
            className="min-h-24 w-full rounded-xl border border-input bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-ring/20"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-xs font-bold text-muted-foreground">
            مدیر تیم
          </label>
          <NativeSelect
            value={managerId}
            onChange={(event) => setManagerId(event.target.value)}
          >
            <option value="">بدون مدیر</option>
            {managers.map((manager) => (
              <option key={manager.id} value={manager.id}>
                {manager.fullName}
              </option>
            ))}
          </NativeSelect>
        </div>
      </div>

      <div className="mt-5 flex justify-end gap-2">
        <Button variant="outline" onClick={onClose}>
          انصراف
        </Button>
        <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>
          ایجاد تیم
        </Button>
      </div>
    </Modal>
  )
}
