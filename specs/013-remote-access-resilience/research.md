# Research: Remote Access Resilience

## Decisions

### Dual deployment modes

**Decision**: The Vercel build uses an external `/api/:path*` rewrite to a fixed Ngrok HTTPS endpoint. The Windows installer uses a Next.js static export served by Spring Boot.

**Rationale**: Vercel rewrites preserve the browser-visible URL, while Next.js static exports do not support rewrites.

**Alternatives considered**: Direct browser-to-Ngrok requests were rejected because the frontend cannot reliably present a hosted offline state and would require cross-origin session handling.

### Non-cacheable operational API

**Decision**: All `/api/**` responses carry `Cache-Control: no-store, no-cache, must-revalidate` and `Pragma: no-cache`.

**Rationale**: Vercel external-origin caching is configurable and respects origin cache policy; availability, authentication, and operational data must not be stale.

### Transactional idempotency

**Decision**: Reserve a unique idempotency record before the business service executes and complete it before the same outer transaction commits.

**Rationale**: Current business writes are service-layer transactions. Recording the idempotency outcome after a service commit creates a duplicate-write failure window.

**Alternatives considered**: A controller-only post-processing record and a browser offline-write queue were rejected as unsafe.

### Session and tunnel policy

**Decision**: Production refresh cookies are host-only, `Secure`, `HttpOnly`, and `SameSite=Lax`; Ngrok uses a reserved endpoint forwarding only to `127.0.0.1:8765`.

**Rationale**: The Vercel `/api` proxy makes browser requests same-origin. Cookie propagation through the proxy remains a mandatory production-like acceptance test.

## Sources

- [Harness evidence and verification](harness/evidence.md)
- [Vercel rewrites](https://vercel.com/docs/routing/rewrites)
- [Next.js static exports](https://nextjs.org/docs/pages/guides/static-exports)
- [Ngrok agent configuration](https://ngrok.com/docs/agent/config)
- [MDN Set-Cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Set-Cookie)
