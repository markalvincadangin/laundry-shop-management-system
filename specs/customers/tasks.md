# Tasks: Customers Module

**Input**: Design documents from `/specs/customers/`

**Note**: Reverse-engineered task execution status.

## Phase 1: Database & Foundation

- `[x]` T001 Create Flyway migration `V1__init.sql` for the `customers` table.
- `[x]` T002 Create Entity model `Customer.java`.
- `[x]` T003 Create `CustomerRepository` with composite existence checks and JPA Specifications.

## Phase 2: Backend Business Logic

- `[x]` T004 Implement `CustomerService.create()` with duplicate identity prevention.
- `[x]` T005 Implement `CustomerService.search()` with dynamic pagination.
- `[x]` T006 Implement Spring Cache annotations (`@Cacheable`, `@CacheEvict`) on service methods.
- `[x]` T007 Build `CustomerController` exposing REST endpoints.

## Phase 3: Frontend Implementation

- `[x]` T008 Define `customers.ts` Zod validation schemas for forms.
- `[x]` T009 Build `api-client` endpoints for customer operations.
- `[x]` T010 Create Customer List View UI components.
- `[x]` T011 Create Customer Details / Edit Modal components.

## ⚠️ Identified Gaps

1. **Frontend Tests Missing**: Similar to the orders module, there is a lack of component testing in `frontend/src/tests/components/features/customers/`. Vitest coverage for forms should be prioritized to prevent validation regressions.
