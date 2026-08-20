import { Clock3 } from "lucide-react"

import { Input } from "@workspace/ui/components/input"

import { uiText } from "@/config/uiText"
import { combineDateAndTime } from "@/lib/date/jalali"

import { PersianDatePicker } from "./PersianDatePicker"

export type PersianDateTimePickerProps = {
  value?: Date
  onChange?: (date?: Date) => void
  disabled?: boolean
  placeholder?: string
}

export function PersianDateTimePicker({
  value,
  onChange,
  disabled = false,
  placeholder = uiText.date.pickDateTime,
}: PersianDateTimePickerProps) {
  const timeValue = value
    ? `${String(value.getHours()).padStart(2, "0")}:${String(value.getMinutes()).padStart(2, "0")}`
    : ""

  return (
    <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_128px]">
      <PersianDatePicker
        value={value}
        disabled={disabled}
        placeholder={placeholder}
        onChange={(date) => {
          if (!date) {
            onChange?.(undefined)
            return
          }
          onChange?.(combineDateAndTime(date, timeValue || "00:00"))
        }}
      />

      <div className="relative">
        <Clock3 className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-[var(--app-icon-muted)]" />
        <Input
          type="time"
          dir="ltr"
          value={timeValue}
          disabled={disabled || !value}
          aria-label={uiText.date.timeLabel}
          onChange={(event) => {
            if (!value) return
            onChange?.(combineDateAndTime(value, event.target.value))
          }}
          className="h-11 rounded-xl ps-9 text-left"
        />
      </div>
    </div>
  )
}
