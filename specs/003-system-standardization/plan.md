# Implementation Plan: [FEATURE]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]

**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Standardize environment configurations (`.env`), fix Next.js API proxy routing to use port 8080 uniformly, implement production-ready multi-stage Docker builds, and ensure Flyway is utilized strictly for schema management, while converting all `Makefile` and `scripts/` to rely solely on Docker environments to eliminate host dependencies.

## Technical Context

**Language/Version**: Java 21, Node.js 20

**Primary Dependencies**: Spring Boot 3.5, Next.js 15 (Turbopack), Docker, Flyway

**Storage**: PostgreSQL 16 (via Docker)

**Testing**: JUnit, Jest/Vitest

**Target Platform**: Local Development (Docker + WSL/macOS), Production (Docker Compose / Render)

**Project Type**: Full-stack Web Application (Next.js frontend, Spring Boot API)

**Performance Goals**: Frictionless <5s local environment spin-up

**Constraints**: Local dev must support Hot Module Replacement (HMR) natively without port conflicts. 

**Scale/Scope**: Developer onboarding configuration + CI/CD container profiles

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] Keeps simple things simple (Single `.env` source of truth)
- [x] Standardized Docker mappings
- [x] Clear developer onboarding via `Makefile`

## Project Structure

### Documentation (this feature)

```text
specs/003-system-standardization/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
backend/
├── src/main/resources/db/migration/
├── Dockerfile
└── pom.xml

frontend/
├── .env.local.example
├── next.config.mjs
└── Dockerfile

/ (Root)
├── .env.example
├── docker-compose.yml
├── docker-compose.prod.yml
├── Makefile
└── scripts/
```

**Structure Decision**: Utilizing the existing Web application Option 2 structure, standardizing the root-level infrastructure files (`.env`, `docker-compose.yml`, `Makefile`).

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |
