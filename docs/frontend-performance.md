# Frontend performance

## Baseline and result

Measured with a production Vite build on 2026-08-29.

| Metric                     |                           Before |                                    After |
| -------------------------- | -------------------------------: | ---------------------------------------: |
| Initial JS                 | 1,548.55 kB raw / 417.15 kB gzip |  246.8 KiB gzip including static imports |
| Largest async shared chunk |                             None |            143.60 kB raw / 43.76 kB gzip |
| Largest named route chunk  |                             None |             64.40 kB raw / 13.39 kB gzip |
| JavaScript chunks          |                                1 | 118 default Vite shared and route chunks |
| CSS                        |    155.24 kB raw / 24.28 kB gzip |            155.27 kB raw / 24.29 kB gzip |

All feature pages use route-level `React.lazy`; the shell, session boundary, access checks and route registry remain eager. Technical Center pages intentionally share one chunk because they live in one module. Charts are code-native SVG, and server-paginated lists do not justify virtualization.

Run `npm run analyze`; the report is written to `apps/web/dist/bundle-report.html`. Run a normal build then `npm run bundle:check` for deterministic gzip budgets: initial JS 320 KiB, largest async route chunk 75 KiB, total JS 600 KiB and CSS 35 KiB. Default Vite chunking was retained after a measured manual grouping experiment increased initial loading. Production source maps are disabled because no upload-only monitoring provider is configured.

React Query retains a 30-second stale time, one conditional retry and disabled focus refetch. Notification polling remains feature-owned. Company 360 queries keep independent keys and pagination.

## Route lazy-load matrix

| Routes                                                    | Lazy | Chunk/exception                        |
| --------------------------------------------------------- | ---- | -------------------------------------- |
| `/login`                                                  | No   | Small public bootstrap route           |
| `/dashboard`                                              | Yes  | `DashboardPage`                        |
| `/companies`, `/companies/:companyId`                     | Yes  | Separate list/detail chunks            |
| `/people`                                                 | Yes  | `PeoplePage`; Person 360 is also async |
| `/opportunities`, `/opportunities/:id`                    | Yes  | Separate workspace/detail chunks       |
| `/pipeline`                                               | N/A  | Redirect only                          |
| `/tasks`, `/tasks/:id`                                    | Yes  | Separate list/detail chunks            |
| `/meetings`, `/meetings/:id`                              | Yes  | Separate list/detail chunks            |
| `/activities`                                             | Yes  | `ActivitiesPage`                       |
| `/attention`, `/follow-ups`, `/notifications`             | Yes  | One attention chunk; aliases redirect  |
| `/reports`                                                | Yes  | `ReportsPage`                          |
| `/admin/users`, `/admin/users/:userId`                    | Yes  | Separate list/detail chunks            |
| `/admin/teams`, `/admin/teams/:teamId`                    | Yes  | Separate list/detail chunks            |
| `/admin/exchange-rates`                                   | Yes  | Exchange-rate chunk                    |
| `/admin/permissions`                                      | Yes  | Permission matrix chunk                |
| `/admin/pipeline`                                         | Yes  | Pipeline editor chunk                  |
| `/admin/audit-logs`                                       | Yes  | Audit chunk                            |
| `/admin/libraries`                                        | Yes  | Libraries/products chunk               |
| `/account/profile`, `/account/security`, `/account/usage` | Yes  | Separate account chunks                |
| All five `/technical/*` routes                            | Yes  | Shared `TechnicalPages` chunk          |
