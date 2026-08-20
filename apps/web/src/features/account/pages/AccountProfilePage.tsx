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
      <section className="relative overflow-hidden rounded-[var(--app-radius-feature)] border border-[var(--app-primary-soft)] bg-[var(--app-surface)] p-6 shadow-[var(--app-shadow-elevated)] sm:p-8">
        <div className="pointer-events-none absolute -end-24 -top-24 size-80 rounded-full bg-[var(--app-primary-soft)]/60 blur-3xl" />

        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center">
          <div className="grid size-20 shrink-0 place-items-center rounded-[26px] bg-gradient-to-br from-[var(--app-primary)] to-[var(--app-primary-active)] text-2xl font-bold text-[var(--app-on-primary)] shadow-[var(--app-shadow-brand)]">
            {user?.fullName?.trim().charAt(0) || uiText.common.fallbackUserInitial}
          </div>

          <div className="min-w-0">
            <h2 className="ui-page-title truncate">{profileText.title}</h2>

            <p className="mt-2 text-sm leading-7 text-[var(--app-text-secondary)]">
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

      <Card className="overflow-hidden rounded-[var(--app-radius-card)] border-[var(--app-divider)] bg-[var(--app-surface)] shadow-[var(--app-shadow-card)]">
        <CardContent className="p-0">
          <div className="border-b border-[var(--app-divider)] px-6 py-5">
            <h3 className="ui-card-title">{profileText.account.title}</h3>
            <p className="mt-1 text-xs text-[var(--app-text-secondary)]">
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
    <div className="rounded-[18px] border border-[var(--app-divider)] bg-[var(--app-surface)] p-5 shadow-[var(--app-shadow-card)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[var(--app-shadow-card-hover)]">
      <div
        className={[
          "mb-4 grid size-10 place-items-center rounded-xl",
          success
            ? "bg-[var(--success-light)] text-[var(--success)]"
            : "bg-[var(--app-primary-soft)] text-[var(--app-primary)]",
        ].join(" ")}
      >
        {icon}
      </div>

      <div className="text-xs text-[var(--app-text-secondary)]">{label}</div>

      <div className="mt-1 truncate text-base font-bold text-[var(--app-heading)]">
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
    <div className="border-b border-[var(--app-divider)] px-6 py-5 odd:sm:border-e">
      <div className="flex items-center gap-2 text-xs text-[var(--app-text-secondary)]">
        {icon}
        {label}
      </div>

      <div
        dir={ltr ? "ltr" : undefined}
        className="mt-2 text-sm font-semibold text-[var(--app-heading)]"
      >
        {value || uiText.common.notAvailable}
      </div>
    </div>
  )
}
