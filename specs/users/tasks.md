# Tasks: Users & Auth Modules

**Input**: Design documents from `/specs/users/`

**Note**: Reverse-engineered task execution status.

## Phase 1: Database & Foundation

- `[x]` T001 Create Flyway migration `V1__init.sql` for the `users` table.
- `[x]` T002 Create Flyway migration `V2__seed_users.sql` gated by the `dev` environment placeholder.
- `[x]` T003 Create Entity model `User.java` and Repository.

## Phase 2: Backend Business Logic

- `[x]` T004 Implement `UserService` (CRUD, status toggling, Admin-lockout protection).
- `[x]` T005 Implement `AuthService` and `JwtService` for token generation/validation.
- `[x]` T006 Configure Spring Security (`SecurityConfig`) and `JwtCookieAuthFilter`.
- `[x]` T007 Build `AuthController` and `UserController` REST endpoints.

## Phase 3: Frontend Implementation

- `[x]` T008 Define `auth.ts` and `users.ts` Zod validation schemas.
- `[x]` T009 Implement Next.js `middleware.ts` for route protection based on cookies.
- `[x]` T010 Build Login page (`/login`) and Global Auth Context (`auth-store.tsx`).
- `[x]` T011 Create User Management Dashboard (List, Create, Edit modals).

## ⚠️ Identified Gaps

1. **Frontend Tests Missing**: As seen across all modules, there is no component testing in `frontend/src/tests/components/features/users/`. We lack tests ensuring that unauthorized users are properly redirected or that login form validation works as expected.
