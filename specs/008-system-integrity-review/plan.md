# Implementation Plan: System Integrity Review

**Branch**: `008-system-integrity-review` | **Date**: 2026-07-08 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `specs/008-system-integrity-review/spec.md`

## Summary

Integrate the Multi-Machine Management system into the core workflow, preventing multiple active orders from occupying the same machine concurrently, securing Machine endpoints, and adding the feature to the frontend UI navigation and Order Pipeline.

## Technical Context

**Language/Version**: Java 21 (Backend), TypeScript 5.x (Frontend)
**Primary Dependencies**: Spring Boot 3.x, React (Next.js App Router), React Query
**Storage**: PostgreSQL (via Spring Data JPA)
**Testing**: JUnit, Testcontainers, Vitest
**Target Platform**: Web Browser (Desktop/Mobile)
**Project Type**: Monolith Full-Stack Application
**Performance Goals**: Instant UI feedback (Doherty Threshold) on machine assignment via optimistic UI.
**Constraints**: Controllers must be thin; strictly enforce Feature-First structure.

## Constitution Check

*GATE: Must pass before proceeding. Re-check after design phase.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Feature-First Backend | PASS | Modifying existing `orders` and `machines` feature packages without breaking domain isolation. |
| II. Frontend Layering | PASS | Adding UI components into `components/features/machines/` and modifying `dashboard`. |
| III. Polyglot Sync | PASS | Backend `UpdateOrderStatusRequest` changes will mirror into frontend types. |
| IV. UX Standards | PASS | Opting for optimistic UI updates in `MachineAssignmentModal` to hit Doherty threshold. |
| V. Containerized Dev | PASS | Docker environment will be used for testing. |

## Project Structure

### Documentation (this feature)

```text
specs/008-system-integrity-review/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Concurrency and UX research decisions
├── data-model.md        # Data model for Machine assignment
└── quickstart.md        # How to validate the fix
```

### Source Code (repository root)

```text
backend/src/main/java/com/himotech/laundryms/
├── machines/api/MachineController.java
├── machines/service/MachineService.java
├── orders/dto/UpdateOrderStatusRequest.java
└── orders/service/OrderStatusService.java

frontend/src/
├── config/navigation.ts
├── components/features/machines/MachineAssignmentModal.tsx
├── components/features/dashboard/OrderPipeline.tsx
└── components/features/dashboard/OrderCard.tsx
```

**Structure Decision**: We are hooking the machine assignment into the existing `UpdateOrderStatusRequest` when transitioning to `WASHING` or `DRYING` rather than creating a separate endpoint, keeping state transitions atomic.

## Execution Strategy

### TDD Requirements
- [x] `OrderStatusService`: Strict TDD needed for concurrency validation (testing that 409 Conflict is thrown if a machine is already in use by another active order).

### Parallel Execution Opportunities
- N/A - Implementation is sequential due to tight full-stack coupling.

### Human Checkpoints
1. After backend validation is implemented and tested.
2. Before merging to `develop`.

### Review Gates
- [x] `OrderStatusService.java`: Review concurrency locking logic before frontend integration.

## Resolved Integrity Flaws (Phase 2 Additions)

### Flaw 1: Power Interruptions (E002) - System Pause
- **Backend**: Create a single-row `SystemSettings` entity with `is_system_paused` flag.
- **Backend**: Expose `GET /api/v1/settings` and `PATCH /api/v1/settings/pause`.
- **Backend**: `OrderStatusService` throws 409 Conflict if attempting to transition to `WASHING` or `DRYING` while paused.
- **Backend**: Log downtime durations in `audit_logs`.
- **Frontend**: `OrderCard` disables `WASHING` and `DRYING` transition buttons when paused. Add a global red banner across the Dashboard.

### Flaw 2: Comparative Analytics (E004)
- **Backend**: `ReportResponse` updated with `revenueDelta` and `ordersDelta`.
- **Backend**: `ReportService` computes period-over-period percentage changes.
- **Frontend**: Display green/red delta indicators in `ReportDashboard`.

### Flaw 3: Service Types & Pricing
- **Backend**: `ServiceRateService` updated to prevent deactivating the last remaining active service rate.

### Flaw 4: Missing Machine Assignment Backend (BUG-001)
- **Backend**: Update `Order` entity with `@ManyToMany` to `Machine`.
- **Backend**: Update `UpdateOrderStatusRequest` to accept `machineIds`.
- **Backend**: `OrderStatusService` persists machine assignments and validates constraints (`1 <= size <= totalLoads`).
- **Frontend**: `MachineAssignmentModal` updated to display Parallel vs Sequential execution modes based on `selectedIds.length` vs `totalLoads`.
