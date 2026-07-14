# Feature Specification: System Integrity Review

**Feature Branch**: `feature/system-integrity-review`

**Created**: 2026-07-08

**Status**: Draft

**Input**: User description: "a review of integrity, security, correctness and functionality of the system, it should not be on the 007-frontend-ui-polish, it should be a new spec"

## User Scenarios & Testing *(mandatory)*

## Clarifications
### Session 2026-07-08
- Q: When a large order is assigned to multiple machines, how should the system handle the state transition (e.g., WASHING -> DRYING)? → A: Unified tracking. The entire order transitions as a single unit. The machines are assigned to the order and locked until the entire order's state is advanced manually by staff, preventing granular mix-ups.

### User Story 1 - Secure Role-Based Access (Priority: P1)

As a System Administrator, I need the application to strictly enforce access roles on all backend endpoints so that staff members cannot access or modify sensitive administrative data or configurations.

**Why this priority**: Security is critical to prevent privilege escalation where STAFF users perform ADMIN actions.

**Independent Test**: Can be fully tested by attempting to access Customer, Order, and ClientAlert endpoints with a STAFF token and verifying that ADMIN-only endpoints return 403 Forbidden.

**Acceptance Scenarios**:

1. **Given** a STAFF user is authenticated, **When** they attempt to delete an Order or modify Customer records that require ADMIN, **Then** the system returns a 403 Forbidden error.
2. **Given** an ADMIN user is authenticated, **When** they perform the same action, **Then** the action succeeds.

---

### User Story 2 - Sanitize Optimistic UI Error Messages (Priority: P1)

As a User, I need the UI to display user-friendly error messages when things go wrong so that I am not confused by raw backend stack traces or internal system data.

**Why this priority**: Prevents information disclosure (security risk) and improves the professional feel of the application.

**Independent Test**: Can be fully tested by forcing a 500 Internal Server Error on the backend and verifying that the frontend `useOrders.ts` toast displays a generic fallback rather than the raw database exception.

**Acceptance Scenarios**:

1. **Given** the backend throws an unhandled 500 error with internal data, **When** the frontend receives the response, **Then** the UI toast displays a generic error message (e.g., from `UI_LABELS.feedback.error.GENERIC`).
2. **Given** the backend throws a 400 Client Error, **When** the frontend receives the response, **Then** the UI toast displays the safe client-facing message provided by the API.

---

### User Story 3 - Machine Malfunction and Downtime Tracking (Priority: P2)

As an Admin, I need to track the operational status of washing machines so that I can log downtime, prevent assigning orders to broken machines, and understand the impact of malfunctions on income.

**Why this priority**: Machine malfunctions are the #1 stated client stressor and a direct cause of lost income and mixed orders.

**Independent Test**: Can be fully tested by marking a Machine as "Out of Service" and verifying it cannot be selected for an active Order.

**Acceptance Scenarios**:

1. **Given** a washing machine is malfunctioning, **When** the Admin marks it as "Out of Service", **Then** the system records the downtime start and removes the machine from the active assignment pool.
2. **Given** an order is being moved to "Washing" status, **When** the staff selects a machine, **Then** only "Operational" machines are available to be chosen.

---



### Edge Cases

- **Machine breaks down *while* an order is actively assigned to it**: The system must allow staff to re-assign the order to an operational machine without altering the overall "Washing" or "Drying" status. This prevents order mix-ups (a critical pain point identified in the client interview) while ensuring the order completes.
- **Machine is marked "Out of Service" UX**: The UI will keep the broken machine visible in the assignment list so staff know it still exists, but it will be grayed out and unclickable with an "Out of Service" badge.
- **Concurrent Machine Assignment**: If two staff members attempt to assign different orders to the same machine simultaneously, the system must perform conflict validation. The second request will fail with a "Machine is no longer available" error, and the UI will automatically refresh the machine list.
- **Machine Management Authorization**: Only ADMIN users can modify machine statuses (e.g. marking "Out of Service"). If a machine breaks down, STAFF must notify an ADMIN to update the system. STAFF can only assign or re-assign orders to operational machines.
- **Machine Boundaries**: The system enforces a maximum of 50 total machines per shop to prevent UI and database bloat. An individual order can be assigned to a maximum of 10 machines at once (to accommodate massive commercial loads without overflowing the UI).
- **Power Interruptions**: (Out of Scope for v1). Without IoT hardware integration, automated power interruption timers are not feasible. Staff will manually use the pause/resume functionality if necessary.
- How does the system behave in production if Flyway seed placeholders are missing? (Handled by TASK-SEC-004 fix).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST enforce `@PreAuthorize` role checks on all `CustomerController` and `ClientAlertController` endpoints, and add missing checks to the `OrderController` methods (create, update, read). `⚠️ No Linked Test`
- **FR-002**: System MUST catch and sanitize 500 Internal Server Error payloads in the frontend `react-query` hooks before displaying toasts. `⚠️ No Linked Test`
- **FR-003**: System MUST provide dummy Flyway placeholders (`seed_environment: prod`) in `application-prod.yml` to prevent startup crashes. `⚠️ No Linked Test`
- **FR-004**: System MUST allow Admins to define physical `Machine` entities (Name/Number, Status: Operational, Out of Service). `⚠️ No Linked Test`
- **FR-005**: System MUST allow Staff to link an `Order` to one or more `Machine` entities while in the Washing or Drying state, utilizing a join table to support massive loads spanning multiple machines. `⚠️ No Linked Test`
- **FR-006**: System MUST use a soft-delete approach (`is_active` boolean flag) when Admins retire a `Machine`, ensuring historical `Order` records are preserved and never orphaned. `⚠️ No Linked Test`
- **FR-007**: System MUST allow Staff to re-assign an active Order from a broken machine to a new operational machine without resetting the Order's progress status, preventing mix-ups during machine transfers. `⚠️ No Linked Test`
- **FR-008**: System MUST display "Out of Service" machines in the assignment UI as grayed-out and disabled with an explicit badge, preventing assignment while maintaining physical inventory visibility. `⚠️ No Linked Test`
- **FR-009**: System MUST enforce conflict validation during machine assignment, returning an appropriate error code (e.g., 409 Conflict) if a machine is already assigned to another active order, and the UI MUST refresh the machine availability list automatically upon this error. `⚠️ No Linked Test`
- **FR-010**: System MUST enforce `@PreAuthorize("hasRole('ADMIN')")` on all Machine management endpoints (Create, Update, Delete, Status Change). Staff members MUST only have read-access (`GET`) to the machine inventory for assignment purposes. `⚠️ No Linked Test`
- **FR-011**: System MUST enforce a maximum creation limit of 50 machines, and a maximum assignment limit of 10 machines per order. The UI MUST disable the "Add Machine" button or show validation errors when these limits are reached. `⚠️ No Linked Test`


