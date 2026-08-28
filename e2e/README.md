# E2E foundation / next increment

Phase 1 uses Vitest + Testing Library for deterministic infrastructure integration tests.
Playwright and browser downloads are intentionally not added to production dependencies or CI yet.
There is no isolated seeded backend/test tenant or agreed cleanup contract in this repository;
running the requested creation/transition flows against production is not acceptable.

Before enabling Playwright:

1. Provision a disposable backend database and seeded tenant with manager, viewer and denied users.
2. Set a test-only API URL and HTTPS/cookie configuration matching deployment. Never commit credentials.
3. Install `@playwright/test` as a dev dependency; install Chromium in the separate E2E job.
4. Configure a local Vite `webServer`, retries only in CI, and trace capture only on failures.
5. Keep storage state, traces and reports ignored; they can contain sensitive data.

First scenarios, in priority order:

| Area | Assertions |
| --- | --- |
| Login | Validation, invalid credentials, successful password login; no localStorage token/user |
| Refresh | Reload a detail URL; concurrent 401; expired cookie; network outage and retry |
| Companies | Authorized creation, required fields, duplicate conflict, cleanup |
| Opportunities | Creation, valid/forbidden stage transition, persisted detail |
| Meetings | Creation/edit, library type, relationship preservation |
| Tasks | Creation, completion, permissions |
| Permissions | Menu and direct URL agree; view-only cannot mutate; backend rejects forbidden requests |
| Routing | Unknown URL gives 404, denied route gives 403, aliases retain destinations |

Do not use production accounts, skip server authorization, or disable TLS validation.
