# Application Implementation Backlog

This is the recommended order for building the GAM application, not only its API/authentication foundation. It covers the platform, shared UI, pages, feature components, forms, hooks, queries, and delivery. It is a roadmap, not evidence that a step is already complete. Complete and verify each step before relying on the next one.

Pages and features must come from accepted product requirements. This document defines **how** to implement them safely; it does not invent a future page catalogue.

## 1. Stabilize the current frontend baseline

**Status:** Complete. The existing TypeScript and ESLint errors are resolved, and the local lint and production-build commands pass.

- Resolve the current TypeScript build error and ESLint errors.
- Keep the existing React/Vite/TanStack base; improve it incrementally rather than rewriting the application.
- Keep `src/routeTree.gen.ts` generated and out of manual edits.
- Establish a passing local baseline before adding new application behavior.

**Done when:** `npm run lint` and `npm run build` pass.

## 2. Establish the backend-owned OpenAPI contract

**Status:** Complete for local development. The backend owns the generated contract, declares the `/api` base, and documents its generation and governance flow. The checked-in generated frontend reference is sufficient for the current local workflow; publishing a versioned `openapi.yaml` release asset remains a future delivery concern.

This is a shared-contract prerequisite owned by the backend repository.

- Generate the API description from the backend implementation and publish it as a versioned release artifact.
- Declare the public `/api` server base in the contract.
- Define the accepted generation, publication, and breaking-change-check workflow.
- Include the accepted authentication endpoints and current-Account response in the contract.

Do not create a competing handwritten OpenAPI file in this repository. The frontend should not select a generator or claim contract automation until the backend artifact and shared tooling decision exist.

