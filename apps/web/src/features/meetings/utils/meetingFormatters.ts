import { uiText } from "@/config/uiText"
import {
  format24Hour,
  formatJalaliDate,
  isSameLocalDate,
  startOfLocalDay,
} from "@/lib/date/jalali"

import type {
  Meeting,
  MeetingMode,
  MeetingStatus,
} from "../types/meeting.types"

export function meetingCompanyName(meeting: Meeting) {
  return (
    meeting.company?.brandName ||
    meeting.company?.legalName ||
    uiText.common.notAvailable
  )
}

export function meetingStatusLabel(status: MeetingStatus) {
  return uiText.meetings.statuses[status]
}

export function meetingModeLabel(mode: MeetingMode) {
  return uiText.meetings.modes[mode]
}

export function meetingTimeRange(meeting: Pick<Meeting, "startAt" | "endAt">) {
  return `${format24Hour(meeting.startAt)}–${format24Hour(meeting.endAt)}`
}

export function meetingStatusTone(status: MeetingStatus) {
  if (status === "COMPLETED") return "success" as const
  if (status === "CANCELLED") return "error" as const
  return "info" as const
}

export function meetingDayKey(value: string) {
  const date = new Date(value)
  const day = startOfLocalDay(date)
  return `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, "0")}-${String(day.getDate()).padStart(2, "0")}`
}

export function meetingDayLabel(value: string) {
  const date = new Date(value)
  const today = startOfLocalDay(new Date())
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const relative = isSameLocalDate(date, today)
    ? uiText.meetings.relativeDays.today
    : isSameLocalDate(date, tomorrow)
      ? uiText.meetings.relativeDays.tomorrow
      : isSameLocalDate(date, yesterday)
        ? uiText.meetings.relativeDays.yesterday
        : ""
  const weekday = new Intl.DateTimeFormat("fa-IR", { weekday: "long" }).format(
    date
  )
  const full = `${weekday} ${formatJalaliDate(date)}`
  return relative ? `${relative} · ${full}` : full
}

export function localDayRange(date = new Date()) {
  const from = startOfLocalDay(date)
  const to = new Date(from)
  to.setHours(23, 59, 59, 999)
  return { dateFrom: from.toISOString(), dateTo: to.toISOString() }
}
