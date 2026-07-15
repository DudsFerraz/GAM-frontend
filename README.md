# GAM Frontend

GAM's React/TypeScript single-page frontend. Read the contributor documentation before significant work:

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

`npm run lint` and `npm run build` are configured, but both currently fail on existing source issues documented in the [development workflow](docs/guides/development.md). The local `/api` proxy is not configured yet.
