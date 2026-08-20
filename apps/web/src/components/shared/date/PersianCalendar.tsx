import { ChevronLeft, ChevronRight } from "lucide-react"
import { useEffect, useMemo, useState } from "react"

import { Button } from "@workspace/ui/components/button"

import { uiText } from "@/config/uiText"
import {
  addJalaliMonths,
  dateToJalali,
  getJalaliMonthLength,
  getJalaliMonthStartWeekday,
  isSameLocalDate,
  jalaliToDate,
  startOfLocalDay,
} from "@/lib/date/jalali"

type PersianCalendarProps = {
  value?: Date
  onChange?: (date?: Date) => void
  minDate?: Date
  maxDate?: Date
}

export function PersianCalendar({
  value,
  onChange,
  minDate,
  maxDate,
}: PersianCalendarProps) {
  const today = useMemo(() => new Date(), [])
  const initial = dateToJalali(value ?? today)
  const [viewYear, setViewYear] = useState(initial.year)
  const [viewMonth, setViewMonth] = useState(initial.month)

  useEffect(() => {
    if (!value) return
    const jalali = dateToJalali(value)
    setViewYear(jalali.year)
    setViewMonth(jalali.month)
  }, [value])

  const daysInMonth = getJalaliMonthLength(viewYear, viewMonth)
  const offset = getJalaliMonthStartWeekday(viewYear, viewMonth)
  const cells = Array.from({ length: offset + daysInMonth }, (_, index) =>
    index < offset ? null : index - offset + 1,
  )

  function move(delta: number) {
    const next = addJalaliMonths(viewYear, viewMonth, delta)
    setViewYear(next.year)
    setViewMonth(next.month)
  }

  function selectDay(day: number) {
    const date = jalaliToDate(viewYear, viewMonth, day)
    if (!date || isDisabled(date)) return
    onChange?.(date)
  }

  function isDisabled(date: Date) {
    const normalized = startOfLocalDay(date)
    if (minDate && normalized < startOfLocalDay(minDate)) return true
    if (maxDate && normalized > startOfLocalDay(maxDate)) return true
    return false
  }

  const text = uiText.date.calendar

  return (
    <div dir="rtl" className="w-[310px] p-3">
      <div className="mb-3 flex items-center justify-between gap-2">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="rounded-xl"
          aria-label={text.previousMonth}
          onClick={() => move(-1)}
        >
          <ChevronRight className="size-4" />
        </Button>

        <div className="text-center">
          <div className="text-sm font-bold text-[var(--app-heading)]">
            {text.months[viewMonth - 1]}
          </div>
          <div className="text-[11px] text-[var(--app-text-secondary)]">
            {new Intl.NumberFormat("fa-IR", { useGrouping: false }).format(viewYear)}
          </div>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="rounded-xl"
          aria-label={text.nextMonth}
          onClick={() => move(1)}
        >
          <ChevronLeft className="size-4" />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {text.weekdays.map((weekday) => (
          <div
            key={weekday}
            className="grid h-8 place-items-center text-[10px] font-bold text-[var(--app-text-secondary)]"
          >
            {weekday}
          </div>
        ))}

        {cells.map((day, index) => {
          if (!day) return <div key={`empty-${index}`} className="h-9" />

          const date = jalaliToDate(viewYear, viewMonth, day)
          const selected = Boolean(date && isSameLocalDate(date, value))
          const current = Boolean(date && isSameLocalDate(date, today))
          const disabled = !date || isDisabled(date)

          return (
            <button
              key={day}
              type="button"
              disabled={disabled}
              onClick={() => selectDay(day)}
              className={[
                "grid h-9 place-items-center rounded-xl text-xs transition-colors",
                selected
                  ? "bg-[var(--app-primary)] font-bold text-[var(--app-on-primary)]"
                  : current
                    ? "bg-[var(--app-primary-soft)] font-bold text-[var(--app-primary)]"
                    : "text-[var(--app-heading)] hover:bg-[var(--app-background)]",
                disabled ? "cursor-not-allowed opacity-35" : "",
              ].join(" ")}
            >
              {new Intl.NumberFormat("fa-IR", { useGrouping: false }).format(day)}
            </button>
          )
        })}
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-[var(--app-divider)] pt-3">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="rounded-xl text-xs"
          onClick={() => {
            const current = dateToJalali(today)
            setViewYear(current.year)
            setViewMonth(current.month)
            onChange?.(today)
          }}
        >
          {text.today}
        </Button>

        {value ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="rounded-xl text-xs text-[var(--app-text-secondary)]"
            onClick={() => onChange?.(undefined)}
          >
            {text.clear}
          </Button>
        ) : null}
      </div>
    </div>
  )
}
