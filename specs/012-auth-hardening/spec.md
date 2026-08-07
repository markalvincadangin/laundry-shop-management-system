# Feature Specification: Authentication & Session Hardening

**Feature Branch**: `feature/012-auth-hardening`

**Created**: 2026-07-25

**Status**: Draft

**Input**: Harden JWT-based authentication ahead of the system becoming internet-reachable (Vercel frontend + tunneled backend) — bounded token lifetime, secure refresh flow, explicit revocation, and brute-force resistance. Baseline branch: `develop`.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Secure Authentication & Memory Access Token Usage (Priority: P1)

As a shop staff member or admin, I want to log into the application and receive a short-lived access token stored securely in application memory, so that my session is protected against XSS-based token theft.

**Why this priority**: Core login flow security is the primary barrier protecting shop operations when exposed over internet tunnels.

**Independent Test**: Log in via `POST /api/v1/auth/login`. Verify that an access token (JWT) is returned in the response body with a 15-minute expiration, and a refresh token is set as an HttpOnly, Secure, SameSite=None cookie. Verify the access token is kept in React context and not in localStorage or sessionStorage.

**Acceptance Scenarios**:

1. **Given** valid credentials, **When** a user submits the login form, **Then** the backend returns a short-lived (15 min) JWT access token in the response body and sets an HttpOnly, Secure, `SameSite=None`, `Path=/api/v1/auth` refresh token cookie.
2. **Given** an authenticated user session, **When** the access token is examined, **Then** it contains `sub`, `role`, `jti`, `iat`, and `exp` claims, but no PII (e.g., full name, phone number).
3. **Given** an active session, **When** inspecting browser local/session storage, **Then** neither access token nor refresh token is stored in `localStorage` or `sessionStorage`.

---

### User Story 2 - Transparent Token Refresh & Rotation with Reuse Detection (Priority: P1)

As an active user working in the shop, I want my session to automatically and securely refresh before/upon access token expiration, so that my work is uninterrupted while maintaining strict session limits and automatic compromised-token detection.

**Why this priority**: Prevents user session disruption while strictly enforcing a 15-minute access token lifespan and detecting stolen refresh token replays.

**Independent Test**: Allow access token to expire (or use a test 15-min expiration threshold), then initiate an API call. Verify that the frontend transparently calls `/api/v1/auth/refresh` using the HttpOnly refresh cookie and `X-CSRF-Token` header, receives a new access token, rotates the refresh cookie, and retries the original API call.

**Acceptance Scenarios**:

1. **Given** an expired access token, **When** an API call returns 401 Unauthorized, **Then** the application transparently makes a `POST /api/v1/auth/refresh` request with the double-submit CSRF header, updates the memory access token, and retries the original request seamlessly.
2. **Given** a valid refresh token cookie, **When** `/api/v1/auth/refresh` is called, **Then** the server invalidates/revokes the old refresh token row (`replaced_by` populated), issues a new refresh token cookie, and returns a new 15-minute access token.
3. **Given** an already-revoked refresh token, **When** an attacker attempts to re-use it at `/api/v1/auth/refresh`, **Then** the server detects token reuse, revokes all refresh tokens sharing that `family_id`, logs a security event, and rejects the request forcing a complete re-login for all sessions in that family.
4. **Given** an inactive session unused for 3 consecutive days, **When** a refresh is attempted, **Then** the server rejects the refresh attempt regardless of the 7-day total token TTL.

---

### User Story 3 - Secure Logout & Event-Driven Session Revocation (Priority: P2)

As a user or administrator, I want explicit logout and security actions (such as password or role changes) to instantly revoke refresh tokens on the server, so that terminated sessions cannot be resumed.

**Why this priority**: Enables immediate session termination upon user logout or security event remediation.

**Independent Test**: Call `POST /api/v1/auth/logout` with valid CSRF and refresh cookies. Verify that the refresh token entry in `refresh_tokens` table is marked `revoked` and the browser cookie is cleared. Then attempt a refresh call and verify it returns 401.

**Acceptance Scenarios**:

1. **Given** an active session, **When** the user logs out (`POST /api/v1/auth/logout`), **Then** the server marks the current refresh token row as `revoked` and clears the refresh cookie in the response.
2. **Given** a user whose password or role is updated, **When** the security update is saved, **Then** all active refresh tokens for that `user_id` across all family IDs are immediately marked `revoked` on the backend.

