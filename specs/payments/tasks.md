# Tasks: Payments Module

**Input**: Design documents from `/specs/payments/`

**Note**: Reverse-engineered task execution status.

## Phase 1: Database & Foundation

- `[x]` T001 Create Flyway migration `V1__init.sql` for the `payments` table.
- `[x]` T002 Create Entity model `Payment.java`.
- `[x]` T003 Create `PaymentRepository` and JPA Specifications.

## Phase 2: Backend Business Logic

- `[x]` T004 Implement `PaymentService.create()` with strict equality checks on `amountPaid` vs `grandTotal`.
- `[x]` T005 Implement `PaymentService.voidPayment()` with record deletion logic.
- `[x]` T006 Ensure `@Auditable` aspects capture all financial modifications.
- `[x]` T007 Build `PaymentController` exposing REST endpoints.

## Phase 3: Frontend Implementation

- `[x]` T008 Define `payments.ts` Zod validation schemas for forms.
- `[x]` T009 Build `api-client` endpoints for payment operations.
- `[x]` T010 Create Payment List View UI components.
- `[x]` T011 Create Payment Modal for processing transactions from the Order table.

## ⚠️ Identified Gaps

1. **Frontend Tests Missing**: Like other modules, `frontend/src/tests/components/features/payments/` is missing. We lack component tests verifying that the GCASH reference number input field conditionally appears and validates properly.
