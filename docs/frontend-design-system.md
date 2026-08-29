# Frontend design system — Phase 2.2

## Scope and visual audit

Reference: Companies, Opportunities and Admin Users. Inspected People, Activities,
Meetings, Tasks, Teams, Libraries (including Products), Audit Logs, Attention and
Company 360 child panels. Found 48px versus 68px rows, nested table frames,
independent action menus/icon buttons, duplicate KPI cards, empty toolbar columns,
an independent Attention hero, and a hand-built modal overlay without the shared
dialog's focus/keyboard behavior.

The reference language is RTL, soft page background, bordered surface cards,
subtle shadows, a gradient PageHero, semantic status colors and icon actions at
the end of the row. Content remains domain-owned; these components own appearance.

## Tokens and rules

Reuse `--app-surface`, `--app-background`, `--app-divider`, `--app-primary`,
semantic success/warning/destructive/info colors, `--app-radius-card`,
`--app-radius-hero`, shadows and existing `ui-page-title`, `ui-card-title`,
`ui-caption`, `ui-metric` typography. Added:

| Token | Value | Purpose |
| --- | --- | --- |
| `--app-radius-control` | 12px | Filter controls |
| `--app-space-section` | 20px | List sections |
| `--app-space-toolbar` | 12px | Toolbar gaps |
| `--app-control-height` | 44px | Filters |
| `--app-table-row-height` | 68px | Standard entity row minimum |
| `--app-table-header-height` | 44px | Table header |
| `--app-table-cell-padding` | 16px | Horizontal cell padding |

Rows can grow for genuinely multiline content. Do not clip content to enforce a
pixel height. Tables scroll horizontally **inside** the shared Table primitive;
do not add another page-level min-width or nested card around them. Mobile hero
actions and filters wrap; pagination stacks. Use logical start/end spacing.

## Component reference

All components below live in `apps/web/src/components/shared` unless noted.

### 1. PageHero

Purpose: one page heading and action hierarchy. Props: `title`, `description`,
`eyebrow`, `icon`, `primaryAction` (label/icon/onClick/disabled), `actions`,
`breadcrumbs`, `metadata`. Slots can contain back/help/status controls; absent
slots render nothing.

```tsx
<PageHero title="شرکت‌ها" description="مدیریت حساب‌ها"
  primaryAction={{ label: "افزودن شرکت", onClick: openCreate }}
  actions={<ExportButton />} />
```

Use for full-page headers. Do not use inside every card or modal; use FormSection
or DialogHeroHeader there. Permission checks remain with the caller.

### 2. EntityListPage

Purpose: standard width, RTL and section spacing. Accepts children/className.

```tsx
<EntityListPage><PageHero title="کارها" /><TaskFilterBar /><TaskList /></EntityListPage>
```

Use for normal list routes. Do not replace the Company 360 workspace or a board's
internal column layout. Stats, toolbar and pagination are composed, not booleans.

### 3. ListToolbar (`DataTableToolbar`)

Purpose: search → filters → secondary actions/reset. Props: optional searchValue,
onSearchChange, searchPlaceholder, filters, filtersClassName, actions,
hasActiveFilters, onClearFilters. No search control without onSearchChange.

```tsx
<DataTableToolbar searchValue={search} onSearchChange={setSearch}
  filters={<StatusSelect />} actions={<ExportButton />}
  hasActiveFilters={hasFilters} onClearFilters={reset} />
```

Use for standard list controls, including filter-only toolbars. Do not put primary
Create here or add empty placeholder columns. Query/debounce semantics stay in
feature hooks.

### 4. FilterBar

Purpose: domain adapter over DataTableToolbar; not a second generic component.
Existing CompanyFilterBar, PeopleFilterBar, TaskFiltersBar and MeetingFiltersBar
keep their typed query/change APIs and compose the toolbar's filters slot.

```tsx
<DataTableToolbar filters={<select aria-label="وضعیت" value={status}
  onChange={e => setStatus(e.target.value)}><option value="ALL">همه</option></select>} />
```

Use native selects or existing combobox/date controls; `.ui-filter-controls`
normalizes dimensions. Do not replace server filters with client-only filtering.
Advanced filters and domain quick views remain feature composition. No new chip
state store was introduced.

### 5. DataTable (`DataTableShell<Row>`)

Purpose: canonical frame, header, rows, keyboard navigation, overflow and states.
Props: rows, columns (`id/header/cell/className/headerClassName`), getRowKey,
onRowClick, caption, emptyState, loading, renderRowActions, pagination. Optional
entityRows=false is a legacy compact escape hatch, not for standard lists.

