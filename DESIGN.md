# Neshane OP UI Design Contract

This document is the canonical contract for new UI work. It defines the stable
foundation; it is not a mandate to mass-migrate existing screens. Existing
feature UI should move toward this contract only when it is being changed for a
product reason.

## Ownership and source of truth

- `packages/ui/src/styles/globals.css` owns semantic color, typography, radius,
  and Tailwind theme tokens.
- `apps/web/src/styles/globals.css` owns the Persian font files, application
  compatibility aliases, and app-specific semantic utility classes.
- `packages/ui/src/components/*` owns generic controls and overlays.
- `apps/web/src/components/shared/*` owns CRM-wide composed patterns such as
  `PageHero`, `DataTableShell`, `SurfaceCard`, and entity presentation.
- Feature folders own only domain-specific composition and dynamic domain
  colors. A generic primitive belongs in one of the shared layers above once at
  least two real use cases demonstrate the need.

## Color roles

Use semantic tokens, never palette values, for application chrome:

| Role           | Token                                       | Use                                   |
| -------------- | ------------------------------------------- | ------------------------------------- |
| Canvas         | `background`                                | Page background                       |
| Surface        | `card`, `popover`                           | Cards, menus, dialogs                 |
| Subtle surface | `muted`, `accent`                           | Secondary regions and hover states    |
| Text           | `foreground`                                | Primary text                          |
| Secondary text | `muted-foreground`, `text-secondary`        | Supporting copy                       |
| Borders        | `border`, `input`                           | Dividers and control boundaries       |
| Focus          | `ring`                                      | Keyboard focus only                   |
| Default action | `primary`                                   | Canonical shadcn action               |
| CRM brand      | `brand` and variants                        | Brand emphasis and branded navigation |
| Feedback       | `success`, `warning`, `destructive`, `info` | Semantic status only                  |

`--app-*` color variables are compatibility aliases to these semantic tokens,
not a second palette. New code should prefer Tailwind semantic utilities such as
`bg-card`, `text-foreground`, `border-border`, and `text-destructive`.

Pipeline stages, chart series, user-defined labels, and other data-driven colors
may remain dynamic. They must retain accessible contrast and must not be reused
as application chrome.

Both `:root` and `.dark` define complete semantic values. Components must not
branch on theme names to choose colors.

## Typography

The local BYekan variable font is the canonical Persian `sans` and heading font.
`font-sans` and `font-heading` both resolve through `--app-font-family`.
`font-mono` is reserved for code, identifiers, hashes, logs, and explicitly
Latin technical values. Do not use Geist or a Latin display font for Persian UI.

Semantic roles already available in the web application:

- `.ui-page-title`: page title
- `.ui-section-title`: section title
- `.ui-card-title`: card or dense panel title
- `.ui-body`: normal content
- `.ui-caption`: metadata and help text
- `.ui-label`: form/control label
- `.ui-metric`: numeric summary
- `.ui-navigation-group`: navigation grouping label

Prefer these roles or an existing shared component over inventing a local text
scale. Persian line-height must remain generous enough to avoid clipped glyphs.

## Spacing, controls, and radius

The default rhythm is based on 4px, with named application steps:

- inline/icon gap: 8px (`--app-space-inline`)
- component gap/padding: 12px (`--app-space-component`)
- section gap: 20px (`--app-space-section`)
- page gutter: 24px (`--app-space-page`), reduced responsively where needed

Controls are 44px by default and 32px for explicitly compact/dense contexts.
Touch targets must remain at least 44×44px even when the visual icon is smaller.

Use the existing radius scale. Controls use `--app-radius-control` (12px),
ordinary cards use `--app-radius-card` (20px), feature surfaces use
`--app-radius-feature` (24px), and hero surfaces use `--app-radius-hero` (28px).
Nested elements should not have a larger radius than their container.

Elevation is structural, not decorative. Use `--app-shadow-card` for ordinary
raised surfaces and `--app-shadow-overlay` for overlays. Borders should carry
most separation in dense CRM views; avoid stacking multiple shadows.

## RTL and bidirectional content

- Page and component layout defaults to RTL.
- Prefer logical properties (`start`, `end`, `ms`, `me`, `ps`, `pe`) over
  physical left/right declarations.
- Directional icons must express meaning correctly in RTL.
- IDs, email addresses, URLs, code, and unformatted Latin technical values may
  use `dir="ltr"` locally; never switch an entire Persian surface to LTR.
- Truncation must not hide the only accessible name or action label.

