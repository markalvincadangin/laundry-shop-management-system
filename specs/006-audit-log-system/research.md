# Research & Technical Decisions: Audit Log Standardization

## 1. Transaction Mechanism
**Requirement**: Audit writes must be transactional with the parent operation (FR-002/FR-003). No silent failures.
**Decision**: Synchronous Same-Transaction Insert (via PostgreSQL Triggers).
**Rationale**: A Transactional Outbox pattern requires an external message broker and polling worker, which violates the "no new infrastructure" rule. By using PostgreSQL triggers natively, the audit insert executes synchronously within the parent transaction. If the trigger fails, the entire transaction rolls back automatically, perfectly satisfying the requirement.

## 2. Centralize Audit Capture
**Requirement**: Avoid scattering calls across controllers (FR-008).
**Decision**: Database Triggers + Spring AOP Context Interceptor.
**Rationale**: 
- **Database Triggers**: Applying `AFTER INSERT OR UPDATE OR DELETE` triggers in PostgreSQL guarantees 100% centralized capture. Even manual SQL patches by DBAs are audited. 
- **Spring AOP**: We will use an `@Aspect` tied to `@Transactional` methods to inject the current user and HTTP context into the database session using `SET LOCAL app.current_user_id = '...'`. The database trigger then reads this context. This completely decouples auditing from business logic.

## 3. Indexing Strategy
**Requirement**: Pagination and indexed filtering by module, action, actor, and date (FR-007).
**Decision**: Composite B-Tree Indexes on `audit_logs`.
**Rationale**:
- `CREATE INDEX idx_audit_logs_created_at ON audit_logs (created_at DESC);` — Supports default chronological pagination.
- `CREATE INDEX idx_audit_logs_module_action ON audit_logs (table_name, action_type, created_at DESC);` — Optimizes filtering by module/action.
- `CREATE INDEX idx_audit_logs_user ON audit_logs (user_id, created_at DESC);` — Optimizes filtering by actor.
This strategy avoids full table scans while maintaining high write throughput.

## 4. Redaction Strategy
**Requirement**: Mask sensitive fields (PII, payments) (FR-004).
**Decision**: Write-time Redaction (Stored Redacted).
**Rationale**: The security requirement explicitly states data "must be masked/redacted in the stored log." Write-time redaction is safer because if the raw DB is compromised or dumped, the sensitive data is not leaked in the `audit_logs` table. We will use the PostgreSQL JSONB `-` operator in the trigger to strip keys like `password`, `ssn`, or `credit_card` before saving the JSON payload.

## 5. Frontend UI/UX Components
**Requirement**: Master-detail drawer pattern for viewing technical diffs (FR-010).
**Decision**: Shadcn UI `Sheet` (or Radix UI Dialog) + Shared Table Components.
**Rationale**: The frontend already utilizes standard React/Tailwind component patterns. We will reuse the existing `Table` or `DataTable` components for the main list, and implement a `Sheet` (a sliding right-hand drawer) for the master-detail view. This preserves context and maintains visual consistency with the rest of the dashboard without introducing new heavy libraries.

## 6. Immutability Enforcement
**Requirement**: Guarantee no updates or deletions are possible post-creation (FR-001).
**Decision**: Database-level Permissions (`REVOKE`).
**Rationale**: The spec's FR-002/FR-003 only require immutability and transactional rollback on failure — not cryptographic tamper-evidence. Hash-chaining adds a write-lock dependency on the previous row's hash, which risks violating our own <5% write degradation target on high-frequency modules (orders/inventory). Instead, we satisfy immutability via database-level permissions (`REVOKE UPDATE, DELETE ON audit_logs FROM [application_role];`). This enforces immutability at the DB grant level with zero write-path performance cost, rather than through heavy hash computations.