---

### User Story 4 - Username-Keyed Brute-Force Lockout & Non-Disclosure (Priority: P2)

As a system administrator, I want account login attempts to be rate-limited and locked per username after repeated failures, so that brute-force credential attacks are thwarted without leaking account existence.

**Why this priority**: Protects public-facing auth endpoints against targeted credential guessing attacks.

**Independent Test**: Perform 5 failed login attempts for a specific username within a 15-minute window. Verify that a 6th attempt (even with valid credentials) is rejected with the exact same generic error message as a bad password attempt.

**Acceptance Scenarios**:

1. **Given** 5 consecutive failed login attempts for a specific username within 15 minutes, **When** a 6th attempt is made within the 15-minute window, **Then** the account is locked and the attempt is rejected without password evaluation.
2. **Given** a locked account attempt, **When** the rejection response is sent, **Then** the HTTP status and error payload are completely identical to a standard invalid credential failure (no disclosure of "account locked" state).
3. **Given** a locked account, **When** 15 minutes elapse without further failed attempts, **Then** the account lockout automatically expires and valid credentials succeed.

---

### Edge Cases

- What happens when clock skew exists between the application client and backend server? (Include 30–60s leeway window during JWT validation).
- What happens if `/api/v1/auth/refresh` is called without the `X-CSRF-Token` header matching the `csrf_token` cookie? (Server immediately returns 403 Forbidden with zero DB state mutation).
- What happens if the backend database connection fails during refresh token lookup? (Returns 500 Internal Error, frontend retains attempt state and forces user to re-login safely).
- What happens if the server is restarted during an active brute-force lockout window? (In-memory/DB lockout tracking handles state gracefully; if in-memory cache is used, clean reset on startup is documented as an acceptable tradeoff).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST issue a short-lived JWT access token (15-minute expiry) upon successful authentication at `POST /api/v1/auth/login`.
- **FR-002**: System MUST sign access tokens using HS256 and include claims `sub`, `role`, `jti`, `iat`, and `exp`.
- **FR-003**: System MUST NOT include any Personally Identifiable Information (PII) in JWT access token payloads.
- **FR-004**: System MUST deliver refresh tokens exclusively as `HttpOnly`, `Secure`, `SameSite=None`, `Path=/api/v1/auth` cookies.
- **FR-005**: System MUST store SHA-256 hashes of refresh tokens in a `refresh_tokens` database table with tracking for `id`, `user_id`, `family_id`, `issued_at`, `expires_at`, `last_used_at`, `revoked`, and `replaced_by`.
- **FR-006**: System MUST enforce a fixed 7-day maximum lifetime per refresh-token family, measured from the original login and never extended by rotation, plus a 3-day sliding inactivity expiration.
- **FR-007**: System MUST perform refresh token rotation on every call to `POST /api/v1/auth/refresh`, revoking the presented token and issuing a new token in the same family.
- **FR-008**: System MUST detect refresh token reuse (presentation of an already-revoked token), immediately revoke ALL refresh tokens associated with that `family_id`, and persist a dedicated audit-log event containing the affected `user_id` and `family_id`.
- **FR-009**: System MUST enforce double-submit cookie CSRF protection for `/api/v1/auth/refresh` and `/api/v1/auth/logout` endpoints by validating that the `X-CSRF-Token` header matches the `csrf_token` cookie.
- **FR-010**: System MUST revoke all refresh tokens for a user when their password or role is updated.
- **FR-011**: System MUST track failed login attempts by username and lock out a username after 5 failed attempts within 15 minutes for a 15-minute period.
- **FR-012**: System MUST evaluate lockout status before checking password credentials and return generic invalid credential error messages for locked accounts to prevent user enumeration.
- **FR-013**: Frontend MUST store the JWT access token only in JavaScript application memory (React context) and attach it via `Authorization: Bearer <token>` on API requests.
- **FR-014**: Frontend MUST perform a single silent refresh attempt upon encountering a 401 Unauthorized status before redirecting to `/login`.

### Key Entities

- **Refresh Token (`refresh_tokens`)**:
  - `id`: UUID (Primary Key)
  - `user_id`: UUID (Foreign Key to `users`)
  - `token_hash`: String (SHA-256 hash of opaque refresh token, Unique)
  - `family_id`: UUID (Session family identifier)
  - `issued_at`: Timestamp with time zone
  - `expires_at`: Timestamp with time zone
  - `last_used_at`: Timestamp with time zone (Nullable)
  - `revoked`: Boolean (Default false)
  - `replaced_by`: UUID (Foreign Key to `refresh_tokens.id`, Nullable)

