import { MetricCard } from "@/components/shared/MetricCard"
import { EntityListPage } from "@/components/shared/EntityListPage"
import { uiText } from "@/config/uiText"
import { DataTableToolbar } from "@/components/shared/DataTableToolbar"
import { QueryContent } from "@/components/shared/QueryContent"
import { EmptyState } from "@/components/shared/EmptyState"
import { PageHero } from "@/components/shared/PageHero"
import {
  EntityCardList,
  type EntityCardField,
} from "@/components/shared/EntityCardList"
import { IdentityAvatar } from "@/components/shared/IdentityAvatar"
import { EntityRowActions } from "@/components/shared/EntityRowActions"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { useTeamsQueries } from "../hooks/useTeams"
import { useListQueryState, enumParam } from "@/lib/listQuery"
import { useDebouncedValue } from "@/lib/useDebouncedValue"
import {
  Activity,
  BadgeCheck,
  Eye,
  LayoutGrid,
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

function fa(value: number) {
  return new Intl.NumberFormat("fa-IR").format(value)
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
  const setSearchInput = (search: string) =>
    patch({ search }, { replace: true })
  const setStatus = (status: StatusFilter) => patch({ status })
  const setManagerId = (managerId: string) => patch({ managerId })
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

  const cardFields = useMemo<EntityCardField<Team>[]>(
    () => [
      {
        id: "manager",
        label: "مدیر تیم",
        icon: UserCog,
        render: (team) => team.manager?.fullName || "بدون مدیر",
      },
      {
        id: "members",
        label: "تعداد اعضا",
        icon: UsersRound,
        render: (team) => `${fa(team.memberCount)} نفر`,
      },
      {
        id: "description",
        label: "توضیحات",
        render: (team) =>
          team.description || "برای این تیم توضیحی ثبت نشده است.",
        priority: "primary",
      },
    ],
    []
  )

  return (
    <EntityListPage>
      <PageHero
        title={"مدیریت تیم‌ها"}
        description={
          "ساختار تیم‌ها، مدیران، اعضا و وضعیت فعالیت را از یک فضای واحد مدیریت کنید."
        }
        eyebrow={"مرکز مدیریت تیم‌ها"}
        icon={Sparkles}
        primaryAction={
          canManage
            ? {
                label: "ایجاد تیم",
                icon: Plus,
                onClick: () => setCreateOpen(true),
              }
            : undefined
        }
        onRefresh={refreshAll}
        refreshing={teamsQuery.isFetching || usersQuery.isFetching}
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="کل تیم‌ها"
          value={fa(totalTeams)}
          helper="تیم‌های فعال و غیرفعال"
          icon={UsersRound}
        />
        <MetricCard
          label="تیم‌های فعال"
          value={fa(activeTeams)}
          helper="تیم‌های قابل استفاده برای تخصیص"
          icon={BadgeCheck}
        />
        <MetricCard
          label="اعضای این صفحه"
          value={fa(totalMembersOnPage)}
          helper="مجموع اعضای تیم‌های نمایش‌داده‌شده"
          icon={Activity}
        />
        <MetricCard
          label="بدون مدیر در این صفحه"
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
        <EntityCardList
          rows={pageTeams}
          fields={cardFields}
          layout="row"
          density="compact"
          fieldsClassName="lg:grid-cols-3"
          getRowKey={(team) => team.id}
          onRowClick={(team) => navigate(`/admin/teams/${team.id}`)}
          title={(team) => team.name}
          subtitle={(team) => <span dir="ltr">{team.code}</span>}
          media={(team) => (
            <IdentityAvatar name={team.name} className="size-12" />
          )}
          badges={(team) => (
            <StatusBadge tone={team.isActive ? "success" : "neutral"}>
              {team.isActive ? uiText.common.active : uiText.common.inactive}
            </StatusBadge>
          )}
          actions={(team) => (
            <EntityRowActions
              presentation="buttons"
              actions={[
                {
                  id: "view",
                  label: "مشاهده جزئیات",
                  icon: Eye,
                  onClick: () => navigate(`/admin/teams/${team.id}`),
                },
                {
                  id: "toggle",
                  label: team.isActive ? "غیرفعال‌سازی" : "فعال‌سازی",
                  icon: RefreshCcw,
                  enabled: canManage,
                  tone: team.isActive ? "danger" : "default",
                  onClick: () => setStatusTarget(team),
                },
              ]}
            />
          )}
          emptyState={
            <EmptyState
              icon={LayoutGrid}
              title="تیمی پیدا نشد"
              description="فیلترها را تغییر دهید یا یک تیم جدید ایجاد کنید."
            />
          }
        />
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
    </EntityListPage>
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
