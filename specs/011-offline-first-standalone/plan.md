# Implementation Plan: Offline-First Tunnel System Transition

**Branch**: `011-offline-first-standalone` | **Date**: 2026-07-21 | **Spec**: [spec.md](file:///home/markc/projects/web-dev/laundry-shop-management-system/specs/011-offline-first-standalone/spec.md)
**Input**: Feature specification from `.specify/specs/011-offline-first-standalone/spec.md`

## Summary

Transition the cloud web application to an Offline-First standalone architecture running on Windows. This includes migrating to UUID primary keys, and deploying via Inno Setup (`.exe` installer wizard) and WinSW (Windows Service Wrapper).
**Pivot (2026-07-21):** We have abandoned the Transactional Outbox pattern in favor of a secure Cloudflare Tunnel. We must now delete the `sync` package and remove `OutboxService` dependencies.

## Technical Context

**Language/Version**: Java 21, TypeScript
**Primary Dependencies**: Spring Boot, Next.js, PostgreSQL, Inno Setup, WinSW
**Storage**: PostgreSQL (Local Service)
**Testing**: JUnit, Testcontainers, WireMock, Vitest
**Target Platform**: Windows OS (Laptop/Surface tablet)
**Project Type**: Standalone Full-stack Executable
**Constraints**: Requires Windows OS, Next.js must compile statically via `output: 'export'`

## Constitution Check

*GATE: Must pass before proceeding. Re-check after design phase.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Feature-First Backend Organization | PASS | `sync` package is being deleted to clean up unused features. |
| II. Frontend App Router Layering & State | PASS | Standalone build does not alter the React component architecture. |
| III. Polyglot Contract Sync | PASS | DTOs (UUID changes) will have matching Zod schema updates. |
| IV. UX Standards & Doherty Threshold | PASS | Local autonomy ensures instant feedback (Doherty Threshold). |
| V. Containerized Development | PASS | Developer environment remains Docker/Compose based. |
| VI. Physical Asset & Machine Management | PASS | Offline mode naturally handles physical constraints locally. |

## Project Structure

### Source Code (repository root)

```text
backend/src/main/java/com/himotech/laundryms/
├── orders/service/OrderService.java      # (Remove OutboxService)
├── payments/service/PaymentService.java  # (Remove OutboxService)
├── customers/service/CustomerService.java# (Remove OutboxService)
└── sync/                                 # [DELETE DIRECTORY]

backend/src/main/resources/
└── db/migration/V1__init.sql             # (Remove outbox_events table)
```

## Execution Strategy

### TDD Requirements
- N/A - We are deleting code. Standard `mvn test` will verify nothing is broken.

### Parallel Execution Opportunities
- N/A

### Human Checkpoints
- Run `mvn clean test` to ensure removal of `OutboxService` does not break compilation or core tests.

### Review Gates
- [ ] Ensure `V1__init.sql` no longer contains the `outbox_events` table.
