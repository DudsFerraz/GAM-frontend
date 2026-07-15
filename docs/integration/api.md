# API Integration

## Accepted boundary

The API is served at the same public origin under `/api`. Frontend code must use relative `/api/*` URLs and must never embed a production backend hostname. In production, a public proxy serves the SPA under `/` and forwards `/api/*` to the private backend; SPA fallback applies only to non-API routes. The accepted details are in [Web Delivery and Frontend Contract](https://github.com/DudsFerraz/GAM-Bakckend-API/blob/main/docs/requirements/platform/web-delivery-and-frontend-contract.md) and [ADR-0006](https://github.com/DudsFerraz/GAM-Bakckend-API/blob/main/docs/decisions/0006-use-a-single-vps-same-origin-proxy-topology.md).

For development, the browser should call the same relative paths and Vite should proxy `/api` to the local backend. The browser must not call the backend port directly through CORS.

## Current implementation and gaps

`src/lib/axios.ts` uses `VITE_API_URL` as its base URL. No `.env` file or Vite `server.proxy` configuration exists in this repository. Current API modules use API-relative paths such as `/auth/login`, `/account/:id`, `/role/:id/permissions`, and `/member/search`, rather than public `/api/*` paths.

The checked local backend currently maps plural resource roots (`/accounts`, `/roles`, and `/members`), while the frontend adapter uses singular roots for those calls. Treat this as an integration mismatch to resolve against the selected contract; do not preserve either handwritten shape as a second source of truth.

## OpenAPI status

**Not yet implemented.** This repository has no OpenAPI document, generated client, generated TypeScript types, OpenAPI scripts, or contract-version selection. The checked backend repository has no exported OpenAPI artifact or build integration either; its `docs/ideas/openapi.md` is explicitly non-authoritative planning material.

The accepted future direction is backend-generated, versioned OpenAPI; the frontend selects a supported contract version and generates TypeScript transport types. The exact generation, publishing, breaking-change detection, and TypeScript tooling are still undecided. Do not add or claim an OpenAPI workflow until it is accepted and implemented.

When generated transport types are available, frontend-specific view/domain models may wrap or map them at feature boundaries. They must not redefine backend DTOs or become a competing API contract. The backend's [ADR-0005](https://github.com/DudsFerraz/GAM-Bakckend-API/blob/main/docs/decisions/0005-keep-frontend-and-backend-in-separate-repositories.md) and [web contract](https://github.com/DudsFerraz/GAM-Bakckend-API/blob/main/docs/requirements/platform/web-delivery-and-frontend-contract.md) remain authoritative.
