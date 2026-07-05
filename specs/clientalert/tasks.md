# Tasks: Client Alerts Module

**Input**: Design documents from `/specs/clientalert/`

**Note**: Reverse-engineered task execution status.

## Phase 1: Database & Foundation

- `[x]` T001 Create Flyway migration `V4__client_alerts.sql` for the `client_alerts` table.
- `[x]` T002 Create Entity model `ClientAlert.java` tracking status and read state.
- `[x]` T003 Create `ClientAlertRepository` with Specifications.

## Phase 2: Backend Business Logic

- `[x]` T004 Implement `SmsAdapter` interface for external delivery.
- `[x]` T005 Implement `ClientAlertService.createForReadyForPickup()` with isolated try/catch boundary.
- `[x]` T006 Implement paginated search and mark-as-read toggles.
- `[x]` T007 Build `ClientAlertController` exposing REST endpoints.

## Phase 3: Frontend Implementation

- `[x]` T008 Define `client-alerts.ts` Zod validation schemas for list parameters.
- `[x]` T009 Build `api-client` endpoints for alert fetching.
- `[x]` T010 Create Client Alert List/Table UI components.
- `[x]` T011 Create header notification bell or badge to display unread alert counts.

## ⚠️ Identified Gaps

1. **Synchronous Coupling**: The SMS dispatch happens synchronously in the request thread. If the external provider is slow, the staff member's UI will hang when changing an order to `READY_FOR_PICKUP`.
2. **Frontend Tests Missing**: `frontend/src/tests/components/features/client-alerts/` is missing. Component testing should be added.
