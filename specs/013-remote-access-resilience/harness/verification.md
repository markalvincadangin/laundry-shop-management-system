# Verification Records

A claim is `verified` only after re-checking the PRIMARY source (not the
curated summary). Verdicts: verified | refuted | unverifiable.

| ID | Claim | Method | Verdict | Confidence | Evidence | Date |
|----|-------|--------|---------|------------|----------|------|
| V001 | Vercel can proxy `/api/*` to an external origin via rewrites. | Re-read official Vercel rewrite documentation and reverse-proxy guide. | verified | high | E001 | 2026-08-07 |
| V002 | A static Next.js export cannot contain rewrites. | Re-read the official Next.js static-export unsupported-features list. | verified | high | E003 | 2026-08-07 |
| V003 | External-origin response caching is policy-sensitive and must be disabled explicitly for API data. | Re-read Vercel's current external-origin caching changelog and rewrite documentation. | verified | high | E002 | 2026-08-07 |
| V004 | Feature 013's deployment/security prerequisites are absent from the current codebase. | Re-read current frontend and Spring configuration source files and compare with the design. | verified | high | E004 | 2026-08-07 |
