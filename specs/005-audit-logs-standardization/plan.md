# Implementation Plan: Audit Logs Standardization

**Feature Branch**: `005-audit-logs-standardization`

**Status**: Draft

## Technical Context

We are standardizing the Audit Logs across the PostgreSQL layer, Spring Boot service layer, and React frontend.
- **PostgreSQL**: `fn_audit_log` relies on `app.current_user_id`, which must be guaranteed to fall back to `SYSTEM` if no user context is active.
- **Spring Boot**: `AuditLogService` throws an `IllegalArgumentException` via `UUID.fromString()` if the `userId` is `anonymousUser` or `SYSTEM`, causing logs to fail mapping and return "Unknown".
- **React Frontend**: `AuditLogPage` uses legacy regex parsing (`username=...`) rather than receiving clean values directly from the backend.

## Constitution Check

- **Architecture Guidelines**: Adheres to the standard entity-service boundaries and respects PostgreSQL's audit triggers.
- **Technology Stack**: Utilizes existing Flyway, Spring Boot, and React constructs natively.
- **Code Quality standards**: Removing the regex check on the frontend simplifies the UI logic and strictly conforms to `UI_LABELS`.

## Phase 0: Outline & Research

- **Research Task**: Validate `UUID.fromString` behavior in `AuditLogService`.
  - **Decision**: Update `toResponse` to intercept specific string values before parsing them as UUIDs.
- **Research Task**: Validate PostgreSQL trigger function fallback.
  - **Decision**: Update `fn_audit_log` via a new Flyway migration `V3__audit_trigger_fix.sql` using `COALESCE` or standard conditionals.

## Phase 1: Design & Contracts

### Data Model Updates
No structural changes to the data model, only a behavior modification to the Audit Log database trigger `fn_audit_log`.

### Interface Contracts
No changes to API contracts, but the `actor` field in `AuditLogResponse` will exclusively return exact user strings (e.g. "admin", "System") instead of stringified objects.

### Quickstart Scenarios
- `make clean && make up`
- Login as `ADMIN` and change an order.
- Verify the Audit Logs page.

## Phase 2: Implementation Steps

1. **Database Update**
   - Create `backend/src/main/resources/db/migration/V3__audit_trigger_fix.sql` to modify `fn_audit_log()` to handle null `v_user_id` by setting it to `SYSTEM`.
2. **Backend Services**
   - Update `AuditLogService.java` to check for `anonymousUser`, `anonymous`, or `SYSTEM` string values in `log.getUserId()` before calling `getUsername()`.
3. **Frontend Integration**
   - Refactor `formatUser()` in `frontend/src/app/(dashboard)/audit-logs/page.tsx` to directly render the actor string instead of parsing `username=`.
4. **Validation**
   - Run `make test-backend` and `make test-frontend`.

## Phase 5: HTTP Context Tracking (Enhancement)
1. **Spring Boot Interceptor/AOP**:
   - Create or update a database context interceptor to run `SET LOCAL app.client_ip = ?` and `SET LOCAL app.user_agent = ?` at the start of transactions.
2. **PostgreSQL Trigger**:
   - Update `fn_audit_log` (via `V4__audit_http_context.sql`) to read these new session settings and insert them into the `ip_address` and `user_agent` columns.

## Phase 6: Data Redaction (Enhancement)
1. **PostgreSQL JSONB Manipulation**:
   - Update `fn_audit_log` to check `TG_TABLE_NAME`. If it's a table with sensitive data (e.g., `users`), remove sensitive keys (e.g., `password_hash`) from `new_data` and `old_data` using the `-` operator for JSONB before insertion.

## Phase 7: Log Immutability & Integrity (NIST SP 800-53 AU-9)
1. **PostgreSQL Immutability Trigger**:
   - Create a new function `fn_prevent_audit_tampering()` that raises an exception (`RAISE EXCEPTION 'Audit logs are immutable'`) if `TG_OP` is `UPDATE` or `DELETE`.
   - Attach this trigger to the `audit_logs` table in the new `V4` migration script to guarantee a tamper-proof forensic trail.
2. **Role Management**:
   - Add `REVOKE UPDATE, DELETE, TRUNCATE ON audit_logs FROM public;` (and specific app users) to enforce the Principle of Least Privilege.
3. **Cryptographic Hash-Chaining (IEEE Best Practice)**:
   - Add `record_hash` and `previous_hash` columns to `audit_logs`.
   - Update `fn_audit_log` to compute `SHA256(previous_hash || current_row_data)` via `pgcrypto` to mathematically guarantee no historical logs have been tampered with.
