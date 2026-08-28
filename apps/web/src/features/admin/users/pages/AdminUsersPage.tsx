import { PageHero } from "@/components/shared/PageHero"
import { MetricCard } from "@/components/shared/MetricCard"
import { DataTableToolbar } from "@/components/shared/DataTableToolbar"
import {
  DataTableShell,
  type DataTableColumn,
} from "@/components/shared/DataTableShell"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { EmptyState } from "@/components/shared/EmptyState"
import { QueryContent } from "@/components/shared/QueryContent"
import { uiText } from "@/config/uiText"
import { enumParam, useListQueryState } from "@/lib/listQuery"
import { useDebouncedValue } from "@/lib/useDebouncedValue"
import {
  useAdminUsers,
  useAdminUserCount,
  useAdminUserOptions,
  useRefreshAdminUsers,
  useSetAdminUserStatus,
} from "../hooks/useAdminUsers"
import { CreateUserModal } from "../components/CreateUserModal"
import {
  Ban,
  CircleGauge,
  Eye,
  MoreHorizontal,
  Plus,
  RefreshCcw,
  Sparkles,
  UserCheck,
  UsersRound,
} from "lucide-react"
import { useMemo, useState, type SelectHTMLAttributes } from "react"

import { toast } from "sonner"
import { useNavigate } from "react-router-dom"

import { getApiErrorMessage } from "@/lib/apiResponse"
import { useAuthStore } from "@/store/authStore"
import { ResponsiveModal as Modal } from "@/components/shared/ResponsiveModal"
import { PaginationControls } from "@/components/shared/PaginationControls"
import { Button } from "@workspace/ui/components/button"

import {
  USER_ROLES,
  USER_ROLE_LABELS,
  type AdminUser,
} from "../api/adminUsersApi"

const fa = (v: number) => new Intl.NumberFormat("fa-IR").format(v)
const can = (p: string[], action: string) => p.includes(action)
const initials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase() || "U"
const roleLabel = (u: AdminUser) =>
  u.assignedRole?.name || USER_ROLE_LABELS[u.role] || u.role
const teamLabel = (u: AdminUser) =>
  u.teamRef?.name || u.team || uiText.adminUsers.noTeam
function formatDate(value?: string) {
  if (!value) return "—"
  try {
    return new Intl.DateTimeFormat("fa-IR", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value))
  } catch {
    return "—"
  }
}

