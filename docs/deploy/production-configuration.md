# Production Configuration

## Configuration principle

The production frontend uses same-origin relative URLs. It does not need the public domain or the private backend address embedded in its JavaScript bundle.

Current browser configuration is deliberately fixed:

```text
Frontend pages: /
Public API base: /api
```

`src/lib/http/client.ts` owns `/api` as the Axios base. Feature operations append API-relative resource paths. A production build must not replace that base with an absolute hostname.

## Configuration matrix

| Setting | Scope | Current value or owner | Browser-visible? |
| --- | --- | --- | --- |
| Public API base | Frontend code in every environment | Fixed relative `/api` | Yes, as a relative path |
| `API_PROXY_TARGET` | Local Vite development server only | Defaults to `http://localhost:8080`; may be overridden in ignored local `.env` | No |
| `GAM_PUBLIC_ORIGIN` | Production backend and deployment configuration | Required canonical HTTPS origin, owned by the backend deployment | No need to embed it in the frontend bundle |
| Private backend service address | Production proxy/composition | Backend-owned private network configuration | No |
| Database and application secrets | Backend/operations | Backend-owned secret process | No |
| `VITE_*` production origin variable | Frontend | Not supported or required | Not applicable |

`API_PROXY_TARGET` exists only because the local Vite process must know where to forward `/api`. It is server-side development configuration and must not be copied into a production artifact or renamed to `VITE_API_URL`.

Only variables prefixed with `VITE_` are exposed to browser code by Vite. Do not place secrets, private service addresses, credentials, or token material in such variables.

## Local development

The supported local flow is:

```text
Browser
  -> Vite loopback origin
  -> relative /api/*
  -> Vite proxy using API_PROXY_TARGET
  -> local backend
```

The Vite proxy currently removes the public `/api` prefix before forwarding because the local backend resources are mapped at their application root. This rewrite is local development behavior.

Production does not run the Vite development proxy. Public `/api/*` handling belongs to the canonical production proxy and must follow the backend-owned path-preservation contract.

## Production public origin

`GAM_PUBLIC_ORIGIN` is the single setting that defines GAM's public browser origin. The accepted backend requirement makes it a canonical HTTPS origin without a path, query, fragment, user information, or trailing slash.

The deployment uses that value to configure the public host, while the backend uses it for origin validation and public URL behavior. The frontend continues using `/api` and therefore does not need rebuilding when the domain changes, provided its static assets and integrations contain no independently embedded origin.

`GAM_PUBLIC_ORIGIN` is not the only production setting or secret. It is the only setting that defines the public browser origin; other backend, database, backup, and monitoring configuration remains necessary and backend-owned.

## Proxy contract affecting the frontend

The accepted contract is product-neutral. Whether the backend later adopts Caddy or another proxy, production delivery must:

- redirect HTTP to HTTPS;
- terminate public TLS;
- serve the active static artifact under `/`;
- prefer a real static file when one exists;
- apply SPA fallback only to non-API routes;
- forward `/api/*` to the private backend according to the backend path contract;
- keep backend and database ports private;
- set the accepted static-cache behavior;
- apply the accepted browser-delivery security headers;
- avoid logging credentials, authorization values, cookies, or security tokens; and
- keep the static artifact read-only to the proxy.

The proposed Caddy configuration and the canonical Compose file belong in the backend repository. This repository must not maintain a competing `Caddyfile`, production Compose file, VPS environment template, or operations runbook.

## SPA routing

TanStack Router uses browser routes that may be requested directly or refreshed. The proxy therefore needs a non-API fallback:

```text
Existing static file       -> serve that file
/api/*                     -> backend, including backend 404 responses
Other non-API browser path -> index.html
```

Invalid behavior includes:

- returning `index.html` for an unknown `/api/*` path;
- sending a frontend route to the backend;
- routing production browser requests directly to a backend port;
- configuring credentialed production CORS as the supported frontend path; or
- caching authenticated API responses as static assets.

## Browser-delivery policy

The proxy owns baseline delivery headers, but the policy must be checked against the actual frontend output and integrations. In particular:

- `index.html` must be revalidated;
- fingerprinted assets may be cached immutably;
- MIME-sniffing and clickjacking protections must be applied;
- Content Security Policy must be validated against the built application rather than copied from a generic permissive template;
- HSTS remains disabled until the official domain is controlled and HTTPS has been verified; and
- backend security headers must be preserved unless an authoritative proxy policy deliberately replaces them.

No current frontend feature requires a production API origin variable. External Google Maps links use ordinary browser navigation and do not require a Google Maps API key.

## Future configuration changes

Before adding any browser-visible production variable, determine whether the value can remain a relative URL or deployment-owned proxy concern. If a genuine public frontend setting is required:

1. document whether it is build-time or runtime;
2. confirm that it is safe for every user to read;
3. define its validation and missing-value behavior;
4. update `.env.example` only when it affects supported local development;
5. document whether changing it requires rebuilding the artifact; and
6. coordinate any shared origin or deployment change in the backend source of truth.

Do not add a frontend environment variable merely to duplicate `GAM_PUBLIC_ORIGIN`.

