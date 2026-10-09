import { useMutation } from "@tanstack/react-query"
import {
  BadgeCheck,
  Building2,
  CalendarDays,
  ExternalLink,
  FileCheck2,
  Fingerprint,
  Globe2,
  Landmark,
  LoaderCircle,
  Mail,
  MapPin,
  Phone,
  Search,
  ShieldCheck,
  Signature,
  UserRound,
  UsersRound,
} from "lucide-react"
import { useState, type ReactNode } from "react"

import { DialogHeroHeader } from "@/components/shared/DialogHeroHeader"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { getApiErrorMessage } from "@/lib/apiResponse"
import { formatJalaliDate } from "@/lib/date/jalali"
import { Button } from "@workspace/ui/components/button"
import { Dialog, DialogContent } from "@workspace/ui/components/dialog"
import { Input } from "@workspace/ui/components/input"

import { lookupCompanyRegistry } from "../api/companies.api"
import type {
  CompanyRegistryLicense,
  CompanyRegistryLookupResult,
  CompanyRegistryPerson,
} from "../types/company.types"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const communicationLabels: Record<string, string> = {
  PhoneNumber: "تلفن",
  Email: "ایمیل",
  Website: "وب‌سایت",
}

export function CompanyRegistryLookupDialog({ open, onOpenChange }: Props) {
  const [nationalId, setNationalId] = useState("")
  const [validationError, setValidationError] = useState<string>()
  const lookup = useMutation({ mutationFn: lookupCompanyRegistry })

  function changeOpen(nextOpen: boolean) {
    if (!nextOpen) {
      setNationalId("")
      setValidationError(undefined)
      lookup.reset()
    }
    onOpenChange(nextOpen)
  }

  function submit() {
    const normalized = normalizeDigits(nationalId)
    if (!/^\d{11}$/.test(normalized)) {
      setValidationError("شناسه ملی شرکت باید دقیقاً ۱۱ رقم باشد.")
      return
    }
    setNationalId(normalized)
    setValidationError(undefined)
    lookup.mutate(normalized)
  }

  return (
    <Dialog open={open} onOpenChange={changeOpen}>
      <DialogContent
        showCloseButton={false}
        dir="rtl"
        className="grid max-h-[94dvh] w-[calc(100%-1rem)] grid-rows-[auto_minmax(0,1fr)] gap-0 overflow-hidden rounded-[var(--app-radius-hero)] p-0 sm:max-w-none lg:w-[min(92vw,78rem)]"
        style={{ maxWidth: "78rem" }}
      >
        <DialogHeroHeader
          title="استعلام جامع شرکت"
          description="اطلاعات ثبتی، ارتباطی، اعضا و مجوزهای شرکت را با شناسه ملی مشاهده کنید."
          icon={Fingerprint}
          onClose={() => changeOpen(false)}
        />

        <div className="min-h-0 overflow-y-auto bg-[var(--app-background)]/35 p-4 sm:p-6">
          <form
            className="mx-auto flex max-w-3xl flex-col gap-3 rounded-2xl border border-[var(--app-divider)] bg-[var(--app-surface)] p-3 shadow-sm sm:flex-row sm:items-start"
            onSubmit={(event) => {
              event.preventDefault()
              submit()
            }}
          >
            <div className="min-w-0 flex-1">
              <label htmlFor="registry-national-id" className="mb-2 block text-xs font-bold text-[var(--app-heading)]">
                شناسه ملی شرکت
              </label>
              <Input
                id="registry-national-id"
                inputMode="numeric"
                autoComplete="off"
                value={nationalId}
                onChange={(event) => setNationalId(event.target.value)}
                placeholder="مثلاً 10102618518"
                dir="ltr"
                aria-invalid={Boolean(validationError)}
                className="h-11 rounded-xl text-start"
              />
              {validationError ? <p className="mt-1.5 text-xs text-[var(--destructive)]">{validationError}</p> : null}
            </div>
            <Button type="submit" className="h-11 rounded-xl sm:mt-7" disabled={lookup.isPending}>
              {lookup.isPending ? <LoaderCircle className="size-4 animate-spin" /> : <Search className="size-4" />}
              {lookup.isPending ? "در حال استعلام…" : "استعلام شرکت"}
            </Button>
          </form>

          {lookup.isError ? (
            <div role="alert" className="mx-auto mt-4 max-w-3xl rounded-2xl border border-[var(--destructive)]/25 bg-[var(--destructive-soft)] p-4 text-sm text-[var(--destructive)]">
              {getApiErrorMessage(lookup.error, "دریافت اطلاعات شرکت انجام نشد؛ دوباره تلاش کنید.")}
            </div>
          ) : null}

          {lookup.data ? <RegistryResult data={lookup.data} /> : !lookup.isPending ? <LookupIntro /> : null}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function LookupIntro() {
  return (
    <div className="mx-auto mt-8 grid max-w-3xl place-items-center rounded-3xl border border-dashed border-[var(--app-divider)] px-6 py-12 text-center">
      <div className="grid size-14 place-items-center rounded-2xl bg-[var(--app-primary-soft)] text-[var(--app-primary)]">
        <Building2 className="size-7" />
      </div>
      <h3 className="mt-4 text-base font-black text-[var(--app-heading)]">شناسه ملی شرکت را وارد کنید</h3>
      <p className="mt-2 max-w-lg text-sm leading-7 text-[var(--app-text-secondary)]">
        نتیجه استعلام شامل اطلاعات ثبتی، راه‌های ارتباطی، مدیرعامل، اعضای شرکت و مجوزهای ثبت‌شده خواهد بود.
      </p>
    </div>
  )
}

function RegistryResult({ data }: { data: CompanyRegistryLookupResult }) {
  const active = data.activityStatus === "ACTIVE"
  const people = uniquePeople(data.people ?? [])
  const communication = data.communications ?? []

  return (
    <div className="mt-5 grid gap-4">
      <section className="relative overflow-hidden rounded-3xl border border-[var(--app-divider)] bg-[var(--app-surface)] p-5 shadow-sm sm:p-6">
        <div className="pointer-events-none absolute inset-y-0 end-0 w-56 bg-gradient-to-l from-[var(--app-primary-soft)]/80 to-transparent" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <div className="grid size-16 shrink-0 place-items-center rounded-2xl border border-[var(--app-primary)]/20 bg-[var(--app-primary-soft)] text-[var(--app-primary)]">
              <Building2 className="size-8" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-black text-[var(--app-heading)] sm:text-2xl">{data.legalName || "شرکت بدون نام"}</h2>
                <StatusBadge tone={active ? "success" : "neutral"} dot>
                  {active ? "فعال" : data.activityStatus === "INACTIVE" ? "غیرفعال" : "وضعیت نامشخص"}
                </StatusBadge>
                {data.cache?.hit ? <StatusBadge tone="info" dot={false}>از اطلاعات ذخیره‌شده</StatusBadge> : null}
              </div>
              <p className="mt-2 text-sm text-[var(--app-text-secondary)]">{data.companyType || "نوع شرکت ثبت نشده"}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            <Stat label="شناسه ملی" value={data.nationalId} />
            <Stat label="شماره ثبت" value={data.registrationNumber} />
            <Stat label="سرمایه ثبتی" value={formatMoney(data.registeredCapital)} />
          </div>
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-2">
        <Section title="اطلاعات ثبتی و حقوقی" icon={Landmark}>
          <InfoGrid items={[
            ["نام حقوقی", data.legalName],
            ["نام تجاری", data.brandName],
            ["شناسه ملی", data.nationalId],
            ["شماره ثبت", data.registrationNumber],
            ["کد اقتصادی", data.economicCode],
            ["تاریخ ثبت", displayDate(data.establishmentDate)],
            ["نوع شرکت", data.companyType],
            ["سرمایه ثبتی", formatMoney(data.registeredCapital)],
            ["واحد ثبت", data.registrationUnit],
            ["مرجع ثبت", data.registrationOrganization],
          ]} />
        </Section>

        <Section title="نشانی و راه‌های ارتباطی" icon={MapPin}>
          <InfoGrid items={[
            ["استان", data.province],
            ["شهر", data.city || data.headOfficeCity],
            ["کد پستی", data.postalCode],
            ["تلفن مرکزی", data.centralPhone],
            ["ایمیل", data.publicEmail],
            ["وب‌سایت", data.website],
            ["مختصات", data.latitude != null && data.longitude != null ? `${data.latitude}, ${data.longitude}` : undefined],
            ["نشانی کامل", data.headOfficeAddress],
          ]} />
          {communication.length ? (
            <div className="mt-4 flex flex-wrap gap-2 border-t border-[var(--app-divider)] pt-4">
              {communication.map((item, index) => <CommunicationChip key={`${item.type}-${item.value}-${index}`} type={item.type} value={item.value} />)}
            </div>
          ) : null}
        </Section>
      </div>

      {data.activityDescription || data.signatureAuthority ? (
        <div className="grid gap-4 xl:grid-cols-2">
          <Section title="موضوع فعالیت شرکت" icon={FileCheck2}>
            <p className="text-sm leading-8 text-[var(--app-text-secondary)]">{data.activityDescription || "—"}</p>
          </Section>
          <Section title="صاحبان امضای مجاز" icon={Signature}>
            <p className="text-sm leading-8 text-[var(--app-text-secondary)]">{data.signatureAuthority || "—"}</p>
          </Section>
        </div>
      ) : null}

      {data.director || people.length ? (
        <Section title={`مدیرعامل و اعضای شرکت (${people.length.toLocaleString("fa-IR")})`} icon={UsersRound}>
          {data.director ? <DirectorCard person={data.director} /> : null}
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {people.map((person) => <PersonCard key={`${person.nationalCode}-${person.fullName}`} person={person} />)}
          </div>
        </Section>
      ) : null}

      {data.licenses?.length ? (
        <Section title={`مجوزها و گواهی‌ها (${data.licenses.length.toLocaleString("fa-IR")})`} icon={ShieldCheck}>
          <div className="grid gap-3 lg:grid-cols-2">
            {data.licenses.map((license, index) => <LicenseCard key={`${license.licenseTypeID}-${index}`} license={license} />)}
          </div>
        </Section>
      ) : null}
    </div>
  )
}

function Section({ title, icon: Icon, children }: { title: string; icon: typeof Building2; children: ReactNode }) {
  return (
    <section className="rounded-3xl border border-[var(--app-divider)] bg-[var(--app-surface)] p-4 shadow-sm sm:p-5">
      <div className="mb-4 flex items-center gap-3 border-b border-[var(--app-divider)] pb-3">
        <span className="grid size-10 place-items-center rounded-xl bg-[var(--app-primary-soft)] text-[var(--app-primary)]"><Icon className="size-5" /></span>
        <h3 className="text-sm font-black text-[var(--app-heading)]">{title}</h3>
      </div>
      {children}
    </section>
  )
}

function InfoGrid({ items }: { items: Array<[string, ReactNode | undefined | null]> }) {
  const visible = items.filter(([, value]) => value !== undefined && value !== null && value !== "")
  return <dl className="grid gap-x-5 gap-y-4 sm:grid-cols-2">{visible.map(([label, value]) => <div key={label} className={label.includes("نشانی") || label.includes("واحد ثبت") || label.includes("مرجع ثبت") ? "sm:col-span-2" : ""}><dt className="text-xs text-[var(--app-text-secondary)]">{label}</dt><dd className="mt-1 break-words text-sm font-bold text-[var(--app-heading)]">{value}</dd></div>)}</dl>
}

function Stat({ label, value }: { label: string; value?: ReactNode }) {
  return <div className="min-w-32 rounded-xl border border-[var(--app-divider)] bg-[var(--app-background)]/75 px-3 py-2"><p className="text-[11px] text-[var(--app-text-secondary)]">{label}</p><p className="mt-1 truncate text-xs font-black text-[var(--app-heading)]" dir={label.includes("شناسه") || label.includes("ثبت") ? "ltr" : undefined}>{value || "—"}</p></div>
}

function CommunicationChip({ type, value }: { type: string; value: string }) {
  const Icon = type === "Email" ? Mail : type === "Website" ? Globe2 : Phone
  const external = type === "Website"
  const href = type === "Email" ? `mailto:${value}` : type === "PhoneNumber" ? `tel:${value}` : external ? (/^https?:\/\//.test(value) ? value : `https://${value}`) : undefined
  const content = <><Icon className="size-3.5 text-[var(--app-primary)]" /><span className="text-[11px] text-[var(--app-text-secondary)]">{communicationLabels[type] || type}</span><strong dir="ltr" className="text-xs">{value}</strong>{external ? <ExternalLink className="size-3" /> : null}</>
  return href ? <a href={href} target={external ? "_blank" : undefined} rel={external ? "noreferrer" : undefined} className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--app-divider)] px-2.5 py-2 hover:border-[var(--app-primary)]/40">{content}</a> : <span className="inline-flex items-center gap-1.5 rounded-xl border px-2.5 py-2">{content}</span>
}

function DirectorCard({ person }: { person: CompanyRegistryPerson }) {
  return <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-[var(--app-primary)]/20 bg-[var(--app-primary-soft)]/35 p-4"><span className="grid size-11 place-items-center rounded-xl bg-[var(--app-primary)] text-white"><UserRound className="size-5" /></span><div><p className="text-sm font-black text-[var(--app-heading)]">{person.fullName}</p><p className="mt-1 text-xs text-[var(--app-text-secondary)]">{person.postDescription || "مدیرعامل"}</p></div><StatusBadge className="me-auto" tone="info" dot={false}>مدیرعامل</StatusBadge></div>
}

function PersonCard({ person }: { person: CompanyRegistryPerson }) {
  return <article className="rounded-2xl border border-[var(--app-divider)] bg-[var(--app-background)]/55 p-4"><div className="flex items-start gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[var(--app-primary-soft)] text-[var(--app-primary)]"><UserRound className="size-5" /></span><div className="min-w-0"><h4 className="truncate text-sm font-black text-[var(--app-heading)]">{person.fullName}</h4><p className="mt-1 text-xs text-[var(--app-text-secondary)]">{person.postDescription || person.postCategoryTitle || "عضو شرکت"}</p></div></div><div className="mt-3 flex flex-wrap gap-2"><StatusBadge tone={person.active === false ? "neutral" : "success"} dot>{person.active === false ? "غیرفعال" : "فعال"}</StatusBadge>{person.personTypeDescription ? <StatusBadge tone="secondary" dot={false}>{person.personTypeDescription}</StatusBadge> : null}{person.representedOrganizationName ? <StatusBadge tone="info" dot={false}>نماینده {person.representedOrganizationName}</StatusBadge> : null}</div>{person.nationalCode ? <p className="mt-3 text-xs text-[var(--app-text-secondary)]">کد ملی: <b dir="ltr" className="text-[var(--app-heading)]">{person.nationalCode}</b></p> : null}</article>
}

function LicenseCard({ license }: { license: CompanyRegistryLicense }) {
  const details = license.detail ?? []
  return <article className="rounded-2xl border border-[var(--app-divider)] bg-[var(--app-background)]/55 p-4"><div className="flex items-start gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[var(--success-light)] text-[var(--success)]"><BadgeCheck className="size-5" /></span><div className="min-w-0"><h4 className="text-sm font-black leading-6 text-[var(--app-heading)]">{license.licenseTypeDescription || "مجوز شرکت"}</h4><p className="mt-1 text-xs text-[var(--app-text-secondary)]">{license.sourceDescription || "مرجع صدور نامشخص"}</p></div></div><div className="mt-3 grid gap-3">{details.map((detail, index) => <div key={index} className="rounded-xl border border-[var(--app-divider)] p-3"><div className="flex flex-wrap items-center gap-2"><StatusBadge tone={detail.certificateStatus === "معتبر" ? "success" : "warning"} dot>{detail.certificateStatus || "نامشخص"}</StatusBadge><span className="inline-flex items-center gap-1 text-xs text-[var(--app-text-secondary)]"><CalendarDays className="size-3.5" />{displayDate(detail.issueDate)} تا {displayDate(detail.expireDate)}</span></div>{detail.metaData?.length ? <dl className="mt-3 grid gap-2 sm:grid-cols-2">{detail.metaData.map((meta, metaIndex) => <div key={`${meta.fieldId}-${metaIndex}`}><dt className="text-[11px] text-[var(--app-text-secondary)]">{meta.fieldName}</dt><dd className="mt-0.5 break-words text-xs font-bold text-[var(--app-heading)]">{meta.value || "—"}</dd></div>)}</dl> : null}</div>)}</div></article>
}

function uniquePeople(people: CompanyRegistryPerson[]) {
  const result = new Map<string, CompanyRegistryPerson>()
  for (const person of people) {
    const key = person.nationalCode || person.fullName
    const current = result.get(key)
    if (!current) result.set(key, person)
    else result.set(key, { ...current, postDescription: [...new Set([current.postDescription, person.postDescription].filter(Boolean))].join("، ") })
  }
  return [...result.values()]
}

function displayDate(value?: string) {
  if (!value) return "—"
  const us = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/)
  const normalized = us ? `${us[3]}-${us[1].padStart(2, "0")}-${us[2].padStart(2, "0")}` : value
  return formatJalaliDate(normalized) || value
}

function formatMoney(value?: string) {
  if (!value) return undefined
  const amount = Number(value)
  return Number.isFinite(amount) ? `${amount.toLocaleString("fa-IR")} ریال` : value
}

function normalizeDigits(value: string) {
  return value.replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit))).replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit))).replace(/\D/g, "")
}
