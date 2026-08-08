# Implementation Plan: Remote Access Resilience

**Branch**: `[013-remote-access-resilience]` | **Date**: 2026-08-07 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `specs/013-remote-access-resilience/spec.md`

## Summary

Make the Vercel frontend a stable public entry point that proxies same-origin `/api/*` requests to the fixed Ngrok laptop endpoint. Keep the Windows standalone static build, add explicit availability/offline behavior, and make every non-auth business mutation durably idempotent. The implementation must preserve local operation without internet, exact-origin security, and safe recovery after a lost response.

## Technical Context

**Language/Version**: Java 21 / Spring Boot 3.5; TypeScript / Next.js 15.5 / React 19
**Primary Dependencies**: Spring Security, Spring Data JPA, Flyway, PostgreSQL 16; Vitest and Playwright
**Storage**: Laptop-hosted PostgreSQL; Flyway migration for operation recovery records
**Testing**: Maven/JUnit/Testcontainers integration tests; Vitest component/client tests; Playwright production-like acceptance
**Target Platform**: Windows shop laptop (standalone backend/database/Ngrok agent) plus Vercel-hosted frontend
**Project Type**: Frontend + backend monorepo web application with Windows installer
**Performance Goals**: Remote unavailability produces the offline state within 5 seconds; local workflows remain available without internet
**Constraints**: No cloud database or browser offline-write queue; production browser API base is `/api`; previews never use the production laptop; `/api/**` is non-cacheable
**Scale/Scope**: Existing public tracking plus all authenticated Staff/Admin mutation paths for one live shop host

## Constitution Check

| Principle | Status | Notes |
|-----------|--------|-------|
| Offline-first local operation | PASS | Internet loss removes remote access only; laptop Spring Boot and PostgreSQL continue. |
| No cloud database synchronization | PASS | Laptop PostgreSQL is the only source of truth; remote writes are not queued. |
| Secure tunnel deployment | PASS | Fixed Ngrok HTTPS endpoint forwards only to `127.0.0.1`. |
| Secure remote sessions and RBAC | PASS | JWT, CSRF, exact-origin CORS, and role checks remain; proxy cookie behavior is acceptance-tested. |
| Contract and quality discipline | PASS | Header/error behavior is documented in `contracts/api.md`; tests precede implementation. |
| Documentation and operability | PASS | Environment, installer, outage/recovery, and acceptance guidance are included. |

**Post-design re-check**: PASS. Idempotency reserves a unique record before the service mutation and completes it before the same outer transaction commits, avoiding an unsafe post-commit record.

## Project Structure

### Documentation (this feature)

```text
specs/013-remote-access-resilience/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/api.md
├── harness/
└── tasks.md
```

### Source Code (repository root)

```text
backend/
├── src/main/java/com/himotech/laundryms/
│   ├── config/
│   ├── idempotency/
│   ├── */api/
│   └── */service/
├── src/main/resources/{application*.yml,db/migration/}
└── src/test/java/com/himotech/laundryms/{idempotency,config}/

frontend/
├── next.config.mjs
├── src/app/providers.tsx
├── src/components/{providers,system}/
├── src/lib/{api-client,availability}.ts
└── src/tests/

scripts/{build-installer.ps1,build-installer.sh,installer.iss,share.ps1}
```

**Structure Decision**: Extend the existing monorepo. Add an isolated backend `idempotency` package and a generic cache-control filter. Use a frontend availability provider/system UI boundary. Existing feature services remain business-rule owners and join the idempotency outer transaction.

## Execution Strategy

### TDD Requirements

- [ ] Dual-build configuration and API-base resolution: test development, standalone, and Vercel modes before config changes.
- [ ] Idempotency transaction executor: prove reservation, replay, conflict, rollback, and concurrent submission behavior before endpoint rollout.
- [ ] Availability and unconfirmed operation behavior: test timeout, initial offline, recovery, and same-key explicit retry before UI integration.
- [ ] Cache/session security: test every API response class and cookie/CSRF behavior before deployment validation.

### Dependency Order

1. Establish dual build/environment contract and localhost binding.
2. Implement and verify durable idempotency transaction support.
3. Add frontend availability and safe mutation recovery using the backend contract.
4. Enforce no-store/cache and session policy; validate Vercel proxy cookie behavior.
5. Update installer, runbook, environment templates, and acceptance checklist.
6. Run local, production-like, and full regression verification.

### Human Checkpoints

1. Approve the generated tasks before implementation.
2. Confirm the reserved Ngrok domain and Vercel environment ownership before any live deployment action.
3. Review the production-like cookie/proxy acceptance evidence before release.
4. Review full verification and documentation before merge.

### Review Gates

- [ ] Review the idempotency API contract and migration before implementation.
- [ ] Review session/cookie and CORS changes before production-like deployment.
- [ ] Review installer and operational documentation before release.
