import {
  Check,
  ChevronDown,
  ChevronUp,
  KeyRound,
  LockKeyhole,
  Pencil,
  Plus,
  RefreshCcw,
  Search,
  ShieldCheck,
  Sparkles,
  Trash2,
  UserCog,
  UsersRound,
  X,
} from "lucide-react"
import { useMemo, useState, type ReactNode } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { getApiErrorMessage } from "@/lib/apiResponse"
import { useAuthStore } from "@/store/authStore"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"

import {
  createPermission,
  createTenantRole,
  deletePermission,
  deleteRole,
  getPermissions,
  getRolePermissions,
  getRoles,
  replaceRolePermissions,
  updatePermission,
  updateRole,
  type ManagedPermission,
  type ManagedRole,
  type UserRole,
} from "../api/adminPermissionsApi"

const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: "ادمین",
  MANAGER: "مدیر فروش",
  REP: "کارشناس فروش",
  BOARDS: "برد / مشاهده‌گر",
}

const CRITICAL_PERMISSIONS = new Set(["permission:manage", "role:manage"])

function can(permissions: string[] | undefined, permission: string) {
  return Boolean(permissions?.includes(permission))
}

function fa(value: number) {
  return new Intl.NumberFormat("fa-IR").format(value)
}

function groupName(permission: ManagedPermission) {
  return permission.group?.trim() || permission.action.split(":")[0] || "سایر"
}

function actionVerb(permission: ManagedPermission) {
  return permission.action.split(":")[1] || permission.action
}

function isCritical(permission: ManagedPermission) {
  return CRITICAL_PERMISSIONS.has(permission.action)
}

function Modal({
  open,
  onClose,
  title,
  description,
  children,
  width = "max-w-2xl",
}: {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children: ReactNode
  width?: string
}) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-[90] grid place-items-center bg-black/25 p-4 backdrop-blur-[2px]" dir="rtl">
      <button className="absolute inset-0 cursor-default" onClick={onClose} aria-label="بستن" />
      <section className={`relative z-10 max-h-[92vh] w-full ${width} overflow-y-auto rounded-[28px] border border-[var(--app-divider)] bg-[var(--app-surface)] p-5 shadow-2xl`}>
        <div className="mb-5">
          <h2 className="text-xl font-black">{title}</h2>
          {description ? <p className="mt-1 text-sm leading-7 text-muted-foreground">{description}</p> : null}
        </div>
        {children}
      </section>
    </div>
  )
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
  icon: typeof ShieldCheck
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

