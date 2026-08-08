# GAM Frontend Documentation

## Purpose

This repository contains the GAM browser frontend: a static single-page application (SPA) for account access and the implemented operational views for members, membership solicitations, accounts and roles, events and attendance, Oratório and Oratorianos, and locations. It owns frontend source, UI behavior, the local development workflow, the frontend build, and frontend-only notes.

Shared API, browser-session, deployment, operations, and domain contracts are owned by the [GAM backend repository](https://github.com/DudsFerraz/GAM-Bakckend-API). This repository links to those sources instead of copying their DTOs or requirements.

## Current

- React 19, TypeScript, and Vite (Rolldown Vite) provide the application and build.
- TanStack Router provides file-based routing; TanStack Query manages server-state caching.
- React Hook Form and Zod are used by the login and registration forms.
- Tailwind CSS, Radix UI primitives, Lucide icons, and local UI components provide the UI layer.
- Axios is the current HTTP client.
- Vitest, jsdom, and Testing Library provide focused unit, integration, and component tests.

The codebase is an early, pre-production implementation. It has same-origin browser-session bootstrap, login and registration screens, a protected route group, a responsive application shell, a read-only current-Account profile, and contract-backed vertical views for member registration/search/detail/presences, lifecycle transitions, and coordinator designation, membership solicitations and review, read-only Account and access-type consultation, Events and attendance, the Oratório operational core and ordinary Oratoriano profiles, and Locations. The Oratório area currently covers occurrence creation/detail, fixed programming, planning, teams, lifecycle, the responsive Member/Oratoriano tracker, persistent present summaries, quick Oratoriano registration, ordinary Oratoriano search/profile/frequency history, dedicated Oratório Coordinator designation, reasoned Oratoriano deletion, and permission-aware additional-form history, sensitive detail, draft creation, five-step editing, complete draft replacement, reasoned draft deletion, and authorized print-snapshot creation with immediate PDF download. The editable-form stepper now distinguishes completed, invalid, pending, and not-yet-started sections; forward navigation checks required fields while backward navigation remains free; and draft saving remains incremental. Detail is loaded only after explicit navigation, validated at runtime, protected from background refetch, and removed from cache when the page is abandoned. Editable drafts use one React Hook Form, explicit transport mappers, authoritative cache reconciliation, and one page-level guard for unsaved changes or in-memory print documents. Print documents are intentionally session-only: the current E6/E7 slice does not rediscover them after reload. Attachments, completion, and revocation remain outside the current UI; durable file continuity still depends on backend discovery and presentable actor references. The generated backend contract is available at [`src/api/generated/gam-api.ts`](../src/api/generated/gam-api.ts); focused automated tests cover the most important frontend boundaries and implemented workflows.

## Immediate scope

Validate and refine the implemented contract-backed workflows and expand focused test coverage as those behaviors evolve. Preserve and improve the current code incrementally; do not turn this into a frontend rewrite.

## Ownership boundary

| Frontend repository | Backend repository |
| --- | --- |
| UI, routes, state, forms, frontend build, development proxy, static artifact, and frontend-only documentation | API contract and DTO authority, browser authentication contract, production proxy/topology, deployment, operations, and domain language |

The shared boundary follows [ADR-0005](https://github.com/DudsFerraz/GAM-Bakckend-API/blob/main/docs/decisions/0005-keep-frontend-and-backend-in-separate-repositories.md). Use the backend's [ubiquitous language](https://github.com/DudsFerraz/GAM-Bakckend-API/blob/main/docs/ubiquitous-language.md) for shared domain terms such as Account, Member, and Coordinator.

Read [architecture/overview.md](architecture/overview.md), [integration/authentication.md](integration/authentication.md), [integration/api.md](integration/api.md), [guides/development.md](guides/development.md), the [user-facing language and presentation boundary](guides/user-facing-language.md), and the ordered [implementation backlog](backlog/steps.md) before significant frontend work.

For production delivery work, also read the frontend [deployment documentation](deploy/README.md). It adapts the backend-owned deployment contracts to the frontend build and static artifact without duplicating the canonical operations runbook.

## Documentation map

- [`architecture/`](architecture/) documents the frontend structure and technical direction.
- [`integration/`](integration/) documents the frontend's API and browser-authentication boundaries.
- [`guides/`](guides/) contains contributor workflows.
- [`deploy/`](deploy/) documents the frontend build artifact, production configuration boundary, and its place in the backend-owned release flow.
- [`backlog/`](backlog/) contains planned work and its recommended implementation order.
