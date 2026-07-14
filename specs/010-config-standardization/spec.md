# Feature Specification: Environment and Configuration Standardization

**Feature Branch**: `[010-config-standardization]`

**Created**: 2026-07-14

**Status**: Draft

**Input**: User description: "I want you to perform examination, review and research for this environment classes and config... I want to standardize this. make it consistent and correct to use the standard approach used by proper engineering and from the industry."

## Clarifications

### Session 2026-07-14
- Q: We established that `DemoDataSeeder.java` duplicates Flyway functionality. How should we proceed with standardizing the test data seeding? → A: Delete DemoDataSeeder and move its logic to a Flyway `R__demo_data.sql` script mapped to the dev profile.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Standardized Local Environment Setup (Priority: P1)

As a developer or DevOps engineer, I need a standardized and predictable way to configure my local development and production environments using `.env` files and `docker-compose` files.

**Why this priority**: Correct environment setup is the foundation of the application. Inconsistencies between developers or between dev/prod lead to "it works on my machine" bugs and potential security vulnerabilities.

**Independent Test**: Can be fully tested by deleting the local `.env`, running a standardized `make` command to copy the `.env.example`, and spinning up the application successfully via `docker-compose up` without any missing property errors.

**Acceptance Scenarios**:

1. **Given** a fresh repository clone, **When** the developer copies `.env.example` to `.env` and boots the system, **Then** all required services (DB, Backend, Frontend) start successfully with safe default credentials.
2. **Given** a production deployment, **When** using `docker-compose.prod.yml`, **Then** the system requires explicit, strong credentials and disables debug logging/development profiles.

---

### User Story 2 - Type-Safe Spring Configuration (Priority: P1)

As a backend engineer, I want all application configurations (Security, JWT, Caching, Flyway) to be strictly typed and validated at application startup rather than scattered as loose `@Value` injections.

**Why this priority**: Fail-fast configuration prevents the application from starting in an invalid or insecure state, making debugging significantly easier and preventing runtime crashes.

**Independent Test**: Can be tested by omitting a required property (e.g., JWT secret) in the `.env` and verifying the Spring Boot application fails immediately at startup rather than throwing a NullPointerException during a user request.

**Acceptance Scenarios**:

1. **Given** an incomplete `.env` file missing a security property, **When** the backend starts, **Then** it fails immediately with a descriptive validation error about the missing property.
2. **Given** a fully configured `.env`, **When** the backend starts, **Then** `SecurityProperties` and `AppConfig` are correctly populated and applied to the security filter chain.

---

### User Story 3 - Clean Security and Filter Chains (Priority: P2)

As a security auditor, I need the Spring Security configuration and filter chains (`JwtAuthFilterConfig`, `RequestResponseLoggingFilter`) to use the latest, standardized Spring Security DSL and explicit filter ordering.

**Why this priority**: Improperly ordered filters or deprecated security DSLs can lead to authorization bypasses or missed audit logs.

**Independent Test**: Can be tested by inspecting the application startup logs to verify the exact order of the filter chain and testing endpoints to ensure logs capture requests *before* authorization fails.

**Acceptance Scenarios**:

1. **Given** an incoming HTTP request, **When** it hits the backend, **Then** the `RequestResponseLoggingFilter` executes before the `JwtAuthFilterConfig` to ensure all requests are logged regardless of token validity.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST define all required and optional environment variables in `.env.example` with clear documentation and safe placeholder values.
- **FR-002**: The `.gitignore` MUST explicitly prevent `.env`, `.env.*.local`, and any override files containing secrets from being committed to the repository.
- **FR-003**: `docker-compose.yml` MUST define the core services, while `docker-compose.override.yml.example` provides local development volume mapping/ports, and `docker-compose.prod.yml` enforces production constraints (e.g., resource limits, no bind-mounts).
- **FR-004**: The system MUST replace scattered `@Value` annotations in config classes with grouped, validated `@ConfigurationProperties` classes (e.g., `SecurityProperties`).
- **FR-005**: The `SecurityConfig` MUST utilize the modern, lambda-based Spring Security DSL, completely removing any deprecated `WebSecurityConfigurerAdapter` or chained string configurations.
- **FR-006**: Spring Filter classes (`JwtAuthFilterConfig`, `RequestResponseLoggingFilter`) MUST implement `Ordered` or use `@Order` annotations to guarantee execution sequence.
- **FR-007**: `DemoDataSeeder.java` MUST be deleted and its data seeding logic migrated into a Flyway environment-specific migration script (e.g., `R__demo_data.sql` or `db/migration/dev/`) to follow industry standards.
- **FR-008**: The `Makefile` MUST expose standard targets: `make setup-env`, `make up-dev`, and `make up-prod` to encapsulate the Docker Compose logic.

### Key Entities

- **ApplicationProperties**: Typed representation of `.env` configurations injected into the Spring context.
- **SecurityFilterChain**: The standardized sequence of interceptors managing logging, CORS, CSRF, and JWT validation.

### Database Migrations
- **Flyway Target**: None directly related to schema structure, but `FlywayConfig` must be verified to use standard baseline configurations and environment-specific triggers.
- **Schema Changes**: N/A

### API Contracts
- **Endpoints Needed**: N/A (Internal Configuration)
- **Security**: N/A

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of backend application properties are managed via `@ConfigurationProperties` and validated at startup via `spring-boot-starter-validation`.
- **SC-002**: Zero deprecated Spring Security configuration methods are used in `SecurityConfig`.
- **SC-003**: The `docker-compose config` command successfully resolves variables from the `.env` without warnings.
- **SC-004**: Developer onboarding environment setup (`make setup-env` -> `docker-compose up`) takes under 3 minutes with zero manual file edits required to boot the system.

## Assumptions

- We assume the existing environment variables mapped in `.env` cover all current system integrations.
- We assume the target Spring Boot version is 3.x, requiring Jakarta EE namespaces and modern Security DSL.
- We assume Docker Compose v2 is the standard runtime environment for developers.
