# Application Implementation Backlog

This is the recommended order for building the GAM application, not only its API/authentication foundation. It covers the platform, shared UI, pages, feature components, forms, hooks, queries, and delivery. It is a roadmap, not evidence that a step is already complete. Complete and verify each step before relying on the next one.

Pages and features must come from accepted product requirements. This document defines **how** to implement them safely; it does not invent a future page catalogue.

**Status convention:** `Done` means the behavior is implemented in the frontend and covered by the current local checks. `In progress` includes work blocked by a backend contract or route that is not available yet. This audit was updated on 19 July 2026 against the current frontend code, the checked-in generated contract, backend controllers, and accepted backend requirements.

## 1. Stabilize the current frontend baseline

**Status:** Done. The existing TypeScript and ESLint errors are resolved, and the local lint and production-build commands pass.

- Resolve the current TypeScript build error and ESLint errors.
- Keep the existing React/Vite/TanStack base; improve it incrementally rather than rewriting the application.
- Keep `src/routeTree.gen.ts` generated and out of manual edits.
- Establish a passing local baseline before adding new application behavior.

**Done when:** `npm run lint` and `npm run build` pass.

## 2. Establish the backend-owned OpenAPI contract

**Status:** In progress. The backend owns the generated contract and documents the `/api` base, live documentation, release artifact, linting, and compatibility flow. The checked-in generated frontend reference is sufficient for local development, but no versioned backend `openapi.yaml` release artifact and compatibility baseline are recorded for frontend consumption yet.

This is a shared-contract prerequisite owned by the backend repository.

- Generate the API description from the backend implementation and publish it as a versioned release artifact.
- Declare the public `/api` server base in the contract.
- Run the accepted generation, Spectral, publication, and breaking-change-check workflow.
- Include the accepted authentication endpoints and current-Account response in the contract.

Do not create a competing handwritten OpenAPI file in this repository. The frontend should not select a generator or claim contract automation until the backend artifact and shared tooling decision exist.

