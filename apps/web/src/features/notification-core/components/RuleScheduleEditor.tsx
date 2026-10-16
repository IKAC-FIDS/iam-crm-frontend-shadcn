import { useState } from "react"
import { FormField } from "@workspace/ui/components/form-field"
import { Input } from "@workspace/ui/components/input"
import { NativeSelect } from "@workspace/ui/components/native-select"
import type {
  NotificationScheduleEventDefinition,
  NotificationScheduleInput,
} from "../types/rule-engine.types"

const presets: Record<number, string> = {
  [-10080]: "۷ روز قبل",
  [-1440]: "۱ روز قبل",
  [-120]: "۲ ساعت قبل",
  [-60]: "۱ ساعت قبل",
  [-30]: "۳۰ دقیقه قبل",
  [-15]: "۱۵ دقیقه قبل",
  0: "در زمان سررسید / پس از سررسید",
}
type Unit = "minute" | "hour" | "day"
const factorOf = (unit: Unit) =>
  unit === "day" ? 1440 : unit === "hour" ? 60 : 1

export function RuleScheduleEditor({
  definition,
  value,
  onChange,
}: {
  definition?: NotificationScheduleEventDefinition
  value: NotificationScheduleInput | null
  onChange: (value: NotificationScheduleInput | null) => void
}) {
  const [unit, setUnit] = useState<Unit>("minute")
  if (!definition) return null
  const options = definition.scheduleOptions
  const current = value ?? {
    enabled: true,
    type: options.type,
    sourceField: options.sourceField,
    triggerMode: options.triggerModes[0]!,
    offsetMinutes: options.suggestedOffsetsMinutes[0] ?? 0,
    gracePeriodMinutes: options.defaultGracePeriodMinutes,
  }
  const custom = !options.suggestedOffsetsMinutes.includes(
    current.offsetMinutes
  )
  const factor = factorOf(unit)
  return (
    <section
      className="grid gap-4 rounded-2xl border bg-muted/20 p-4"
      aria-label="زمان‌بندی اعلان"
    >
      <div>
        <strong>زمان‌بندی اعلان</strong>
        <p className="mt-1 text-xs text-muted-foreground">
          زمان اجرا از تاریخ فعلی موجودیت محاسبه می‌شود و بر مبنای UTC ذخیره
          خواهد شد.
        </p>
      </div>
      <FormField label="زمان ارسال">
        {(fieldProps) => (
          <NativeSelect
            {...fieldProps}
            value={custom ? "custom" : current.offsetMinutes}
            onChange={(event) => {
              const next =
                event.target.value === "custom"
                  ? -61
                  : Number(event.target.value)
              onChange({ ...current, offsetMinutes: next })
            }}
          >
            {options.suggestedOffsetsMinutes.map((offset) => (
              <option key={offset} value={offset}>
                {presets[offset] ?? `${Math.abs(offset)} دقیقه قبل`}
              </option>
            ))}
            {options.type === "RELATIVE" ? (
              <option value="custom">مقدار سفارشی</option>
            ) : null}
          </NativeSelect>
        )}
      </FormField>
      {custom ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <FormField label="مقدار">
            {(fieldProps) => (
              <Input
                {...fieldProps}
                type="number"
                min={1}
                max={525600}
                value={Math.max(
                  1,
                  Math.round(Math.abs(current.offsetMinutes) / factor)
                )}
                onChange={(event) =>
                  onChange({
                    ...current,
                    offsetMinutes:
                      -Math.max(1, Number(event.target.value) || 1) * factor,
                  })
                }
              />
            )}
          </FormField>
          <FormField label="واحد">
            {(fieldProps) => (
              <NativeSelect
                {...fieldProps}
                value={unit}
                onChange={(event) => {
                  const next = event.target.value as Unit
                  const amount = Math.max(
                    1,
                    Math.round(Math.abs(current.offsetMinutes) / factor)
                  )
                  setUnit(next)
                  onChange({
                    ...current,
                    offsetMinutes: -amount * factorOf(next),
                  })
                }}
              >
                <option value="minute">دقیقه</option>
                <option value="hour">ساعت</option>
                <option value="day">روز</option>
              </NativeSelect>
            )}
          </FormField>
        </div>
      ) : null}
      <FormField label="مهلت مجاز تأخیر (دقیقه)">
        {(fieldProps) => (
          <Input
            {...fieldProps}
            type="number"
            min={1}
            max={525600}
            value={
              current.gracePeriodMinutes ?? options.defaultGracePeriodMinutes
            }
            onChange={(event) =>
              onChange({
                ...current,
                gracePeriodMinutes: Math.max(
                  1,
                  Number(event.target.value) || 1
                ),
              })
            }
          />
        )}
      </FormField>
    </section>
  )
}
