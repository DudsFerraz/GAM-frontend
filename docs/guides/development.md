# Development Workflow

## Prerequisites

Use a supported Node.js/npm installation and the committed `package-lock.json`.

```sh
npm ci
cp .env.example .env
```

The default development proxy target is `http://localhost:8080`. Change `API_PROXY_TARGET` in the ignored `.env` only when the local backend uses another origin. This value is read by the Vite server and is not exposed to browser code.

## Commands

| Task | Command | Status |
| --- | --- | --- |
| Install dependencies | `npm ci` | Verified with `npm ci --dry-run`. |
| Run the development server | `npm run dev` | Verified; Vite starts successfully on a loopback host. |
| Lint TypeScript/TSX | `npm run lint` | Verified. |
| Build and type-check | `npm run build` | Verified; runs `tsc -b` before producing the Vite artifact. |
| Preview a built artifact | `npm run preview` | Configured; validate after a successful build exists. |
| Run tests once | `npm test` | Verified; runs the Vitest suite in non-watch mode. |
| Run tests while editing | `npm run test:watch` | Configured; reruns affected Vitest tests as files change. |
| Run type checking alone | — | No dedicated script; `npm run build` is the configured type-check path. |

## Automated test workflow

The current test stack is Vitest, jsdom, and Testing Library. Test files are colocated with the source they protect and use the `*.test.ts` or `*.test.tsx` suffix. Shared DOM matchers and automatic render cleanup are configured in `src/test/setup.ts`; `vitest.config.ts` owns the test environment and the same `@/` source alias used by application code.

Run the complete local quality gate before handoff:

```sh
npm test
npm run lint
npm run build
```

The initial suite focuses on observable frontend contracts: in-memory authentication and CSRF flow, bounded `401` replay and `403` handling, safe Portuguese presentation, API request/mapping behavior, form validation, and accessible shared UI states. Transport tests mock the shared client at the frontend boundary and do not require a running backend.

Browser end-to-end tests, live-backend integration tests, automated coverage reporting, and a required coverage percentage are not current repository capabilities. Introduce them only with an accepted workflow and stable scenarios; do not describe them as part of the current quality gate before they are configured.

## Source naming

- Use PascalCase for files and directories that expose React components, such as `AppLayout.tsx`, `LoginForm.tsx`, and `SearchAndFilter/`.
- Use camelCase for functions, hooks, API operations, query-key modules, configuration modules, and other non-component source, such as `getAccount.ts`, `useAccountInfo.ts`, `searchMembers.ts`, and `queryKeys.ts`.
- Keep conventional module files such as `index.ts` and `types.ts` lowercase.
- Preserve TanStack Router file names and path conventions in `src/routes/`; route URL semantics take precedence over the component-file convention.
- Use local barrels only for a module's deliberate public API. Feature internals should prefer direct imports, and `export *` barrels spanning unrelated components are not used.

## Local API workflow

The supported local flow is:

```text
Browser -> Vite development origin -> /api/* proxy -> local backend
```

The shared Axios client uses `/api`, and Vite forwards those requests to `API_PROXY_TARGET` after removing the public `/api` prefix. Keep browser requests relative to `/api`; do not expose the backend host/port through a `VITE_*` variable or rely on CORS. The shared requirement is [REQ-WEB-007](https://github.com/DudsFerraz/GAM-Bakckend-API/blob/main/docs/requirements/platform/web-delivery-and-frontend-contract.md#req-web-007-same-origin-frontend-development).

## Backend route and type reference

Before adding or changing a feature API operation, consult [`src/api/generated/gam-api.ts`](../../src/api/generated/gam-api.ts). Its `paths` and `operations` entries identify the available backend routes and HTTP methods; its generated schema and operation types identify request and response shapes. Keep resource calls in the feature's `api/` module and map transport data to UI-specific models there or in the feature mapping module.

This file is generated and must not be edited directly. The local regeneration command is documented below, while the release workflow and contract-version metadata are still pending; treat the checked-in artifact as the frontend route/type reference and report a missing or stale operation instead of recreating the backend contract by hand.

To regenerate the local contract types from the running backend, start the backend on its configured local port (normally `8080`) and run:

```sh
npx openapi-typescript http://localhost:8080/api/openapi.json \
  -o src/api/generated/gam-api.ts
```

Use the backend OpenAPI document URL, not `http://localhost:5173/api`: `/api` on the Vite origin is the browser proxy base, and the proxy removes that prefix before forwarding resource requests. The YAML document is also available at `http://localhost:8080/api/openapi.json.yaml`. Do not edit the generated file manually. The release artifact version, pinning, and contract-drift checks remain pending.

## User-facing presentation workflow

Before rendering response data, classify it using the [user-facing language and presentation boundary](user-facing-language.md). Contract enums, roles, permissions, backend catalog text, error envelopes, and identifiers are not UI copy. Add or update the owning feature's typed presentation map, retain the raw value for requests and capability checks, and use a neutral Portuguese fallback for unexpected runtime values. Form schemas must provide explicit Portuguese validation messages rather than relying on library defaults.

## Typography and visual identity

**Current implementation:** the application uses one sans-serif family across public pages, authentication, and the authenticated shell: `ui-sans-serif, system-ui, sans-serif`. The tokens `font-sans` and `font-heading` in [`src/index.css`](../../src/index.css) are separate semantic names that resolve to the same family, so headings and body copy do not diverge between surfaces. Authentication must not reintroduce `font-serif` or another local font override.

The official GAM logos are the bundled [`src/assets/logos/gam_logo.png`](../../src/assets/logos/gam_logo.png) and [`src/assets/logos/gam_logo_claro.png`](../../src/assets/logos/gam_logo_claro.png). The authenticated sidebar selects the dark or light variant according to the active theme and renders it with rounded corners and `object-contain`; new navigation branding should reuse these assets instead of recreating the logo with text or cropping it with `object-cover`.

## Production delivery context

The frontend will be a versioned static artifact. Fingerprinted assets may be cached immutably, while `index.html` must be revalidated; API routes must never receive SPA fallback. Proxy selection, VPS provider, domain, packaging, deployment, backups, and operations are backend-owned shared decisions and are out of scope for this repository. See [Initial Production Topology](https://github.com/DudsFerraz/GAM-Bakckend-API/blob/main/docs/diagrams/initial-production-topology.md).
