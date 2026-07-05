# Implementation Plan: Audit Log Standardization

**Branch**: `006-audit-log-system` | **Date**: 2026-07-05 | **Spec**: [spec.md](file:///home/markc/projects/web-dev/laundry-shop-management-system/specs/006-audit-log-system/spec.md)

**Input**: Feature specification from `/specs/006-audit-log-system/spec.md`

## Summary

Standardize the audit logging system across the Faith Laundry Shop Management System using native PostgreSQL triggers for synchronous capture and redaction. Rely on database-level triggers and role privilege revocations to guarantee absolute data immutability. Provide a high-performance Next.js Admin interface with discrete filters and a Master-Detail Side Drawer for inspecting JSON diffs.

## Technical Context

**Language/Version**: Java 21 (Backend) / TypeScript (Frontend)

**Primary Dependencies**: Spring Boot (AOP, Data JPA, Security), Next.js (App Router), Shadcn UI (Sheet component for Drawer)

**Storage**: PostgreSQL (Native JSONB and Trigger functions)

**Testing**: JUnit 5 + Testcontainers (Backend), Vitest (Frontend)

**Target Platform**: Docker Compose / Containerized Linux

**Project Type**: Monorepo (Spring Boot Web Service + Next.js Web App)

**Performance Goals**: UI reads < 500ms for 1M+ rows; < 5% write degradation on mutations.

**Constraints**: No new infrastructure (No Kafka/Debezium for outbox). Must be purely synchronous within the existing Postgres transaction.

**Scale/Scope**: High write frequency on core modules (orders/inventory).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Feature-First Backend Organization**: PASS. Audit features will live entirely within `src/main/java/com/himotech/laundryms/auditlog/`.
- **Frontend App Router Layering**: PASS. API hooks in `lib/api/audit.ts`, state in components, validation in `lib/validation/audit.ts`.
- **Polyglot Contract Sync**: PASS. The `AuditLogResponse` DTO and Zod schema will be identical.
- **UX Standards & Doherty Threshold**: PASS. Pagination and DB indexing will ensure the <400ms threshold for instantaneous UI feedback.
- **Containerized Development**: PASS. All local dev will be run through the existing `docker-compose.yml`.

## Project Structure

### Documentation (this feature)

```text
specs/006-audit-log-system/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command)
```

### Source Code (repository root)

```text
backend/
├── src/main/java/com/himotech/laundryms/auditlog/
│   ├── aspect/AuditUserAspect.java       # (Existing/Enhanced) Injects context via SET LOCAL
│   ├── controller/AuditLogController.java
│   ├── service/AuditLogService.java
│   ├── repository/AuditLogRepository.java
│   └── dto/AuditLogResponse.java
└── src/main/resources/db/migration/
    └── V5__audit_system_standardization.sql  # Indexes, Triggers for Immutability & Redaction

frontend/
├── src/app/(dashboard)/audit-logs/
│   └── page.tsx                          # Admin Audit Log Viewer
├── src/components/audit-logs/
│   ├── AuditLogsTable.tsx                # Data Table with Filters
│   └── AuditDiffDrawer.tsx               # Shadcn Sheet for Master-Detail view
├── src/lib/api/audit.ts                  # Fetch client integration
└── src/lib/validation/audit.ts           # Zod schema
```

**Structure Decision**: Option 2 (Web application monorepo) was selected. The backend strictly follows the feature-package architecture (`auditlog/`), and the frontend adheres to the App Router layering rules with discrete API, validation, and component folders.
