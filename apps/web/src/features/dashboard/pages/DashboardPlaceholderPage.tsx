import {
  ArrowLeft,
  Building2,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react"

import { Button } from "@workspace/ui/components/button"

import {
  Card,
  CardContent,
} from "@workspace/ui/components/card"

import { useAuthStore } from "@/store/authStore"

import { uiText } from "@/config/uiText"
const dashboardText = uiText.dashboard

export function DashboardPlaceholderPage() {
  const user = useAuthStore((state) => state.user)

  return (
    <div className="grid gap-6">
      <section className="relative overflow-hidden rounded-[24px] border border-[#D6E3FF] bg-[#FCFCFF] shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -end-24 -top-24 size-80 rounded-full bg-[#D6E3FF]/55 blur-3xl" />

          <div className="absolute -bottom-40 start-24 size-72 rounded-full bg-[#D0E5FB]/40 blur-3xl" />
        </div>

        <div className="relative grid gap-8 p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:p-10">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#0053B2]/10 bg-[#D6E3FF]/70 px-3 py-1.5 text-xs font-medium text-[#003F88]">
              <Sparkles className="size-3.5" />
              {dashboardText.welcomeBadge}
            </div>

            <h2 className="text-2xl font-bold leading-relaxed text-[#0F172A] sm:text-3xl">
              {dashboardText.welcomeTitlePrefix}
              <span className="text-[#0053B2]">
                {" "}
                {user?.fullName}
              </span>
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-[#64748B]">
              {dashboardText.welcomeDescription}
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Button className="rounded-xl bg-[#0053B2] hover:bg-[#004A9F]">
                {dashboardText.actions.opportunities}
                <ArrowLeft className="size-4" />
              </Button>

              <Button
                variant="outline"
                className="rounded-xl border-[#E4EAF3] bg-[#FCFCFF] text-[#55677F]"
              >
                {dashboardText.cards.permissionCount}
              </Button>
            </div>
          </div>

          <div className="hidden lg:grid lg:place-items-center">
            <div className="relative grid size-32 place-items-center rounded-[32px] bg-gradient-to-br from-[#0053B2] to-[#003F88] text-white shadow-[0_24px_60px_rgba(0,83,178,0.28)]">
              <ShieldCheck className="size-14" />

              <div className="absolute -bottom-3 -start-3 grid size-11 place-items-center rounded-2xl border-4 border-[#FCFCFF] bg-[#D6E3FF] text-[#0053B2] shadow-md">
                <UserRound className="size-5" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <InfoCard
          label="نام کاربر"
          value={user?.fullName || "-"}
          icon={<UserRound className="size-5" />}
        />

        <InfoCard
          label="نقش سازمانی"
          value={user?.roleName || user?.role || "-"}
          icon={<ShieldCheck className="size-5" />}
        />

        <InfoCard
          label="تعداد مجوزها"
          value={String(user?.permissions.length ?? 0)}
          icon={<Building2 className="size-5" />}
        />

        <InfoCard
          label="وضعیت نشست"
          value="فعال"
          icon={<ShieldCheck className="size-5" />}
          success
        />
      </div>

      <Card className="overflow-hidden rounded-[20px] border-[#E4EAF3] bg-[#FCFCFF] shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
        <CardContent className="p-0">
          <div className="border-b border-[#E4EAF3] px-6 py-5">
            <h3 className="font-bold text-[#0F172A]">
              اطلاعات حساب جاری
            </h3>

            <p className="mt-1 text-xs text-[#64748B]">
              اطلاعات احراز هویت و سطح دسترسی نشست فعلی
            </p>
          </div>

          <div className="grid gap-0 sm:grid-cols-2">
            <UserField
              label="نام"
              value={user?.fullName}
            />

            <UserField
              label="ایمیل"
              value={user?.email}
              ltr
            />

            <UserField
              label="نقش"
              value={user?.roleName || user?.role}
            />

            <UserField
              label="تعداد مجوزها"
              value={String(user?.permissions.length ?? 0)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function InfoCard({
  label,
  value,
  icon,
  success = false,
}: {
  label: string
  value: string
  icon: React.ReactNode
  success?: boolean
}) {
  return (
    <div className="rounded-[18px] border border-[#E4EAF3] bg-[#FCFCFF] p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_35px_rgba(15,23,42,0.07)]">
      <div
        className={[
          "mb-4 grid size-10 place-items-center rounded-xl",
          success
            ? "bg-[#E6F9EE] text-[#048A3B]"
            : "bg-[#D6E3FF] text-[#0053B2]",
        ].join(" ")}
      >
        {icon}
      </div>

      <div className="text-xs text-[#64748B]">
        {label}
      </div>

      <div className="mt-1 truncate text-base font-bold text-[#0F172A]">
        {value}
      </div>
    </div>
  )
}

function UserField({
  label,
  value,
  ltr = false,
}: {
  label: string
  value?: string | null
  ltr?: boolean
}) {
  return (
    <div className="border-b border-[#E4EAF3] px-6 py-5 odd:sm:border-e">
      <div className="text-xs text-[#64748B]">
        {label}
      </div>

      <div
        dir={ltr ? "ltr" : undefined}
        className="mt-1 text-sm font-semibold text-[#0F172A]"
      >
        {value || "-"}
      </div>
    </div>
  )
}