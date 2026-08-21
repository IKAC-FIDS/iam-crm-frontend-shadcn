import {
  Activity,
  Building2,
  CalendarClock,
  CircleDollarSign,
  ContactRound,
  ExternalLink,
  Target,
  UserRound,
} from "lucide-react"
import type { ReactNode } from "react"

import { EmptyState } from "@/components/shared/EmptyState"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { SurfaceCard } from "@/components/shared/SurfaceCard"
import { uiText } from "@/config/uiText"
import { formatJalaliDate, formatJalaliDateTime } from "@/lib/date/jalali"
import { Button } from "@workspace/ui/components/button"
import type { Opportunity } from "../types/opportunity.types"
import {
  formatOpportunityValue,
  opportunityCompanyName,
} from "../utils/opportunityFormatters"

export function OpportunityExecutiveSummary({
  opportunity,
}: {
  opportunity: Opportunity
}) {
  const text = uiText.opportunities.detail.summary
  const value = Number(opportunity.estimatedValue) || 0
  const probability = opportunity.probability
  const weighted =
    probability === null || probability === undefined
      ? null
      : (value * probability) / 100
  const close = opportunity.expectedCloseDate
    ? new Date(opportunity.expectedCloseDate)
    : null
  const days =
    close && !Number.isNaN(close.getTime())
      ? Math.ceil((close.getTime() - Date.now()) / 86_400_000)
      : null
  const activities = Array.isArray(opportunity.activities)
    ? opportunity.activities
    : []
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <SummaryCard icon={<CircleDollarSign />} title={text.commercial}>
        <Metric
          label={text.estimated}
          value={valueLabel(opportunity.estimatedValue)}
        />
        <Metric
          label={text.weighted}
          value={
            weighted === null
              ? uiText.common.notAvailable
              : valueLabel(weighted)
          }
        />
      </SummaryCard>
      <SummaryCard icon={<CalendarClock />} title={text.timing}>
        <Metric
          label={uiText.opportunities.fields.expectedCloseDate}
          value={
            formatJalaliDate(opportunity.expectedCloseDate) ||
            uiText.common.notAvailable
          }
        />
        <Metric
          label={text.remaining}
          value={
            days === null
              ? uiText.common.notAvailable
              : days === 0
                ? text.today
                : `${Math.abs(days).toLocaleString("fa-IR")} ${text.days}${days < 0 ? ` · ${text.overdue}` : ""}`
          }
        />
      </SummaryCard>
      <SummaryCard icon={<Target />} title={text.engagement}>
        <Metric
          label={uiText.opportunities.fields.probability}
          value={
            probability === null || probability === undefined
              ? uiText.common.notAvailable
              : `${probability.toLocaleString("fa-IR")}%`
          }
        />
        <Metric
          label={uiText.opportunities.fields.primaryContact}
          value={
            opportunity.primaryContact?.fullName || uiText.common.notAvailable
          }
        />
      </SummaryCard>
      <SummaryCard icon={<Activity />} title={text.activity}>
        <Metric
          label={text.activity}
          value={
            activities[0]?.occurredAt
              ? formatJalaliDateTime(activities[0].occurredAt)
              : text.noActivity
          }
        />
        <Metric
          label={uiText.opportunities.detail.fields.owner}
          value={
            opportunity.owner?.fullName || uiText.opportunities.fields.noOwner
          }
        />
      </SummaryCard>
    </div>
  )
}

