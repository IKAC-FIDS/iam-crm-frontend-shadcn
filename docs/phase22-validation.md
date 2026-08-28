# Phase 2.2 delivery report

## 1–3. Audit, language and tokens

The audit, chosen RTL visual language and exact token values are documented in
[frontend-design-system.md](frontend-design-system.md). Main inconsistencies:
48/68px rows, duplicated action menus, nested frames, independent KPI/hero markup,
fixed toolbar columns and a hand-built modal. The solution is shared structure,
not just copying feature-level CSS.

## 4–10. Canonical APIs

See the component reference in the design-system document for typed configuration,
examples and when/when-not guidance for PageHero, DataTableShell, EntityRowActions,
DataTableToolbar/domain FilterBars, PaginationControls, StatusBadge, FormSection
and Dialog patterns. Primary actions and slots are optional. View/edit are direct;
other actions are overflow items. Unauthorized actions are hidden. Existing
business confirmation flows remain; library deletes, notification deletes and
member removal use shared confirmation. Product deactivation now also confirms.

## 11. Migrated pages

Companies, Opportunities, People, Activities, Meetings, Tasks, Admin Users,
Admin Teams, Admin Libraries/Products, Audit Logs and Attention use EntityListPage.
Shared table rows/actions, toolbar and existing pagination form the normal list
reference. Company 360 child panels reuse FormSection. People card category badges
and team card status/actions also use shared components.

## 12. Specialized views retained

Pipeline board, meeting agenda/calendar, task focus view, People cards, team cards,
dashboard and Company 360 workspace retain domain layouts. No new backend, route,
permission or auth/session architecture was introduced.

## 13. Duplicate implementations removed

Meeting/Task/Opportunity action menu markup replaced by configuration adapters;
Attention hero and People/Teams/Attention KPI implementations replaced by reference
components; duplicated admin/activities/library action buttons replaced by
EntityRowActions; Company 360 section frames reuse FormSection. Table wrappers
were removed where they duplicated the canonical frame/overflow.

## 14. Temporary QA artifacts

Removed apps/web/phase21-qa.html and apps/web/src/phase21-qa.tsx after local browser
review. They were committed temporary fixture entrypoints and are recoverable
from Git. Neither remains in the production entrypoint. Real tests were retained.
No production API write was performed by the GET-only fixture preview.

## 15. Tests

Five new focused tests in VisualSystem.test.tsx cover optional hero actions,
permission-aware view/edit actions, destructive cancellation/confirmation,
table custom actions/loading/empty/pagination and optional toolbar/reset.
Existing list tests now assert the semantic row-height class instead of a literal
68px class. Total: 19 files, 88 tests passing.

Browser geometry checks covered twelve routes at 1440/768/390px, without document
horizontal overflow in the synthetic fixture scenarios. Visual review covered the
eight required representative routes. A mobile form clipping regression discovered
during review was fixed using max-content rows in the shared scroll body.
Review was local, not a production/full-role E2E certification.

## 16. Validation commands and final output

All six requested commands were executed from the repository root.

### npm ci

Exit code: 0

```text
added 599 packages, and audited 602 packages in 20s

186 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
```

### npm run lint

Exit code: 0

```text
web:lint: 
web:lint: E:\nodejs\iam-crm-frontend-shadcn\apps\web\coverage\block-navigation.js
web:lint:   1:1  warning  Unused eslint-disable directive (no problems were reported)
web:lint: 
web:lint: E:\nodejs\iam-crm-frontend-shadcn\apps\web\coverage\prettify.js
web:lint:   1:1  warning  Unused eslint-disable directive (no problems were reported)
web:lint: 
web:lint: E:\nodejs\iam-crm-frontend-shadcn\apps\web\coverage\sorter.js
web:lint:   1:1  warning  Unused eslint-disable directive (no problems were reported)
web:lint: 
web:lint: ✖ 3 problems (0 errors, 3 warnings)
web:lint:   0 errors and 3 warnings potentially fixable with the `--fix` option.
web:lint: 

 Tasks:    2 successful, 2 total
Cached:    1 cached, 2 total
  Time:    19.651s
```

### npm run typecheck

Exit code: 0

```text
Tasks:    2 successful, 2 total
Cached:    1 cached, 2 total
  Time:    16.447s
```

### npm run test:run

Exit code: 0

