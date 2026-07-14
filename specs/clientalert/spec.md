# Feature Specification: Client Alerts Module

**Feature Branch**: `main` (Legacy)

**Created**: 2026-07-05

**Status**: Migrated

**Input**: Reverse-engineered from existing source code.

## User Scenarios & Testing

### User Story 1 - Automated Pickup Notifications (Priority: P1)
Customers must be notified via SMS the moment their laundry is finished processing so they know it is ready to be claimed.

**Acceptance Scenarios**:
1. **Given** an order in the `DRYING` or `FOLDING` state, **When** staff updates the status to `READY_FOR_PICKUP`, **Then** the backend automatically queues and dispatches an SMS message formatted with the customer's name, reference number, and grand total.
2. **Given** a network failure during SMS dispatch, **When** the `SmsAdapter` throws an exception, **Then** the alert record is saved with a `FAILED` status for future auditing.

### User Story 2 - Alert Registry Management (Priority: P2)
Staff members must be able to view a history of all sent alerts and mark them as read to clear their notification dashboards.

**Acceptance Scenarios**:
1. **Given** unread alerts, **When** staff clicks "Mark All as Read", **Then** the system updates all `isRead=false` records to `true`.

## Requirements 

### Functional Requirements

- **FR-001**: System MUST support dynamic message templating via application properties (`${app.sms.template}`).
- **FR-002**: System MUST transition alert records through `PENDING` -> `SENT` or `FAILED` based on the synchronous `SmsAdapter` result.
- **FR-003**: System MUST provide paginated search and filtering by alert status (`SENT`, `FAILED`) and date range.
- **FR-004**: System MUST allow individual or bulk "mark as read" operations.

### Key Entities

- **ClientAlert**: A record of a communication attempt to a customer, linked to a specific Order.

### Database Migrations
- **Flyway Target**: `V4__client_alerts.sql`
- **Schema Changes**: `client_alerts` table established.

### API Contracts
- **Endpoints Needed**: `GET /api/v1/client-alerts`, `PATCH /api/v1/client-alerts/{id}/read`, `POST /api/v1/client-alerts/read-all`
- **Security**: Authenticated Staff and Admin roles.

## Success Criteria

### Measurable Outcomes
- **SC-001**: 100% of `READY_FOR_PICKUP` transitions successfully trigger an alert record creation, even if SMS delivery ultimately fails.
