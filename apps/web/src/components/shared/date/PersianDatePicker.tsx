import { CalendarIcon } from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover"

import { uiText } from "@/config/uiText"
import { formatJalaliDate } from "@/lib/date/jalali"

import { PersianCalendar } from "./PersianCalendar"

export type PersianDatePickerProps = {
  value?: Date
  onChange?: (date?: Date) => void
  placeholder?: string
  disabled?: boolean
  minDate?: Date
  maxDate?: Date
}

export function PersianDatePicker({
  value,
  onChange,
  placeholder = uiText.date.pickDate,
  disabled = false,
  minDate,
  maxDate,
}: PersianDatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            disabled={disabled}
            className="h-11 w-full justify-start gap-2 rounded-xl text-start font-normal"
          />
        }
      >
        <CalendarIcon className="size-4 text-[var(--app-icon-muted)]" />
        <span className={value ? "" : "text-[var(--app-text-secondary)]"}>
          {value ? formatJalaliDate(value) : placeholder}
        </span>
      </PopoverTrigger>

      <PopoverContent className="w-auto p-0" align="start">
        <PersianCalendar
          value={value}
          onChange={onChange}
          minDate={minDate}
          maxDate={maxDate}
        />
      </PopoverContent>
    </Popover>
  )
}
