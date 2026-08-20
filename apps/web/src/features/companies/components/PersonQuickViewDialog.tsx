import type { ReactNode } from "react"

import {
  AtSign,
  BriefcaseBusiness,
  Building2,
  GraduationCap,
  Phone,
  Star,
  UsersRound,
  X,
} from "lucide-react"

import { uiText } from "@/config/uiText"
import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"

import { usePersonDetail } from "../hooks/useCompany360Sections"

export function PersonQuickViewDialog({
  personId,
  open,
  onOpenChange,
}: {
  personId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const text = uiText.companies.detail
  const query = usePersonDetail(open ? personId : null)
  const person = query.data

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        dir="rtl"
        className="max-h-[86vh] w-[min(920px,calc(100vw-24px))] max-w-none gap-0 overflow-hidden rounded-[28px] border-[var(--app-divider)] bg-[var(--app-surface)] p-0 shadow-[var(--app-shadow-elevated)] sm:max-w-none"
      >
        <DialogHeader className="border-b border-[var(--app-divider)] bg-[linear-gradient(155deg,var(--app-primary-soft),var(--app-surface)_62%)] px-5 py-5 sm:px-7">
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[var(--app-primary)] text-[var(--app-on-primary)]">
                <UsersRound className="size-5" />
              </div>
              <div className="min-w-0">
                <DialogTitle className="truncate text-xl font-bold text-[var(--app-heading)]">
                  {person?.fullName || text.sections.people}
                </DialogTitle>
                {person?.title || person?.jobTitle ? (
                  <p className="mt-1 truncate text-xs text-[var(--app-text-secondary)]">
                    {person.title || person.jobTitle}
                  </p>
                ) : null}
              </div>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="shrink-0 rounded-xl"
              aria-label={uiText.companies.form.close}
              onClick={() => onOpenChange(false)}
            >
              <X className="size-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="min-h-0 overflow-y-auto px-5 py-5 sm:px-7 sm:py-6">
          {query.isLoading ? (
            <div className="grid gap-3">
              <div className="h-20 animate-pulse rounded-2xl bg-[var(--app-background)]" />
              <div className="h-36 animate-pulse rounded-2xl bg-[var(--app-background)]" />
            </div>
          ) : query.isError || !person ? (
            <p className="rounded-2xl bg-[var(--app-background)] p-4 text-center text-xs text-[var(--app-text-secondary)]">
              {text.errorDescription}
            </p>
          ) : (
            <div className="grid gap-5">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <Info icon={<BriefcaseBusiness className="size-4" />} value={person.title || person.jobTitle} />
                <Info icon={<Building2 className="size-4" />} value={person.department} />
                <Info icon={<Star className="size-4" />} value={person.personaRole || person.personaTag} />
                <Info icon={<AtSign className="size-4" />} value={person.email} dir="ltr" />
                <Info icon={<Phone className="size-4" />} value={person.phone} dir="ltr" />
                <Info icon={<UsersRound className="size-4" />} value={person.seniorityLevel} />
              </div>

              {person.contacts?.length ? (
                <DetailBlock icon={<Phone className="size-4" />}>
                  {person.contacts.map((contact) => (
                    <DetailRow
                      key={contact.id}
                      primary={Boolean(contact.isPrimary)}
                      value={contact.value}
                      hint={contact.typeOption?.label || contact.type}
                    />
                  ))}
                </DetailBlock>
              ) : null}

              {person.socials?.length || person.linkedinUrl ? (
                <DetailBlock icon={<AtSign className="size-4" />}>
                  {person.linkedinUrl ? (
                    <DetailRow value={person.linkedinUrl} />
                  ) : null}
                  {person.socials?.map((social) => (
                    <DetailRow
                      key={social.id}
                      primary={Boolean(social.isPrimary)}
                      value={social.handle}
                      hint={social.platformOption?.label || social.platform}
                    />
                  ))}
                </DetailBlock>
              ) : null}

              {person.employmentHistory?.length ? (
                <DetailBlock icon={<BriefcaseBusiness className="size-4" />}>
                  {person.employmentHistory.map((history) => (
                    <div key={history.id} className="rounded-2xl border border-[var(--app-divider)] bg-[var(--app-background)]/45 p-3">
                      <p className="text-xs font-bold text-[var(--app-heading)]">
                        {history.company?.brandName || history.company?.legalName || text.notSpecified}
                      </p>
                      <div className="mt-2 grid gap-2">
                        {history.positions?.map((position) => (
                          <DetailRow
                            key={position.id}
                            primary={Boolean(position.isCurrent)}
                            value={position.title || text.notSpecified}
                            hint={position.department}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </DetailBlock>
              ) : null}

              {person.educationHistory?.length ? (
                <DetailBlock icon={<GraduationCap className="size-4" />}>
                  {person.educationHistory.map((education) => (
                    <DetailRow
                      key={education.id}
                      value={education.university?.name || education.degree || text.notSpecified}
                      hint={education.fieldOfStudy}
                    />
                  ))}
                </DetailBlock>
              ) : null}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function Info({
  icon,
  value,
  dir,
}: {
  icon: ReactNode
  value?: string | null
  dir?: "ltr" | "rtl"
}) {
  if (!value) return null
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-[var(--app-divider)] bg-[var(--app-background)]/45 p-3">
      <div className="grid size-8 shrink-0 place-items-center rounded-xl bg-[var(--app-primary-soft)] text-[var(--app-primary)]">
        {icon}
      </div>
      <span dir={dir} className="min-w-0 truncate text-xs text-[var(--app-heading)]">
        {value}
      </span>
    </div>
  )
}

function DetailBlock({
  icon,
  children,
}: {
  icon: ReactNode
  children: ReactNode
}) {
  return (
    <section className="rounded-[22px] border border-[var(--app-divider)] bg-[var(--app-surface)] p-4">
      <div className="mb-3 flex items-center gap-2 text-[var(--app-primary)]">
        {icon}
      </div>
      <div className="grid gap-2">{children}</div>
    </section>
  )
}

function DetailRow({
  value,
  hint,
  primary,
}: {
  value: string
  hint?: string | null
  primary?: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-[var(--app-background)]/60 px-3 py-2.5">
      <div className="min-w-0">
        <p dir="auto" className="truncate text-xs font-bold text-[var(--app-heading)]">
          {value}
        </p>
        {hint ? (
          <p className="mt-1 truncate text-[10px] text-[var(--app-text-secondary)]">
            {hint}
          </p>
        ) : null}
      </div>
      {primary ? <Star className="size-3.5 shrink-0 text-[var(--app-primary)]" /> : null}
    </div>
  )
}
