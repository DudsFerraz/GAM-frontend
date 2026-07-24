# Static Frontend Artifact

## Current build

The frontend is a React single-page application built with TypeScript and Vite.

From a clean checkout:

```sh
npm ci
npm test
npm run lint
npm run build
```

`npm run build` runs `tsc -b` and then `vite build`. The generated deployable files are written to `dist/`. Vite produces an `index.html` entry document and content-fingerprinted files under `dist/assets/`.

The current repository does not package `dist/` into a versioned archive or publish it. Therefore, a successful local build is not yet a published frontend release.

## Accepted production artifact

The frontend release pipeline shall turn the verified contents of `dist/` into one immutable, versioned static artifact. A versioned archive is the expected initial shape, but its exact file name, registry, and manifest schema remain part of the backend-owned deployment workflow.

Conceptually:

```text
Frontend source + package-lock.json
        |
        v
npm ci
        |
        v
test + lint + type-check + Vite build
        |
        v
dist/
  index.html
  assets/<name>-<fingerprint>.js
  assets/<name>-<fingerprint>.css
        |
        v
immutable versioned static artifact + checksum
        |
        v
explicitly selected compatible release pair
```

The archive should contain the contents of `dist/` at its serving root, so extracting it into a versioned release directory exposes `index.html` and `assets/` directly. It must not contain:

- `node_modules/`;
- frontend source files solely for production execution;
- a development server;
- `.env` files;
- private service origins;
- production secrets; or
- mutable host state.

Node.js is a build dependency. It is not required on the production VPS solely to serve the generated frontend.

## Identity and traceability

Each published frontend artifact must be identifiable without relying on a mutable label such as `latest`. The release process must make enough metadata available for the backend-owned deployment record to identify:

- the explicit frontend version;
- the source commit used to build it;
- the artifact checksum or equivalent immutable identity;
- the build verification result; and
- the backend contract version supported by that frontend release once versioned OpenAPI consumption is available.

The exact release-manifest schema is not defined in this repository. The canonical backend deployment workflow owns it and records the selected frontend artifact together with the backend version and immutable image digest.

The current `package.json` version is `0.0.0`; it is not yet an implemented production release-version strategy.

## Static-file serving and caching

The proxy must apply different behavior to the entry document and fingerprinted assets:

| Resource | Required behavior |
| --- | --- |
| `index.html` | Revalidate; never assign long-lived immutable caching. |
| Fingerprinted files under `assets/` | May receive long-lived immutable caching. |
| Non-API browser routes | Serve the SPA entry document when no static file matches. |
| `/api/*` | Forward to the backend; never apply static-file caching or SPA fallback. |

Activation order matters:

1. Extract a new artifact into a new versioned release directory.
2. Verify that every asset referenced by `index.html` exists.
3. Make the entire release available to the proxy.
4. Atomically switch the active release.
5. Keep the previous release and fingerprinted assets available for the backend-defined rollback window.

This prevents a newly served `index.html` from referencing assets that have not been published yet and allows browsers holding an older entry document to continue loading its fingerprinted files.

## Host layout

The backend deployment proposal illustrates versioned directories and an atomic `current` link:

```text
/srv/gam/frontend/releases/<frontend-version>/
/srv/gam/frontend/current -> releases/<frontend-version>/
```

This is a proposed operational layout, not frontend build configuration. The canonical backend composition may adopt or revise it. Whatever layout is selected must preserve immutable versioned releases, atomic activation, read-only static serving, and rollback availability.

## Artifact verification

Before an artifact is eligible for production selection, verify:

- dependencies were installed from the committed lockfile;
- `npm test`, `npm run lint`, and `npm run build` succeeded;
- the artifact was created from the resulting `dist/`, not from a developer working directory;
- its immutable identity or checksum matches the publication record;
- `index.html` references files present in the artifact;
- browser requests still use the relative `/api` base;
- no `.env`, credential, private backend address, or machine-specific development configuration is present; and
- the artifact can be extracted and served as static files without Node.js.

Automating publication and these artifact checks remains pending.

