# Frontend Architecture

## Current implementation

### Application and routing

`src/main.tsx` is limited to mounting React with the router and application providers. Router creation lives in `src/app/router/`, provider composition in `src/app/providers/`, and the authenticated layout/navigation in `src/app/shell/`.

TanStack Router generates `src/routeTree.gen.ts` from the file routes in `src/routes/`; do not edit that generated file. The root route installs the global Axios response-interceptor component and router devtools. Public routes currently live under `/auth`. Routes in `src/routes/_authenticated/` use a `beforeLoad` guard and render inside `AppLayout`; the `_authenticated` path segment is not part of the URL.

`AuthProvider` starts in `initializing`, obtains CSRF proof, attempts refresh through the browser-managed cookie, and loads `/accounts/me` before protected UI may render. Access tokens stay in memory. The protected layout redirects only after bootstrap reaches `unauthenticated`; capability visibility consumes the effective permission codes returned by the current-Account context. See [browser authentication](../integration/authentication.md) for the remaining coordination and feedback gaps.

### Server state and API calls

`src/lib/query/client.ts` provides one TanStack Query client. Current-Account and permission queries live in `src/features/account/`; operational queries are colocated under `src/features/manage/` for members, solicitations, Accounts, Events, and Locations. Axios configuration is centralized in `src/lib/http/client.ts`, uses the public relative `/api` base, and is called by individual feature API modules. During local development, Vite proxies that base to the configured local backend and removes the public `/api` prefix before forwarding.

Backend routes, operations, and transport types are referenced from the generated [`src/api/generated/gam-api.ts`](../../src/api/generated/gam-api.ts). Feature API modules still own the calls made with the shared Axios client, while feature-specific view models and mappings remain outside the generated file. Do not edit the generated file manually. See [API integration](../integration/api.md) for the contract boundary and current limitations.

The current-Account session uses the generated `CurrentAccountContextRDTO` returned by `/accounts/me`. Account administration still normalizes the generated `AccountRDTO.roles` wrapper at its boundary so response-shape compatibility does not leak into components. Navigation and capability checks use `/accounts/me` effective permission codes; per-Role permission reads remain only where the Event creation UI needs Permission records and keeps their identifiers internal.

### Forms, UI, and features

Login and registration use React Hook Form with Zod resolvers and feature-local schemas. `src/components/ui/` contains reusable Radix-based primitives, while `src/components/` contains genuinely cross-feature components. `src/components/AsyncState.tsx` provides the shared loading, error/retry, empty, and forbidden feedback vocabulary for data-driven views. `src/components/PublicNavbar.tsx` is the shared navigation for unauthenticated pages, including links between the public home, login, and registration and the theme toggle. The authenticated sidebar links the current Account identity to a read-only profile backed by the already loaded `/accounts/me` context. Application composition belongs to `src/app/`. Feature-specific code is organized under `src/features/account`, `src/features/auth`, and `src/features/manage/members`, with components, hooks, API calls, query keys, schemas, types, and mappings colocated where practical.

The authenticated home (`/home`) is a dashboard composition under `src/features/home/`. It greets the current Account, summarizes the effective access type, shows pending membership solicitations and upcoming Events when the current Account can search them, and offers permission-aware shortcuts into the existing vertical features. Its visual support uses bundled GAM imagery; it does not introduce a new backend resource or dashboard-specific contract.

The management area currently provides these vertical views:

- Member search and lifecycle actions, direct registration, a dedicated Member detail route, and paginated presence history. Member search starts with active members and can include inactive members through the persisted filter preference.
- Authenticated membership-solicitation history, self-service submission for accounts without `MEMBER_MANAGE`, detail, and `MEMBER_MANAGE` approval/rejection actions. Accounts with `MEMBER_MANAGE` do not see the self-service submission action because their workflow is to review requests or register Members directly.
- Account search and business-facing access-type administration, including translated active types and authorized removal without exposing the Role or Permission catalogs. Account details and access editing open in separate dialogs, while the account cards use a responsive two-column layout on larger screens.
- Event search, authorized creation, an Event details dialog with the complete schedule and location data, a dedicated Event route, and authorized Event-presence history.
- Location list, creation, the dedicated detail view reached after creation, and external Google Maps links based on the location address or coordinates. The list does not expose a separate details action because the card already contains every Location field available in the contract.

