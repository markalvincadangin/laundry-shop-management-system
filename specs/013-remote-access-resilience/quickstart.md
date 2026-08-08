# Validation Quickstart: Remote Access Resilience

## Prerequisites

- Reserved Ngrok HTTPS domain configured to forward only to `127.0.0.1:8765`.
- Vercel production settings: `NEXT_DEPLOYMENT_TARGET=vercel`, `NEXT_PUBLIC_API_URL=/api`, server-only `UPSTREAM_API_URL=https://<reserved-ngrok-domain>`.
- Standalone build settings: `NEXT_DEPLOYMENT_TARGET=standalone`, `NEXT_PUBLIC_API_URL=/api`.
- Backend exact allowed origin set to the Vercel production URL.

## Automated checks

1. Backend: idempotency replay, changed-request conflict, missing key, rollback, and concurrent submission tests.
2. Backend: cache/security tests for health, login, refresh, protected reads, and mutations.
3. Frontend: offline initial load, recovery, timeout, disabled writes, and same-key recovery tests.
4. Build both deployment targets and ensure standalone output has no production localhost API URL.

## Production-like acceptance

1. Use a non-production Vercel project and non-production Ngrok upstream; never target the live shop host.
2. Verify remote public tracking and Staff/Admin role access from a separate network.
3. Verify login, refresh, logout, protected calls, `Set-Cookie`, CSRF, and cookies through the Vercel rewrite.
4. Stop the upstream and verify the offline screen appears within five seconds; in-session writes must be disabled.
5. Interrupt a representative mutation response after its backend commit, explicitly retry with the same key, and confirm one business change only.
6. Remove laptop internet access and verify local workflows continue while remote users see offline.
