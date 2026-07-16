# Browser Authentication

## Source of truth

The accepted shared contract is [Browser Session and Frontend Integration](https://github.com/DudsFerraz/GAM-Bakckend-API/blob/main/docs/requirements/authentication/browser-session-and-frontend-integration.md), together with [ADR-0007](https://github.com/DudsFerraz/GAM-Bakckend-API/blob/main/docs/decisions/0007-use-same-origin-browser-sessions-with-layered-csrf-protection.md). This page records its frontend impact; it does not replace that contract. The superseded cross-site refresh-cookie requirement must not guide new frontend work.

## Accepted direction

- Keep the access token only in JavaScript memory. Never store it in `localStorage`, `sessionStorage`, IndexedDB, or a readable cookie.
- The browser owns the host-only `HttpOnly` refresh cookie. Login, refresh, and logout use CSRF proof; the CSRF bootstrap is `GET /api/auth/csrf` and returns `{ token, headerName }` (currently `X-XSRF-TOKEN`).
- Start as `initializing`; do not render protected UI until bootstrap completes.
- Use the current Account response and effective permission codes for capability visibility. Do not treat JWT claims or role names as authorization authorities.
- Only a `401` may initiate refresh. A `403` never initiates refresh. The backend always makes the final authorization decision.

### Startup bootstrap

```text
initializing
  -> GET /api/auth/csrf
  -> POST /api/auth/refresh with CSRF proof and browser cookie
  -> retain returned access token in memory
  -> GET /api/accounts/me with bearer token
  -> authenticated (Account + effective permissions)
```

Any refresh failure, or an authentication failure while loading the current Account, becomes `unauthenticated`.

### Protected request and refresh

```text
request with in-memory bearer token
  -> success: return response
  -> 401: join/start one in-instance refresh; coordinate tabs ephemerally
      -> refresh succeeds: reload current Account, replay this request once
      -> refresh fails: clear context; do not replay
  -> 403: preserve forbidden result; do not refresh
```

Each protected request is replayed at most once. After an unexpected `403`, the UI may reload the current Account once to resynchronize capability visibility, without changing the forbidden result.

### Logout across tabs

Logout obtains CSRF proof as needed and calls the logout endpoint. After successful logout, broadcast an ephemeral logout event so every open tab clears its in-memory token, Account, and permissions and becomes unauthenticated. If the server request cannot be confirmed, clear the initiating tab's local context but report that server-side logout is unconfirmed.

## Current gaps to resolve deliberately

- `src/features/auth/hooks/useLogin.ts` writes the bearer token to `localStorage` or `sessionStorage`; `src/features/auth/token.ts` and `src/lib/http/client.ts` read it from persistent storage. This directly conflicts with the accepted contract.
- Protected routing checks a decoded stored JWT before rendering. There is no `initializing` state, CSRF bootstrap, or refresh call; the current Account is still loaded through the legacy `/api/accounts/{id}` operation because `/api/accounts/me` is not implemented by the published backend contract.
- The Axios interceptor clears persistent storage on `401`; it has no single-flight refresh, bounded replay, or cross-tab coordination. It displays a `403` error, which is appropriate as an outcome, but no resynchronization path exists.
- Current permissions are assembled through per-role lookups. The accepted contract requires the current Account response's effective permission codes after refresh; role names remain presentation data only.
- The current logout only clears frontend storage and navigates. It does not call server logout or notify other tabs.

These are documentation findings, not authorization to change the authentication implementation in this task.
