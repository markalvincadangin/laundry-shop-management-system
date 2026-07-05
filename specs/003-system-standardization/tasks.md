# Implementation Tasks: System Standardization

**Branch**: `003-system-standardization`
**Spec**: [spec.md](./spec.md)

## Phase 1: Environment Standardisation (Priority: P1)

**Goal**: Establish a single source of truth for ports and configuration.

- [ ] T001 Update `.env.example` to set `BACKEND_PORT=8080` and improve comments.
- [ ] T002 Update `.env` to match `.env.example`.
- [ ] T003 Update `frontend/.env.local.example` to point `NEXT_PUBLIC_API_URL` to `http://localhost:8080/api`.

## Phase 2: Containerization Standardization (Priority: P1)

**Goal**: Standardize Docker Compose files for dev and prod.

- [x] T004 Update `docker-compose.yml` to explicitly bind to `8080:8080` and use internal Docker networking `http://backend:8080/api` for the frontend.
- [x] T005 Update `docker-compose.prod.yml` to standardize Next.js standalone mode configuration.
- [x] T006 Update `docker-compose.override.yml.example` to provide clear debugging port instructions.

## Phase 3: Automation Scripts (Priority: P2)

**Goal**: Migrate all scripts to be Docker-dependent, eliminating host OS dependency issues.

- [x] T007 Update `Makefile` to include standard automation commands (`backup`, `fresh`).
- [x] T008 Update `scripts/backup-database.sh` to solely rely on `docker exec` against `laundry-postgres`.
- [x] T009 Update `scripts/backup-database.ps1` to match the `.sh` logic.
- [x] T010 Update `scripts/fresh.ps1` to trigger a clean wipe and Flyway re-seed.
- [x] T011 Update `scripts/share.ps1` to properly parse the `.env` standard.

## Phase 4: Verification

**Goal**: Prove the standard works locally.

- [x] T012 Run `make clean` and `make up` to verify container spin-up.
- [x] T013 Verify the Next.js API proxy functions natively.