Event and Location cards also expose external Google Maps links. These links use the Maps search URL and do not require a Google Maps API key; coordinates are preferred and the business address is used as a fallback.

Forms use feature-local React Hook Form and Zod schemas. Paginated pages share the domain-neutral pagination component and deliberately render loading, empty, error, forbidden, and retry states. Contract enums, roles, permissions, catalog text, and errors cross a Portuguese presentation boundary before rendering; granular authorization data and technical identifiers are not profile or management content. See [user-facing language and presentation](../guides/user-facing-language.md).

Automated tests use Vitest with jsdom and Testing Library. Tests are colocated with the source boundary they protect through `*.test.ts` and `*.test.tsx` files; shared DOM matcher and cleanup setup lives in `src/test/setup.ts`. The current focused suite covers authentication and refresh behavior, the shared HTTP and presentation boundaries, feature transport mappings and filters, form schemas, and reusable asynchronous-state and pagination components. Browser end-to-end tests, live-backend integration tests, and a repository coverage threshold are not currently configured.

The authenticated shell is responsive: the desktop side navigation is replaced by a compact top navigation on small screens, and page content uses responsive spacing and overflow behavior. The public home page has its own layout and is not governed by these shell adjustments; the authenticated home composes the same responsive shell with its own dashboard sections.

## Source directory architecture

The source tree is organized primarily by product feature. Technical directories at the source root are reserved for application composition or code that is genuinely shared across feature boundaries.

```text
src/
├── app/
│   ├── providers/       # Application-wide provider composition
│   ├── router/          # TanStack Router creation and type registration
│   └── shell/           # Authenticated layout and navigation composition
├── assets/              # Static images, logos, and other bundled assets
├── components/
│   ├── ui/              # Reusable, domain-neutral UI primitives
│   └── ...              # Cross-feature components with stable reuse
├── features/
│   ├── account/         # Account data, permissions, hooks, and mappings
│   ├── auth/            # Login, registration, token handling, and auth feedback
│   ├── home/            # Public and authenticated home compositions
│   └── manage/
│       ├── accounts/    # Business-facing Account access administration
│       ├── events/      # Event creation/search/detail and Event presences
│       ├── locations/   # Location creation/list/detail
│       ├── members/     # Member management, detail, and Member presences
│       └── solicitations/ # Membership solicitation and review workflow
├── lib/
│   ├── http/            # Shared Axios client and HTTP error boundary
│   ├── query/           # Shared TanStack Query client configuration
│   └── theme/           # Theme context, provider, and hook
├── routes/              # TanStack Router file routes and route layouts
├── test/                # Shared automated-test setup
├── types/               # Truly global types, currently only UUID
├── index.css            # Global styles and design tokens
├── main.tsx             # Browser entry point
└── routeTree.gen.ts     # Generated route tree; never edit manually
```

### `src/app`

`app` is the application-composition layer. It connects global providers, the router, the authenticated shell, navigation, and product features. Code in this directory may know about feature public APIs because its responsibility is to assemble the application. It must not become a second location for feature business rules, API calls, or reusable UI primitives.

- Add a provider to `app/providers/` when it must wrap the application or a major application subtree.
- Add router construction or router-wide type registration to `app/router/`.
- Add authenticated layout and navigation composition to `app/shell/`.
- Do not add a generic `app/config/` directory until concrete application-wide configuration exists.

### `src/features`

Each feature owns the code that changes with its product capability. A feature may contain API operations, components, hooks, pages, query keys, schemas, types, mappings, and narrowly named configuration files. It should start with only the files required by current behavior; directories such as `api/`, `hooks/`, or `schemas/` are added only when the feature actually needs them.

`features/manage/members/` is nested because `manage` represents the existing management area and `members` is the concrete vertical capability. A new feature should normally begin at `features/<feature>/`. Use an additional namespace such as `features/manage/<feature>/` only when it represents a real, stable product grouping rather than a technical category.

