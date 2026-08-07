# Compressed Observations

Append-only. Each entry ≤ 3 lines: what was done, what it yielded, what it
duplicates (if anything). Never paste raw tool output here.

- [O-001] Searched official Vercel material for external rewrites and cache behavior → confirmed reverse-proxy viability and the need for explicit API cache policy.
- [O-002] Searched current Next.js static-export documentation → confirmed rewrites are unsupported in exported builds, validating the planned dual-build boundary.
- [O-003] Inspected current configuration and delivery files → the old plan's dual-build, localhost binding, and cookie-policy work is required; it is not already implemented.
- [O-004] Searched cookie and Ngrok primary documentation → cookie security policy is directionally sound but must be browser-tested through the actual proxy; Ngrok supports a Windows-configured localhost agent endpoint.
- [O-005] Adversarial verification of the four load-bearing claims → all were confirmed; cookie-header forwarding remains an acceptance-test item rather than an assumed guarantee.
- [O-006] Inspected write transactions and installer scripts → idempotency cannot be added as an after-the-fact controller record; it must share the business transaction. The sharing script is development-oriented and needs replacement or retirement.
- [O-007] Review complete: the architecture is viable, with two plan corrections required before canonical planning—explicit transaction ownership and a proxy cookie integration test.
