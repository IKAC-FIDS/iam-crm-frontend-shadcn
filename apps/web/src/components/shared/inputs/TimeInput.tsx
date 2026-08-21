import { useEffect, useState, type InputHTMLAttributes } from "react"

import { Input } from "@workspace/ui/components/input"

import { uiText } from "@/config/uiText"
import { normalizeDigits } from "./number.utils"

type TimeInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type" | "value" | "onChange"
> & {
  value?: string
  onValueChange?: (value: string) => void
}

function timeDraft(value: string) {
  const normalized = normalizeDigits(value).replace(/[^\d:]/g, "")
  if (normalized.includes(":")) {
    const [hours = "", minutes = ""] = normalized.split(":")
    return `${hours.slice(0, 2)}:${minutes.slice(0, 2)}`
  }
  const digits = normalized.slice(0, 4)
  return digits.length > 2 ? `${digits.slice(0, 2)}:${digits.slice(2)}` : digits
}

function validTime(value: string) {
  if (!/^\d{2}:\d{2}$/.test(value)) return false
  const [hours, minutes] = value.split(":").map(Number)
  return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59
}

export function TimeInput({
  value = "",
  onValueChange,
  className,
  onBlur,
  ...props
}: TimeInputProps) {
  const [draft, setDraft] = useState(value)

  useEffect(() => setDraft(value), [value])

  return (
    <Input
      {...props}
      type="text"
      inputMode="numeric"
      dir="ltr"
      lang="en-GB"
      maxLength={5}
      placeholder={uiText.date.timePlaceholder}
      value={draft}
      onChange={(event) => {
        const next = timeDraft(event.target.value)
        setDraft(next)
        if (validTime(next)) onValueChange?.(next)
      }}
      onBlur={(event) => {
        if (!validTime(draft)) setDraft(value)
        onBlur?.(event)
      }}
      className={["text-left tabular-nums", className]
        .filter(Boolean)
        .join(" ")}
    />
  )
}
