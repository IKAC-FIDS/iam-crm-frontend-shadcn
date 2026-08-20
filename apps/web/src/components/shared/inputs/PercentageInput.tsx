import type { InputHTMLAttributes } from "react"

import { Input } from "@workspace/ui/components/input"

import { sanitizeDecimal } from "./number.utils"

type PercentageInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type" | "value" | "onChange"
> & {
  value?: string | number | null
  onValueChange?: (rawValue: string) => void
  decimalScale?: number
}

export function PercentageInput({
  value,
  onValueChange,
  decimalScale = 2,
  className,
  ...props
}: PercentageInputProps) {
  const raw = value === null || value === undefined ? "" : String(value)

  return (
    <div className="relative">
      <Input
        {...props}
        type="text"
        inputMode="decimal"
        dir="ltr"
        value={raw}
        onChange={(event) => {
          const next = sanitizeDecimal(event.target.value, decimalScale)
          const numeric = Number(next)
          if (next === "" || (Number.isFinite(numeric) && numeric <= 100)) {
            onValueChange?.(next)
          }
        }}
        className={["h-11 rounded-xl pe-10 text-left tabular-nums", className]
          .filter(Boolean)
          .join(" ")}
      />
      <span className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[var(--app-text-secondary)]">
        %
      </span>
    </div>
  )
}