**Done when:** a versioned backend OpenAPI artifact is available, its compatibility baseline is configured, and the frontend records the supported version. See [API integration](../integration/api.md), the backend-owned [OpenAPI requirement](https://github.com/DudsFerraz/GAM-Bakckend-API/blob/main/docs/requirements/platform/openapi-and-frontend-api-documentation.md), and the [web contract](https://github.com/DudsFerraz/GAM-Bakckend-API/blob/main/docs/requirements/platform/web-delivery-and-frontend-contract.md).

## 3. Consume the selected OpenAPI version in the frontend

**Status:** In progress. The frontend consumes [`src/api/generated/gam-api.ts`](../../src/api/generated/gam-api.ts) as its generated route and transport-type reference for local development. Pinning a release asset, regenerating from that immutable artifact, and verifying the generated output in the release workflow remain pending.

- Add the accepted TypeScript generation and verification workflow after step 2 is available.
- Pin and record the supported OpenAPI version for each frontend release.
- Generate transport types into a clearly identified generated location; do not manually edit them.
- Replace the handwritten transport DTOs currently colocated at feature/API boundaries as each affected adapter is migrated.
- Keep frontend-specific view models and mappings outside generated files when they add UI value.
- Regenerate after the backend corrects the `AccountRDTO.roles` schema mismatch: the current backend serializes a flat Role list while the checked-in generated artifact still includes the historical wrapper shape.

**Done when:** frontend API calls compile against generated transport types from one pinned contract version, and the release check detects contract drift before publication.

## 4. Create the same-origin API infrastructure

**Status:** Done for the current frontend integration. The shared client uses `/api`, Vite forwards that prefix to a server-only configurable local backend target, and current feature adapters use resource-relative paths from the checked-in contract. Contract release pinning remains tracked in steps 2 and 3.

- Configure Vite to proxy relative `/api/*` requests to the local backend.
- Configure the HTTP client to use relative `/api` paths rather than a browser-visible backend origin.
- Align every existing API module with the generated contract, including plural resource roots where the contract specifies them.
- Remove dependence on an uncommitted `VITE_API_URL` for the supported browser workflow.

**Done when:** local browser requests stay on the Vite origin and reach the backend through `/api`, without CORS.

## 5. Implement the accepted browser authentication boundary

**Status:** Done for the accepted browser-session boundary. The checked-in contract exposes `GET /auth/csrf` and `GET /accounts/me`. Startup bootstrap, in-memory access tokens, CSRF-protected login/refresh/logout, current-Account loading, effective-permission visibility, in-instance and cross-tab refresh coordination, bounded replay, cross-tab logout broadcast, unconfirmed-logout feedback, and one-time Account resynchronization after an unexpected `403` are implemented.

- Introduce one authentication context/state with `initializing`, `authenticated`, and `unauthenticated` states.
- Implement startup: CSRF bootstrap, refresh, in-memory access-token storage, then current Account loading.
- Send the CSRF proof for login, refresh, and logout as required by the contract.
- Replace persistent bearer-token storage and JWT-based route authentication.
- Implement single-flight refresh, one replay at most per protected request, and no refresh on `403`.
- Coordinate refresh and logout between tabs through an ephemeral browser mechanism.
- Use current Account effective permissions for UI capability visibility.

**Done when:** protected UI cannot render before bootstrap completes, no access token is persisted in browser storage, and the accepted refresh, logout, and `403` synchronization behavior is covered. See [Browser authentication](../integration/authentication.md).

## 6. Establish the application shell and shared UI boundaries

**Status:** Done. The authenticated shell, responsive navigation, theme control, and reusable asynchronous-state components are established. Feature pages can compose them without copying application layout or feedback states.

- Keep the root route responsible for application-wide providers and feedback only.
- Create or refine the authenticated application shell: navigation, page outlet, responsive layout, loading boundary, error feedback, and theme behavior.
- Keep reusable primitives in `src/components/ui/`, cross-feature components in `src/components/`, and application composition in `src/app/`.
- Do not make a component shared merely because it appears twice; extract only stable, genuinely reusable behavior.
- Define accessible loading, empty, error, confirmation, and forbidden-state patterns that feature pages can reuse.

**Done when:** new pages can use one consistent application shell and shared UI vocabulary without copying layout or state-feedback logic.

## 7. Deliver pages as vertical features

**Status:** Done for the operations currently exposed by the checked-in backend contract. The initial vertical slices for Members, membership solicitations, business-facing Account access administration, Events and Presences, and Locations are implemented with generated transport types, feature API modules, TanStack Query, React Hook Form/Zod for submitted data, responsive routes, explicit asynchronous states, and Portuguese presentation mappings. They still depend on the remaining authentication refinements and the future backend operations listed below.

For each accepted product feature, implement the full vertical slice in this order:

1. Define the route and page responsibility in `src/routes/`.
2. Create a feature folder under `src/features/<feature>/`.
3. Add the feature's API module using the shared client and generated OpenAPI types.
4. Add TanStack Query hooks for reads and mutations, with stable query keys and explicit invalidation after successful mutations.
5. Add React Hook Form and Zod validation for user input when the page submits data.
6. Build feature components, composing shared UI primitives rather than duplicating them.
7. Handle loading, empty, error, success, permission, and pagination/filter states relevant to that page.
8. Connect navigation only after the route has correct authentication and capability-visibility behavior.

Keep business-specific components, hooks, query keys, API mappers, and form schemas within the feature. Use `src/hooks/` only for truly cross-feature hooks. A page coordinates the feature; it should not become a second API client or contain all reusable logic inline.

**Done when:** the feature works from route to API response with a clear UI state for every expected outcome.

## 8. Expand the application incrementally

**Status:** In progress. The contract-backed management candidates have initial vertical slices and focused Vitest/Testing Library tooling now protects the main authentication, presentation, validation, mapping, and shared-component boundaries. Product validation, release-contract verification, and follow-up usability refinement remain pending.

- Start with one real end-to-end feature after the base contracts are ready, then add the next approved page/feature.
- Keep protected routes dependent on completed authentication state rather than token decoding.
- Migrate existing account, role/permission, and member code as their features are touched; do not perform a speculative mass refactor.
- Reuse the shared shell, UI primitives, API infrastructure, query conventions, and form patterns established by earlier features.
- Add a shared abstraction only after multiple real features demonstrate the same stable need.

**Done when:** each new page adds product value without bypassing the established route, UI, API, query, or authentication boundaries.

## Implemented features from the current backend contract

The following status records current frontend behavior from the checked-in generated route reference. It does not claim that later product refinement, future backend routes, or the accepted authentication work is complete.

1. **Member management — Done for current routes.** Search and lifecycle actions include direct registration (`POST /members`), a dedicated detail route (`GET /members/{id}`), activation/deactivation, and Member presence history (`GET /members/{id}/presences`).
2. **Membership solicitations — Done for current routes.** The Solicitation view provides self-service submission, authenticated scoped history/search, detail, and `MEMBER_MANAGE` approval/rejection.
3. **Account access administration — Done for the current contract.** The Account view searches Accounts, lists translated access types, and authorized users can search available types by name, assign one with a reason, and remove an existing type. Assignment lookup and RBAC catalog inspection remain outside the UI.
4. **Events and attendance — Done for current routes; lifecycle pending.** The Event view creates/searches/views Events and the Event and Member detail routes show their respective Presence histories when authorized. The generic Event lifecycle operations described by the backend requirements are not in the current controller or generated contract.
5. **Locations — In progress at contract level.** The current UI creates, lists, and opens `/locations` detail routes, and Event creation consumes Location options. The backend requirement defines the canonical resource as `/gam-locations` with update and removal operations; that contract alignment and the corresponding frontend actions remain pending.
6. **Authorization reference data — Done for current use.** Role-permission reads remain an internal integration used to assemble Event audience choices. Raw Role/Permission catalog inspection is intentionally not a user-facing view.
7. **Current Account profile — Done for current contract.** The authenticated sidebar opens a dedicated read-only profile using the `/accounts/me` identity and translated business-facing access types. Effective permission codes remain in the session context for capability checks and are not displayed. The current contract does not expose an Account update operation.

## Backend contract and route audit

This table separates what the frontend already exposes from backend requirements that still need an API/contract change. Backend behavior remains authoritative in the linked documents; this repository tracks only the frontend work that follows those changes.

| Backend capability | Current frontend coverage | Status |
| --- | --- | --- |
| Authentication and current Account | Bootstrap, login, registration, refresh, logout, `/accounts/me`, protected routes | Done for the accepted browser-session boundary |
| Members and membership solicitations | All currently exposed controller operations have vertical UI flows | Done for current routes |
| Accounts and Account-role operations | Search, role display, authorized role search/assignment/drop with internal IDs kept behind the selector boundary | Done for the current contract |
| Events and Presences | Generic create/search/get and read-only Event/Member presence history | In progress: backend Event lifecycle and Presence write contracts |
| Locations | Current `/locations` create/list/get flow | In progress: migrate to canonical `/gam-locations`, then add update/removal |
| RBAC catalog | Internal permission reads for Event audience choices | Done for current use; no catalog screen is accepted |
| OpenAPI contract | Checked-in generated reference used locally | In progress: version, pin, regenerate, lint, and diff release contracts |

## Additional backlog identified from backend docs and routes

1. **In progress — finish release-contract consumption.** Configure the frontend to record one backend OpenAPI release version, regenerate `gam-api.ts` from that immutable artifact, and verify the generated output in the release workflow. Resolve the current `AccountRDTO.roles` wrapper-versus-flat-list mismatch at the backend contract source before removing the frontend compatibility normalization. See the backend [OpenAPI requirement](https://github.com/DudsFerraz/GAM-Bakckend-API/blob/main/docs/requirements/platform/openapi-and-frontend-api-documentation.md).
3. **In progress — align GamLocation routes and capabilities.** After the backend implements and publishes the canonical `/gam-locations` contract, including the documented authorization rules, migrate the feature adapters and Event location selector from `/locations`, add full-replacement editing and reasoned removal, and cover the required authorization and conflict states. Do not add a frontend alias for the legacy route because the backend requirement explicitly rejects that compatibility contract. See [GamLocation records](https://github.com/DudsFerraz/GAM-Bakckend-API/blob/main/docs/requirements/gam-locations/gam-location-records.md).
4. **In progress — implement the Generic Event lifecycle.** Once the backend exposes the accepted routes for editing, cancellation, locking, finalization, reopening, and removal, add the corresponding feature API operations, forms, status transitions, required reasons, visibility handling, and targeted query invalidation. See [Event records and generic lifecycle](https://github.com/DudsFerraz/GAM-Bakckend-API/blob/main/docs/requirements/events/event-records-and-generic-lifecycle.md).
5. **In progress — define and implement Presence registration.** The current controllers expose only Presence history reads. The backend Event requirement leaves Presence request shapes, permissions, and mutation contracts outside its scope, so the frontend must wait for an accepted write contract before adding attendance registration or edit controls.
6. **In progress — add specialized Event workflows only after their contracts exist.** The current Event UI supports the generic create flow and reads Events of the accepted types, but Oratorio and Missa creation/editing/lifecycle rules are explicitly future specialized workflows. Do not invent their forms or routes from the `type` enum alone.
7. **In progress — add live-backend and browser-level verification.** The frontend currently has focused Vitest/Testing Library coverage but no browser end-to-end or live-backend integration suite. Add a small accepted workflow covering bootstrap, permission-aware navigation, one Member flow, one Event flow, and the `/gam-locations` migration once the backend contract is stable.

## Out of scope for this order

- Selecting OpenAPI generators, clients, or breaking-change tools before the shared decision.
- Copying backend DTOs, authentication requirements, deployment files, or operations runbooks into this repository.
- Cross-origin browser calls, persistent access tokens, a generic repository layer, or speculative feature abstractions.
- Creating unapproved pages, roles, workflows, or product behavior merely to fill out the application structure.
- RBAC catalog administration, activity-log browsing, Account editing, and specialized Event pages until the backend requirements and product acceptance provide those contracts.
