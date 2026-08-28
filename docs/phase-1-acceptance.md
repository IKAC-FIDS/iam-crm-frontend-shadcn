# Phase 1 hardening acceptance — 2026-08-28

## 1. Root causes
Frontend lint failed on mixed component/helper exports, synchronous effect-driven state resets, incorrectly named hooks, unstable memo dependencies, an explicit any and unused data. Backend CI also exposed stale test fixtures for Meeting lookup options, ReportsController dependencies and dashboard managementSummary, plus a prefer-const error.
The checked-in OpenAPI artifact was behind current code by 11 operations.

## 2. Frontend changes
Preserved memory-only access tokens, HttpOnly refresh cookies, SessionBoundary, same-tab deduplication, revision guards, route policies, URLs and RTL/theme.
Added same-origin Web Locks ownership for refresh, login, passkey verification, logout and account session mutations. Account mutations refresh/retry outside ownership on 401, never recursively inside the lock. Revoking the displayed current session uses cookie logout because its listed ID may already have rotated.
Non-secret random generation/kind markers communicate logout/session changes through storage events; focus/pageshow reconcile missed events. No tokens or user/tenant details are persisted/broadcast.

## 3. Backend changes
Added CookieOriginGuard to cookie-changing auth controllers, including public login/passkey verification and SSO ticket exchange. JWT protection remains on session/account endpoints.
Added production cookie startup validation. Added reuse detection for ROTATED tokens at getActiveSession, closing the precheck bypass.
No database schema or migration changes. No dependency changes.

## 4. Exact multi-tab analysis
Before changes:
- Both tabs can pass getActiveSession(R1).
- If B's rotate read follows A's commit, B sees revoked R1 and revokes ALL active, unexpired sessions for that user with REUSE_DETECTED.
- If both rotation reads were active, the transactional compare-and-set has one winner; the loser receives 401 without mass revocation.
- A request arriving after rotation failed in getActiveSession before reaching reuse detection.
Three regression tests first proved these paths against the original service. The precheck test was then updated to assert the strengthened replay behavior.
No token-family grace period was present or added. replacedBySessionId alone is not an idempotency protocol.

