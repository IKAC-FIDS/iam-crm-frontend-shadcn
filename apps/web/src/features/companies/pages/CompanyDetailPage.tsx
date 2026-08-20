import {
  ArrowRight,
  Building2,
  CalendarClock,
  CircleDollarSign,
  ExternalLink,
  FileText,
  ListTodo,
  MapPin,
  Pencil,
  Phone,
  Share2,
  UsersRound,
} from "lucide-react"
import { useState, type ReactNode } from "react"
import { useNavigate, useParams } from "react-router-dom"

import { EmptyState } from "@/components/shared/EmptyState"
import { ErrorState } from "@/components/shared/ErrorState"
import { LoadingState } from "@/components/shared/LoadingState"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { SurfaceCard } from "@/components/shared/SurfaceCard"
import { uiText } from "@/config/uiText"
import { useAuthStore } from "@/store/authStore"
import { Button } from "@workspace/ui/components/button"

import { Company360ActionSection } from "../components/Company360ActionSection"
import { CompanyAvatar } from "../components/CompanyAvatar"
import { CompanyFormDialog } from "../components/CompanyFormDialog"
import { CompanyInfoGrid } from "../components/CompanyInfoGrid"
import { CompanyMetricCard } from "../components/CompanyMetricCard"
import { CompanyPriorityBadge } from "../components/CompanyPriorityBadge"
import { CompanyTimeline } from "../components/CompanyTimeline"
import { useCompany } from "../hooks/useCompanies"
import { useCompany360Overview } from "../hooks/useCompany360"
import {
  useCompanyActivities,
  useCompanyBranches,
  useCompanyLegalDocuments,
  useCompanyMeetings,
  useCompanySocialChannels,
  useCompanyTasks,
} from "../hooks/useCompany360Sections"
import { useUpdateCompany } from "../hooks/useCompanyMutations"
import {
  activityStatusLabel,
  companyDisplayName,
  formatCompanyDate,
  formatCompanyDateTime,
  formatCompanyNumber,
  opportunityTitle,
  personName,
} from "../utils/companyFormatters"

const SECTION_PAGE_SIZE = 12

type QuickCreateTarget =
  | "opportunity"
  | "person"
  | "task"
  | "meeting"
  | "activity"
  | "legal-document"
  | "branch"
  | "social-channel"

