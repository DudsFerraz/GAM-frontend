# GAM Frontend Documentation

## Purpose

This repository contains the GAM browser frontend: a static single-page application (SPA) for account access and the implemented operational views for members, membership solicitations, accounts and roles, events and attendance, and locations. It owns frontend source, UI behavior, the local development workflow, the frontend build, and frontend-only notes.

Shared API, browser-session, deployment, operations, and domain contracts are owned by the [GAM backend repository](https://github.com/DudsFerraz/GAM-Bakckend-API). This repository links to those sources instead of copying their DTOs or requirements.

## Current

- React 19, TypeScript, and Vite (Rolldown Vite) provide the application and build.
- TanStack Router provides file-based routing; TanStack Query manages server-state caching.
- React Hook Form and Zod are used by the login and registration forms.
- Tailwind CSS, Radix UI primitives, Lucide icons, and local UI components provide the UI layer.
- Axios is the current HTTP client.

The codebase is an early, pre-production implementation. It has same-origin browser-session bootstrap, login and registration screens, a protected route group, a responsive application shell, and contract-backed vertical views for member registration/search/detail/presences, membership solicitations and review, Account-role administration with contextual RBAC inspection, Events and attendance, and Locations. The generated backend contract is available at [`src/api/generated/gam-api.ts`](../src/api/generated/gam-api.ts); repository test scripts are not configured.

## Immediate scope

Validate and refine the implemented contract-backed workflows, complete the remaining cross-tab and logout-feedback authentication refinements, and add focused test tooling. Preserve and improve the current code incrementally; do not turn this into a frontend rewrite.

## Ownership boundary

| Frontend repository | Backend repository |
| --- | --- |
| UI, routes, state, forms, frontend build, development proxy, static artifact, and frontend-only documentation | API contract and DTO authority, browser authentication contract, production proxy/topology, deployment, operations, and domain language |

The shared boundary follows [ADR-0005](https://github.com/DudsFerraz/GAM-Bakckend-API/blob/main/docs/decisions/0005-keep-frontend-and-backend-in-separate-repositories.md). Use the backend's [ubiquitous language](https://github.com/DudsFerraz/GAM-Bakckend-API/blob/main/docs/ubiquitous-language.md) for shared domain terms such as Account, Member, and Coordinator.

Read [architecture/overview.md](architecture/overview.md), [integration/authentication.md](integration/authentication.md), [integration/api.md](integration/api.md), [guides/development.md](guides/development.md), and the ordered [implementation backlog](backlog/steps.md) before significant frontend work.

## Documentation map

- [`architecture/`](architecture/) documents the frontend structure and technical direction.
- [`integration/`](integration/) documents the frontend's API and browser-authentication boundaries.
- [`guides/`](guides/) contains contributor workflows.
- [`backlog/`](backlog/) contains planned work and its recommended implementation order.
