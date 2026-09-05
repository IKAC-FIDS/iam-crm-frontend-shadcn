import {  BadgeCheck,
  Ban,
  Clock3,
  KeyRound,
  Save,
  ShieldCheck,
  UserRoundCog,
} from "lucide-react"
import { useState, type SelectHTMLAttributes } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useNavigate, useParams } from "react-router-dom"
import { toast } from "sonner"

import { getApiErrorMessage } from "@/lib/apiResponse"
import { useAuthStore } from "@/store/authStore"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { ResponsiveModal } from "@/components/shared/ResponsiveModal"
import { PageHero } from "@/components/shared/PageHero"
import { ProfileMediaEditor } from "@/components/shared/ProfileMediaEditor"
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
  resetUserPassword,
  updateUserRole,
  type UserRole,
} from "../api/adminUsersApi"

const can = (permissions: string[], action: string) =>
  permissions.includes(action)
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

function auditLabel(action?: string) {
  return action === "user.created"
    ? "کاربر ایجاد شد"
    : action === "user.activated"
      ? "کاربر فعال شد"
      : action === "user.deactivated"
        ? "کاربر غیرفعال شد"
        : action === "user.role_changed"
          ? "نقش یا تیم کاربر تغییر کرد"
          : action === "user.password_reset"
            ? "رمز عبور توسط مدیر ریست شد"
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
  const canViewTeams =
    can(permissions, "team:view") || can(permissions, "team:manage")
  const canViewRoles = can(permissions, "role:view")
  const canViewAudit = can(permissions, "audit-log:view")
  const canResetPassword = can(permissions, "user:manage")

  const userQuery = useQuery({
    queryKey: ["admin-user-detail", userId],
    queryFn: () => getUser(userId as string),
    enabled: Boolean(userId),
  })
  const teams = useQuery({
    queryKey: ["admin-users-teams"],
    queryFn: getTeams,
    enabled: canViewTeams,
  })
  const roles = useQuery({
    queryKey: ["admin-users-roles"],
    queryFn: getRoles,
    enabled: canViewRoles,
  })
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

  const [roleChoiceOverride, setRoleChoice] = useState<string>()
  const [teamIdOverride, setTeamId] = useState<string>()
  const [passwordOpen, setPasswordOpen] = useState(false)
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const roleChoice =
    roleChoiceOverride ??
    (user?.roleId ? `ROLE:${user.roleId}` : user ? `BASE:${user.role}` : "")
  const teamId = teamIdOverride ?? user?.teamId ?? ""

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
    onError: (e) =>
      toast.error(getApiErrorMessage(e, "تغییر وضعیت کاربر انجام نشد.")),
  })

  const accessMutation = useMutation({
    mutationFn: async () => {
      if (!user) return null
      return roleChoice.startsWith("ROLE:")
        ? updateUserRole(user.id, {
            roleId: roleChoice.slice(5),
            teamId: teamId || null,
          })
        : updateUserRole(user.id, {
            role: roleChoice.replace("BASE:", "") as UserRole,
            teamId: teamId || null,
          })
    },
    onSuccess: async () => {
      toast.success("نقش و تیم کاربر ذخیره شد.")
      await qc.invalidateQueries({ queryKey: ["admin-user-detail", userId] })
      await qc.invalidateQueries({ queryKey: ["admin-users"] })
      await qc.invalidateQueries({ queryKey: ["admin-user-audit", userId] })
    },
    onError: (e) =>
      toast.error(getApiErrorMessage(e, "ذخیره تغییرات انجام نشد.")),
  })

  const passwordMutation = useMutation({
    mutationFn: () => resetUserPassword(userId as string, newPassword),
    onSuccess: async (result) => {
      toast.success(result.message)
      setPasswordOpen(false)
      setNewPassword("")
      setConfirmPassword("")
      await qc.invalidateQueries({ queryKey: ["admin-user-audit", userId] })
    },
    onError: (e) =>
      toast.error(getApiErrorMessage(e, "ریست رمز عبور انجام نشد.")),
  })

  if (userQuery.isLoading)
    return (
      <div className="grid min-h-72 place-items-center text-sm text-muted-foreground">
        در حال دریافت اطلاعات کاربر...
      </div>
    )
  if (userQuery.isError || !user)
    return (
      <div className="grid min-h-72 place-items-center">
        <Button variant="outline" onClick={() => navigate("/admin/users")}>
          بازگشت به کاربران
        </Button>
      </div>
    )

  const roleName =
    user.assignedRole?.name || USER_ROLE_LABELS[user.role] || user.role
  const teamName = user.teamRef?.name || user.team || "بدون تیم"
  const canToggle =
    user.id !== current?.id &&
    ((user.isActive && canDeactivate) || (!user.isActive && canActivate))

  return (
    <div className="grid gap-5" dir="rtl">
      <PageHero
        title={user.fullName}
        description="نقش، تیم، وضعیت حساب و رویدادهای مدیریتی این کاربر"
        accessBadge={{ label: "مدیریت کاربران", icon: UserRoundCog }}
        backFallback="/admin/users"
        onRefresh={() =>
          Promise.all([
            userQuery.refetch(),
            teams.refetch(),
            roles.refetch(),
            audit.refetch(),
          ])
        }
        refreshing={
          userQuery.isFetching ||
          teams.isFetching ||
          roles.isFetching ||
          audit.isFetching
        }
        metadata={
          <>
            <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${user.isActive ? "bg-emerald-500/10 text-emerald-700" : "bg-muted text-muted-foreground"}`}>
              {user.isActive ? "فعال" : "غیرفعال"}
            </span>
            <span className="rounded-full bg-muted px-2.5 py-1 text-xs">{roleName}</span>
            <span className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">{teamName}</span>
            <span className="rounded-full bg-[var(--app-background)] px-2.5 py-1 text-xs text-muted-foreground" dir="ltr">{user.email}</span>
          </>
        }
        secondaryActions={
          canToggle
            ? [{
                id: "toggle-status",
                label: user.isActive ? "غیرفعال‌سازی" : "فعال‌سازی مجدد",
                icon: user.isActive ? Ban : BadgeCheck,
                variant: user.isActive ? "destructive" : "default",
                disabled: statusMutation.isPending,
                onClick: () => statusMutation.mutate(),
              }]
            : []
        }
      />
      <section className="rounded-[24px] border border-[var(--app-divider)] bg-[var(--app-surface)] p-5 shadow-[var(--app-shadow-card)]">
        <ProfileMediaEditor
          name={user.fullName}
          mediaPath={`/users/${user.id}/avatar`}
          hasMedia={Boolean(user.avatarObjectKey)}
          mediaVersion={user.avatarObjectKey}
          canEdit={canResetPassword}
          label="تصویر کاربر"
          onChanged={() => userQuery.refetch()}
        />
      </section>
      <section className="grid gap-5 xl:grid-cols-2">
        <article className="rounded-[24px] border border-[var(--app-divider)] bg-[var(--app-surface)] p-5 shadow-[var(--app-shadow-card)]">
          <div className="mb-4 flex items-center gap-2">
            <UserRoundCog className="size-5 text-[var(--app-primary)]" />
            <h2 className="font-bold">اطلاعات سازمانی</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Info label="نقش" value={roleName} />
            <Info label="تیم" value={teamName} />
            <Info label="تاریخ ایجاد" value={formatDate(user.createdAt)} />
            <Info label="آخرین تغییر" value={formatDate(user.updatedAt)} />
          </div>
          {canChangeRole ? (
            <div className="mt-5 border-t border-[var(--app-divider)] pt-5">
              <h3 className="mb-3 text-sm font-bold">تغییر نقش و تیم</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <NativeSelect
                  value={roleChoice}
                  onChange={(e) => setRoleChoice(e.target.value)}
                >
                  <optgroup label="نقش‌های پایه">
                    {USER_ROLES.map((r) => (
                      <option key={r} value={`BASE:${r}`}>
                        {USER_ROLE_LABELS[r]}
                      </option>
                    ))}
                  </optgroup>
                  {(roles.data ?? []).length ? (
                    <optgroup label="نقش‌های سفارشی">
                      {(roles.data ?? [])
                        .filter((r) => r.isActive !== false)
                        .map((r) => (
                          <option key={r.id} value={`ROLE:${r.id}`}>
                            {r.name}
                          </option>
                        ))}
                    </optgroup>
                  ) : null}
                </NativeSelect>
                <NativeSelect
                  value={teamId}
                  onChange={(e) => setTeamId(e.target.value)}
                  disabled={!canViewTeams}
                >
                  <option value="">بدون تیم</option>
                  {(teams.data ?? []).map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </NativeSelect>
              </div>
              <Button
                className="mt-3"
                onClick={() => accessMutation.mutate()}
                disabled={accessMutation.isPending}
              >
                <Save className="ms-2 size-4" />
                ذخیره تغییرات
              </Button>
            </div>
          ) : null}
        </article>

        <article className="rounded-[24px] border border-[var(--app-divider)] bg-[var(--app-surface)] p-5 shadow-[var(--app-shadow-card)]">
          <div className="mb-4 flex items-center gap-2">
            <ShieldCheck className="size-5 text-[var(--app-primary)]" />
            <h2 className="font-bold">دسترسی‌ها و امنیت</h2>
          </div>
          {!user.roleId ? (
            <p className="rounded-2xl bg-muted/35 p-4 text-sm text-muted-foreground">
              این کاربر از نقش پایه «{USER_ROLE_LABELS[user.role]}» استفاده
              می‌کند.
            </p>
          ) : !canViewRoles ? (
            <p className="text-sm text-muted-foreground">
              مجوز مشاهده نقش‌ها موجود نیست.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {(rolePerms.data?.assignedActions ?? []).map((a) => (
                <span
                  key={a}
                  className="rounded-lg border border-[var(--app-divider)] bg-muted/35 px-2.5 py-1.5 text-xs"
                  dir="ltr"
                >
                  {a}
                </span>
              ))}
            </div>
          )}
          <div className="mt-6 rounded-2xl border border-dashed border-[var(--app-divider)] p-4">
            <div className="flex items-center gap-2 text-sm font-bold">
              <KeyRound className="size-4 text-muted-foreground" />
              امنیت حساب
            </div>
            <p className="mt-2 text-xs leading-6 text-muted-foreground">
              با ریست رمز عبور، قفل حساب رفع و تمام نشست‌های فعال این کاربر
              پایان داده می‌شود.
            </p>
            {canResetPassword && user.id !== current?.id ? (
              <Button
                type="button"
                variant="outline"
                className="mt-3 rounded-xl"
                onClick={() => setPasswordOpen(true)}
              >
                <KeyRound className="ms-2 size-4" />
                ریست رمز عبور
              </Button>
            ) : null}
          </div>
        </article>
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
                  `/admin/audit-logs?entityType=user&entityId=${encodeURIComponent(user.id)}`
                )
              }
            >
              مشاهده همه رویدادها
            </Button>
          ) : null}
        </div>
        {!canViewAudit ? (
          <p className="text-sm text-muted-foreground">
            مجوز مشاهده Audit Log موجود نیست.
          </p>
        ) : audit.isLoading ? (
          <p className="text-sm text-muted-foreground">
            در حال دریافت تاریخچه...
          </p>
        ) : !(audit.data ?? []).length ? (
          <p className="text-sm text-muted-foreground">رویدادی ثبت نشده است.</p>
        ) : (
          <div className="grid gap-3">
            {(audit.data ?? []).map((a) => (
              <div
                key={a.id}
                className="flex items-start gap-3 rounded-2xl bg-muted/30 p-4"
              >
                <span className="mt-1 size-2 rounded-full bg-[var(--app-primary)]" />
                <div>
                  <div className="font-bold">{auditLabel(a.action)}</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {formatDate(a.createdAt)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <ResponsiveModal
        open={passwordOpen}
        onClose={() => !passwordMutation.isPending && setPasswordOpen(false)}
        title="ریست رمز عبور کاربر"
        description={`یک رمز عبور جدید برای ${user.fullName} تعیین کنید. تمام نشست‌های فعال این کاربر بسته می‌شوند.`}
        icon={KeyRound}
      >
        <form
          className="grid gap-4"
          onSubmit={(event) => {
            event.preventDefault()
            if (newPassword !== confirmPassword) {
              toast.error("تکرار رمز عبور مطابقت ندارد.")
              return
            }
            passwordMutation.mutate()
          }}
        >
          <label className="grid gap-2 text-sm font-bold">
            رمز عبور جدید
            <Input
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              placeholder="حداقل ۸ کاراکتر"
              className="h-11 rounded-xl"
            />
          </label>
          <label className="grid gap-2 text-sm font-bold">
            تکرار رمز عبور
            <Input
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className="h-11 rounded-xl"
            />
          </label>
          <p className="rounded-xl bg-amber-500/10 p-3 text-xs leading-6 text-amber-800">
            رمز باید شامل حرف کوچک، حرف بزرگ، عدد و کاراکتر خاص باشد. رمز را از
            مسیر امن در اختیار کاربر قرار دهید.
          </p>
          <div className="flex justify-end gap-2 border-t pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setPasswordOpen(false)}
              disabled={passwordMutation.isPending}
            >
              انصراف
            </Button>
            <Button
              type="submit"
              disabled={
                passwordMutation.isPending ||
                newPassword.length < 8 ||
                !confirmPassword
              }
            >
              {passwordMutation.isPending
                ? "در حال ریست..."
                : "تأیید و خروج از نشست‌ها"}
            </Button>
          </div>
        </form>
      </ResponsiveModal>
    </div>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-muted/35 p-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 text-sm font-bold">{value}</div>
    </div>
  )
}