```tsx
<DataTableShell rows={items} columns={columns} getRowKey={r => r.id}
  onRowClick={openDetail} renderRowActions={r => <EntityRowActions
    onView={() => openDetail(r)} />} pagination={pagination} />
```

Use for normal entity lists. Use EntityTableCell for the primary name/avatar and
EntityOwnerCell for owner columns; StatusBadge/date/money formatters retain domain
meaning. Selection/sort headers are column composition; bulk/export controls go
in the toolbar. This is not a new sorting or selection engine. Do not use it for
pipeline columns, calendars or relationship graphs. Pagination may also be composed
immediately below it; never render both variants.

### 6. RowActions (`EntityRowActions`)

Purpose: one permission-aware action presentation. Each EntityAction has id,
label, icon, onClick, optional enabled/disabled/tone/confirmation. `enabled=false`
hides unauthorized actions; disabled is for temporarily unavailable operations.
View/edit IDs are direct icon buttons; all other IDs use the overflow menu.
Legacy onView/label/children remain compatible; prefer action configuration.

```tsx
<EntityRowActions actions={[
  {id: "view", label: "مشاهده", icon: Eye, onClick: open},
  {id: "delete", label: "حذف", icon: Trash2, enabled: canDelete,
   tone: "danger", confirmation: {title: "حذف", description: "مطمئن هستید؟"},
   onClick: remove},
]} />
```

Use for table actions. Async operations expose pending/error state, and actions
stop row-navigation propagation. Existing domain confirmation flows remain in
their owners; do not add a second confirmation around them. Do not use row actions
as a whole-page navigation menu or nest interactive controls inside a button card.

### 7. PaginationControls

Purpose: one localized page footer. Props: page/pageCount/onPageChange, optional
pageSize/onPageSizeChange/pageSizeOptions/total/disabled. Defaults: 10/20/50/100.

```tsx
<PaginationControls page={page} pageCount={pages} total={total}
  onPageChange={setPage} pageSize={size} onPageSizeChange={setSize} />
```

Use below paginated lists and independently paged Company 360 sections. Do not
add it to an unpaginated board merely for visual symmetry. Existing URL/query
pagination behavior is unchanged.

### 8. StatusBadge

Purpose: semantic, readable status pills. Props: children, tone, dot. Existing tones
neutral/primary/info/success/warning/error; danger maps to the existing `error` name.

```tsx
<StatusBadge tone={active ? "success" : "neutral"}>{label}</StatusBadge>
```

Use domain adapters (MeetingStatusBadge, TaskStatusBadge, etc.) to map statuses:
active→success, pending→warning, failed/lost→error. Category/type labels normally
use primary/info with dot=false. Do not invent per-page equivalent colors or
translate machine identifiers without the domain's mapping.

### 9. KpiCard (`MetricCard`)

Purpose: consistent count/value cards. Props: label/value/icon/helper/tone,
optional onClick/active/className. Helper accepts trend/context content.

```tsx
<MetricCard label="کل افراد" value={total.toLocaleString("fa-IR")}
  icon={UsersRound} helper="در محدوده دسترسی شما" />
```

Use for comparable KPIs. onClick adds keyboard button semantics for Attention
quick-filter cards. Do not use as an arbitrary detail section; SurfaceCard and
FormSection serve that purpose. Preserve current-page versus global count labels.

### 10. EmptyState / LoadingState

Purpose: shared no-data/loading appearance. EmptyState accepts title, description,
icon, action; LoadingState is the existing shared skeleton/status component.

```tsx
<EmptyState title="موردی یافت نشد" description="فیلترها را بررسی کنید."
  action={<Button onClick={reset}>پاک کردن فیلترها</Button>} />
```

Use for list/query states, normally through QueryContent. Do not show EmptyState
while loading or on a failed request.

### 11. ErrorState

Purpose: consistent accessible error panel. Props: title/description and optional
retryLabel/onRetry.

```tsx
<ErrorState title="دریافت اطلاعات ناموفق بود" description={message}
  retryLabel="تلاش دوباره" onRetry={refetch} />
```

Use for failed query sections. Do not replace field validation with a page error;
preserve existing form-field/server validation.

### 12. FormSection

Purpose: reusable titled surface panel. Props: title/description/actions/children,
optional footer/bodyClassName. Uses SurfaceCard.

```tsx
<FormSection title="اطلاعات جلسه" description="عنوان و توضیحات">
  <MeetingFields />
</FormSection>
```

Use for grouped form/detail content and Company360ActionSection's child panels.
Do not wrap a DataTableShell in another FormSection solely to add a second border.

### 13. Dialog pattern

