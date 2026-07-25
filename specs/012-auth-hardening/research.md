# Research & Technical Decisions: Authentication & Session Hardening

**Feature**: 012-auth-hardening

## Decision 1: Token Architecture
- **Decision**: Implement a two-token model: 15-minute JWT access token (bearer) and a 7-day opaque refresh token (`HttpOnly`, `Secure`, `SameSite=None` cookie).
- **Rationale**: Mitigates risk of XSS token theft. If an access token is leaked, its utility expires rapidly. A leaked refresh token cannot be read by malicious JavaScript due to the `HttpOnly` flag.
- **Alternatives considered**: Single long-lived token (rejected as insecure over internet). DPoP / mTLS (rejected as overly complex for a 2-user system).

## Decision 2: Brute Force Protection Strategy
- **Decision**: Implement username-keyed rate limiting (5 attempts / 15 minutes) rather than IP-keyed limiting. Return identical generic errors for both bad passwords and locked accounts.
- **Rationale**: An attacker rotating IPs or source ports would bypass IP-based limiting. Username-based locking ensures a targeted account is protected. Generic errors prevent account enumeration.
- **Alternatives considered**: Redis-backed distributed lock (rejected; in-memory cache or simple RDBMS table is sufficient for this traffic volume).

## Decision 3: CSRF Protection
- **Decision**: Double-submit cookie pattern for `/api/v1/auth/refresh` and `/api/v1/auth/logout`.
- **Rationale**: `SameSite=None` on the refresh cookie exposes the endpoints to cross-site request forgery. The double-submit pattern validates intent without requiring server-side session state tracking.
- **Alternatives considered**: Spring Security Synchronizer Token Pattern (rejected because it assumes server-rendered views and adds unnecessary state overhead for a stateless API + SPA architecture).
