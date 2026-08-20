import { Label } from "@workspace/ui/components/label"

import type { CompanyCatalogOption } from "../api/companyCatalogs.api"

type Props = {
  label: string
  value?: string
  options: CompanyCatalogOption[]
  loading?: boolean
  placeholder?: string
  onChange: (value?: string) => void
}

export function CompanyCatalogSelect({
  label,
  value,
  options,
  loading,
  placeholder = "انتخاب کنید",
  onChange,
}: Props) {
  return (
    <div className="grid gap-2">
      <Label className="text-xs font-bold text-[var(--app-heading)]">
        {label}
      </Label>

      <select
        value={value ?? ""}
        disabled={loading}
        onChange={(event) =>
          onChange(event.target.value || undefined)
        }
        className="h-11 rounded-xl border border-input bg-background px-3 text-sm"
      >
        <option value="">
          {loading ? "در حال دریافت..." : placeholder}
        </option>

        {options.map((item) => (
          <option key={item.id} value={item.id}>
            {item.name}
          </option>
        ))}
      </select>
    </div>
  )
}
