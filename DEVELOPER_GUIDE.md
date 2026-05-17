# BetixPro Developer Guide

This guide is for future developers who need to understand how BetixPro is built, how it is wired together, and where the technical decisions live. It is intentionally detailed so a new engineer can move from first clone to meaningful changes without reverse-engineering the repo.

## 1. System Overview

BetixPro is split into two deployable applications:

- [client/](client/) is the React + Vite frontend.
- [server/](server/) is the Express + Prisma backend.

At the repository root, the most important reference docs are:

- [README.md](README.md) for the high-level product and setup overview.
- [USER_GUIDE.md](USER_GUIDE.md) for the end-user flow.
- [OPERATIONS_GUIDE.md](OPERATIONS_GUIDE.md) for admin operations.
- This file, [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md), for the technical handoff.

The application is designed around a single public API under `/api`, with the frontend consuming that API through Axios and TanStack Query, and the backend exposing route namespaces for auth, betting, profiles, admin tools, notifications, payments, and integrations.

## 2. Technology Stack

### Frontend

The frontend uses the following core technologies:

- React 19 for the UI layer and component model.
- Vite for development server, bundling, and production builds.
- TypeScript for type safety across components, hooks, and route definitions.
- TanStack Router for file-based route composition and route-level typing.
- TanStack Query for server state, caching, retries, and request lifecycle management.
- Axios for HTTP communication with the backend.
- Tailwind CSS v4 for utility-first styling.
- Radix UI and Lucide React for accessible primitives and icons.
- Recharts for charts and graphs.
- Socket.io Client for live event updates from the backend.
- Sonner for toast notifications.

### Backend

The backend uses the following core technologies:

- Node.js as the runtime.
- Express 5 as the HTTP framework.
- Prisma as the ORM and migration system.
- PostgreSQL as the database.
- Zod for validation and config schema enforcement.
- JWT for access and refresh token-based authentication.
- Cookie parsing and cookie-based session handling for browser auth flows.
- Helmet for HTTP hardening headers.
- CORS for cross-origin request control.
- Morgan for request logging.
- express-rate-limit for abuse protection.
- Socket.io for live server push.
- node-cron for scheduled jobs.
- SendGrid for transactional email delivery.
- otplib and qrcode for admin 2FA enrollment and verification.
- bcryptjs for password hashing.
- uuid for identifiers and references.

### Build And Tooling

- pnpm is the package manager in both apps.
- TypeScript is used for compilation and lint-style type checking.
- tsx is used for executing tests and scripts in the backend.
- nodemon is used for backend development auto-reload.
- Prisma CLI manages schema generation, migrations, and seeding.

## 3. Repository Layout

The codebase follows a feature-oriented layout with shared infrastructure around it.

### Frontend Layout

- [client/src/main.tsx](client/src/main.tsx) bootstraps the React tree, QueryClient, router, auth provider, and theme provider.
- [client/src/routes/](client/src/routes/) contains route definitions.
- [client/src/components/](client/src/components/) contains shared components and feature-specific UI pieces.
- [client/src/context/](client/src/context/) contains global providers like auth and theme.
- [client/src/hooks/](client/src/hooks/) contains reusable hooks that wrap API behavior.
- [client/src/api/](client/src/api/) contains Axios configuration and interceptors.
- [client/src/lib/](client/src/lib/) contains router and utility helpers.
- [client/src/features/](client/src/features/) contains larger feature modules grouped by domain.
- [client/src/styles/](client/src/styles/) contains shared stylesheet fragments.

### Backend Layout

