# Implementation Plan: Reports Module

**Branch**: `main` | **Date**: 2026-07-05 | **Spec**: [spec.md](spec.md)

**Note**: This plan was reverse-engineered from existing source code via the `/speckit-brownfield-migrate` workflow.

## Summary

The Reports module is a read-only aggregation layer. Rather than building complex OLAP cubes, it leverages Spring Data JPA `@Query` annotations directly on the `PaymentRepository` to compute financial statistics dynamically.

## Technical Context

**Language/Version**: Java 21 (Backend) / TypeScript (Frontend)

**Primary Dependencies**: Spring Boot, Spring Data JPA, Next.js, Recharts (Frontend charts)

**Storage**: PostgreSQL

**Testing**: JUnit (Backend) / Vitest (Frontend - Gap identified)

**Target Platform**: Web Browser

## Project Structure

### Source Code

```text
backend/
├── src/main/java/com/himotech/laundryms/reports/
│   ├── controller/
│   ├── dto/
│   └── service/

frontend/
├── src/app/(dashboard)/reports/
├── src/components/features/reports/
└── src/lib/api/reports.ts
```

**Structure Decision**: This adheres to the Feature-First boundary mapping. Note that the backend `ReportService` deliberately cross-imports the `PaymentRepository` since it is purely an aggregation service over financial data.

## Complexity Tracking

| Mechanism | Why Needed | Alternative Rejected Because |
|-----------|------------|------------------------------|
| JPA `@Query` Aggregations | Real-time financial calculations | Pulling all Payment objects into JVM memory to aggregate via Streams would cause out-of-memory errors on large datasets. Letting PostgreSQL do the `SUM()` is the most efficient approach for MVP. |
