# Frontend Architecture

## Current implementation

### Application and routing

TanStack Router generates `src/routeTree.gen.ts` from the file routes in `src/routes/`; do not edit that generated file. The root route installs the global Axios response-interceptor component and router devtools. Public routes currently live under `/auth`. Routes in `src/routes/_authenticated/` use a `beforeLoad` guard and render inside `AppLayout`; the `_authenticated` path segment is not part of the URL.

The current guard decodes a stored JWT to obtain an account id. This is an implementation detail that conflicts with the accepted authentication direction described in [browser authentication](../integration/authentication.md); it is not an authorization boundary.

### Server state and API calls

`src/lib/reactQuery.ts` provides one TanStack Query client. Query hooks currently live both in `src/hooks/` (account and permission lookups) and alongside the member feature. Axios configuration is centralized in `src/lib/axios.ts`, while individual feature API modules call it.

`src/types/api.ts` contains handwritten transport-shaped types. They are current implementation, not an authoritative API definition. See [API integration](../integration/api.md) for the planned contract boundary.

### Forms, UI, and features

Login and registration use React Hook Form with Zod resolvers. `src/components/ui/` contains reusable Radix-based primitives and form helpers; `src/components/` contains cross-feature composition such as the layout, navigation, search/filter control, and theme provider. Feature-specific code is currently organized under `src/features/auth` and `src/features/manage/members`, with components, hooks, API calls, and constants colocated where practical.

The route-level member-management screen is the current example of a feature using a feature API module, a TanStack Query hook, and shared UI. Its edit dialog is explicitly a placeholder, not a completed feature.

## Accepted direction

- Keep feature behavior and feature API modules close to the feature; use shared components only when genuinely reused.
- Keep HTTP transport concerns at a small API-infrastructure boundary, using relative `/api/*` paths and the local proxy.
- Use the current Account response and its effective permission codes for UI capability visibility. The backend remains the authorization authority.
- Preserve the frontend/backend repository boundary from [ADR-0005](https://github.com/DudsFerraz/GAM-Bakckend-API/blob/main/docs/decisions/0005-keep-frontend-and-backend-in-separate-repositories.md).

## Planned, not yet implemented

- A session-aware authentication state with bootstrap, in-memory access tokens, bounded refresh/replay, and cross-tab coordination.
- A configured Vite development proxy for `/api`.
- Generated TypeScript transport types from a selected, versioned backend OpenAPI artifact.

## Incremental refactoring guidance

Refactor the auth/API boundary first, then improve code while delivering a real vertical feature. Consolidate duplicate API and account/permission patterns only after the target contract is in use. Do not introduce a generic repository layer, an application-wide domain-model framework, a frontend authorization engine, or speculative abstractions for features that do not exist.
