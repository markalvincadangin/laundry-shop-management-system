# Implementation Tasks: Offline-First Tunnel System Transition

**Branch**: `011-offline-first-standalone`
**Plan**: [plan.md](file:///home/markc/projects/web-dev/laundry-shop-management-system/specs/011-offline-first-standalone/plan.md)

## Phase 1: Backend Cleanup

- `[x]` Delete `backend/src/main/java/com/himotech/laundryms/sync/` directory.
- `[x]` Remove `OutboxService` dependency and `publishEvent` calls from `OrderService.java`.
- `[x]` Remove `OutboxService` dependency and `publishEvent` calls from `PaymentService.java`.
- `[x]` Remove `OutboxService` dependency and `publishEvent` calls from `CustomerService.java`.
- `[x]` Remove `outbox_events` table from `V1__init.sql`.

## Phase 2: Verification

- `[x]` Run `mvn clean test` to verify backend compiles and tests pass.
- `[x]` Run `npm run test` in frontend to ensure no breaking changes in UI.
