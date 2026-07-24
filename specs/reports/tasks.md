# Tasks: Reports Module

**Input**: Design documents from `/specs/reports/`

**Note**: Reverse-engineered task execution status.

## Phase 1: Database & Foundation

- `[x]` T001 *(N/A - Relies on `payments` table)*
- `[x]` T002 Add `@Query` aggregations to `PaymentRepository` (e.g., `sumAmountPaidByPaymentDateBetween`, `getSalesTrend`).

## Phase 2: Backend Business Logic

- `[x]` T003 Implement `ReportService` mapping JPA outputs to Response DTOs.
- `[x]` T004 Implement specific aggregations (Daily, Monthly, Yearly).
- `[x]` T005 Build `ReportController` exposing REST endpoints.

## Phase 3: Frontend Implementation

- `[x]` T006 Build `api-client` endpoints for fetching report statistics.
- `[x]` T007 Create Analytics Dashboard view integrating Recharts for trend visualization.
- `[x]` T008 Implement Date Pickers to filter report timeframes dynamically.

## ⚠️ Identified Gaps

1. **Frontend Tests Missing**: `frontend/src/tests/components/features/reports/` is missing. We lack rendering tests for the Recharts implementation to ensure it degrades gracefully if no data is present.
