# Implementation Plan: Authentication & Session Hardening

**Branch**: `feature/012-auth-hardening` | **Date**: 2026-07-25 | **Spec**: [spec.md](file:///home/markc/projects/active/laundry-shop-management-system/specs/012-auth-hardening/spec.md)
**Input**: Feature specification from `.specify/specs/012-auth-hardening/spec.md`

## Summary

Harden JWT-based authentication ahead of the system becoming internet-reachable (Vercel frontend + tunneled backend). Implements a two-token model (15-min JWT access token in memory + refresh-token families capped at seven days from login), double-submit CSRF protection, persisted reuse audit events, daily expired-token cleanup with 30-day retention, and username-keyed brute-force lockout.

## Technical Context

**Language/Version**: Java 21, TypeScript 5.x
**Primary Dependencies**: Spring Boot 3.x, Spring Security 6.x, Next.js (App Router), Zod, React
**Storage**: PostgreSQL (via Spring Data JPA / Flyway)
**Testing**: JUnit, Testcontainers, Vitest
**Target Platform**: Vercel (Frontend), Windows Local Server (Backend) via Cloudflare Tunnel
**Project Type**: Full-Stack (Web Service + SPA)
**Performance Goals**: N/A (Standard web performance)
**Constraints**: Zero-cost offline-first deployment topology (no cloud database sync). No persistent client storage for access tokens.

## Constitution Check

*GATE: Must pass before proceeding. Re-check after design phase.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Feature-First Backend Organization | PASS | `auth` feature package will encapsulate all related models, services, and controllers. |
| II. Frontend App Router Layering & State | PASS | Memory state in `auth-store.tsx` (React Context); no direct `fetch` in components. |
| III. Polyglot Contract Sync & Business Rule Authority | PASS | Zod schemas and backend API will be updated in tandem. |
| IV. UX Standards & Doherty Threshold | PASS | Silent refresh ensures instant feedback without breaking user flow. |
| V. Containerized Development & Hot Reloading | PASS | N/A (No changes to infrastructure here, just codebase). |
| VI. Physical Asset & Machine Management | PASS | N/A for this spec. |
| VIII. Frontend React/Next.js Best Practices | PASS | Store uses Context correctly; no unnecessary re-renders expected. |
| IX. Offline-First & Tunnel Deployment Architecture | PASS | Auth hardening directly supports this deployment model securely. |

## Project Structure

### Documentation (this feature)

```text
specs/012-auth-hardening/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Technology decisions
├── data-model.md        # Database schema for tokens
├── quickstart.md        # QA validation flows
└── checklists/          # Validation checklists
```

### Source Code (repository root)

```text
backend/src/main/java/com/himotech/laundryms/auth/
├── controller/AuthController.java
├── domain/RefreshToken.java
├── repository/RefreshTokenRepository.java
├── security/CsrfDoubleSubmitFilter.java
├── security/JwtTokenProvider.java
└── service/
    ├── AuthService.java
    └── LoginAttemptService.java

backend/src/main/resources/db/migration/
└── V2__add_refresh_tokens_table.sql

frontend/src/
├── lib/api/api-client.ts
├── lib/validation/auth.ts
└── stores/auth-store.tsx
```

**Structure Decision**: Adheres strictly to the existing Feature-First organization (`auth` package) and Next.js layers (`lib/` for logic, `stores/` for context).

## Execution Strategy

### TDD Requirements

- [x] `LoginAttemptService`: Complex locking logic and time windows (5 attempts / 15 minutes) require TDD to avoid off-by-one errors and ensure test reliability.
- [x] `AuthService` (Refresh Logic): Rotation, family-wide reuse detection, fixed family expiry, and 3-day inactivity expiration require TDD to ensure security boundaries are enforced.

### Parallel Execution Opportunities

- [x] **Backend Auth Logic** (Entities, Repositories, Services, Spring Security Filter) can proceed independently.
- [x] **Frontend API Client & Store** (Silent refresh logic, interceptor) can proceed alongside backend if mocked.

### Human Checkpoints

1. After foundational backend setup — verify Flyway migration and entity relationships.
2. After backend API implementation — verify API contracts (login, refresh, logout), fixed family expiry, and reuse audit events via cURL or Postman.
3. After frontend integration — verify silent refresh and storage locations in browser devtools.
4. Before merge — final review against spec.

### Review Gates

- [x] **Security-sensitive code**: `CsrfDoubleSubmitFilter`, `JwtTokenProvider`, and `AuthService` rotation logic require review before integration.
- [x] **Data model changes**: `V2__add_refresh_tokens_table.sql` requires review before execution.
