import {
  toGregorian,
  toJalaali,
  isValidJalaaliDate,
} from "jalaali-js"

export type JalaliDateParts = {
  year: number
  month: number
  day: number
}

export function dateToJalali(date: Date): JalaliDateParts {
  const result = toJalaali(
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate(),
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
  day: number,
): Date | null {
  if (!isValidJalaaliDate(year, month, day)) {
    return null
  }

  const result = toGregorian(year, month, day)

  return new Date(
    result.gy,
    result.gm - 1,
    result.gd,
  )
}

export function formatJalaliDate(
  date?: Date | string | null,
): string {
  if (!date) {
    return ""
  }

  const value =
    typeof date === "string"
      ? new Date(date)
      : date

  if (Number.isNaN(value.getTime())) {
    return ""
  }

  return new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(value)
}

export function formatJalaliDateTime(
  date?: Date | string | null,
): string {
  if (!date) {
    return ""
  }

  const value =
    typeof date === "string"
      ? new Date(date)
      : date

  if (Number.isNaN(value.getTime())) {
    return ""
  }

  return new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(value)
}

export function toIsoString(
  date?: Date | null,
): string | null {
  return date ? date.toISOString() : null
}