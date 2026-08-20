import type { InputHTMLAttributes } from "react"

import { Input } from "@workspace/ui/components/input"

import { uiText } from "@/config/uiText"

import {
  formatGroupedNumber,
  sanitizeDecimal,
} from "./number.utils"

type CurrencyInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type" | "value" | "onChange"
> & {
  value?: string | number | null
  onValueChange?: (rawValue: string) => void
  unit?: string
  decimalScale?: number
}

export function CurrencyInput({
  value,
  onValueChange,
  unit = uiText.inputs.currency.defaultUnit,
  decimalScale = 2,
  className,
  ...props
}: CurrencyInputProps) {
  const raw = value === null || value === undefined ? "" : String(value)

  return (
    <div className="relative">
      <Input
        {...props}
        type="text"
        inputMode="decimal"
        dir="ltr"
        value={formatGroupedNumber(raw)}
        onChange={(event) => {
          onValueChange?.(sanitizeDecimal(event.target.value, decimalScale))
        }}
        className={[
          "h-11 rounded-xl pr-16 text-left tabular-nums",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      />
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[var(--app-text-secondary)]">
        {unit}
      </span>
    </div>
  )
}