- [server/src/server.ts](server/src/server.ts) is the executable entry point.
- [server/src/app.ts](server/src/app.ts) constructs and configures the Express app.
- [server/src/routes/](server/src/routes/) contains route registration and namespace wiring.
- [server/src/controllers/](server/src/controllers/) contains request handlers.
- [server/src/lib/](server/src/lib/) contains shared business logic and integration helpers.
- [server/src/services/](server/src/services/) contains longer-running domain services, schedulers, and orchestration code.
- [server/src/middleware/](server/src/middleware/) contains auth, rate limit, and request guards.
- [server/src/utils/](server/src/utils/) contains support utilities.
- [server/prisma/](server/prisma/) contains the schema, migrations, and seed scripts.
- [server/src/tests/](server/src/tests/) contains backend tests.

## 4. How The Frontend Boots

The frontend entry point is [client/src/main.tsx](client/src/main.tsx). The boot process is important because it shows the runtime order and the app-wide dependencies.

What happens on startup:

- The app installs Axios interceptors dynamically so auth and refresh behavior is available before requests begin.
- The app redirects preview hosts to the canonical production host when needed.
- A single TanStack Query client is created with conservative defaults.
- The router is created and registered with TanStack Router for type-safe navigation.
- The app is wrapped in `StrictMode`, theme, auth, query, and router providers.
- The fallback loading state is kept deliberately simple to avoid blocking app startup.

The client uses a path alias of `@` that points to [client/src/](client/src/), so imports stay short and stable as the project grows.

## 5. Frontend Architecture

### Routing

Routes live in [client/src/routes/](client/src/routes/). This is a file-based routing setup, so route filenames matter. Route files tend to follow feature or page names rather than generic names, and the generated route tree is checked into the repo as [client/src/routeTree.gen.ts](client/src/routeTree.gen.ts).

Expected route conventions:

- Route files are lower-case and usually kebab-case or dot-separated for nested segments.
- Page-level route modules export route components or loader/action logic in a route-centric way.
- Route names should describe the business area, not the implementation detail.

### State And Data Fetching

TanStack Query is used for all server state. That means:

- Network requests should be cached and invalidated through query keys.
- Long-lived request state should live in hooks, not in component-local imperative code.
- Refetch logic is managed intentionally, not by repeated ad hoc fetch calls.

Axios configuration lives in [client/src/api/axiosConfig.ts](client/src/api/axiosConfig.ts). The base URL is resolved from `VITE_API_BASE_URL` when present, and otherwise defaults to `https://api.betixpro.com/api`. Socket connections use `VITE_API_URL` or the production API host.

### UI And Styling

The frontend uses Tailwind CSS v4 together with Radix primitives and custom component composition.

Design conventions worth keeping:

- Keep component APIs small and composable.
- Prefer feature-scoped components over dumping everything into a single shared folder.
- Use the existing color, spacing, and layout language already established in the app.
- Keep toast, dialog, modal, and form patterns consistent with the rest of the client.

### Client Deployment Behavior

The frontend has a canonical-host redirect in [client/src/main.tsx](client/src/main.tsx). Preview hosts on `*.vercel.app` are redirected to the canonical public host, which prevents accidental divergence between preview URLs and production URLs.

The Vite config in [client/vite.config.ts](client/vite.config.ts) also proxies `/api` and `/socket.io` to the backend during development, so local frontend work can talk to the API and websocket server without custom browser-side setup.

## 6. Backend Architecture

The backend entry point is [server/src/server.ts](server/src/server.ts), which loads environment configuration, checks database connectivity, initializes production admin data, starts the HTTP and Socket.io server, and enables scheduled jobs.

The app itself is built in [server/src/app.ts](server/src/app.ts). The middleware order matters:

- `helmet()` runs first to add security headers.
- `morgan("dev")` logs incoming requests.
- A custom logging block prints CORS and preflight context.
- `cors()` is applied with the configured allowlist.
- `cookieParser()` is added before auth handling.
- `express.json()` is configured with a `verify` hook that stores the raw body for payment and webhook flows.
- The API router is mounted under `/api` with the global rate limiter.
- A root health response is available at `/`.
- The error handler is mounted last.

This order is intentional. If you change middleware placement, verify that raw request bodies, auth cookies, and CORS behavior still work.

