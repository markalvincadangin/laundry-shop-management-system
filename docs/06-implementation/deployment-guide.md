# Deployment Guide — Faith Laundry Shop Management System

> **Version:** 1.1  
> **Date:** 2026-02-20  
> **Purpose:** Production and development deployment instructions  
> **Related:** [Project Scope § 9 Operational Readiness](../01-scope/project-scope.md#9-operational-readiness-complete-system)

---

## 1. Prerequisites

- **Docker** and **Docker Compose** (v2+)
- **Java 21** (for local backend development)
- **Node.js 18 LTS or 20** (for local frontend development)
- **PostgreSQL 16** (or use Docker)

---

## 2. Environment Variables

Configuration is **per component**. Create env files by copying from the corresponding `.env.example` in each folder:

| File | Purpose |
|------|---------|
| `docker/.env.docker` | Docker Compose (DB credentials, port). Copy from `docker/.env.example`. |
| `backend/.env` | Spring Boot (DB URL, JWT, CORS). Copy from `backend/.env.example`. |
| `frontend/.env.local` | Next.js (API URL). Copy from `frontend/.env.example`. |

**Key variables:**

| Variable | Required | Description |
|---------|----------|-------------|
| `DB_PASSWORD` | Yes | PostgreSQL password |
| `DB_NAME` | No | Database name (default: `laundry_db`) |
| `DB_USER` | No | Database user (default: `laundry_user`) |
| `DB_PORT` | No | Host port for PostgreSQL (default: `5433`) |
| `JWT_SECRET` | Yes (prod) | At least 32 characters for JWT signing |
| `ALLOWED_ORIGIN` | No | CORS origin (default: `http://localhost:3000`) |
| `NEXT_PUBLIC_API_URL` | Yes (frontend) | Backend API base URL (e.g. `http://localhost:8080/api`) |

---

## 3. Docker Compose — Full Stack

Run the entire stack (PostgreSQL + Backend + Frontend):

```bash
# From project root
docker compose -f docker/docker-compose.fullstack.yml up -d

# View logs
docker compose -f docker/docker-compose.fullstack.yml logs -f
```

**Access:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8080/api
- Health check: http://localhost:8080/api/v1/health or http://localhost:8080/actuator/health

**Stop:**
```bash
docker compose -f docker/docker-compose.fullstack.yml down
```

---

## 4. Docker Compose — Database Only (Local Development)

For local development with backend and frontend running natively:

```bash
# From project root; use docker/.env.docker for DB credentials
docker compose -f docker/docker-compose.yml --env-file docker/.env.docker up -d
```

---

## 5. Manual Deployment (Without Docker)

### 5.1 Database

1. Install PostgreSQL 16
2. Create database and user:
   ```sql
   CREATE DATABASE laundry_db;
   CREATE USER laundry_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE laundry_db TO laundry_user;
   ```
3. Run Flyway migrations (automatic on backend startup)

### 5.2 Backend

```bash
cd backend
./mvnw -B package -DskipTests
java -jar target/laundryms-backend-*.jar
```

Required environment variables: `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `JWT_SECRET`

### 5.3 Frontend

```bash
cd frontend
npm ci
NEXT_PUBLIC_API_URL=http://your-api-url/api npm run build
npm start
```

---

## 6. Production Deployment (Phase 14)

### 6.1 Production Docker Compose

Deploy the full stack with Nginx reverse proxy:

```bash
# From project root
# 1. Configure .env for production (see 6.2)
# 2. Build and start
docker compose -f docker/docker-compose.prod.yml up -d --build

# View logs
docker compose -f docker/docker-compose.prod.yml logs -f

# Stop
docker compose -f docker/docker-compose.prod.yml down
```

**Access:** http://localhost (or your server IP/domain) — Nginx proxies to backend and frontend.

### 6.2 Production Environment Variables

| Variable | Required | Description |
|---------|----------|-------------|
| `DB_PASSWORD` | Yes | Strong PostgreSQL password |
| `JWT_SECRET` | Yes | At least 32 characters |
| `ALLOWED_ORIGIN` | Yes | Full frontend URL (e.g., `http://192.168.1.100` or `https://laundry.example.com`) |
| `NEXT_PUBLIC_API_URL` | Yes | Full API URL (e.g., `http://192.168.1.100/api` or `https://laundry.example.com/api`) |

**Important:** `NEXT_PUBLIC_API_URL` is baked into the frontend at build time. Rebuild the frontend container if you change it.

### 6.3 Enable HTTPS (Self-Signed)

```bash
# Generate self-signed certificate
sh docker/nginx/generate-ssl.sh

# Use SSL config
cp docker/nginx/nginx-ssl.conf docker/nginx/nginx.conf

# Restart Nginx
docker compose -f docker/docker-compose.prod.yml restart nginx
```

Access via https://localhost (browsers will show a warning for self-signed certs; accept for local use).

### 6.4 Database Backup

Run the backup script manually or schedule it (e.g., nightly via cron or Task Scheduler):

```bash
# Linux/macOS
./scripts/backup-database.sh /path/to/backups

# Windows PowerShell
.\scripts\backup-database.ps1 -BackupDir C:\Backups\laundry
```

Backups are saved as `laundry_db_YYYYMMDD_HHMMSS.sql.gz`.

**Backup script — environment variables**

The project uses **per-component** env files (`docker/.env.docker`, `backend/.env`, `frontend/.env.local`). The backup scripts expect database credentials in one of these ways:

1. **Project root `.env`** — If you create a root `.env` with `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, and `DB_PASSWORD`, the scripts will load it automatically.
2. **Export before running** — Source the same values you use for the backend:
   ```bash
   # Linux/macOS (using backend/.env)
   set -a && . backend/.env && set +a
   ./scripts/backup-database.sh /path/to/backups
   ```
   Or with Docker env:
   ```bash
   set -a && . docker/.env.docker && set +a
   ./scripts/backup-database.sh /path/to/backups
   ```
   On Windows PowerShell, set `$env:DB_HOST`, `$env:DB_PORT`, etc. from `backend\.env` or `docker\.env.docker` before running the script.
3. **Docker-only path** — If the script runs inside a host that has no `.env` but the database runs in Docker, the script can use Docker exec and will use `DB_USER`, `DB_NAME` from the environment you set; ensure `DB_PASSWORD` is set if the container expects it (scripts use defaults for host/port when using Docker exec).

Use the same `DB_*` values as your running backend (e.g. from `backend/.env` or `docker/.env.docker`) so the backup connects to the correct database.

### 6.5 Restore from Backup

To restore the database from a backup file `laundry_db_YYYYMMDD_HHMMSS.sql.gz`:

**Option A: PostgreSQL client (pg_restore not used; dump is plain SQL)**

1. Stop the backend application (so no connections hold locks).
2. Drop and recreate the database (or drop all objects in the target DB), or restore into a fresh database:
   ```bash
   # Create a fresh database (optional: drop existing first)
   psql -h localhost -p 5433 -U postgres -c "DROP DATABASE IF EXISTS laundry_db;"
   psql -h localhost -p 5433 -U postgres -c "CREATE DATABASE laundry_db OWNER laundry_user;"
   ```
3. Restore the dump:
   ```bash
   gunzip -c /path/to/backups/laundry_db_YYYYMMDD_HHMMSS.sql.gz | psql -h localhost -p 5433 -U laundry_user -d laundry_db
   ```
   Or on Windows (PowerShell):
   ```powershell
   Get-Content "C:\Backups\laundry\laundry_db_YYYYMMDD_HHMMSS.sql.gz" | gunzip -c | psql -h localhost -p 5433 -U laundry_user -d laundry_db
   ```
   If you don’t have `gunzip` on Windows, use 7-Zip or similar to decompress to `.sql`, then:
   ```powershell
   psql -h localhost -p 5433 -U laundry_user -d laundry_db -f path\to\laundry_db_YYYYMMDD_HHMMSS.sql
   ```

**Option B: Restore via Docker (database in container)**

If PostgreSQL runs in Docker (e.g. `laundry-postgres` or `laundry-postgres-prod`):

1. Copy the backup file into the container (or mount it), then run:
   ```bash
   gunzip -c /path/to/laundry_db_YYYYMMDD_HHMMSS.sql.gz | docker exec -i laundry-postgres psql -U laundry_user -d laundry_db
   ```
   To restore into a **fresh** database in the same container:
   ```bash
   docker exec -i laundry-postgres psql -U laundry_user -d postgres -c "DROP DATABASE IF EXISTS laundry_db;"
   docker exec -i laundry-postgres psql -U laundry_user -d postgres -c "CREATE DATABASE laundry_db;"
   gunzip -c /path/to/laundry_db_YYYYMMDD_HHMMSS.sql.gz | docker exec -i laundry-postgres psql -U laundry_user -d laundry_db
   ```

**After restore**

- Restart the backend. Flyway will see existing schema; no migration rerun is needed if the dump included the full schema.
- Verify with a quick health check: `GET http://localhost:8080/api/v1/health` or `GET http://localhost:8080/actuator/health`.

### 6.6 User Manual

See [docs/06-implementation/user-manual.md](user-manual.md) for the Owner and Staff guide. Export to PDF if needed (e.g., `pandoc user-manual.md -o user-manual.pdf`).

---

## 7. Production Checklist

- [ ] Set `SPRING_PROFILES_ACTIVE=prod` for JSON structured logging
- [ ] Use a strong `JWT_SECRET` (≥32 characters)
- [ ] Set `ALLOWED_ORIGIN` to your frontend domain
- [ ] Use HTTPS in production
- [ ] Ensure `DB_PASSWORD` is not the default
- [ ] Run backend as non-root user
- [ ] Configure database backups

---

## 8. Troubleshooting

| Issue | Solution |
|-------|----------|
| Backend fails to connect to DB | Ensure PostgreSQL is running; check `DB_HOST` (use `postgres` when using Docker Compose) |
| CORS errors | Set `ALLOWED_ORIGIN` to the exact frontend URL |
| Frontend shows API errors | Verify `NEXT_PUBLIC_API_URL` matches backend URL (baked at build time) |
| JWT validation fails | Ensure `JWT_SECRET` is identical across restarts |