export function AdminPermissionsPage() {
  const user = useAuthStore((state) => state.user)
  const permissions = user?.permissions ?? []
  const queryClient = useQueryClient()

  const canViewPermissions = can(permissions, "permission:view")
  const canManagePermissions = can(permissions, "permission:manage")
  const canViewRoles = can(permissions, "role:view")
  const canManageRoles = can(permissions, "role:manage")

  const initialTab = canViewPermissions ? "permissions" : "roles"
  const [tab, setTab] = useState<"permissions" | "roles">(initialTab)
  const [search, setSearch] = useState("")
  const [permissionStatus, setPermissionStatus] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL")
  const [permissionKind, setPermissionKind] = useState<"ALL" | "SYSTEM" | "CUSTOM">("ALL")
  const [permissionEditor, setPermissionEditor] = useState<ManagedPermission | "NEW" | null>(null)
  const [permissionDeleteTarget, setPermissionDeleteTarget] = useState<ManagedPermission | null>(null)
  const [roleCreateOpen, setRoleCreateOpen] = useState(false)
  const [roleEditor, setRoleEditor] = useState<ManagedRole | null>(null)
  const [roleDeleteTarget, setRoleDeleteTarget] = useState<ManagedRole | null>(null)
  const [roleMatrixTarget, setRoleMatrixTarget] = useState<ManagedRole | null>(null)

  const permissionsQuery = useQuery({
    queryKey: ["rbac-permissions"],
    queryFn: getPermissions,
    enabled: canViewPermissions,
  })

  const rolesQuery = useQuery({
    queryKey: ["rbac-roles"],
    queryFn: getRoles,
    enabled: canViewRoles,
  })

  const permissionRows = permissionsQuery.data ?? []
  const roleRows = rolesQuery.data ?? []

  const groups = useMemo(() => new Set(permissionRows.map(groupName)), [permissionRows])
  const activePermissionCount = permissionRows.filter((item) => item.isActive).length
  const systemPermissionCount = permissionRows.filter((item) => item.isSystem).length
  const totalAssignedUsers = roleRows.reduce((sum, role) => sum + (role._count?.users ?? 0), 0)

  const filteredPermissions = useMemo(() => {
    const needle = search.trim().toLocaleLowerCase("fa")
    return permissionRows.filter((item) => {
      if (permissionStatus === "ACTIVE" && !item.isActive) return false
      if (permissionStatus === "INACTIVE" && item.isActive) return false
      if (permissionKind === "SYSTEM" && !item.isSystem) return false
      if (permissionKind === "CUSTOM" && item.isSystem) return false

      return (
        !needle ||
        [item.action, item.name, item.group, item.description]
          .filter(Boolean)
          .some((value) => String(value).toLocaleLowerCase("fa").includes(needle))
      )
    })
  }, [permissionRows, permissionStatus, permissionKind, search])

  const groupedPermissions = useMemo(() => {
    const map = new Map<string, ManagedPermission[]>()
    for (const item of filteredPermissions) {
      const key = groupName(item)
      const list = map.get(key) ?? []
      list.push(item)
      map.set(key, list)
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b, "fa"))
  }, [filteredPermissions])

  const filteredRoles = useMemo(() => {
    const needle = search.trim().toLocaleLowerCase("fa")
    return roleRows.filter((item) =>
      !needle ||
      [item.code, item.name, item.description, item.baseRole]
        .filter(Boolean)
        .some((value) => String(value).toLocaleLowerCase("fa").includes(needle)),
    )
  }, [roleRows, search])

  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ["rbac-permissions"] })
    await queryClient.invalidateQueries({ queryKey: ["rbac-roles"] })
  }

  const deletePermissionMutation = useMutation({
    mutationFn: (id: string) => deletePermission(id),
    onSuccess: async () => {
      toast.success("مجوز حذف شد.")
      setPermissionDeleteTarget(null)
      await refresh()
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "حذف مجوز انجام نشد.")),
  })

  const deleteRoleMutation = useMutation({
    mutationFn: (id: string) => deleteRole(id),
    onSuccess: async () => {
      toast.success("نقش حذف شد.")
      setRoleDeleteTarget(null)
      await refresh()
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "حذف نقش انجام نشد.")),
  })

  return (
    <div className="grid gap-5" dir="rtl">
      <section className="relative overflow-hidden rounded-[30px] border border-[var(--app-divider)] bg-[var(--app-surface)] px-5 py-6 shadow-[var(--app-shadow-card)] sm:px-7">
        <div className="pointer-events-none absolute -end-20 -top-24 size-64 rounded-full bg-[var(--app-primary-soft)] blur-3xl" />
        <div className="relative flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[var(--app-divider)] bg-background/70 px-3 py-1 text-xs text-muted-foreground">
              <Sparkles className="size-4" />
              RBAC Administration
            </div>
            <h1 className="text-2xl font-black sm:text-3xl">نقش‌ها و مجوزهای دسترسی</h1>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-muted-foreground">
              مدیریت کاتالوگ مجوزها، نقش‌های سازمانی و ماتریس دسترسی هر نقش
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => void refresh()}>
              <RefreshCcw className="ms-2 size-4" />
              به‌روزرسانی
            </Button>

            {tab === "permissions" && canManagePermissions ? (
              <Button onClick={() => setPermissionEditor("NEW")}>
                <Plus className="ms-2 size-4" />
                ایجاد مجوز
              </Button>
            ) : null}
            {tab === "roles" && canManageRoles ? (
              <Button onClick={() => setRoleCreateOpen(true)}>
                <Plus className="ms-2 size-4" />
                ایجاد نقش
              </Button>
            ) : null}
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="کل مجوزها" value={fa(permissionRows.length)} helper="تمام Permissionهای ثبت‌شده" icon={KeyRound} />
        <StatCard title="مجوزهای فعال" value={fa(activePermissionCount)} helper="قابل استفاده در نقش‌ها" icon={ShieldCheck} />
        <StatCard title="مجوزهای سیستمی" value={fa(systemPermissionCount)} helper="محافظت‌شده توسط Backend" icon={LockKeyhole} />
        <StatCard title="کاربران متصل به نقش‌ها" value={fa(totalAssignedUsers)} helper={`${fa(groups.size)} گروه دسترسی`} icon={UsersRound} />
      </section>

      <section className="rounded-[24px] border border-[var(--app-divider)] bg-[var(--app-surface)] p-2 shadow-[var(--app-shadow-card)]">
        <div className="flex flex-wrap gap-2">
          {canViewPermissions ? (
            <Button variant={tab === "permissions" ? "default" : "ghost"} onClick={() => setTab("permissions")}>
              <KeyRound className="ms-2 size-4" />
              کاتالوگ مجوزها
            </Button>
          ) : null}

          {canViewRoles ? (
            <Button variant={tab === "roles" ? "default" : "ghost"} onClick={() => setTab("roles")}>
              <UserCog className="ms-2 size-4" />
              نقش‌ها و ماتریس دسترسی
            </Button>
          ) : null}
        </div>
      </section>

      <section className="rounded-[24px] border border-[var(--app-divider)] bg-[var(--app-surface)] p-4 shadow-[var(--app-shadow-card)]">
        <div className={`grid gap-3 ${tab === "permissions" ? "xl:grid-cols-[minmax(280px,1.3fr)_180px_180px]" : "xl:grid-cols-[minmax(280px,1fr)]"}`}>
          <div className="relative">
            <Search className="absolute end-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={tab === "permissions" ? "جستجو در کد، نام، گروه یا توضیحات مجوز" : "جستجو در نقش‌ها"}
              className="pe-10"
            />
          </div>

          {tab === "permissions" ? (
            <>
              <NativeSelect value={permissionStatus} onChange={(event) => setPermissionStatus(event.target.value as typeof permissionStatus)}>
                <option value="ALL">همه وضعیت‌ها</option>
                <option value="ACTIVE">فعال</option>
                <option value="INACTIVE">غیرفعال</option>
              </NativeSelect>

              <NativeSelect value={permissionKind} onChange={(event) => setPermissionKind(event.target.value as typeof permissionKind)}>
                <option value="ALL">همه انواع</option>
                <option value="SYSTEM">سیستمی</option>
                <option value="CUSTOM">سفارشی</option>
              </NativeSelect>
            </>
          ) : null}
        </div>
      </section>

      {tab === "permissions" ? (
        <PermissionsCatalog
          loading={permissionsQuery.isLoading}
          error={permissionsQuery.isError}
          groups={groupedPermissions}
          canManage={canManagePermissions}
          onEdit={(item) => setPermissionEditor(item)}
          onDelete={(item) => setPermissionDeleteTarget(item)}
        />
      ) : (
        <RolesWorkspace
          loading={rolesQuery.isLoading}
          error={rolesQuery.isError}
          roles={filteredRoles}
          canManage={canManageRoles}
          onEdit={(role) => setRoleEditor(role)}
          onDelete={(role) => setRoleDeleteTarget(role)}
          onPermissions={(role) => setRoleMatrixTarget(role)}
        />
      )}

      <PermissionEditorModal
        item={permissionEditor}
        open={permissionEditor !== null}
        onClose={() => setPermissionEditor(null)}
        onSaved={async () => {
          setPermissionEditor(null)
          await refresh()
        }}
      />
      <RoleCreateModal
        open={roleCreateOpen}
        onClose={() => setRoleCreateOpen(false)}
        onSaved={async () => {
          setRoleCreateOpen(false)
          await refresh()
        }}
      />

      <RoleEditorModal
        role={roleEditor}
        open={Boolean(roleEditor)}
        onClose={() => setRoleEditor(null)}
        onSaved={async () => {
          setRoleEditor(null)
          await refresh()
        }}
      />

      <RoleMatrixModal
        role={roleMatrixTarget}
        open={Boolean(roleMatrixTarget)}
        onClose={() => setRoleMatrixTarget(null)}
        onSaved={async () => {
          setRoleMatrixTarget(null)
          await refresh()
        }}
      />

      <Modal
        open={Boolean(permissionDeleteTarget)}
        onClose={() => setPermissionDeleteTarget(null)}
        title="حذف مجوز"
        description="مجوزهای سیستمی و مجوزهای متصل به Role از Backend قابل حذف نیستند."
      >
        <div className="rounded-2xl bg-muted/40 p-4 text-sm leading-7 text-muted-foreground">
          آیا از حذف «{permissionDeleteTarget?.name || permissionDeleteTarget?.action}» مطمئن هستید؟
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setPermissionDeleteTarget(null)}>انصراف</Button>
          <Button
            onClick={() => permissionDeleteTarget && deletePermissionMutation.mutate(permissionDeleteTarget.id)}
            disabled={deletePermissionMutation.isPending}
          >
            حذف مجوز
          </Button>
        </div>
      </Modal>

      <Modal
        open={Boolean(roleDeleteTarget)}
        onClose={() => setRoleDeleteTarget(null)}
        title="حذف نقش"
        description="نقش سیستمی یا نقشی که به User یا Organization Membership متصل باشد قابل حذف نیست."
      >
        <div className="rounded-2xl bg-muted/40 p-4 text-sm leading-7 text-muted-foreground">
          آیا از حذف نقش «{roleDeleteTarget?.name}» مطمئن هستید؟
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setRoleDeleteTarget(null)}>انصراف</Button>
          <Button
            onClick={() => roleDeleteTarget && deleteRoleMutation.mutate(roleDeleteTarget.id)}
            disabled={deleteRoleMutation.isPending}
          >
            حذف نقش
          </Button>
        </div>
      </Modal>
    </div>
  )
}

