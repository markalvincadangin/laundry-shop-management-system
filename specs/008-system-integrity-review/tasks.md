---
description: "Task list template for feature implementation"
---

# Tasks: System Integrity Review

**Input**: Design documents from `.specify/specs/008-system-integrity-review/`
**Prerequisites**: plan.md (required), spec.md (required for user stories)

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Ensure `seed_environment: prod` placeholder is in `application-prod.yml` to prevent startup crashes.

**Execution notes**: No special discipline required. Verify project builds before proceeding.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story

**CRITICAL**: No user story work can begin until this phase is complete.

- [x] T002 [TDD] Add Flyway migration script `V5__add_machines_table.sql` and update DB schema
- [x] T003 [P] Update `Order` entity to include `machines` (Many-to-Many) in `backend/src/main/java/com/himotech/laundryms/orders/entity/Order.java`

**Checkpoint**: Foundation ready. Get human approval before starting user stories.

---

## Phase 3: User Story 1 - Secure Role-Based Access (Priority: P1) MVP

**Goal**: System strictly enforces access roles on all backend endpoints.
**Independent Test**: Hit `CustomerController` endpoints with STAFF token and ensure 403 Forbidden.

### Implementation for User Story 1

- [x] T004 [P] [US1] Add `@PreAuthorize` to `CustomerController` endpoints
- [x] T005 [P] [US1] Add `@PreAuthorize` to `ClientAlertController` endpoints
- [x] T006 [P] [US1] Add `@PreAuthorize` to `OrderController` endpoints where missing
- [x] T007 [P] [REVIEW] [US1] Enforce `@PreAuthorize("hasRole('ADMIN')")` on `MachineController` management endpoints (Create, Update, Delete)

**Checkpoint**: User Story 1 fully functional and testable. Get human approval.

---

## Phase 4: User Story 2 - Sanitize Optimistic UI Error Messages (Priority: P1)

**Goal**: UI displays user-friendly error messages when things go wrong instead of raw stack traces.
**Independent Test**: Force a 500 error and verify toast displays a generic fallback.

### Implementation for User Story 2

- [x] T008 [P] [US2] Update `useOrders.ts` and `OrderPipeline.tsx` to sanitize 500 error messages from backend
- [x] T009 [US2] Verify `GlobalExceptionHandler.java` in backend correctly handles and sanitizes 500 Internal Server Errors

**Checkpoint**: User Stories 1 AND 2 both work independently. Get human approval.

---

## Phase 5: User Story 3 - Machine Malfunction and Downtime Tracking (Priority: P2)

**Goal**: Admins can track machine operational status and assign machines securely without conflict.
**Independent Test**: Verify conflict validation prevents double-booking a machine, and max limits (50 total, 10 per order) are enforced.

### Implementation for User Story 3

- [x] T010 [P] [TDD] [US3] Implement conflict validation in `OrderStatusService.java` for machine assignment
- [x] T011 [P] [US3] Add 50-machine max limit in `MachineService.java`
- [x] T012 [P] [US3] Add 10-machine per order limit in `OrderService.java`
- [x] T013 [P] [US3] Implement `is_active` soft-delete logic in `MachineService.java` — override delete to set `is_active = false` and filter `findAll` to active machines only in `backend/src/main/java/com/himotech/laundryms/machines/service/MachineService.java`
- [x] T014 [P] [SUBAGENT] [US3] Create `/machines` route in frontend `src/app/(dashboard)/machines/page.tsx`
- [x] T015 [P] [SUBAGENT] [US3] Add Machines link to `frontend/src/config/navigation.ts`
- [x] T016 [SUBAGENT] [US3] Create `MachineAssignmentModal.tsx` in `frontend/src/components/features/machines/MachineAssignmentModal.tsx`
- [x] T016a [P] [US3] Update Zod schema in `frontend/src/lib/validation/order.ts` to include `machineIds` field matching the updated `UpdateOrderStatusRequest` backend DTO
- [x] T017 [SUBAGENT] [US3] Integrate `MachineAssignmentModal` into `OrderPipeline.tsx` to intercept WASHING/DRYING transitions in `frontend/src/components/features/dashboard/OrderPipeline.tsx`
- [x] T018 [P] [SUBAGENT] [US3] Update `OrderCard.tsx` to display assigned machines list in `frontend/src/components/features/dashboard/OrderCard.tsx`
- [x] T019 [P] [SUBAGENT] [US3] Add Rush Order visual badge to `OrderCard.tsx` so rush orders are clearly distinguished in the queue in `frontend/src/components/features/dashboard/OrderCard.tsx`
- [x] T020 [SUBAGENT] [REVIEW] [US3] Final integration test: verify machine assignment, soft-delete, rush badge, and conflict validation all work end-to-end

