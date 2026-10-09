type Props = {
  title: string
  items?: unknown[]
}

export function Company360PlaceholderList({ title, items = [] }: Props) {
  return (
    <div className="rounded-2xl border border-[var(--app-divider)] p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-bold">
          {title}
        </span>

        <span className="text-xs text-[var(--app-text-secondary)]">
          {items.length.toLocaleString("fa-IR")}
        </span>
      </div>

      <p className="text-xs text-[var(--app-text-secondary)]">
        آماده اتصال به API ماژول مربوطه
      </p>
    </div>
  )
}