### Key Entities

- **Machine**: Represents a physical washing or drying machine. Attributes: `id`, `name` (e.g., "Washer 1"), `status` (OPERATIONAL, MAINTENANCE, BROKEN), and `is_active` (boolean for soft-deletion).
- **Order (Updated)**: Needs a many-to-many relationship mapping to `Machine` (e.g., `order_machines` join table) and a boolean/derived `isRush` flag.

### Database Migrations
- **Flyway Target**: `V5__add_machines_table.sql`
- **Schema Changes**: Add `machines` table. Add `machine_id` to `orders` table.

### API Contracts
- **Endpoints Needed**: `GET /api/v1/machines`, `POST /api/v1/machines`, `PATCH /api/v1/machines/{id}/status`. Update `Order` endpoints to accept/return `machineId`.
- **Security**: Admin for Machine creation/management. Staff for Machine assignment.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of REST API endpoints enforce role-based access control verified via integration tests.
- **SC-002**: 0% of internal server error traces are rendered in the frontend UI.
- **SC-003**: Production profile boots successfully without Flyway placeholder resolution errors.
- **SC-004**: Staff can successfully map 100% of active "Washing" orders to a specific physical machine.


## Assumptions

- We assume standard "Rush" service rates are already configured in the database by the Admin, so we only need to flag them visually based on the selected rate.

## Brainstorm Log

### Session 2026-07-08 (speckit.superspec.brainstorm)
- **Data Integrity / Edge Case**: Resolved the machine deletion policy. Opted for **Soft Deletion** (`is_active` boolean) to ensure historical order assignments are never orphaned if a physical machine is sold or broken beyond repair.
- **Scale / Operations**: Resolved the massive load assignment problem. Opted for **Multi-Machine Assignment** (many-to-many join table) rather than a single `machine_id`, allowing staff to accurately reflect reality when a 50kg load is split across three 20kg washers simultaneously.
- **Power Interruptions**: Reaffirmed that automated power interruption timers are out of scope for v1 without IoT hardware integration. Staff will manually use the pause/resume functionality if necessary.
- **Error Scenarios**: Handled mid-cycle breakdowns. Active orders must be re-assignable without resetting their main progress status, ensuring no mix-ups.
- **User Experience**: Out of Service machines will be grayed-out but visible in lists, keeping staff aware of the physical inventory state.
- **Scale & Concurrency**: Implemented optimistic locking / conflict validation to prevent double-booking machines simultaneously.
- **Security & Privacy**: Restricted full machine management exclusively to ADMINs. STAFF are restricted to read-only views for assignment.
- **Boundary Conditions**: Capped machine creation at 50, and per-order machine assignments at 10 to prevent bloated UI state and abuse.

### Session 2026-07-09 (speckit.superspec.brainstorm)
- **Service Types & Pricing (Baseline Alignment)**: Resolved the contradiction between the client interview ("Standard rate applies to all items") and the DB seed (`Rush Wash`, `Blankets`). Decided to retain the `ServiceRate` system capability for extensibility but strictly seed and use ONLY `Standard Wash` (₱140) for now. (UPDATED: User chose Option B to keep the multiple rates as a template for future customization).
- **Boundary Conditions (Service Rates)**: Decided to enforce a backend constraint preventing the deactivation of the last remaining active service rate to ensure order intake never breaks.
- **Power Interruptions (E002)**: Decided on a shop-wide "System Pause" global flag. When active, it displays a red banner and prevents moving orders to WASHING or DRYING (blocking machine usage), but allows staff to continue accepting new drop-offs. The downtime duration will be logged for Admin reports. No complex countdown timers will be added.
- **Comparative Analytics (E004)**: Decided on Backend Delta Calculation. The `ReportService` will compute the percentage change against the previous period and return it in the DTO for the frontend.

### Session 2026-07-10 (speckit.superspec.brainstorm)
- **Machine Assignment (Sequential vs Parallel)**: Clarified that the UI will allow both parallel and sequential machine assignments. For sequential processing (e.g. 3 loads assigned to 1 machine), the system will use a **Simple Status** approach. The order remains in the `WASHING` state until staff manually completes all loads and transitions it to `DRYING`. No granular load-by-load tracking is required for MVP.
