import type { FieldValues, Path, UseFormSetError } from "react-hook-form"
import { normalizeAppError } from "./appError"

/** Explicit allowlist prevents server keys becoming arbitrary RHF paths. Unmapped errors stay general. */
export function applyServerFieldErrors<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
  fields: readonly Path<T>[],
  aliases: Readonly<Record<string, Path<T>>> = {}
) {
  const normalized = normalizeAppError(error)
  let focused = false
  for (const [key, messages] of Object.entries(normalized.fieldErrors)) {
    const field = aliases[key] ?? fields.find((name) => name === key)
    if (!field || !fields.includes(field) || !messages.length) continue
    setError(
      field,
      { type: "server", message: messages.join("؛ ") },
      { shouldFocus: !focused }
    )
    focused = true
  }
  setError("root.server", { type: "server", message: normalized.message })
  return normalized
}
