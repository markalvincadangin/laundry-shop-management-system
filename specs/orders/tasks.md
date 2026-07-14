# Tasks: Orders Module

**Input**: Design documents from `/specs/orders/`

**Note**: Reverse-engineered task execution status.

## Phase 1: Database & Foundation

- `[x]` T001 Create Flyway migration `V1__init.sql` for orders and order_add_ons tables.
- `[x]` T002 Create Entity models `Order.java` and `OrderAddOn.java`.
- `[x]` T003 Create `OrderRepository` and JPA Specifications.

## Phase 2: Backend Business Logic

- `[x]` T004 Implement `OrderService.createFromRequest()` and inline customer creation.
- `[x]` T005 Implement `OrderService.preview()` for stateless price calculations.
- `[x]` T006 Implement role-based restrictions in `OrderService.update()`.
- `[x]` T007 Build `OrderController` exposing REST endpoints.
- `[x]` T008 **Integration Tests**: `backend/src/test/java/com/himotech/laundryms/orders/` (JUnit & Testcontainers).

## Phase 3: Frontend Implementation

- `[x]` T009 Define `orders.ts` Zod validation schemas.
- `[x]` T010 Build `api-client` endpoints for orders.
- `[x]` T011 Create `IntakeWizard.tsx` for multi-step order creation.
- `[x]` T012 Create `OrderPreview.tsx` to handle live pricing feedback.
- `[x]` T013 Create `OrderStatusTimeline.tsx` for visual tracking.

## ⚠️ Identified Gaps

1. **Frontend Tests Missing**: No component tests found in `frontend/src/tests/components/features/orders/`. Vitest coverage for `IntakeWizard.tsx` is highly recommended since it houses complex state.