Purpose: consistent modal header, independently scrolling body and footer. Use
existing Dialog/DialogContent + DialogHeroHeader + FormDialogBody/FormDialogFooter
and existing FormActions. FormDialogBody uses max-content grid rows so sections
cannot collapse and hide fields on small screens.

```tsx
<DialogContent className="grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden">
  <DialogHeroHeader title="ایجاد جلسه" onClose={close} />
  <FormDialogBody><FormSection title="اطلاعات"><Fields /></FormSection></FormDialogBody>
  <FormDialogFooter><FormActions onCancel={close} pending={pending} /></FormDialogFooter>
</DialogContent>
```

Example is structural: retain each form's real submit/pending props and bounded
dialog height. ResponsiveModal is the compatibility wrapper for existing admin
modals (title/description/icon/width/open/onClose/children), now backed by the same
Dialog primitive. Its child forms keep their domain footer. Use ConfirmDialog for
destructive confirmation. Do not implement another overlay/focus trap or change
business field layouts just to share markup.

## Migration and exceptions

EntityListPage applied to Companies, Opportunities, People, Activities, Meetings,
Tasks, Users, Teams, Libraries/Products, Audit Logs and Attention. Shared table
rows/actions used in normal tabular views; duplicate Meeting/Task/Opportunity
menus became small configuration adapters. People/Teams/Attention duplicate KPI
implementations removed. Company 360 child section frames use FormSection while
keeping independent pagination and workspace context.

Intentionally specialized: opportunity pipeline, meeting agenda/calendar, task
focus mode, People cards, team cards, dashboard and Company 360 workspace. Their
internal domain-specific layouts are not forced into a table. Existing API hooks,
routes, permission predicates, authentication and backend were not migrated.

## QA and limitations

Browser review used local GET-only synthetic fixtures, not production customer
data. Twelve routes were checked for document overflow/runtime errors at 1440,
768 and 390px. Companies, Activities, Meetings, Tasks, People, Users, Teams and
Audit were visually compared across those widths. Standard rows measured 68–69px
(pixel rounding); horizontal overflow stays within tables. Mobile meeting dialog
focus and Escape were checked; a discovered section-compression bug was fixed
and body scroll grew from 757 to 1934px while the viewport stayed bounded.

The committed temporary `phase21-qa.html` and `src/phase21-qa.tsx` were removed
after review; they are recoverable from Git, not production development entrypoints.
Their two existing lint errors were the reproduced initial lint failures. No ESLint
rule or source exclusion was added. Real automated tests remain.

This is not a production E2E/a11y certification: all permission combinations,
live write flows, dark-theme screenshots and every specialized card's internal
markup were not exhaustively browser-tested. Some specialized quick-filter/card
layouts and legacy admin form footers remain domain-owned. These are follow-up
visual debt, not a reason to replace preserved workflows. Do not claim every
pixel of every application screen is standardized.

See `phase22-validation.md` for final command results and acceptance status.
# Responsive Entity Lists

Standard CRM entity lists use `DataTableShell` with a `mobile` configuration. The component renders the canonical table at the Tailwind `md` breakpoint and above (768px), and a canonical `MobileEntityCard` list below it. Both presentations receive the same rows, query state, pagination, click behavior, permissions, and action renderer; viewport changes never create another query or reset list state.

The feature owns information priority through `mobile: { title, subtitle?, avatar?, status?, fields }`. Each field has a stable `id`, a label, a row renderer, and an optional row-level `hidden` predicate. Normal cards should expose identity, status, and only three to five decision-relevant fields. Internal IDs and secondary detail belong on the detail screen.

```tsx
<DataTableShell
  rows={companies}
  columns={columns}
  getRowKey={(company) => company.id}
  renderRowActions={renderCompanyActions}
  mobile={{
    title: (company) => company.name,
    status: (company) => <StatusBadge>{company.status}</StatusBadge>,
    fields: [
      { id: "owner", label: "مسئول", render: (company) => company.ownerName },
      { id: "updated", label: "آخرین تغییر", render: (company) => formatDate(company.updatedAt) },
    ],
  }}
/>
```

Actions are defined once, preferably through `EntityRowActions` or an existing canonical feature action menu, and the same table action cell/renderer is placed in the mobile card. Destructive confirmations and permission filtering therefore remain identical.

Cards are the default mobile presentation for normal entity lists. True analytical matrices, reports, pipeline boards, calendars, and technical datasets may retain controlled horizontal navigation when a compact summary would conceal information needed for the task. Audit events may use cards only when their technical detail remains available through the existing detail view.

Cards use semantic headings and description lists. Clickable cards support Enter and Space, action controls stop propagation through the existing action component, and CSS-hidden presentations are removed from the accessibility tree. Do not wrap the whole card in a link when it contains buttons or menus.
