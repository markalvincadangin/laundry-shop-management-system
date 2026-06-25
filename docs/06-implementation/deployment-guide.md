# Deployment Guide — Faith Laundry Shop Management System

> **Version:** 1.2  
> **Date:** 2026-05-18  
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

Configuration is centralized in a **single `.env` file** at the root of the project.

| File | Purpose |
|------|---------|
| `.env` | Unified configuration (DB credentials, JWT secrets, App settings). Copy from `.env.example`. |

**Key variables:**

| Variable | Required | Description |
|---------|----------|-------------|
| `DB_PASSWORD` | Yes | PostgreSQL password |
| `DB_NAME` | No | Database name (default: `laundry_db`) |
| `DB_USER` | No | Database user (default: `laundry_user`) |
| `DB_PORT` | No | Host port for PostgreSQL (default: `5433`) |
| `JWT_SECRET` | Yes (prod) | At least 32 characters for JWT signing |
| `ALLOWED_ORIGIN` | No | CORS origin (default: `http://localhost:3001`) |
| `NEXT_PUBLIC_API_URL` | Yes (frontend) | Backend API base URL (e.g. `http://localhost:8080/api`) |

---

## 3. Local Development (Recommended — Hybrid)

**Default workflow:** PostgreSQL + backend in Docker, frontend on the host with Turbopack (fastest hot reload on Windows/macOS).

```bash
# Terminal 1 — from project root
docker compose up db backend

# Terminal 2 — frontend on host
cd frontend
cp .env.local.example .env.local   # first time only; set NEXT_PUBLIC_API_URL to match BACKEND_PORT
npm run dev
```

| Service | Where | URL |
|---------|-------|-----|
| Frontend | Host (Turbopack) | http://localhost:3000 or :3001 |
| Backend API | Docker | http://localhost:8080/api (or `BACKEND_PORT` from `.env`) |
| PostgreSQL | Docker | localhost:`DB_PORT` (default `5433`) |

**Environment alignment:**
- Root `.env` → `ALLOWED_ORIGIN` must match your frontend URL (e.g. `http://localhost:3001`)
- `frontend/.env.local` → `NEXT_PUBLIC_API_URL=http://localhost:<BACKEND_PORT>/api`

**Stop:**
```bash
docker compose down
```

### 3.1 Optional — Full Stack in Docker

Use only when you need everything containerized (e.g. CI parity, Linux teammates):

```bash
docker compose --profile full up -d
```

Frontend container uses Turbopack with file-watcher polling (`DOCKER_DEV=true`). Slower than host dev on Windows bind mounts.

---

## 4. Docker Compose — Database: PostgreSQL 16 via Docker Compose

- **Configuration:** `.env` — gitignored; use `.env.example` as template
- **Secrets:** Never committed; JWT secret, DB credentials in `.env`
- **Orchestration:** `docker compose up -d`

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
docker compose -f docker-compose.prod.yml up -d --build

# View logs
docker compose -f docker-compose.prod.yml logs -f

# Stop
docker compose -f docker-compose.prod.yml down
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
docker compose -f docker-compose.prod.yml restart nginx
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

The backup scripts expect database credentials and will automatically load them from the **project root `.env`** file.

If you need to run the script from an environment without the `.env` file (like a cron job), you can source the variables directly:

```bash
# Linux/macOS
set -a && . /path/to/project/.env && set +a
./scripts/backup-database.sh /path/to/backups
```

On Windows PowerShell, the script `backup-database.ps1` will automatically look for `.env` in the root folder, or you can pass variables manually (e.g., `$env:DB_PASSWORD="..."`).

**Docker-only path** — If the script runs inside a host that has no `.env` but the database runs in Docker, the script can use Docker exec and will use `DB_USER`, `DB_NAME` from the environment you set; ensure `DB_PASSWORD` is set if the container expects it.

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

See [docs/06-implementation/user-manual.md](user-manual.md) for the Admin and Staff guide. Export to PDF if needed (e.g., `pandoc user-manual.md -o user-manual.pdf`).

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

## 8. Cloud Deployment (Render + Neon + Vercel)

The project is deployed to the cloud using:
- **Render** — Backend (Spring Boot) web service
- **Neon** — PostgreSQL serverless database
- **Vercel** — Frontend (Next.js) hosting

### 8.1 Neon Database Setup

