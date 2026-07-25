# API Contracts: Authentication & Session Hardening

**Feature**: 012-auth-hardening

## `POST /api/v1/auth/login`

Authenticates a user and establishes a session.

**Request Body**:
```json
{
  "username": "admin",
  "password": "password123"
}
```

**Response (200 OK)**:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR...",
  "expiresIn": 900
}
```
**Headers Set (Response)**:
- `Set-Cookie: refresh_token=...; HttpOnly; Secure; SameSite=None; Path=/api/v1/auth`
- `Set-Cookie: csrf_token=...; Secure; SameSite=None; Path=/`

**Error Responses**:
- `401 Unauthorized`: Invalid credentials OR account locked (generic response).

---

## `POST /api/v1/auth/refresh`

Rotates the refresh token and issues a new access token.

**Request**:
- **Headers**:
  - `Cookie: refresh_token=...; csrf_token=...`
  - `X-CSRF-Token: <value_of_csrf_token_cookie>`
- **Body**: None

**Response (200 OK)**:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR...",
  "expiresIn": 900
}
```
**Headers Set (Response)**:
- `Set-Cookie: refresh_token=...; HttpOnly; Secure; SameSite=None; Path=/api/v1/auth`

**Error Responses**:
- `401 Unauthorized`: Invalid, expired, or revoked refresh token.
- `403 Forbidden`: CSRF token mismatch or missing.

---

## `POST /api/v1/auth/logout`

Revokes the current refresh token and clears session cookies.

**Request**:
- **Headers**:
  - `Cookie: refresh_token=...; csrf_token=...`
  - `X-CSRF-Token: <value_of_csrf_token_cookie>`
- **Body**: None

**Response (200 OK)**:
*(Empty body)*

**Headers Set (Response)**:
- `Set-Cookie: refresh_token=; Max-Age=0; Path=/api/v1/auth`
- `Set-Cookie: csrf_token=; Max-Age=0; Path=/`

**Error Responses**:
- `403 Forbidden`: CSRF token mismatch or missing.
