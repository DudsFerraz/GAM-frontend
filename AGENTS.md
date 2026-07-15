# GAM Frontend Agent Guide

Before significant work, read `docs/README.md` and the linked frontend docs.

- This repository owns frontend code, build behavior, and frontend-only notes. Use the backend repository only for shared API, authentication, deployment, operations, and domain contracts; link to them instead of duplicating them.
- Use relative `/api/*` URLs. Do not embed a production backend hostname or persist access tokens in browser storage/readable cookies.
- Label current behavior separately from accepted or planned behavior. Do not present pending OpenAPI tooling as implemented.
- Keep work within the requested frontend scope. Do not expand it into unrelated backend, infrastructure, or product work.
