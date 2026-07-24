# Tasks: 010-config-standardization

## Phase 1: Setup (Shared Infrastructure)
- [x] T001 Initialize standardized `.env.example` with clear documentation and safe placeholder values

## Phase 2: Foundational (Blocking Prerequisites)
- [x] T002 Update `.gitignore` to explicitly prevent `.env`, `.env.*.local`, and any override files containing secrets from being committed

## Phase 3: User Story 1 - Standardized Local Environment Setup (Priority: P1) 🎯 MVP
**Goal**: Standardized and predictable way to configure local development and production environments using `.env` files and `docker-compose`.

- [x] T003 [US1] Standardize `docker-compose.yml` to define core services only
- [x] T004 [US1] Create `docker-compose.override.yml.example` for local development volume mapping/ports
- [x] T005 [US1] Create `docker-compose.prod.yml` to enforce production constraints
- [x] T006 [US1] Expose standard targets `setup-env`, `up-dev`, and `up-prod` in `Makefile`
- [x] T007 [US1] Delete `backend/src/main/java/com/himotech/laundryms/config/seed/DemoDataSeeder.java`
- [x] T008 [US1] Create Flyway migration script `backend/src/main/resources/db/migration/dev/R__demo_data.sql` with DemoDataSeeder logic
- [x] T009 [US1] Update `backend/src/main/resources/application-dev.yml` to include `classpath:db/migration/dev` in `spring.flyway.locations`

## Phase 4: User Story 2 - Type-Safe Spring Configuration (Priority: P1)
**Goal**: Strictly typed and validated application configurations at startup.

- [x] T010 [P] [US2] Update/Create `@ConfigurationProperties` class `backend/src/main/java/com/himotech/laundryms/config/SecurityProperties.java`
- [x] T011 [US2] Update/Create `@ConfigurationProperties` class `backend/src/main/java/com/himotech/laundryms/config/AppProperties.java` for general properties
- [x] T012 [US2] Refactor `backend/src/main/resources/application.yml` to align with the new configuration properties

## Phase 5: User Story 3 - Clean Security and Filter Chains (Priority: P2)
**Goal**: Use latest Spring Security DSL and explicit filter ordering.

- [x] T013 [P] [US3] Update `backend/src/main/java/com/himotech/laundryms/config/SecurityConfig.java` to inject `@ConfigurationProperties` instead of `@Value`
- [x] T014 [P] [US3] Add `@Order` annotation to `backend/src/main/java/com/himotech/laundryms/config/RequestResponseLoggingFilter.java`
- [x] T015 [US3] Add `@Order` annotation to `backend/src/main/java/com/himotech/laundryms/auth/JwtCookieAuthFilter.java`

## Phase 6: Polish & Cross-Cutting Concerns
- [ ] T016 Run `make test-backend` to verify configuration starts cleanly
- [ ] T017 Verify system boots via `make setup-env` and `make up-dev`