## 5. Final multi-tab strategy
Web Locks serialize actual cookie-changing HTTP calls. Each tab obtains its own in-memory access token by refreshing the latest browser cookie after acquiring ownership.
A waiting tab times out after 45 seconds without stealing ownership or sending an uncoordinated request. Network requests retain the 30-second transport timeout.
Browsers without Web Locks fail closed; they do not fall back to an unsafe localStorage mutex. Requires HTTPS or a browser-trusted localhost context.
Logout generation invalidates queued refreshes. New tabs honor a previously published logout. Session-change notifications clear old query data and bootstrap the new context. Stale notification payloads are ignored in favor of the current marker.
Reference: [Web Locks](https://developer.mozilla.org/en-US/docs/Web/API/Web_Locks_API).

## 6. Security rationale
No refresh/access tokens cross tabs; storage contains only id/kind. Same-origin XSS remains capable of acting as the user; memory-only storage is not an XSS defense.
No replay grace or token-reuse exemption was added. Raw uncoordinated duplicate refreshes still fail closed and may revoke active user sessions.
Every participating frontend must use the coordinator and share the same origin. Old MUI tabs or another frontend origin are not coordinated by this implementation.

## 7. CSRF / Origin
Existing main.ts already actively rejects present untrusted Origins, but accepted missing Origin. CookieOriginGuard now rejects missing, null and untrusted Origin on protected mutation endpoints, including production.
An exact CORS_ORIGINS match is required; wildcard/suffix matching is not used. Only explicit AUTH_ALLOW_MISSING_ORIGIN=true in non-production permits CLI requests without Origin. CLI production clients must send the trusted Origin.
Bearer JWT guards still authorize session/account routes; Origin is an additional browser CSRF boundary, not authentication.
SSO protocol callbacks remain unchanged: OIDC validates stored state/nonce/PKCE; SAML consumes RelayState. The new guard protects ticket exchange, not third-party protocol callbacks. Existing global CORS behavior for IdP POST callbacks was not redesigned.

## 8. Cookie production policy
HttpOnly=true; Secure=true mandatory in production; exact Path=/api/auth required there. Invalid Secure/SameSite settings fail startup. Set/clear use the same builder.
Production default SameSite=None is preserved for compatibility, not assumed necessary. Use lax when verified deployment topology is same-site. None requires Secure. No domain attribute added.
Example for the known frontend origin, after checking server configuration:
```dotenv
CORS_ORIGINS=https://op.neshane.co
CORS_CREDENTIALS=true
REFRESH_TOKEN_COOKIE_SECURE=true
REFRESH_TOKEN_COOKIE_PATH=/api/auth
```
Do not change SameSite blindly without checking actual API/frontend origins.

## 9. Tests added
Backend: real Nest HTTP controllers, validation, exception/success envelopes, AuthService, JWT strategy/signing, bcrypt and RefreshTokenService with synthetic in-memory persistence. Covers login success/failure, missing refresh cookie, rotation, old-token replay, concurrency, serialized browser behavior, logout/all, inactive user, switch-tenant, cookie attributes and Origin rejection.
This is NOT a PostgreSQL transaction integration test. Separate service interleaving tests prove the compare-and-set/reuse branches.
Frontend: independent lock callers, ownership/failure release, timeout without stealing, unsupported browser, stale/self messages, remote logout, new-tab logout, tenant context/query invalidation, current-session revocation and TimeInput reset behavior.

## 10. Lint fixes
Moved button variants and sidebar context/hook into non-component modules; removed unused badge variant export.
Replaced prop-to-state synchronization effects with guarded render-time state adjustments, preserving reset dependencies and form contents. Debounce/subscription effects remain effects.
Corrected custom hook naming, memo dependencies, typed follow-up responses, useWatch usage and unused companyId removal. Clock-dependent opportunity summary now has a minute subscription.
No lint rule disabled, no source file excluded, no error downgraded. Three local warnings come from generated coverage JavaScript; source lint errors are zero.

## 11. CI
Existing frontend Phase 1 workflow preserved. Backend workflow unchanged. No continue-on-error, deployment or new package added.
Commands ran locally on Node 26.4.0/npm 11; hosted GitHub Actions was not run here. Backend CI targets Node 20, frontend CI Node 24.

## 12. API / OpenAPI
All existing routes and response envelopes preserved, including logout-all's existing non-data-wrapped success shape.
Origin is now a documented required request header for cookie mutations: intentional security tightening for production CLI clients.
Corrected documented cookie name refresh_token to actual refreshToken. Regenerated OpenAPI includes 334 actual operations; the previous 323 count omitted existing activity/meeting type options, company overview, organization roles and conversion-health routes. No new business route introduced.
OpenAPI regeneration was byte-identical on a second run. Commit the regenerated artifact together with source; the workflow's git diff guard otherwise detects an uncommitted/stale artifact.

## 13–14. Files added / modified
See [phase-1-files.md](./phase-1-files.md) for exact paths. The frontend was already dirty with earlier Phase 1 work; the inventory explicitly includes those retained changes.
Generated tracked backend dist and Prisma client outputs were restored to their original versions after validation to avoid committing unrelated generated churn. Run the normal generate/build before running backend locally.

## 15. Frontend commands
- npm ci: exit 0, 599 packages, 0 reported vulnerabilities.
- npm run lint: exit 0, zero errors; 3 generated-coverage warnings.
- npm run typecheck: exit 0 (both workspaces).
- npm run test:run: exit 0, 42 passed in 7 files.
- npm run build: exit 0; existing large-chunk and Vite __dirname warnings remain.
- git diff --check: exit 0.

## 16. Backend commands
- npm ci: exit 0, 1056 packages; 42 reported vulnerabilities (3 low, 27 moderate, 12 high). No automatic dependency upgrades performed.
- npm run ci: exit 0. Runs prisma:generate, lint, test, build, openapi:generate, openapi:validate, test:contract.
- Full test run: 499 passed, 9 skipped; 73 passing suites and one optional PostgreSQL quota suite skipped by its existing RUN_QUOTA_DB_TESTS gate.
- Contract run: 26 passed in 5 suites.
- Lint: zero errors, 7 existing warnings.
- OpenAPI validate: valid; repeated generation identical.
- git diff --check for src/test/openapi: exit 0.
Initial failed runs were fixed, not suppressed: stale fixtures, prefer-const and outdated OpenAPI operation count.

## 17. Remaining risks / unverified acceptance
- No actual multi-tab browser/staging exercise was performed. Lock tests model browser ownership, not browser process termination or HTTP cookie delivery.
- Closing the owner tab or losing a response AFTER server rotation can leave an old cookie. Web Locks releases ownership, but cannot roll back server rotation; a later attempt may require login or trigger existing all-session reuse revocation. This edge is NOT claimed solved by the current patch.
- Cross-origin frontends and already-open legacy tabs do not share this coordination.
- PostgreSQL auth transaction behavior was not exercised against a real isolated DB. Docker Desktop engine was unavailable.
- npm reported 12 high backend dependency vulnerabilities; exploitability/upgrades have not been assessed here.
- A failed server logout is reported as failure; local logout is not proof of server revocation.
- No business E2E/regression sweep, hosted CI run, production deployment or real Passkey/SSO test occurred.

## 18. Acceptance decision
Automated project commands are green, but full production Phase 1 acceptance is NOT declared complete. Real-browser lost-response/owner-close validation and remediation if needed, deployment topology validation and dependency security review remain. Do not interpret green unit/HTTP-contract checks as proof these edges are resolved.