Feature root `index.ts` files define narrow public APIs for routes, application composition, or another feature. Internal files should prefer direct relative imports and must not import their own feature through its barrel. Cross-feature imports should be rare and use the target feature's public API. The current member feature consumes Account types and role presentation through `features/account/index.ts` because the current Member response embeds Account data; this dependency should be revisited when generated transport types become available.

### `src/routes`

Routes are navigation adapters, not page-implementation directories. A route may define its path, loader, `beforeLoad` guard, search validation, route-level pending/error boundaries, and page composition. Reusable HTTP calls, query hooks, schemas, domain types, and substantial visual implementation belong to the owning feature.

The intended flow is:

```text
routes/_authenticated/manage/members.tsx
  -> features/manage/members/pages/ManageMembersPage.tsx
  -> feature components and hooks
  -> feature API operations
  -> lib/http/client.ts
```

Route file names follow TanStack Router conventions and existing URL semantics, even when they differ from the component-file naming convention. Moving a page implementation into a feature must not change its URL or require a manual edit to `routeTree.gen.ts`.

### `src/components`

`components/ui/` contains domain-neutral primitives such as `Button`, `Input`, `Dialog`, and `Card`. A primitive may depend on styling helpers or third-party UI packages, but it must not import a product feature.

The `components/` root is for components with proven reuse across multiple features, such as `ColorModeToggle`. A component used by only one feature remains inside that feature, even if its props appear generic. For example, `SearchAndFilter` remains under member management because its current model is coupled to that feature's backend search shape and it has no second consumer.

### `src/lib`

`lib` owns application-wide integration with external libraries and low-level infrastructure. The shared Axios instance, QueryClient, theme infrastructure, and Tailwind class-merging utility live here. Resource-specific endpoints do not belong in `lib/http`; they belong in the relevant feature's `api/` directory and consume the shared client.

Do not introduce generic repositories, service layers, or domain frameworks in `lib`. A module belongs here only when it is independent of a product feature and provides infrastructure used across the application.

### `src/types` and `src/assets`

`types` contains only types that are genuinely global and are not owned by a feature or infrastructure boundary. Backend transport types belong to the generated [`src/api/generated/gam-api.ts`](../../src/api/generated/gam-api.ts); feature-local types should describe view models or other UI concerns, not duplicate backend DTOs. `assets` contains files bundled by Vite and does not contain component or feature logic.

## Adding a new feature

Create the smallest vertical feature that supports the accepted behavior. Do not create every possible subdirectory in advance. A feature with a page, one query, and one API operation might grow into the following structure:

```text
src/features/<feature>/
├── api/
│   └── getFeatureItems.ts
├── components/
│   └── FeatureItem.tsx
├── hooks/
│   └── useFeatureItems.ts
├── pages/
│   └── FeaturePage.tsx
├── queryKeys.ts
├── types.ts
└── index.ts

src/routes/_authenticated/<feature>.tsx
```

Only create `components/`, `hooks/`, `pages/`, `schemas/`, or other directories when at least one real file belongs there. Keep a small feature flat until additional structure improves navigation.

Use the following placement rules when adding code:

| New code | Recommended location | Reason |
| --- | --- | --- |
| Route definition, guard, loader, or search validation | `src/routes/` | These concerns are coupled to navigation and TanStack Router. |
| Page or substantial view for one feature | `src/features/<feature>/pages/` | The view changes with the feature rather than with routing infrastructure. |
| Feature-specific visual component | `src/features/<feature>/components/` | It keeps feature behavior and presentation together. |
| Resource-specific HTTP operation | `src/features/<feature>/api/` | Endpoints remain close to their resource and do not accumulate in a global service. |
| Feature query or mutation hook | `src/features/<feature>/hooks/` | TanStack Query behavior, invalidation, and query keys remain feature-owned. |
| Feature form validation | `src/features/<feature>/schemas/` | Zod schemas remain next to the forms and domain input they validate. |
| Feature-specific transport or view type | `src/features/<feature>/types.ts` | It avoids turning `src/types` into a collection of unrelated DTOs. |
| Domain-neutral UI primitive | `src/components/ui/` | Primitives can be reused without depending on product features. |
| Proven cross-feature component | `src/components/` | Stable reuse justifies a shared dependency. |
| Application provider, router setup, shell, or navigation composition | `src/app/` | These modules assemble application-wide behavior. |
| External-library integration or shared infrastructure | `src/lib/` | Configuration and low-level adapters remain centralized. |
| Truly global type | `src/types/` | Only types with no clear feature owner should be global. |