```text
Test Files  19 passed (19)
      Tests  88 passed (88)
   Start at  00:17:35
   Duration  11.83s (transform 6.84s, setup 8.03s, import 29.68s, tests 14.88s, environment 38.20s)
```

### npm run build

Exit code: 0

```text
web:build: (!) Your Vite config uses features that are unsupported by `configLoader: 'native'`, which is planned to become the default in a future major version of Vite:
web:build:   - `__dirname` (vite.config.ts:11:25). Use `import.meta.dirname` instead
web:build: Set `VITE_CONFIG_NATIVE_IGNORE_WARNING=true` to suppress this warning.
web:build: vite v8.2.2 building client environment for production...
web:build: transforming...
web:build: ✓ 3474 modules transformed.
web:build: rendering chunks...
web:build: computing gzip size...
web:build: dist/index.html                                                0.48 kB │ gzip:   0.30 kB
web:build: dist/assets/geist-cyrillic-ext-wght-normal-DjL33-gN.woff2      7.42 kB
web:build: dist/assets/geist-vietnamese-wght-normal-6IgcOCM7.woff2        8.00 kB
web:build: dist/assets/geist-cyrillic-wght-normal-BEAKL7Jp.woff2         15.08 kB
web:build: dist/assets/geist-latin-ext-wght-normal-DC-KSUi6.woff2        16.51 kB
web:build: dist/assets/geist-latin-wght-normal-BgDaEnEv.woff2            29.40 kB
web:build: dist/assets/BYekan-Regular-eVh8TlJb.ttf                      229.54 kB
web:build: dist/assets/BYekan-Bold-wdC9QWkW.ttf                         246.38 kB
web:build: dist/assets/index-Xmv-WPr_.css                               155.28 kB │ gzip:  24.42 kB
web:build: dist/assets/index-D_s366od.js                              1,570.97 kB │ gzip: 422.76 kB
web:build: 
web:build: ✓ built in 1.02s
web:build: [plugin builtin:vite-reporter] 
web:build: (!) Some chunks are larger than 500 kB after minification. Consider:
web:build: - Using dynamic import() to code-split the application
web:build: - Use build.rolldownOptions.output.codeSplitting to improve chunking: https://rolldown.rs/reference/OutputOptions.codeSplitting
web:build: - Adjust chunk size limit for this warning via build.chunkSizeWarningLimit.

 Tasks:    1 successful, 1 total
Cached:    0 cached, 1 total
  Time:    13.535s
```

### git diff --check

Exit code: 0. No whitespace errors. Git reports LF-to-CRLF conversion warnings on
this Windows working tree; these are not diff-check errors.

## 17. GitHub CI readiness

Local clean installation, lint, typecheck, tests and build pass. The reproduced
initial lint errors were in the temporary QA entrypoint (no-useless-assignment and
prefer-const); no ESLint rules were disabled and no source exclusions were added.
Three warnings remain in pre-existing generated coverage JavaScript.
No commit/push or remote Actions run was performed, so remote CI green is NOT claimed.

## 18. Remaining visual limitations

Specialized card/quick-filter layouts deliberately differ. Legacy admin modal
children still own their form footers, while the modal header/focus/scroll shell
is shared. Company 360 internal domain content is not a full uniform-table rewrite.
Dark-theme and every role/empty/error combination were not exhaustively reviewed
in the browser. Thus a blanket claim that every screen and every form now has
identical visual structure would be inaccurate.

## 19. Remaining technical debt

Existing Vite warning about __dirname with future native config loading and the
large application JS chunk remain; neither was suppressed. Optional sort/selection/
bulk features are composed using columns and toolbar slots, not a newly implemented
table state engine. Legacy onView/children support in EntityRowActions remains
for compatibility; new callers should use typed actions.

## 20. Acceptance statement

**All Phase 2.2 acceptance criteria fully satisfied: not claimed.**

The canonical component architecture, listed normal-page migrations, shared
row/actions/filter/pagination foundation, responsive RTL checks and all requested
local validation gates are complete. Backend/routes/permission predicates/auth
are unchanged. The broadest criterion (“all normal forms” and no remaining
page-specific visual implementations throughout the product) still has the legacy
footer/domain-content exceptions stated above. Remote CI must also run after the
changes are committed/pushed. This report explicitly distinguishes the completed
deliverable from full-product visual certification.

