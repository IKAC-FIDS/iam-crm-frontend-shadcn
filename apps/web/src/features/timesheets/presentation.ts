export const weekDays = [{ id: 6, label: 'شنبه' }, { id: 0, label: 'یکشنبه' }, { id: 1, label: 'دوشنبه' }, { id: 2, label: 'سه‌شنبه' }, { id: 3, label: 'چهارشنبه' }, { id: 4, label: 'پنجشنبه' }, { id: 5, label: 'جمعه' }]

export const labels: Record<string, string> = {
  REGULAR: 'کار عادی', OVERTIME: 'اضافه‌کاری', DRAFT: 'پیش‌نویس', SUBMITTED: 'در انتظار تأیید', PENDING: 'در انتظار تأیید',
  APPROVED: 'تأییدشده', REJECTED: 'ردشده', CANCELLED: 'لغوشده', ANNUAL: 'استحقاقی', SICK: 'استعلاجی', UNPAID: 'بدون حقوق', OTHER: 'سایر',
  FULL_DAY: 'روز کامل', HALF_DAY: 'نیم‌روز', HOURLY: 'ساعتی', RESUBMITTED: 'ارسال مجدد',
}
export function minutesLabel(value?: number | null) {
  if (value == null) return 'نامشخص'
  return `${Math.floor(value / 60).toLocaleString('fa-IR')}:${String(value % 60).padStart(2, '0').replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[Number(d)])}`
}
export function localDate(value: Date) { return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}` }
export function parseDate(value?: string) { return value ? new Date(`${value.slice(0, 10)}T12:00:00`) : undefined }
export function editable(status: string) { return status === 'DRAFT' || status === 'REJECTED' }
export function timeText(value?: number | null) { return value == null ? '' : `${String(Math.floor(value / 60)).padStart(2, '0')}:${String(value % 60).padStart(2, '0')}` }
export function timeMinute(value: string) { const [h, m] = value.split(':').map(Number); return h * 60 + m }