The route should import the feature's public page and remain small:

```tsx
import { createFileRoute } from '@tanstack/react-router'

import { FeaturePage } from '@/features/<feature>'

export const Route = createFileRoute('/_authenticated/<feature>')({
  component: FeaturePage,
})
```

Feature API modules use the shared HTTP client with resource-relative paths:

```ts
import { api } from '@/lib/http'

export async function getFeatureItems() {
  const { data } = await api.get('/feature-items')
  return data
}
```

Do not embed `/api` again in feature operations, because `lib/http/client.ts` already owns that public base. Do not use a production backend hostname or a browser-visible backend-port configuration.

Component files and component directories use PascalCase. Functions, hooks, API operations, query-key modules, and non-component configuration use camelCase. Conventional module files such as `index.ts` and `types.ts` remain lowercase. See [Development Workflow](../guides/development.md#source-naming) for the contributor-facing naming rules.

## Why this structure was chosen

- **Change locality:** API calls, query behavior, validation, types, components, and page composition for one capability are kept together, so a product change usually stays within one feature directory.
- **Thin routing boundary:** TanStack Router retains control of file names, layouts, guards, and URL generation without turning `routes` into a parallel page or business-logic hierarchy.
- **Explicit application composition:** `app` provides a clear place for providers, router setup, shell, and navigation that legitimately coordinate multiple features.
- **Small shared surface:** `components`, `lib`, and `types` contain only code with a demonstrated cross-feature or infrastructure role. This reduces hidden coupling and prevents premature abstractions.
- **Stable dependency direction:** routes and application composition consume feature public APIs; features consume shared UI and infrastructure. Shared modules do not import product features.
- **Incremental growth:** a small feature can remain flat, while a larger vertical feature can add `api`, `hooks`, `schemas`, `components`, and `pages` as real needs appear.
- **Replaceable boundaries:** Axios and TanStack Query configuration are isolated from resource-specific logic, making contract, authentication, or library changes more targeted.
- **Predictable naming:** PascalCase component files and camelCase behavior modules make file responsibility visible without opening the file.

This architecture is intentionally not a traditional Clean Architecture implementation. The current frontend is small and pre-production, and its accepted authentication and OpenAPI boundaries are still planned. A deeper domain/application/infrastructure layer hierarchy would add indirection before the application has enough stable behavior to justify it.

## Accepted direction

- Keep feature behavior and feature API modules close to the feature; use shared components only when genuinely reused.
- Keep HTTP transport concerns at a small API-infrastructure boundary, using relative `/api/*` paths and the local proxy.
- Use the current Account response and its effective permission codes for UI capability visibility. The backend remains the authorization authority.
- Preserve the frontend/backend repository boundary from [ADR-0005](https://github.com/DudsFerraz/GAM-Bakckend-API/blob/main/docs/decisions/0005-keep-frontend-and-backend-in-separate-repositories.md).

## Planned, not yet implemented

- Cross-tab refresh coordination beyond logout broadcast, and visible reporting when server-side logout cannot be confirmed.
- Formalized generation/version-selection workflow for the generated TypeScript transport types. The current generated artifact is already available at `src/api/generated/gam-api.ts`, but its repository workflow remains to be documented and accepted.
- Business-facing Role catalog/search support for assigning a new Account access type without asking for an internal identifier.

## Incremental refactoring guidance

Refactor the auth/API boundary first, then improve code while delivering a real vertical feature. Consolidate duplicate API and account/permission patterns only after the target contract is in use. Do not introduce a generic repository layer, an application-wide domain-model framework, a frontend authorization engine, or speculative abstractions for features that do not exist.
