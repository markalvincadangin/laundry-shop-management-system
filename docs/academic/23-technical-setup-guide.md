# Technical Setup Guide
## Faith Laundry Shop Management System

> **Client:** Faith Laundry Shop  
> **Prepared By:** HIMÓTECH  
> **Document ID:** TSG-001  
> **Version:** 1.1  
> **Date:** 2026-05-17  
> **Purpose:** Provide instructions for deploying and setting up the environment  
> **Status:** Baseline

---

## Document Control
- **Document Type:** Technical Guide
- **Primary Source:** Development Team
- **Related Documents:** [Technology Stack](15-technology-stack.md)
- **Confidentiality:** Internal / Academic Use

---

This guide is intended for developers or IT personnel deploying the Faith Laundry Shop Management System on a new machine or server.

## 1. Prerequisites
Ensure the following software is installed on the host machine:
- **Docker & Docker Compose:** For running the database and all application containers.
- **Java Development Kit (JDK) 21:** Only if running the backend locally outside Docker.
- **Node.js (v18+) & npm:** Only if running the frontend locally outside Docker.
- **Git:** For cloning the project repository.

## 2. Environment Variables
Create a `.env` file in the root directory by copying the `.env.example` file:
```
cp .env.example .env
```

Edit the `.env` file and configure the following variables:

**Database Configuration:**
```env
DB_HOST=localhost
DB_NAME=laundry_db
DB_USER=laundry_user
DB_PASSWORD=laundry_password_change_me
DB_PORT=5433
```

**Backend Configuration:**
```env
SPRING_PORT=8080
SPRING_PROFILES_ACTIVE=dev
JWT_SECRET=dev-secret-change-in-production-minimum-32-characters-required
ALLOWED_ORIGIN=http://localhost:3001
ALLOWED_ORIGIN_PATTERNS=http://localhost:3001,https://*.ngrok-free.app
```

**Dev Seed Accounts (dev profile only):**
```env
SEED_ADMIN_USERNAME=admin
SEED_ADMIN_PASSWORD_HASH=replace_with_bcrypt_hash
SEED_STAFF_USERNAME=staff
SEED_STAFF_PASSWORD_HASH=replace_with_bcrypt_hash
APP_SEED_ADMIN_PASSWORD=admin123
APP_SEED_STAFF_PASSWORD=staff123
```

**Frontend Configuration:**
```env
FRONTEND_PORT=3001
NEXT_PUBLIC_API_URL=http://backend:8080/api
```

**SMS Notifications (Optional):**
```env
SEMAPHORE_API_KEY=your_api_key_here
SEMAPHORE_SENDER_NAME=FaithLaundry
```

## 3. Running via Docker (Recommended)
1. Open a terminal in the root project directory.
2. Run the command: `docker-compose up -d --build`
3. Wait for the containers to initialize. The PostgreSQL database must pass its health check before the backend starts.
4. The Backend API will be available at `http://localhost:8080`.
5. The Frontend App will be available at `http://localhost:3001` (or the port defined in `FRONTEND_PORT`).

## 4. Running Locally (Without Docker)

### 4.1 Database
Start the PostgreSQL database container only:
```
docker-compose up -d db
```

### 4.2 Backend
```
cd backend
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```
The backend will start on port 8080 and automatically connect to the database.

### 4.3 Frontend
```
cd frontend
npm install
npm run dev
```
The frontend will start on port 3001 and connect to the backend API.

## 5. Database Migrations
The backend utilizes **Flyway** for database migrations. When the Spring Boot application starts, it will automatically connect to the PostgreSQL database and run any pending `.sql` migration scripts found in `backend/src/main/resources/db/migration/`. No manual database creation is required other than providing the blank schema via Docker.

The initial migration (`V1__init.sql`) creates all core tables, audit infrastructure, triggers, and seed data for service rates. The second migration (`V2__seed_users.sql`) creates development user accounts using Flyway placeholders — these are only populated when the `SPRING_PROFILES_ACTIVE` is set to `dev` and the corresponding seed environment variables are provided.

## 6. Production Deployment
For production deployment (e.g., on Render), set the following environment variables in the hosting dashboard:

- `SPRING_PROFILES_ACTIVE=prod`
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` — pointing to the production PostgreSQL instance (e.g., Neon).
- `JWT_SECRET` — a cryptographically random string of at least 32 characters.
- `ALLOWED_ORIGIN` — the production frontend URL (e.g., `https://your-app.vercel.app`).

Do **not** set the `SEED_*` variables in production to avoid creating default privileged accounts.
