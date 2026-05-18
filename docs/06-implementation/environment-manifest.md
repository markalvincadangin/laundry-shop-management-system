# 🔐 Environment Variables Manifest — Faith Laundry Shop

This document serves as the **Canonical Source of Truth** for all environment variables used in the Faith Laundry Management System. It defines the mapping, security requirements, and runtime distinctions across the project.

---

## 🏛️ Architecture Overview

The system uses a **unified `.env` file** at the project root for all runtime modes.

| Runtime Mode | Config File | Description |
| :--- | :--- | :--- |
| **Local Development (Docker)** | `.env` (root) | For the full containerized dev stack via `docker compose up`. |
| **Local Development (Native)** | `.env` (root) | For running services directly on the host machine. |
| **Production (Self-Hosted)** | `.env` (root) | Used by `docker-compose.prod.yml` at the project root. |
| **Production (Cloud — Render)** | Render Dashboard → Environment | Set directly in the Render service settings. |

---

## 📂 Configuration Mapping

### 1. Database Configuration
*Shared across all services. Critical for persistence connectivity.*

| Variable | Default (Dev) | Description | Security |
| :--- | :--- | :--- | :--- |
| `DB_HOST` | `localhost` | Host address (`localhost` for Native, `db` for Docker). | Medium |
| `DB_NAME` | `laundry_db` | PostgreSQL database name. | Low |
| `DB_USER` | `laundry_user` | PostgreSQL username. | Medium |
| `DB_PASSWORD` | _(none)_ | PostgreSQL password. **Must be set.** | **CRITICAL** |
| `DB_PORT` | `5433` | Host port mapping (avoids conflict with local PG). | Low |

### 2. Backend Configuration
*Business rules and security tokens for the Spring Boot service.*

| Variable | Default (Dev) | Description | Security |
| :--- | :--- | :--- | :--- |
| `SPRING_PORT` | `8080` | Server port for the Spring Boot app. | Low |
| `SPRING_PROFILES_ACTIVE` | `dev` | Activates profile-specific behavior (dev / prod). | Medium |
| `JWT_SECRET` | _(none)_ | Secret key for HS256 signing. Must be ≥ 32 chars. | **CRITICAL** |
| `ALLOWED_ORIGIN` | `http://localhost:3001` | CORS policy for frontend access. | High |
| `ALLOWED_ORIGIN_PATTERNS` | _(none)_ | Comma-separated CORS patterns (e.g., `https://*.vercel.app`). | High |

### 3. Demo Seeding (Dev Only)
*Optional variables to initialize the system with default accounts.*

| Variable | Default (Dev) | Description |
| :--- | :--- | :--- |
| `SEED_ADMIN_USERNAME` | `admin` | Admin username created by Flyway migration V2. |
| `SEED_ADMIN_PASSWORD_HASH` | _(BCrypt hash)_ | Password hash for the admin account. |
| `SEED_STAFF_USERNAME` | `staff` | Staff username created by Flyway migration V2. |
| `SEED_STAFF_PASSWORD_HASH` | _(BCrypt hash)_ | Password hash for the staff account. |

### 5. Frontend Configuration

| Variable | Default (Dev) | Description | Exposed? |
| :--- | :--- | :--- | :--- |
| `FRONTEND_PORT` | `3001` | Host port for the Next.js dev server. | No |
| `NEXT_PUBLIC_API_URL` | `http://backend:8080/api` | Base URL for API requests (baked at build time). | **YES** |

### 6. SMS Configuration (Optional)

| Variable | Default | Description |
| :--- | :--- | :--- |
| `SEMAPHORE_API_KEY` | _(none)_ | API key for Semaphore.co SMS gateway. |
| `SEMAPHORE_SENDER_NAME` | `FaithLaundry` | SMS sender display name. |

---

## 🛡️ Security Policy

1. **Never Commit Secrets**: `.env` is in `.gitignore`. Only `.env.example` is committed.
2. **Use Examples**: Always maintain `.env.example` when adding new variables.
3. **HS256 Standard**: JWT secrets in production must be randomly generated (e.g., `openssl rand -base64 32`).

---

## 🛠️ Management Commands

To check the current environment variables being seen by Docker:
```bash
docker compose config
```

To verify the Backend is loading correctly:
```bash
# Check the health endpoint
curl http://localhost:8080/api/v1/health

# Check the actuator endpoint (if enabled and authenticated)
curl http://localhost:8080/actuator/env
```

---

## ☁️ Render Production Variables

Set these in your **Render Dashboard → Service → Environment**:

| Variable | Value |
| :--- | :--- |
| `SPRING_PROFILES_ACTIVE` | `prod` |
| `DB_HOST` | `<your-host>.neon.tech` |
| `DB_PORT` | `5432` |
| `DB_NAME` | `faith-laundry-shop` |
| `DB_USER` | `neondb_owner` |
| `DB_PASSWORD` | `<neon-password>` |
| `JWT_SECRET` | `<random-64-char-string>` |
| `ALLOWED_ORIGIN` | `https://your-app.vercel.app` |
| `ALLOWED_ORIGIN_PATTERNS` | `https://your-app.vercel.app,https://*.vercel.app` |

> **Neon SSL:** `SPRING_PROFILES_ACTIVE=prod` enables `sslmode=require` on the JDBC URL (see `application-prod.yml`).

## 🔄 Render Keep-Alive

| Method | Config |
| :--- | :--- |
| **UptimeRobot** (recommended) | Monitor `https://your-backend.onrender.com/actuator/health` every 5 min |
| **GitHub Actions** (backup) | Secret `RENDER_BACKEND_URL` in repo Settings → Secrets; workflow `.github/workflows/maintenance.yml` |

See [deployment-guide.md §8.5](deployment-guide.md#85-keep-alive-prevent-render-cold-starts) for setup steps.

---
*Updated 2026-05-18 — Neon SSL via prod profile, Render keep-alive guidance.*
