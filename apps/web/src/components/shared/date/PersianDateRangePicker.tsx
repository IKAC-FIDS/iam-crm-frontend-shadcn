import { uiText } from "@/config/uiText"
import type { DateRangeValue } from "@/lib/date/jalali"

import { PersianDatePicker } from "./PersianDatePicker"

export type PersianDateRangePickerProps = {
  value?: DateRangeValue
  onChange?: (value: DateRangeValue) => void
  disabled?: boolean
}

export function PersianDateRangePicker({
  value,
  onChange,
  disabled = false,
}: PersianDateRangePickerProps) {
  return (
    <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:items-center">
      <PersianDatePicker
        value={value?.from}
        disabled={disabled}
        maxDate={value?.to}
        placeholder={uiText.date.rangeFrom}
        onChange={(from) => onChange?.({ from, to: value?.to })}
      />

      <span className="hidden text-xs text-[var(--app-text-secondary)] sm:block">
        {uiText.date.rangeSeparator}
      </span>

      <PersianDatePicker
        value={value?.to}
        disabled={disabled}
        minDate={value?.from}
        placeholder={uiText.date.rangeTo}
        onChange={(to) => onChange?.({ from: value?.from, to })}
      />
    </div>
  )
}
