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

## Current implementation

- `AuthProvider` owns `initializing`, `authenticated`, and `unauthenticated` state. Startup obtains `/auth/csrf`, posts `/auth/refresh`, retains the access token in memory, and loads `/accounts/me` before protected UI renders.
- Login, refresh, and logout obtain fresh CSRF proof and echo it through the header named by the bootstrap response. Axios sends the browser-managed cookies with `withCredentials`.
- Protected requests receive the in-memory bearer token. A `401` joins one in-instance refresh, coordinates concurrent tabs through an ephemeral channel and browser lock, and replays each request at most once. A waiting tab adopts the refreshed token only in memory and reloads its current Account; authentication endpoints do not recursively refresh. A `403` remains forbidden, does not refresh, and triggers one best-effort reload of the current Account to resynchronize capability visibility.
- Capability visibility consumes the effective permission codes from `/accounts/me`. Role-permission queries are not the authorization source; they remain only where the Event form needs Permission records and keeps their identifiers internal.
- Logout calls the backend, clears all local session state even if confirmation fails, and broadcasts an ephemeral logout event through `BroadcastChannel`. After an unconfirmed server-side logout, the login screen explains that the device session was closed but the server confirmation was unavailable.

## Remaining gaps

The accepted browser-session refinements described on this page are implemented. Future authentication changes still depend on the backend-owned browser-session contract.
