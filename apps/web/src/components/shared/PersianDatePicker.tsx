import { CalendarIcon } from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover"
import { Calendar } from "@workspace/ui/components/calendar"

import { formatJalaliDate } from "@/lib/date/jalali"

type PersianDatePickerProps = {
  value?: Date
  onChange?: (date?: Date) => void
  placeholder?: string
  disabled?: boolean
}

export function PersianDatePicker({
  value,
  onChange,
  placeholder = "انتخاب تاریخ",
  disabled = false,
}: PersianDatePickerProps) {
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
        <CalendarIcon className="size-4" />

        {value
          ? formatJalaliDate(value)
          : placeholder}
      </PopoverTrigger>

      <PopoverContent
        className="w-auto p-0"
        align="start"
      >
        <Calendar
          mode="single"
          selected={value}
          onSelect={onChange}
        />
      </PopoverContent>
    </Popover>
  )
}