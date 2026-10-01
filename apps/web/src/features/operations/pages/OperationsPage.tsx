import { useMemo, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { ListChecks } from "lucide-react"
import { toast } from "sonner"
import { EntityListPage } from "@/components/shared/EntityListPage"
import { PageHero } from "@/components/shared/PageHero"
import { QueryContent } from "@/components/shared/QueryContent"
import { TaskFormDialog } from "@/features/tasks/components/TaskFormDialog"
import { OpportunityFormDialog } from "@/features/opportunities/components/OpportunityFormDialog"
import {
  useCreateOpportunity,
  usePipelineStages,
} from "@/features/opportunities/hooks/useOpportunities"
import { ActivityFormDialog } from "@/features/activities/components/ActivityFormDialog"
import { MeetingFormDialog } from "@/features/meetings/components/MeetingFormDialog"
import { useListQueryState } from "@/lib/listQuery"
import { getApiErrorMessage } from "@/lib/apiResponse"
import { useAuthStore } from "@/store/authStore"
import type { OpportunityPayload } from "@/features/opportunities/types/opportunity.types"
import { CompanyConversationDialog } from "../components/CompanyConversationDialog"
import { OperationsAttentionCards } from "../components/OperationsAttentionCards"
import { OperationsCompanyList } from "../components/OperationsCompanyList"
import {
  OperationsFilters,
  type OperationsFilterState,
} from "../components/OperationsFilters"
import {
  OperationsQuickActions,
  type OperationsDialogKind,
} from "../components/OperationsQuickActions"
import { ProductPriceDrawer } from "../components/ProductPriceDrawer"
import { useOperationsCompanies } from "../hooks/useOperationsCompanies"
import {
  operationsKeys,
  useOperationsWorkspace,
} from "../hooks/useOperationsWorkspace"
import type { OperationsCompanyRow } from "../types/operations.types"
import { PersonalTodoPanel } from "@/features/personalTodos/components/PersonalTodoPanel"

export function OperationsPage() {
  const permissions = useAuthStore((state) => state.user?.permissions ?? [])
  const queryClient = useQueryClient()
  const { params, page, pageSize, patch, setPage, setPageSize } =
    useListQueryState()
  const [dialog, setDialog] = useState<OperationsDialogKind | null>(null)
  const [selected, setSelected] = useState<OperationsCompanyRow | null>(null)
  const workspace = useOperationsWorkspace()
  const stages = usePipelineStages(dialog === "opportunity")
  const createOpportunity = useCreateOpportunity()
  const filters = useMemo<OperationsFilterState>(
    () => ({
      search: params.get("search") ?? "",
      priority: parseEnum(params.get("priority"), [
        "LOW",
        "MEDIUM",
        "HIGH",
        "STRATEGIC",
      ] as const),
      attentionState: parseEnum(params.get("attentionState"), [
        "OVERDUE",
        "TODAY",
        "UPCOMING",
        "NO_NEXT_ACTION",
        "NORMAL",
      ] as const),
      hasUnreadMessages:
        params.get("hasUnreadMessages") === "true" || undefined,
      hasActiveOpportunity:
        params.get("hasActiveOpportunity") === "true" || undefined,
      hasNoNextAction: params.get("hasNoNextAction") === "true" || undefined,
      ownershipScope:
        parseEnum(params.get("ownershipScope"), [
          "all",
          "mine",
          "team",
          "unassigned",
        ] as const) ?? "mine",
    }),
    [params]
  )
  const companies = useOperationsCompanies({
    page,
    limit: pageSize,
    search: filters.search.trim() || undefined,
    priority: filters.priority,
    attentionState: filters.attentionState,
    hasUnreadMessages: filters.hasUnreadMessages,
    hasActiveOpportunity: filters.hasActiveOpportunity,
    hasNoNextAction: filters.hasNoNextAction,
    ownershipScope: filters.ownershipScope,
  })
  const filtered = Boolean(
    filters.search ||
    filters.priority ||
    filters.attentionState ||
    filters.hasUnreadMessages ||
    filters.hasActiveOpportunity ||
    filters.hasNoNextAction ||
    filters.ownershipScope !== "mine"
  )

  const invalidateOperations = () =>
    queryClient.invalidateQueries({ queryKey: operationsKeys.all })
  const openDialog = (
    kind: OperationsDialogKind,
    row?: OperationsCompanyRow
  ) => {
    setSelected(row ?? null)
    setDialog(kind)
  }
  const closeDialog = () => {
    setDialog(null)
    setSelected(null)
  }
  const patchFilters = (values: Partial<OperationsFilterState>) => {
    const next: Record<string, string | undefined> = {}
    if ("search" in values) next.search = values.search
    if ("priority" in values) next.priority = values.priority
    if ("attentionState" in values) next.attentionState = values.attentionState
    if ("hasUnreadMessages" in values)
      next.hasUnreadMessages = values.hasUnreadMessages ? "true" : undefined
    if ("hasActiveOpportunity" in values)
      next.hasActiveOpportunity = values.hasActiveOpportunity
        ? "true"
        : undefined
    if ("hasNoNextAction" in values)
      next.hasNoNextAction = values.hasNoNextAction ? "true" : undefined
    if ("ownershipScope" in values) next.ownershipScope = values.ownershipScope
    patch(next, { replace: "search" in values })
  }
  const clearFilters = () =>
    patch({
      search: undefined,
      priority: undefined,
      attentionState: undefined,
      hasUnreadMessages: undefined,
      hasActiveOpportunity: undefined,
      hasNoNextAction: undefined,
      ownershipScope: undefined,
    })

  function selectAttention(id: string) {
    if (id === "today")
      patchFilters({
        attentionState: "TODAY",
        hasUnreadMessages: false,
        hasActiveOpportunity: false,
      })
    else if (id === "overdue")
      patchFilters({
        attentionState: "OVERDUE",
        hasUnreadMessages: false,
        hasActiveOpportunity: false,
      })
    else if (id === "unread")
      patchFilters({
        attentionState: undefined,
        hasUnreadMessages: true,
        hasActiveOpportunity: false,
      })
    else if (id === "active")
      patchFilters({
        attentionState: undefined,
        hasUnreadMessages: false,
        hasActiveOpportunity: true,
      })
    else if (id === "meetings" && permissions.includes("meeting:create"))
      openDialog("meeting")
  }

  return (
    <EntityListPage className="min-h-0 overflow-visible">
      <PageHero
        accessBadge={{ label: "مرکز عملیات فروش", icon: ListChecks }}
        title="عملیات من"
        description="همه چیز برای انجام کارهای روزانه فروش در یک صفحه"
        onRefresh={async () => {
          await invalidateOperations()
        }}
        refreshing={workspace.isFetching || companies.isFetching}
      />
      <QueryContent
        query={workspace}
        errorTitle="دریافت خلاصه عملیات ناموفق بود"
      >
        {workspace.data ? (
          <OperationsAttentionCards
            attention={workspace.data.attention}
            onSelect={selectAttention}
          />
        ) : null}
      </QueryContent>
      <OperationsQuickActions
        permissions={permissions}
        onAction={(kind) => openDialog(kind)}
      />
      <PersonalTodoPanel data={workspace.data?.personalTodos} />
      <OperationsFilters
        filters={filters}
        onPatch={patchFilters}
        onClear={clearFilters}
      />
      <section
        aria-labelledby="operations-companies-title"
        className="grid gap-3"
      >
        <div>
          <h2 id="operations-companies-title" className="ui-section-title">
            شرکت‌های فعال من
          </h2>
          <p className="mt-1 text-xs text-[var(--app-text-secondary)]">
            حساب‌هایی که برای اقدام، پیگیری یا گفتگو به توجه شما نیاز دارند.
          </p>
        </div>
        <QueryContent
          query={companies}
          errorTitle="دریافت شرکت‌های عملیاتی ناموفق بود"
        >
          <OperationsCompanyList
            page={page}
            pageSize={pageSize}
            result={companies.data}
            permissions={permissions}
            fetching={companies.isFetching}
            filtered={filtered}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            onAction={(action, row) => openDialog(action, row)}
          />
        </QueryContent>
      </section>

      <TaskFormDialog
        open={dialog === "task"}
        onOpenChange={(open) => {
          if (!open) closeDialog()
        }}
        initialCompanyId={selected?.company.id}
        lockCompany={Boolean(selected)}
        onSaved={() => {
          void invalidateOperations()
        }}
      />
      <ActivityFormDialog
        open={dialog === "activity"}
        onOpenChange={(open) => {
          if (!open) closeDialog()
        }}
        initialTargetType="COMPANY"
        initialCompanyId={selected?.company.id}
        lockTarget={Boolean(selected)}
        onSaved={invalidateOperations}
      />
      <MeetingFormDialog
        open={dialog === "meeting"}
        onOpenChange={(open) => {
          if (!open) closeDialog()
        }}
        initialCompanyId={selected?.company.id}
        lockCompany={Boolean(selected)}
        onSaved={() => {
          void invalidateOperations()
        }}
      />
      <OpportunityFormDialog
        open={dialog === "opportunity"}
        onOpenChange={(open) => {
          if (!open) closeDialog()
        }}
        initialCompanyId={selected?.company.id}
        lockCompany={Boolean(selected)}
        stages={stages.data ?? []}
        isPending={createOpportunity.isPending}
        onSubmit={async (payload) => {
          try {
            await createOpportunity.mutateAsync(payload as OpportunityPayload)
            closeDialog()
            await invalidateOperations()
            toast.success("فرصت با موفقیت ایجاد شد.")
          } catch (error) {
            toast.error(getApiErrorMessage(error, "ایجاد فرصت انجام نشد."))
            throw error
          }
        }}
      />
      <CompanyConversationDialog
        company={
          dialog === "conversation" && selected ? selected.company : null
        }
        onClose={() => {
          closeDialog()
          void invalidateOperations()
        }}
      />
      <ProductPriceDrawer
        open={dialog === "products"}
        onOpenChange={(open) => {
          if (!open) closeDialog()
        }}
      />
    </EntityListPage>
  )
}

function parseEnum<const T extends string>(
  value: string | null,
  options: readonly T[]
): T | undefined {
  return options.includes(value as T) ? (value as T) : undefined
}
