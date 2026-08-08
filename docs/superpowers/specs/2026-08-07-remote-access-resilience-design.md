# Remote Access Resilience Design

## Goal

Provide a durable remote-access architecture for customer, Staff, and Admin users while the laptop-hosted system is online, and provide a clear, safe recovery experience when it is not.

## Architecture

The Vercel-hosted Next.js application is the only browser-facing application. Browser requests use the same-origin `/api` path. Vercel rewrites that path to a fixed Ngrok HTTPS endpoint, and Ngrok forwards it to the Spring Boot service running on the shop laptop at `127.0.0.1:8765`.

The Windows standalone build remains supported. It embeds the static frontend in Spring Boot and uses the same relative `/api` path, which is served directly by Spring Boot. It does not use a Vercel rewrite.

```text
Browser -> Vercel frontend -> /api rewrite -> fixed Ngrok endpoint -> laptop Spring Boot + PostgreSQL
```

## Deployment Modes

| Mode | Browser API base | Frontend mode | Upstream |
|---|---|---|---|
| Local development | `http://localhost:8080/api` | Next.js development | Local Spring Boot |
| Windows standalone | `/api` | Static export embedded in Spring Boot | Same Spring Boot server at `:8765` |
| Vercel production | `/api` | Normal Next.js deployment with external rewrite | Fixed Ngrok HTTPS endpoint |

`NEXT_PUBLIC_API_URL` is `/api` for both production modes. `UPSTREAM_API_URL` is a Vercel production-only configuration value used by the rewrite and is never placed in browser JavaScript. A Vercel preview deployment has no production upstream configured and must show the offline state instead of reaching the live laundry server.

## Availability and Offline Experience

The frontend probes `GET /api/v1/health` with a short client timeout on first load and periodically while the app remains open. A failure means the local server, Ngrok agent, or internet path is unavailable.

- Initial failure: render the dedicated offline screen.
- Mid-session failure: show a persistent offline/reconnecting banner, mark previously loaded data as stale, and disable all write controls.
- Recovery: re-check health, remove the stale state only after a successful probe, and refresh affected data.
- API responses on `/api/**` are explicitly non-cacheable. Availability, session, and operational data must never be served from a CDN cache.

The application never attempts to operate as an offline write queue. The laptop PostgreSQL database remains the source of truth.

## Interrupted Business Operations

Every state-changing business request uses an `Idempotency-Key` header. The backend stores the authenticated actor, HTTP method, normalized route, request fingerprint, response status/body, and expiry in an idempotency record. The business mutation and its idempotency record commit in the same database transaction.

If a request times out or receives a gateway/network failure, the frontend marks it `unconfirmed` and tells the user not to submit a new operation. On recovery it uses the same key to reconcile:

- same key and same request: replay the recorded response;
- same key and different request: return a conflict;
- no completed record: allow the user to explicitly retry after confirmation.

This applies to orders, payments, status transitions, catalogue/settings changes, and user/machine management. Login, refresh, logout, and read-only endpoints do not use business-operation idempotency.

## Security Constraints

- The laptop service binds to `127.0.0.1`; Ngrok is its only remote ingress.
- Ngrok uses a fixed HTTPS domain and a Windows service configured with a unique authtoken.
- The backend keeps JWT authentication and method-level Staff/Admin authorization.
- Refresh cookies remain `HttpOnly`, `Secure`, `SameSite=Lax`, and host-only. Browser calls to Vercel `/api` make them first-party.
- CSRF validation remains required for refresh and logout.
- Backend CORS allows the exact Vercel production origin. Wildcard origin-pattern configuration is removed.
- Direct access to the Ngrok endpoint is protected by the backend and is not treated as secret.

## Configuration Contract

The root environment template contains backend, database, and runtime settings only. Frontend development settings remain in `frontend/.env.local.example`. The installer supplies its own build-mode values and does not depend on an ignored developer `.env.local` file.

Removed configuration: `ALLOWED_ORIGIN_PATTERNS`, root-level frontend build URL variables, and obsolete Cloudflare tunnel guidance.

## Verification

- Build both frontend targets and inspect the generated installer assets for `/api` and absence of `localhost:8080`.
- Test Vercel rewrite behavior using a preview deployment that is connected to a non-production test upstream.
- Test health failure on initial load and during an active session.
- Test an operation where the backend commits then the response is lost; the retry must return one result only.
- Test Staff and Admin authorization through the Vercel deployment.