1. Create a project on [neon.tech](https://neon.tech)
2. Note your connection details:
   - Host: `<your-id>.neon.tech`
   - Database: `faith-laundry-shop`
   - User: `neondb_owner`
   - Port: `5432`
3. The `pgcrypto` extension is pre-installed on Neon.

### 8.2 Render Backend Setup

1. Create a **Web Service** on [render.com](https://render.com)
2. Connect your GitHub repository, set root directory to `backend/`
3. **Build Command:** `./mvnw -B package -DskipTests`
4. **Start Command:** `java -jar target/laundryms-backend-*.jar`
5. Set environment variables in Render Dashboard → Environment:

| Variable | Value |
|---|---|
| `SPRING_PROFILES_ACTIVE` | `prod` |
| `DB_HOST` | `<your-host>.neon.tech` |
| `DB_PORT` | `5432` |
| `DB_NAME` | `faith-laundry-shop` |
| `DB_USER` | `neondb_owner` |
| `DB_PASSWORD` | `<neon-password>` |
| `JWT_SECRET` | `<random-64-char-string>` |
| `ALLOWED_ORIGIN` | `https://your-app.vercel.app` |
| `ALLOWED_ORIGIN_PATTERNS` | `https://your-app.vercel.app,https://*.vercel.app` |

> **Neon SSL:** The `prod` profile sets `sslmode=require` on the JDBC URL automatically. No extra env var needed.

> 💡 **Database Reset:** To reset production data, use the Neon dashboard (delete/recreate branch) or run `DROP SCHEMA public CASCADE; CREATE SCHEMA public;` via the Neon SQL Editor. Then redeploy on Render — Flyway will re-apply all migrations.

### 8.3 Vercel Frontend Setup

1. Import the repository on [vercel.com](https://vercel.com)
2. Set root directory to `frontend/`
3. Set environment variables:
   - `NEXT_PUBLIC_API_URL` = `https://your-render-backend.onrender.com/api`
4. Deploy.

### 8.4 Render Free Tier Notes

- Services spin down after **15 minutes** of inactivity (cold start ~60s)
- **Neon free tier** also cold-starts compute (~2–5s on first query after idle)
- Environment variables persist across restarts and redeploys
- The filesystem is **ephemeral** — uploaded files are lost on restart
- Database data is safe on Neon (persistent, durable storage)
- **Vercel does not spin down** — no keep-alive needed for the frontend

### 8.5 Keep-Alive (Prevent Render Cold Starts)

Render free tier needs inbound HTTP traffic at least every 15 minutes. Two options:

#### Option A — UptimeRobot (recommended, primary)

Free, reliable, does not use GitHub Actions minutes.

1. Create a free account at [uptimerobot.com](https://uptimerobot.com)
2. Add a **HTTP(s) monitor**:
   - **URL:** `https://your-backend.onrender.com/actuator/health`
   - **Interval:** 5 minutes
   - **Expected:** HTTP 200
3. Save — UptimeRobot pings automatically 24/7

#### Option B — GitHub Actions (secondary)

Workflow: `.github/workflows/maintenance.yml` (runs every 10 minutes on `main`).

**GitHub secret required:**

| Secret | Value |
|--------|-------|
| `RENDER_BACKEND_URL` | `https://your-backend.onrender.com` (no trailing slash) |

**Known limitations:**
- Requires available GitHub Actions minutes (billing); failed payment blocks runs entirely
- Scheduled cron can jitter by several minutes during high GitHub load
- Workflow must exist on the **`main`** branch
- Disabled automatically after 60 days of repository inactivity

Use UptimeRobot as primary; keep the GitHub workflow as backup only if Actions minutes are available.

---

## 9. Troubleshooting

| Issue | Solution |
|-------|----------|
| Backend fails to connect to DB (local) | Ensure PostgreSQL is running; check `DB_HOST` (use `db` in Docker Compose, `localhost` on host) |
| Backend fails to connect to Neon | Confirm `SPRING_PROFILES_ACTIVE=prod` (enables `sslmode=require`); verify Neon credentials in Render |
| CORS errors | Set `ALLOWED_ORIGIN` to the exact frontend URL |
| Frontend shows API errors | Verify `NEXT_PUBLIC_API_URL` matches backend URL (baked at Vercel build time) |
| JWT validation fails | Ensure `JWT_SECRET` is identical across restarts |
| Render cold starts persist | Set up UptimeRobot (§8.5); check GitHub Actions billing if using the backup workflow |
| GitHub keep-alive workflow fails | Settings → Billing — resolve payment or spending limit; verify `RENDER_BACKEND_URL` secret |
