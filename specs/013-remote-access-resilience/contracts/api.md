# API Contract: Remote Access Resilience

## API route boundary

| Browser request | Vercel | Standalone |
|-----------------|--------|------------|
| `/api/:path*` | External rewrite to `${UPSTREAM_API_URL}/api/:path*` | Spring Boot serves the same path |

`UPSTREAM_API_URL` is Vercel-only configuration. `NEXT_PUBLIC_API_URL` is `/api` in both production modes.

## Availability

`GET /api/v1/health` remains the authority for the browser availability state. The client applies a five-second deadline. Every result is non-cacheable.

## Idempotent business mutations

All authenticated durable non-auth `POST`, `PUT`, `PATCH`, and `DELETE` endpoints require `Idempotency-Key: <UUID>`. Login, refresh, logout, reads, and order preview are excluded.

| Situation | Result |
|-----------|--------|
| First valid request | Existing success response; outcome is stored atomically |
| Same actor/key/request | Original status/body, plus `Idempotency-Replayed: true` |
| Same actor/key, changed request | `409 IDEMPOTENCY_KEY_CONFLICT` |
| Missing/invalid key | `400 IDEMPOTENCY_KEY_REQUIRED`; business service not invoked |
| Transport timeout/502/503/504 after send | Frontend marks action unconfirmed; no automatic new mutation |

Every `/api/**` response has `Cache-Control: no-store, no-cache, must-revalidate` and `Pragma: no-cache`.

## Session policy

Refresh cookies are `HttpOnly`, `Secure`, host-only, and `SameSite=Lax` in production. CSRF remains mandatory for refresh and logout. Only the configured Vercel production origin is allowed.
