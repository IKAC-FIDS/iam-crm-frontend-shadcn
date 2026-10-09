import type { ReactNode } from "react"

export function CompanyInfoGrid({
  items,
}: {
  items: { label: string; value: ReactNode }[]
}) {
  return (
    <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <div key={item.label} className="min-w-0">
          <p className="text-xs text-[var(--app-text-secondary)]">
            {item.label}
          </p>
          <div className="mt-1.5 break-words text-sm font-semibold text-[var(--app-heading)]">
            {item.value || "-"}
          </div>
        </div>
      ))}
    </div>
  )
}
