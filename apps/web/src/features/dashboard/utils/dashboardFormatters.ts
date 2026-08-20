export function toFiniteNumber(value: number | string | null | undefined) {
  const parsed = Number(value ?? 0)
  return Number.isFinite(parsed) ? parsed : 0
}

export function formatCount(value: number | string | null | undefined) {
  return toFiniteNumber(value).toLocaleString("fa-IR")
}

export function formatPercent(value: number | string | null | undefined) {
  return `${toFiniteNumber(value).toLocaleString("fa-IR", {
    maximumFractionDigits: 1,
  })}٪`
}

export function formatCompactNumber(value: number | string | null | undefined) {
  return new Intl.NumberFormat("fa-IR", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(toFiniteNumber(value))
}

export function formatPersianMonth(value: string) {
  return new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
    month: "short",
    timeZone: "UTC",
  }).format(new Date(value))
}

export function formatPersianDateTime(value: string) {
  return new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value))
}
