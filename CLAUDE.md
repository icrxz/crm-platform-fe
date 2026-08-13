# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev            # next dev
npm run build           # next build
npm run start            # next start (production)
npm run lint             # eslint .
npm run prettier         # prettier --write --ignore-unknown .
npm run prettier:check   # prettier --check --ignore-unknown .
npm run test              # jest
npm run test:watch        # jest --watch
npm run test:ci            # jest --ci --passWithNoTests
npm run analyze            # bundle analyzer build
```

Single test: `npm test -- path/to/file.test.tsx` or `npm test -- -t "test name"`.

Docker (prod-style container, not local dev): `make docker/start` (build+run), `make docker/logs`, `make docker/stop`, `make docker/clean`. Requires `.env.local`.

Pre-commit: husky + lint-staged run eslint --fix and prettier on staged files automatically.

## Architecture

Next.js App Router, single `src/app` tree. No `internal/services` split — this repo talks to the `crm-api-core` Go backend as its data layer.

- **`src/app/(authenticated)/`** — route group for logged-in pages (`cases`, `contractors`, `customers`, `dashboards`, `home`, `panel`, `partners`, `payments`, `users`). Each has its own dir, some with `[id]` dynamic routes and colocated `__tests__`.
- **`src/app/login/`**, **`src/app/tv/`** — public/standalone routes outside the authenticated group (`tv` = TV/panel display mode, separate from `(authenticated)/panel`).
- **`src/app/api/`** — Next.js route handlers: `auth/[...nextauth]` (NextAuth config), `auth/clear-session`, `report/[caseID]` (proxies report download from backend).
- **`src/app/components/`** — one subfolder per domain entity (`cases`, `contractors`, `customers`, `dashboards`, `payments`, `panel`, `users`, etc) plus `common/` for generic UI primitives (button, modal, badge, dropdown, text-input, file-uploader, snackbar, search, ...). Mirrors the route structure in `(authenticated)/`.
- **`src/app/services/`** — server actions (`'use server'`), one subfolder per entity (`cases`, `customers`, `partners`, `contractors`, `products`, `comments`, `transactions`, `users`), one file per operation (e.g. `services/cases/assign_owner.ts`, `create_case.ts`, `search_cases.ts`). Each action: reads JWT from cookies, calls `crm-api-core` REST endpoint directly via `fetch` with `X-API-Key` + `Authorization: Bearer` headers, returns a `ServiceResponse<T>` (`{ success, message, data?, unauthorized? }`). This is the only place HTTP calls to the backend are made — don't fetch the backend directly from components.
- **`src/app/libs/`** — cross-cutting helpers: `session.ts` (`getCurrentUser()` via NextAuth), `api-error.ts` (`getApiErrorMessage`), likely auth/config glue.
- **`src/app/context/`** — React context providers.
- **`src/app/types/`** — shared TS types/interfaces, generally mirroring backend DTOs (`case.ts`, `assign_owner.ts`, `service.ts`, etc).
- **`src/app/utils/`**, **`src/app/ui/`** — generic utilities and shared UI helpers not tied to a specific entity.

### Auth

NextAuth (`src/app/api/auth/[...nextauth]/route.ts`) issues a session; the backend JWT is stored in a cookie (`jwt`) and read directly in service actions via `cookies()` — auth to `crm-api-core` is cookie-based JWT, not NextAuth's own session token.

### Conventions seen in code

- Service action files are named after the operation, snake_case (`assign_owner.ts`, `change_status.ts`, `search_cases_full.ts`), not the HTTP verb.
- Error handling in service actions: check `response.ok`, special-case `401` as `unauthorized: true`, use `getApiErrorMessage` for backend error body parsing, always return `ServiceResponse` rather than throwing.
- UI library: HeroUI (`@heroui/react`) + Tailwind. File uploads via Uppy (`@uppy/*`). Charts via `recharts`.

## Tooling notes

- ESLint: `eslint-config-next` + `eslint-config-prettier` (prettier owns formatting, eslint doesn't fight it).
- Jest via `next/jest`, `jsdom` environment, tests colocated in `__tests__` folders next to the code they cover (not a single top-level `__tests__`, except `src/__tests__` for broader/shared tests).
- Node version pinned via `.nvmrc`.
