# Technical Center UI — Phase 4.2

Phase 4.2 exposes the Phase 4.1 Technical Center domain in the new CRM frontend. No backend schema, migration, lifecycle policy, or API was changed.

## Routes and modules

| Module | List | Create | Detail |
| --- | --- | --- | --- |
| Releases | `/technical/releases` | `/technical/releases/new` | `/technical/releases/:id` |
| Knowledge Base | `/technical/knowledge-base` | `/technical/knowledge-base/new` | `/technical/knowledge-base/:id` |
| Documents | `/technical/documents` | `/technical/documents/new` | `/technical/documents/:id` |
| Resources | `/technical/resources` | `/technical/resources/new` | `/technical/resources/:id` |
| Tenders | `/technical/tenders` | `/technical/tenders/new` | `/technical/tenders/:id` |

All routes remain lazy-loaded. Navigation and route access use the exact seeded `technical-*:view` permissions. Create/edit actions require `manage`; publish, approve, submit, and close actions are separated according to their dedicated permissions.

## API and lifecycle behavior

The client uses `/technical/releases`, `/technical/knowledge-base`, `/technical/documents`, `/technical/resources`, and `/technical/tenders`, plus the existing transition, document-version, tender-requirement, and tender-deliverable subroutes. Query keys are scoped and mutations invalidate only the affected lists/details.

Lifecycle actions are derived from the backend policy and use `/transition`; resource status uses the existing resource PATCH contract because Phase 4.1 does not provide a resource transition endpoint. The UI never replaces Product with Release or Opportunity with Tender.

Product, Company, Opportunity and User selectors reuse current CRM lookup APIs. Opportunity options are constrained by the selected Company. Release options are constrained by the selected Product. Technical Document and Resource files reuse `/attachments`; document versions remain append-only through the Phase 4.1 versions endpoint.

## Responsive and deadline rules

Lists render the shared table at `md` and above and the shared entity-card pattern below `md`; pagination always uses the common `PaginationControls`. Detail metadata and forms collapse from multi-column grids to a single readable column.

Tender deadline emphasis is derived only from `submissionDeadline`: past dates are overdue, dates from today through the next seven calendar days are approaching, and later dates are normal. This is presentation-only and creates no persisted health state.

## Phase 4.1 contract limitations

- Knowledge and Resource responses currently expose relationship IDs without expanded Product/Release/User display objects; the UI therefore shows the returned identifier when no label is available.
- Technical Documents support server-side `confidentiality` and `tenderId` filters. The Tender selector resolves labels through the existing Technical Tender list endpoint.
- Document versions accept an existing attachment ID; upload/storage remains the shared attachment system.
- No advanced readiness scoring, SLA/escalation, analytics, bulk import, AI extraction, committee workflow, Opportunity-stage synchronization, or new notification architecture is included. These remain Phase 4.3 candidates.
