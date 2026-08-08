# Curated Set

Cap: 25 entries. Importance: critical | high | medium | low.
When full, evict lowest-importance oldest entry and log the eviction in observations.md.

| ID | Importance | Finding | Source candidate | Evidence |
|----|------------|---------|------------------|----------|
| E001 | critical | Vercel supports external rewrites as a reverse proxy while retaining the browser-visible URL, so a same-origin `/api/*` proxy is technically viable. | C001 | evidence.md#E001 |
| E002 | critical | External rewrites can be cached when rewrite caching is enabled; the backend must explicitly send no-store headers for operational API responses. | C002 | evidence.md#E002 |
| E003 | critical | Next.js static export does not support rewrites, so the local static installer and Vercel proxy must be separate build modes. | C003 | evidence.md#E003 |
| E004 | critical | The current code has one static-export build, direct production API URLs, `0.0.0.0` binding, and production `SameSite=None`; Feature 013 must change each of these deliberately. | C004 | evidence.md#E004 |
| E005 | high | `SameSite=Lax`, `Secure`, and `HttpOnly` are appropriate for same-site session requests; the implementation must test that the Vercel proxy preserves the required cookie headers. | C005 | evidence.md#E005 |
| E006 | high | Ngrok supports a persistent agent configuration on Windows and an agent endpoint can forward to localhost; the production runbook must use a reserved domain rather than a random URL. | C006 | evidence.md#E006 |
| E007 | high | Business writes currently commit inside service-layer transactions, so idempotency must join that transaction; the old plan's controller AOP ordering needs an explicit design decision. | C007 | evidence.md#E007 |
