import { CalendarDays } from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover"
import { Calendar } from "@workspace/ui/components/calendar"

import { uiText } from "@/config/uiText"
import { formatJalaliDate } from "@/lib/date/jalali"

export type PersianDateRange = {
  from?: Date
  to?: Date
}

type PersianDateRangePickerProps = {
  value?: PersianDateRange
  onChange?: (range?: PersianDateRange) => void
  disabled?: boolean
  placeholder?: string
}

export function PersianDateRangePicker({
  value,
  onChange,
  disabled = false,
  placeholder = uiText.date.pickDateRange,
}: PersianDateRangePickerProps) {
  const label =
    value?.from && value?.to
      ? `${formatJalaliDate(value.from)} ${uiText.date.rangeSeparator} ${formatJalaliDate(value.to)}`
      : value?.from
        ? formatJalaliDate(value.from)
        : placeholder

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            disabled={disabled}
            className="w-full justify-start gap-2 text-start font-normal"
          />
        }
      >
        <CalendarDays className="size-4" />
        {label}
      </PopoverTrigger>

      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          selected={{
            from: value?.from,
            to: value?.to,
          }}
          onSelect={(range) =>
            onChange?.(
              range
                ? {
                    from: range.from,
                    to: range.to,
                  }
                : undefined,
            )
          }
          numberOfMonths={2}
        />
      </PopoverContent>
    </Popover>
  )
}
