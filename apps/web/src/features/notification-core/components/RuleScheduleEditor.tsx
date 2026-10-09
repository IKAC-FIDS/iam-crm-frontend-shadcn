import { useState } from "react"
import { Input } from "@workspace/ui/components/input"
import type { NotificationScheduleEventDefinition, NotificationScheduleInput } from "../types/rule-engine.types"

const presets: Record<number, string> = { [-10080]: "۷ روز قبل", [-1440]: "۱ روز قبل", [-120]: "۲ ساعت قبل", [-60]: "۱ ساعت قبل", [-30]: "۳۰ دقیقه قبل", [-15]: "۱۵ دقیقه قبل", 0: "در زمان سررسید / پس از سررسید" }
type Unit = "minute" | "hour" | "day"
const factorOf = (unit: Unit) => unit === "day" ? 1440 : unit === "hour" ? 60 : 1

export function RuleScheduleEditor({ definition, value, onChange }: { definition?: NotificationScheduleEventDefinition; value: NotificationScheduleInput | null; onChange: (value: NotificationScheduleInput | null) => void }) {
  const [unit, setUnit] = useState<Unit>("minute")
  if (!definition) return null
  const options = definition.scheduleOptions
  const current = value ?? { enabled: true, type: options.type, sourceField: options.sourceField, triggerMode: options.triggerModes[0]!, offsetMinutes: options.suggestedOffsetsMinutes[0] ?? 0, gracePeriodMinutes: options.defaultGracePeriodMinutes }
  const custom = !options.suggestedOffsetsMinutes.includes(current.offsetMinutes)
  const factor = factorOf(unit)
  return (
    <section className="grid gap-4 rounded-2xl border bg-muted/20 p-4" aria-label="زمان‌بندی اعلان">
      <div><strong>زمان‌بندی اعلان</strong><p className="mt-1 text-xs text-muted-foreground">زمان اجرا از تاریخ فعلی موجودیت محاسبه می‌شود و بر مبنای UTC ذخیره خواهد شد.</p></div>
      <label className="grid gap-2 text-sm"><span>زمان ارسال</span>
        <select className="h-10 rounded-xl border bg-background px-3" value={custom ? "custom" : current.offsetMinutes} onChange={(event) => { const next = event.target.value === "custom" ? -61 : Number(event.target.value); onChange({ ...current, offsetMinutes: next }) }}>
          {options.suggestedOffsetsMinutes.map(offset => <option key={offset} value={offset}>{presets[offset] ?? `${Math.abs(offset)} دقیقه قبل`}</option>)}
          {options.type === "RELATIVE" ? <option value="custom">مقدار سفارشی</option> : null}
        </select>
      </label>
      {custom ? <div className="grid gap-3 sm:grid-cols-2"><label className="grid gap-2 text-sm"><span>مقدار</span><Input type="number" min={1} max={525600} value={Math.max(1, Math.round(Math.abs(current.offsetMinutes) / factor))} onChange={event => onChange({ ...current, offsetMinutes: -Math.max(1, Number(event.target.value) || 1) * factor })} /></label><label className="grid gap-2 text-sm"><span>واحد</span><select className="h-10 rounded-xl border bg-background px-3" value={unit} onChange={event => { const next = event.target.value as Unit; const amount = Math.max(1, Math.round(Math.abs(current.offsetMinutes) / factor)); setUnit(next); onChange({ ...current, offsetMinutes: -amount * factorOf(next) }) }}><option value="minute">دقیقه</option><option value="hour">ساعت</option><option value="day">روز</option></select></label></div> : null}
      <label className="grid gap-2 text-sm"><span>مهلت مجاز تأخیر (دقیقه)</span><Input type="number" min={1} max={525600} value={current.gracePeriodMinutes ?? options.defaultGracePeriodMinutes} onChange={event => onChange({ ...current, gracePeriodMinutes: Math.max(1, Number(event.target.value) || 1) })} /></label>
    </section>
  )
}
