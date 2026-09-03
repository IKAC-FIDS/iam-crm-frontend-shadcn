import { CheckCircle2, Circle, Clock3 } from "lucide-react"
import { FormSection } from "@/components/shared/FormSection"
import { TechnicalStatusBadge } from "./TechnicalPrimitives"
import { tenderPresentation } from "../presentation"
import type { Tender, TenderStatus } from "../types"

const processSteps: Array<{
  title: string
  statuses: TenderStatus[]
  description: string
  owner: string
}> = [
  { title: "ثبت و شناسایی", statuses: ["DRAFT", "IDENTIFIED"], description: "ثبت اطلاعات پایه، شرکت، مالک و مهلت‌ها", owner: "مالک مناقصه" },
  { title: "ارزیابی اولیه", statuses: ["QUALIFICATION"], description: "تصمیم شرکت، تناسب، ریسک و امکان‌پذیری", owner: "مالک / مدیر مناقصه" },
  { title: "آماده‌سازی پاسخ", statuses: ["PREPARING"], description: "ثبت الزامات، مسئول‌ها، کارها و اقلام تحویلی", owner: "تیم فنی و تجاری" },
  { title: "تأیید فنی", statuses: ["TECHNICAL_REVIEW"], description: "درخواست بازبینی و ثبت نظر فنی", owner: "بازبین فنی" },
  { title: "تأیید تجاری", statuses: ["COMMERCIAL_REVIEW"], description: "بررسی تجاری، قیمت و شرایط پیشنهاد", owner: "بازبین تجاری" },
  { title: "کنترل و ارسال", statuses: ["READY_FOR_SUBMISSION", "SUBMITTED"], description: "رفع موانع نهایی و ثبت ارسال پیشنهاد", owner: "ارسال‌کننده مجاز" },
  { title: "ارزیابی کارفرما", statuses: ["UNDER_EVALUATION", "CLARIFICATION"], description: "پیگیری نتیجه و رفت‌وبرگشت رفع ابهام", owner: "مالک مناقصه" },
  { title: "نتیجه و بایگانی", statuses: ["WON", "LOST", "CANCELLED", "ARCHIVED"], description: "ثبت نتیجه نهایی و بستن پرونده", owner: "مدیر مجاز" },
]

const nextAction: Record<TenderStatus, { title: string; description: string; href?: string }> = {
  DRAFT: { title: "اطلاعات پایه را کامل و مناقصه را شناسایی کنید", description: "شرکت، مالک، نوع مناقصه و مهلت ارسال را بررسی کنید.", href: "#tender-overview" },
  IDENTIFIED: { title: "ارزیابی اولیه را آغاز کنید", description: "تصمیم شرکت در مناقصه و نتیجه ارزیابی صلاحیت را ثبت کنید.", href: "#tender-qualification" },
  QUALIFICATION: { title: "تصمیم ارزیابی اولیه را نهایی کنید", description: "برای ادامه باید «شرکت می‌کنیم» و نتیجه «ادامه» یا «ادامه مشروط» ثبت شده باشد.", href: "#tender-qualification" },
  PREPARING: { title: "پاسخ مناقصه را آماده کنید", description: "الزامات را تفکیک و مسئول‌گذاری کنید و مدارک تحویلی لازم را متصل کنید.", href: "#tender-requirements" },
  TECHNICAL_REVIEW: { title: "تأیید فنی را دریافت کنید", description: "بازبین فنی را انتخاب کنید؛ پس از تأیید می‌توانید وارد بازبینی تجاری شوید.", href: "#tender-reviews" },
  COMMERCIAL_REVIEW: { title: "تأیید تجاری را دریافت کنید", description: "بعد از تأیید تجاری، همه موانع آمادگی ارسال را رفع کنید.", href: "#tender-reviews" },
  READY_FOR_SUBMISSION: { title: "پیشنهاد را ارسال و ثبت کنید", description: "فقط کاربر دارای دسترسی ارسال می‌تواند این مرحله را انجام دهد.", href: "#tender-readiness" },
  SUBMITTED: { title: "ورود به ارزیابی کارفرما را ثبت کنید", description: "پس از تحویل پیشنهاد، وضعیت را به «در ارزیابی» تغییر دهید." },
  UNDER_EVALUATION: { title: "نتیجه یا نیاز به رفع ابهام را ثبت کنید", description: "در صورت پرسش کارفرما وارد رفع ابهام شوید؛ در غیر این صورت نتیجه نهایی را ثبت کنید." },
  CLARIFICATION: { title: "رفع ابهام را تکمیل کنید", description: "پس از پاسخ‌گویی، مناقصه را دوباره به مرحله ارزیابی کارفرما برگردانید." },
  WON: { title: "پرونده برنده‌شده را بایگانی کنید", description: "پس از تکمیل اقدامات نهایی، پرونده را ببندید." },
  LOST: { title: "پرونده ازدست‌رفته را بایگانی کنید", description: "علت نتیجه در تاریخچه باقی می‌ماند." },
  CANCELLED: { title: "پرونده لغوشده را بایگانی کنید", description: "در صورت پایان پیگیری، پرونده را ببندید." },
  ARCHIVED: { title: "فرایند پایان یافته است", description: "این مناقصه بسته و فقط برای سوابق نگهداری می‌شود." },
}

