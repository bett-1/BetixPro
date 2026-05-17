# BetixPro Developer Guide

This guide is for future developers who need to understand how BetixPro is organized, how to run it locally, and where the important integration points live.

## What Lives Where

BetixPro is split into two apps:

- [client/](client/) is the React + Vite frontend.
- [server/](server/) is the Express + Prisma backend.

The repo root contains the main [README.md](README.md), plus [USER_GUIDE.md](USER_GUIDE.md) for end users and [OPERATIONS_GUIDE.md](OPERATIONS_GUIDE.md) for admin operators.

## Local Setup

Start with the package scripts that already exist in each app.

Frontend:

- `pnpm install`
- `pnpm dev`
- `pnpm build`
- `pnpm lint`

Backend:

- `pnpm install`
- `pnpm dev`
- `pnpm build`
- `pnpm lint`
- `pnpm test:smoke`
- `pnpm test:cors`

## Backend Architecture

The Express app is assembled in [server/src/app.ts](server/src/app.ts) and routed through [server/src/routes/index.ts](server/src/routes/index.ts). The server entry point is [server/src/server.ts](server/src/server.ts).

Key directories:

- [server/src/controllers/](server/src/controllers/) for request handlers.
- [server/src/routes/](server/src/routes/) for route wiring.
- [server/src/lib/](server/src/lib/) for reusable business logic.
- [server/src/middleware/](server/src/middleware/) for auth, CORS, and rate limiting.
- [server/prisma/](server/prisma/) for schema, migrations, and seed scripts.

## Frontend Architecture

The frontend uses TanStack Router, TanStack Query, React, and Vite. Route files live in [client/src/routes/](client/src/routes/), shared UI in [client/src/components/](client/src/components/), and data/access helpers in [client/src/api/](client/src/api/) and [client/src/lib/](client/src/lib/).

## Database And Deployment

Prisma is the source of truth for the database schema. The scripts in [server/package.json](server/package.json) are the safest way to manage it:

- `pnpm prisma:migrate` for local schema changes.
- `pnpm prisma:seed` for seed data.
- `pnpm db:deploy` for production-style deployment.
- `pnpm prisma:studio` for data inspection.

## Payment Integrations

The payment routes currently use the `/api/payments/...` namespace.

- M-Pesa routes are mounted in [server/src/routes/index.ts](server/src/routes/index.ts).
- The callback handler is registered at `POST /callback` in [server/src/routes/mpesa.ts](server/src/routes/mpesa.ts).
- The expected callback URL is `https://<your-domain>/api/payments/mpesa/callback`.
- Paystack uses the `/api/payments/paystack` namespace.

## Things To Watch

- Windows builds can fail during Prisma generation with an `EPERM` rename error on `query-engine-windows.exe`. That is usually an environment or file-lock issue.
- M-Pesa token caching was previously a production issue and has already been fixed. If you change that logic, keep the TTL-based reuse behavior intact.
- The backend is mounted under `/api`, so route paths should always be checked against the final public URL.

## Working Conventions

- Make the smallest change that fixes the problem.
- Prefer the nearest owning route, controller, or helper before adding a new abstraction.
- Keep validation close to the data boundary, especially for settings and payments.
- If you add or change an integration, document its route, environment variables, and deployment impact in the same change.

## Suggested First Stops

- API wiring: [server/src/routes/index.ts](server/src/routes/index.ts)
- Express bootstrap: [server/src/app.ts](server/src/app.ts)
- M-Pesa logic: [server/src/lib/mpesa.ts](server/src/lib/mpesa.ts)
- Admin settings schema: [server/src/lib/adminSettingsConfig.ts](server/src/lib/adminSettingsConfig.ts)
- Frontend routing: [client/src/routes/](client/src/routes/)

If you are unsure where a behavior is controlled, start with the route or helper closest to the feature instead of searching broadly across the repo.