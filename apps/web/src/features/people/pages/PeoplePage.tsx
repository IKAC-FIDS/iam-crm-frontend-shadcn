import {
  ContactRound,
  Mail,
  Network,
  Phone,
  Plus,
  UsersRound,
} from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "react-router-dom"

import { EmptyState } from "@/components/shared/EmptyState"
import { ErrorState } from "@/components/shared/ErrorState"
import { LoadingState } from "@/components/shared/LoadingState"
import { PaginationControls } from "@/components/shared/PaginationControls"
import { uiText } from "@/config/uiText"
import { useAuthStore } from "@/store/authStore"
import { Button } from "@workspace/ui/components/button"

import { PeopleFilterBar } from "../components/PeopleFilterBar"
import { CreatePersonDialog } from "../components/CreatePersonDialog"
import { Person360WorkspaceDialog } from "../components/Person360WorkspaceDialog"
import { PersonCard } from "../components/PersonCard"
import { usePeopleDirectory, usePeopleLookups } from "../hooks/usePeople"
import type { PeopleDirectoryQuery } from "../types/person.types"

const initialQuery: PeopleDirectoryQuery = {
  page: 1,
  limit: 20,
}

export function PeoplePage() {
  const text = uiText.people
  const [searchParams] = useSearchParams()
  const initialCompanyId = searchParams.get("companyId")?.trim() || undefined
  const permissions = useAuthStore((state) => state.user?.permissions ?? [])

  const canViewDirectory = permissions.includes("people:directory:view")
  const canViewPerson = permissions.includes("person:view")
  const canCreate = permissions.includes("person:create")

  const [query, setQuery] = useState<PeopleDirectoryQuery>(() => ({
    ...initialQuery,
    companyId: initialCompanyId,
  }))
  const [debouncedQuery, setDebouncedQuery] =
    useState<PeopleDirectoryQuery>(() => ({
      ...initialQuery,
      companyId: initialCompanyId,
    }))
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedQuery(query)
    }, 350)
    return () => window.clearTimeout(timeout)
  }, [query])

  const directory = usePeopleDirectory(debouncedQuery, canViewDirectory)
  const lookups = usePeopleLookups()

  const metrics = useMemo(() => {
    const rows = directory.data?.data ?? []
    return {
      total: directory.data?.meta.total ?? 0,
      primary: rows.filter((item) => item.isPrimaryContact).length,
      phone: rows.filter((item) => item.phoneSummary || item.phone).length,
      email: rows.filter((item) => item.emailSummary || item.email).length,
    }
  }, [directory.data])

  function patchQuery(patch: Partial<PeopleDirectoryQuery>) {
    setQuery((current) => ({ ...current, ...patch }))
  }

  return (
    <div className="grid gap-5">
      <section className="relative overflow-hidden rounded-[30px] border border-[var(--app-divider)] bg-[var(--app-surface)] px-5 py-6 shadow-[var(--app-shadow-card)] sm:px-7">
        <div className="pointer-events-none absolute -end-20 -top-28 size-64 rounded-full bg-[var(--app-primary-soft)] blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 start-1/3 h-24 w-72 bg-[var(--app-info-light)]/35 blur-3xl" />

        <div className="relative flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="max-w-2xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[var(--app-divider)] bg-[var(--app-background)]/70 px-3 py-1.5 text-xs font-bold text-[var(--app-primary)]">
              <Network className="size-3.5" />
              {text.hero.badge}
            </div>
            <h1 className="ui-page-title">
              {text.hero.title}
            </h1>
            <p className="mt-2 max-w-xl text-xs leading-6 text-[var(--app-text-secondary)]">
              {text.hero.description}
            </p>
          </div>

          {canCreate ? (
            <Button
              type="button"
              className="w-fit rounded-xl bg-[var(--app-primary)] text-[var(--app-on-primary)] hover:bg-[var(--app-primary-hover)]"
              onClick={() => setCreateOpen(true)}
            >
              <Plus className="size-4" />
              {text.actions.create}
            </Button>
          ) : null}
        </div>

        <div className="relative mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Metric
            icon={<UsersRound className="size-4" />}
            label={text.metrics.total}
            value={metrics.total}
            exact
          />
          <Metric
            icon={<ContactRound className="size-4" />}
            label={text.metrics.primaryCurrentPage}
            value={metrics.primary}
          />
          <Metric
            icon={<Phone className="size-4" />}
            label={text.metrics.phoneCurrentPage}
            value={metrics.phone}
          />
          <Metric
            icon={<Mail className="size-4" />}
            label={text.metrics.emailCurrentPage}
            value={metrics.email}
          />
        </div>
      </section>

      <PeopleFilterBar
        query={query}
        lookups={lookups.data}
        onChange={patchQuery}
        onClear={() => setQuery(initialQuery)}
      />

      {!canViewDirectory ? (
        <ErrorState
          title={text.errors.permissionTitle}
          description={text.errors.permissionDescription}
        />
      ) : directory.isLoading ? (
        <LoadingState />
      ) : directory.isError ? (
        <ErrorState
          title={text.errors.listTitle}
          description={text.errors.listDescription}
          retryLabel={uiText.common.retry}
          onRetry={() => void directory.refetch()}
        />
      ) : directory.data?.data.length ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
            {directory.data.data.map((person) => (
              <PersonCard
                key={person.id}
                person={person}
                lookups={lookups.data}
                onClick={() => {
                  if (canViewPerson) setSelectedPersonId(person.id)
                }}
              />
            ))}
          </div>

          <PaginationControls page={directory.data.meta.page} pageCount={directory.data.meta.totalPages} pageSize={query.limit} total={directory.data.meta.total} onPageChange={(page) => patchQuery({ page })} onPageSizeChange={(limit) => patchQuery({ limit, page: 1 })} disabled={directory.isFetching} />
        </>
      ) : (
        <EmptyState
          icon={UsersRound}
          title={text.empty.listTitle}
          description={text.empty.listDescription}
        />
      )}

      {selectedPersonId ? (
        <Person360WorkspaceDialog
          personId={selectedPersonId}
          open
          onOpenChange={(open) => {
            if (!open) setSelectedPersonId(null)
          }}
        />
      ) : null}

      <CreatePersonDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={(person) => setSelectedPersonId(person.id)}
      />

    </div>
  )
}

function Metric({
  icon,
  label,
  value,
  exact = false,
}: {
  icon: React.ReactNode
  label: string
  value: number
  exact?: boolean
}) {
  const text = uiText.people
  return (
    <div className="rounded-[20px] border border-[var(--app-divider)] bg-[var(--app-surface)]/85 p-4 backdrop-blur-sm">
      <div className="flex items-center gap-2 text-xs font-bold text-[var(--app-text-secondary)]">
        <span className="grid size-8 place-items-center rounded-xl bg-[var(--app-primary-soft)] text-[var(--app-primary)]">
          {icon}
        </span>
        {label}
      </div>
      <p className="mt-3 text-xl font-bold text-[var(--app-heading)]">
        {value.toLocaleString("fa-IR")}
      </p>
      {!exact ? (
        <p className="mt-1 text-xs text-[var(--app-text-secondary)]">
          {text.metrics.currentPageHint}
        </p>
      ) : null}
    </div>
  )
}
