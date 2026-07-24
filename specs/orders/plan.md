# Implementation Plan: Orders Module

**Branch**: `main` | **Date**: 2026-07-05 | **Spec**: [spec.md](spec.md)

**Note**: This plan was reverse-engineered from existing source code via the `/speckit-brownfield-migrate` workflow.

## Summary

The Orders module serves as the primary transaction engine for the Laundry Management System. It implements live pricing, secure snapshotting of rates, and role-based operational updates.

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
├── src/main/java/com/himotech/laundryms/orders/
│   ├── controller/
│   ├── dto/
│   ├── entity/
│   ├── mapper/
│   ├── repository/
│   └── service/
└── src/test/java/com/himotech/laundryms/orders/

frontend/
├── src/app/(dashboard)/orders/
├── src/components/features/orders/
├── src/lib/api/orders.ts
└── src/lib/validation/orders.ts
```

**Structure Decision**: This matches the strict Frontend + Backend monorepo layout detailed in the project constitution (Option 2).

## Complexity Tracking

| Violation | Why Needed | Alternative Rejected Because |
|-----------|------------|------------------------------|
| Cross-feature coupling | Orders service creates Customers inline if they don't exist | Separating customer creation into a distinct API call degraded the UX Doherty Threshold. Approved as a monolith exception. |
