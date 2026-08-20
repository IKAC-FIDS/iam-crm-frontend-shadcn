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
  minYear?: number
  maxYear?: number
}

export function PersianCalendar({
  value,
  onChange,
  minDate,
  maxDate,
  minYear = 1300,
  maxYear = 1500,
}: PersianCalendarProps) {
  const today = useMemo(() => new Date(), [])
  const initial = dateToJalali(value ?? today)
  const [viewYear, setViewYear] = useState(initial.year)
  const [viewMonth, setViewMonth] = useState(initial.month)

  const resolvedMinYear = minDate
    ? Math.max(minYear, dateToJalali(minDate).year)
    : minYear
  const resolvedMaxYear = maxDate
    ? Math.min(maxYear, dateToJalali(maxDate).year)
    : maxYear

  const years = useMemo(
    () =>
      Array.from(
        { length: Math.max(0, resolvedMaxYear - resolvedMinYear + 1) },
        (_, index) => resolvedMaxYear - index,
      ),
    [resolvedMaxYear, resolvedMinYear],
  )

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
    if (next.year < resolvedMinYear || next.year > resolvedMaxYear) return
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
    <div dir="rtl" className="w-[330px] p-3">
      <div className="mb-3 flex items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="shrink-0 rounded-xl"
          aria-label={text.previousMonth}
          disabled={viewYear === resolvedMinYear && viewMonth === 1}
          onClick={() => move(-1)}
        >
          <ChevronRight className="size-4" />
        </Button>

        <div className="grid min-w-0 flex-1 grid-cols-[minmax(0,1fr)_92px] gap-2">
          <select
            aria-label={text.selectMonth}
            value={viewMonth}
            onChange={(event) => setViewMonth(Number(event.target.value))}
            className={headerSelectClass}
          >
            {text.months.map((month, index) => (
              <option key={month} value={index + 1}>
                {month}
              </option>
            ))}
          </select>

          <select
            aria-label={text.selectYear}
            value={viewYear}
            onChange={(event) => setViewYear(Number(event.target.value))}
            className={headerSelectClass}
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {new Intl.NumberFormat("fa-IR", {
                  useGrouping: false,
                }).format(year)}
              </option>
            ))}
          </select>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="shrink-0 rounded-xl"
          aria-label={text.nextMonth}
          disabled={viewYear === resolvedMaxYear && viewMonth === 12}
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

const headerSelectClass =
  "h-9 w-full rounded-xl border border-input bg-background px-2 text-xs font-bold text-[var(--app-heading)] outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