export function TenderProcessGuide({ tender }: { tender: Tender }) {
  const currentStep = Math.max(0, processSteps.findIndex((step) => step.statuses.includes(tender.status)))
  let next = nextAction[tender.status]
  if (tender.status === "QUALIFICATION" && (tender.bidDecision === "NO_BID" || tender.qualificationDecision === "NO_GO")) {
    next = { title: "تصمیم عدم ادامه ثبت شده است", description: "برای بستن این مسیر، در بخش تغییر مرحله «لغوشده» را انتخاب و دلیل را ثبت کنید." }
  } else if (tender.status === "TECHNICAL_REVIEW" && tender.readiness?.checks.technicalReview.status === "APPROVED") {
    next = { title: "تأیید فنی کامل است؛ وارد بازبینی تجاری شوید", description: "از بخش تغییر مرحله، «بازبینی تجاری» را انتخاب کنید.", href: "#tender-reviews" }
  } else if (tender.status === "COMMERCIAL_REVIEW" && tender.readiness?.checks.commercialReview.status === "APPROVED") {
    next = tender.readiness.overallReady
      ? { title: "همه کنترل‌ها کامل است؛ مناقصه را آماده ارسال کنید", description: "از بخش تغییر مرحله، «آماده ارسال» را انتخاب کنید.", href: "#tender-readiness" }
      : { title: "تأیید تجاری کامل است؛ موانع باقی‌مانده را رفع کنید", description: "فهرست دقیق موارد ناقص در بخش آمادگی ارسال نمایش داده شده است.", href: "#tender-readiness" }
  }
  const cancelled = tender.status === "CANCELLED" || tender.result === "CANCELLED"

  return (
    <FormSection title="مسیر عملیاتی مناقصه" description="مرحله فعلی، مسئول هر گام و اقدام پیشنهادی بعدی را اینجا ببینید.">
      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold text-muted-foreground">اقدام پیشنهادی بعدی</p>
            <p className="mt-1 font-black text-[var(--app-heading)]">{next.title}</p>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">{next.description}</p>
          </div>
          {next.href ? <a href={next.href} className="inline-flex h-9 items-center rounded-xl border border-primary/20 bg-background px-3 text-xs font-bold text-primary hover:bg-primary/5">رفتن به بخش مرتبط</a> : null}
        </div>
      </div>
      <ol className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {processSteps.map((step, index) => {
          const current = index === currentStep
          const complete = !cancelled && (index < currentStep || tender.status === "ARCHIVED")
          return <li key={step.title} className={`rounded-2xl border p-4 ${current ? "border-primary bg-primary/5 ring-1 ring-primary/20" : complete ? "border-emerald-200 bg-emerald-50/40 dark:bg-emerald-950/10" : "bg-background"}`}>
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-muted-foreground">گام {(index + 1).toLocaleString("fa-IR")}</span>
              {current ? <Clock3 className="size-4 text-primary" aria-label="مرحله فعلی" /> : complete ? <CheckCircle2 className="size-4 text-emerald-600" aria-label="انجام‌شده" /> : <Circle className="size-4 text-muted-foreground" aria-label="در انتظار" />}
            </div>
            <h3 className="mt-2 text-sm font-black">{step.title}</h3>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">{step.description}</p>
            <p className="mt-3 text-xs"><span className="text-muted-foreground">مسئول: </span><b>{step.owner}</b></p>
            {current ? <div className="mt-3"><TechnicalStatusBadge status={tender.status} presentation={tenderPresentation} /></div> : null}
          </li>
        })}
      </ol>
      <p className="mt-4 text-xs leading-6 text-muted-foreground">لغو مناقصه تا پیش از ثبت نتیجه امکان‌پذیر است. بازگشت به مرحله قبل فقط برای اصلاح انجام می‌شود و ثبت دلیل الزامی است.</p>
    </FormSection>
  )
}