### Route Composition

Route registration happens in [server/src/routes/index.ts](server/src/routes/index.ts). The codebase uses route namespaces instead of one giant router.

The important namespace pattern is:

- `/api/auth` for auth flows.
- `/api/admin` for administrative features.
- `/api/payments/paystack` for Paystack.
- `/api/payments/mpesa` for M-Pesa.
- `/api/mpesa` is also mounted for compatibility.
- `/api/profile`, `/api/notifications`, `/api/my-bets`, `/api/live`, and related feature routes cover user-facing functions.

### Controllers, Libs, And Services

The backend separates responsibilities fairly cleanly:

- Controllers convert HTTP requests into domain actions and responses.
- Lib modules hold reusable business logic and integration code.
- Services coordinate longer-running background or orchestrated processes.
- Middleware handles request-level policy, not business logic.

That means if you are changing how a payment is processed, look for the helper in [server/src/lib/](server/src/lib/) before touching the controller. If you are changing a recurring job, look in [server/src/services/](server/src/services/).

## 7. Database And Prisma

Prisma is the source of truth for the database schema. The schema lives in [server/prisma/schema.prisma](server/prisma/schema.prisma), migrations live in [server/prisma/migrations/](server/prisma/migrations/), and seed scripts live in [server/prisma/seed.ts](server/prisma/seed.ts) and related seed helpers.

### Prisma Configuration

The Prisma client is configured to use the binary engine. This matters on deployment and in local troubleshooting because the generated client can behave differently from a wasm or library engine setup.

The schema uses explicit database mappings, for example:

- Prisma models are PascalCase.
- Database tables are often snake_case and mapped with `@@map`.
- Fields are commonly camelCase in code and snake_case in the database via `@map`.

This means developers should not rename fields casually. A field name in TypeScript may not match the actual column name.

### Domain Models

The main data domains visible in the schema include:

- Users and authentication.
- Wallets and transactions.
- Notifications.
- Admin login challenges and 2FA state.
- Sport events and odds data.
- Ban appeals and moderation.
- Betting and settlement entities.

When adding a new model, follow the existing mapping style, add indexes where the query pattern requires it, and update the relevant seed or service flow.

## 8. Authentication And Security

BetixPro uses token-based auth with cookie support. The backend environment example shows separate secrets for access, refresh, reset, and JWT flows, which is a clue that auth flows are intentionally split rather than relying on one monolithic secret.

Security controls in the stack include:

- Helmet for response hardening.
- CORS allowlists for browser-origin control.
- Rate limiting on API routes.
- Password hashing with bcryptjs.
- Refresh token persistence and revocation support in the database.
- Admin login challenge support with OTP hashing and expiry.
- 2FA support using TOTP and QR generation.

Important security convention:

- Never assume a browser request is trusted just because it reached the frontend. Auth, session, and payment endpoints must validate again on the server.

## 9. Payments And Integrations

### M-Pesa

M-Pesa is one of the most important integrations in the system. The M-Pesa settings schema is defined in [server/src/lib/adminSettingsConfig.ts](server/src/lib/adminSettingsConfig.ts), and route handling lives in [server/src/routes/mpesa.ts](server/src/routes/mpesa.ts).

Key details:

- M-Pesa routes are mounted under `/api/payments/mpesa` and also under `/api/mpesa`.
- The callback handler is `POST /callback` inside the M-Pesa router.
- The expected public callback URL is `https://<your-domain>/api/payments/mpesa/callback`.
- The server also supports result and timeout URLs for B2C flows.
- Token caching matters. A previous production issue was caused by not caching access tokens properly, so do not remove cache behavior casually.

### Paystack

Paystack is wired through `/api/payments/paystack`. The guide should be read together with the admin settings schema, because Paystack configuration is stored in admin settings and in environment variables.

The environment example includes:

- `PAYSTACK_SECRET_KEY`
- `PAYSTACK_PUBLIC_KEY`
- `PAYSTACK_WEBHOOK_SECRET`
- `PAYSTACK_CALLBACK_URL`

### Other Integrations

The environment and codebase also indicate support for:

- SendGrid for outbound email.
- Odds API or sports data integration.
- Redis-style support via Upstash environment variables.

If you change an integration, document the route, required environment variables, and any deployment impact in the same change.

## 10. Environment Variables

The server has an example environment file at [server/.env.example](server/.env.example). The client has environment examples at [client/.env.example](client/.env.example) and [client/.env.production](client/.env.production).

### Backend Environment Variables

The backend example includes the following categories:

- Application runtime: `NODE_ENV`, `PORT`.
- API and public URLs: `VITE_API_URL`, `VITE_API_BASE_URL`, `CLIENT_URL`, `FRONTEND_URL`, `CORS_ORIGINS`.
- Auth: `BETTER_AUTH_URL`, `BETTER_AUTH_SECRET`, `ACCESS_TOKEN_SECRET`, `REFRESH_TOKEN_SECRET`, `RESET_TOKEN_SECRET`.
- Database: `DATABASE_URL`.
- Admin defaults: `ADMIN_EMAIL`, `ADMIN_PHONE`, `ADMIN_PASSWORD`, `FROM_EMAIL`.
- Email: `SENDGRID_API_KEY`, `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS`.
- Sports data: `API_SPORTS_KEY`, `ODDS_API_KEY`, `ODDS_API_BASE_URL`.
- Paystack: `PAYSTACK_SECRET_KEY`, `PAYSTACK_PUBLIC_KEY`, `PAYSTACK_WEBHOOK_SECRET`, `PAYSTACK_CALLBACK_URL`.
- M-Pesa: `MPESA_ENV`, `MPESA_CONSUMER_KEY`, `MPESA_CONSUMER_SECRET`, `MPESA_SHORTCODE`, `MPESA_PASSKEY`, `MPESA_CALLBACK_URL`.
- Redis: `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`.

### Frontend Environment Variables

The frontend resolves its API targets from:

- `VITE_API_URL` for the socket or service host.
- `VITE_API_BASE_URL` for HTTP requests.

If those are not provided, the client falls back to the production BetixPro API host.

## 11. Naming Conventions

These conventions are worth following because they are already visible in the repo and make future changes easier to understand.

### Files And Directories

- Server route files tend to be lower-case and feature-oriented.
- React components are usually PascalCase filenames.
- Hooks are named with a `use` prefix.
- Feature folders group the implementation by domain instead of by technical layer alone.
- Prisma schema models are PascalCase, with snake_case database maps.

### Identifiers

- Components use PascalCase.
- Hooks use `useSomething`.
- Functions and variables use camelCase.
- Constants use UPPER_SNAKE_CASE when they are truly fixed, or clear camelCase when they are module-scoped values.
- Types and interfaces generally use PascalCase.

### Route Names

Route names should reflect product language, not framework jargon. For example, a payment route should read like a payment route, not like an internal controller concept.

### Database Fields

The Prisma schema uses mapped column names to preserve existing database conventions. Keep new fields consistent with that style rather than mixing naming systems.

## 12. Common Runtime Flows

### Authentication Flow

1. A user logs in or refreshes a session.
2. The frontend stores and reuses an access token where appropriate.
3. Axios attaches the bearer token to requests.
4. A 401 response triggers the refresh flow if configured.
5. If refresh fails, the unauthorized handler runs.

### Payment Flow

1. The frontend chooses a provider.
2. The client posts to the relevant backend payment route.
3. The backend validates the request against settings and provider configuration.
4. The provider callback hits the mounted public callback URL.
5. The backend updates wallet transaction state and related notifications.

### Real-Time Flow

1. The server starts an HTTP server with Socket.io attached.
2. The client connects to the socket endpoint through the same origin or configured API host.
3. Real-time events push updates without requiring full-page refreshes.

