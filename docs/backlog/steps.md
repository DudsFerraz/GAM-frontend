# Application Implementation Backlog

This is the recommended order for building the GAM application, not only its API/authentication foundation. It covers the platform, shared UI, pages, feature components, forms, hooks, queries, and delivery. It is a roadmap, not evidence that a step is already complete. Complete and verify each step before relying on the next one.

Pages and features must come from accepted product requirements. This document defines **how** to implement them safely; it does not invent a future page catalogue.

## 1. Stabilize the current frontend baseline

- Resolve the current TypeScript build error and ESLint errors.
- Keep the existing React/Vite/TanStack base; improve it incrementally rather than rewriting the application.
- Keep `src/routeTree.gen.ts` generated and out of manual edits.
- Establish a passing local baseline before adding new application behavior.

**Done when:** `npm run lint` and `npm run build` pass.

## 2. Establish the backend-owned OpenAPI contract

This is a shared-contract prerequisite owned by the backend repository.

- Generate the API description from the backend implementation and publish it as a versioned release artifact.
- Declare the public `/api` server base in the contract.
- Define the accepted generation, publication, and breaking-change-check workflow.
- Include the accepted authentication endpoints and current-Account response in the contract.

Do not create a competing handwritten OpenAPI file in this repository. The frontend should not select a generator or claim contract automation until the backend artifact and shared tooling decision exist.

**Done when:** a versioned backend OpenAPI artifact is available and the frontend can identify the supported version. See [API integration](../integration/api.md) and the backend-owned [web contract](https://github.com/DudsFerraz/GAM-Bakckend-API/blob/main/docs/requirements/platform/web-delivery-and-frontend-contract.md).

## 3. Consume the selected OpenAPI version in the frontend

- Add the accepted TypeScript generation workflow after step 2 is available.
- Pin or otherwise record the supported OpenAPI version.
- Generate transport types into a clearly identified generated location; do not manually edit them.
- Replace handwritten transport DTOs in `src/types/api.ts` incrementally at feature/API boundaries.
- Keep frontend-specific view models and mappings outside generated files when they add UI value.

**Done when:** frontend API calls compile against generated transport types from one selected contract version.

## 4. Create the same-origin API infrastructure

- Configure Vite to proxy relative `/api/*` requests to the local backend.
- Configure the HTTP client to use relative `/api` paths rather than a browser-visible backend origin.
- Align every existing API module with the generated contract, including plural resource roots where the contract specifies them.
- Remove dependence on an uncommitted `VITE_API_URL` for the supported browser workflow.

**Done when:** local browser requests stay on the Vite origin and reach the backend through `/api`, without CORS.

## 5. Implement the accepted browser authentication boundary

- Introduce one authentication context/state with `initializing`, `authenticated`, and `unauthenticated` states.
- Implement startup: CSRF bootstrap, refresh, in-memory access-token storage, then current Account loading.
- Send the CSRF proof for login, refresh, and logout as required by the contract.
- Replace persistent bearer-token storage and JWT-based route authentication.
- Implement single-flight refresh, one replay at most per protected request, and no refresh on `403`.
- Coordinate refresh and logout between tabs through an ephemeral browser mechanism.
- Use current Account effective permissions for UI capability visibility.

**Done when:** protected UI cannot render before bootstrap completes and no access token is persisted in browser storage. See [Browser authentication](../integration/authentication.md).

## 6. Establish the application shell and shared UI boundaries

- Keep the root route responsible for application-wide providers and feedback only.
- Create or refine the authenticated application shell: navigation, page outlet, responsive layout, loading boundary, error feedback, and theme behavior.
- Keep reusable primitives in `src/components/ui/` and cross-feature composition in `src/components/`.
- Do not make a component shared merely because it appears twice; extract only stable, genuinely reusable behavior.
- Define accessible loading, empty, error, confirmation, and forbidden-state patterns that feature pages can reuse.

**Done when:** new pages can use one consistent application shell and shared UI vocabulary without copying layout or state-feedback logic.

## 7. Deliver pages as vertical features

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

- Start with one real end-to-end feature after the base contracts are ready, then add the next approved page/feature.
- Make protected routes depend on completed authentication state, not token decoding.
- Migrate existing account, role/permission, and member code as their features are touched; do not perform a speculative mass refactor.
- Reuse the shared shell, UI primitives, API infrastructure, query conventions, and form patterns established by earlier features.
- Add a shared abstraction only after multiple real features demonstrate the same stable need.

**Done when:** each new page adds product value without bypassing the established route, UI, API, query, or authentication boundaries.

## 9. Verify and prepare release delivery

- Add focused tests for the API/auth boundary and the completed vertical feature once test tooling is selected.
- Keep linting, type checking, and production builds passing in CI.
- Build a versioned static artifact; coordinate its compatible frontend/backend release pair through the backend-owned deployment workflow.
- Verify production proxy behavior: non-API SPA fallback only, `/api/*` forwarding, and correct cache treatment for `index.html` and fingerprinted assets.

**Done when:** a verified frontend artifact can be selected with its compatible backend and OpenAPI artifact version without automatically changing production.

## Out of scope for this order

- Selecting OpenAPI generators, clients, or breaking-change tools before the shared decision.
- Copying backend DTOs, authentication requirements, deployment files, or operations runbooks into this repository.
- Cross-origin browser calls, persistent access tokens, a generic repository layer, or speculative feature abstractions.
- Creating unapproved pages, roles, workflows, or product behavior merely to fill out the application structure.
