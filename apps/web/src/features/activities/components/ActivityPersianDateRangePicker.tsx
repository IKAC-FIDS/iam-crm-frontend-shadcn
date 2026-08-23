import { CalendarDays, RotateCcw } from "lucide-react"

import { PersianCalendar } from "@/components/shared/date/PersianCalendar"
import { formatJalaliDate } from "@/lib/date/jalali"
import { Button } from "@workspace/ui/components/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover"

export type ActivityPersianDateRange = {
  from?: Date
  to?: Date
}

export function ActivityPersianDateRangePicker({
  value,
  onChange,
}: {
  value?: ActivityPersianDateRange
  onChange: (value?: ActivityPersianDateRange) => void
}) {
  const label =
    value?.from && value?.to
      ? `${formatJalaliDate(value.from)} تا ${formatJalaliDate(value.to)}`
      : value?.from
        ? `از ${formatJalaliDate(value.from)}`
        : value?.to
          ? `تا ${formatJalaliDate(value.to)}`
          : "بازه تاریخ فعالیت"

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="outline"
            className="h-11 w-full justify-start gap-2 rounded-xl px-3 text-start font-normal"
          />
        }
      >
        <CalendarDays className="size-4 text-[var(--app-icon-muted)]" />
        <span
          className={
            value?.from || value?.to
              ? ""
              : "text-[var(--app-text-secondary)]"
          }
        >
          {label}
        </span>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        className="w-[min(720px,calc(100vw-24px))] rounded-2xl p-3"
        dir="rtl"
      >
        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-2xl border border-[var(--app-divider)]">
            <div className="border-b border-[var(--app-divider)] px-4 py-3 text-xs font-bold text-[var(--app-heading)]">
              از تاریخ
            </div>
            <PersianCalendar
              value={value?.from}
              maxDate={value?.to}
              onChange={(from) => {
                if (!from) {
                  onChange(value?.to ? { to: value.to } : undefined)
                  return
                }

                onChange({
                  from,
                  to:
                    value?.to && value.to >= from
                      ? value.to
                      : undefined,
                })
              }}
            />
          </div>

          <div className="rounded-2xl border border-[var(--app-divider)]">
            <div className="border-b border-[var(--app-divider)] px-4 py-3 text-xs font-bold text-[var(--app-heading)]">
              تا تاریخ
            </div>
            <PersianCalendar
              value={value?.to}
              minDate={value?.from}
              onChange={(to) => {
                if (!to) {
                  onChange(value?.from ? { from: value.from } : undefined)
                  return
                }

                onChange({
                  from: value?.from,
                  to,
                })
              }}
            />
          </div>
        </div>

        {value?.from || value?.to ? (
          <div className="mt-3 flex justify-end border-t border-[var(--app-divider)] pt-3">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="rounded-xl text-[var(--app-text-secondary)]"
              onClick={() => onChange(undefined)}
            >
              <RotateCcw className="size-3.5" />
              پاک کردن بازه
            </Button>
          </div>
        ) : null}
      </PopoverContent>
    </Popover>
  )
}
