import {
  AtSign,
  BookOpen,
  BriefcaseBusiness,
  Building2,
  ExternalLink,
  Mail,
  Pencil,
  Phone,
  Star,
  Trash2,
  UserRound,
  X,
} from "lucide-react"

import { ErrorState } from "@/components/shared/ErrorState"
import { LoadingState } from "@/components/shared/LoadingState"
import { uiText } from "@/config/uiText"
import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"

import { usePeopleLookups, usePerson } from "../hooks/usePeople"
import {
  formatPersonDate,
  personCompanyName,
  personJobTitle,
  personPersona,
} from "../utils/personFormatters"


function personDisplayValues(
  person: any,
  lookupData: any,
) {
  const items = lookupData?.data ?? lookupData ?? []

  const findLabel = (group: string, code: string | null | undefined) =>
    items
      .filter((item: any) => item.group === group)
      .find((item: any) => item.code === code)?.label || code || null

  return {
    jobTitle: findLabel("job-titles", person.title || person.jobTitle),
    department: findLabel("departments", person.department),
    personaRole: findLabel("persona-roles", person.personaTag || person.personaRole),
    seniorityLevel: findLabel("seniority-levels", person.seniorityLevel),
  }
}

export function Person360Dialog({
  personId,
  open,
  onOpenChange,
  canEdit,
  canDelete,
  onEdit,
  onDelete,
}: {
  personId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  canEdit: boolean
  canDelete: boolean
  onEdit: () => void
  onDelete: () => void
}) {
  const text = uiText.people
  const query = usePerson(personId)
  const lookups = usePeopleLookups()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        dir="rtl"
        className="max-h-[92vh] w-[min(1080px,calc(100vw-24px))] max-w-none gap-0 overflow-hidden rounded-[32px] border-[var(--app-divider)] bg-[var(--app-surface)] p-0 shadow-[var(--app-shadow-elevated)] sm:max-w-none"
      >
        {query.isLoading ? (
          <div className="p-8">
            <LoadingState />
          </div>
        ) : query.isError || !query.data ? (
          <div className="p-8">
            <ErrorState
              title={text.errors.detailTitle}
              description={text.errors.detailDescription}
              retryLabel={uiText.common.retry}
              onRetry={() => void query.refetch()}
            />
          </div>
        ) : (
          <>
            <DialogHeader className="relative overflow-hidden border-b border-[var(--app-divider)] bg-[linear-gradient(150deg,var(--app-primary-soft),var(--app-surface)_72%)] px-5 py-6 sm:px-7">
              <div className="pointer-events-none absolute -end-16 -top-20 size-48 rounded-full bg-[var(--app-primary)]/8 blur-3xl" />
              <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex min-w-0 items-center gap-4">
                  <div className="grid size-14 shrink-0 place-items-center rounded-[20px] bg-[var(--app-primary)] text-[var(--app-on-primary)] shadow-sm">
                    <UserRound className="size-6" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <DialogTitle className="truncate text-xl font-bold text-[var(--app-heading)]">
                        {query.data.fullName}
                      </DialogTitle>
                      {query.data.isPrimaryContact ? (
                        <RoleBadge primary label={text.contactRole.primary} />
                      ) : query.data.isSecondaryContact ? (
                        <RoleBadge label={text.contactRole.secondary} />
                      ) : null}
                    </div>
                    <p className="mt-1 text-xs text-[var(--app-text-secondary)]">
                      {personDisplayValues(query.data, lookups.data).jobTitle || text.notSpecified}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-[var(--app-text-secondary)]">
                      <span className="inline-flex items-center gap-1.5">
                        <Building2 className="size-3.5" />
                        {personCompanyName(query.data) || text.notSpecified}
                      </span>
                      {query.data.department ? (
                        <span>{query.data.department}</span>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {canEdit ? (
                    <Button
                      type="button"
                      variant="outline"
                      className="rounded-xl"
                      onClick={onEdit}
                    >
                      <Pencil className="size-4" />
                      {text.actions.edit}
                    </Button>
                  ) : null}
                  {canDelete ? (
                    <Button
                      type="button"
                      variant="outline"
                      className="rounded-xl border-[var(--destructive)]/30 text-[var(--destructive)]"
                      onClick={onDelete}
                    >
                      <Trash2 className="size-4" />
                      {text.actions.delete}
                    </Button>
                  ) : null}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="rounded-xl"
                    aria-label={text.actions.close}
                    onClick={() => onOpenChange(false)}
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              </div>
            </DialogHeader>

            <div className="min-h-0 overflow-y-auto p-5 sm:p-7">
              <div className="grid gap-5 lg:grid-cols-[0.78fr_1.22fr]">
                <div className="grid content-start gap-5">
                  <Panel title={text.sections.profile}>
                    <InfoGrid
                      items={[
                        [text.fields.jobTitle, personJobTitle(query.data)],
                        [text.fields.department, query.data.department],
                        [text.fields.personaRole, personPersona(query.data)],
                        [text.fields.seniorityLevel, query.data.seniorityLevel],
                        [text.fields.owner, query.data.company?.owner?.fullName],
                      ]}
                    />
                  </Panel>

                  <Panel title={text.sections.contacts}>
                    <div className="grid gap-2.5">
                      {(query.data.contacts ?? []).map((contact) => (
                        <ContactRow
                          key={contact.id}
                          icon={
                            contact.type.toUpperCase().includes("EMAIL") ? (
                              <Mail className="size-4" />
                            ) : (
                              <Phone className="size-4" />
                            )
                          }
                          label={contact.typeOption?.label || contact.type}
                          value={contact.value}
                          primary={Boolean(contact.isPrimary)}
                        />
                      ))}
                      {!query.data.contacts?.length ? (
                        <>
                          {query.data.phone ? (
                            <ContactRow
                              icon={<Phone className="size-4" />}
                              label={text.fields.phone}
                              value={query.data.phone}
                            />
                          ) : null}
                          {query.data.email ? (
                            <ContactRow
                              icon={<Mail className="size-4" />}
                              label={text.fields.email}
                              value={query.data.email}
                            />
                          ) : null}
                          {!query.data.phone && !query.data.email ? (
                            <EmptyLine>{text.empty.contacts}</EmptyLine>
                          ) : null}
                        </>
                      ) : null}
                    </div>
                  </Panel>

                  <Panel title={text.sections.socials}>
                    <div className="grid gap-2.5">
                      {(query.data.socials ?? []).map((social) => (
                        <ContactRow
                          key={social.id}
                          icon={<AtSign className="size-4" />}
                          label={
                            social.platformOption?.label || social.platform
                          }
                          value={social.handle}
                          primary={Boolean(social.isPrimary)}
                        />
                      ))}
                      {!query.data.socials?.length && query.data.linkedinUrl ? (
                        <a
                          href={query.data.linkedinUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-between rounded-2xl border border-[var(--app-divider)] bg-[var(--app-background)]/50 p-3 text-xs text-[var(--app-primary)]"
                        >
                          <span className="inline-flex items-center gap-2">
                            <AtSign className="size-4" />
                            {text.fields.linkedin}
                          </span>
                          <ExternalLink className="size-3.5" />
                        </a>
                      ) : null}
                      {!query.data.socials?.length &&
                      !query.data.linkedinUrl ? (
                        <EmptyLine>{text.empty.socials}</EmptyLine>
                      ) : null}
                    </div>
                  </Panel>
                </div>

                <div className="grid content-start gap-5">
                  <Panel
                    title={text.sections.career}
                    icon={<BriefcaseBusiness className="size-4" />}
                  >
                    {query.data.employmentHistory?.length ? (
                      <div className="relative grid gap-5 before:absolute before:bottom-4 before:right-[11px] before:top-4 before:w-px before:bg-[var(--app-divider)]">
                        {query.data.employmentHistory.map((employment) => (
                          <div
                            key={employment.id}
                            className="relative flex gap-4"
                          >
                            <span className="relative z-10 mt-1.5 size-[23px] shrink-0 rounded-full border-4 border-[var(--app-surface)] bg-[var(--app-primary)] shadow-sm" />
                            <div className="min-w-0 flex-1 rounded-[20px] border border-[var(--app-divider)] bg-[var(--app-background)]/45 p-4">
                              <p className="text-sm font-bold text-[var(--app-heading)]">
                                {employment.company?.brandName ||
                                  employment.company?.legalName ||
                                  text.notSpecified}
                              </p>
                              <div className="mt-3 grid gap-3">
                                {(employment.positions ?? []).map(
                                  (position) => (
                                    <div key={position.id}>
                                      <div className="flex flex-wrap items-center justify-between gap-2">
                                        <p className="text-xs font-bold text-[var(--app-heading)]">
                                          {position.title}
                                        </p>
                                        {position.isCurrent ? (
                                          <span className="rounded-full bg-[var(--app-primary-soft)] px-2 py-1 text-[9px] font-bold text-[var(--app-primary)]">
                                            {text.career.current}
                                          </span>
                                        ) : null}
                                      </div>
                                      <p className="mt-1 text-[10px] text-[var(--app-text-secondary)]">
                                        {[
                                          formatPersonDate(position.startDate),
                                          formatPersonDate(position.endDate),
                                        ]
                                          .filter(Boolean)
                                          .join(" — ")}
                                      </p>
                                    </div>
                                  ),
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <EmptyLine>{text.empty.career}</EmptyLine>
                    )}
                  </Panel>

                  <Panel
                    title={text.sections.education}
                    icon={<BookOpen className="size-4" />}
                  >
                    {query.data.educationHistory?.length ? (
                      <div className="grid gap-3">
                        {query.data.educationHistory.map((education) => (
                          <div
                            key={education.id}
                            className="rounded-[20px] border border-[var(--app-divider)] bg-[var(--app-background)]/45 p-4"
                          >
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <div>
                                <p className="text-xs font-bold text-[var(--app-heading)]">
                                  {education.university?.name ||
                                    text.notSpecified}
                                </p>
                                {education.degree ? (
                                  <p className="mt-1 text-[10px] text-[var(--app-primary)]">
                                    {education.degree}
                                  </p>
                                ) : null}
                              </div>
                              <span className="text-[10px] text-[var(--app-text-secondary)]">
                                {formatPersonDate(education.educationDate)}
                              </span>
                            </div>
                            {education.description ? (
                              <p className="mt-3 text-[11px] leading-5 text-[var(--app-text-secondary)]">
                                {education.description}
                              </p>
                            ) : null}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <EmptyLine>{text.empty.education}</EmptyLine>
                    )}
                  </Panel>
                </div>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

function Panel({
  title,
  icon,
  children,
}: {
  title: string
  icon?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section className="rounded-[24px] border border-[var(--app-divider)] bg-[var(--app-surface)] p-4 shadow-sm sm:p-5">
      <div className="mb-4 flex items-center gap-2">
        {icon ? (
          <span className="grid size-8 place-items-center rounded-xl bg-[var(--app-primary-soft)] text-[var(--app-primary)]">
            {icon}
          </span>
        ) : null}
        <h3 className="text-sm font-bold text-[var(--app-heading)]">{title}</h3>
      </div>
      {children}
    </section>
  )
}

function InfoGrid({
  items,
}: {
  items: Array<[string, string | null | undefined]>
}) {
  const text = uiText.people
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {items.map(([label, value]) => (
        <div
          key={label}
          className="rounded-2xl bg-[var(--app-background)]/55 p-3"
        >
          <p className="text-[9px] font-bold text-[var(--app-text-secondary)]">
            {label}
          </p>
          <p className="mt-1.5 text-xs text-[var(--app-heading)]">
            {value || text.notSpecified}
          </p>
        </div>
      ))}
    </div>
  )
}

function ContactRow({
  icon,
  label,
  value,
  primary = false,
}: {
  icon: React.ReactNode
  label: string
  value: string
  primary?: boolean
}) {
  const text = uiText.people
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-[var(--app-divider)] bg-[var(--app-background)]/45 p-3">
      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[var(--app-primary-soft)] text-[var(--app-primary)]">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-[9px] font-bold text-[var(--app-text-secondary)]">
            {label}
          </p>
          {primary ? (
            <span className="rounded-full bg-[var(--app-primary-soft)] px-2 py-0.5 text-[8px] font-bold text-[var(--app-primary)]">
              {text.contactRole.primaryShort}
            </span>
          ) : null}
        </div>
        <p dir="auto" className="mt-1 truncate text-xs text-[var(--app-heading)]">
          {value}
        </p>
      </div>
    </div>
  )
}

function RoleBadge({
  label,
  primary = false,
}: {
  label: string
  primary?: boolean
}) {
  return (
    <span
      className={[
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[9px] font-bold",
        primary
          ? "bg-[var(--app-primary-soft)] text-[var(--app-primary)]"
          : "border border-[var(--app-outline)] bg-[var(--app-surface)] text-[var(--app-primary-alt)]",
      ].join(" ")}
    >
      <Star className={primary ? "size-3 fill-current" : "size-3"} />
      {label}
    </span>
  )
}

function EmptyLine({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-2xl bg-[var(--app-background)]/55 p-4 text-center text-xs text-[var(--app-text-secondary)]">
      {children}
    </p>
  )
}
