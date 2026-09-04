import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import {
  Fingerprint,
  KeyRound,
  Laptop,
  LockKeyhole,
  LogOut,
  MonitorSmartphone,
  Plus,
  ShieldCheck,
  ShieldEllipsis,
  Trash2,
} from "lucide-react"
import { PageHero } from "@/components/shared/PageHero"
import { MetricCard } from "@/components/shared/MetricCard"
import { ResponsiveModal } from "@/components/shared/ResponsiveModal"
import {
  DataTableShell,
  type DataTableColumn,
} from "@/components/shared/DataTableShell"
import { getApiErrorMessage } from "@/lib/apiResponse"
import { useAuthStore } from "@/store/authStore"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import {
  changePassword,
  deletePasskey,
  getPasskeys,
  getSecurityOverview,
  getSessions,
  logoutOtherSessions,
  registerPasskey,
  revokeSession,
  type Passkey,
  type UserSession,
} from "../api/accountSecurityApi"

const fa = (n: number) => new Intl.NumberFormat("fa-IR").format(n)
const date = (value?: string | null) =>
  value
    ? new Intl.DateTimeFormat("fa-IR", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(value))
    : "—"
const device = (ua?: string | null) => {
  if (!ua) return "دستگاه ناشناس"
  if (/mobile|android|iphone/i.test(ua)) return "دستگاه همراه"
  if (/windows/i.test(ua)) return "Windows"
  if (/macintosh|mac os/i.test(ua)) return "macOS"
  if (/linux/i.test(ua)) return "Linux"
  return "مرورگر وب"
}

