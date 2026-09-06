import { useEffect, useState, type FormEvent } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Mail, Save, Send, Server, ShieldCheck } from "lucide-react"
import { toast } from "sonner"

import { PageHero } from "@/components/shared/PageHero"
import { FormSection } from "@/components/shared/FormSection"
import { QueryContent } from "@/components/shared/QueryContent"
import { getApiErrorMessage } from "@/lib/apiResponse"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { getEmailSettings, sendTestEmail, updateEmailSettings, type EmailSettingsPayload } from "../api/emailSettingsApi"

const key = ["admin-email-settings"] as const
const fieldClass = "grid gap-2 text-sm font-bold"

export function AdminEmailSettingsPage() {
  const client = useQueryClient()
  const query = useQuery({ queryKey: key, queryFn: getEmailSettings })
  const [form, setForm] = useState<EmailSettingsPayload>({ enabled: false, host: "", port: 465, secure: true, username: "", fromEmail: "", fromName: "", replyTo: "" })
  const [testTo, setTestTo] = useState("")
  useEffect(() => { if (query.data) setForm({ enabled: query.data.enabled, host: query.data.host, port: query.data.port, secure: query.data.secure, username: query.data.username, fromEmail: query.data.fromEmail, fromName: query.data.fromName, replyTo: query.data.replyTo }) }, [query.data])
  const save = useMutation({ mutationFn: updateEmailSettings, onSuccess: async () => { toast.success("تنظیمات ایمیل ذخیره شد."); await client.invalidateQueries({ queryKey: key }) }, onError: (error) => toast.error(getApiErrorMessage(error, "ذخیره تنظیمات انجام نشد.")) })
  const test = useMutation({ mutationFn: sendTestEmail, onSuccess: () => toast.success("ایمیل آزمایشی ارسال شد."), onError: (error) => toast.error(getApiErrorMessage(error, "ارسال ایمیل آزمایشی انجام نشد.")) })
  const set = <K extends keyof EmailSettingsPayload>(name: K, value: EmailSettingsPayload[K]) => setForm((current) => ({ ...current, [name]: value }))
  function submit(event: FormEvent) { event.preventDefault(); save.mutate(form) }

  return <div className="grid gap-5" dir="rtl">
    <PageHero title="تنظیمات سرویس ایمیل" description="اتصال SMTP، هویت فرستنده و ارسال آزمایشی ایمیل‌های سامانه" accessBadge={{ label: "مدیریت", icon: Mail }} backFallback="/dashboard" onRefresh={async () => { await query.refetch() }} refreshing={query.isFetching} />
    <QueryContent query={query} errorTitle="دریافت تنظیمات ایمیل ناموفق بود">
      <form className="grid gap-5" onSubmit={submit}>
        <FormSection title={<span className="flex items-center gap-2"><Server className="size-5" />اتصال SMTP</span>} description="اطلاعات اتصال ارائه‌دهنده ایمیل را وارد کنید.">
          <div className="grid gap-4 p-5 sm:grid-cols-2">
            <label className={fieldClass}>آدرس سرور<Input value={form.host} onChange={(e) => set("host", e.target.value)} required placeholder="smtp.example.com" dir="ltr" /></label>
            <label className={fieldClass}>پورت<Input type="number" min={1} max={65535} value={form.port} onChange={(e) => set("port", Number(e.target.value))} required dir="ltr" /></label>
            <label className={fieldClass}>نام کاربری<Input value={form.username} onChange={(e) => set("username", e.target.value)} dir="ltr" autoComplete="username" /></label>
            <label className={fieldClass}>رمز عبور<Input type="password" value={form.password ?? ""} onChange={(e) => set("password", e.target.value || undefined)} dir="ltr" autoComplete="new-password" placeholder={query.data?.hasPassword ? "برای حفظ رمز فعلی خالی بگذارید" : "رمز SMTP"} /></label>
            <label className="flex items-center gap-2 text-sm font-bold"><input type="checkbox" checked={form.secure} onChange={(e) => set("secure", e.target.checked)} /> اتصال امن SSL/TLS</label>
            <label className="flex items-center gap-2 text-sm font-bold"><input type="checkbox" checked={form.enabled} onChange={(e) => set("enabled", e.target.checked)} /> فعال‌سازی ارسال ایمیل</label>
          </div>
        </FormSection>
        <FormSection title={<span className="flex items-center gap-2"><ShieldCheck className="size-5" />هویت فرستنده</span>} description="این مشخصات در ایمیل‌های خروجی نمایش داده می‌شود.">
          <div className="grid gap-4 p-5 sm:grid-cols-2"><label className={fieldClass}>ایمیل فرستنده<Input type="email" value={form.fromEmail} onChange={(e) => set("fromEmail", e.target.value)} required dir="ltr" /></label><label className={fieldClass}>نام فرستنده<Input value={form.fromName} onChange={(e) => set("fromName", e.target.value)} /></label><label className={`${fieldClass} sm:col-span-2`}>Reply-To<Input type="email" value={form.replyTo} onChange={(e) => set("replyTo", e.target.value)} dir="ltr" /></label></div>
        </FormSection>
        <Button type="submit" className="justify-self-end" disabled={save.isPending}><Save className="size-4" />{save.isPending ? "در حال ذخیره..." : "ذخیره تنظیمات"}</Button>
      </form>
      <FormSection title={<span className="flex items-center gap-2"><Send className="size-5" />ارسال آزمایشی</span>} description="پس از ذخیره و فعال‌سازی، یک ایمیل برای بررسی اتصال ارسال کنید.">
        <div className="flex flex-col gap-3 p-5 sm:flex-row"><Input type="email" value={testTo} onChange={(e) => setTestTo(e.target.value)} placeholder="recipient@example.com" dir="ltr" /><Button type="button" disabled={!testTo || test.isPending || !query.data?.enabled} onClick={() => test.mutate(testTo)}><Send className="size-4" />ارسال آزمایشی</Button></div>
      </FormSection>
    </QueryContent>
  </div>
}
