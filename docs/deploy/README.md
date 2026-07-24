# Frontend Deployment

## Purpose

This section documents the frontend-owned part of GAM deployment: how the React/Vite application becomes a static artifact, which configuration may affect that build, and which frontend checks must be satisfied before the artifact is selected for production.

The backend repository remains the source of truth for the shared production topology, proxy, compatible frontend/backend pair, production composition, deployment approval, operations, backup, recovery, and rollback workflow. These pages adapt those contracts to the frontend; they do not create a second deployment authority.

## Status

The production delivery model is **accepted**, but its frontend automation is **not yet implemented** in this repository.

Current repository behavior:

- `npm run build` type-checks the application and creates a Vite static build under `dist/`.
- Bundled assets receive content fingerprints from Vite.
- Browser API calls use the fixed same-origin `/api` base.
- `API_PROXY_TARGET` configures only the local Vite development proxy.
- No frontend publication workflow, immutable release archive, production deployment workflow, or release manifest is currently checked in.

Accepted production direction:

- publish the frontend as an immutable, versioned static artifact;
- select it explicitly with one compatible backend version;
- serve the SPA and API from one canonical HTTPS origin;
- serve frontend routes under `/` and forward `/api/*` to the private backend;
- publish referenced fingerprinted assets before switching `index.html`;
- retain the previous compatible pair and its frontend assets for rollback; and
- never make artifact publication deploy production automatically.

## Ownership boundary

| Frontend repository | Backend repository |
| --- | --- |
| Frontend source, dependency lockfile, tests, type-checking, Vite build, `dist/` contents, frontend artifact metadata, and frontend verification | Canonical production composition, proxy configuration, VPS provisioning, public origin, secrets, deployment lock, release-pair selection, maintenance mode, database migrations, health checks, backups, deployment record, and rollback execution |

The production host must not build the frontend from a mutable branch. It consumes an already verified immutable artifact produced by the frontend release process.

## Accepted topology

```text
Browser
   |
   | HTTPS: / and /api/*
   v
Public proxy
   |-- non-API route --> versioned static frontend artifact
   `-- /api/* --------> private backend service
```

Only the proxy receives public application traffic. The frontend is a static SPA and does not require a Node.js production process. Same-origin delivery avoids production CORS but does not replace backend authentication, authorization, CSRF protection, or frontend XSS defenses.

## Documentation map

- [Static frontend artifact](frontend-artifact.md) defines the frontend build output and the expected immutable release artifact.
- [Production configuration](production-configuration.md) separates local Vite configuration from production browser and proxy configuration.
- [Release and deployment flow](release-and-deployment-flow.md) maps frontend build, publication, selection, activation, verification, and rollback into the backend-owned deployment workflow.

## Authoritative backend sources

Accepted requirements and ADRs:

- [Web Delivery and Frontend Contract](https://github.com/DudsFerraz/GAM-backend-API/blob/main/docs/requirements/platform/web-delivery-and-frontend-contract.md)
- [Production Operations](https://github.com/DudsFerraz/GAM-backend-API/blob/main/docs/requirements/platform/production-operations.md)
- [ADR-0005: Keep frontend and backend in separate repositories](https://github.com/DudsFerraz/GAM-backend-API/blob/main/docs/decisions/0005-keep-frontend-and-backend-in-separate-repositories.md)
- [ADR-0006: Use a single-VPS same-origin proxy topology](https://github.com/DudsFerraz/GAM-backend-API/blob/main/docs/decisions/0006-use-a-single-vps-same-origin-proxy-topology.md)
- [Initial Production Topology](https://github.com/DudsFerraz/GAM-backend-API/blob/main/docs/diagrams/initial-production-topology.md)

Backend deployment proposals used for alignment:

- [Initial deployment plan](https://github.com/DudsFerraz/GAM-backend-API/blob/main/docs/ideas/deploy/deploy.md)
- [Backend deployment artifact and frontend distinction](https://github.com/DudsFerraz/GAM-backend-API/blob/main/docs/ideas/deploy/backend-deployment-artifact.md)
- [Repeatable provisioning](https://github.com/DudsFerraz/GAM-backend-API/blob/main/docs/ideas/deploy/repeatable-provisioning.md)
- [Caddy reverse-proxy proposal](https://github.com/DudsFerraz/GAM-backend-API/blob/main/docs/ideas/deploy/reverse-proxy-caddy-decision.md)

Documents under the backend's `docs/ideas/` directory are planning inputs, even when their prose uses decision language. If they conflict with an accepted Requirement Specification or ADR, the accepted requirement or ADR wins. In particular, the accepted contracts are currently product-neutral about the VPS provider and proxy; Hostinger and Caddy must not be presented here as accepted architecture until the backend promotes those choices into its authoritative documentation.

