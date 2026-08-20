import {
  ArrowRight,
  Building2,
  CalendarClock,
  CircleDollarSign,
  ExternalLink,
  MapPin,
  Phone,
  UsersRound,
} from "lucide-react"
import { useNavigate, useParams } from "react-router-dom"

import { EmptyState } from "@/components/shared/EmptyState"
import { ErrorState } from "@/components/shared/ErrorState"
import { LoadingState } from "@/components/shared/LoadingState"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { SurfaceCard } from "@/components/shared/SurfaceCard"
import { Button } from "@workspace/ui/components/button"
import { uiText } from "@/config/uiText"

import { CompanyAvatar } from "../components/CompanyAvatar"
import { CompanyInfoGrid } from "../components/CompanyInfoGrid"
import { CompanyMetricCard } from "../components/CompanyMetricCard"
import { CompanyPriorityBadge } from "../components/CompanyPriorityBadge"
import { CompanyTimeline } from "../components/CompanyTimeline"
import { useCompany } from "../hooks/useCompanies"
import {
  activityStatusLabel,
  companyDisplayName,
  formatCompanyDate,
  formatCompanyDateTime,
  formatCompanyNumber,
  opportunityTitle,
  personName,
} from "../utils/companyFormatters"

export function CompanyDetailPage() {
  const text = uiText.companies.detail
  const navigate = useNavigate()
  const { companyId = "" } = useParams<{ companyId: string }>()
  const query = useCompany(companyId)

  if (query.isLoading) return <LoadingState />

  if (query.isError || !query.data) {
    return (
      <ErrorState
        title={text.errorTitle}
        description={text.errorDescription}
        retryLabel={uiText.common.retry}
        onRetry={() => void query.refetch()}
      />
    )
  }

  const company = query.data
  const displayName = companyDisplayName(company.legalName, company.brandName)
  const opportunities = company.opportunities ?? []
  const activeOpportunities = opportunities.filter(
    (item) => !item.stage?.isTerminal,
  )
  const activities = company.activities ?? []
  const people = company.people ?? []
  const lastActivity =
    activities[0]?.occurredAt ||
    activities[0]?.activityDate ||
    activities[0]?.createdAt ||
    null

  const pipelineValue = activeOpportunities.reduce((sum, item) => {
    const value = Number(item.amount ?? item.estimatedValue ?? 0)
    return Number.isFinite(value) ? sum + value : sum
  }, 0)

  const websiteHref = company.website
    ? /^https?:\/\//i.test(company.website)
      ? company.website
      : `https://${company.website}`
    : null

  return (
    <div className="grid gap-5">
      <section className="overflow-hidden rounded-[var(--app-radius-feature)] border border-[var(--app-divider)] bg-[var(--app-surface)] shadow-[var(--app-shadow-card)]">
        <div className="relative overflow-hidden px-5 py-5 sm:px-6">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-[var(--app-primary)]" />
          <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div className="flex min-w-0 items-start gap-4">
              <CompanyAvatar name={displayName} />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="truncate text-xl font-bold text-[var(--app-heading)] sm:text-2xl">
                    {displayName}
                  </h1>
                  {company.archivedAt ? (
                    <StatusBadge tone="warning">{text.archived}</StatusBadge>
                  ) : (
                    <StatusBadge tone="success">{text.active}</StatusBadge>
                  )}
                  <CompanyPriorityBadge priority={company.priority} />
                </div>

                {company.brandName && company.brandName !== company.legalName ? (
                  <p className="mt-1 text-xs text-[var(--app-text-secondary)]">
                    {company.legalName}
                  </p>
                ) : null}

                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-[11px] text-[var(--app-text-secondary)]">
                  <span className="inline-flex items-center gap-1.5">
                    <Building2 className="size-3.5" />
                    {company.industryRef?.name ||
                      company.industry ||
                      text.notSpecified}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <UsersRound className="size-3.5" />
                    {company.owner?.fullName || text.unassigned}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="size-3.5" />
                    {company.headOfficeCity || text.notSpecified}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="outline"
                className="rounded-xl"
                onClick={() => navigate("/companies")}
              >
                <ArrowRight className="size-4" />
                {text.back}
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <CompanyMetricCard
          icon={CircleDollarSign}
          label={text.metrics.pipelineValue}
          value={formatCompanyNumber(pipelineValue)}
          hint={text.metrics.pipelineHint}
        />
        <CompanyMetricCard
          icon={Building2}
          label={text.metrics.openOpportunities}
          value={formatCompanyNumber(activeOpportunities.length)}
        />
        <CompanyMetricCard
          icon={UsersRound}
          label={text.metrics.people}
          value={formatCompanyNumber(people.length)}
        />
        <CompanyMetricCard
          icon={CalendarClock}
          label={text.metrics.lastInteraction}
          value={formatCompanyDate(lastActivity)}
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(340px,0.75fr)]">
        <div className="grid gap-5">
          <SurfaceCard className="p-5 sm:p-6">
            <div className="mb-5">
              <h2 className="ui-section-title">{text.sections.overview}</h2>
              <p className="mt-1 text-xs text-[var(--app-text-secondary)]">
                {text.sections.overviewDescription}
              </p>
            </div>

            <CompanyInfoGrid
              items={[
                {
                  label: text.fields.legalName,
                  value: company.legalName,
                },
                {
                  label: text.fields.brandName,
                  value: company.brandName || text.notSpecified,
                },
                {
                  label: text.fields.industry,
                  value:
                    company.industryRef?.name ||
                    company.industry ||
                    text.notSpecified,
                },
                {
                  label: text.fields.owner,
                  value: company.owner?.fullName || text.unassigned,
                },
                {
                  label: text.fields.team,
                  value: company.owner?.team || text.notSpecified,
                },
                {
                  label: text.fields.city,
                  value: company.headOfficeCity || text.notSpecified,
                },
                {
                  label: text.fields.phone,
                  value: company.centralPhone ? (
                    <a
                      href={`tel:${company.centralPhone}`}
                      dir="ltr"
                      className="inline-flex items-center gap-1.5 text-[var(--app-primary)]"
                    >
                      <Phone className="size-3.5" />
                      {company.centralPhone}
                    </a>
                  ) : (
                    text.notSpecified
                  ),
                },
                {
                  label: text.fields.website,
                  value: websiteHref ? (
                    <a
                      href={websiteHref}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-[var(--app-primary)]"
                    >
                      {company.website}
                      <ExternalLink className="size-3.5" />
                    </a>
                  ) : (
                    text.notSpecified
                  ),
                },
                {
                  label: text.fields.source,
                  value:
                    company.sourceRef?.name ||
                    company.source ||
                    text.notSpecified,
                },
              ]}
            />
          </SurfaceCard>

          <SurfaceCard className="p-5 sm:p-6">
            <div className="mb-5">
              <h2 className="ui-section-title">{text.sections.opportunities}</h2>
              <p className="mt-1 text-xs text-[var(--app-text-secondary)]">
                {text.sections.opportunitiesDescription}
              </p>
            </div>

            {opportunities.length ? (
              <div className="grid gap-2.5">
                {opportunities.slice(0, 6).map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col gap-3 rounded-2xl border border-[var(--app-divider)] bg-[var(--app-background)]/45 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-[var(--app-heading)]">
                        {opportunityTitle(item)}
                      </p>
                      <p className="mt-1 text-[10px] text-[var(--app-text-secondary)]">
                        {item.stage?.label ||
                          item.stage?.name ||
                          item.stage?.code ||
                          text.notSpecified}
                      </p>
                    </div>
                    <div className="text-start sm:text-end">
                      <p className="text-sm font-bold text-[var(--app-heading)]">
                        {formatCompanyNumber(
                          item.amount ?? item.estimatedValue ?? null,
                        )}
                      </p>
                      <p className="mt-1 text-[10px] text-[var(--app-text-secondary)]">
                        {item.owner?.fullName || text.unassigned}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Building2}
                title={text.empty.opportunitiesTitle}
                description={text.empty.opportunitiesDescription}
              />
            )}
          </SurfaceCard>

          <SurfaceCard className="p-5 sm:p-6">
            <div className="mb-5">
              <h2 className="ui-section-title">{text.sections.legal}</h2>
            </div>

            <CompanyInfoGrid
              items={[
                {
                  label: text.fields.registrationNumber,
                  value: company.registrationNumber || text.notSpecified,
                },
                {
                  label: text.fields.nationalId,
                  value: company.nationalId || text.notSpecified,
                },
                {
                  label: text.fields.economicCode,
                  value: company.economicCode || text.notSpecified,
                },
                {
                  label: text.fields.establishmentDate,
                  value: formatCompanyDate(company.establishmentDate),
                },
                {
                  label: text.fields.activityStatus,
                  value: company.activityStatus
                    ? activityStatusLabel[company.activityStatus]
                    : text.notSpecified,
                },
                {
                  label: text.fields.employeeCount,
                  value: formatCompanyNumber(company.employeeCount),
                },
                {
                  label: text.fields.registeredCapital,
                  value: formatCompanyNumber(company.registeredCapital),
                },
                {
                  label: text.fields.createdAt,
                  value: formatCompanyDateTime(company.createdAt),
                },
                {
                  label: text.fields.updatedAt,
                  value: formatCompanyDateTime(company.updatedAt),
                },
              ]}
            />
          </SurfaceCard>
        </div>

        <div className="grid content-start gap-5">
          <SurfaceCard className="p-5 sm:p-6">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h2 className="ui-section-title">{text.sections.people}</h2>
                <p className="mt-1 text-xs text-[var(--app-text-secondary)]">
                  {text.sections.peopleDescription}
                </p>
              </div>
              <span className="text-xs font-bold text-[var(--app-primary)]">
                {formatCompanyNumber(people.length)}
              </span>
            </div>

            {people.length ? (
              <div className="grid gap-2.5">
                {people.slice(0, 6).map((person) => (
                  <div
                    key={person.id}
                    className="flex items-center gap-3 rounded-2xl bg-[var(--app-background)]/55 p-3"
                  >
                    <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-[var(--app-primary-soft)] text-xs font-bold text-[var(--app-primary)]">
                      {personName(person).slice(0, 1)}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-bold text-[var(--app-heading)]">
                        {personName(person)}
                      </p>
                      <p className="mt-1 truncate text-[10px] text-[var(--app-text-secondary)]">
                        {person.jobTitle ||
                          person.title ||
                          person.department ||
                          text.notSpecified}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={UsersRound}
                title={text.empty.peopleTitle}
                description={text.empty.peopleDescription}
              />
            )}
          </SurfaceCard>

          <SurfaceCard className="p-5 sm:p-6">
            <div className="mb-5">
              <h2 className="ui-section-title">{text.sections.timeline}</h2>
              <p className="mt-1 text-xs text-[var(--app-text-secondary)]">
                {text.sections.timelineDescription}
              </p>
            </div>
            <CompanyTimeline activities={activities} />
          </SurfaceCard>

          <SurfaceCard className="p-5 sm:p-6">
            <div className="mb-4">
              <h2 className="ui-section-title">{text.sections.ecosystem}</h2>
              <p className="mt-1 text-xs text-[var(--app-text-secondary)]">
                {text.sections.ecosystemDescription}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <MiniStat
                label={text.ecosystem.branches}
                value={company.branches?.length ?? 0}
              />
              <MiniStat
                label={text.ecosystem.social}
                value={company.socialChannels?.length ?? 0}
              />
              <MiniStat
                label={text.ecosystem.legalDocuments}
                value={company.legalDocuments?.length ?? 0}
              />
              <MiniStat
                label={text.ecosystem.callCard}
                value={company.callCard ? 1 : 0}
              />
            </div>
          </SurfaceCard>
        </div>
      </div>
    </div>
  )
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-[var(--app-divider)] bg-[var(--app-background)]/45 p-3 text-center">
      <p className="text-lg font-bold text-[var(--app-heading)]">{value}</p>
      <p className="mt-1 text-[10px] text-[var(--app-text-secondary)]">
        {label}
      </p>
    </div>
  )
}
