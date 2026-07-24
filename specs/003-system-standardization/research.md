# Phase 0: Research

**Decision**: Standardize `BACKEND_PORT=8080` globally across `.env` and `docker-compose.yml`.
**Rationale**: Previously, `.env` defined `BACKEND_PORT=8081` while `frontend/.env.local.example` routed API proxy traffic to `8080`, leading to `ECONNREFUSED` when developers ran the frontend natively using Turbopack against the Dockerized backend.
**Alternatives considered**: Changing `frontend/.env.local.example` to `8081` was considered, but keeping Spring Boot and the infrastructure standard at `8080` everywhere is more consistent with standard Java web applications.

**Decision**: Retain `01-enable-pgcrypto.sql` in `docker-entrypoint-initdb.d/`.
**Rationale**: `pgcrypto` is a PostgreSQL extension requiring superuser privileges. Flyway runs as the standard application user, not the superuser. Installing extensions during the container initialization phase is the industry-standard separation of concerns.

**Decision**: Convert `scripts/backup-database.sh` to strictly use `docker exec` against `laundry-postgres`.
**Rationale**: Developers using Windows WSL or varying MacOS versions may not have `pg_dump` installed on the host. Funneling the dump command directly into the running Docker container ensures 100% dependency compatibility.
