import { Plus, Trash2 } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import type { NotificationConditionFieldDefinition, NotificationConditionLeaf, NotificationConditionOperator, NotificationRuleConditions } from "../types/rule-engine.types"

const operatorLabels: Record<NotificationConditionOperator, string> = {
  EQ: "برابر است", NEQ: "برابر نیست", IN: "یکی از موارد است", NOT_IN: "هیچ‌کدام از موارد نیست",
  EXISTS: "مقدار دارد", NOT_EXISTS: "مقدار ندارد", GT: "بزرگ‌تر از", GTE: "بزرگ‌تر یا مساوی",
  LT: "کوچک‌تر از", LTE: "کوچک‌تر یا مساوی",
}

function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/20" />
}

export function RuleConditionBuilder({ fields, value, onChange }: { fields: NotificationConditionFieldDefinition[]; value: NotificationRuleConditions | null; onChange: (value: NotificationRuleConditions | null) => void }) {
  const leaves = (value?.conditions ?? []).filter((item): item is NotificationConditionLeaf => "field" in item)
  const hasNested = Boolean(value?.conditions.some(item => "logic" in item))
  const setLeaves = (items: NotificationConditionLeaf[]) => onChange(items.length ? { version: 1, logic: "AND", conditions: items } : null)
  const add = () => {
    const field = fields[0]
    if (!field) return
    setLeaves([...leaves, { field: field.field, operator: field.operators[0] ?? "EQ", value: field.values?.[0] ?? "" }])
  }
  const update = (index: number, next: NotificationConditionLeaf) => setLeaves(leaves.map((item, itemIndex) => itemIndex === index ? next : item))

  return <section className="grid gap-3 rounded-2xl border bg-muted/20 p-4">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div><strong>شرایط اجرای قانون</strong><p className="mt-1 text-xs text-muted-foreground">شرط‌ها با منطق «و» بررسی می‌شوند؛ بدون شرط، قانون برای همه رویدادهای این نوع اجرا می‌شود.</p></div>
      <Button type="button" variant="outline" size="sm" onClick={add} disabled={!fields.length || hasNested}><Plus className="size-4" /> افزودن شرط</Button>
    </div>
    {hasNested ? <div className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900">این قانون دارای گروه‌های تو‌در‌تو است. ویرایش گروه‌های AND/OR از طریق API پشتیبانی می‌شود؛ برای جلوگیری از حذف ناخواسته، ابتدا شرایط را پاک یا با ساختار ساده جایگزین کنید.</div> : null}
    {!leaves.length && !hasNested ? <div className="rounded-xl border border-dashed p-3 text-sm text-muted-foreground">برای تمام رویدادهای این نوع اجرا شود</div> : null}
    {leaves.map((condition, index) => {
      const definition = fields.find(item => item.field === condition.field) ?? fields[0]
      if (!definition) return null
      const noValue = condition.operator === "EXISTS" || condition.operator === "NOT_EXISTS"
      const isSet = condition.operator === "IN" || condition.operator === "NOT_IN"
      const displayValue = Array.isArray(condition.value) ? condition.value.join(", ") : String(condition.value ?? "")
      return <div key={`${condition.field}-${index}`} className="grid gap-2 rounded-xl border bg-background p-3 md:grid-cols-[1.2fr_1fr_1.2fr_auto]">
        <label className="grid gap-1 text-xs"><span>فیلد</span><Select value={condition.field} onChange={event => { const field = fields.find(item => item.field === event.target.value)!; update(index, { field: field.field, operator: field.operators[0] ?? "EQ", value: field.values?.[0] ?? "" }) }}>{fields.map(field => <option key={field.field} value={field.field}>{field.label}</option>)}</Select></label>
        <label className="grid gap-1 text-xs"><span>عملگر</span><Select value={condition.operator} onChange={event => { const operator = event.target.value as NotificationConditionOperator; update(index, { ...condition, operator, ...((operator === "EXISTS" || operator === "NOT_EXISTS") ? { value: undefined } : { value: condition.value ?? definition.values?.[0] ?? "" }) }) }}>{definition.operators.map(operator => <option key={operator} value={operator}>{operatorLabels[operator]}</option>)}</Select></label>
        <label className="grid gap-1 text-xs"><span>مقدار</span>{noValue ? <div className="flex h-10 items-center rounded-xl border border-dashed px-3 text-muted-foreground">نیازی به مقدار ندارد</div> : definition.values && !isSet ? <Select value={displayValue} onChange={event => update(index, { ...condition, value: event.target.value })}>{definition.values.map(option => <option key={option} value={option}>{option}</option>)}</Select> : <Input type={definition.type === "number" && !isSet ? "number" : "text"} value={displayValue} placeholder={isSet ? "مقادیر را با ویرگول جدا کنید" : "مقدار"} onChange={event => update(index, { ...condition, value: isSet ? event.target.value.split(",").map(item => definition.type === "number" ? Number(item.trim()) : item.trim()).filter(item => item !== "") : definition.type === "number" ? Number(event.target.value) : event.target.value })} />}</label>
        <Button type="button" variant="ghost" size="icon" className="self-end text-destructive" aria-label="حذف شرط" onClick={() => setLeaves(leaves.filter((_, itemIndex) => itemIndex !== index))}><Trash2 className="size-4" /></Button>
      </div>
    })}
    {hasNested ? <Button type="button" variant="outline" size="sm" className="w-fit" onClick={() => onChange(null)}>پاک‌کردن همه شرایط</Button> : null}
  </section>
}
