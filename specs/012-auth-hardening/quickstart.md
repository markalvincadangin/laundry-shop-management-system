# Quickstart & Validation Guide: Authentication & Session Hardening

**Feature**: 012-auth-hardening

This guide provides end-to-end validation flows for testing the new Auth model without running the full frontend UI.

## Prerequisites
- Backend must be running on `localhost:8080`
- Curl or Postman available
- For Cookie/CSRF testing, ensure you can capture and pass cookies between requests.

## Scenario 1: Standard Login & Refresh

### Step 1: Login
```bash
curl -i -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin", "password":"password"}'
```
**Expected**:
- HTTP 200 OK
- JSON body containing `accessToken` and `expiresIn`
- `Set-Cookie` header containing `refresh_token=...; HttpOnly; Secure; SameSite=None`
- `Set-Cookie` header containing `csrf_token=...; Secure; SameSite=None`

### Step 2: Access Protected Endpoint
```bash
curl -i -X GET http://localhost:8080/api/v1/users/me \
  -H "Authorization: Bearer <accessToken_from_step_1>"
```
**Expected**: HTTP 200 OK

### Step 3: Refresh Token
```bash
curl -i -X POST http://localhost:8080/api/v1/auth/refresh \
  -H "Cookie: refresh_token=<val>; csrf_token=<val>" \
  -H "X-CSRF-Token: <csrf_token_val>"
```
**Expected**:
- HTTP 200 OK
- New `accessToken` in body
- `Set-Cookie` updating the `refresh_token`

## Scenario 2: Token Reuse Detection (Security Event)

1. Perform Step 1 (Login) and capture the initial `refresh_token` (Token A).
2. Perform Step 3 (Refresh) using Token A. Capture the new `refresh_token` (Token B).
3. **The Attack**: Attempt to call `/api/v1/auth/refresh` again using **Token A** (which is now revoked).
4. **Expected**: HTTP 401 Unauthorized. The server detects reuse.
5. **The Consequence**: Attempt to call `/api/v1/auth/refresh` using **Token B** (the legitimate new token).
6. **Expected**: HTTP 401 Unauthorized. The entire token family was revoked by the reuse detection in step 3.

## Scenario 3: Brute Force Lockout

1. Send 5 invalid login requests within a short timeframe:
```bash
for i in {1..5}; do
  curl -s -o /dev/null -w "%{http_code}\n" -X POST http://localhost:8080/api/v1/auth/login \
    -H "Content-Type: application/json" \
    -d '{"username":"admin", "password":"wrongpassword"}'
done
```
**Expected**: 5 responses of HTTP 401.

2. Send a valid login request immediately after:
```bash
curl -i -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin", "password":"password"}'
```
**Expected**: HTTP 401 Unauthorized (Account is locked for 15 minutes). The error message should be identical to the "wrong password" message to prevent account enumeration.
