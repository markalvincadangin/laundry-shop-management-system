# Code Review: System Integrity Review (Phase 10 / BUG-001)

## Spec Compliance & Brainstorm Edge Cases
- **[Pass] Multiple Machine Assignment (FR-005, FR-012)**: The backend now correctly leverages the `order_machines` join table through the `@ManyToMany` mapping on `Order`.
- **[Pass] Maximum Limit Validation**: The `OrderStatusService` correctly caps machine selection to the minimum of `10` or `order.getTotalLoads()`.
- **[Pass] Conflict Validation**: The `OrderRepository.countConflictingMachines()` efficiently prevents double-booking active WASHING/DRYING machines.
- **[Pass] Parallel vs Sequential UX**: `MachineAssignmentModal.tsx` dynamically surfaces the Parallel or Sequential workflow intent based on the selected count compared to `totalLoads`.

## Constitution Compliance
- **[Pass] I. Feature-First Backend**: `MachineRepository` was cleanly injected into `OrderStatusService` without violating domain boundaries (services can cross-communicate or inject cross-repositories as needed).
- **[Pass] III. Polyglot Sync**: Frontend `OrderResponse` and backend DTOs were properly updated to pass `machineIds` seamlessly.

## Code Quality & Security
- **[Pass] Defensive Checks**: Null and size checks for `machineIds` are robust in `OrderStatusService.java` before fetching from the repository.
- **[Pass] Data Integrity**: State transitions (e.g. `READY_FOR_PICKUP`) correctly clear active machine assignments to free them back into the operational pool.

## Test Coverage
- **[Pass] Multiple Machine Assignment Validation**: Added unit test `updateStatusShouldrejectWhenmachineassignmenthasconflict` in `OrderStatusServiceTest.java` that mocks `countConflictingMachines > 0` to successfully assert `IllegalStateException` is thrown, covering the critical business rule for Machine Assignment Conflict.
