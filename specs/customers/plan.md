# Implementation Plan: Customers Module

**Branch**: `main` | **Date**: 2026-07-05 | **Spec**: [spec.md](spec.md)

**Note**: This plan was reverse-engineered from existing source code via the `/speckit-brownfield-migrate` workflow.

## Summary

The Customers module manages the client profiles for the Laundry Management System. It relies heavily on Spring Cache abstraction to deliver fast lookups for order intake workflows.

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
├── src/main/java/com/himotech/laundryms/customers/
│   ├── controller/
│   ├── dto/
│   ├── entity/
│   ├── mapper/
│   ├── repository/
│   └── service/

frontend/
├── src/app/(dashboard)/customers/
├── src/components/features/customers/
├── src/lib/api/customers.ts
└── src/lib/validation/customers.ts
```

**Structure Decision**: This adheres to the Feature-First boundary mapping required by the constitution.

## Complexity Tracking

| Mechanism | Why Needed | Alternative Rejected Because |
|-----------|------------|------------------------------|
| Caching   | Order creation requires frequent customer lookups by ID | Direct DB queries for every order intake form keystroke would cause unnecessary database load. Implemented `@Cacheable` and `@CacheEvict`. |
