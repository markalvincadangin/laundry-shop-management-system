# Implementation Plan: Payments Module

**Branch**: `main` | **Date**: 2026-07-05 | **Spec**: [spec.md](spec.md)

**Note**: This plan was reverse-engineered from existing source code via the `/speckit-brownfield-migrate` workflow.

## Summary

The Payments module handles the financial ledger for completed laundry services. It enforces strict monetary constraints (preventing partial payments) and integrates tightly with the Audit Log aspect for void operations.

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
├── src/main/java/com/himotech/laundryms/payments/
│   ├── controller/
│   ├── dto/
│   ├── entity/
│   ├── mapper/
│   ├── repository/
│   └── service/

frontend/
├── src/app/(dashboard)/payments/
├── src/components/features/payments/
├── src/lib/api/payments.ts
└── src/lib/validation/payments.ts
```

**Structure Decision**: This adheres to the Feature-First boundary mapping required by the constitution.

## Complexity Tracking

| Mechanism | Why Needed | Alternative Rejected Because |
|-----------|------------|------------------------------|
| Payment Deletion on Void | We enforce a strict 1-to-1 unique database constraint between Orders and Payments. | Soft-deleting via an `is_void` flag would require removing the database-level unique constraint or modifying it to a partial index, which adds complexity. We delete the row and rely on the AuditLog aspect for history. |
