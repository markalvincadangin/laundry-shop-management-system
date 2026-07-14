# Implementation Plan: Users & Auth Modules

**Branch**: `main` | **Date**: 2026-07-05 | **Spec**: [spec.md](spec.md)

**Note**: This plan was reverse-engineered from existing source code via the `/speckit-brownfield-migrate` workflow.

## Summary

The Auth and Users modules operate in tandem to secure the application. They leverage Spring Security's filter chain on the backend and Next.js Middleware on the frontend to protect private routes.

## Technical Context

**Language/Version**: Java 21 (Backend) / TypeScript (Frontend)

**Primary Dependencies**: Spring Boot Security, JJWT, Next.js Middleware, Zod

**Storage**: PostgreSQL

**Testing**: JUnit, Testcontainers (Backend) / Vitest (Frontend - Gap identified)

**Target Platform**: Web Browser

## Project Structure

### Source Code

```text
backend/
├── src/main/java/com/himotech/laundryms/auth/
│   ├── api/
│   ├── dto/
│   └── service/ (Filters, JwtService, AuthService)
├── src/main/java/com/himotech/laundryms/users/
│   ├── controller/
│   ├── dto/
│   ├── entity/
│   ├── repository/
│   └── service/

frontend/
├── src/app/(auth)/login/
├── src/app/(dashboard)/users/
├── src/components/features/users/
├── src/lib/api/auth.ts
├── src/lib/api/users.ts
├── src/lib/validation/auth.ts
├── src/lib/validation/users.ts
└── src/middleware.ts
```

**Structure Decision**: Matches Option 2 (Frontend/Backend) architecture.

## Complexity Tracking

| Mechanism | Why Needed | Alternative Rejected Because |
|-----------|------------|------------------------------|
| HttpOnly Cookies | Protects JWTs from XSS attacks | Storing tokens in `localStorage` exposes them to malicious JavaScript. HttpOnly cookies are automatically attached by the browser, making `api-client.ts` simpler. |