- **Login Attempt (`login_attempts` or In-Process Cache)**:
  - `username`: String (Key)
  - `attempt_count`: Integer
  - `first_failed_at` / `last_attempt_at`: Timestamp
  - `locked_until`: Timestamp (Nullable)

### Database Migrations
- **Flyway Target**: `V2__add_refresh_tokens_table.sql`
- **Schema Changes**: Create `refresh_tokens` table with indexes on `family_id`, `user_id`, and `token_hash`. Run daily cleanup that deletes refresh-token rows 30 days after expiry; audit-log events remain the durable security record.

### API Contracts
- **`POST /api/v1/auth/login`**: Accepts `{ username, password }`. Returns `{ accessToken, expiresIn }` in body, sets `refresh_token` (HttpOnly, Secure, SameSite=None) and `csrf_token` cookies.
- **`POST /api/v1/auth/refresh`**: Requires `refresh_token` cookie and `X-CSRF-Token` header. Returns `{ accessToken, expiresIn }` and updates `refresh_token` cookie.
- **`POST /api/v1/auth/logout`**: Requires `refresh_token` cookie and `X-CSRF-Token` header. Revokes refresh token in database and clears `refresh_token` and `csrf_token` cookies.
- **All Protected `/api/v1/**` Endpoints**: Require `Authorization: Bearer <accessToken>` header. Validates JWT signature, claims, and 15-minute `exp`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Leaked access tokens expire and become invalid within 15 minutes (verified via AUTH-01).
- **SC-002**: 100% of active sessions automatically refresh access tokens without user intervention or page reload interruptions (verified via AUTH-02).
- **SC-003**: 100% of refresh token reuse attempts trigger immediate family-wide session revocation and security logging (verified via AUTH-04).
- **SC-004**: 100% of brute-force attempts targeting a single username are blocked after 5 failed attempts within 15 minutes (verified via AUTH-06).
- **SC-005**: Zero access or refresh tokens are persisted in browser `localStorage` or `sessionStorage` (verified via AUTH-10).
- **SC-006**: 100% of responses for locked accounts are indistinguishable from invalid password responses (verified via AUTH-07).

## Assumptions

- **Baseline Branch**: Development and feature checkout are rooted on `develop` branch.
- **Dependency on TLS (Spec 013)**: Cookie `Secure` attribute requires HTTPS/TLS in place. If deployed without TLS during local development, browser cookie handling must account for development environment settings while enforcing `Secure` in production environments.
- **Token Format**: Access tokens use HS256 symmetric signing consistent with the existing backend architecture.
- **Single Monolith Issuer**: Authentication is handled directly by the Spring Boot backend without third-party identity providers or OAuth2 server infrastructure.

## Clarifications
### Session 2026-08-07
- Q: Should the 7-day maximum apply to the refresh-token family from original login or to each rotated token? → A: A refresh-token family expires 7 days after login; rotation never extends that deadline.
- Q: Where should a refresh-token reuse security alert be recorded? → A: Persist a dedicated audit-log event containing the affected user ID and token-family ID.
- Q: What cleanup schedule and retention should apply to expired refresh-token rows? → A: Run cleanup daily and delete rows 30 days after expiry; retain audit-log events as the durable security record.

### Session 2026-07-25
- Q: Do we need to include `docs/05-tech-design/openapi.yaml` to our spec, plan and tasks? → A: Yes, the OpenAPI contract must be updated to reflect the new `/api/v1/auth/refresh` endpoint, the modifications to `LoginResponse`, and the introduction of the `X-CSRF-Token` header.
- Q: Do we still need `InvalidCredentialsException.java` in the auth package instead of `shared/exception`? → A: Yes. Per Principle I (Feature-First Backend Organization) in the Constitution, exceptions specific to authentication belong in the `auth` feature package. Only truly cross-cutting concerns go to `shared`.
- Q: Are the folder structuring, conventions, and feature-based monorepo architecture standardized and documented? → A: Yes. These are already strictly codified in `.specify/memory/constitution.md` under Principles I (Feature-First Backend Organization), II (Frontend App Router Layering), and III (Polyglot Contract Sync).
