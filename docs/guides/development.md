# Development Workflow

## Prerequisites

Use a supported Node.js/npm installation and the committed `package-lock.json`.

```sh
npm ci
```

## Commands

| Task | Command | Status |
| --- | --- | --- |
| Install dependencies | `npm ci` | Verified with `npm ci --dry-run`. |
| Run the development server | `npm run dev` | Verified; Vite starts successfully on a loopback host. |
| Lint TypeScript/TSX | `npm run lint` | Configured, but currently fails on four existing `react-refresh/only-export-components` errors in shared UI/theme files. |
| Build and type-check | `npm run build` | Configured, but currently fails during `tsc -b` because `src/utils/getMainRoleLabel.ts` imports missing `@/features/manage/members/types`. |
| Preview a built artifact | `npm run preview` | Configured; validate after a successful build exists. |
| Run tests | — | No test script or test files are currently configured. |
| Run type checking alone | — | No dedicated script; `npm run build` is the configured type-check path and currently fails as noted above. |

## Local API workflow

**Gap:** `vite.config.ts` currently has no `server.proxy` configuration, and no local API base configuration is committed. Therefore the supported same-origin `/api` workflow is not available yet.

The accepted target is:

```text
Browser -> Vite development origin -> /api/* proxy -> local backend
```

Configure this only as part of the API/auth boundary work. Keep browser requests relative to `/api`; do not solve local development by exposing a backend host/port to the browser or enabling CORS. The shared requirement is [REQ-WEB-007](https://github.com/DudsFerraz/GAM-Bakckend-API/blob/main/docs/requirements/platform/web-delivery-and-frontend-contract.md#req-web-007-same-origin-frontend-development).

## Production delivery context

The frontend will be a versioned static artifact. Fingerprinted assets may be cached immutably, while `index.html` must be revalidated; API routes must never receive SPA fallback. Proxy selection, VPS provider, domain, packaging, deployment, backups, and operations are backend-owned shared decisions and are out of scope for this repository. See [Initial Production Topology](https://github.com/DudsFerraz/GAM-Bakckend-API/blob/main/docs/diagrams/initial-production-topology.md).
