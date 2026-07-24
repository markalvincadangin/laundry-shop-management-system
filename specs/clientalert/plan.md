# Implementation Plan: Client Alerts Module

**Branch**: `main` | **Date**: 2026-07-05 | **Spec**: [spec.md](spec.md)

**Note**: This plan was reverse-engineered from existing source code via the `/speckit-brownfield-migrate` workflow.

## Summary

The Client Alerts module acts as the notification dispatch center. It listens to order lifecycle events and bridges the system to external SMS gateways via an adapter pattern.

## Technical Context

**Language/Version**: Java 21 (Backend) / TypeScript (Frontend)

**Primary Dependencies**: Spring Boot, Spring Data JPA, Next.js, Zod

**Storage**: PostgreSQL

**Testing**: JUnit, Testcontainers (Backend) / Vitest (Frontend - Gap identified)

**Target Platform**: Web Browser

## Project Structure

### Source Code

```text
backend/
├── src/main/java/com/himotech/laundryms/clientalert/
│   ├── api/ (Exception to standard dto/ location)
│   ├── controller/
│   ├── entity/
│   ├── repository/
│   └── service/

frontend/
├── src/app/(dashboard)/client-alerts/
├── src/components/features/client-alerts/
├── src/lib/api/client-alerts.ts
└── src/lib/validation/client-alerts.ts
```

**Structure Decision**: This adheres to the Feature-First boundary mapping. Note the recognized architectural exception documented in the Constitution: `clientalert/` uses `api/` for its DTOs rather than a `dto/` folder.

## Complexity Tracking

| Mechanism | Why Needed | Alternative Rejected Because |
|-----------|------------|------------------------------|
| Synchronous Dispatch | Triggers SMS during the same request that updates Order status | Async queuing (e.g. RabbitMQ) was rejected for MVP to keep infrastructure lightweight. The `try-catch` inside `ClientAlertService` prevents a failed SMS from rolling back the Order status change. |