export function CompanyDetailPage() {
  const text = uiText.companies.detail
  const navigate = useNavigate()
  const { companyId = "" } = useParams<{ companyId: string }>()
  const permissions = useAuthStore((state) => state.user?.permissions ?? [])
  const [editOpen, setEditOpen] = useState(false)

  const canViewTasks = permissions.includes("task:view")
  const canViewMeetings = permissions.includes("meeting:view")
  const canViewActivities = permissions.includes("activity:view")

  const query = useCompany(companyId)
  const overviewQuery = useCompany360Overview(companyId)
  const updateMutation = useUpdateCompany(companyId)

  const tasksQuery = useCompanyTasks(
    companyId,
    1,
    SECTION_PAGE_SIZE,
    canViewTasks,
  )
  const meetingsQuery = useCompanyMeetings(
    companyId,
    1,
    SECTION_PAGE_SIZE,
    canViewMeetings,
  )
  const activitiesQuery = useCompanyActivities(
    companyId,
    1,
    SECTION_PAGE_SIZE,
    canViewActivities,
  )
  const branchesQuery = useCompanyBranches(companyId, 1, SECTION_PAGE_SIZE)
  const socialQuery = useCompanySocialChannels(companyId, 1, SECTION_PAGE_SIZE)
  const documentsQuery = useCompanyLegalDocuments(
    companyId,
    1,
    SECTION_PAGE_SIZE,
  )

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
  const people = company.people ?? []
  const embeddedActivities = company.activities ?? []

  const activeOpportunities = opportunities.filter(
    (item) => !item.stage?.isTerminal,
  )

  const lastActivity =
    embeddedActivities[0]?.occurredAt ||
    embeddedActivities[0]?.activityDate ||
    embeddedActivities[0]?.createdAt ||
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

  const overview = overviewQuery.data?.summary
  const openOpportunityCount =
    overview?.openOpportunityCount ?? activeOpportunities.length
  const peopleCount = overview?.peopleCount ?? people.length
  const activeTaskCount = overview?.activeTaskCount ?? 0
  const upcomingMeetingCount = overview?.upcomingMeetingCount ?? 0

  function openQuickCreate(target: QuickCreateTarget) {
    const routeByTarget: Record<QuickCreateTarget, string> = {
      opportunity: "/opportunities",
      person: "/people",
      task: "/tasks",
      meeting: "/meetings",
      activity: "/activities",
      "legal-document": `/companies/${companyId}`,
      branch: `/companies/${companyId}`,
      "social-channel": `/companies/${companyId}`,
    }

    const params = new URLSearchParams({
      companyId,
      action: "create",
      entity: target,
    })

    navigate(`${routeByTarget[target]}?${params.toString()}`)
  }

  return (
    <div className="grid gap-5">
      <section className="relative overflow-hidden rounded-[var(--app-radius-feature)] border border-[var(--app-divider)] bg-[var(--app-surface)] shadow-[var(--app-shadow-card)]">
        <div className="pointer-events-none absolute -start-16 -top-20 size-52 rounded-full bg-[var(--app-primary-soft)]/75 blur-3xl" />
        <div className="pointer-events-none absolute -end-20 top-2 size-44 rounded-full bg-[var(--app-info-light)]/70 blur-3xl" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-l from-[var(--app-primary)] via-[var(--app-info)] to-[var(--app-primary-soft)]" />

        <div className="relative px-5 py-5 sm:px-6">
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
              {permissions.includes("company:update") && !company.archivedAt ? (
                <Button
                  type="button"
                  className="rounded-xl bg-[var(--app-primary)] text-[var(--app-on-primary)] shadow-sm hover:bg-[var(--app-primary-hover)]"
                  onClick={() => setEditOpen(true)}
                >
                  <Pencil className="size-4" />
                  {text.edit}
                </Button>
              ) : null}
              <Button
                type="button"
                variant="outline"
                className="rounded-xl bg-[var(--app-surface)]/80 backdrop-blur"
                onClick={() => navigate("/companies")}
              >
                <ArrowRight className="size-4" />
                {text.back}
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <CompanyMetricCard
          icon={CircleDollarSign}
          label={text.metrics.pipelineValue}
          value={formatCompanyNumber(pipelineValue)}
          hint={text.metrics.pipelineHint}
        />
        <CompanyMetricCard
          icon={Building2}
          label={text.metrics.openOpportunities}
          value={formatCompanyNumber(openOpportunityCount)}
        />
        <CompanyMetricCard
          icon={UsersRound}
          label={text.metrics.people}
          value={formatCompanyNumber(peopleCount)}
        />
        <CompanyMetricCard
          icon={ListTodo}
          label={uiText.navigation.tasks}
          value={formatCompanyNumber(activeTaskCount)}
        />
        <CompanyMetricCard
          icon={CalendarClock}
          label={uiText.navigation.meetings}
          value={formatCompanyNumber(upcomingMeetingCount)}
        />
        <CompanyMetricCard
          icon={CalendarClock}
          label={text.metrics.lastInteraction}
          value={formatCompanyDate(lastActivity)}
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(330px,0.65fr)]">
        <div className="grid content-start gap-5">
          <SurfaceCard className="p-5 sm:p-6">
            <div className="mb-5">
              <h2 className="ui-section-title">{text.sections.overview}</h2>
              <p className="mt-1 text-xs text-[var(--app-text-secondary)]">
                {text.sections.overviewDescription}
              </p>
            </div>

            <CompanyInfoGrid
              items={[
                { label: text.fields.legalName, value: company.legalName },
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

          <Company360ActionSection
            title={text.sections.opportunities}
            description={text.sections.opportunitiesDescription}
            count={opportunities.length}
            icon={<CircleDollarSign className="size-5" />}
            onCreate={
              permissions.includes("opportunity:create")
                ? () => openQuickCreate("opportunity")
                : undefined
            }
          >
            {opportunities.length ? (
              <div className="grid gap-2.5">
                {opportunities.map((item) => (
                  <EntityRow
                    key={item.id}
                    icon={<Building2 className="size-4" />}
                    title={opportunityTitle(item)}
                    subtitle={
                      item.stage?.label ||
                      item.stage?.name ||
                      item.stage?.code ||
                      text.notSpecified
                    }
                    meta={formatCompanyNumber(
                      item.amount ?? item.estimatedValue ?? null,
                    )}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Building2}
                title={text.empty.opportunitiesTitle}
                description={text.empty.opportunitiesDescription}
              />
            )}
          </Company360ActionSection>

          {canViewActivities ? (
            <Company360ActionSection
              title={uiText.navigation.activities}
              count={
                activitiesQuery.data?.meta.total ??
                overview?.activityCount ??
                embeddedActivities.length
              }
              icon={<CalendarClock className="size-5" />}
              onCreate={
                permissions.includes("activity:create")
                  ? () => openQuickCreate("activity")
                  : undefined
              }
            >
              {activitiesQuery.isLoading ? (
                <SectionLoading />
              ) : activitiesQuery.data?.data.length ? (
                <CompanyTimeline activities={activitiesQuery.data.data} />
              ) : (
                <SectionEmpty />
              )}
            </Company360ActionSection>
          ) : null}

          <Company360ActionSection
            title={text.ecosystem.legalDocuments}
            count={
              documentsQuery.data?.meta.total ??
              overview?.legalDocumentCount ??
              0
            }
            icon={<FileText className="size-5" />}
            onCreate={
              permissions.includes("company:update")
                ? () => openQuickCreate("legal-document")
                : undefined
            }
          >
            {documentsQuery.isLoading ? (
              <SectionLoading />
            ) : documentsQuery.data?.data.length ? (
              <div className="grid gap-2.5">
                {documentsQuery.data.data.map((document) => (
                  <EntityRow
                    key={document.id}
                    icon={<FileText className="size-4" />}
                    title={document.title || document.type || text.notSpecified}
                    subtitle={document.type || text.notSpecified}
                    meta={formatCompanyDate(
                      document.documentDate || document.createdAt,
                    )}
                  />
                ))}
              </div>
            ) : (
              <SectionEmpty />
            )}
          </Company360ActionSection>
        </div>

        <div className="grid content-start gap-5">
          <Company360ActionSection
            title={text.sections.people}
            description={text.sections.peopleDescription}
            count={peopleCount}
            compact
            icon={<UsersRound className="size-5" />}
            onCreate={
              permissions.includes("person:create")
                ? () => openQuickCreate("person")
                : undefined
            }
          >
            {people.length ? (
              <div className="grid gap-2.5">
                {people.map((person) => (
                  <div
                    key={person.id}
                    className="flex items-center gap-3 rounded-2xl border border-transparent bg-[var(--app-background)]/60 p-3 transition-colors hover:border-[var(--app-divider)] hover:bg-[var(--app-surface)]"
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
          </Company360ActionSection>

          {canViewTasks ? (
            <Company360ActionSection
              title={uiText.navigation.tasks}
              count={tasksQuery.data?.meta.total ?? activeTaskCount}
              compact
              icon={<ListTodo className="size-5" />}
              onCreate={
                permissions.includes("task:create")
                  ? () => openQuickCreate("task")
                  : undefined
              }
            >
              {tasksQuery.isLoading ? (
                <SectionLoading />
              ) : tasksQuery.data?.data.length ? (
                <div className="grid gap-2.5">
                  {tasksQuery.data.data.map((task) => (
                    <EntityRow
                      key={task.id}
                      icon={<ListTodo className="size-4" />}
                      title={task.title}
                      subtitle={
                        task.assignedTo?.fullName ||
                        task.status ||
                        text.notSpecified
                      }
                      meta={formatCompanyDateTime(task.dueAt)}
                    />
                  ))}
                </div>
              ) : (
                <SectionEmpty />
              )}
            </Company360ActionSection>
          ) : null}

          {canViewMeetings ? (
            <Company360ActionSection
              title={uiText.navigation.meetings}
              count={meetingsQuery.data?.meta.total ?? upcomingMeetingCount}
              compact
              icon={<CalendarClock className="size-5" />}
              onCreate={
                permissions.includes("meeting:create")
                  ? () => openQuickCreate("meeting")
                  : undefined
              }
            >
              {meetingsQuery.isLoading ? (
                <SectionLoading />
              ) : meetingsQuery.data?.data.length ? (
                <div className="grid gap-2.5">
                  {meetingsQuery.data.data.map((meeting) => (
                    <EntityRow
                      key={meeting.id}
                      icon={<CalendarClock className="size-4" />}
                      title={meeting.title}
                      subtitle={
                        meeting.organizer?.fullName ||
                        meeting.mode ||
                        text.notSpecified
                      }
                      meta={formatCompanyDateTime(meeting.startAt)}
                    />
                  ))}
                </div>
              ) : (
                <SectionEmpty />
              )}
            </Company360ActionSection>
          ) : null}

          <Company360ActionSection
            title={text.ecosystem.branches}
            count={branchesQuery.data?.meta.total ?? overview?.branchCount ?? 0}
            compact
            icon={<MapPin className="size-5" />}
            onCreate={
              permissions.includes("branch:manage")
                ? () => openQuickCreate("branch")
                : undefined
            }
          >
            {branchesQuery.isLoading ? (
              <SectionLoading />
            ) : branchesQuery.data?.data.length ? (
              <div className="grid gap-2.5">
                {branchesQuery.data.data.map((branch) => (
                  <EntityRow
                    key={branch.id}
                    icon={<MapPin className="size-4" />}
                    title={branch.name || branch.city || text.notSpecified}
                    subtitle={branch.address || branch.city || text.notSpecified}
                    meta={branch.phone || undefined}
                  />
                ))}
              </div>
            ) : (
              <SectionEmpty />
            )}
          </Company360ActionSection>

          <Company360ActionSection
            title={text.ecosystem.social}
            count={
              socialQuery.data?.meta.total ?? overview?.socialChannelCount ?? 0
            }
            compact
            icon={<Share2 className="size-5" />}
            onCreate={
              permissions.includes("social-channel:manage")
                ? () => openQuickCreate("social-channel")
                : undefined
            }
          >
            {socialQuery.isLoading ? (
              <SectionLoading />
            ) : socialQuery.data?.data.length ? (
              <div className="grid gap-2.5">
                {socialQuery.data.data.map((channel) => (
                  <EntityRow
                    key={channel.id}
                    icon={<Share2 className="size-4" />}
                    title={channel.platform || text.notSpecified}
                    subtitle={channel.handle || text.notSpecified}
                  />
                ))}
              </div>
            ) : (
              <SectionEmpty />
            )}
          </Company360ActionSection>
        </div>
      </div>

      <CompanyFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        mode="edit"
        company={company}
        isPending={updateMutation.isPending}
        submitError={updateMutation.error}
        onSubmit={async (payload) => {
          await updateMutation.mutateAsync(payload)
          setEditOpen(false)
        }}
      />
    </div>
  )
}

function EntityRow({
  icon,
  title,
  subtitle,
  meta,
}: {
  icon: ReactNode
  title: string
  subtitle?: string
  meta?: string
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-[var(--app-divider)] bg-[var(--app-background)]/45 p-3.5 transition-all duration-200 hover:-translate-y-0.5 hover:bg-[var(--app-surface)] hover:shadow-sm">
      <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-[var(--app-primary-soft)] text-[var(--app-primary)]">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-bold text-[var(--app-heading)]">
          {title}
        </p>
        {subtitle ? (
          <p className="mt-1 truncate text-[10px] text-[var(--app-text-secondary)]">
            {subtitle}
          </p>
        ) : null}
      </div>
      {meta ? (
        <span
          dir="auto"
          className="max-w-32 shrink-0 truncate text-[10px] text-[var(--app-text-secondary)]"
        >
          {meta}
        </span>
      ) : null}
    </div>
  )
}

function SectionEmpty() {
  return (
    <p className="rounded-2xl bg-[var(--app-background)]/55 p-4 text-center text-xs text-[var(--app-text-secondary)]">
      {uiText.companies.detail.notSpecified}
    </p>
  )
}

function SectionLoading() {
  return (
    <div className="grid gap-2.5">
      <div className="h-14 animate-pulse rounded-2xl bg-[var(--app-background)]" />
      <div className="h-14 animate-pulse rounded-2xl bg-[var(--app-background)]" />
      <div className="h-14 animate-pulse rounded-2xl bg-[var(--app-background)]" />
    </div>
  )
}
