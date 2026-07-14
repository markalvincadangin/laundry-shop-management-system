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

## Scripting & Dependencies
- **Avoid non-standard CLI tools in bash scripts**: Do not assume tools like `jq` are installed in the environment. When parsing configuration files or command outputs, prefer standard POSIX/GNU tools like `grep`, `awk`, and `sed`. If a tool like `jq` is absolutely necessary, the script must explicitly check for its existence and handle its absence gracefully.
- **Cross-Platform Scripting**: When creating or modifying utility scripts (e.g., in `scripts/`), maintain both Linux/WSL (`.sh`) and Windows (`.ps1`) versions if the project requires cross-platform support. Ensure `Makefile` targets delegate to the `.sh` versions.
