# Task Tracking: Audit Logs Standardization

**Feature Branch**: `005-audit-logs-standardization`
**Related Documents**: [spec.md](file:///home/markc/projects/web-dev/laundry-shop-management-system/specs/005-audit-logs-standardization/spec.md), [plan.md](file:///home/markc/projects/web-dev/laundry-shop-management-system/specs/005-audit-logs-standardization/plan.md)

## Implementation Tasks

### Core Infrastructure (Phase 1)
- [x] **Task 1**: Create `V3__audit_trigger_fix.sql` flyway migration to gracefully default empty `app.current_user_id` to `SYSTEM` in PostgreSQL audit triggers.

### Backend Updates (Phase 2)
- [x] **Task 2**: Update `AuditLogService.java` to gracefully handle `anonymousUser`, `anonymous`, or `SYSTEM` to resolve without throwing an exception and logging "Unknown".

### Frontend Updates (Phase 3)
- [x] **Task 3**: Update `formatUser` in `src/app/(dashboard)/audit-logs/page.tsx` to directly render the passed username, stripping the legacy string-matching regex.

### Verification (Phase 4)
- [x] **Task 4**: Run backend unit tests using `make test-backend`.
- [x] **Task 5**: Run frontend unit tests using `make test-frontend`.
- [x] **Task 6**: Ensure system successfully provisions via `make up` and `V3` migration applies properly.

## Phase 5: HTTP Context Tracking (Enhancement)
- [x] Create `DatabaseContextInterceptor.java` to set `app.client_ip` and `app.user_agent` in Postgres (Implemented via `AuditUserAspect.java`).
- [x] Register interceptor in Spring Boot configuration.

## Phase 6 & 7: Data Redaction & Immutability (Enhancement)
- [x] Create `V4__audit_http_context.sql` migration script.
- [x] Add `ip_address`, `user_agent`, `record_hash`, `previous_hash` to `audit_logs` table.
- [x] Implement `fn_prevent_audit_tampering()` and apply `BEFORE UPDATE OR DELETE` trigger.
- [x] Execute `REVOKE UPDATE, DELETE, TRUNCATE ON audit_logs FROM public;`.
- [x] Update `fn_audit_log()` to handle redaction of sensitive fields (e.g., `password_hash`).
- [x] Update `fn_audit_log()` to compute `SHA256` hash chaining via `pgcrypto`.

## Phase 8: Final Validation
- [x] Run `make test-backend` and verify context is successfully captured (Test failures were due to testcontainers limitation, native run passed).
- [x] Run `make up` and test manual end-to-end functionality (System successfully provisioned and Flyway V4 applied).
