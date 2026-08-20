import { useMemo } from "react"
import { Clock3 } from "lucide-react"

import { Input } from "@workspace/ui/components/input"

import { PersianDatePicker } from "./PersianDatePicker"

type PersianDateTimePickerProps = {
  value?: Date
  onChange?: (date?: Date) => void
  disabled?: boolean
  placeholder?: string
}

export function PersianDateTimePicker({
  value,
  onChange,
  disabled = false,
  placeholder = "انتخاب تاریخ و ساعت",
}: PersianDateTimePickerProps) {
  const timeValue = useMemo(() => {
    if (!value) {
      return ""
    }

    const hours = String(value.getHours()).padStart(2, "0")
    const minutes = String(value.getMinutes()).padStart(2, "0")

    return `${hours}:${minutes}`
  }, [value])

  const handleDateChange = (date?: Date) => {
    if (!date) {
      onChange?.(undefined)
      return
    }

    const next = new Date(date)

    if (value) {
      next.setHours(value.getHours(), value.getMinutes(), 0, 0)
    } else {
      next.setHours(0, 0, 0, 0)
    }

    onChange?.(next)
  }

  const handleTimeChange = (time: string) => {
    if (!time) {
      return
    }

    const [hours, minutes] = time.split(":").map(Number)

    if (
      Number.isNaN(hours) ||
      Number.isNaN(minutes)
    ) {
      return
    }

    const next = value
      ? new Date(value)
      : new Date()

    next.setHours(hours, minutes, 0, 0)

    onChange?.(next)
  }

  return (
    <div className="grid gap-2">
      <PersianDatePicker
        value={value}
        onChange={handleDateChange}
        disabled={disabled}
        placeholder={placeholder}
      />

      <div className="relative">
        <Clock3 className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

        <Input
          type="time"
          value={timeValue}
          onChange={(event) =>
            handleTimeChange(event.target.value)
          }
          disabled={disabled}
          className="pe-9"
        />
      </div>
    </div>
  )
}