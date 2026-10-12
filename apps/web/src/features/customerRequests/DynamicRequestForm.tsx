import type { FormSchema } from "./customerRequests.types"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"

export function DynamicRequestForm({
  schema,
  value,
  onChange,
  errors = {},
  disabled = false,
}: {
  schema: FormSchema
  value: Record<string, unknown>
  onChange: (v: Record<string, unknown>) => void
  errors?: Record<string, string>
  disabled?: boolean
}) {
  const set = (key: string, next: unknown) =>
    onChange({ ...value, [key]: next })
  return (
    <div className="space-y-5" dir="rtl">
      {schema.fields.map((f) => {
        if (
          f.visibleWhen &&
          value[f.visibleWhen.field] !== f.visibleWhen.equals
        )
          return null
        if (f.type === "SECTION")
          return (
            <h3 key={f.key} className="border-b pb-2 text-lg font-semibold">
              {f.label}
            </h3>
          )
        if (f.type === "INFO")
          return (
            <p
              key={f.key}
              className="rounded-xl bg-muted p-3 text-sm text-muted-foreground"
            >
              {f.label}
              {f.description && <span className="block">{f.description}</span>}
            </p>
          )
        const required =
          f.required ||
          (f.requiredWhen &&
            value[f.requiredWhen.field] === f.requiredWhen.equals)
        return (
          <div key={f.key} className="space-y-2">
            <Label htmlFor={f.key}>
              {f.label}
              {required && <span className="text-destructive"> *</span>}
            </Label>
            {f.description && (
              <p className="text-xs text-muted-foreground">{f.description}</p>
            )}
            {f.type === "TEXTAREA" ? (
              <textarea
                id={f.key}
                disabled={disabled}
                className="min-h-28 w-full rounded-md border bg-background p-3 text-sm"
                placeholder={f.placeholder}
                value={String(value[f.key] ?? "")}
                onChange={(e) => set(f.key, e.target.value)}
              />
            ) : ["SELECT", "RADIO"].includes(f.type) ? (
              <select
                id={f.key}
                disabled={disabled}
                className="h-10 w-full rounded-md border bg-background px-3"
                value={String(value[f.key] ?? "")}
                onChange={(e) => set(f.key, e.target.value)}
              >
                <option value="">انتخاب کنید</option>
                {f.options?.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            ) : f.type === "MULTI_SELECT" ? (
              <div className="grid gap-2 sm:grid-cols-2">
                {f.options?.map((o) => (
                  <label
                    key={o.value}
                    className="flex items-center gap-2 rounded-md border p-2"
                  >
                    <input
                      type="checkbox"
                      disabled={disabled}
                      checked={
                        Array.isArray(value[f.key]) &&
                        (value[f.key] as unknown[]).includes(o.value)
                      }
                      onChange={(e) => {
                        const current = Array.isArray(value[f.key])
                          ? (value[f.key] as string[])
                          : []
                        set(
                          f.key,
                          e.target.checked
                            ? [...current, o.value]
                            : current.filter((x) => x !== o.value)
                        )
                      }}
                    />
                    {o.label}
                  </label>
                ))}
              </div>
            ) : ["BOOLEAN", "CHECKBOX"].includes(f.type) ? (
              <label className="flex items-center gap-2">
                <input
                  id={f.key}
                  type="checkbox"
                  disabled={disabled}
                  checked={value[f.key] === true}
                  onChange={(e) => set(f.key, e.target.checked)}
                />{" "}
                بله
              </label>
            ) : (
              <Input
                id={f.key}
                disabled={disabled}
                type={
                  f.type === "NUMBER"
                    ? "number"
                    : f.type === "EMAIL"
                      ? "email"
                      : f.type === "DATE"
                        ? "date"
                        : "text"
                }
                min={f.min}
                max={f.max}
                placeholder={f.placeholder}
                value={String(value[f.key] ?? "")}
                onChange={(e) =>
                  set(
                    f.key,
                    f.type === "NUMBER"
                      ? e.target.value === ""
                        ? undefined
                        : Number(e.target.value)
                      : e.target.value
                  )
                }
              />
            )}
            {errors[f.key] && (
              <p role="alert" className="text-xs text-destructive">
                {errors[f.key]}
              </p>
            )}
          </div>
        )
      })}
    </div>
  )
}
