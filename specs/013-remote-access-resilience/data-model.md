# Data Model: Remote Access Resilience

## OperationRecoveryRecord

| Field | Purpose | Rules |
|-------|---------|-------|
| `id` | Internal identifier | Project-standard ID |
| `actor_user_id` | Operation owner | Required foreign key |
| `idempotency_key` | Client operation identifier | Required UUID; unique with actor |
| `method`, `path` | Normalized request identity | Required |
| `request_fingerprint` | Canonical request identity | Required; detects altered reuse |
| `state` | `PENDING` or `COMPLETED` | Reserved before mutation; completed before commit |
| `response_status`, `response_body` | Original outcome | Required for completed operations |
| `created_at`, `expires_at` | Recovery retention | Seven-day retention |

### Rules

- Unique constraint: `(actor_user_id, idempotency_key)`.
- Matching actor/key/method/path/fingerprint replays the stored outcome.
- Any differing request identity with an existing actor/key is a conflict.
- A failed mutation rolls back both its business data and reservation.
- Scheduled cleanup removes expired completed records only.

## Frontend-only state

- `checking`: initial health probe; writes disabled.
- `online`: upstream health confirmed.
- `offline`: data is stale and writes disabled.
- `unconfirmed operation`: a submitted mutation retains its original key until explicit recovery or discard.