## PageHero profiles

`PageHero` is the canonical page introduction. Use one of these profiles without
adding profile-specific forks to the component:

### List

- Required: title and concise description.
- Primary action: create/add when authorized.
- Secondary actions: refresh, export, or view switch.
- Search and filters live below the hero in the canonical toolbar, not inside it.

### Detail

- Required: entity title and useful identity/context.
- May include breadcrumbs, status, owner, or compact metadata.
- Primary and secondary actions must follow entity permissions.
- Back navigation uses the existing route convention; detail content stays below.

### Workspace

- Required: task-oriented title and description.
- May expose a small set of frequent quick actions.
- Summary metrics and working content remain below the hero.
- It must not become an analytics dashboard or a second navigation bar.

## Forms

- Use canonical `Button`, `Input`, `Textarea`, `Select`, searchable selection,
  date/time, field, and validation components.
- Use the canonical native `Checkbox` for ordinary boolean and multi-select
  fields. Associate it with a wrapping or `htmlFor` label so the full 44px
  label row remains an accessible hit target.
- Every input has a persistent visible label; placeholders are examples, not
  labels. Help and error text must be associated with the field.
- Required state and validation errors are conveyed by text and semantics, not
  color alone.
- Group related fields using the existing form-section pattern. Keep primary
  submit and cancel actions predictable in RTL.
- Do not create a feature-local generic control when a canonical primitive exists.

### Field states

- Normal: visible label, control, and optional helper text. Helper text is linked
  to the control using `aria-describedby`.
- Invalid: retain the visible label, set `aria-invalid`, and render the linked
  error message with `role="alert"`. An error replaces neither label nor helper.
- Server validation: use `applyServerFieldErrors` with an explicit allowlist to
  map API errors to RHF fields. Unmapped or general errors stay at form level.
- Required/optional: use the visible Persian indicator supplied by `FormField`
  and native `required`/`aria-required` semantics. Do not communicate this state
  with color alone.
- Placeholder: an example or format hint only; it never replaces a visible label.
- Disabled: disable the real control, retain its label, and preserve readable
  context. Do not simulate disabled state with styling alone.

`FormField` is the canonical presentation/accessibility wrapper. It does not own
form state, validation rules, or submission and does not replace React Hook Form.
Use `NativeSelect` for small native option sets. Use the composed `Select`,
searchable select, or combobox only when search, async loading, large data,
multi-selection, or rich option rendering requires it.

### Actions

- `FormActions` is the canonical submit/cancel pair for application forms and
  form dialogs. Cancel is secondary; submit is primary.
- While pending, both cancellation and duplicate submission are disabled and
  the submit label communicates progress.
- Domain validation may additionally disable submit, but the reason must remain
  discoverable from field errors or nearby helper text.
- Destructive actions do not replace submit/cancel; place them separately and
  use the canonical confirmation flow.
- `DialogFooter` remains the layout primitive for non-form dialog actions. Do
  not create a second feature-local footer abstraction.

## List and table taxonomy

- `DataTableShell`: ordinary structured CRUD datasets where comparison,
  columns, filters, row actions, or pagination matter. Use its canonical mobile
  configuration rather than creating a second list for small screens.
- `EntityCardList`: identity-first collections where the entity summary matters
  more than column-by-column comparison.
- `EntityCard` / `MobileEntityCard`: entity summaries and responsive list rows;
  they are presentation primitives, not replacements for query state handling.
- `EntityRowActions`: permission-aware row actions.
- Simple list: short, non-tabular action/feed content only.
- Pipeline, calendar, matrix, timeline, kanban, and analytical views remain
  specialized visualizations. Do not force them into `DataTableShell`.
- A table must retain headers and keyboard semantics. Do not reproduce a table
  using arbitrary grids when data is genuinely tabular.

### Mobile CRUD lists

- Prioritize entity identity, current status, primary context, then actions.
- Prefer three to five meaningful summaries over copying every desktop column.
- Keep information needed for the primary task; combine related values into a
  readable summary rather than silently dropping them.
- Actions remain permission-aware, keyboard reachable, and explicitly named.

### Toolbars

- `DataTableToolbar` owns search, primary filters, advanced-filter entry,
  clear/reset, and genuine view switches.
- Search and filters stay out of `PageHero`. Result counts may appear near the
  list when they help orientation, but are not mandatory toolbar decoration.
- Clearing filters must restore URL/query state through the feature's existing
  query-state mechanism; the toolbar does not own domain state.

## Modal and dialog taxonomy

