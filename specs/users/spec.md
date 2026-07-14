# Feature Specification: Users & Auth Modules

**Feature Branch**: `main` (Legacy)

**Created**: 2026-07-05

**Status**: Migrated

**Input**: Reverse-engineered from existing source code.

## User Scenarios & Testing

### User Story 1 - Secure Staff Login (Priority: P1)
Staff members must be able to log in securely using their credentials. The system must issue a secure token that maintains their session without requiring re-authentication on every page.

**Acceptance Scenarios**:
1. **Given** valid credentials, **When** a user submits the login form, **Then** the backend issues a secure HttpOnly JWT cookie and the frontend redirects to the dashboard.
2. **Given** an inactive user account, **When** they attempt to log in, **Then** the system rejects the authentication request.

### User Story 2 - User Management & RBAC (Priority: P1)
Administrators must be able to create new staff accounts, reset passwords, and deactivate employees who no longer work at the shop.

**Acceptance Scenarios**:
1. **Given** an admin user, **When** they create a new staff account, **Then** the password is securely hashed and the user can immediately log in.
2. **Given** an admin user, **When** they attempt to deactivate *their own* account, **Then** the system blocks the action to prevent accidental lockouts.

## Requirements 

### Functional Requirements

- **FR-001**: System MUST hash all passwords using BCrypt (factor 10) before storage.
- **FR-002**: System MUST authenticate users via stateless JWTs stored in strict `HttpOnly`, `Secure` cookies.
- **FR-003**: System MUST prevent duplicate usernames during registration.
- **FR-004**: System MUST prevent Admins from deactivating their own active sessions/accounts.
- **FR-005**: System MUST enforce Role-Based Access Control (RBAC) across endpoints based on `UserRole` (`ADMIN` vs `STAFF`).

### Key Entities

- **User**: Represents a system operator (Staff or Admin) capable of logging into the platform.

### Database Migrations
- **Flyway Target**: `V1__init.sql`, `V2__seed_users.sql`
- **Schema Changes**: `users` table established, development seed users provisioned.

### API Contracts
- **Endpoints Needed**: `POST /api/v1/auth/login`, `POST /api/v1/auth/logout`, `GET /api/v1/auth/me`, `GET /api/v1/users`, `POST /api/v1/users`, `PUT /api/v1/users/{id}`, `PATCH /api/v1/users/{id}/toggle-active`

## Success Criteria

### Measurable Outcomes
- **SC-001**: Zero plaintext passwords exist in the database.
- **SC-002**: Frontend routing successfully intercepts unauthenticated users and redirects them to `/login`.
