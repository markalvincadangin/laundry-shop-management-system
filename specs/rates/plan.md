# Implementation Plan: Service Rates Module

**Branch**: `main` | **Date**: 2026-07-05 | **Spec**: [spec.md](spec.md)

**Note**: This plan was reverse-engineered from existing source code via the `/speckit-brownfield-migrate` workflow.

## Summary

The Service Rates module acts as the global configuration engine for pricing. Because pricing values are heavily read during order processing, the module is wrapped in aggressive caching strategies that clear entirely on write operations.

## Technical Context

**Language/Version**: Java 21 (Backend) / TypeScript (Frontend)

**Primary Dependencies**: Spring Boot, Spring Data JPA, Spring Cache, Next.js, Zod

**Storage**: PostgreSQL

**Testing**: JUnit, Testcontainers (Backend) / Vitest (Frontend - Gap identified)

**Target Platform**: Web Browser

## Project Structure

### Source Code

```text
backend/
├── src/main/java/com/himotech/laundryms/rates/
│   ├── controller/
│   ├── dto/
│   ├── entity/
│   ├── mapper/
│   ├── repository/
│   └── service/

frontend/
├── src/app/(dashboard)/rates/
├── src/components/features/rates/
├── src/lib/api/rates.ts
└── src/lib/validation/rates.ts
```

**Structure Decision**: Compliant with Feature-First architecture boundaries.

## Complexity Tracking

| Mechanism | Why Needed | Alternative Rejected Because |
|-----------|------------|------------------------------|
| Global Cache Eviction | A rate update affects global pricing immediately | Evicting single cache keys is complex since rates can be queried by `id`, `name`, or `activeOnly` status. `allEntries = true` ensures zero chance of stale cache during price updates. |