**Done when:** a versioned backend OpenAPI artifact is available and the frontend can identify the supported version. See [API integration](../integration/api.md) and the backend-owned [web contract](https://github.com/DudsFerraz/GAM-Bakckend-API/blob/main/docs/requirements/platform/web-delivery-and-frontend-contract.md).

## 3. Consume the selected OpenAPI version in the frontend

**Status:** Complete for local development. The frontend consumes [`src/api/generated/gam-api.ts`](../../src/api/generated/gam-api.ts) as its generated route and transport-type reference. Pinning a release asset and verifying generation against it remains a future release-delivery concern.

- Add the accepted TypeScript generation workflow after step 2 is available.
- Pin or otherwise record the supported OpenAPI version.
- Generate transport types into a clearly identified generated location; do not manually edit them.
- Replace the handwritten transport DTOs currently colocated at feature/API boundaries.
- Keep frontend-specific view models and mappings outside generated files when they add UI value.

**Done when:** frontend API calls compile against generated transport types from one selected contract version.

## 4. Create the same-origin API infrastructure

**Status:** Complete for the current frontend integration. The shared client uses `/api`, Vite forwards that prefix to a server-only configurable local backend target, and the existing member and role adapters use the plural paths in the checked-in generated contract. Release pinning remains a future delivery concern.

- Configure Vite to proxy relative `/api/*` requests to the local backend.
- Configure the HTTP client to use relative `/api` paths rather than a browser-visible backend origin.
- Align every existing API module with the generated contract, including plural resource roots where the contract specifies them.
- Remove dependence on an uncommitted `VITE_API_URL` for the supported browser workflow.

**Done when:** local browser requests stay on the Vite origin and reach the backend through `/api`, without CORS.

## 5. Implement the accepted browser authentication boundary

**Status:** In progress. The checked-in contract now exposes `GET /auth/csrf` and `GET /accounts/me`. Startup bootstrap, in-memory access tokens, CSRF-protected login/refresh/logout, current-Account loading, effective-permission visibility, in-instance single-flight refresh, bounded replay, and cross-tab logout broadcast are implemented. Cross-tab refresh coordination, unconfirmed-logout feedback, and one-time Account resynchronization after an unexpected `403` remain.

- Introduce one authentication context/state with `initializing`, `authenticated`, and `unauthenticated` states.
- Implement startup: CSRF bootstrap, refresh, in-memory access-token storage, then current Account loading.
- Send the CSRF proof for login, refresh, and logout as required by the contract.
- Replace persistent bearer-token storage and JWT-based route authentication.
- Implement single-flight refresh, one replay at most per protected request, and no refresh on `403`.
- Coordinate refresh and logout between tabs through an ephemeral browser mechanism.
- Use current Account effective permissions for UI capability visibility.

**Done when:** protected UI cannot render before bootstrap completes and no access token is persisted in browser storage. See [Browser authentication](../integration/authentication.md).

## 6. Establish the application shell and shared UI boundaries

**Status:** Complete. The authenticated shell, responsive navigation, theme control, and reusable asynchronous-state components are established. Feature pages can compose them without copying application layout or feedback states.

- Keep the root route responsible for application-wide providers and feedback only.
- Create or refine the authenticated application shell: navigation, page outlet, responsive layout, loading boundary, error feedback, and theme behavior.
- Keep reusable primitives in `src/components/ui/`, cross-feature components in `src/components/`, and application composition in `src/app/`.
- Do not make a component shared merely because it appears twice; extract only stable, genuinely reusable behavior.
- Define accessible loading, empty, error, confirmation, and forbidden-state patterns that feature pages can reuse.

**Done when:** new pages can use one consistent application shell and shared UI vocabulary without copying layout or state-feedback logic.

## 7. Deliver pages as vertical features

**Current progress:** the current backend capabilities now have frontend vertical slices for Members, membership solicitations, Account-role administration with contextual RBAC inspection, Events and Presences, and Locations. They use generated transport types, feature API modules, TanStack Query, React Hook Form/Zod for submitted data, responsive routes, and explicit asynchronous states. They still depend on the pending accepted authentication boundary.

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

**Status:** In progress. The contract-backed management candidates have initial vertical slices. Product validation, the accepted browser-authentication boundary, test tooling, and follow-up usability refinement remain pending.

- Start with one real end-to-end feature after the base contracts are ready, then add the next approved page/feature.
- Keep protected routes dependent on completed authentication state rather than token decoding.
- Migrate existing account, role/permission, and member code as their features are touched; do not perform a speculative mass refactor.
- Reuse the shared shell, UI primitives, API infrastructure, query conventions, and form patterns established by earlier features.
- Add a shared abstraction only after multiple real features demonstrate the same stable need.

**Done when:** each new page adds product value without bypassing the established route, UI, API, query, or authentication boundaries.

## Implemented features from the current backend contract

The following first-pass UI behavior is implemented from the checked-in generated route reference. This records current frontend behavior, not a claim that later product refinement or the accepted authentication work is complete.

1. **Member management.** Search and lifecycle actions now include direct registration (`POST /members`), a dedicated detail route (`GET /members/{id}`), and Member presence history (`GET /members/{id}/presences`).
2. **Membership solicitations.** The Solicitation view provides self-service submission, authenticated scoped history/search, detail, and `MEMBER_MANAGE` approval/rejection.
3. **Account and role administration.** The Account view searches Accounts, lists Account roles, assigns/drops roles, and looks up a specific assignment.
4. **Events and attendance.** The Event view creates/searches/views Events and the Event and Member detail routes show their respective Presence histories when authorized.
5. **Locations.** The Location view creates, lists, and opens dedicated detail routes. Event creation consumes Location options.
6. **RBAC reference data.** Role, role-permission, and Permission detail reads are contextual panels inside Account-role administration.
7. **Current Account profile.** The authenticated sidebar opens a dedicated read-only profile using the `/accounts/me` identity, active Roles, and effective permission codes already held by the session context. The current contract does not expose an Account update operation.

## Out of scope for this order

- Selecting OpenAPI generators, clients, or breaking-change tools before the shared decision.
- Copying backend DTOs, authentication requirements, deployment files, or operations runbooks into this repository.
- Cross-origin browser calls, persistent access tokens, a generic repository layer, or speculative feature abstractions.
- Creating unapproved pages, roles, workflows, or product behavior merely to fill out the application structure.
