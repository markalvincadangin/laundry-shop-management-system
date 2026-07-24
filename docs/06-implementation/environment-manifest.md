# 🔐 Environment Variables Manifest — Faith Laundry Shop

This document serves as the **Canonical Source of Truth** for all environment variables used in the Faith Laundry Management System. It defines the mapping, security requirements, and runtime distinctions across the project.

---

## 🏛️ Architecture Overview

The system uses a **unified `.env` file** at the project root for all runtime modes.

| Runtime Mode | Config File | Description |
| :--- | :--- | **Local Development (Docker)** | `.env` (root) | For the containerized dev stack via `docker compose` / `make up-dev`. |
| **Local Development (Native)** | `.env` (root) | For running services directly on the host machine (`npm run dev` + Spring Boot). |
| **Production (Standalone Counter)** | Machine Env / `.env` | Installed automatically via single-file `.exe` setup wizard. |

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
| `DB_PORT` | `5432` | Host port mapping for PostgreSQL background service. | Low |

### 2. Backend Configuration
*Business rules and security tokens for the Spring Boot service.*

| Variable | Default (Dev) | Description | Security |
| :--- | :--- | :--- | :--- |
| `SPRING_PORT` | `8080` | Server port for the Spring Boot app. | Low |
| `SPRING_PROFILES_ACTIVE` | `dev` | Activates profile-specific behavior (dev / prod). | Medium |
| `JWT_SECRET` | _(none)_ | Secret key for HS256 signing. Must be ≥ 32 chars. | **CRITICAL** |
| `ALLOWED_ORIGIN` | `http://localhost:3000` | CORS policy for frontend access. | High |
| `ALLOWED_ORIGIN_PATTERNS` | `https://*.vercel.app,https://*.faithlaundry.com` | Comma-separated CORS patterns for Cloudflare Tunnel / Vercel public tracking. | High |

### 3. Demo Seeding (Dev Only)
*Optional variables to initialize the system with default accounts.*

| Variable | Default (Dev) | Description |
| :--- | :--- | :--- |
| `SEED_ADMIN_USERNAME` | `admin` | Admin username created by Flyway migration. |
| `SEED_ADMIN_PASSWORD_HASH` | _(BCrypt hash)_ | Password hash for the admin account. |
| `SEED_STAFF_USERNAME` | `staff` | Staff username created by Flyway migration. |
| `SEED_STAFF_PASSWORD_HASH` | _(BCrypt hash)_ | Password hash for the staff account. |

### 4. Frontend Configuration

| Variable | Default (Dev) | Description | Exposed? |
| :--- | :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | `http://localhost:8080/api` | Base URL for API requests. | **YES** |

### 5. SMS Configuration (Optional)

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

To verify the Backend health endpoint:
```bash
curl http://localhost:8080/api/v1/health
```

---
*Updated 2026-07-24 — Aligned to Standalone Offline-First Architecture & Cloudflare Tunnel Topology.*ia prod profile, Render keep-alive guidance.*
