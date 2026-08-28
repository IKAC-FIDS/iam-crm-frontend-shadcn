import { MetricCard } from "@/components/shared/MetricCard"
import { EntityListPage } from "@/components/shared/EntityListPage"
import { PageHero } from "@/components/shared/PageHero"
import {
  ContactRound,
  Mail,
  Network,
  Phone,
  Plus,
  UsersRound,
} from "lucide-react"
import { useMemo, useState } from "react"
import { useListQueryState } from "@/lib/listQuery"
import { useDebouncedValue } from "@/lib/useDebouncedValue"
import { QueryContent } from "@/components/shared/QueryContent"

import { EmptyState } from "@/components/shared/EmptyState"
import { ErrorState } from "@/components/shared/ErrorState"
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

const peopleFilterKeys = [
  "search",
  "companyId",
  "ownerId",
  "team",
  "department",
  "jobTitle",
  "personaRole",
  "seniorityLevel",
  "isPrimaryContact",
  "hasEmail",
  "hasPhone",
] as const

export function PeoplePage() {
  const text = uiText.people
  const { params, page, pageSize, patch, setPage, setPageSize } =
    useListQueryState()
  const permissions = useAuthStore((state) => state.user?.permissions ?? [])

  const canViewDirectory = permissions.includes("people:directory:view")
  const canViewPerson = permissions.includes("person:view")
  const canCreate = permissions.includes("person:create")

  const query = useMemo<PeopleDirectoryQuery>(
    () => ({
      ...Object.fromEntries(
        peopleFilterKeys.map((key) => [
          key,
          ["isPrimaryContact", "hasEmail", "hasPhone"].includes(key)
            ? params.get(key) === "true"
              ? true
              : params.get(key) === "false"
                ? false
                : undefined
            : params.get(key) || undefined,
        ])
      ),
      page,
      limit: pageSize,
    }),
    [params, page, pageSize]
  )
  const debouncedQuery = useDebouncedValue(query, 350)
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)

  const directory = usePeopleDirectory(
    debouncedQuery,
    canViewDirectory && query === debouncedQuery
  )
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

  function patchQuery(values: Partial<PeopleDirectoryQuery>) {
    patch(
      Object.fromEntries(
        Object.entries(values).map(([key, value]) => [
          key,
          value === undefined ? undefined : String(value),
        ])
      ),
      {
        resetPage: !("page" in values) || values.page === 1,
        replace: "search" in values,
      }
    )
  }

  return (
    <EntityListPage>
      <PageHero
        title={text.hero.title}
        description={text.hero.description}
        eyebrow={text.hero.badge}
        icon={Network}
        actions={
          canCreate ? (
            <Button
              type="button"
              className="w-fit rounded-xl bg-[var(--app-primary)] text-[var(--app-on-primary)] hover:bg-[var(--app-primary-hover)]"
              onClick={() => setCreateOpen(true)}
            >
              <Plus className="size-4" />
              {text.actions.create}
            </Button>
          ) : null
        }
      />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={UsersRound}
          label={text.metrics.total}
          value={metrics.total.toLocaleString("fa-IR")}
        />
        <MetricCard
          icon={ContactRound}
          label={text.metrics.primaryCurrentPage}
          value={metrics.primary.toLocaleString("fa-IR")}
          helper={text.metrics.currentPageHint}
        />
        <MetricCard
          icon={Phone}
          label={text.metrics.phoneCurrentPage}
          value={metrics.phone.toLocaleString("fa-IR")}
          helper={text.metrics.currentPageHint}
        />
        <MetricCard
          icon={Mail}
          label={text.metrics.emailCurrentPage}
          value={metrics.email.toLocaleString("fa-IR")}
          helper={text.metrics.currentPageHint}
        />
      </div>

      <PeopleFilterBar
        query={query}
        lookups={lookups.data}
        onChange={patchQuery}
        onClear={() =>
          patch(
            Object.fromEntries(peopleFilterKeys.map((key) => [key, undefined]))
          )
        }
      />

      {!canViewDirectory ? (
        <ErrorState
          title={text.errors.permissionTitle}
          description={text.errors.permissionDescription}
        />
      ) : (
        <QueryContent query={directory} errorTitle={text.errors.listTitle}>
          {directory.data?.data.length ? (
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

              <PaginationControls
                page={directory.data.meta.page}
                pageCount={directory.data.meta.totalPages}
                pageSize={query.limit}
                total={directory.data.meta.total}
                onPageChange={setPage}
                onPageSizeChange={setPageSize}
                disabled={directory.isFetching || query !== debouncedQuery}
              />
            </>
          ) : (
            <EmptyState
              icon={UsersRound}
              title={text.empty.listTitle}
              description={text.empty.listDescription}
            />
          )}
        </QueryContent>
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
    </EntityListPage>
  )
}
