const PERSIAN_DIGITS = "۰۱۲۳۴۵۶۷۸۹"
const ARABIC_DIGITS = "٠١٢٣٤٥٦٧٨٩"

export function normalizeDigits(value: string) {
  return value
    .replace(/[۰-۹]/g, (digit) => String(PERSIAN_DIGITS.indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String(ARABIC_DIGITS.indexOf(digit)))
}

export function sanitizeInteger(value: string) {
  return normalizeDigits(value).replace(/[^\d]/g, "")
}

export function sanitizeDecimal(value: string, decimalScale = 2) {
  const normalized = normalizeDigits(value).replace(/,/g, "").replace(/٬/g, "")
  const cleaned = normalized.replace(/[^\d.]/g, "")
  const [integer = "", ...rest] = cleaned.split(".")
  const decimal = rest.join("").slice(0, decimalScale)
  return rest.length ? `${integer}.${decimal}` : integer
}

export function formatGroupedNumber(value?: string | number | null) {
  if (value === null || value === undefined || value === "") return ""
  const raw = String(value).replace(/,/g, "").replace(/٬/g, "")
  const [integer, decimal] = raw.split(".")
  const grouped = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  return decimal !== undefined ? `${grouped}.${decimal}` : grouped
}
