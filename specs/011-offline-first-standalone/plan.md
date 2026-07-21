# Implementation Plan: Offline-First Standalone System Transition

**Branch**: `011-offline-first-standalone` | **Date**: 2026-07-14 | **Spec**: [spec.md](file:///home/markc/projects/web-dev/laundry-shop-management-system/specs/011-offline-first-standalone/spec.md)
**Input**: Feature specification from `.specify/specs/011-offline-first-standalone/spec.md`

## Summary

Transition the cloud web application to an Offline-First standalone architecture running on Windows. This includes migrating to UUID primary keys, implementing a Transactional Outbox pattern with `SyncWorker` for cloud sync, and bundling the Spring Boot app and Next.js static export via `jpackage` and PowerShell scripts.

## Technical Context

**Language/Version**: Java 21, TypeScript
**Primary Dependencies**: Spring Boot, Next.js, PostgreSQL, jpackage
**Storage**: PostgreSQL (Local Service)
**Testing**: JUnit, Testcontainers, WireMock, Vitest
**Target Platform**: Windows OS (Laptop/Surface tablet)
**Project Type**: Standalone Full-stack Executable
**Performance Goals**: Zero perceived latency on local network outages, background async sync
**Constraints**: Requires Windows OS, Next.js must compile statically via `output: 'export'`

## Constitution Check

*GATE: Must pass before proceeding. Re-check after design phase.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Feature-First Backend Organization | PASS | `OutboxEvent` and `SyncWorker` reside cleanly in the `sync/` feature package. |
| II. Frontend App Router Layering & State | PASS | Standalone build does not alter the React component architecture. |
| III. Polyglot Contract Sync | PASS | DTOs (UUID changes) will have matching Zod schema updates. |
| IV. UX Standards & Doherty Threshold | PASS | Local autonomy ensures instant feedback (Doherty Threshold). |
| V. Containerized Development | PASS | Developer environment remains Docker/Compose based. |
| VI. Physical Asset & Machine Management | PASS | Offline mode naturally handles physical constraints locally. |
| VIII. Frontend React/Next.js Best Practices | PASS | Adheres to Vercel best practices, though static export requires App Router workarounds. |
| Coding Standards | PASS | Code additions will enforce 500-line limits and Checkstyle compliance. |
| Credential & Security Rules | PASS | `server.address: 0.0.0.0` supports LAN access via Wi-Fi; syncing requires JWT. |

## Project Structure

### Documentation (this feature)

```text
specs/011-offline-first-standalone/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Technical research findings
├── data-model.md        # DB schema definition
├── quickstart.md        # Validation guide
├── tasks.md             # Task breakdown
└── checklists/          # Validation checklists
```

### Source Code (repository root)

```text
backend/src/main/java/com/himotech/laundryms/
├── sync/
│   ├── entity/OutboxEvent.java
│   ├── entity/SyncStatus.java
│   ├── repository/OutboxEventRepository.java
│   ├── service/OutboxService.java
│   └── worker/SyncWorker.java
├── config/SpaRedirectFilter.java
└── */entity/*.java       # (UUID changes)

backend/src/main/resources/
└── db/migration/V1__init.sql

frontend/
├── next.config.mjs
└── src/app/(dashboard)/**/page.tsx # (generateStaticParams fixes)

scripts/
├── build_standalone.ps1
└── setup_windows.ps1
```

**Structure Decision**: The `sync/` module encapsulates the Outbox pattern. Next.js export workarounds require wrapper Server Components in the `app/` router. Custom PowerShell scripts in `scripts/` handle OS-specific deployment without cluttering the Java source.

## Execution Strategy

### TDD Requirements

- [ ] `sync/worker/SyncWorker`: Requires robust testing (WireMock) to simulate network partitions, failed syncs, and retry backoff logic without affecting production.

### Parallel Execution Opportunities

- [ ] [Backend UUID Migration] and [Frontend Next.js Export Fixes] can proceed independently.
- [ ] [PowerShell Scripting] can proceed independently of business logic refactoring.

### Human Checkpoints

1. After foundational Next.js export — verify static build succeeds locally.
2. After UUID migration — verify `V1__init.sql` executes cleanly on an empty database.
3. Before merge — run the standalone MSI locally on a Windows sandbox.

### Review Gates

- [ ] [Data model changes]: `V1__init.sql` rewrite must be reviewed to ensure no sequential IDs are missed.
- [ ] [Security-sensitive code]: `SpaRedirectFilter` must be reviewed to avoid exposing protected API routes.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |
