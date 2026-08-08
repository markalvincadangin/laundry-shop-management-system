# Verification Records

A claim is `verified` only after re-checking the PRIMARY source (not the
curated summary). Verdicts: verified | refuted | unverifiable.

| ID | Claim | Method | Verdict | Confidence | Evidence | Date |
|----|-------|--------|---------|------------|----------|------|
| V001 | Vercel can proxy `/api/*` to an external origin via rewrites. | Re-read official Vercel rewrite documentation and reverse-proxy guide. | verified | high | E001 | 2026-08-07 |
| V002 | A static Next.js export cannot contain rewrites. | Re-read the official Next.js static-export unsupported-features list. | verified | high | E003 | 2026-08-07 |
| V003 | External-origin response caching is policy-sensitive and must be disabled explicitly for API data. | Re-read Vercel's current external-origin caching changelog and rewrite documentation. | verified | high | E002 | 2026-08-07 |
| V004 | Feature 013's deployment/security prerequisites are absent from the current codebase. | Re-read current frontend and Spring configuration source files and compare with the design. | verified | high | E004 | 2026-08-07 |
| V005 | The existing health endpoint can be used as a public availability probe. | Re-read `HealthController` and `SecurityConfig`; attempted to find an auth requirement. | verified | high | E004 | 2026-08-07 |
| V006 | Refresh and logout have active double-submit CSRF enforcement. | Re-read `CsrfDoubleSubmitFilter`; attempted to find a bypass on those paths. | verified | high | E004 | 2026-08-07 |
| V007 | Existing business writes use service-layer transactions, so an idempotency reservation must join an outer transaction. | Re-read `OrderService` mutation methods; attempted to find controller-managed write transactions. | verified | high | E007 | 2026-08-07 |
| V008 | Vercel external rewrites preserve login/refresh cookies exactly as required by this application. | Searched official Vercel rewrite and cookie documentation; no primary source established this application-specific response-header behavior. | unverifiable | medium | E005 | 2026-08-07 |
| V009 | A reserved Ngrok endpoint can forward to a localhost-hosted application. | Re-read Ngrok agent configuration and endpoint quickstart; attempted to find a public-LAN binding requirement. | verified | high | E006 | 2026-08-07 |