function PermissionsCatalog({
  loading,
  error,
  groups,
  canManage,
  onEdit,
  onDelete,
}: {
  loading: boolean
  error: boolean
  groups: Array<[string, ManagedPermission[]]>
  canManage: boolean
  onEdit: (item: ManagedPermission) => void
  onDelete: (item: ManagedPermission) => void
}) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})

  if (loading) {
    return <div className="grid min-h-64 place-items-center text-sm text-muted-foreground">در حال دریافت مجوزها...</div>
  }

  if (error) {
    return <div className="rounded-[24px] border border-[var(--app-divider)] bg-[var(--app-surface)] p-8 text-center text-red-600">دریافت مجوزها با خطا مواجه شد.</div>
  }

  if (!groups.length) {
    return <div className="grid min-h-64 place-items-center rounded-[24px] border border-[var(--app-divider)] bg-[var(--app-surface)] text-sm text-muted-foreground">مجوزی پیدا نشد.</div>
  }

  return (
    <section className="grid gap-4">
      {groups.map(([group, items]) => {
        const isCollapsed = collapsed[group] ?? false

        return (
          <article key={group} className="overflow-hidden rounded-[24px] border border-[var(--app-divider)] bg-[var(--app-surface)] shadow-[var(--app-shadow-card)]">
            <button
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-right"
              onClick={() => setCollapsed((prev) => ({ ...prev, [group]: !isCollapsed }))}
            >
              <div>
                <div className="font-black">{group}</div>
                <div className="mt-1 text-xs text-muted-foreground">{fa(items.length)} مجوز</div>
              </div>
              {isCollapsed ? <ChevronDown className="size-4" /> : <ChevronUp className="size-4" />}
            </button>

            {!isCollapsed ? (
              <div className="border-t border-[var(--app-divider)]">
                {items.map((item) => (
                  <div key={item.id} className="grid gap-3 border-t border-[var(--app-divider)] px-5 py-4 first:border-t-0 lg:grid-cols-[minmax(220px,1fr)_minmax(180px,.8fr)_auto] lg:items-center">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <code className="rounded-lg bg-muted px-2 py-1 text-xs" dir="ltr">{item.action}</code>
                        {item.isSystem ? (
                          <span className="rounded-full bg-violet-500/10 px-2 py-1 text-[11px] font-bold text-violet-700">سیستمی</span>
                        ) : (
                          <span className="rounded-full bg-sky-500/10 px-2 py-1 text-[11px] font-bold text-sky-700">سفارشی</span>
                        )}
                        {isCritical(item) ? (
                          <span className="rounded-full bg-amber-500/10 px-2 py-1 text-[11px] font-bold text-amber-700">حیاتی</span>
                        ) : null}
                        <span className={`rounded-full px-2 py-1 text-[11px] font-bold ${item.isActive ? "bg-emerald-500/10 text-emerald-700" : "bg-muted text-muted-foreground"}`}>
                          {item.isActive ? "فعال" : "غیرفعال"}
                        </span>
                      </div>
                      <div className="mt-2 font-bold">{item.name || actionVerb(item)}</div>
                    </div>

                    <div className="text-xs leading-6 text-muted-foreground">
                      {item.description || "برای این مجوز توضیحی ثبت نشده است."}
                    </div>

                    {canManage ? (
                      <div className="flex justify-end gap-1">
                        <Button size="icon-sm" variant="ghost" onClick={() => onEdit(item)} aria-label="ویرایش">
                          <Pencil className="size-4" />
                        </Button>
                        {!item.isSystem ? (
                          <Button size="icon-sm" variant="ghost" onClick={() => onDelete(item)} aria-label="حذف">
                            <Trash2 className="size-4 text-red-600" />
                          </Button>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : null}
          </article>
        )
      })}
    </section>
  )
}

function RolesWorkspace({
  loading,
  error,
  roles,
  canManage,
  onEdit,
  onDelete,
  onPermissions,
}: {
  loading: boolean
  error: boolean
  roles: ManagedRole[]
  canManage: boolean
  onEdit: (role: ManagedRole) => void
  onDelete: (role: ManagedRole) => void
  onPermissions: (role: ManagedRole) => void
}) {
  if (loading) {
    return <div className="grid min-h-64 place-items-center text-sm text-muted-foreground">در حال دریافت نقش‌ها...</div>
  }

  if (error) {
    return <div className="rounded-[24px] border border-[var(--app-divider)] bg-[var(--app-surface)] p-8 text-center text-red-600">دریافت نقش‌ها با خطا مواجه شد.</div>
  }

  return (
    <section className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
      {roles.map((role) => (
        <article key={role.id} className="rounded-[24px] border border-[var(--app-divider)] bg-[var(--app-surface)] p-5 shadow-[var(--app-shadow-card)]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-black">{role.name}</h2>
                {role.isSystem || role.scope === "SYSTEM" ? (
                  <span className="rounded-full bg-violet-500/10 px-2 py-1 text-[11px] font-bold text-violet-700">سیستمی</span>
                ) : (
                  <span className="rounded-full bg-sky-500/10 px-2 py-1 text-[11px] font-bold text-sky-700">سفارشی</span>
                )}
              </div>
              <code className="mt-2 inline-block text-xs text-muted-foreground" dir="ltr">{role.normalizedCode || role.code}</code>
            </div>
            <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${role.isActive ? "bg-emerald-500/10 text-emerald-700" : "bg-muted text-muted-foreground"}`}>
              {role.isActive ? "فعال" : "غیرفعال"}
            </span>
          </div>

          <p className="mt-4 min-h-12 text-sm leading-6 text-muted-foreground">
            {role.description || "برای این نقش توضیحی ثبت نشده است."}
          </p>

          <div className="mt-4 grid grid-cols-3 gap-2">
            <div className="rounded-2xl bg-muted/35 p-3">
              <div className="text-[11px] text-muted-foreground">نقش پایه</div>
              <div className="mt-1 text-xs font-bold">{ROLE_LABELS[role.baseRole]}</div>
            </div>
            <div className="rounded-2xl bg-muted/35 p-3">
              <div className="text-[11px] text-muted-foreground">کاربران</div>
              <div className="mt-1 text-sm font-black">{fa(role._count?.users ?? 0)}</div>
            </div>
            <div className="rounded-2xl bg-muted/35 p-3">
              <div className="text-[11px] text-muted-foreground">مجوزها</div>
              <div className="mt-1 text-sm font-black">{fa(role._count?.permissions ?? 0)}</div>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => onPermissions(role)}>
              <ShieldCheck className="ms-2 size-4" />
              مشاهده دسترسی‌ها
            </Button>

            {canManage && !(role.isSystem || role.scope === "SYSTEM") ? (
              <>
                <Button variant="ghost" size="sm" onClick={() => onEdit(role)}>
                  <Pencil className="ms-2 size-4" />
                  ویرایش
                </Button>
                <Button variant="ghost" size="sm" onClick={() => onDelete(role)}>
                  <Trash2 className="ms-2 size-4 text-red-600" />
                  حذف
                </Button>
              </>
            ) : null}
          </div>
        </article>
      ))}

      {canManage ? (
        <article className="grid min-h-64 place-items-center rounded-[24px] border border-dashed border-[var(--app-divider)] bg-[var(--app-surface)] p-6 text-center">
          <div>
            <LockKeyhole className="mx-auto size-8 text-muted-foreground" />
            <h3 className="mt-3 font-black">نقش سفارشی جدید</h3>
            <p className="mt-2 max-w-sm text-xs leading-6 text-muted-foreground">
              برای ساخت نقش جدید از دکمه «ایجاد نقش» بالای صفحه استفاده کنید و دسترسی‌های اولیه را همان‌جا انتخاب کنید.
            </p>
          </div>
        </article>
      ) : null}
    </section>
  )
}

function PermissionEditorModal({
  item,
  open,
  onClose,
  onSaved,
}: {
  item: ManagedPermission | "NEW" | null
  open: boolean
  onClose: () => void
  onSaved: () => Promise<void>
}) {
  const editing = item !== null && item !== "NEW"
  const permission = editing ? item : null

  const [action, setAction] = useState(permission?.action ?? "")
  const [name, setName] = useState(permission?.name ?? "")
  const [group, setGroup] = useState(permission?.group ?? "")
  const [description, setDescription] = useState(permission?.description ?? "")
  const [isActive, setIsActive] = useState(permission?.isActive ?? true)

  const mutation = useMutation({
    mutationFn: async () => {
      const normalized = action.trim()
      if (!/^[a-z][a-z0-9-]*:[a-z][a-z0-9-]*$/.test(normalized)) {
        throw new Error("کد مجوز باید مانند module:action باشد.")
      }

      const payload = {
        action: normalized,
        name: name.trim() || undefined,
        group: group.trim() || undefined,
        description: description.trim() || undefined,
        isActive,
      }

      return permission ? updatePermission(permission.id, payload) : createPermission(payload)
    },
    onSuccess: async () => {
      toast.success(permission ? "مجوز بروزرسانی شد." : "مجوز ایجاد شد.")
      await onSaved()
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "ذخیره مجوز انجام نشد.")),
  })

  if (!open) return null

  return (
    <Modal open={open} onClose={onClose} title={permission ? "ویرایش مجوز" : "ایجاد مجوز"}>
      <div className="grid gap-4">
        <div>
          <label className="mb-1.5 block text-xs font-bold text-muted-foreground">کد مجوز</label>
          <Input value={action} onChange={(event) => setAction(event.target.value)} disabled={Boolean(permission?.isSystem)} dir="ltr" placeholder="module:action" />
          {permission?.isSystem ? <p className="mt-1 text-xs text-muted-foreground">Action مجوز سیستمی قابل تغییر نیست.</p> : null}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-bold text-muted-foreground">نام نمایشی</label>
            <Input value={name ?? ""} onChange={(event) => setName(event.target.value)} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold text-muted-foreground">گروه</label>
            <Input value={group ?? ""} onChange={(event) => setGroup(event.target.value)} />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-bold text-muted-foreground">توضیحات</label>
          <textarea
            className="min-h-28 w-full rounded-xl border border-input bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-ring/20"
            value={description ?? ""}
            maxLength={1000}
            onChange={(event) => setDescription(event.target.value)}
          />
        </div>

        <label className="flex items-center gap-3 rounded-2xl bg-muted/35 p-4 text-sm">
          <input
            type="checkbox"
            checked={isActive}
            disabled={Boolean(permission && isCritical(permission))}
            onChange={(event) => setIsActive(event.target.checked)}
          />
          <span>
            <span className="font-bold">فعال</span>
            {permission && isCritical(permission) ? (
              <span className="mt-1 block text-xs text-muted-foreground">
                مجوزهای حیاتی RBAC از Backend قابل غیرفعال‌سازی نیستند.
              </span>
            ) : null}
          </span>
        </label>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>انصراف</Button>
          <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>ذخیره</Button>
        </div>
      </div>
    </Modal>
  )
}

function RoleCreateModal({
  open,
  onClose,
  onSaved,
}: {
  open: boolean
  onClose: () => void
  onSaved: () => Promise<void>
}) {
  const permissionsQuery = useQuery({
    queryKey: ["rbac-permissions"],
    queryFn: getPermissions,
    enabled: open,
  })

  const [code, setCode] = useState("")
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [baseRole, setBaseRole] = useState<UserRole>("REP")
  const [isActive, setIsActive] = useState(true)
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<string[]>([])
  const [permissionSearch, setPermissionSearch] = useState("")

  const filtered = useMemo(() => {
    const needle = permissionSearch.trim().toLocaleLowerCase("fa")

    return (permissionsQuery.data ?? []).filter(
      (permission) =>
        permission.isActive &&
        (
          !needle ||
          [permission.action, permission.name, permission.group, permission.description]
            .filter(Boolean)
            .some((value) =>
              String(value).toLocaleLowerCase("fa").includes(needle),
            )
        ),
    )
  }, [permissionsQuery.data, permissionSearch])

  const grouped = useMemo(() => {
    const map = new Map<string, ManagedPermission[]>()

    for (const permission of filtered) {
      const key = groupName(permission)
      const items = map.get(key) ?? []
      items.push(permission)
      map.set(key, items)
    }

    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b, "fa"))
  }, [filtered])

  const toggle = (permissionId: string, checked: boolean) => {
    setSelectedPermissionIds((current) =>
      checked
        ? Array.from(new Set([...current, permissionId]))
        : current.filter((id) => id !== permissionId),
    )
  }

  const mutation = useMutation({
    mutationFn: async () => {
      if (!code.trim()) throw new Error("کد نقش الزامی است.")
      if (!name.trim()) throw new Error("نام نقش الزامی است.")

      const normalizedCode = code
        .trim()
        .toUpperCase()
        .replace(/[\s-]+/g, "_")

      if (!/^[A-Z][A-Z0-9_]*$/.test(normalizedCode)) {
        throw new Error(
          "کد نقش باید با حرف انگلیسی شروع شود و فقط شامل حروف، عدد و _ باشد.",
        )
      }

      const created = await createTenantRole({
        code: normalizedCode,
        name: name.trim(),
        description: description.trim() || undefined,
        baseRole,
        isActive,
      })

      if (selectedPermissionIds.length) {
        await replaceRolePermissions(created.id, selectedPermissionIds)
      }

      return created
    },
    onSuccess: async () => {
      toast.success("نقش جدید و دسترسی‌های آن با موفقیت ایجاد شد.")
      setCode("")
      setName("")
      setDescription("")
      setBaseRole("REP")
      setIsActive(true)
      setSelectedPermissionIds([])
      setPermissionSearch("")
      await onSaved()
    },
    onError: (error) =>
      toast.error(getApiErrorMessage(error, "ایجاد نقش انجام نشد.")),
  })

  if (!open) return null

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="ایجاد نقش جدید"
      description="مشخصات نقش را تعریف کنید و مجوزهای اولیه آن را انتخاب کنید."
      width="max-w-5xl"
    >
      <div className="grid gap-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-bold text-muted-foreground">
              نام نقش
            </label>
            <Input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="مثلاً سرپرست فروش"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold text-muted-foreground">
              کد نقش
            </label>
            <Input
              value={code}
              onChange={(event) => setCode(event.target.value)}
              dir="ltr"
              placeholder="SALES_SUPERVISOR"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold text-muted-foreground">
              نقش پایه
            </label>
            <NativeSelect
              value={baseRole}
              onChange={(event) => setBaseRole(event.target.value as UserRole)}
            >
              {Object.entries(ROLE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </NativeSelect>
          </div>

          <label className="flex items-center gap-3 rounded-2xl bg-muted/35 p-4 text-sm">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(event) => setIsActive(event.target.checked)}
            />
            <span className="font-bold">نقش فعال باشد</span>
          </label>

          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-xs font-bold text-muted-foreground">
              توضیحات
            </label>
            <textarea
              value={description}
              maxLength={1000}
              onChange={(event) => setDescription(event.target.value)}
              className="min-h-24 w-full rounded-xl border border-input bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-ring/20"
              placeholder="کاربرد و سطح مسئولیت این نقش..."
            />
          </div>
        </div>

        <section className="rounded-2xl border border-[var(--app-divider)]">
          <div className="border-b border-[var(--app-divider)] p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-black">دسترسی‌های اولیه</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  {fa(selectedPermissionIds.length)} مجوز انتخاب شده است.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    setSelectedPermissionIds(
                      (permissionsQuery.data ?? [])
                        .filter((item) => item.isActive)
                        .map((item) => item.id),
                    )
                  }
                >
                  انتخاب همه
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedPermissionIds([])}
                >
                  پاک کردن همه
                </Button>
              </div>
            </div>

            <div className="relative mt-3">
              <Search className="absolute end-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={permissionSearch}
                onChange={(event) => setPermissionSearch(event.target.value)}
                placeholder="جستجو در مجوزها"
                className="pe-10"
              />
            </div>
          </div>

          <div className="max-h-[430px] overflow-y-auto p-4">
            {permissionsQuery.isLoading ? (
              <div className="grid min-h-40 place-items-center text-sm text-muted-foreground">
                در حال دریافت مجوزها...
              </div>
            ) : (
              <div className="grid gap-4">
                {grouped.map(([group, items]) => {
                  const groupIds = items.map((item) => item.id)
                  const selectedCount = groupIds.filter((id) =>
                    selectedPermissionIds.includes(id),
                  ).length

                  return (
                    <section
                      key={group}
                      className="rounded-2xl border border-[var(--app-divider)]"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--app-divider)] px-4 py-3">
                        <div>
                          <div className="font-bold">{group}</div>
                          <div className="mt-1 text-[11px] text-muted-foreground">
                            {fa(selectedCount)} از {fa(items.length)} انتخاب شده
                          </div>
                        </div>

                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              setSelectedPermissionIds((current) =>
                                Array.from(new Set([...current, ...groupIds])),
                              )
                            }
                          >
                            انتخاب گروه
                          </Button>

                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              setSelectedPermissionIds((current) =>
                                current.filter((id) => !groupIds.includes(id)),
                              )
                            }
                          >
                            پاک کردن گروه
                          </Button>
                        </div>
                      </div>

                      <div className="grid gap-2 p-3 sm:grid-cols-2 xl:grid-cols-3">
                        {items.map((permission) => {
                          const checked = selectedPermissionIds.includes(
                            permission.id,
                          )

                          return (
                            <label
                              key={permission.id}
                              className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 ${
                                checked
                                  ? "border-[var(--app-primary)] bg-[var(--app-primary-soft)]"
                                  : "border-[var(--app-divider)]"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={(event) =>
                                  toggle(permission.id, event.target.checked)
                                }
                              />
                              <span className="min-w-0">
                                <span className="block text-sm font-bold">
                                  {permission.name || actionVerb(permission)}
                                </span>
                                <code
                                  className="mt-1 block truncate text-[11px] text-muted-foreground"
                                  dir="ltr"
                                >
                                  {permission.action}
                                </code>
                              </span>
                            </label>
                          )
                        })}
                      </div>
                    </section>
                  )
                })}
              </div>
            )}
          </div>
        </section>

        {baseRole === "ADMIN" ? (
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs leading-7 text-amber-900 dark:text-amber-200">
            نقش مبتنی بر ADMIN باید مجوزهای حیاتی
            <code className="mx-1" dir="ltr">permission:manage</code>
            و
            <code className="mx-1" dir="ltr">role:manage</code>
            را حفظ کند.
          </div>
        ) : null}

        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={mutation.isPending}
          >
            انصراف
          </Button>

          <Button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
          >
            ایجاد نقش و ذخیره دسترسی‌ها
          </Button>
        </div>
      </div>
    </Modal>
  )
}
function RoleEditorModal({
  role,
  open,
  onClose,
  onSaved,
}: {
  role: ManagedRole | null
  open: boolean
  onClose: () => void
  onSaved: () => Promise<void>
}) {
  const [name, setName] = useState(role?.name ?? "")
  const [description, setDescription] = useState(role?.description ?? "")
  const [baseRole, setBaseRole] = useState<UserRole>(role?.baseRole ?? "REP")
  const [isActive, setIsActive] = useState(role?.isActive ?? true)

  const mutation = useMutation({
    mutationFn: async () => {
      if (!role) return
      if (!name.trim()) throw new Error("نام نقش الزامی است.")

      return updateRole(role.id, {
        name: name.trim(),
        description: description.trim() || undefined,
        baseRole,
        isActive,
      })
    },
    onSuccess: async () => {
      toast.success("نقش بروزرسانی شد.")
      await onSaved()
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "ویرایش نقش انجام نشد.")),
  })

  if (!open || !role) return null

  return (
    <Modal open={open} onClose={onClose} title={`ویرایش نقش — ${role.name}`}>
      <div className="grid gap-4">
        <div>
          <label className="mb-1.5 block text-xs font-bold text-muted-foreground">کد نقش</label>
          <Input value={role.code} disabled dir="ltr" />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-bold text-muted-foreground">نام نقش</label>
          <Input value={name} onChange={(event) => setName(event.target.value)} />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-bold text-muted-foreground">نقش پایه</label>
          <NativeSelect value={baseRole} onChange={(event) => setBaseRole(event.target.value as UserRole)}>
            {Object.entries(ROLE_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </NativeSelect>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-bold text-muted-foreground">توضیحات</label>
          <textarea
            className="min-h-28 w-full rounded-xl border border-input bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-ring/20"
            value={description ?? ""}
            maxLength={1000}
            onChange={(event) => setDescription(event.target.value)}
          />
        </div>
        <label className="flex items-center gap-3 rounded-2xl bg-muted/35 p-4 text-sm">
          <input type="checkbox" checked={isActive} onChange={(event) => setIsActive(event.target.checked)} />
          <span className="font-bold">نقش فعال باشد</span>
        </label>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>انصراف</Button>
          <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>ذخیره تغییرات</Button>
        </div>
      </div>
    </Modal>
  )
}

function RoleMatrixModal({
  role,
  open,
  onClose,
  onSaved,
}: {
  role: ManagedRole | null
  open: boolean
  onClose: () => void
  onSaved: () => Promise<void>
}) {
  const user = useAuthStore((state) => state.user)
  const canManageRoles = can(user?.permissions, "role:manage")
  const isSystemRole = Boolean(role && (role.isSystem || role.scope === "SYSTEM"))
  const editable = canManageRoles && !isSystemRole

  const query = useQuery({
    queryKey: ["rbac-role-permissions", role?.id],
    queryFn: () => getRolePermissions(role?.id as string),
    enabled: Boolean(open && role),
  })

  const [selected, setSelected] = useState<string[] | null>(null)
  const [matrixSearch, setMatrixSearch] = useState("")

  const selectedIds = selected ?? query.data?.assignedPermissionIds ?? []

  const filteredPermissions = useMemo(() => {
    const needle = matrixSearch.trim().toLocaleLowerCase("fa")
    return (query.data?.permissions ?? []).filter((permission) =>
      !needle ||
      [permission.action, permission.name, permission.group, permission.description]
        .filter(Boolean)
        .some((value) => String(value).toLocaleLowerCase("fa").includes(needle)),
    )
  }, [query.data?.permissions, matrixSearch])

  const matrixGroups = useMemo(() => {
    const map = new Map<string, ManagedPermission[]>()
    for (const permission of filteredPermissions) {
      const key = groupName(permission)
      const list = map.get(key) ?? []
      list.push(permission)
      map.set(key, list)
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b, "fa"))
  }, [filteredPermissions])

  const mutation = useMutation({
    mutationFn: async () => {
      if (!role) return
      return replaceRolePermissions(role.id, selectedIds)
    },
    onSuccess: async () => {
      toast.success("ماتریس دسترسی نقش ذخیره شد.")
      await onSaved()
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "ذخیره مجوزهای نقش انجام نشد.")),
  })

  const toggle = (permissionId: string, checked: boolean) => {
    if (!editable) return
    setSelected(
      checked
        ? Array.from(new Set([...selectedIds, permissionId]))
        : selectedIds.filter((id) => id !== permissionId),
    )
  }

  if (!open || !role) return null

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`ماتریس دسترسی — ${role.name}`}
      description={isSystemRole ? "این Role سیستمی است؛ دسترسی‌ها فقط برای مشاهده نمایش داده می‌شوند." : "Permissionهای مورد نیاز این نقش را به تفکیک گروه مدیریت کنید."}
      width="max-w-5xl"
    >
      <div className="grid gap-4">
        <div className="relative">
          <Search className="absolute end-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={matrixSearch} onChange={(event) => setMatrixSearch(event.target.value)} placeholder="جستجو در مجوزهای این Role" className="pe-10" />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-[var(--app-primary-soft)] px-3 py-1.5 text-xs font-bold text-[var(--app-primary)]">
            {fa(selectedIds.length)} مجوز انتخاب‌شده
          </span>
          {editable ? (
            <>
              <Button size="sm" variant="outline" onClick={() => setSelected((query.data?.permissions ?? []).map((item) => item.id))}>انتخاب همه</Button>
              <Button size="sm" variant="outline" onClick={() => setSelected([])}>پاک کردن همه</Button>
            </>
          ) : null}
        </div>

        {query.isLoading ? (
          <div className="grid min-h-56 place-items-center text-sm text-muted-foreground">در حال دریافت ماتریس دسترسی...</div>
        ) : query.isError ? (
          <div className="rounded-2xl bg-red-500/10 p-4 text-sm text-red-700">دریافت دسترسی‌های Role با خطا مواجه شد.</div>
        ) : (
          <div className="grid gap-4">
            {matrixGroups.map(([group, items]) => {
              const groupIds = items.map((item) => item.id)
              const selectedInGroup = groupIds.filter((id) => selectedIds.includes(id)).length

              return (
                <section key={group} className="rounded-2xl border border-[var(--app-divider)]">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--app-divider)] px-4 py-3">
                    <div>
                      <div className="font-black">{group}</div>
                      <div className="mt-1 text-xs text-muted-foreground">{fa(selectedInGroup)} از {fa(items.length)} فعال برای این نقش</div>
                    </div>
                    {editable ? (
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={() => setSelected(Array.from(new Set([...selectedIds, ...groupIds])))}>انتخاب گروه</Button>
                        <Button size="sm" variant="ghost" onClick={() => setSelected(selectedIds.filter((id) => !groupIds.includes(id)))}>پاک کردن گروه</Button>
                      </div>
                    ) : null}
                  </div>

                  <div className="grid gap-2 p-3 sm:grid-cols-2 xl:grid-cols-3">
                    {items.map((permission) => {
                      const checked = selectedIds.includes(permission.id)
                      return (
                        <label
                          key={permission.id}
                          className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition ${checked ? "border-[var(--app-primary)] bg-[var(--app-primary-soft)]" : "border-[var(--app-divider)] bg-background"}`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            disabled={!editable}
                            onChange={(event) => toggle(permission.id, event.target.checked)}
                          />
                          <span className="min-w-0">
                            <span className="flex items-center gap-1 text-sm font-bold">
                              {checked ? <Check className="size-4 text-[var(--app-primary)]" /> : <X className="size-4 text-muted-foreground" />}
                              {permission.name || actionVerb(permission)}
                            </span>
                            <code className="mt-1 block truncate text-[11px] text-muted-foreground" dir="ltr">{permission.action}</code>
                          </span>
                        </label>
                      )
                    })}
                  </div>
                </section>
              )
            })}
          </div>
        )}

        <div className="flex justify-end gap-2 border-t border-[var(--app-divider)] pt-4">
          <Button variant="outline" onClick={onClose}>بستن</Button>
          {editable ? (
            <Button onClick={() => mutation.mutate()} disabled={query.isLoading || query.isError || mutation.isPending}>
              ذخیره ماتریس دسترسی
            </Button>
          ) : null}
        </div>
      </div>
    </Modal>
  )
}