function NativeSelect(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`h-10 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20 ${props.className ?? ""}`}
    />
  )
}
export function AdminUsersPage() {
  const navigate = useNavigate()
  const current = useAuthStore((s) => s.user)
  const permissions = current?.permissions ?? []
  const refresh = useRefreshAdminUsers()
  const canCreate = can(permissions, "user:create")
  const canChangeRole = can(permissions, "user:change-role")
  const canViewTeams =
    can(permissions, "team:view") || can(permissions, "team:manage")
  const canViewRoles = can(permissions, "role:view")

  const { params, page, pageSize, patch, setPage, setPageSize } =
    useListQueryState()
  const searchInput = params.get("search") ?? ""
  const search = useDebouncedValue(searchInput.trim(), 350)
  const role = enumParam(params.get("role"), [...USER_ROLES, "ALL"], "ALL")
  const teamId = params.get("teamId") || "ALL"
  const status = enumParam(
    params.get("status"),
    ["ALL", "ACTIVE", "INACTIVE"],
    "ALL"
  )
  const [createOpen, setCreateOpen] = useState(false)
  const [statusTarget, setStatusTarget] = useState<AdminUser | null>(null)
  const filters = useMemo(
    () => ({
      page,
      limit: pageSize,
      search: search || undefined,
      role: role === "ALL" ? undefined : role,
      teamId: teamId === "ALL" ? undefined : teamId,
      isActive: status === "ALL" ? undefined : status === "ACTIVE",
    }),
    [page, pageSize, search, role, teamId, status]
  )

  const isSearchPending = search !== searchInput.trim()
  const users = useAdminUsers(filters, !isSearchPending)
  const activeCount = useAdminUserCount(true)
  const inactiveCount = useAdminUserCount(false)
  const { teams, roles, quota } = useAdminUserOptions(
    canViewTeams,
    canViewRoles
  )
  const statusMutation = useSetAdminUserStatus({
    onSuccess: async (u) => {
      toast.success(u.isActive ? "کاربر غیرفعال شد." : "کاربر فعال شد.")
      setStatusTarget(null)
      await refresh()
    },
    onError: (e) =>
      toast.error(getApiErrorMessage(e, "تغییر وضعیت کاربر انجام نشد.")),
  })

  const active = activeCount.data?.meta.total ?? 0,
    inactive = inactiveCount.data?.meta.total ?? 0,
    total = active + inactive
  const activeQuota = quota.data?.metrics?.find(
      (m) => m.metric === "ACTIVE_USERS"
    ),
    quotaCurrent = activeQuota ? Number(activeQuota.current) : active,
    quotaLimit = activeQuota?.hardLimit ? Number(activeQuota.hardLimit) : null
  const hasFilters = Boolean(
    search || role !== "ALL" || teamId !== "ALL" || status !== "ALL"
  )
  const clearFilters = () => {
    patch({
      search: undefined,
      role: undefined,
      teamId: undefined,
      status: undefined,
    })
  }

  const columns = useMemo<DataTableColumn<AdminUser>[]>(
    () => [
      {
        id: "user",
        header: "کاربر",
        cell: (u) => (
          <>
            <div className="flex items-center gap-3 text-right">
              <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-[var(--app-primary-soft)] font-black text-[var(--app-primary)]">
                {initials(u.fullName)}
              </span>
              <span>
                <span className="block font-bold">{u.fullName}</span>
                <span
                  className="mt-0.5 block text-xs text-muted-foreground"
                  dir="ltr"
                >
                  {u.email}
                </span>
              </span>
            </div>
          </>
        ),
      },
      {
        id: "role",
        header: uiText.adminUsers.fields.roleChoice,
        cell: (u) => (
          <>
            <StatusBadge tone="primary" dot={false}>
              {roleLabel(u)}
            </StatusBadge>
          </>
        ),
      },
      {
        id: "team",
        header: uiText.adminUsers.fields.teamId,
        cell: (u) => <>{teamLabel(u)}</>,
      },
      {
        id: "status",
        header: uiText.adminUsers.fields.status,
        cell: (u) => (
          <>
            <StatusBadge tone={u.isActive ? "success" : "neutral"}>
              {u.isActive ? uiText.common.active : uiText.common.inactive}
            </StatusBadge>
          </>
        ),
      },
      {
        id: "updated",
        header: "آخرین تغییر",
        cell: (u) => <>{formatDate(u.updatedAt || u.createdAt)}</>,
      },
      {
        id: "actions",
        header: "عملیات",
        cell: (u) => (
          <>
            <div className="flex justify-center gap-1">
              <Button
                size="icon-sm"
                variant="ghost"
                aria-label="مشاهده جزئیات کاربر"
                title="مشاهده جزئیات"
                onClick={(event) => {
                  event.stopPropagation()
                  navigate(`/admin/users/${u.id}`)
                }}
              >
                <Eye className="size-4" />
              </Button>
              {canChangeRole ? (
                <Button
                  size="icon-sm"
                  variant="ghost"
                  aria-label="عملیات کاربر"
                  title="عملیات"
                  onClick={(event) => {
                    event.stopPropagation()
                    navigate(`/admin/users/${u.id}`)
                  }}
                >
                  <MoreHorizontal className="size-4" />
                </Button>
              ) : null}
            </div>
          </>
        ),
      },
    ],
    [navigate, canChangeRole]
  )

  return (
    <div className="grid gap-5" dir="rtl">
      <PageHero
        title={uiText.adminUsers.title}
        eyebrow="مرکز مدیریت کاربران"
        icon={Sparkles}
        description="کاربران، نقش‌ها، تیم‌ها، وضعیت دسترسی و تاریخچه تغییرات را از یک فضای واحد مدیریت کنید."
        actions={
          <>
            <Button variant="outline" onClick={() => void refresh()}>
              <RefreshCcw className="ms-2 size-4" />
              {uiText.common.refresh}
            </Button>
            {canCreate ? (
              <Button onClick={() => setCreateOpen(true)}>
                <Plus className="ms-2 size-4" />
                {uiText.adminUsers.create}
              </Button>
            ) : null}
          </>
        }
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="کل کاربران"
          value={fa(total)}
          helper="تمام کاربران ثبت‌شده در سازمان"
          icon={UsersRound}
        />
        <MetricCard
          label="کاربران فعال"
          value={fa(active)}
          helper="حساب‌هایی که امکان استفاده از سامانه دارند"
          icon={UserCheck}
          tone="success"
        />
        <MetricCard
          label="کاربران غیرفعال"
          value={fa(inactive)}
          helper="حساب‌هایی که دسترسی آن‌ها متوقف شده است"
          icon={Ban}
          tone={inactive ? "warning" : "neutral"}
        />
        <MetricCard
          label="ظرفیت کاربران فعال"
          value={
            quotaLimit
              ? `${fa(quotaCurrent)} / ${fa(quotaLimit)}`
              : fa(quotaCurrent)
          }
          helper={
            quotaLimit
              ? "مصرف فعلی از سقف مجاز کاربران فعال"
              : "مصرف فعلی؛ سقف مشخص نشده است"
          }
          icon={CircleGauge}
        />
      </section>

      <DataTableToolbar
        filtersClassName="grid grid-cols-1 sm:grid-cols-3"
        searchValue={searchInput}
        onSearchChange={(search) => patch({ search }, { replace: true })}
        searchPlaceholder={uiText.adminUsers.search}
        hasActiveFilters={hasFilters}
        onClearFilters={clearFilters}
        filters={
          <>
            <NativeSelect
              aria-label={uiText.adminUsers.fields.roleChoice}
              value={role}
              onChange={(e) => {
                patch({ role: e.target.value })
              }}
            >
              <option value="ALL">همه نقش‌ها</option>
              {USER_ROLES.map((r) => (
                <option key={r} value={r}>
                  {USER_ROLE_LABELS[r]}
                </option>
              ))}
            </NativeSelect>
            <NativeSelect
              aria-label={uiText.adminUsers.fields.teamId}
              value={teamId}
              disabled={!canViewTeams || teams.isLoading}
              onChange={(e) => {
                patch({ teamId: e.target.value })
              }}
            >
              <option value="ALL">
                {canViewTeams ? "همه تیم‌ها" : "بدون دسترسی به تیم‌ها"}
              </option>
              {(teams.data ?? []).map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </NativeSelect>
            <NativeSelect
              aria-label={uiText.adminUsers.fields.status}
              value={status}
              onChange={(e) => {
                patch({ status: e.target.value })
              }}
            >
              <option value="ALL">همه وضعیت‌ها</option>
              <option value="ACTIVE">{uiText.common.active}</option>
              <option value="INACTIVE">{uiText.common.inactive}</option>
            </NativeSelect>
          </>
        }
      />

      <QueryContent query={users}>
        <DataTableShell
          caption="فهرست کاربران"
          rows={users.data?.data ?? []}
          columns={columns}
          getRowKey={(user) => user.id}
          onRowClick={(user) => navigate(`/admin/users/${user.id}`)}
          emptyState={
            <EmptyState
              icon={UsersRound}
              title="کاربری پیدا نشد"
              description="فیلترها را تغییر دهید یا یک کاربر جدید اضافه کنید."
            />
          }
        />
        <PaginationControls
          page={users.data?.meta.page ?? page}
          pageCount={users.data?.meta.totalPages ?? 1}
          pageSize={pageSize}
          total={users.data?.meta.total}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          disabled={users.isFetching || isSearchPending}
        />
      </QueryContent>

      <CreateUserModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        teams={teams.data ?? []}
        roles={roles.data ?? []}
        canChangeRole={canChangeRole}
        canUseTeams={canViewTeams}
        onCreated={async (id) => {
          setCreateOpen(false)
          await refresh()
          navigate(`/admin/users/${id}`)
        }}
      />
      <Modal
        open={Boolean(statusTarget)}
        onClose={() => setStatusTarget(null)}
        title={
          statusTarget?.isActive ? "غیرفعال‌سازی کاربر" : "فعال‌سازی کاربر"
        }
        description="این عملیات روی امکان ورود و دسترسی کاربر اثر می‌گذارد."
      >
        <p className="rounded-2xl bg-muted/50 p-4 text-sm leading-7 text-muted-foreground">
          آیا از {statusTarget?.isActive ? "غیرفعال کردن" : "فعال کردن"} حساب «
          {statusTarget?.fullName}» مطمئن هستید؟
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setStatusTarget(null)}>
            {uiText.common.cancel}
          </Button>
          <Button
            onClick={() => statusTarget && statusMutation.mutate(statusTarget)}
            disabled={statusMutation.isPending}
          >
            {uiText.common.confirm}
          </Button>
        </div>
      </Modal>
    </div>
  )
}
