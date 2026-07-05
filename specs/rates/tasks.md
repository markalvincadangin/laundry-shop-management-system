# Tasks: Service Rates Module

**Input**: Design documents from `/specs/rates/`

**Note**: Reverse-engineered task execution status.

## Phase 1: Database & Foundation

- `[x]` T001 Create Flyway migration `V3__service_rates.sql` for the `service_rates` table and seed data.
- `[x]` T002 Create Entity model `ServiceRate.java`.
- `[x]` T003 Create `ServiceRateRepository`.

## Phase 2: Backend Business Logic

- `[x]` T004 Implement `ServiceRateService.getActiveRate()` and fallback logic.
- `[x]` T005 Implement Spring Cache annotations (`@Cacheable`, `@CacheEvict(allEntries=true)`) to protect DB from order-read spam.
- `[x]` T006 Ensure `@Auditable` aspects capture all pricing modifications.
- `[x]` T007 Build `ServiceRateController` exposing REST endpoints.

## Phase 3: Frontend Implementation

- `[x]` T008 Define `rates.ts` Zod validation schemas for forms.
- `[x]` T009 Build `api-client` endpoints for rate operations.
- `[x]` T010 Create Rate Management View UI components.
- `[x]` T011 Create Rate Edit Modal for Admins to adjust active pricing constraints.

## ⚠️ Identified Gaps

1. **Frontend Tests Missing**: Like other modules, `frontend/src/tests/components/features/rates/` is missing. Component testing should be added to ensure the pricing bounds are safely validated before submitting to the backend.
