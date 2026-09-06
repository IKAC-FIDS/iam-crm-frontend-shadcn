import { useState, type FormEvent } from "react"
import { FileText, MapPin, Share2 } from "lucide-react"
import { toast } from "sonner"

import { ResponsiveModal } from "@/components/shared/ResponsiveModal"
import { getApiErrorMessage } from "@/lib/apiResponse"
import { api } from "@/lib/api"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"

const fieldClass = "grid gap-2 text-sm font-bold"
const textAreaClass = "min-h-24 rounded-xl border border-input bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-ring"

function Actions({ pending, onClose }: { pending: boolean; onClose: () => void }) {
  return <div className="flex justify-end gap-2 border-t pt-4"><Button type="button" variant="outline" onClick={onClose} disabled={pending}>انصراف</Button><Button type="submit" disabled={pending}>{pending ? "در حال ثبت..." : "ثبت"}</Button></div>
}

export function CreateCompanyBranchDialog({ companyId, open, onClose, onCreated }: DialogProps) {
  const [pending, setPending] = useState(false)
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setPending(true)
    const form = new FormData(event.currentTarget)
    try {
      await api.post(`/companies/${companyId}/branches`, { name: value(form, "name"), city: value(form, "city"), address: value(form, "address"), phone: value(form, "phone") })
      toast.success("شعبه ثبت شد."); await onCreated(); onClose()
    } catch (error) { toast.error(getApiErrorMessage(error, "ثبت شعبه انجام نشد.")) } finally { setPending(false) }
  }
  return <ResponsiveModal open={open} onClose={onClose} title="ثبت شعبه" description="اطلاعات شعبه جدید شرکت را وارد کنید." icon={MapPin}><form className="grid gap-4" onSubmit={submit}><label className={fieldClass}>نام شعبه<Input name="name" /></label><label className={fieldClass}>شهر<Input name="city" /></label><label className={fieldClass}>نشانی<textarea name="address" className={textAreaClass} /></label><label className={fieldClass}>تلفن<Input name="phone" dir="ltr" /></label><Actions pending={pending} onClose={onClose} /></form></ResponsiveModal>
}

const platforms = ["LINKEDIN", "INSTAGRAM", "TELEGRAM", "BALE", "EITAA", "SOROUSH", "ROOBIKA", "APARAT", "YOUTUBE", "WEBSITE"] as const
export function CreateCompanySocialDialog({ companyId, open, onClose, onCreated }: DialogProps) {
  const [pending, setPending] = useState(false)
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setPending(true); const form = new FormData(event.currentTarget)
    try { await api.post(`/companies/${companyId}/social-channels`, { platform: value(form, "platform"), handle: value(form, "handle") }); toast.success("کانال اجتماعی ثبت شد."); await onCreated(); onClose() }
    catch (error) { toast.error(getApiErrorMessage(error, "ثبت کانال اجتماعی انجام نشد.")) } finally { setPending(false) }
  }
  return <ResponsiveModal open={open} onClose={onClose} title="ثبت کانال اجتماعی" description="شبکه و نشانی کانال رسمی شرکت را وارد کنید." icon={Share2}><form className="grid gap-4" onSubmit={submit}><label className={fieldClass}>شبکه<select name="platform" className="h-11 rounded-xl border border-input bg-background px-3 text-sm">{platforms.map((platform) => <option key={platform} value={platform}>{platform}</option>)}</select></label><label className={fieldClass}>شناسه یا نشانی<Input name="handle" required dir="ltr" /></label><Actions pending={pending} onClose={onClose} /></form></ResponsiveModal>
}

export function UploadCompanyLegalDocumentDialog({ companyId, open, onClose, onCreated }: DialogProps) {
  const [pending, setPending] = useState(false)
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setPending(true); const form = new FormData(event.currentTarget)
    try { await api.post(`/companies/${companyId}/legal-documents/upload`, form); toast.success("سند حقوقی ثبت شد."); await onCreated(); onClose() }
    catch (error) { toast.error(getApiErrorMessage(error, "ثبت سند حقوقی انجام نشد.")) } finally { setPending(false) }
  }
  return <ResponsiveModal open={open} onClose={onClose} title="ثبت سند حقوقی" description="مشخصات سند و فایل مربوط به شرکت را اضافه کنید." icon={FileText}><form className="grid gap-4" onSubmit={submit}><label className={fieldClass}>نوع سند<select name="type" className="h-11 rounded-xl border border-input bg-background px-3 text-sm"><option value="OFFICIAL_GAZETTE">روزنامه رسمی</option><option value="LATEST_CHANGES">آخرین تغییرات</option></select></label><label className={fieldClass}>عنوان<Input name="title" required maxLength={200} /></label><label className={fieldClass}>تاریخ سند<Input name="documentDate" type="date" /></label><label className={fieldClass}>توضیحات<textarea name="description" maxLength={2000} className={textAreaClass} /></label><label className={fieldClass}>فایل<Input name="file" type="file" required /></label><Actions pending={pending} onClose={onClose} /></form></ResponsiveModal>
}

type DialogProps = { companyId: string; open: boolean; onClose: () => void; onCreated: () => void | Promise<void> }
function value(form: FormData, key: string) { const result = String(form.get(key) ?? "").trim(); return result || undefined }