- `ResponsiveModal`: read-only detail, quick information, lightweight actions,
  and short non-form workflows that adapt to smaller screens. It owns responsive
  containment and an accessible title/description, not form submission.
- Form dialog: compose the canonical `Dialog`, `DialogContent`, `DialogHeader`,
  `DialogTitle`, optional `DialogDescription`, `FormDialogBody`,
  `FormDialogFooter`, and `FormActions`. Do not add another form-modal wrapper.
- Canonical `Dialog`: focused short interactions and the accessible foundation
  for composed form dialogs.
- `ConfirmDialog`: destructive or consequential confirmation. Name the affected
  entity and consequence, use explicit destructive semantics, and retain a clear
  cancel action. Text-entry confirmation is reserved for genuinely high-risk
  operations.
- Sheet/drawer: supporting context that should preserve the current page.
- Popover: brief, non-blocking choices or preview content.

Never build a custom fixed overlay, focus trap, escape handler, or scroll lock in
a feature. Overlays require an accessible name, initial/final focus behavior,
Escape handling, and keyboard containment through the canonical primitive.

### Header, body, and footer

- Ordinary dialogs use a compact `DialogHeader`; `DialogHeroHeader` is reserved
  for existing large multi-section workflows and is not the default for new
  dialogs. Dialog headers are not page heroes.
- `DialogTitle` supplies the accessible name. Use `DialogDescription` for useful
  context; decorative icons remain hidden from the accessible name.
- Long form dialogs use a stable `header / scrollable body / footer` structure.
  `FormDialogBody` owns the single vertical scroll region and
  `FormDialogFooter` keeps actions reachable. Avoid scrolling the entire popup
  or nesting another scroll region without a domain need.
- `FormActions` is the canonical RTL submit/cancel contract. During submission,
  duplicate submit and cancel/close are disabled and the primary label reports
  progress. Validation and mutation behavior remain owned by the feature form.

### Responsive sizes and close behavior

- `ResponsiveModal` supports `sm`, `md`, `lg`, and `xl`; `md` is the default.
  Its legacy `width` escape hatch remains only for proven specialized layouts.
- Dialogs keep a viewport gutter on narrow screens and a bounded `dvh` height.
  Controls and the close action retain a 44px target without horizontal overflow.
- Base UI owns focus entry/trapping, Escape, overlay dismissal, scroll lock, and
  focus return. Do not add document-level keyboard handlers. A controlled form
  may reject dismissal while its mutation is pending; otherwise close button,
  Escape, and overlay dismissal retain their expected behavior.

## Loading, empty, and error states

- `QueryContent` is the canonical boundary for initial loading and recoverable
  query errors. It preserves TanStack Query ownership and supplies safe retry;
  it does not own domain data, empty-state copy, or mutation behavior.
- Generic loading uses `LoadingState`. CRUD tables/lists should use the loading
  support of their canonical list primitive when maintaining approximate shape
  materially reduces layout shift. Add detail loading only for repeated detail
  layouts, not as a feature-specific skeleton library.
- Loading is announced accessibly and must respect reduced motion.
- Background refresh preserves useful content and indicates progress subtly.
- A true empty state explains that no records exist and may offer the authorized
  create action. A filtered empty state says no matching results were found and
  should offer filter reset or revised search instead of record creation by
  default. Both use `EmptyState`; features own their copy and actions.
- Query failures use `ErrorState` through `QueryContent`, provide a Persian safe
  explanation and retry where meaningful, and never expose raw transport or
  server exceptions. Mutation failures remain toast plus field/root errors as
  appropriate; do not route them through the query-state boundary.

## Accessibility

- All interactions use semantic controls and are keyboard reachable.
- Icon-only actions require an accessible Persian label and visible focus state.
- Maintain WCAG AA contrast for text and meaningful UI states.
- Announce async status changes appropriately; do not use toast as the sole
  record of a consequential result.
- Respect reduced motion and avoid animation that blocks interaction.
- Tables, dialogs, menus, and form errors retain their native/ARIA semantics.

## Guardrails for new work

Run `npm run ui:guardrails` before review. It inspects newly added lines and
prints advisory warnings for hardcoded hex colors, raw generic form controls,
custom overlays, and feature-local generic primitives. It intentionally does not
fail the build while legacy UI is migrated incrementally.

Reviewers should verify that a warning is either resolved by a canonical token or
component, or is a legitimate domain-driven exception. The guardrail is not a
substitute for visual review in both light and dark themes at desktop and mobile
widths.
