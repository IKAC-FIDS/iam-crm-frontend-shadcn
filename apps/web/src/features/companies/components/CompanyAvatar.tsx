import { Building2 } from "lucide-react"

export function CompanyAvatar({ name }: { name: string }) {
  const initial = name.trim().slice(0, 1)

  return (
    <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[var(--app-primary-soft)] text-sm font-bold text-[var(--app-primary)] ring-1 ring-[var(--app-primary)]/10">
      {initial || <Building2 className="size-5" />}
    </div>
  )
}
