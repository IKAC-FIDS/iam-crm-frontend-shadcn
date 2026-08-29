import { DataTableShell } from "@/components/shared/DataTableShell"
import { EntityTableCell } from "@/components/shared/EntityTableCell"
import { EntityRowActions } from "@/components/shared/EntityRowActions"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { QueryContent } from "@/components/shared/QueryContent"
import { EmptyState } from "@/components/shared/EmptyState"
import { useTeamDetailQueries } from "../hooks/useTeams"
import {
  ArrowRight,
  BadgeCheck,
  Ban,
  Clock3,
  Plus,
  Save,
  Trash2,
  UserCog,
  UsersRound,
} from "lucide-react"
import { useMemo, useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useNavigate, useParams } from "react-router-dom"
import { toast } from "sonner"

import { getApiErrorMessage } from "@/lib/apiResponse"
import { useAuthStore } from "@/store/authStore"
import { PaginationControls } from "@/components/shared/PaginationControls"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"

import {
  activateTeam,
  addTeamMember,
  deactivateTeam,
  removeTeamMember,
  updateTeam,
} from "../api/adminTeamsApi"

function fa(value: number) {
  return new Intl.NumberFormat("fa-IR").format(value)
}

function dateTime(value?: string) {
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

export function AdminTeamDetailsPage() {
  const { teamId } = useParams<{ teamId: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const current = useAuthStore((state) => state.user)
  const permissions = current?.permissions ?? []
  const canManage = can(permissions, "team:manage")
  const canViewAudit = can(permissions, "audit-log:view")

  const { teamQuery, membersQuery, usersQuery, auditQuery } =
    useTeamDetailQueries(teamId || "", canViewAudit)

  const team = teamQuery.data
  const members = useMemo(() => membersQuery.data ?? [], [membersQuery.data])
  const allUsers = useMemo(() => usersQuery.data ?? [], [usersQuery.data])

  const managers = useMemo(
    () =>
      allUsers.filter(
        (user) =>
          user.isActive && (user.role === "ADMIN" || user.role === "MANAGER")
      ),
    [allUsers]
  )

  const addableUsers = useMemo(
    () =>
      allUsers.filter(
        (user) =>
          user.isActive && !members.some((member) => member.id === user.id)
      ),
    [allUsers, members]
  )

  const [name, setName] = useState("")
  const [code, setCode] = useState("")
  const [description, setDescription] = useState("")
  const [managerId, setManagerId] = useState("")
  const [newMemberId, setNewMemberId] = useState("")
  const [memberPage, setMemberPage] = useState(1)
  const [memberPageSize, setMemberPageSize] = useState(20)

  const resetInputs0 = [
    team?.id,
    team?.name,
    team?.code,
    team?.description,
    team?.managerId,
    team?.manager?.id,
  ] as const
  const [previousResetInputs0, setPreviousResetInputs0] = useState<
    typeof resetInputs0 | null
  >(null)
  if (
    previousResetInputs0 === null ||
    previousResetInputs0[0] !== resetInputs0[0] ||
    previousResetInputs0[1] !== resetInputs0[1] ||
    previousResetInputs0[2] !== resetInputs0[2] ||
    previousResetInputs0[3] !== resetInputs0[3] ||
    previousResetInputs0[4] !== resetInputs0[4] ||
    previousResetInputs0[5] !== resetInputs0[5]
  ) {
    setPreviousResetInputs0(resetInputs0)
    if (team) {
      setName(team.name)
      setCode(team.code)
      setDescription(team.description ?? "")
      setManagerId(team.managerId ?? team.manager?.id ?? "")
    }
  }

  const refreshTeam = async () => {
    await queryClient.invalidateQueries({
      queryKey: ["admin-team-detail", teamId],
    })
    await queryClient.invalidateQueries({
      queryKey: ["admin-team-members", teamId],
    })
    await queryClient.invalidateQueries({ queryKey: ["admin-teams"] })
    await queryClient.invalidateQueries({
      queryKey: ["admin-team-audit", teamId],
    })
  }

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!team) return
      return updateTeam(team.id, {
        name: name.trim(),
        code: code.trim(),
        description: description.trim() || null,
        managerId: managerId || null,
      })
    },
    onSuccess: async () => {
      toast.success("اطلاعات تیم ذخیره شد.")
      await refreshTeam()
    },
    onError: (error) =>
      toast.error(getApiErrorMessage(error, "ویرایش تیم انجام نشد.")),
  })

  const statusMutation = useMutation({
    mutationFn: async () => {
      if (!team) return
      return team.isActive ? deactivateTeam(team.id) : activateTeam(team.id)
    },
    onSuccess: async () => {
      toast.success(team?.isActive ? "تیم غیرفعال شد." : "تیم فعال شد.")
      await refreshTeam()
    },
    onError: (error) =>
      toast.error(getApiErrorMessage(error, "تغییر وضعیت تیم انجام نشد.")),
  })

  const addMemberMutation = useMutation({
    mutationFn: async () => {
      if (!team || !newMemberId) return
      return addTeamMember(team.id, newMemberId)
    },
    onSuccess: async () => {
      toast.success("عضو به تیم اضافه شد.")
      setNewMemberId("")
      await refreshTeam()
    },
    onError: (error) =>
      toast.error(getApiErrorMessage(error, "افزودن عضو انجام نشد.")),
  })

  const removeMemberMutation = useMutation({
    mutationFn: async (userId: string) => {
      if (!team) return
      return removeTeamMember(team.id, userId)
    },
    onSuccess: async () => {
      toast.success("عضو از تیم حذف شد.")
      await refreshTeam()
    },
    onError: (error) =>
      toast.error(getApiErrorMessage(error, "حذف عضو از تیم انجام نشد.")),
  })

  if (teamQuery.isLoading) {
    return (
      <div className="grid min-h-72 place-items-center text-sm text-muted-foreground">
        در حال دریافت اطلاعات تیم...
      </div>
    )
  }

  if (teamQuery.isError || !team) {
    return (
      <div className="grid min-h-72 place-items-center text-center">
        <div>
          <p className="font-bold">اطلاعات تیم دریافت نشد.</p>
          <Button
            className="mt-3"
            variant="outline"
            onClick={() => navigate("/admin/teams")}
          >
            بازگشت
          </Button>
        </div>
      </div>
    )
  }

  const activeMembers = members.filter((member) => member.isActive).length
  const inactiveMembers = members.length - activeMembers
  const memberPageCount = Math.max(
    1,
    Math.ceil(members.length / memberPageSize)
  )
  const safeMemberPage = Math.min(memberPage, memberPageCount)
  const visibleMembers = members.slice(
    (safeMemberPage - 1) * memberPageSize,
    safeMemberPage * memberPageSize
  )

  return (
    <div className="grid gap-5" dir="rtl">
      <section className="rounded-[28px] border border-[var(--app-divider)] bg-[var(--app-surface)] p-6 shadow-[var(--app-shadow-card)]">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="flex items-start gap-4">
            <Button
              size="icon-sm"
              variant="ghost"
              onClick={() => navigate("/admin/teams")}
            >
              <ArrowRight className="size-4" />
            </Button>
            <div className="grid size-16 place-items-center rounded-[22px] bg-[var(--app-primary-soft)] text-xl font-black text-[var(--app-primary)]">
              {team.name
                .split(/\s+/)
                .slice(0, 2)
                .map((item) => item[0])
                .join("")}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-black">{team.name}</h1>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-bold ${team.isActive ? "bg-emerald-500/10 text-emerald-700" : "bg-muted text-muted-foreground"}`}
                >
                  {team.isActive ? "فعال" : "غیرفعال"}
                </span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground" dir="ltr">
                {team.code}
              </p>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
                {team.description || "توضیحی برای این تیم ثبت نشده است."}
              </p>
            </div>
          </div>

          {canManage ? (
            <Button
              variant={team.isActive ? "outline" : "default"}
              onClick={() => statusMutation.mutate()}
              disabled={statusMutation.isPending}
            >
              {team.isActive ? (
                <Ban className="ms-2 size-4" />
              ) : (
                <BadgeCheck className="ms-2 size-4" />
              )}
              {team.isActive ? "غیرفعال‌سازی" : "فعال‌سازی مجدد"}
            </Button>
          ) : null}
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-[22px] border border-[var(--app-divider)] bg-[var(--app-surface)] p-4">
          <div className="text-xs text-muted-foreground">کل اعضا</div>
          <div className="mt-2 text-2xl font-black">{fa(members.length)}</div>
        </article>
        <article className="rounded-[22px] border border-[var(--app-divider)] bg-[var(--app-surface)] p-4">
          <div className="text-xs text-muted-foreground">اعضای فعال</div>
          <div className="mt-2 text-2xl font-black">{fa(activeMembers)}</div>
        </article>
        <article className="rounded-[22px] border border-[var(--app-divider)] bg-[var(--app-surface)] p-4">
          <div className="text-xs text-muted-foreground">اعضای غیرفعال</div>
          <div className="mt-2 text-2xl font-black">{fa(inactiveMembers)}</div>
        </article>
        <article className="rounded-[22px] border border-[var(--app-divider)] bg-[var(--app-surface)] p-4">
          <div className="text-xs text-muted-foreground">مدیر تیم</div>
          <div className="mt-2 truncate font-black">
            {team.manager?.fullName || "بدون مدیر"}
          </div>
        </article>
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <article className="rounded-[24px] border border-[var(--app-divider)] bg-[var(--app-surface)] p-5 shadow-[var(--app-shadow-card)]">
          <div className="mb-4 flex items-center gap-2">
            <UserCog className="size-5 text-[var(--app-primary)]" />
            <h2 className="font-bold">تنظیمات تیم</h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-bold text-muted-foreground">
                نام تیم
              </label>
              <Input
                value={name}
                onChange={(event) => setName(event.target.value)}
                disabled={!canManage}
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
                disabled={!canManage}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-xs font-bold text-muted-foreground">
                مدیر تیم
              </label>
              <NativeSelect
                value={managerId}
                onChange={(event) => setManagerId(event.target.value)}
                disabled={!canManage}
              >
                <option value="">بدون مدیر</option>
                {managers.map((manager) => (
                  <option key={manager.id} value={manager.id}>
                    {manager.fullName}
                  </option>
                ))}
              </NativeSelect>
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-xs font-bold text-muted-foreground">
                توضیحات
              </label>
              <textarea
                className="min-h-28 w-full rounded-xl border border-input bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-ring/20 disabled:opacity-50"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                disabled={!canManage}
              />
            </div>
          </div>

          {canManage ? (
            <Button
              className="mt-4"
              onClick={() => updateMutation.mutate()}
              disabled={updateMutation.isPending}
            >
              <Save className="ms-2 size-4" />
              ذخیره تغییرات
            </Button>
          ) : null}
        </article>

        <article className="rounded-[24px] border border-[var(--app-divider)] bg-[var(--app-surface)] p-5 shadow-[var(--app-shadow-card)]">
          <div className="mb-4 flex items-center gap-2">
            <UsersRound className="size-5 text-[var(--app-primary)]" />
            <h2 className="font-bold">افزودن عضو</h2>
          </div>

          {canManage ? (
            <>
              <p className="mb-4 text-xs leading-6 text-muted-foreground">
                افزودن کاربری که عضو تیم دیگری است، او را به این تیم منتقل
                می‌کند.
              </p>
              <div className="flex gap-2">
                <NativeSelect
                  value={newMemberId}
                  onChange={(event) => setNewMemberId(event.target.value)}
                  disabled={!team.isActive}
                >
                  <option value="">انتخاب کاربر</option>
                  {addableUsers.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.fullName} — {user.role}
                    </option>
                  ))}
                </NativeSelect>
                <Button
                  onClick={() => addMemberMutation.mutate()}
                  disabled={
                    !newMemberId ||
                    !team.isActive ||
                    addMemberMutation.isPending
                  }
                >
                  <Plus className="size-4" />
                </Button>
              </div>
              {!team.isActive ? (
                <p className="mt-3 text-xs text-amber-700">
                  برای افزودن عضو، ابتدا تیم را فعال کنید.
                </p>
              ) : null}
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              مجوز مدیریت تیم برای افزودن عضو لازم است.
            </p>
          )}
        </article>
      </section>

      <section className="overflow-hidden rounded-[24px] border border-[var(--app-divider)] bg-[var(--app-surface)] shadow-[var(--app-shadow-card)]">
        <div className="border-b border-[var(--app-divider)] px-5 py-4">
          <h2 className="font-bold">اعضای تیم</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            {fa(members.length)} عضو
          </p>
        </div>

        <QueryContent query={membersQuery}>
          <DataTableShell
            entityRows
            rows={visibleMembers}
            getRowKey={(member) => member.id}
            onRowClick={(member) => navigate(`/admin/users/${member.id}`)}
            mobile={{
              title: (member) => member.fullName,
              subtitle: (member) => member.email,
              avatar: (member) => member.fullName.slice(0, 1),
              status: (member) => <StatusBadge tone={member.isActive ? "success" : "neutral"}>{member.isActive ? "فعال" : "غیرفعال"}</StatusBadge>,
              fields: [{ id: "role", label: "نقش", render: (member) => member.role }],
            }}
            emptyState={
              <EmptyState
                title="عضوی در این تیم وجود ندارد."
                description="اعضای تیم در این بخش نمایش داده می‌شوند."
              />
            }
            columns={[
              {
                id: "user",
                header: "کاربر",
                cell: (member) => (
                  <EntityTableCell
                    title={member.fullName}
                    subtitle={member.email}
                    subtitleDir="ltr"
                    avatar={member.fullName.slice(0, 1)}
                  />
                ),
              },
              { id: "role", header: "نقش", cell: (member) => member.role },
              {
                id: "status",
                header: "وضعیت",
                cell: (member) => (
                  <StatusBadge tone={member.isActive ? "success" : "neutral"}>
                    {member.isActive ? "فعال" : "غیرفعال"}
                  </StatusBadge>
                ),
              },
              {
                id: "actions",
                header: "عملیات",
                headerClassName: "text-end",
                cell: (member) => (
                  <EntityRowActions
                    label="مشاهده جزئیات کاربر"
                    onView={() => navigate(`/admin/users/${member.id}`)}
                    actions={[
                      {
                        id: "delete",
                        label: "حذف از تیم",
                        icon: Trash2,
                        enabled: canManage,
                        disabled: removeMemberMutation.isPending,
                        tone: "danger",
                        confirmation: {
                          title: "حذف عضو از تیم",
                          description: "این عضو از تیم حذف شود؟",
                        },
                        onClick: () =>
                          removeMemberMutation.mutateAsync(member.id),
                      },
                    ]}
                  />
                ),
              },
            ]}
          />
        </QueryContent>
        {members.length ? (
          <div className="border-t border-[var(--app-divider)] p-3">
            <PaginationControls
              page={safeMemberPage}
              pageCount={memberPageCount}
              pageSize={memberPageSize}
              total={members.length}
              disabled={membersQuery.isFetching}
              onPageChange={setMemberPage}
              onPageSizeChange={(value) => {
                setMemberPageSize(value)
                setMemberPage(1)
              }}
            />
          </div>
        ) : null}
      </section>

      <section className="rounded-[24px] border border-[var(--app-divider)] bg-[var(--app-surface)] p-5 shadow-[var(--app-shadow-card)]">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Clock3 className="size-5 text-[var(--app-primary)]" />
            <h2 className="font-bold">تاریخچه مدیریتی</h2>
          </div>
          {canViewAudit ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="rounded-xl"
              onClick={() =>
                navigate(
                  `/admin/audit-logs?entityType=team&entityId=${encodeURIComponent(team.id)}`
                )
              }
            >
              مشاهده همه رویدادها
            </Button>
          ) : null}
        </div>

        {!canViewAudit ? (
          <p className="text-sm text-muted-foreground">
            مجوز مشاهده Audit Log برای این بخش لازم است.
          </p>
        ) : auditQuery.isLoading ? (
          <p className="text-sm text-muted-foreground">
            در حال دریافت تاریخچه...
          </p>
        ) : !(auditQuery.data ?? []).length ? (
          <p className="text-sm text-muted-foreground">
            رویدادی برای این تیم ثبت نشده است.
          </p>
        ) : (
          <div className="grid gap-3">
            {(auditQuery.data ?? []).map((item) => (
              <div key={item.id} className="rounded-2xl bg-muted/30 p-4">
                <div className="font-bold">
                  {item.action === "team.created"
                    ? "تیم ایجاد شد"
                    : item.action === "team.updated"
                      ? "اطلاعات تیم تغییر کرد"
                      : item.action === "team.member_added"
                        ? "عضو به تیم اضافه شد"
                        : item.action === "team.member_removed"
                          ? "عضو از تیم حذف شد"
                          : item.action || "تغییر مدیریتی"}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {dateTime(item.createdAt)}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
