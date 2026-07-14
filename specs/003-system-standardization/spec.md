# Feature Specification: System Setup & Integration Standardization

**Feature Branch**: `[003-system-standardization]`

**Created**: 2026-07-05

**Status**: Draft

**Input**: User description: "standardize the project setup, the backend and frontend integration, the env, the containerization, flyway, db, etc."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Frictionless Developer Onboarding & Environment Setup (Priority: P1)

As a new or existing developer on the project, I want a single, standard way to configure my environment variables and start the entire stack so that I do not encounter port conflicts, proxy connection refusals, or mismatched Docker configurations.

**Why this priority**: Development velocity is currently severely hindered by fragile environment configurations and proxying errors (e.g., `ECONNREFUSED` during `npm run dev`).

**Independent Test**: Can be verified by running a `make reset` (or similar) on a fresh machine, copying `.env.example`, and successfully starting both the backend and frontend without any manual port hacking.

**Acceptance Scenarios**:

1. **Given** a developer pulls the repo freshly, **When** they run the standard setup commands, **Then** the database, backend, and frontend start up and seamlessly communicate on pre-defined standard ports.
2. **Given** a developer runs the frontend natively via `npm run dev`, **When** the frontend makes an API call, **Then** the proxy configuration flawlessly routes the request to the Docker-hosted backend without hardcoded `localhost:8080` failures.

---

### User Story 2 - Automated Database Migrations via Flyway (Priority: P1)

As a backend engineer, I want the database schema to be managed deterministically using Flyway so that every developer and environment operates on the exact same database structure automatically on startup.

**Why this priority**: Manual database schema scripts cause drift between developers' local machines and production.

**Independent Test**: Can be verified by starting the backend Docker container against an empty PostgreSQL database and confirming that all necessary tables are created automatically before the Spring Boot application accepts traffic.

**Acceptance Scenarios**:

1. **Given** an empty database, **When** the Spring Boot application starts, **Then** Flyway automatically runs all pending `.sql` migration scripts.
2. **Given** a developer adds a new migration file, **When** the container restarts, **Then** Flyway detects the new version and applies it without destroying existing data.

---

### User Story 3 - Production-Ready Containerization (Priority: P2)

As a DevOps engineer, I want standardized, multi-stage Dockerfiles and Docker Compose profiles so that the transition from local development to production deployment is seamless and secure.

**Why this priority**: "It works on my machine" is solved by standardizing the container infrastructure for both `dev` and `prod` targets.

**Independent Test**: Can be verified by running `docker compose --profile prod up` and observing optimized, compiled, production-ready images starting up.

**Acceptance Scenarios**:

1. **Given** the frontend needs to be deployed, **When** it is built using the production Dockerfile target, **Then** it uses Next.js `standalone` mode to minimize image size and attack surface.
2. **Given** the backend needs to be deployed, **When** it is built, **Then** it compiles via Maven in a builder stage and packages only the final `.jar` in a lightweight JRE image.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST consolidate all environment variables across backend, frontend, and database into a single, cohesive `.env.example` file that drives both Docker and local `.env.local` files.
- **FR-002**: The `next.config.mjs` API proxy MUST dynamically resolve the backend URL from the environment without caching stale ports.
- **FR-003**: The backend MUST integrate Flyway Core, and existing schema scripts must be converted to Flyway `V1__init.sql` versioned format.
- **FR-004**: Dockerfiles MUST use multi-stage builds separating `development` and `production` targets.

### Key Entities 

- **Infrastructure**: `.env`, `docker-compose.yml`, `Makefile`, `Dockerfile`
- **Database**: `flyway_schema_history`

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Running the frontend locally (`npm run dev`) alongside a Dockerized backend yields **0** `ECONNREFUSED` proxy errors.
- **SC-002**: Backend database initialization is 100% automated by Flyway upon container startup, eliminating manual SQL execution.
- **SC-003**: The project contains a clear `README.md` or `quickstart.md` defining the *exact* command to start the standardized environment.
