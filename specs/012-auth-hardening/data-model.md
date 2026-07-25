# Data Model: Authentication & Session Hardening

**Feature**: 012-auth-hardening

## Entity: Refresh Token (`refresh_tokens` table)

Tracks active, expired, and revoked refresh tokens for all users to enforce rotation and reuse detection.

| Field | Type | Attributes | Description |
|-------|------|------------|-------------|
| `id` | UUID | Primary Key, Default `gen_random_uuid()` | Unique identifier for the row. |
| `user_id` | UUID | Foreign Key (`users.id`), Not Null | The owner of the session. |
| `token_hash` | VARCHAR(64) | Not Null, Unique | SHA-256 hash of the opaque token value sent to the client. |
| `family_id` | UUID | Not Null | Identifies a chain of rotated tokens originating from a single login. |
| `issued_at` | TIMESTAMPTZ | Not Null, Default `now()` | When the token was issued. |
| `expires_at` | TIMESTAMPTZ | Not Null | Hard expiration (typically `issued_at` + 7 days). |
| `last_used_at` | TIMESTAMPTZ | Nullable | Tracks inactivity. If > 3 days ago, token is considered expired. |
| `revoked` | BOOLEAN | Not Null, Default `false` | True if the token has been consumed, logged out, or flagged compromised. |
| `replaced_by` | UUID | Foreign Key (`refresh_tokens.id`), Nullable | Points to the next token in the rotation chain, populated upon successful refresh. |

### Indexes
- `idx_refresh_tokens_family` on `(family_id)`: Accelerates family-wide revocation queries.
- `idx_refresh_tokens_user` on `(user_id)`: Accelerates user-wide revocation (e.g. during password change).
- `token_hash` has a unique constraint index.

## Entity: Login Attempt

Tracks failed login attempts for brute-force protection. Can be implemented as a table or an in-memory cache (e.g. Caffeine/ConcurrentHashMap).

| Field | Type | Attributes | Description |
|-------|------|------------|-------------|
| `username` | VARCHAR | Key | The targeted account. |
| `attempt_count` | INT | | Number of consecutive failed attempts. |
| `first_failed_at`| TIMESTAMPTZ | | Timestamp of the first failure in the current window. |
| `locked_until` | TIMESTAMPTZ | Nullable | Populated if `attempt_count` reaches 5 within 15 minutes. |

### Business Rules & State Transitions
- **Refresh Flow**: 
  - Validate token hash exists, is not expired, and `revoked` is false.
  - If valid: Mark current row `revoked = true`, generate new token and row, set `replaced_by = new_row.id`, return new tokens.
  - If invalid (row exists but `revoked` is true): **Compromise detected**. Find all rows where `family_id = compromised_row.family_id` and set `revoked = true`. Reject request.
- **Lockout Flow**:
  - `attempt_count` increments on failed password check.
  - Reaching 5 attempts sets `locked_until` to `now() + 15 minutes`.
  - Any successful login clears the attempt record for that username.
