# Frontend architecture — Phase 2

## Scope and decisions

This is an incremental application-pattern standardization, not a redesign.
The representative migrations are Companies, the Opportunities list/workspace
filter shell, and Admin Users. Routes, API URLs, permission checks, authentication,
session refresh and logout/cache-clearing behavior are unchanged. No dependency,
backend change or database migration was introduced.

Inspection covered packages/ui, shared components, uiText, API/error/query
utilities and Companies, Opportunities, Meetings, Tasks, Activities, Admin
Users/Teams, Audit Logs, Company 360 and the product library.

Findings:

- Existing PageHero, MetricCard, StatusBadge and PaginationControls already cover
  most recurring patterns. Admin Users duplicated their markup and query setup.
- DataTableShell already had typed columns but lacked captions and keyboard row
  activation. Loading/error/empty composition was repeated.
- Meetings/Tasks use URL state and the parameter name limit; Companies/Users
  used local state. Opportunities previously persisted only part of its state.
- The backend response interceptor preserves data and meta as siblings.
  Some adapters silently converted malformed responses to empty arrays.
- Companies already used RHF/Zod; opportunity and user creation forms used
  manual state/validation. Server field errors were not consistently connected.
- Common Persian labels were repeated; domain labels supplied by the backend
  must remain data, not translation constants.

## Shared UI and list composition

Keep low-level controls in packages/ui. Application patterns live in
apps/web/src/components/shared. Reuse PageHero/PageHeader, SurfaceCard,
MetricCard, StatusBadge, FormSection, DialogHeroHeader and ConfirmDialog.

Canonical list composition:

```tsx
<PageHero title={text.title} actions={primaryAction} />
<DataTableToolbar
  searchValue={search}
  onSearchChange={(search) => patch({ search }, { replace: true })}
  filters={featureFilters}
  hasActiveFilters={hasFilters}
  onClearFilters={clearFilters}
/>
<QueryContent query={query} errorTitle={text.errorTitle}>
  <DataTableShell
    caption={text.title}
    rows={query.data?.data ?? []}
    columns={columns}
    getRowKey={(row) => row.id}
    onRowClick={openDetail}
    emptyState={<EmptyState title={text.emptyTitle} description={text.emptyDescription} />}
  />
  <PaginationControls
    page={query.data?.meta.page ?? page}
    pageCount={query.data?.meta.totalPages ?? 1}
    pageSize={pageSize}
    total={query.data?.meta.total}
    onPageChange={setPage}
    onPageSizeChange={setPageSize}
    disabled={query.isFetching}
  />
</QueryContent>
```

DataTableShell owns semantic table markup, horizontal overflow, typed cells,
captions and Enter/Space row activation. Feature code owns columns and actions;
action buttons must stop propagation. Nested controls do not trigger keyboard
row activation. QueryContent owns loading and normalized error/retry states,
without depending on a domain or table implementation.

DataTableToolbar is the FilterBar; do not create a parallel component.
Companies, Opportunities and Admin Users also share EntityTableCell and
EntityRowActions for visual consistency: 44px avatar frame, bounded title and
optional subtitle, and the same trailing eye action. Their DataTableShell uses
entityRows (68px rows); other tables retain their existing density. Domain
actions remain beside the eye button and retain their permission checks.
filtersClassName allows responsive composition of different numbers of filters.
Use logical CSS properties, labelled controls and bounded overflow. Keep
expensive column transformations memoized where beneficial; avoid memoization
that is defeated by unstable callback dependencies.

TanStack Table is installed but was not used by existing table implementations.
These three lists expose neither sorting nor bulk selection in their existing
UI, so no speculative client-side sorting, selection or new query protocol was
added. Add such behavior only when a concrete endpoint/workflow supports it.

## URL state and pagination

useListQueryState is the source of committed list state. page is a positive
safe integer; limit accepts 10/20/50/100, default 20. pageSize is a compatible
read alias; changing size writes limit and removes the alias. Existing
Meetings/Tasks parameter names were not changed.

- Filter patches atomically reset page to 1.
- Page changes preserve filters; unknown parameters remain intact.
- Filter and page changes push history. Search typing replaces the current
  entry to avoid a history entry per character. Back/forward reads URL state.
- Companies use search, priority, ownershipScope and archiveMode.
- Users use search, role, teamId and status.
- Opportunities preserve view and companyId, and serialize their feature
  filters through readOpportunityFilters. Clearing filters retains companyId,
  matching the company-context workspace behavior.
- Opportunity filters and user search retain debouncing. Disable pagination
  and avoid list requests for intermediate filter/search state.

PageParams uses page/limit because that is the actual backend protocol.
Feature adapters map UI archive/status/ownership values to endpoint parameters.
SortParams is a vocabulary only, not a promise that every endpoint supports it.

PaginationControls remains canonical. It displays total rows, page X of Y,
page-size choices and previous/next controls, clamps non-finite UI page values
and presents an empty result as page 1 of 1. Server totalPages may legitimately
be zero. Do not infer total records from the current page length.

## API boundaries

