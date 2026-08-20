import type { InputHTMLAttributes } from "react"

import { Input } from "@workspace/ui/components/input"

import {
  formatGroupedNumber,
  sanitizeInteger,
} from "./number.utils"

type NumberInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type" | "value" | "onChange"
> & {
  value?: string | number | null
  onValueChange?: (rawValue: string) => void
  grouping?: boolean
}

export function NumberInput({
  value,
  onValueChange,
  grouping = true,
  className,
  ...props
}: NumberInputProps) {
  const raw = value === null || value === undefined ? "" : String(value)

  return (
    <Input
      {...props}
      type="text"
      inputMode="numeric"
      dir="ltr"
      value={grouping ? formatGroupedNumber(raw) : raw}
      onChange={(event) => {
        onValueChange?.(sanitizeInteger(event.target.value))
      }}
      className={["h-11 rounded-xl text-left tabular-nums", className]
        .filter(Boolean)
        .join(" ")}
    />
  )
}