**Checkpoint**: User Story 3 fully functional and testable.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T021 Run backend tests to verify role-based access control and soft-delete logic
- [x] T022 Verify frontend functionality manually via browser (machine assignment, rush badges, error messages)
- [x] T023 Review and polish UI/UX for the new Machine assignment workflow
- [x] T024 Mark power interruption edge case as Out of Scope in `specs/008-system-integrity-review/spec.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational completion
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### Parallel Opportunities

- All tasks marked [P] within the same phase can run in parallel
- Adding `@PreAuthorize` across different controllers (T004-T007) can be done in parallel.
- Setting up the frontend UI (T013-T017) can be done independently from the backend logic limits (T010-T012).

---

## Phase 7: Convergence

- [x] T025 Update `MachineAssignmentModal.tsx` to display Out of Service machines as grayed-out and disabled instead of hiding them per FR-008 (partial)
- [x] T026 Update `OrderStatusService.java` to allow updating an order with the same status to facilitate machine transfers per FR-007 (contradicts)
- [x] T027 Update `useOrders.ts` error handler to invalidate the `machines` query to auto-refresh UI on conflict per FR-009 (missing)

---

## Phase 8: Flaws 1, 2, and 3 Implementation (Integrity Review Phase 2)

**Purpose**: Execute the newly approved System Pause, Analytics, and Extensibility guardrails.

- [x] T028 [P] [TDD] Create `SystemSettings` entity, repository, and controller with `is_system_paused` flag.
- [x] T029 [P] [TDD] Update `audit_logs` logic to capture System Pause events.
- [x] T030 [P] [TDD] Update `OrderStatusService.java` to block `WASHING` and `DRYING` transitions when system is paused (throw 409).
- [x] T031 [P] [SUBAGENT] Update `OrderCard.tsx` to disable transition buttons and add a global red banner when paused.
- [x] T032 [P] Update `ReportResponse.java` to include `revenueDelta` and `ordersDelta`.
- [x] T033 [P] [TDD] Update `ReportService.java` to calculate period-over-period percentage changes.
- [x] T034 [P] [SUBAGENT] Update `ReportDashboard.tsx` to display the green/red delta indicators.
- [x] T035 [P] [TDD] [REVIEW] Update `ServiceRateService.java` to prevent deactivating the last remaining active service rate.

## Phase 9: Review Remediation (Added 2026-07-10)

**Purpose**: Fix critical authorization and test coverage gaps found during superspec review.

- [x] T036 [P] Add missing `@PreAuthorize` annotations to `CustomerController` and `OrderController`.
- [x] T037 [P] Create `MachineControllerTest.java` to verify RBAC constraints.
- [x] T038 [P] Create `MachineServiceTest.java` to verify 50-machine limit and soft-delete logic.
- [x] T039 [P] Update `MachineService` and `MachineRepository` to properly implement soft-delete for machines instead of hard-delete.
- [x] T040 [P] Update `GlobalExceptionHandler` to translate `AccessDeniedException` to 403 FORBIDDEN.

---

## Phase 10: Bugfix Patch (BUG-001)

**Purpose**: Implement the missing backend Machine Assignment logic and enforce load constraints.

- [x] T041 Add `@ManyToMany` mapping between `Order` and `Machine` entity.
- [x] T042 Update `UpdateOrderStatusRequest` DTO to accept `Set<Long> machineIds`.
- [x] T043 Update `OrderStatusService.java` to persist machine assignments and validate constraints (`1 <= size <= totalLoads`).
- [x] T044 Update `OrderMapper` to map `assignedMachines` back to `machineIds` in `OrderResponse`.
- [x] T045 Update `MachineAssignmentModal.tsx` in frontend to dynamically display Parallel vs Sequential execution text based on `selectedIds.length` vs `totalLoads`.