Network calls stay in feature api modules; components consume domain data,
never AxiosResponse. parsePaginatedResponse validates the confirmed data/meta
envelope with Zod and returns PaginatedResult<T>/PaginationMeta. It accepts
the existing success:true envelope or the raw data/meta shape.

Malformed metadata or essential row identity fields throw ApiContractError,
which normalizeAppError turns into safe Persian UI text without retries.
Development diagnostics include issue paths/codes, never payloads.

Row guards are deliberately selective: identity and essential list fields,
not exhaustive validation of every optional nested domain field. Unknown
domain properties are retained. Do not advertise these guards as complete
domain validation. Other response variants require feature adapters; do not
feed paginated envelopes through unwrapApiResponse and lose their outer meta.
Unmigrated lookup/detail/subresource adapters retain their existing contracts.

## Query keys and mutations

Keep feature key factories near existing hooks:
companyQueryKeys, opportunityQueryKeys and adminUserKeys.
List keys include a serializable organization/user scope supplied by
useQueryScope. Invalidation roots remain unchanged so other screens still
invalidate lists correctly. User count/options/quota queries are also scoped.

Existing detail and pipeline cache keys were intentionally not mass-renamed:
their optimistic updates and invalidation depend on current prefixes/positions.
They continue to rely on Phase 1 identity-change cache clearing. Never remove
that protection. Test scope isolation and root-prefix compatibility before
migrating additional key families.

Admin list queries, options, refresh and status mutations now live in hooks.
Creation still follows the existing two requests: create user, then optionally
assign a custom role if permitted. Parent success callbacks retain navigation,
closing and explicit refresh. This sequence is not transactionally atomic;
handling partial success/idempotent retries is a separate business/API task.

## Forms and errors

Representative forms use RHF + zodResolver. Defaults are feature-owned;
reset(defaultValues) runs when the dialog opens or the edited entity changes.
Keep payload mapping explicit: opportunity updates still omit company/owner/
stage changes, and company numeric/date/null mappings retain their semantics.

Use native register or Controller/useWatch for existing custom controls.
Associate labels with ids, set aria-invalid/aria-describedby and render field
messages. Custom entity/date controls remain existing feature components;
their full accessibility audit is not claimed here.

On submit, clear previous submission errors, await the mutation and catch its
rejection inside the form. applyServerFieldErrors:

1. normalizes AppError;
2. maps only allowlisted RHF paths and explicit aliases (roleId → roleChoice);
3. sets field messages and focuses the first mapped registered control;
4. retains a root.server message for general/unmapped errors.

normalizeAppError accepts structured fieldErrors/errors maps or structured
field/message arrays, including error.details. Backend class-validator
string arrays remain general messages: never guess field names from prose.
Do not suppress useful business messages. Parent submit handlers must rethrow
after a toast if the form is responsible for field-level presentation.

FormActions standardizes cancel, submit and pending state without introducing
a universal form. Company dirty-state hints and existing destructive
confirmations are retained. There is no new global discard-confirmation policy.
User creation now uses the existing shadcn Dialog for focus management.

Constrain dialog height and use minmax(0,1fr)/min-h-0 for scroll regions.
For grid form sections use auto-rows-max so overflow-hidden cards are not
squeezed and clipped at short viewport heights.

## Text rules

- Global/common: uiText.common and uiText.app (save/cancel, loading,
  pagination, validation, safe contract errors).
- Reused user feature labels: uiText.adminUsers, including role display labels.
- Existing company/opportunity terminology stays in its existing uiText groups.
- One-off domain explanations can remain feature-scoped.
- Database labels, server business messages and user-entered content stay data.

Do not do blanket Persian-string replacement. Existing unmigrated pages still
contain repeated text; migrate it with their UI rather than changing all pages.

## Feature organization and when not to abstract

```text
feature/
  api/         # transport and endpoint adapters
  hooks/       # existing query/mutation organization, keys, invalidation
  schemas/     # form validation (existing company schema stays in types/)
  types/       # domain models
  components/  # domain cells, controls and forms
  pages/       # composition and navigation
```

Do not move files just to match this tree. Keep pipeline board rules,
Company 360 sections, calendar/timeline layouts and specialized reports
domain-specific. Shared blocks are preferable to a mega table/form framework.

## Verification and remaining scope

Tests cover loading/empty/error/rows, row keyboard actions, pagination,
URL parsing and history, envelope validation, query-key scope, field-error
mapping into RHF, representative list API requests/permissions, user creation
validation and opportunity edit values/errors/reset.

Local browser QA uses synthetic read-only data, not production accounts.
Mobile 390px, tablet 768px and desktop 1366px widths were checked; short
600px-high user/opportunity dialogs exposed clipping that was fixed with
explicit scroll tracks. This is basic responsive/a11y verification, not a
full WCAG or production end-to-end audit.

Remaining incremental work: other feature list/filter migrations, exhaustive
nested response validation where justified, remaining custom-control labels,
full modal accessibility coverage, and atomic user/custom-role creation.
Phase 3 should prioritize those concrete gaps and backend-connected E2E tests
instead of another broad UI rewrite.

Run from the repository root:

```sh
npm ci
npm run lint
npm run typecheck
npm run test:run
npm run build
git diff --check
```

See phase-2-report.md for the exact final command results and file inventory.
