import { uiText } from "@/config/uiText"
import { TimeInput } from "@/components/shared/inputs"
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

      <TimeInput
        value={timeValue}
        disabled={disabled || !value}
        aria-label={uiText.date.timeLabel}
        onValueChange={(time) => {
          if (!value) return
          onChange?.(combineDateAndTime(value, time))
        }}
        className="h-11 rounded-xl"
      />
    </div>
  )
}
