# User-facing language and presentation boundary

## Purpose

The application interface is written for Brazilian Portuguese (`pt-BR`). Backend transport values, authorization codes, catalog metadata, library defaults, and technical identifiers are implementation details; they are not interface copy. This document defines the frontend boundary that converts those values into business-facing language before rendering them.

This is a frontend presentation rule. The backend remains authoritative for API values, authorization, and domain contracts, and the frontend must continue sending the original contract value in requests. System roles and permissions follow the backend-owned [RBAC catalog](https://github.com/DudsFerraz/GAM-Bakckend-API/blob/main/docs/requirements/rbac/rbac-catalog.md); this repository owns only their Portuguese interface presentation.

## Current implementation

- [`src/lib/presentation.ts`](../../src/lib/presentation.ts) provides the shared safe-label resolver. An unmapped value returns an explicit Portuguese fallback and never the raw value.
- Account role and permission presentation lives in [`src/features/account/presentation.ts`](../../src/features/account/presentation.ts). It covers the current system roles and the current permission catalog, although granular permissions are not shown on the ordinary profile.
- Member situation, solicitation situation, and Event situation/type/audience mappings live in each owning feature's `presentation.ts` module.
- [`src/lib/http/errors.ts`](../../src/lib/http/errors.ts) derives user feedback from the stable error code, HTTP status, network condition, and operation context. It never renders the backend `message` or a JavaScript `Error.message`.
- Date and country formatting lives in [`src/lib/format.ts`](../../src/lib/format.ts). Invalid values and unknown region codes receive safe Portuguese fallbacks rather than their raw transport representation.
- The current Account profile shows identity and business-facing access types only. It does not show the Account UUID, effective permission codes, catalog metadata, or system-management flags.
- Account administration shows translated access types in a details dialog and supports removing an existing type from a separate editing dialog when authorized. Raw role assignment and assignment lookup are not exposed because the current contract offers only identifier-based operations, not a business-facing role catalog or selector.
- Direct Member registration selects an Account by name instead of asking for an Account UUID.
- Location creation currently presents `Brasil` and keeps `BR` as an internal request value. Supporting additional countries requires a business-facing country selector; it must not reintroduce a free-form region-code field.
- Router developer tools render only in the development build. The root route owns Portuguese not-found and unexpected-error states so library defaults cannot leak into production UI.
- The base HTML declares `pt-BR` and uses product-facing GAM title, description, and icon metadata rather than starter-tool defaults.

## Value classification

Classify every value before placing it in JSX, an accessible label, a toast, a dialog, or form feedback.

| Value category | Examples | Presentation rule |
| --- | --- | --- |
| Frontend-authored copy | Page title, button label, empty state | Write directly in clear `pt-BR`, including screen-reader-only text. |
| User-authored business content | Person name, Event title, justification, observations | Preserve the submitted content. Do not treat user content as a contract enum or translate it automatically. |
| Closed contract value | `ACTIVE`, `PENDING`, `GENERIC`, `CANCELLED` | Resolve through a typed feature-owned presentation map. Keep the raw value only in state, filters, and API payloads. |
| System role or permission | `MEMBER`, `VISITOR`, `ACCOUNT_SEARCH` | Resolve by stable code through the Account presentation module. Permission codes may control visibility but must not be rendered. |
| Backend catalog label or description | `Search accounts`, `Standard authenticated member access` | Treat as boundary data, not trusted UI copy. Use the stable code to select frontend-owned Portuguese copy. |
| Error envelope | `code`, `status`, `message`, `details` | Map `code` or `status` to actionable Portuguese feedback. Log or observe technical details outside the user interface when observability exists; never display `message` or `details` directly. |
| Technical identifier or diagnostic | UUID, assignment identifier, stack trace, router devtools | Do not display or request it from a person. Use a business selector or keep the operation unavailable until the contract supports one. Diagnostics are development-only. |

## Safe mapping model

Feature-owned closed values use an exhaustive typed map when the generated contract exposes a union:

```ts
const situationLabels = {
  ACTIVE: 'Ativo',
  INACTIVE: 'Inativo',
} as const satisfies Record<MemberStatus, string>

export function getMemberSituationLabel(value?: string | null) {
  return resolvePresentationLabel(
    situationLabels,
    value,
    'Situação não identificada',
  )
}
```

The runtime input remains nullable or string-like because boundary data can be stale or newer than the checked-in generated contract. The fallback must be meaningful and must not contain the unknown value.

Do not use either of these patterns in user-facing code:

```ts
labels[value] ?? value
error.response?.data.message ?? error.message
```

Both patterns turn an unexpected backend value into interface copy and recreate the leak this boundary is intended to prevent.

## Placement and dependency rules

- Keep a mapping used by one feature in `src/features/<feature>/presentation.ts`.
- Export presentation functions through the feature public API when another feature has a proven need for the same business term.
- Keep only domain-neutral mechanics, such as safe lookup and locale formatters, in `src/lib/`.
- Do not create a second transport enum or change the generated contract. A presentation map translates the existing value; request and response types still come from `src/api/generated/gam-api.ts`.
- Do not add a broad localization library for the current single-locale requirement. If multiple locales are accepted later, preserve this boundary and replace the dictionaries behind it.

## Error feedback rules

1. Form validation messages are authored explicitly in Portuguese, including maximum lengths and invalid enum selections; do not rely on a library's default message.
2. Authentication may use operation-specific feedback such as invalid credentials. Other `401` responses describe an expired session.
3. Expected HTTP and API error codes map to actionable Portuguese messages. Unknown codes fall back by HTTP status and then to a generic safe message.
4. Backend `message`, validation field paths, exception names, response bodies, and JavaScript error text are not rendered.
5. Page-level error, forbidden, empty, loading, not-found, and retry states remain business-facing and must not name the required permission code.

## Audited view inventory

The July 2026 audit covered every current route and its dialogs or shared shell states.

| View | Current presentation behavior |
| --- | --- |
| Public home (`/`) | Frontend-authored Portuguese copy; no contract values. |
| Authenticated home (`/home`) | Portuguese dashboard copy; current Account name and translated access type; pending solicitation and Event summaries use safe loading, empty, error, and permission-aware states. |
| Login and registration (`/auth/*`) | Explicit Portuguese validation and safe API error mapping. |
| Authenticated shell and route fallbacks | Portuguese loading, forbidden, error, and not-found feedback; developer tools are development-only. |
| Current Account profile (`/profile`) | Business identity and translated access types only; no UUIDs or granular permissions. |
| Solicitation list/detail/submission (`/manage/solicitations`) | Situation values translated; mutation errors sanitized. |
| Member list/detail/dialogs (`/manage/members/*`) | Situation and embedded Event types translated; technical identifiers removed; Account chosen through search. |
| Event list/detail/creation (`/manage/events/*`) | Situation, type, and audience translated; permission codes and backend labels hidden; map links use coordinates or the localized address. |
| Location list/detail/creation (`/manage/locations/*`) | Country presented by localized name; Location identifiers and region-code input hidden; map links use coordinates or the localized address. |
| Account administration (`/manage/accounts`) | Account details and access types are shown in dialogs; authorized removal is available in the editing dialog; no RBAC inspector, permission catalog, UUID entry, or assignment-identifier lookup. |

Internal IDs still exist in route parameters, React keys, query keys, and API payloads. This is expected and is not user exposure.

## Adding or changing a view

Before completion, verify all of the following:

- Every visible and assistive-technology string is intentional `pt-BR` copy.
- Document language, title, description, and icon metadata are product-facing and contain no starter or developer-tool defaults.
- No JSX renders a transport enum, role name, permission code, backend label/description, error message, UUID, or diagnostic value directly.
- Every closed value has a typed presentation map and a non-raw unknown fallback.
- User-authored content is distinguished from backend-authored catalog metadata.
- Form schemas supply Portuguese messages for every reachable validation failure.
- Permission codes are used only for visibility and affordances, never as explanatory text.
- Entity relationships use names and selectors instead of identifier entry.
- Loading, empty, error, forbidden, not-found, retry, and success states use business language.
- New mappings and affected rows in the audited inventory are updated when behavior changes.

## Planned, not implemented

- A business-facing role catalog/search operation is required before Account role assignment can return to the UI without asking for a role identifier.
- A broader country selector is required before Location creation supports countries beyond the current Brazil default.
- Runtime multi-locale switching and a general internationalization library are not currently accepted requirements.
