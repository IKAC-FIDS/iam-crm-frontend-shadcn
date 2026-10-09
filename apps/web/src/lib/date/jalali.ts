import {
  isValidJalaaliDate,
  jalaaliMonthLength,
  toGregorian,
  toJalaali,
} from "jalaali-js"

export type JalaliDateParts = {
  year: number
  month: number
  day: number
}

export type DateRangeValue = {
  from?: Date
  to?: Date
}

export function dateToJalali(date: Date): JalaliDateParts {
  const result = toJalaali(
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate()
  )

  return {
    year: result.jy,
    month: result.jm,
    day: result.jd,
  }
}

export function jalaliToDate(
  year: number,
  month: number,
  day: number
): Date | null {
  if (!isValidJalaaliDate(year, month, day)) return null

  const result = toGregorian(year, month, day)
  return new Date(result.gy, result.gm - 1, result.gd)
}

export function getJalaliMonthLength(year: number, month: number) {
  return jalaaliMonthLength(year, month)
}

export function getJalaliMonthStartWeekday(year: number, month: number) {
  const date = jalaliToDate(year, month, 1)
  if (!date) return 0

  // JS: Sun=0 ... Sat=6. Persian week: Sat=0 ... Fri=6.
  return (date.getDay() + 1) % 7
}

export function addJalaliMonths(
  year: number,
  month: number,
  delta: number
): { year: number; month: number } {
  const absolute = year * 12 + (month - 1) + delta
  const nextYear = Math.floor(absolute / 12)
  const nextMonth = (((absolute % 12) + 12) % 12) + 1
  return { year: nextYear, month: nextMonth }
}

export function isSameLocalDate(left?: Date, right?: Date) {
  if (!left || !right) return false
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  )
}

export function startOfLocalDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

export function formatJalaliDate(date?: Date | string | null): string {
  if (!date) return ""

  const value = typeof date === "string" ? new Date(date) : date
  if (Number.isNaN(value.getTime())) return ""

  return new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(value)
}

export function formatJalaliDateTime(date?: Date | string | null): string {
  if (!date) return ""

  const value = typeof date === "string" ? new Date(date) : date
  if (Number.isNaN(value.getTime())) return ""

  return new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(value)
}

export function format24Hour(date?: Date | string | null): string {
  if (!date) return ""

  const value = typeof date === "string" ? new Date(date) : date
  if (Number.isNaN(value.getTime())) return ""

  return new Intl.DateTimeFormat("fa-IR", {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(value)
}

export function toApiDate(date?: Date | null): string | null {
  if (!date) return null
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export function fromApiDate(value?: string | null): Date | undefined {
  if (!value) return undefined
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value)
  if (!match) return undefined
  const date = new Date(
    Number(match[1]),
    Number(match[2]) - 1,
    Number(match[3])
  )
  return Number.isNaN(date.getTime()) ? undefined : date
}

export function combineDateAndTime(
  date?: Date,
  time?: string
): Date | undefined {
  if (!date) return undefined
  const [hour = "0", minute = "0"] = (time || "00:00").split(":")
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    Number(hour),
    Number(minute),
    0,
    0
  )
}

export function toIsoString(date?: Date | null): string | null {
  return date ? date.toISOString() : null
}
