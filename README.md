# GAM Frontend

GAM's React/TypeScript single-page frontend. The application currently provides same-origin browser-session bootstrap, public login and registration, protected navigation, a current-Account profile, and contract-backed views for Members, membership solicitations, Accounts and Roles, Events and attendance, and Locations.

Read the contributor documentation before significant work:

- [Documentation overview](docs/README.md)
- [Architecture](docs/architecture/overview.md)
- [Browser authentication](docs/integration/authentication.md)
- [API integration](docs/integration/api.md)
- [Development workflow](docs/guides/development.md)
- [Implementation backlog](docs/backlog/steps.md)

```sh
npm ci
npm run dev
```

The supported local workflow keeps browser requests on the frontend origin. The shared HTTP client calls `/api`, and Vite proxies that prefix to the local backend configured through the server-only `API_PROXY_TARGET` environment variable.

`npm run lint` and `npm run build` are configured and verified. Automated test scripts and test files are not configured yet. See the [development workflow](docs/guides/development.md) for the current command status and local API setup.
