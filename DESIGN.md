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

- `DataTableShell`: paginated, sortable, filterable entity collections; use its
  canonical mobile presentation.
- `EntityCard` / `MobileEntityCard`: entity summaries and responsive list rows.
- `EntityRowActions`: permission-aware row actions.
- Simple list: short, non-tabular action/feed content only.
- A table must retain headers and keyboard semantics. Do not reproduce a table
  using arbitrary grids when data is genuinely tabular.

## Modal and dialog taxonomy

- `ResponsiveModal`: create/edit/detail workflows that adapt to smaller screens.
- Canonical `Dialog`: focused confirmation or short interaction.
- `AlertDialog` / `ConfirmDialog`: destructive or consequential confirmation.
- Sheet/drawer: supporting context that should preserve the current page.
- Popover: brief, non-blocking choices or preview content.

Never build a custom fixed overlay, focus trap, escape handler, or scroll lock in
a feature. Overlays require an accessible name, initial/final focus behavior,
Escape handling, and keyboard containment through the canonical primitive.

## Loading, empty, and error states

- Use `QueryContent`, skeletons, `EmptyState`, and `ErrorState` where available.
- Initial loading uses shape-appropriate skeletons; avoid layout jumps.
- Background refresh preserves useful content and indicates progress subtly.
- Empty copy distinguishes “no data” from “no filtered results” and offers a
  relevant next action when authorized.
- Errors provide a Persian explanation and a safe retry action where meaningful.

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