## 13. Working In The Codebase

### Backend Change Strategy

- Start with the route that owns the feature.
- Move into the controller only if the change is HTTP-specific.
- Move into lib or service code if the logic should be reusable or testable.
- Keep validation at the boundary with Zod or equivalent helpers.
- Update Prisma only when the data shape actually needs to change.

### Frontend Change Strategy

- Start from the route or feature folder.
- Add hooks for reusable data-fetching logic.
- Keep components dumb where possible and let hooks own request logic.
- Use existing query keys and invalidation patterns instead of inventing a new state channel.

### Integration Change Strategy

- Update the environment file example.
- Update the settings schema if the value is admin-managed.
- Update docs that mention the route or callback.
- Add or update tests for the affected flow.

## 14. Scripts And Validation

### Frontend Scripts

From [client/package.json](client/package.json):

- `pnpm dev` starts Vite.
- `pnpm build` runs the TypeScript build and Vite production build.
- `pnpm lint` runs ESLint.
- `pnpm preview` serves the built app locally.
- `pnpm typecheck` runs the TypeScript project build without emitting.

### Backend Scripts

From [server/package.json](server/package.json):

- `pnpm dev` starts nodemon and the development server.
- `pnpm build` compiles the backend TypeScript.
- `pnpm lint` runs the backend TypeScript no-emit check.
- `pnpm test:smoke` runs the backend smoke test.
- `pnpm test:cors` runs the backend CORS/auth test.
- `pnpm prisma:migrate` creates and applies local migrations.
- `pnpm prisma:seed` seeds the database.
- `pnpm prisma:studio` opens Prisma Studio.
- `pnpm db:deploy` prepares Prisma, resolves failed migrations, deploys migrations, and runs the seed command.

### What To Run Before Shipping

At minimum, run the narrowest validation that touches your change:

- A build or typecheck for the package you changed.
- A focused test file if one exists.
- A smoke test for payment, route, or auth changes.

If your change touches Prisma schema or migrations, validate both the generated client path and the deploy path, not just compilation.

## 15. Deployment Model

The repo supports deployment on Render and Vercel.

### Render

The Render config is in [render.yaml](render.yaml). The backend service uses:

- `rootDir: server`
- `pnpm install --frozen-lockfile && pnpm run build`
- `pnpm run start:render`
- `/health` as the health check path

### Client Hosting

The client has Vite build configuration and canonical host behavior to support production and preview deployments cleanly. Because the frontend proxies API and websocket traffic in development, local and production behavior stay close, but route URLs still need to be checked against the deployed backend host.

## 16. Known Issues And Environment Notes

- Windows builds can fail during Prisma generation with an `EPERM` rename error on `query-engine-windows.exe`. That is usually a file-lock or environment issue, not an application code bug.
- The backend reads `.env` through dotenv and overrides values only when not in production.
- The API is mounted under `/api`, so callback URLs and route documentation should always be written against the public deployment URL, not the bare route file path.
- M-Pesa token caching has already been fixed once in production, so any refactor in that area should be done carefully.

## 17. Where To Start When Debugging

If a feature is broken, start from the nearest owning surface:

- Request/response behavior: [server/src/routes/index.ts](server/src/routes/index.ts)
- Express startup or middleware: [server/src/app.ts](server/src/app.ts)
- Payment behavior: [server/src/lib/mpesa.ts](server/src/lib/mpesa.ts)
- Admin config shape: [server/src/lib/adminSettingsConfig.ts](server/src/lib/adminSettingsConfig.ts)
- Frontend HTTP behavior: [client/src/api/axiosConfig.ts](client/src/api/axiosConfig.ts)
- Frontend route behavior: [client/src/routes/](client/src/routes/)
- Schema or migration issues: [server/prisma/schema.prisma](server/prisma/schema.prisma)

If you are unsure which file owns the behavior, follow the route first, then the helper it calls, rather than searching the entire repo at once.
