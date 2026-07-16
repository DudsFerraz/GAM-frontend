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
| Run tests | — | No test script or test files are currently configured. |
| Run type checking alone | — | No dedicated script; `npm run build` is the configured type-check path. |

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

This file is generated and must not be edited directly. The generation workflow and contract-version metadata are still pending documentation; until then, treat the checked-in artifact as the frontend route/type reference and report a missing or stale operation instead of recreating the backend contract by hand.

## Production delivery context

The frontend will be a versioned static artifact. Fingerprinted assets may be cached immutably, while `index.html` must be revalidated; API routes must never receive SPA fallback. Proxy selection, VPS provider, domain, packaging, deployment, backups, and operations are backend-owned shared decisions and are out of scope for this repository. See [Initial Production Topology](https://github.com/DudsFerraz/GAM-Bakckend-API/blob/main/docs/diagrams/initial-production-topology.md).