export function AccountSecurityPage() {
  const client = useQueryClient()
  const navigate = useNavigate()
  const clearUser = useAuthStore((s) => s.clearUser)
  const [registerOpen, setRegisterOpen] = useState(false)
  const [passwordOpen, setPasswordOpen] = useState(false)
  const [deviceName, setDeviceName] = useState("")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const overview = useQuery({
    queryKey: ["account-security-overview"],
    queryFn: getSecurityOverview,
  })
  const passkeys = useQuery({
    queryKey: ["account-passkeys"],
    queryFn: getPasskeys,
  })
  const sessions = useQuery({
    queryKey: ["account-sessions"],
    queryFn: getSessions,
  })
  const refresh = () => {
    void overview.refetch()
    void passkeys.refetch()
    void sessions.refetch()
  }
  const register = useMutation({
    mutationFn: registerPasskey,
    onSuccess: async () => {
      toast.success("Passkey با موفقیت ثبت شد.")
      setRegisterOpen(false)
      setDeviceName("")
      await client.invalidateQueries({ queryKey: ["account-passkeys"] })
    },
    onError: (e) =>
      toast.error(
        getApiErrorMessage(
          e,
          e instanceof Error ? e.message : "ثبت Passkey انجام نشد."
        )
      ),
  })
  const removeKey = useMutation({
    mutationFn: deletePasskey,
    onSuccess: async () => {
      toast.success("Passkey حذف شد.")
      await client.invalidateQueries({ queryKey: ["account-passkeys"] })
    },
    onError: (e) =>
      toast.error(getApiErrorMessage(e, "حذف Passkey انجام نشد.")),
  })
  const revoke = useMutation({
    mutationFn: revokeSession,
    onSuccess: async (result) => {
      toast.success("نشست خاتمه یافت.")
      await client.invalidateQueries({ queryKey: ["account-sessions"] })
      if (result.revokedCurrentSession) {
        clearUser()
        navigate("/login", { replace: true })
      }
    },
    onError: (e) => toast.error(getApiErrorMessage(e, "خاتمه نشست انجام نشد.")),
  })
  const logoutOthers = useMutation({
    mutationFn: logoutOtherSessions,
    onSuccess: async (result) => {
      toast.success(`${fa(result.revokedCount)} نشست دیگر خاتمه یافت.`)
      await client.invalidateQueries({ queryKey: ["account-sessions"] })
    },
    onError: (e) =>
      toast.error(getApiErrorMessage(e, "خروج از نشست‌های دیگر انجام نشد.")),
  })
  const password = useMutation({
    mutationFn: () => changePassword(currentPassword, newPassword),
    onSuccess: (result) => {
      toast.success(result.message || "رمز عبور تغییر کرد.")
      clearUser()
      navigate("/login", { replace: true })
    },
    onError: (e) =>
      toast.error(getApiErrorMessage(e, "تغییر رمز عبور انجام نشد.")),
  })
  const passkeyColumns: DataTableColumn<Passkey>[] = [
    {
      id: "device",
      header: "نام دستگاه",
      cell: (r) => (
        <div>
          <b>{r.deviceName || "Passkey بدون نام"}</b>
          <div
            className="font-mono text-[11px] text-muted-foreground"
            dir="ltr"
          >
            {r.id}
          </div>
        </div>
      ),
    },
    {
      id: "created",
      header: "تاریخ ثبت",
      cell: (r) => (
        <span className="whitespace-nowrap">{date(r.createdAt)}</span>
      ),
    },
    {
      id: "used",
      header: "آخرین استفاده",
      cell: (r) => (
        <span className="whitespace-nowrap">
          {r.lastUsedAt ? date(r.lastUsedAt) : "هنوز استفاده نشده"}
        </span>
      ),
    },
    {
      id: "type",
      header: "نوع",
      cell: (r) => (
        <div className="flex flex-wrap gap-1">
          <Badge variant="outline">{r.credentialDeviceType || "نامشخص"}</Badge>
          {r.backedUp ? (
            <Badge className="bg-emerald-100 text-emerald-700">
              پشتیبان‌گیری‌شده
            </Badge>
          ) : null}
        </div>
      ),
    },
    {
      id: "actions",
      header: "عملیات",
      cell: (r) => (
        <Button
          variant="ghost"
          size="icon"
          className="text-red-600"
          disabled={removeKey.isPending}
          onClick={() => {
            if (
              window.confirm(`Passkey «${r.deviceName || "بدون نام"}» حذف شود؟`)
            )
              removeKey.mutate(r.id)
          }}
          aria-label="حذف Passkey"
        >
          <Trash2 className="size-4" />
        </Button>
      ),
    },
  ]
  const sessionColumns: DataTableColumn<UserSession>[] = [
    {
      id: "device",
      header: "دستگاه",
      cell: (r) => (
        <div className="flex items-center gap-2">
          <span className="grid size-9 place-items-center rounded-xl bg-[var(--app-primary-soft)]">
            <Laptop className="size-4 text-[var(--app-primary)]" />
          </span>
          <div>
            <b>{device(r.userAgent)}</b>
            {r.current ? (
              <Badge className="me-2 bg-emerald-100 text-emerald-700">
                نشست فعلی
              </Badge>
            ) : null}
            <div
              className="max-w-80 truncate text-[11px] text-muted-foreground"
              dir="ltr"
            >
              {r.userAgent || "—"}
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "ip",
      header: "IP",
      cell: (r) => <code dir="ltr">{r.ipAddress || "—"}</code>,
    },
    {
      id: "used",
      header: "آخرین فعالیت",
      cell: (r) => (
        <span className="whitespace-nowrap">{date(r.lastUsedAt)}</span>
      ),
    },
    {
      id: "expires",
      header: "انقضا",
      cell: (r) => (
        <span className="whitespace-nowrap">{date(r.expiresAt)}</span>
      ),
    },
    {
      id: "actions",
      header: "عملیات",
      cell: (r) => (
        <Button
          variant="ghost"
          size="icon"
          className="text-red-600"
          disabled={revoke.isPending}
          onClick={() => {
            if (window.confirm("این نشست خاتمه یابد؟")) revoke.mutate(r.id)
          }}
          aria-label="خاتمه نشست"
        >
          <LogOut className="size-4" />
        </Button>
      ),
    },
  ]
  return (
    <div className="grid gap-5" dir="rtl">
      <PageHero
        title="امنیت حساب"
        eyebrow="ورود و دستگاه‌ها"
        icon={ShieldCheck}
        description="رمز عبور، Passkeyها و نشست‌های فعال حساب خود را از یک فضای امن مدیریت کنید."
        onRefresh={refresh}
        refreshing={
          overview.isFetching || passkeys.isFetching || sessions.isFetching
        }
        actions={
          <Button onClick={() => setRegisterOpen(true)}>
            <Plus className="size-4" />
            ثبت Passkey
          </Button>
        }
      />
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Passkeyهای ثبت‌شده"
          value={fa(passkeys.data?.length ?? 0)}
          helper="روش‌های ورود بدون رمز"
          icon={Fingerprint}
        />
        <MetricCard
          label="نشست‌های فعال"
          value={fa(
            overview.data?.activeSessionsCount ?? sessions.data?.length ?? 0
          )}
          helper="دستگاه‌های واردشده"
          icon={MonitorSmartphone}
          tone="info"
        />
        <MetricCard
          label="آخرین ورود"
          value={date(overview.data?.lastLoginAt)}
          helper={overview.data?.lastLoginIp || "IP ثبت نشده"}
          icon={ShieldEllipsis}
          tone="success"
        />
        <MetricCard
          label="وضعیت حساب"
          value={overview.data?.isLocked ? "قفل‌شده" : "ایمن"}
          helper={`${fa(overview.data?.failedLoginAttempts ?? 0)} تلاش ناموفق`}
          icon={LockKeyhole}
          tone={overview.data?.isLocked ? "warning" : "success"}
        />
      </section>
      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-[var(--app-radius-card)] border border-[var(--app-divider)] bg-[var(--app-surface)] p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-black">رمز عبور</h2>
              <p className="mt-1 text-xs leading-6 text-muted-foreground">
                آخرین تغییر: {date(overview.data?.passwordChangedAt)}
              </p>
            </div>
            <span className="rounded-2xl bg-[var(--app-primary-soft)] p-3 text-[var(--app-primary)]">
              <KeyRound className="size-5" />
            </span>
          </div>
          <p className="mt-4 text-sm leading-7 text-muted-foreground">
            رمز قوی باید حداقل ۸ کاراکتر و شامل حرف کوچک، بزرگ، عدد و نماد باشد.
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => setPasswordOpen(true)}
          >
            تغییر رمز عبور
          </Button>
        </article>
        <article className="rounded-[var(--app-radius-card)] border border-[var(--app-divider)] bg-[var(--app-surface)] p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-black">کنترل نشست‌ها</h2>
              <p className="mt-1 text-xs leading-6 text-muted-foreground">
                در صورت مشاهده دستگاه ناشناس، نشست آن را خاتمه دهید.
              </p>
            </div>
            <span className="rounded-2xl bg-[var(--app-primary-soft)] p-3 text-[var(--app-primary)]">
              <MonitorSmartphone className="size-5" />
            </span>
          </div>
          <Button
            variant="outline"
            className="mt-8 text-red-600"
            disabled={
              logoutOthers.isPending || (sessions.data?.length ?? 0) <= 1
            }
            onClick={() => logoutOthers.mutate()}
          >
            <LogOut className="size-4" />
            خروج از همه دستگاه‌های دیگر
          </Button>
        </article>
      </section>
      <section className="grid gap-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black">Passkeyها</h2>
            <p className="text-xs text-muted-foreground">
              ورود با اثر انگشت، تشخیص چهره یا قفل دستگاه
            </p>
          </div>
        </div>
        {passkeys.isError ? (
          <ErrorBox error={passkeys.error} />
        ) : (
          <DataTableShell
            rows={passkeys.data ?? []}
            columns={passkeyColumns}
            getRowKey={(r) => r.id}
            emptyState={
              <Empty icon={Fingerprint} text="هنوز Passkey ثبت نشده است." />
            }
          />
        )}
      </section>
      <section className="grid gap-3">
        <div>
          <h2 className="text-lg font-black">نشست‌های فعال</h2>
          <p className="text-xs text-muted-foreground">
            مرورگرها و دستگاه‌هایی که به حساب شما دسترسی دارند
          </p>
        </div>
        {sessions.isError ? (
          <ErrorBox error={sessions.error} />
        ) : (
          <DataTableShell
            rows={sessions.data ?? []}
            columns={sessionColumns}
            getRowKey={(r) => r.id}
            emptyState={<Empty icon={Laptop} text="نشست فعالی پیدا نشد." />}
          />
        )}
      </section>
      <ResponsiveModal
        open={registerOpen}
        onClose={() => !register.isPending && setRegisterOpen(false)}
        title="ثبت Passkey جدید"
        description="پس از ادامه، پنجره امنیتی مرورگر یا سیستم‌عامل باز می‌شود."
        icon={Fingerprint}
      >
        <form
          className="grid gap-4"
          onSubmit={(e) => {
            e.preventDefault()
            register.mutate(deviceName.trim())
          }}
        >
          <label className="grid gap-2 text-sm font-bold">
            نام دستگاه
            <Input
              autoFocus
              className="h-11 rounded-xl"
              placeholder="مثلاً لپ‌تاپ محل کار"
              value={deviceName}
              onChange={(e) => setDeviceName(e.target.value)}
            />
          </label>
          <div className="rounded-xl bg-blue-50 p-3 text-xs leading-6 text-blue-800">
            دامنه صفحه، RP ID سرور و Origin باید یکسان و اتصال HTTPS باشد.
            اطلاعات خصوصی اثر انگشت یا چهره به سرور ارسال نمی‌شود.
          </div>
          <div className="flex justify-end gap-2 border-t pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setRegisterOpen(false)}
            >
              انصراف
            </Button>
            <Button
              type="submit"
              disabled={!deviceName.trim() || register.isPending}
            >
              {register.isPending ? "در حال ارتباط با دستگاه..." : "شروع ثبت"}
            </Button>
          </div>
        </form>
      </ResponsiveModal>
      <ResponsiveModal
        open={passwordOpen}
        onClose={() => !password.isPending && setPasswordOpen(false)}
        title="تغییر رمز عبور"
        description="پس از تغییر رمز، همه نشست‌ها خاتمه می‌یابند و باید دوباره وارد شوید."
        icon={LockKeyhole}
      >
        <form
          className="grid gap-4"
          onSubmit={(e) => {
            e.preventDefault()
            if (newPassword !== confirmPassword)
              return toast.error("تکرار رمز عبور مطابقت ندارد.")
            password.mutate()
          }}
        >
          <label className="grid gap-2 text-sm font-bold">
            رمز عبور فعلی
            <Input
              type="password"
              className="h-11 rounded-xl"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </label>
          <label className="grid gap-2 text-sm font-bold">
            رمز عبور جدید
            <Input
              type="password"
              className="h-11 rounded-xl"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </label>
          <label className="grid gap-2 text-sm font-bold">
            تکرار رمز عبور جدید
            <Input
              type="password"
              className="h-11 rounded-xl"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </label>
          <div className="flex justify-end gap-2 border-t pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setPasswordOpen(false)}
            >
              انصراف
            </Button>
            <Button
              type="submit"
              disabled={
                password.isPending ||
                !currentPassword ||
                newPassword.length < 8 ||
                !confirmPassword
              }
            >
              تغییر رمز
            </Button>
          </div>
        </form>
      </ResponsiveModal>
    </div>
  )
}
function Empty({
  icon: Icon,
  text,
}: {
  icon: typeof Fingerprint
  text: string
}) {
  return (
    <div className="rounded-2xl border border-dashed p-10 text-center text-muted-foreground">
      <Icon className="mx-auto mb-3 size-8" />
      <p className="text-sm">{text}</p>
    </div>
  )
}
function ErrorBox({ error }: { error: unknown }) {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
      {getApiErrorMessage(error, "دریافت اطلاعات امنیتی انجام نشد.")}
    </div>
  )
}
