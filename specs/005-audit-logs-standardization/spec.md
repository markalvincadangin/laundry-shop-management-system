# Feature Specification: Audit Logs Standardization

**Feature Branch**: `[005-audit-logs-standardization]`

**Created**: 2026-07-05

**Status**: Draft

**Input**: User description: "test, correct, standardize and polish the audit logs"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - System Identification Consistency (Priority: P1)

As a system administrator, I want unauthenticated automated actions (e.g., scheduled tasks or system-level updates) to be clearly logged as "System" in the Audit Logs, so that I don't see opaque "Unknown" tags.

**Why this priority**: Correctly attributing system actions ensures forensic integrity and removes confusion caused by null or empty user identities triggering parser failures.

**Independent Test**: Can be fully tested by triggering an unauthenticated database action and verifying the frontend displays "System" as the Operator.

**Acceptance Scenarios**:

1. **Given** an unauthenticated system process modifies data, **When** the audit trigger fires, **Then** the `user_id` should default to `SYSTEM`.
2. **Given** an audit log with actor `anonymousUser`, **When** the frontend fetches the audit log, **Then** it should map to "System" and format cleanly.

---

### User Story 2 - User Identification Cleanliness (Priority: P2)

As a system administrator, I want authenticated user actions to display clean usernames (e.g., "admin") rather than internal system string representations (e.g., "username=admin..."), so that the interface is professional and readable.

**Why this priority**: Removing legacy regex parsing and unpolished string formats improves the user experience and aligns the module with our premium UI standards.

**Independent Test**: Can be fully tested by having a user modify an order, and verifying the Audit Log Operator column correctly parses their username with an "Authorized User" tag.

**Acceptance Scenarios**:

1. **Given** a user changes an order status, **When** the audit log is recorded and retrieved, **Then** the frontend displays the exact username without "username=" prefixes.
2. **Given** a log is rendered, **When** it belongs to a user, **Then** the badge explicitly labels it as "Authorized User" rather than "Automated Flow".

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST default `app.current_user_id` in PostgreSQL triggers to `SYSTEM` when unauthenticated.
- **FR-002**: System MUST gracefully intercept `anonymousUser` strings at the Service layer to prevent `UUID.fromString()` parsing exceptions.
- **FR-003**: Frontend MUST remove legacy regex substring matching (`username=...`) and rely on exact backend string representations.
- **FR-004**: System MUST display "System" / "Automated Flow" correctly in the Operator column for system actions.

### Key Entities

- **AuditLog**: The core forensic record capturing data mutations and actor identities.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of new system-automated tasks record their actor as "System" rather than throwing exceptions or persisting NULL.
- **SC-002**: 100% of user actions cleanly display standard usernames without technical prefixes like "username=".
- **SC-003**: The Audit Logs page renders successfully without parser-related console errors.

## Assumptions

- We assume existing legacy data containing empty user IDs or malformed IDs should also gracefully render as "System" / "Unknown" on the frontend without crashing the table.
- We assume that `UUID.fromString` is the exclusive method used by the backend to resolve users via the registry.

---

## Future Enhancements (Phase 5 & 6)
Based on industry best practices for PostgreSQL and Spring Boot audit logging, the following are planned:

### User Story 3 - HTTP Context Tracking (Best Practice)
As a security auditor, I want to see the IP Address and User-Agent of the person making the change in the audit logs, so that I can trace unauthorized modifications back to their network origin.
- **Requirement**: Spring Boot MUST pass `app.client_ip` and `app.user_agent` via `SET LOCAL` during transactions, and `fn_audit_log` MUST read and persist them.

### User Story 4 - Data Redaction (Best Practice)
As a compliance officer, I want sensitive data (like passwords) to be redacted from the `old_data` and `new_data` JSONB payloads, so that the audit logs do not become a vulnerability.
- **Requirement**: `fn_audit_log` MUST remove or mask keys like `password`, `password_hash`, or `token` before persisting the JSONB payload.

### User Story 5 - Log Immutability (Security Best Practice)
As a security auditor, I want to ensure that no one (not even DB admins or rogue processes) can modify or delete existing audit log records, ensuring a tamper-proof forensic trail.
- **Requirement 1**: PostgreSQL MUST have a trigger on the `audit_logs` table that intercepts and blocks `UPDATE` and `DELETE` operations, raising an exception.
- **Requirement 2**: Standard application database roles (e.g., `laundry_user`) MUST explicitly have `UPDATE`, `DELETE`, and `TRUNCATE` privileges revoked from the `audit_logs` table.
