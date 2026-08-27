import {
  Archive,
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  CircleDollarSign,
  FileClock,
  Layers3,
  ListChecks,
  Pencil,
  RotateCcw,
  UserRoundCog,
  Waypoints,
} from "lucide-react"
import { useMemo, useState } from "react"
import { useLocation, useNavigate, useParams } from "react-router-dom"
import { toast } from "sonner"

import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { ErrorState } from "@/components/shared/ErrorState"
import { LoadingState } from "@/components/shared/LoadingState"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { Person360WorkspaceDialog } from "@/features/people/components/Person360WorkspaceDialog"
import { uiText } from "@/config/uiText"
import { getApiErrorMessage } from "@/lib/apiResponse"
import { useAuthStore } from "@/store/authStore"
import { Button } from "@workspace/ui/components/button"

import { ChangeOpportunityOwnerDialog } from "../components/ChangeOpportunityOwnerDialog"
import { ChangeOpportunityStageDialog } from "../components/ChangeOpportunityStageDialog"
import { OpportunityCommercialSection } from "../components/OpportunityCommercialSection"
import { OpportunityExecutionSection } from "../components/OpportunityExecutionSection"
import { OpportunityFilesHistorySection } from "../components/OpportunityFilesHistorySection"
import { OpportunityFormDialog } from "../components/OpportunityFormDialog"
import {
  OpportunityExecutiveSummary,
  OpportunityOverview,
} from "../components/OpportunityOverview"
import { OpportunityProgressRail } from "../components/OpportunityProgressRail"
import {
  useArchiveOpportunity,
  useChangeOpportunityOwner,
  useChangeOpportunityStage,
  useOpportunity,
  usePipelineStages,
  usePipelineTransitions,
  useRestoreOpportunity,
  useUpdateOpportunity,
} from "../hooks/useOpportunities"
import type {
  Opportunity,
  OpportunityPayload,
  OpportunityStage,
  OpportunityTransition,
  OpportunityUpdatePayload,
} from "../types/opportunity.types"
import { opportunityCompanyName } from "../utils/opportunityFormatters"

type DetailTab = "overview" | "commercial" | "execution" | "files"

function allowedTargets(
  opportunity: Opportunity,
  stages: OpportunityStage[],
  transitions: OpportunityTransition[],
  role?: string
) {
  const relevant = transitions.filter(
    (rule) => rule.fromStageId === opportunity.stageId
  )
  return stages.filter((stage) => {
    if (stage.id === opportunity.stageId) return false
    const roleRule = relevant.find(
      (rule) => rule.toStageId === stage.id && rule.role === role
    )
    const generalRule = relevant.find(
      (rule) => rule.toStageId === stage.id && rule.role == null
    )
    const rule = roleRule ?? generalRule
    return Boolean(rule && (rule.isAllowed ?? rule.allowed ?? false))
  })
}

