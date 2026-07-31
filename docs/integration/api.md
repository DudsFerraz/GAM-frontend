# API Integration

## Accepted boundary

The API is served at the same public origin under `/api`. Frontend code must use relative `/api/*` URLs and must never embed a production backend hostname. In production, a public proxy serves the SPA under `/` and forwards `/api/*` to the private backend; SPA fallback applies only to non-API routes. The accepted details are in [Web Delivery and Frontend Contract](https://github.com/DudsFerraz/GAM-Bakckend-API/blob/main/docs/requirements/platform/web-delivery-and-frontend-contract.md) and [ADR-0006](https://github.com/DudsFerraz/GAM-Bakckend-API/blob/main/docs/decisions/0006-use-a-single-vps-same-origin-proxy-topology.md).

For development, the browser should call the same relative paths and Vite should proxy `/api` to the local backend. The browser must not call the backend port directly through CORS.

## Current implementation

`src/lib/http/client.ts` uses the fixed relative `/api` base. Feature API modules append resource paths such as `/auth/csrf`, `/auth/login`, `/auth/refresh`, `/accounts/me`, `/members/search`, `/membership-solicitations/search`, `/accounts/search`, `/events/search`, `/oratorios`, `/oratorianos/search`, and `/gam-locations`; browser requests therefore stay on the frontend origin under `/api/*`. `vite.config.ts` proxies `/api` to `API_PROXY_TARGET` (defaulting to `http://localhost:8080`) and removes the public `/api` prefix because the local Spring Boot application maps resources at its root. `API_PROXY_TARGET` is a server-only development value, not a `VITE_*` browser variable.

`.env.example` documents the supported local target. A developer may override it in the ignored `.env` file without changing browser code or committing a machine-specific backend origin.

## Current integration status

The frontend feature adapters use the routes and transport shapes in the checked-in generated contract for browser authentication, current Account, Members, membership solicitations, Account consultation, Events and Presences, Oratórios and Oratorianos, Locations, Roles, and Permissions. Member lifecycle actions use `PATCH /members/{id}/activate`, `PATCH /members/{id}/deactivate`, `PATCH /members/{memberId}/coordinator/grant`, and `PATCH /members/{memberId}/coordinator/revoke`, always with a reason. The Account details dialog also uses the dedicated `/members/{memberId}/oratorio-coordinator/grant` and `/revoke` routes under `ORATORIO_COORD_MANAGE`; it verifies the active Member relationship internally and never exposes generic system-role editing. Generic Event management uses `PUT /events/{id}`, `DELETE /events/{id}`, and the intent-specific cancel, lock, finalize, and reopen routes; the UI exposes only transitions supported by the current Event status and requires `EVENT_MANAGE`, while the backend remains authoritative for state and audience validation. Granular Role/Permission inspection remains outside the UI, while Permission records are consumed internally for Event audience choices. Presence registration uses `POST /events/{eventId}/presences`, observation editing uses `PATCH /events/{eventId}/presences/{memberId}`, and reasoned removal uses `DELETE` on that individual route. The UI checks `PRESENCE_REGISTER`, `PRESENCE_EDIT`, and `PRESENCE_REMOVE` separately, uses Member search instead of identifier entry, and invalidates both the Event roster and affected Member history after successful writes.

The Oratório adapter creates and reads specialized occurrences, replaces the four planning fields, maintains fixed-team membership, invokes the documented lifecycle routes, and deletes with a reason. The tracker reads both fixed-size rosters plus `/oratorios/{id}/attendance/present`, writes each Member or Oratoriano relation independently, and uses `register-and-mark` for the atomic quick-registration path. Oratoriano adapters cover ordinary registration/search/detail/replacement, paginated attendance history, informative attendance summaries, and reasoned deletion through `DELETE /oratorianos/{oratorianoId}`. Successful deletion keeps attendance history, reconciles Oratoriano lists and Oratório trackers, and removes the deleted detail from cache after navigation. The profile reads `GET /oratorianos/{oratorianoId}/forms` only under `ORATORIANO_FORM_GET`, with independent pagination and metadata-only presentation; it never prefetches form detail. A business-facing history action explicitly opens `GET /oratorianos/{oratorianoId}/forms/{formId}` in a dedicated read-only page. The open `FormRDTO.data` value is narrowed by a feature-local Zod schema before presentation, background refetch is disabled, and the exact sensitive query is removed on exit. Creation and the remaining sensitive form lifecycle stay unavailable because the current shapes cannot support reload-safe files and presentable actors. The generated contract still lacks a published source-artifact version, so future regeneration and release pinning remain blocked on the backend-owned workflow.

### Oratório and Oratoriano contract alignment

| Frontend operation | Contract behavior |
| --- | --- |
| `POST /events/search` | Supplies the fixed `ORATORIO` type filter for discovery because no specialized occurrence-search route exists. |
| `POST /oratorios` | Sends only the local occurrence date and consumes the complete specialized detail. |
| `PUT /oratorios/{id}/planning` | Replaces all four optional planning texts in one request. |
| `PUT`/`DELETE /oratorios/{id}/teams/{teamType}/members/{memberId}` | Maintains one of the four fixed teams idempotently after a business-facing Member search. |
| Specialized lifecycle routes and `DELETE /oratorios/{id}` | Use status-specific actions; cancellation, reopening, and deletion collect a reason. |
| Attendance roster routes plus `/attendance/present` | Keep page/search state separate from the complete persistent present summary. |
| Individual attendance `PUT`/`DELETE` | Persist one checkbox immediately; completed-occurrence removal includes its required reason. |
| `POST /attendance/oratorianos/register-and-mark` | Runs only after an explicit similar-name check and creates the person plus attendance atomically. |
| Ordinary `/oratorianos` routes | Cover minimal registration, name search, complete ordinary-profile replacement, history, and summary without exposing rankings. |
| `DELETE /oratorianos/{oratorianoId}` | Sends the required reason, preserves attendance, removes draft artifacts atomically, and surfaces the immutable-form conflict safely. |
| Dedicated `/members/{memberId}/oratorio-coordinator/*` routes | Grant or revoke the Oratório responsibility only after an internal active-Member and access-projection check. |

### Additional-form contract gate

The metadata-only additional-form history, explicit sensitive detail, draft creation, and complete draft replacement are implemented from the checked-in generated contract. History and detail deliberately omit actor identities because `AccountReferenceRDTO` currently provides only an identifier. The detail action is permission-aware and does not preload content. `FormRDTO.data` is narrowed with a feature-owned runtime schema before either read-only presentation or editor initialization; incompatible data produces a safe error instead of an empty form. The editor maps validated transport data into control values and maps the complete form back to `FormDraftDTO`, without creating handwritten route or response DTOs. Snapshot and attachment UI are still blocked from a reload-safe lifecycle because the contract does not yet provide enough read information to resume the same file workflow after a reload:

| Required frontend boundary | Current generated behavior | UI impact |
| --- | --- | --- |
| Active signed-attachment discovery | `PUT /signed-attachments` returns `AttachmentRDTO[]`, while the only `GET` requires an already-known `attachmentId` | Existing attachments and their download identifiers cannot be rediscovered in another session. |
| Print-snapshot discovery | `POST /print-snapshots` returns `PrintSnapshotRDTO`, while PDF rendering requires an already-known `printSnapshotId` | The current or most recent snapshot cannot be recovered after reload. |
| Typed sensitive detail | `FormRDTO.data` is `{ [key: string]: unknown }` even though `FormDraftDTO` exists | Current creation/editing validates `data` at runtime against the generated `FormDraftDTO` shape before mapping it. A future generated typed property can remove this temporary narrowing without changing the editor. |
| Business-facing actors | `AccountReferenceRDTO` contains only `id` | History cannot identify actors without rendering a UUID. |

The required file-discovery routes and response-shape evolution are backend-owned. Until a regenerated artifact supplies these boundaries, the frontend does not create guessed endpoints, handwritten transport DTOs, UUID fields, or file controls that lose attachment and snapshot continuity. Draft creation and editing use only the published `POST` and integral `PUT`; deletion, snapshots, attachments, completion, and revocation remain absent. The accepted target behavior remains documented in the [remaining Oratório fronts specification](../superpowers/specs/2026-07-26-oratorio-remaining-fronts-design.md).

The current contract authorizes Member search and Event Presence-list reads separately from the three write permissions. Registration therefore needs `MEMBER_SEARCH` in addition to its own write affordance to offer a safe business selector; inactive Members are included only when the Account also has `MEMBER_GET_NON_ACTIVE`. Editing and removal need `EVENT_GET_PRESENCES` to select an existing record. If a custom Account has a write permission without the corresponding read capability, the frontend explains that selection is unavailable and does not request a UUID. This is a frontend integration limitation, not an additional backend authorization rule.

The current backend serializes `AccountRDTO.roles` as a flat Role list, as required by the accepted Account-record contract, while the checked-in generated TypeScript artifact still models that field as an `AccountRolesRDTO` wrapper. The Account API adapters normalize either representation at the frontend boundary. The generated file remains untouched; its backend generation metadata must be corrected and regenerated separately.

### Event and Presence contract alignment

The current adapters deliberately preserve these regenerated-contract boundaries:

| Frontend operation | Contract behavior |
| --- | --- |
| `POST /events` | Sends `CreateGenericEventDTO` and consumes the complete `EventRDTO` creation response. Public Events omit `requiredPermissionId`; restricted Events send the selected Permission identifier. The form accepts titles through 255 characters and descriptions through 10,000 characters. |
| `PUT /events/{id}` | Fully replaces a Generic Event. The reason is optional for ordinary changes and required when the audience changes. |
| `PATCH /events/{id}/cancel`, `/lock`, `/finalize`, and `/reopen` | Uses the intent-specific lifecycle route and the accepted body for that transition. |
| `DELETE /events/{id}` | Sends the required removal reason in the request body. |
| `GET /events/{eventId}/presences` | Consumes compact `PresenceRDTO` records and requests the accepted `registeredAt,asc` ordering. |
| `GET /members/{memberId}/presences` | Consumes the same compact Presence representation and requests `registeredAt,desc`. |
| `POST /events/{eventId}/presences` | Sends the selected Member and optional observations, then consumes `RegisterPresenceRDTO`. |
| `GET /events/{eventId}/presences/{memberId}` | Provides the supporting individual lookup by the Event–Member business relation; it does not require a separate browser page. |
| `PATCH /events/{eventId}/presences/{memberId}` | Replaces only the observations and consumes the updated compact Presence. |
| `DELETE /events/{eventId}/presences/{memberId}` | Sends the required business reason and expects no response body. |

Feature adapters use only the sort fields accepted by each route. They do not read removed nested Account or GamLocation data from compact Presence relationships. Event and Presence conflict codes cross the shared safe Portuguese error boundary; backend `message` and `details` remain diagnostic data and are never interface copy.

## Generated contract reference

The current generated backend contract is [`src/api/generated/gam-api.ts`](../../src/api/generated/gam-api.ts). Use its `paths`, `operations`, and schema types to discover available routes, HTTP operations, parameters, request bodies, and response shapes before implementing or changing a feature API module.

The file is generated by `openapi-typescript` and must not be edited manually. Feature API modules remain responsible for invoking the shared Axios client with resource-relative paths; UI-specific view models and mappings belong in the owning feature. Session bootstrap loads the authenticated context through the published `/accounts/me` operation, while Account administration uses the resource-specific Account operations. Do not create a second handwritten DTO or route catalog when the generated contract provides the required information.

The local regeneration command is documented in the [development workflow](../guides/development.md#backend-route-and-type-reference). The source artifact version, publication, and breaking-change checks are not yet documented in this repository. Treat the checked-in generated file as the current frontend contract reference, while the backend's [ADR-0005](https://github.com/DudsFerraz/GAM-Bakckend-API/blob/main/docs/decisions/0005-keep-frontend-and-backend-in-separate-repositories.md) and [web contract](https://github.com/DudsFerraz/GAM-Bakckend-API/blob/main/docs/requirements/platform/web-delivery-and-frontend-contract.md) remain authoritative for shared requirements.
