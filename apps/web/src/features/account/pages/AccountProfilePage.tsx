import type { ReactNode } from "react"
import {
  AtSign,
  KeyRound,
  ShieldCheck,
  UserRound,
} from "lucide-react"

import {
  Card,
  CardContent,
} from "@workspace/ui/components/card"

import { uiText } from "@/config/uiText"
import { useAuthStore } from "@/store/authStore"

const profileText = uiText.profile

export function AccountProfilePage() {
  const user = useAuthStore((state) => state.user)

  return (
    <div className="grid gap-6">
      <section className="relative overflow-hidden rounded-[24px] border border-[#D6E3FF] bg-[#FCFCFF] p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)] sm:p-8">
        <div className="pointer-events-none absolute -end-24 -top-24 size-80 rounded-full bg-[#D6E3FF]/60 blur-3xl" />

        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center">
          <div className="grid size-20 shrink-0 place-items-center rounded-[26px] bg-gradient-to-br from-[#0053B2] to-[#003F88] text-2xl font-bold text-white shadow-[0_20px_50px_rgba(0,83,178,0.24)]">
            {user?.fullName?.trim().charAt(0) || uiText.common.fallbackUserInitial}
          </div>

          <div className="min-w-0">
            <h2 className="truncate text-2xl font-bold text-[#0F172A]">
              {profileText.title}
            </h2>

            <p className="mt-2 text-sm leading-7 text-[#64748B]">
              {profileText.description}
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <ProfileCard
          label={profileText.cards.userName}
          value={user?.fullName || uiText.common.notAvailable}
          icon={<UserRound className="size-5" />}
        />

        <ProfileCard
          label={profileText.cards.organizationRole}
          value={user?.roleName || user?.role || uiText.common.notAvailable}
          icon={<ShieldCheck className="size-5" />}
        />

        <ProfileCard
          label={profileText.cards.permissionCount}
          value={String(user?.permissions.length ?? 0)}
          icon={<KeyRound className="size-5" />}
        />

        <ProfileCard
          label={profileText.cards.sessionStatus}
          value={profileText.cards.sessionActive}
          icon={<ShieldCheck className="size-5" />}
          success
        />
      </div>

      <Card className="overflow-hidden rounded-[20px] border-[#E4EAF3] bg-[#FCFCFF] shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
        <CardContent className="p-0">
          <div className="border-b border-[#E4EAF3] px-6 py-5">
            <h3 className="font-bold text-[#0F172A]">
              {profileText.account.title}
            </h3>

            <p className="mt-1 text-xs text-[#64748B]">
              {profileText.account.description}
            </p>
          </div>

          <div className="grid gap-0 sm:grid-cols-2">
            <UserField
              label={profileText.account.fields.name}
              value={user?.fullName}
              icon={<UserRound className="size-4" />}
            />

            <UserField
              label={profileText.account.fields.email}
              value={user?.email}
              icon={<AtSign className="size-4" />}
              ltr
            />

            <UserField
              label={profileText.account.fields.role}
              value={user?.roleName || user?.role}
              icon={<ShieldCheck className="size-4" />}
            />

            <UserField
              label={profileText.account.fields.permissionCount}
              value={String(user?.permissions.length ?? 0)}
              icon={<KeyRound className="size-4" />}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function ProfileCard({
  label,
  value,
  icon,
  success = false,
}: {
  label: string
  value: string
  icon: ReactNode
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

      <div className="text-xs text-[#64748B]">{label}</div>

      <div className="mt-1 truncate text-base font-bold text-[#0F172A]">
        {value}
      </div>
    </div>
  )
}

function UserField({
  label,
  value,
  icon,
  ltr = false,
}: {
  label: string
  value?: string | null
  icon: ReactNode
  ltr?: boolean
}) {
  return (
    <div className="border-b border-[#E4EAF3] px-6 py-5 odd:sm:border-e">
      <div className="flex items-center gap-2 text-xs text-[#64748B]">
        {icon}
        {label}
      </div>

      <div
        dir={ltr ? "ltr" : undefined}
        className="mt-2 text-sm font-semibold text-[#0F172A]"
      >
        {value || uiText.common.notAvailable}
      </div>
    </div>
  )
}
