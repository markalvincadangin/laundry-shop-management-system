# Candidate Pool

Dedup key: source + topic. One row per candidate, append-only IDs (C001, C002…).
Status: `new` → `inspected` → `curated:<E-id>` | `discarded(<reason>)`.

| ID | Source | Type | Topic | Status | First seen |
|----|--------|------|-------|--------|------------|
| C001 | https://examples.vercel.com/guides/vercel-reverse-proxy-rewrites-external | Official guide | External rewrites as reverse proxy | curated:E001 | 2026-08-07 |
| C002 | https://examples.vercel.com/kb/guide/using_vercel_as_a_cdn | Official guide | External-rewrite cache behavior | curated:E002 | 2026-08-07 |
| C003 | https://nextjs.org/docs/pages/guides/static-exports | Official documentation | Static export limitations | curated:E003 | 2026-08-07 |
| C004 | frontend/next.config.mjs; frontend/src/lib/api-client.ts; backend/src/main/resources/application*.yml | Codebase | Current deployment and session configuration | curated:E004 | 2026-08-07 |
| C005 | https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Set-Cookie | Primary browser documentation | Cookie SameSite and Secure attributes | curated:E005 | 2026-08-07 |
| C006 | https://ngrok.com/docs/agent/config | Official documentation | Windows agent configuration and fixed endpoint setup | curated:E006 | 2026-08-07 |
| C007 | backend/src/main/java/com/himotech/laundryms/**/service; scripts/build-installer.*; scripts/share.ps1 | Codebase | Transaction boundaries and installer tunnel behavior | curated:E007 | 2026-08-07 |