export function OpportunityDetailPage() {
  const text = uiText.opportunities
  const detailText = text.detail
  const { id = "" } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const user = useAuthStore((state) => state.user)
  const permissions = user?.permissions ?? []
  const canView = permissions.includes("opportunity:view")
  const canUpdate = permissions.includes("opportunity:update")
  const canChangeOwner = permissions.includes("opportunity:change-owner")
  const canChangeStage = permissions.includes("opportunity:change-stage")
  const canArchive = permissions.includes("opportunity:archive")
  const canRestore = permissions.includes("opportunity:restore")
  const [tab, setTab] = useState<DetailTab>("overview")
  const [editOpen, setEditOpen] = useState(false)
  const [ownerOpen, setOwnerOpen] = useState(false)
  const [stageOpen, setStageOpen] = useState(false)
  const [archiveOpen, setArchiveOpen] = useState(false)
  const [personOpen, setPersonOpen] = useState(false)

  const opportunityQuery = useOpportunity(id, canView)
  const stagesQuery = usePipelineStages(canView)
  const transitionsQuery = usePipelineTransitions(canView && canChangeStage)
  const stages = useMemo(
    () =>
      (Array.isArray(stagesQuery.data) ? stagesQuery.data : [])
        .filter((stage) => stage.isActive !== false)
        .sort((left, right) => left.sortOrder - right.sortOrder),
    [stagesQuery.data]
  )
  const transitions = Array.isArray(transitionsQuery.data)
    ? transitionsQuery.data
    : []
  const opportunity = opportunityQuery.data
  const targets = opportunity
    ? allowedTargets(opportunity, stages, transitions, user?.role)
    : []
  const updateMutation = useUpdateOpportunity()
  const ownerMutation = useChangeOpportunityOwner()
  const stageMutation = useChangeOpportunityStage()
  const archiveMutation = useArchiveOpportunity()
  const restoreMutation = useRestoreOpportunity()

  const stateBackTo = (location.state as { backTo?: unknown } | null)?.backTo
  const backTo =
    typeof stateBackTo === "string" &&
    stateBackTo.startsWith("/") &&
    !stateBackTo.startsWith("//")
      ? stateBackTo
      : "/opportunities"

  async function submitEdit(
    payload: OpportunityPayload | OpportunityUpdatePayload
  ) {
    if (!opportunity) return
    try {
      await updateMutation.mutateAsync({
        id: opportunity.id,
        payload: payload as OpportunityUpdatePayload,
      })
      toast.success(text.feedback.updated)
      setEditOpen(false)
    } catch (error) {
      toast.error(getApiErrorMessage(error, text.errors.mutation))
    }
  }

  async function submitOwner(ownerId: string | null) {
    if (!opportunity) return
    try {
      await ownerMutation.mutateAsync({ id: opportunity.id, ownerId })
      toast.success(text.feedback.ownerChanged)
      setOwnerOpen(false)
    } catch (error) {
      toast.error(getApiErrorMessage(error, text.errors.ownerMutation))
    }
  }

  async function submitStage(stageId: string, note?: string) {
    if (!opportunity) return
    try {
      await stageMutation.mutateAsync({
        opportunity,
        stageId,
        note,
        optimistic: false,
      })
      toast.success(text.feedback.stageChanged)
      setStageOpen(false)
    } catch (error) {
      toast.error(getApiErrorMessage(error, text.errors.stageMutation))
    }
  }

  async function toggleArchive() {
    if (!opportunity) return
    try {
      if (opportunity.archivedAt) {
        await restoreMutation.mutateAsync(opportunity.id)
        toast.success(text.feedback.restored)
      } else {
        await archiveMutation.mutateAsync({ id: opportunity.id })
        toast.success(text.feedback.archived)
      }
      setArchiveOpen(false)
    } catch (error) {
      toast.error(getApiErrorMessage(error, text.errors.mutation))
    }
  }

  if (!canView)
    return (
      <ErrorState
        title={text.errors.permissionTitle}
        description={text.errors.permissionDescription}
      />
    )
  if (opportunityQuery.isLoading) return <LoadingState />
  if (opportunityQuery.isError || !opportunity)
    return (
      <ErrorState
        title={detailText.errors.title}
        description={detailText.errors.description}
        retryLabel={uiText.common.retry}
        onRetry={() => void opportunityQuery.refetch()}
      />
    )

  const archived = Boolean(opportunity.archivedAt)
  const navItems: Array<{
    id: DetailTab
    label: string
    icon: typeof BriefcaseBusiness
  }> = [
    { id: "overview", label: detailText.nav.overview, icon: BriefcaseBusiness },
    {
      id: "commercial",
      label: detailText.nav.commercial,
      icon: CircleDollarSign,
    },
    { id: "execution", label: detailText.nav.execution, icon: ListChecks },
    { id: "files", label: detailText.nav.files, icon: FileClock },
  ]

  return (
    <div className="mx-auto grid w-full max-w-[1440px] min-w-0 gap-4" dir="rtl">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-8 w-fit rounded-lg px-2 text-[var(--app-text-secondary)]"
        onClick={() => navigate(backTo)}
      >
        <ArrowRight className="size-4" />
        {detailText.back}
      </Button>

      <header
        className={
          archived
            ? "max-w-full min-w-0 rounded-[24px] border border-[var(--warning)]/35 bg-[var(--app-surface)] p-4 shadow-[var(--app-shadow-card)] sm:p-5"
            : "max-w-full min-w-0 rounded-[24px] border border-[var(--app-divider)] bg-[var(--app-surface)] p-4 shadow-[var(--app-shadow-card)] sm:p-5"
        }
      >
        <div className="flex min-w-0 flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge tone={archived ? "warning" : "success"}>
                {archived ? text.status.archived : text.status.active}
              </StatusBadge>
              <StatusBadge tone="neutral">
                {text.priorities[opportunity.priority]}
              </StatusBadge>
            </div>
            <h1 className="mt-2 max-w-full text-xl font-bold break-words text-[var(--app-heading)] sm:text-2xl">
              {opportunity.title}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-[var(--app-text-secondary)]">
              <span className="flex max-w-full min-w-0 items-center gap-1.5">
                <Building2 className="size-3.5 shrink-0" />
                <span className="min-w-0 break-words">
                  {opportunityCompanyName(opportunity)}
                </span>
              </span>
              <span className="flex max-w-full min-w-0 items-center gap-1.5">
                <Layers3 className="size-3.5 shrink-0" />
                <span className="min-w-0 break-words">
                  {opportunity.stage?.label || uiText.common.notAvailable}
                </span>
              </span>
            </div>
            {archived && opportunity.archiveReason ? (
              <p className="mt-2 rounded-lg bg-[var(--warning-light)] px-3 py-1.5 text-xs text-[var(--app-text-secondary)]">
                {opportunity.archiveReason}
              </p>
            ) : null}
          </div>
          <div className="flex max-w-full shrink-0 flex-wrap gap-1.5">
            {canUpdate && !archived ? (
              <Button
                variant="outline"
                size="sm"
                className="h-9 rounded-lg"
                onClick={() => setEditOpen(true)}
              >
                <Pencil className="size-4" />
                {text.actions.edit}
              </Button>
            ) : null}
            {canChangeStage && !archived ? (
              <Button
                variant="outline"
                size="sm"
                className="h-9 rounded-lg"
                disabled={
                  transitionsQuery.isLoading ||
                  transitionsQuery.isError ||
                  !targets.length
                }
                onClick={() => setStageOpen(true)}
              >
                <Waypoints className="size-4" />
                {text.actions.changeStage}
              </Button>
            ) : null}
            {canChangeOwner && !archived ? (
              <Button
                variant="outline"
                size="sm"
                className="h-9 rounded-lg"
                onClick={() => setOwnerOpen(true)}
              >
                <UserRoundCog className="size-4" />
                {text.actions.changeOwner}
              </Button>
            ) : null}
            {archived && canRestore ? (
              <Button
                size="sm"
                className="h-9 rounded-lg bg-[var(--app-primary)]"
                onClick={() => setArchiveOpen(true)}
              >
                <RotateCcw className="size-4" />
                {text.actions.restore}
              </Button>
            ) : !archived && canArchive ? (
              <Button
                variant="outline"
                size="sm"
                className="h-9 rounded-lg text-[var(--destructive)]"
                onClick={() => setArchiveOpen(true)}
              >
                <Archive className="size-4" />
                {text.actions.archive}
              </Button>
            ) : null}
          </div>
        </div>
      </header>

      <OpportunityExecutiveSummary opportunity={opportunity} />
      <OpportunityProgressRail opportunity={opportunity} stages={stages} />
      {stagesQuery.isError ? (
        <ErrorState
          title={text.errors.stagesTitle}
          description={text.errors.stagesDescription}
          retryLabel={uiText.common.retry}
          onRetry={() => void stagesQuery.refetch()}
        />
      ) : null}
      {transitionsQuery.isError && canChangeStage && !archived ? (
        <p className="rounded-xl border border-[var(--warning)]/20 bg-[var(--warning-light)] p-3 text-xs text-[var(--app-text-secondary)]">
          {text.errors.transitions}
        </p>
      ) : null}

      <nav className="flex w-full max-w-full min-w-0 gap-1 overflow-x-auto rounded-xl border border-[var(--app-primary)]/15 bg-[var(--app-surface)] p-1 shadow-sm">
        {navItems.map((item) => (
          <Button
            key={item.id}
            type="button"
            variant="ghost"
            className={
              tab === item.id
                ? "h-9 min-w-fit shrink-0 rounded-lg bg-[var(--app-primary)] text-[var(--app-on-primary)] shadow-sm hover:bg-[var(--app-primary-hover)] sm:flex-1"
                : "h-9 min-w-fit shrink-0 rounded-lg text-[var(--app-text-secondary)] hover:bg-[var(--app-primary-soft)]/55 sm:flex-1"
            }
            onClick={() => setTab(item.id)}
          >
            <item.icon className="size-4" />
            {item.label}
          </Button>
        ))}
      </nav>

      {tab === "overview" ? (
        <OpportunityOverview
          opportunity={opportunity}
          canViewCompany={permissions.includes("company:view")}
          canViewPerson={permissions.includes("person:view")}
          canEdit={canUpdate && !archived}
          onCompany={() => navigate(`/companies/${opportunity.companyId}`)}
          onPerson={() => setPersonOpen(true)}
          onEdit={() => setEditOpen(true)}
        />
      ) : null}
      {tab === "commercial" ? (
        <OpportunityCommercialSection
          opportunity={opportunity}
          permissions={permissions}
        />
      ) : null}
      {tab === "execution" ? (
        <OpportunityExecutionSection
          opportunity={opportunity}
          permissions={permissions}
        />
      ) : null}
      {tab === "files" ? (
        <OpportunityFilesHistorySection
          opportunity={opportunity}
          permissions={permissions}
        />
      ) : null}

      {editOpen ? (
        <OpportunityFormDialog
          open
          onOpenChange={setEditOpen}
          opportunity={opportunity}
          initialCompanyId={opportunity.companyId}
          lockCompany
          stages={stages}
          isPending={updateMutation.isPending}
          onSubmit={submitEdit}
        />
      ) : null}
      {ownerOpen ? (
        <ChangeOpportunityOwnerDialog
          opportunity={opportunity}
          open
          onOpenChange={setOwnerOpen}
          isPending={ownerMutation.isPending}
          onSubmit={submitOwner}
        />
      ) : null}
      {stageOpen ? (
        <ChangeOpportunityStageDialog
          targets={targets}
          open
          onOpenChange={setStageOpen}
          isPending={stageMutation.isPending}
          onSubmit={submitStage}
        />
      ) : null}
      <ConfirmDialog
        open={archiveOpen}
        onOpenChange={setArchiveOpen}
        title={archived ? text.dialogs.restoreTitle : text.dialogs.archiveTitle}
        description={
          archived
            ? text.dialogs.restoreDescription
            : text.dialogs.archiveDescription
        }
        confirmLabel={archived ? text.actions.restore : text.actions.archive}
        tone={archived ? "primary" : "danger"}
        isPending={archiveMutation.isPending || restoreMutation.isPending}
        onConfirm={toggleArchive}
      />
      {opportunity.primaryContact?.id ? (
        <Person360WorkspaceDialog
          personId={opportunity.primaryContact.id}
          open={personOpen}
          onOpenChange={setPersonOpen}
          onPersonChanged={() => opportunityQuery.refetch()}
        />
      ) : null}
    </div>
  )
}
