import { useMutation } from "@tanstack/react-query"
import {
  Building2,
  CalendarDays,
  Fingerprint,
  History,
  LoaderCircle,
  Search,
  UserRoundSearch,
} from "lucide-react"
import { useState } from "react"

import { DialogHeroHeader } from "@/components/shared/DialogHeroHeader"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { getApiErrorMessage } from "@/lib/apiResponse"
import { formatJalaliDate } from "@/lib/date/jalali"
import { Button } from "@workspace/ui/components/button"
import { Dialog, DialogContent } from "@workspace/ui/components/dialog"
import { Input } from "@workspace/ui/components/input"

import { lookupPersonCompanies } from "../api/companies.api"
import type { PersonCompanyLookupResult, PersonCompanyRole } from "../types/company.types"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type CompanyGroup = {
  nationalCode: string
  name: string
  roles: PersonCompanyRole[]
}

export function PersonCompanyLookupDialog({ open, onOpenChange }: Props) {
  const [nationalCode, setNationalCode] = useState("")
  const [validationError, setValidationError] = useState<string>()
  const lookup = useMutation({ mutationFn: lookupPersonCompanies })

  function changeOpen(nextOpen: boolean) {
    if (!nextOpen) {
      setNationalCode("")
      setValidationError(undefined)
      lookup.reset()
    }
    onOpenChange(nextOpen)
  }

  function submit() {
    const normalized = normalizeDigits(nationalCode)
    if (!/^\d{10}$/.test(normalized)) {
      setValidationError("کد ملی شخص باید دقیقاً ۱۰ رقم باشد.")
      return
    }
    setNationalCode(normalized)
    setValidationError(undefined)
    lookup.mutate(normalized)
  }

  return (
    <Dialog open={open} onOpenChange={changeOpen}>
      <DialogContent
        showCloseButton={false}
        dir="rtl"
        className="grid max-h-[94dvh] w-[calc(100%-1rem)] grid-rows-[auto_minmax(0,1fr)] gap-0 overflow-hidden rounded-[var(--app-radius-hero)] p-0 sm:max-w-none lg:w-[min(90vw,68rem)]"
        style={{ maxWidth: "68rem" }}
      >
        <DialogHeroHeader
          title="استعلام شرکت‌های یک شخص"
          description="سمت‌های فعلی و سوابق حضور شخص در شرکت‌ها را با کد ملی مشاهده کنید."
          icon={UserRoundSearch}
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
              <label htmlFor="person-national-code" className="mb-2 block text-xs font-bold text-[var(--app-heading)]">
                کد ملی شخص
              </label>
              <Input
                id="person-national-code"
                inputMode="numeric"
                autoComplete="off"
                value={nationalCode}
                onChange={(event) => setNationalCode(event.target.value)}
                placeholder="مثلاً 0079474871"
                dir="ltr"
                aria-invalid={Boolean(validationError)}
                className="h-11 rounded-xl text-start"
              />
              {validationError ? <p className="mt-1.5 text-xs text-[var(--destructive)]">{validationError}</p> : null}
            </div>
            <Button type="submit" className="h-11 rounded-xl sm:mt-7" disabled={lookup.isPending}>
              {lookup.isPending ? <LoaderCircle className="size-4 animate-spin" /> : <Search className="size-4" />}
              {lookup.isPending ? "در حال استعلام…" : "استعلام سوابق"}
            </Button>
          </form>

          {lookup.isError ? (
            <div role="alert" className="mx-auto mt-4 max-w-3xl rounded-2xl border border-[var(--destructive)]/25 bg-[var(--destructive-soft)] p-4 text-sm text-[var(--destructive)]">
              {getApiErrorMessage(lookup.error, "دریافت سوابق شرکتی شخص انجام نشد؛ دوباره تلاش کنید.")}
            </div>
          ) : null}

          {lookup.data ? <PersonCompanyResult data={lookup.data} /> : !lookup.isPending ? <Intro /> : null}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function Intro() {
  return (
    <div className="mx-auto mt-8 grid max-w-3xl place-items-center rounded-3xl border border-dashed border-[var(--app-divider)] px-6 py-12 text-center">
      <div className="grid size-14 place-items-center rounded-2xl bg-[var(--app-primary-soft)] text-[var(--app-primary)]">
        <UserRoundSearch className="size-7" />
      </div>
      <h3 className="mt-4 text-base font-black text-[var(--app-heading)]">کد ملی شخص را وارد کنید</h3>
      <p className="mt-2 max-w-lg text-sm leading-7 text-[var(--app-text-secondary)]">
        سمت‌های جاری، شرکت‌های مرتبط و سوابق پایان‌یافته شخص به تفکیک شرکت نمایش داده می‌شوند.
      </p>
    </div>
  )
}

function PersonCompanyResult({ data }: { data: PersonCompanyLookupResult }) {
  const current = groupByCompany(data.current)
  const historicalRoles = data.history.filter((role) => !role.active || Boolean(role.endDate))
  const history = groupByCompany(historicalRoles)
  const distinctCompanies = new Set([...data.current, ...data.history].map((item) => item.companyNationalCode)).size

  return (
    <div className="mt-5 grid gap-4">
      <section className="relative overflow-hidden rounded-3xl border border-[var(--app-divider)] bg-[var(--app-surface)] p-5 shadow-sm">
        <div className="pointer-events-none absolute inset-y-0 end-0 w-52 bg-gradient-to-l from-[var(--app-primary-soft)]/80 to-transparent" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="grid size-14 shrink-0 place-items-center rounded-2xl bg-[var(--app-primary-soft)] text-[var(--app-primary)]"><Fingerprint className="size-7" /></div>
            <div><h2 className="text-lg font-black text-[var(--app-heading)]">{data.fullName || "شخص استعلام‌شده"}</h2><p className="mt-1 text-sm text-[var(--app-text-secondary)]">کد ملی: <b dir="ltr" className="text-[var(--app-heading)]">{data.nationalCode}</b></p></div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Summary label="شرکت مرتبط" value={distinctCompanies} />
            <Summary label="سمت جاری" value={data.current.length} />
            <Summary label="سابقه پایان‌یافته" value={historicalRoles.length} />
            {data.cache?.hit ? <StatusBadge tone="info" dot={false}>از اطلاعات ذخیره‌شده</StatusBadge> : null}
          </div>
        </div>
      </section>

      <CompanySection title="سمت‌ها و شرکت‌های فعلی" icon={Building2} groups={current} active />
      <CompanySection title="سوابق شرکتی گذشته" icon={History} groups={history} active={false} />
    </div>
  )
}

function CompanySection({ title, icon: Icon, groups, active }: { title: string; icon: typeof Building2; groups: CompanyGroup[]; active: boolean }) {
  return (
    <section className="rounded-3xl border border-[var(--app-divider)] bg-[var(--app-surface)] p-4 shadow-sm sm:p-5">
      <div className="mb-4 flex items-center gap-3 border-b border-[var(--app-divider)] pb-3">
        <span className="grid size-10 place-items-center rounded-xl bg-[var(--app-primary-soft)] text-[var(--app-primary)]"><Icon className="size-5" /></span>
        <div><h3 className="text-sm font-black text-[var(--app-heading)]">{title}</h3><p className="mt-1 text-xs text-[var(--app-text-secondary)]">{groups.length.toLocaleString("fa-IR")} شرکت</p></div>
      </div>
      {groups.length ? <div className="grid gap-3 lg:grid-cols-2">{groups.map((group) => <CompanyRoleCard key={group.nationalCode} group={group} active={active} />)}</div> : <div className="rounded-2xl border border-dashed border-[var(--app-divider)] p-7 text-center text-sm text-[var(--app-text-secondary)]">اطلاعاتی در این بخش ثبت نشده است.</div>}
    </section>
  )
}

function CompanyRoleCard({ group, active }: { group: CompanyGroup; active: boolean }) {
  return (
    <article className="rounded-2xl border border-[var(--app-divider)] bg-[var(--app-background)]/55 p-4">
      <div className="flex items-start gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[var(--app-primary-soft)] text-[var(--app-primary)]"><Building2 className="size-5" /></span>
        <div className="min-w-0 flex-1"><h4 className="text-sm font-black leading-6 text-[var(--app-heading)]">{group.name}</h4><p className="mt-1 text-xs text-[var(--app-text-secondary)]">شناسه ملی: <b dir="ltr" className="text-[var(--app-heading)]">{group.nationalCode}</b></p></div>
        <StatusBadge tone={active ? "success" : "neutral"} dot>{active ? "فعال" : "پایان‌یافته"}</StatusBadge>
      </div>
      <div className="mt-4 grid gap-2">
        {group.roles.map((role, index) => (
          <div key={`${role.postDescription}-${role.startDate}-${index}`} className="rounded-xl border border-[var(--app-divider)] px-3 py-2.5">
            <div className="flex flex-wrap items-center gap-2"><strong className="text-xs text-[var(--app-heading)]">{role.postDescription || "سمت نامشخص"}</strong>{role.durationTypeDescription ? <StatusBadge tone="secondary" dot={false} size="xs">{role.durationTypeDescription}</StatusBadge> : null}</div>
            <p className="mt-2 flex items-center gap-1 text-xs text-[var(--app-text-secondary)]"><CalendarDays className="size-3.5" />{displayDate(role.startDate)} تا {role.endDate ? displayDate(role.endDate) : "تاکنون"}</p>
            {hasStock(role) ? <p className="mt-2 text-xs text-[var(--app-text-secondary)]">سهام: {role.stockPercentage != null ? `${Number(role.stockPercentage).toLocaleString("fa-IR")}٪` : "—"}{role.stockCount ? ` · ${Number(role.stockCount).toLocaleString("fa-IR")} سهم` : ""}{role.stockAmount ? ` · ${Number(role.stockAmount).toLocaleString("fa-IR")} ریال` : ""}</p> : null}
          </div>
        ))}
      </div>
    </article>
  )
}

function Summary({ label, value }: { label: string; value: number }) {
  return <div className="min-w-24 rounded-xl border border-[var(--app-divider)] bg-[var(--app-background)]/75 px-3 py-2 text-center"><strong className="block text-base font-black text-[var(--app-heading)]">{value.toLocaleString("fa-IR")}</strong><span className="text-[11px] text-[var(--app-text-secondary)]">{label}</span></div>
}

function groupByCompany(roles: PersonCompanyRole[]): CompanyGroup[] {
  const groups = new Map<string, CompanyGroup>()
  for (const role of roles) {
    const group = groups.get(role.companyNationalCode) ?? { nationalCode: role.companyNationalCode, name: role.companyName, roles: [] }
    group.roles.push(role)
    groups.set(role.companyNationalCode, group)
  }
  return [...groups.values()]
}

function displayDate(value?: string) {
  return value ? formatJalaliDate(value) || value : "—"
}

function hasStock(role: PersonCompanyRole) {
  return [role.stockPercentage, role.stockCount, role.stockAmount].some((value) => value != null && value !== "0")
}

function normalizeDigits(value: string) {
  return value.replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit))).replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit))).replace(/\D/g, "")
}
