# Frontend Release and Deployment Flow

## Scope and status

This page describes how a frontend artifact fits into the backend-owned deployment sequence. It is not an executable production runbook.

The build and local quality commands exist today. Immutable publication, release-pair selection, production installation, maintenance mode, deployment recording, and rollback automation remain pending and must be implemented in the canonical backend workflow before production.

## End-to-end flow

```text
Frontend repository                          Backend-owned deployment
-------------------                          ------------------------
Select source commit
        |
        v
npm ci
        |
        v
npm test + npm run lint + npm run build
        |
        v
Package dist/ as immutable artifact
        |
        v
Publish without deploying
        |                                      Select explicit frontend version
        |------------------------------------> Select backend version + image digest
                                               Confirm compatible release pair
                                               Verify artifacts and backup state
                                               Enter maintenance mode
                                               Apply backend migration/startup flow
                                               Install new frontend release
                                               Atomically activate frontend
                                               Verify public SPA + /api behavior
                                               Record manifest and result
                                               Leave maintenance mode
```

Artifact publication and production deployment are separate actions. Publishing a frontend release must never overwrite the active production files or silently change the selected release pair.

## 1. Build and verify the frontend

Build from the selected clean source revision with the committed lockfile:

```sh
npm ci
npm test
npm run lint
npm run build
```

The release job must fail if any command fails. It must package only the verified `dist/` output and record the artifact's immutable identity.

Before publication, confirm:

- the same-origin `/api` boundary is preserved;
- no production hostname or private backend address is embedded as frontend configuration;
- no secret or `.env` file is included;
- direct browser routes can be supported by SPA fallback;
- `index.html` references existing fingerprinted files; and
- the frontend declares the backend contract version it supports once versioned contract consumption is implemented.

## 2. Publish without activating

Publish the immutable artifact to the approved release storage and retain it for production selection and rollback.

Publication must not:

- update the production `current` link;
- restart backend or proxy services;
- select a backend version automatically;
- use or replace a mutable `latest` artifact; or
- delete the currently deployed or previous compatible artifact.

The artifact version and checksum or equivalent immutable identity become inputs to the deployment manifest.

## 3. Select a compatible release pair

The backend-owned deployment requires explicit Developer approval and selects:

- one frontend artifact version and immutable identity;
- one backend version and OCI image digest;
- the compatibility decision for that pair; and
- the previous compatible pair to use if rollback is safe.

While the application remains pre-production, coordinated breaking changes may be released together. After the first production release, a breaking API change requires an explicit coordinated deployment plan. Frontend and backend versions must not be assumed compatible merely because each pipeline passed independently.

OpenAPI release pinning is not yet implemented in this repository. Until the backend publishes a versioned contract and the frontend consumes it, the production compatibility gate remains incomplete.

## 4. Stage the frontend before activation

Within the canonical maintenance-window deployment:

1. Acquire the backend-owned exclusive deployment lock.
2. Record the currently active compatible pair.
3. Verify the selected frontend artifact's identity.
4. Download it before disrupting the active application where practical.
5. Extract it into a new versioned directory rather than overwriting `current`.
6. Verify `index.html` and all referenced fingerprinted assets.
7. Keep the staged release inactive until backend migrations, startup, and readiness checks permit pair activation.

The frontend artifact contains no migration and does not control database changes. Flyway, database backup checks, backend startup, and backend readiness remain backend-owned steps.

## 5. Activate and verify

Activate the selected frontend release atomically as part of the compatible-pair switch. Do not edit files in an existing versioned release directory.

Before reporting deployment success, verify from the public HTTPS origin:

| Area | Minimum verification |
| --- | --- |
| Entry document | `/` serves the selected SPA over HTTPS and is not cached as immutable. |
| Fingerprinted assets | Assets referenced by `index.html` return successfully and may use immutable caching. |
| SPA fallback | At least one real non-API application route returns the entry document on direct navigation. |
| API separation | A representative `/api/*` request reaches the backend, not SPA fallback. |
| Session boundary | CSRF bootstrap and representative authentication/session behavior work through the public origin. |
| Compatibility | A representative authenticated read succeeds with the selected backend. |
| Privacy | Browser traffic exposes no private backend or database address. |
| Failure handling | Unknown API paths remain API responses and are not converted into `index.html`. |

The canonical deployment additionally verifies proxy routing, backend health, database connectivity, migrations, and its public health signal. Only after the complete pair passes may maintenance mode be disabled and the deployment recorded as successful.

## 6. Deployment record

The backend-owned release manifest must be able to identify the active and previous compatible pairs. For the frontend side, record at least:

- frontend version;
- immutable artifact identity or checksum;
- source commit when available;
- supported backend contract version when available;
- activation and verification result; and
- previous frontend version retained for rollback.

Do not treat a directory timestamp, mutable branch, or `latest` label as a release identity.

## 7. Rollback

For an application-only failure or a database-compatible change, frontend rollback is an atomic switch to the previous versioned frontend release, coordinated with restoration of the previous compatible backend image.

```text
failed frontend/backend pair
        |
        v
confirm database compatibility
        |
        v
select previous backend digest
select previous frontend release
        |
        v
atomically restore compatible pair
        |
        v
repeat public verification
```

Frontend rollback must not:

- rebuild an old source branch on the VPS;
- overwrite the failed release in place;
- select a frontend version independently of backend compatibility; or
- assume that reverting application artifacts can undo an incompatible database migration.

If a migration made the previous backend incompatible, the backend's forward-correction or verified database-restoration plan governs recovery. The old frontend artifact must remain available, but it may be reactivated only with a compatible backend and database state.

The exact rollback-window duration is backend-owned. The deployment proposal recommends retaining at least 14 days or two verified production releases, whichever is longer, but that duration is not yet an accepted requirement. The accepted requirement is that the previous compatible pair and referenced fingerprinted assets remain available throughout the defined rollback window.

## Frontend production-readiness gates

The frontend part of deployment is not production-ready until:

- a frontend versioning policy exists;
- CI runs the required quality gate from a clean checkout;
- an immutable static artifact is published with verifiable identity;
- the supported backend contract version is recorded;
- publication is separated from production activation;
- the backend-owned workflow selects and records a compatible pair;
- the proxy behavior is tested against the built artifact;
- direct SPA routes and `/api/*` separation are verified;
- cache behavior for `index.html` and fingerprinted assets is verified;
- no development configuration or secrets are shipped;
- activation is atomic;
- the previous frontend release remains available;
- compatible-pair rollback has been rehearsed; and
- the complete backend production-readiness gates also pass.