export function OpportunityOverview({
  opportunity,
  canViewCompany,
  canViewPerson,
  canEdit,
  onCompany,
  onPerson,
  onEdit,
}: {
  opportunity: Opportunity
  canViewCompany: boolean
  canViewPerson: boolean
  canEdit: boolean
  onCompany: () => void
  onPerson: () => void
  onEdit: () => void
}) {
  const text = uiText.opportunities.detail
  const activities = Array.isArray(opportunity.activities)
    ? opportunity.activities
    : []
  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(300px,.8fr)]">
      <div className="grid content-start gap-4">
        <SurfaceCard className="p-5">
          <h2 className="text-sm font-bold text-[var(--app-heading)]">
            {text.sections.description}
          </h2>
          {opportunity.description ? (
            <p className="mt-3 text-xs leading-7 whitespace-pre-wrap text-[var(--app-text-secondary)]">
              {opportunity.description}
            </p>
          ) : (
            <p className="mt-3 text-xs text-[var(--app-text-secondary)]">
              {text.empty.description}
            </p>
          )}
        </SurfaceCard>
        <SurfaceCard className="p-5">
          <h2 className="text-sm font-bold text-[var(--app-heading)]">
            {text.sections.businessContext}
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Info
              label={text.fields.source}
              value={opportunity.sourceOption?.label || opportunity.source}
            />
            <Info
              label={text.fields.competitor}
              value={opportunity.competitor}
            />
            <Info
              label={text.fields.createdAt}
              value={formatJalaliDateTime(opportunity.createdAt)}
            />
            <Info
              label={text.fields.updatedAt}
              value={formatJalaliDateTime(opportunity.updatedAt)}
            />
          </div>
        </SurfaceCard>
        <SurfaceCard className="p-5">
          <h2 className="text-sm font-bold text-[var(--app-heading)]">
            {text.sections.recentActivity}
          </h2>
          {activities.length ? (
            <div className="mt-4 grid gap-0">
              {activities.slice(0, 8).map((item, index, recent) => (
                <div
                  key={item.id}
                  className="relative border-s border-[var(--app-divider)] ps-5 pb-5 last:pb-0"
                >
                  {index === 0 ||
                  formatJalaliDate(recent[index - 1]?.occurredAt) !==
                    formatJalaliDate(item.occurredAt) ? (
                    <p className="mb-2 text-[9px] font-bold text-[var(--app-text-secondary)]">
                      {formatJalaliDate(item.occurredAt)}
                    </p>
                  ) : null}
                  <span className="absolute -start-1.5 top-1 size-3 rounded-full border-2 border-[var(--app-surface)] bg-[var(--app-primary)]" />
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <StatusBadge
                      tone={
                        item.type === "STAGE_CHANGE" ? "primary" : "neutral"
                      }
                    >
                      {activityLabel(item.type)}
                    </StatusBadge>
                    <time className="text-[9px] text-[var(--app-text-secondary)]">
                      {formatJalaliDateTime(item.occurredAt)}
                    </time>
                  </div>
                  {item.outcome ? (
                    <p className="mt-2 text-xs font-bold text-[var(--app-heading)]">
                      {item.outcome}
                    </p>
                  ) : null}
                  {item.notes ? (
                    <p className="mt-1 text-[10px] leading-5 whitespace-pre-wrap text-[var(--app-text-secondary)]">
                      {item.notes}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon={Activity} title={text.empty.activities} />
          )}
        </SurfaceCard>
      </div>
      <aside className="grid content-start gap-4">
        <SurfaceCard className="p-5">
          <div className="flex items-start gap-3">
            <div className="grid size-10 place-items-center rounded-xl bg-[var(--app-primary-soft)] text-[var(--app-primary)]">
              <Building2 className="size-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-sm font-bold text-[var(--app-heading)]">
                {text.sections.company}
              </h2>
              <p className="mt-2 text-xs font-bold text-[var(--app-heading)]">
                {opportunityCompanyName(opportunity)}
              </p>
              <p className="mt-1 text-[10px] text-[var(--app-text-secondary)]">
                {opportunity.company?.industry || uiText.common.notAvailable}
              </p>
            </div>
          </div>
          {canViewCompany ? (
            <Button
              variant="outline"
              size="sm"
              className="mt-4 w-full rounded-xl"
              onClick={onCompany}
            >
              <ExternalLink className="size-3.5" />
              {text.actions.company}
            </Button>
          ) : null}
        </SurfaceCard>
        <SurfaceCard className="p-5">
          <div className="flex items-start gap-3">
            <div className="grid size-10 place-items-center rounded-xl bg-[var(--app-primary-soft)] text-[var(--app-primary)]">
              <ContactRound className="size-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-sm font-bold text-[var(--app-heading)]">
                {text.sections.contact}
              </h2>
              {opportunity.primaryContact ? (
                <>
                  <p className="mt-2 text-xs font-bold text-[var(--app-heading)]">
                    {opportunity.primaryContact.fullName}
                  </p>
                  <p className="mt-1 text-[10px] text-[var(--app-text-secondary)]">
                    {[
                      opportunity.primaryContact.title,
                      opportunity.primaryContact.department,
                    ]
                      .filter(Boolean)
                      .join(" · ") || uiText.common.notAvailable}
                  </p>
                  <p className="mt-2 text-[10px] text-[var(--app-text-secondary)]">
                    {opportunity.primaryContact.email ||
                      opportunity.primaryContact.phone ||
                      uiText.common.notAvailable}
                  </p>
                </>
              ) : (
                <p className="mt-2 text-[10px] leading-5 text-[var(--app-text-secondary)]">
                  {text.empty.contact}
                </p>
              )}
            </div>
          </div>
          {opportunity.primaryContact && canViewPerson ? (
            <Button
              variant="outline"
              size="sm"
              className="mt-4 w-full rounded-xl"
              onClick={onPerson}
            >
              <UserRound className="size-3.5" />
              {text.actions.contact}
            </Button>
          ) : !opportunity.primaryContact && canEdit ? (
            <Button
              variant="outline"
              size="sm"
              className="mt-4 w-full rounded-xl"
              onClick={onEdit}
            >
              {uiText.opportunities.actions.edit}
            </Button>
          ) : null}
        </SurfaceCard>
        <SurfaceCard className="p-5">
          <h2 className="text-sm font-bold text-[var(--app-heading)]">
            {text.sections.ownership}
          </h2>
          <div className="mt-4 grid gap-3">
            <Info
              icon={<UserRound />}
              label={text.fields.owner}
              value={opportunity.owner?.fullName}
            />
            <Info
              icon={<CalendarClock />}
              label={uiText.opportunities.fields.expectedCloseDate}
              value={formatJalaliDate(opportunity.expectedCloseDate)}
            />
          </div>
        </SurfaceCard>
      </aside>
    </div>
  )
}

function SummaryCard({
  icon,
  title,
  children,
}: {
  icon: ReactNode
  title: string
  children: ReactNode
}) {
  return (
    <SurfaceCard className="p-4">
      <div className="flex items-center gap-2 text-xs font-bold text-[var(--app-heading)]">
        <span className="grid size-8 place-items-center rounded-xl bg-[var(--app-primary-soft)] text-[var(--app-primary)] [&_svg]:size-4">
          {icon}
        </span>
        {title}
      </div>
      <div className="mt-4 grid gap-2">{children}</div>
    </SurfaceCard>
  )
}
function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 text-[10px]">
      <span className="text-[var(--app-text-secondary)]">{label}</span>
      <span className="font-bold text-[var(--app-heading)]">{value}</span>
    </div>
  )
}
function Info({
  label,
  value,
  icon,
}: {
  label: string
  value?: string | null
  icon?: ReactNode
}) {
  return (
    <div className="rounded-2xl bg-[var(--app-background)]/65 p-3">
      <p className="flex items-center gap-1 text-[9px] font-bold text-[var(--app-text-secondary)] [&_svg]:size-3">
        {icon}
        {label}
      </p>
      <p className="mt-1.5 text-xs text-[var(--app-heading)]">
        {value || uiText.common.notAvailable}
      </p>
    </div>
  )
}
function activityLabel(type: string) {
  const labels = uiText.opportunities.detail.activityTypes as Record<
    string,
    string
  >
  return labels[type] || type
}

function valueLabel(value?: number | string | null) {
  if (value === null || value === undefined || value === "")
    return uiText.common.notAvailable
  return `${formatOpportunityValue(value)} ${uiText.opportunities.fields.valueUnit}`
}
