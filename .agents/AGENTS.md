# Agent Customizations & Boundaries

This file defines the strict boundaries and operational rules for AI agents working in this monorepo. 

## Project Context
- **Name**: Faith Laundry Shop Management System
- **Architecture**: Next.js App Router (Frontend) + Spring Boot REST API (Backend)
- **Primary Governance**: See `.specify/memory/constitution.md` for strict coding guidelines, testing frameworks, and branching rules.

## Module Boundaries

To prevent cross-stack bleeding, adhere to these module boundaries when executing tasks:

### 1. Frontend Scope
- **Directory**: `frontend/`
- **Tech Stack**: Next.js, React, TailwindCSS, Zod, Vitest.
- **Rule**: When executing a frontend user story, do NOT attempt to modify backend controllers or entity models to force the UI to work. If an API contract is missing fields, consult the user or transition to a backend execution context.

### 2. Backend Scope
- **Directory**: `backend/`
- **Tech Stack**: Java 21, Spring Boot, Spring Data JPA, Flyway, Testcontainers, JUnit.
- **Rule**: When executing a backend API change, do NOT simultaneously rewrite frontend React components unless explicitly asked to do a full-stack sync in one pass. Ensure you follow the Feature-First directory structure (`backend/src/main/java/com/himotech/laundryms/[feature]`).

## Shared Documentation Scope
- **Directory**: `specs/`, `docs/`, `.specify/`
- **Rule**: Updates to API Contracts (`specs/[feature]/contracts/api.md`) or database schemas MUST be agreed upon before writing code for either the frontend or backend.

## Tech Stack Invariants
- **Backend Tests**: Always use JUnit and Testcontainers. Do not assume Pytest or generic testing frameworks.
- **Frontend Tests**: Always use Vitest.
- **Database Migrations**: Always document and utilize Flyway migrations in specifications.

## Branching Strategy
When creating or proposing branches, STRICTLY adhere to the following prefixes derived from project history:
- `feature/*`
- `polish/*`
- `chore/*`
- `docs/*`
- `test/*`
- `appmod/*`
- `copilot/*`
- `dependabot/*`
Never use generic prefixes like `feat/` or `fix/` unless explicitly requested.

## Tooling Constraints: Shadcn
- **WARNING**: The `shadcn` CLI is considered dangerous in this repository because it destructively modifies `utils.ts`. 
- If you must use the `shadcn` CLI to add components, you MUST backup and manually restore `utils.ts` to its exact prior state immediately afterward.
