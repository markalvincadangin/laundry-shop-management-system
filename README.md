# Faith Laundry Shop Management System

> **Client:** Faith Laundry Shop  
> **Developer:** HIMÓTECH  
> **Status:** Active Development (MVP Phase)

A centralized, full-stack information system designed to replace manual paper-based logbooks with a digital solution for laundry order recording, status tracking, payment management, and sales reporting.

---

## 📖 Project Overview

### The Client
**Faith Laundry Shop** is a small-scale laundry service business established in 2022, located in Ilaya, Tabuc Suba Jaro, Iloilo City. The business operates with one Admin and one staff member, providing washing, drying, and folding services on a per-load basis.

### The Problem
Faith Laundry Shop currently relies on **manual, paper-based processes** for all operations:
- **Physical tags** and **logbooks** are used to track laundry orders
- **Manual notebooks** record payments and sales
- **Order mix-ups** occur during peak hours when handling multiple orders
- **No automated reporting** — income tracking is entirely manual
- **Limited order tracking** — customers must call or visit to check laundry status

These manual processes are time-consuming, error-prone, and limit the Admin's visibility into business performance.

### The Solution
This system digitizes the entire laundry management workflow:
- Replace physical tags with **unique reference numbers** for tracking
- Replace logbooks with a **centralized database** storing all orders and status changes
- **Automate pricing calculations** based on weight, loads, and extra charges
- Provide **real-time order tracking** for customers using reference numbers
- Generate **automated daily, monthly, and yearly sales reports** for the Admin

---

## ✨ Key Features (MVP Scope)

Based on validated user stories from client interviews:

### 🛒 Order Management
- **Record laundry orders** with customer details (name, contact number, weight)
- **Automatically compute pricing** based on business rules (₱120 per 8 kg load)
- **Generate unique reference numbers** for each order
- Track **extra washing time** and **add-on charges** (e.g., fabric conditioner)

### 📊 Status Tracking
- Update order status through defined stages:
  - **Received** → **Washing** → **Drying** → **Folding** → **Ready for Pickup** → **Released**
- Maintain an **audit trail** of all status changes (who, when, what)
- Prevent premature release (orders must be "Ready for Pickup" and paid before release)

### 💰 Payment Management
- **Record payments** linked to specific orders (one payment per order)
- **Validate payment amounts** against computed order totals
- Track payment method (Cash, GCash, Bank Transfer)
- Update order payment status (Paid/Unpaid)

### 📈 Reporting & Analytics
- **Daily sales reports** — total income and completed orders per day
- **Monthly and yearly income reports** — business performance over time
- Reports based on **recorded payments only** (not just created orders)

### 🔍 Customer Tracking
- **Public tracking endpoint** — customers can check order status using the reference number
- No login required for basic tracking
- Limited data exposure (status, dates, no internal IDs)

### 👥 User Roles
- **Admin**: Full access to reports, rates management, all order operations
- **Staff**: Record orders, update status, record payments (no access to income reports)

---

## 🧮 Business Logic (Pricing & Rules)

These rules are enforced in the backend service layer and derived from **business-rules.md**:

### Pricing Rules
| Rule                       | Description                                    | Reference |
|----------------------------|------------------------------------------------|-----------|
| **Base Load Price**        | ₱120 per load, covering up to 8 kg             | BR-PR-01  |
| **Extra Load Calculation** | `total_loads = ceil(weight_kg / 8)`            | BR-PR-02  |
| **Extra Washing Time**     | ₱1 per extra minute beyond 45 minutes per load | BR-PR-03  |
| **Add-Ons**                | Flexible line items (e.g., fabric conditioner) | BR-PR-04  |

**Example Calculation:**
- Weight: 16.5 kg → `ceil(16.5 / 8) = 3 loads`
- Base amount: `3 loads × ₱120 = ₱360`
- Extra minutes: 10 minutes → `10 × ₱1 = ₱10`
- Add-on (fabric conditioner): ₱20
- **Grand Total: ₱390**

### Order Lifecycle Rules
| Rule                         | Description                                                   | Reference |
|------------------------------|---------------------------------------------------------------|-----------|
| **Unique Reference Numbers** | Every order must have a unique tracking reference             | BR-OL-01  |
| **Initial Status**           | New orders start with status `RECEIVED`                       | BR-OL-02  |
| **Status Transitions**       | Logical progression (no skipping backwards)                   | BR-OL-04  |
| **Release Precondition**     | Orders can only be released when status is `READY_FOR_PICKUP` and payment is recorded (Paid) | BR-OL-05  |

### Payment Rules
| Rule                         | Description                                  | Reference |
|------------------------------|----------------------------------------------|-----------|
| **One Payment Per Order**    | Each payment must link to exactly one order  | BR-PAY-02 |
| **Exact Amount Match (MVP)** | Payment amount must equal order grand total  | BR-PAY-03 |
| **Payment Timing**           | Payments are typically collected upon pickup | BR-PAY-01 |

> **Note:** Partial payments, overpayments, and Admin override capabilities are **post-MVP features**.

---

## 🏗️ System Architecture

### Technology Stack
| Layer                | Technology                  | Version                  |
|----------------------|-----------------------------|--------------------------|
| **Backend**          | Java (Spring Boot)          | 21 LTS, Spring Boot 3.3+ |
| **Frontend**         | Next.js (React, TypeScript) | 14+                      |
| **Database**         | PostgreSQL                  | 16                       |
| **Migrations**       | Flyway                      | Embedded                 |
| **Build Tool**       | Maven                       | 3.9+                     |
| **Containerization** | Docker & Docker Compose     | Latest                   |
| **Testing**          | JUnit 5 + Testcontainers    | Latest                   |

### High-Level Architecture

```
┌─────────────────┐
│   Web App       │  Next.js 14 (TypeScript + Tailwind CSS)
│   (Frontend)    │  - Order intake UI
│                 │  - Status updates
└────────┬────────┘  - Reports dashboard
         │           - Public tracking page
         │ HTTP/REST
         ▼
┌─────────────────┐
│   API Server    │  Spring Boot 3.3 (Java 21)
│   (Backend)     │  - Business rules enforcement
│                 │  - Pricing computation
└────────┬────────┘  - Auth & role-based access
         │           - Report generation
         │ JDBC
         ▼
┌─────────────────┐
│   Database      │  PostgreSQL 16
│   (PostgreSQL)  │  - UUIDs for users (gen_random_uuid())
│                 │  - Bigserial for orders/customers
└─────────────────┘  - Flyway migrations
```

### Database Architecture

The system uses **PostgreSQL 16** with the **pgcrypto extension** (required for UUID generation).

#### Core Tables

| Table                 | Primary Key      | Purpose                                                   | Key Relationships                                   |
|-----------------------|------------------|-----------------------------------------------------------|-----------------------------------------------------|
| **users**             | `id` (UUID)      | System users (Admin/Staff) with role-based access         | Created by: orders, payments                        |
| **customers**         | `id` (bigserial) | Customer contact information                              | Referenced by: orders, notifications                |
| **service_rates**     | `id` (int)       | Configurable pricing rules (₱120/8kg, ₱1/min)             | Referenced by: orders (snapshot)                    |
| **orders**            | `id` (bigserial) | Central transaction table with computed totals and status | Links to: customers, users, service_rates, payments |
| **order_add_ons**     | `id` (bigserial) | Flexible additional charges per order                     | Links to: orders                                    |
| **activity_logs**     | `id` (bigserial) | Forensic audit trail (INSERT/UPDATE/DELETE via DB triggers) | Audits: orders, payments, customers, service_rates |
| **payments**          | `id` (bigserial) | One-to-one payment records linked to orders               | Links to: orders (1:1), users                       |
| **notifications**     | `id` (bigserial) | Queue for customer notifications (MVP optional)           | Links to: orders                                    |

#### Key Design Decisions

- **UUID for users**: Uses `gen_random_uuid()` from pgcrypto extension for secure user IDs
- **Bigserial for business entities**: Auto-incrementing IDs for orders, customers, payments
- **Price snapshot pattern**: Orders store pricing rules at creation time to preserve historical accuracy
- **Forensic audit trail**: `activity_logs` table captures all INSERT/UPDATE/DELETE events on core tables via database-level triggers (`fn_audit_activity`), providing tamper-resistant auditability without application-layer overhead
- **One-to-one payments**: Each order has exactly one payment (MVP constraint)

#### Database Schema Documentation

For complete schema details include:
- Table definitions and constraints
- Enum types (user_role, order_status, payment_status, payment_method)
- Foreign key relationships
- Index strategies

See **[docs/04-data-design/erd.dbml](docs/04-data-design/erd.dbml)** and **[docs/04-data-design/erd.svg](docs/04-data-design/erd.svg)** for the visual diagram.

### API Design

The REST API follows the **OpenAPI 3.0.3** specification defined in **[docs/05-tech-design/openapi.yaml](docs/05-tech-design/openapi.yaml)**.

#### Core API Endpoints

| Endpoint                                     | Method | Purpose                                         | Auth Required |
|----------------------------------------------|--------|-------------------------------------------------|---------------|
| `/api/v1/orders`                             | POST   | Create order with automatic pricing computation | ✅ Staff/Admin |
| `/api/v1/orders/{orderId}/status`            | PATCH  | Update order status (creates audit log)         | ✅ Staff/Admin |
| `/api/v1/orders/reference/{referenceNumber}` | GET    | Public order tracking                           | ❌ No auth     |
| `/api/v1/payments`                           | POST   | Record payment (1:1 with order)                 | ✅ Staff/Admin |
| `/api/v1/reports/sales/daily`                | GET    | Daily sales report                              | ✅ Admin only  |
| `/api/v1/reports/sales/monthly`              | GET    | Monthly income report                           | ✅ Admin only  |
| `/api/v1/reports/sales/yearly`               | GET    | Yearly income report                            | ✅ Admin only  |
| `/api/v1/customers`                          | POST   | Create new customer                             | ✅ Staff/Admin |
| `/api/v1/service-rates/active`               | GET    | Get current pricing rules                       | ✅ Staff/Admin |
| `/api/v1/health`                             | GET    | Health check (liveness)                         | ❌ No auth     |

#### API Documentation

When the backend is running, access interactive API documentation at:
- **Swagger UI**: [http://localhost:8081/swagger-ui.html](http://localhost:8081/swagger-ui.html)
- **OpenAPI JSON**: [http://localhost:8081/v3/api-docs](http://localhost:8081/v3/api-docs)

For the full list of endpoints (e.g. order preview, order by ID, payments by ID), see **[docs/05-tech-design/openapi.yaml](docs/05-tech-design/openapi.yaml)**.

---

## 📂 Repository Structure

The layout below matches the project. **Documentation in `docs/` is the source of truth** for requirements, business rules, data design, and API contract — see [docs/README.md](docs/README.md).

```
laundry-shop-management-system/
├── backend/                     # Spring Boot REST API
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/           # Java source code
│   │   │   └── resources/
│   │   │       ├── db/migration/  # Flyway SQL migrations
│   │   │       └── application.yml
│   │   └── test/               # JUnit 5 + Testcontainers tests
│   ├── pom.xml
│   ├── mvnw.cmd                # Maven wrapper (Windows)
│   └── mvnw                    # Maven wrapper (Unix)
├── frontend/                    # Next.js client application
├── docker-compose.yml           # Base container setup (moved to root)
├── docker-compose.override.yml  # Development overrides (moved to root)
├── docker/
│   ├── docker-compose.prod.yml  # Production setup
│   ├── .env.docker              # Database credentials
├── docs/                        # Project documentation (source of truth)
│   ├── README.md               # Documentation index — start here
│   ├── 00-context/
│   │   ├── case-study.md       # Client background & problem statement
│   │   └── client-interview.md # Interview notes
│   ├── 01-scope/
│   │   └── project-scope.md    # MVP vs post-MVP, deliverables
│   ├── 02-requirements/
│   │   ├── user-stories.md     # Functional requirements (US-01 to US-11)
│   │   └── business-rules.md   # Pricing & validation rules (BR-xx)
│   ├── 03-process/
│   │   └── to-be-flow.md       # Future-state process flows
│   ├── 04-data-design/
│   │   ├── erd.dbml            # Database schema (source of truth)
│   │   ├── erd.svg             # Visual ERD diagram
│   │   ├── data-notes.md
│   │   └── erd.pdf
│   ├── 05-tech-design/
│   │   ├── openapi.yaml        # REST API contract (source of truth)
│   │   └── architecture.md     # System design & deployment
│   ├── 06-implementation/
│   │   ├── deployment-guide.md # Production & dev deployment
│   │   ├── user-manual.md      # End-user guide (Admin/Staff)
│   │   ├── handover-checklist.md
│   │   └── release-notes-mvp-v1.md
│   ├── GETTING_STARTED.md      # Developer implementation guide
│   └── development-credentials.md
├── scripts/
│   ├── backup-database.sh      # Database backup (Linux/macOS)
│   └── backup-database.ps1     # Database backup (Windows)
└── README.md                    # This file
```

---

## 📋 Prerequisites

Before you begin, ensure the following tools are installed on your development machine. **The team uses Windows** — all commands below use PowerShell and work on Windows 10/11. The setup also runs on macOS/Linux with minor adjustments (e.g., use `./mvnw` instead of `.\mvnw.cmd`).

### Required Software

| Tool               | Minimum Version  | Verification Command | Download Link                                                                                                            |
|--------------------|------------------|----------------------|--------------------------------------------------------------------------------------------------------------------------|
| **Docker Desktop** | Latest           | `docker --version`   | [https://www.docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop)                         |
| **Java JDK**       | 21 (LTS)         | `java -version`      | [https://www.oracle.com/java/technologies/downloads/#java21](https://www.oracle.com/java/technologies/downloads/#java21) or [Adoptium Eclipse Temurin](https://adoptium.net/) |
| **Maven**          | 3.9+ (or use wrapper) | `.\backend\mvnw.cmd -version` | Project includes Maven Wrapper — no separate install needed |
| **Node.js**        | 18 LTS or 20 LTS | `node --version`     | [https://nodejs.org/](https://nodejs.org/)                                                                               |
| **Git**            | Latest           | `git --version`      | [https://git-scm.com/downloads](https://git-scm.com/downloads)                                                           |

### Verification Steps (Windows PowerShell)

Open **PowerShell** or **Windows Terminal** and run:

```powershell
# Check Docker (ensure Docker Desktop is running)
docker --version
docker compose version

# Check Java (must be version 21)
java -version

# Check Maven wrapper (recommended — no Maven install needed)
.\mvnw.cmd -version

# Check Node.js
node --version
npm --version

# Check Git
git --version
```

> **Tip:** Use the project's Maven Wrapper — no need to install Maven separately. The wrapper ensures consistent builds across machines. Run it from the `backend/` directory: `cd backend && ./mvnw` (macOS/Linux) or `cd backend` then `.\mvnw.cmd` (Windows).

### Important Database Requirements

> ⚠️ **CRITICAL:** The PostgreSQL database **MUST** have the **`pgcrypto` extension** enabled for UUID generation using `gen_random_uuid()`.
> 
> - The Docker Compose setup automatically enables this extension
> - If using a non-Docker PostgreSQL instance, you must manually enable it:
>   ```sql
>   CREATE EXTENSION IF NOT EXISTS pgcrypto;
>   ```
> - **Failure to enable pgcrypto will cause application startup failures**

## 🚀 Getting Started

Follow these steps **exactly** to set up your development environment:

### Step 1: Clone the Repository

```powershell
# Clone the repository
git clone <repository-url>
cd laundry-shop-management-system
```

### Step 2: Environment Variables Configuration

The project uses a unified `.env` file at the root directory for all components.

#### 2.1 Create the Env File (Windows PowerShell)

From the **project root** (`laundry-shop-management-system`), run:

```powershell
# Copy the example environment file
Copy-Item .env.example .env
```

#### 2.2 Configure the File

Edit the newly created `.env` file and set your secure credentials:

```env
# --- DATABASE CONFIG ---
DB_NAME=laundry_db
DB_USER=laundry_user
DB_PASSWORD=your_secure_password_here   # ⚠️ Change this
DB_PORT=5433

# --- BACKEND CONFIG ---
SPRING_PROFILES_ACTIVE=dev
JWT_SECRET=dev-secret-change-in-production-min-32-chars
ALLOWED_ORIGIN=http://localhost:3000

# --- SEED DATA ---
SEED_ADMIN_USERNAME=admin
SEED_ADMIN_PASSWORD_HASH=your_bcrypt_hash
SEED_STAFF_USERNAME=staff
SEED_STAFF_PASSWORD_HASH=your_bcrypt_hash
```

> ⚠️ **Security:** Never commit your `.env` file to Git. It is already in `.gitignore`. Each developer maintains their own local copy.

### Step 3: Start the Optimized Stack

The project uses a unified Docker Compose setup optimized for development speed.

### 🚀 Quick Start Commands

| Command | Description |
| :--- | :--- |
| `docker compose up -d` | Start the full stack (Dev mode) |
| `./scripts/fresh.ps1` | **Optimized Reset**: Wipe DB, Remigrate, and Reseed (Keeps library caches) |
| `./scripts/share.ps1` | Share local environment via ngrok |
| `docker compose down` | Stop all services |

> [!TIP]
> **Coming from Laravel?** Run `./scripts/fresh.ps1` whenever you want the equivalent of `php artisan migrate:fresh --seed`.

**Optimizations included:**
- **Instant Boot:** Backend skips Checkstyle and JaCoCo during development.
- **Turbo Frontend:** Next.js runs with `--turbo` for faster HMR.
- **Integrated DB:** Database automatically handles `pgcrypto` initialization.

#### 3.1 Verify Services

| Service | Port | Health Check |
|---------|------|--------------|
| **Database** | `5433` | `pg_isready` |
| **Backend** | `8081` | `GET /api/v1/health` |
| **Frontend** | `3001` | `http://localhost:3001` |

#### 3.2 View Logs

```powershell
# Tail all logs
docker compose logs -f

# Tail specific service
docker compose logs -f backend
```

### Step 4: Access & Sharing

#### 4.1 Internal Access
- **App:** [http://localhost:3001](http://localhost:3001)
- **API Docs:** [http://localhost:8081/swagger-ui.html](http://localhost:8081/swagger-ui.html)

#### 4.2 Sharing with the Team (Ngrok)
If you need to share your local environment with the team or the client, use the provided script:

```powershell
# Starts an ngrok tunnel to your local environment
.\share.ps1
```
*Note: Requires ngrok installed and configured.*

### Step 4: Database Migrations (Flyway)

The application uses **Flyway** for database schema version control and automatic migrations.

#### 4.1 Migration File Location

All SQL migration scripts are located in:
```
backend/src/main/resources/db/migration/
```

#### 4.2 Migration File Naming Convention

Flyway requires a specific naming pattern:

```
V{version}__{description}.sql

Examples:
  V1__init.sql                    # Initial schema
  V2__seed_users.sql              # Seed data for users
  V3__add_notifications_table.sql # New table
```

**Rules:**
- Prefix: `V` (uppercase)
- Version: Sequential number (1, 2, 3, ...)
- Separator: `__` (double underscore)
- Description: Snake_case description
- Extension: `.sql`

#### 4.3 Automatic Migration on Startup

Flyway migrations execute **automatically** when the Spring Boot application starts:

1. Flyway checks the `flyway_schema_history` table
2. Compares existing migrations with files in `db/migration/`
3. Executes any new migrations in version order
4. Records successful migrations in the history table

> ✅ **No manual migration commands needed** — migrations run automatically during backend startup.

#### 4.4 Migration Verification

When the backend starts, you should see logs like:

```
INFO  FlywayExecutor : Flyway Community Edition 10.x.x
INFO  FlywayExecutor : Database: jdbc:postgresql://localhost:5433/laundry_db
INFO  FlywayExecutor : Successfully validated 2 migrations (execution time 00:00.123s)
INFO  FlywayExecutor : Current version of schema "public": 2
INFO  FlywayExecutor : Schema "public" is up to date. No migration necessary.
```

#### 4.5 Manual Migration Troubleshooting

If migrations fail or you need to reset:

```powershell
# Option 1: Clean rebuild (deletes all data)
docker compose down -v
docker compose -f docker/docker-compose.dev.yml up -d
cd backend
.\mvnw.cmd spring-boot:run

# Option 2: Manual Flyway repair (advanced)
cd backend
.\mvnw.cmd flyway:repair
.\mvnw.cmd spring-boot:run
```

### Step 5: Backend Setup (Spring Boot)

The backend is a **Java 21** application using **Spring Boot 3.3+** and **Maven**.

#### 5.1 Navigate to Backend Directory

```powershell
cd backend
```

#### 5.2 Build the Application

```powershell
# Clean and compile the application
.\mvnw.cmd clean install

# Skip tests for faster build (not recommended)
.\mvnw.cmd clean install -DskipTests
```

**Expected output:**
```
[INFO] BUILD SUCCESS
[INFO] Total time: 15.234 s
```

#### 5.3 Run the Application

**Option A: Command Line (PowerShell)**

```powershell
.\mvnw.cmd spring-boot:run
```

**Option B: IntelliJ IDEA**

1. **File → Open** → select `backend/` folder (or the whole project and set backend as the working module).
2. Wait for Maven to import (right-side Maven tool window).
3. Find `LaundrySystemApplication.java` under `src/main/java/com/himotech/laundryms/`.
4. Right-click the class → **Run 'LaundrySystemApplication'**.
5. Ensure **Run Configuration** uses `backend/` as working directory so it picks up `backend/.env`.

**Option C: VS Code / Cursor**

1. Open the project folder. Install **Extension Pack for Java** (or **Spring Boot Extension Pack**) if needed.
2. Open `backend/src/main/java/com/himotech/laundryms/LaundrySystemApplication.java`.
3. Click **Run | Debug** above the `main` method, or press `F5`.
4. Alternatively, open **Terminal** in `backend/` and run: `.\mvnw.cmd spring-boot:run`.

> **Note:** Backend loads env from `backend/.env`. Ensure you're running from `backend/` directory so the `.env` file is found.

#### 5.4 Verify Backend is Running

**Console output should show:**
```
INFO  LaundrySystemApplication : Started LaundrySystemApplication in X.XXX seconds
```

**Test the health endpoint:**
```powershell
# Should return HTTP 200 OK
curl http://localhost:8081/api/v1/health
```

**Test the API documentation:**
- Open browser: [http://localhost:8081/swagger-ui.html](http://localhost:8081/swagger-ui.html)

#### 5.5 Backend Startup Checklist

| Check               | Endpoint / Log       | Expected Result                    |
|---------------------|----------------------|------------------------------------|
| Application started | Console logs         | `Started LaundrySystemApplication` |
| Database connected  | Console logs         | `HikariPool-1 - Start completed`   |
| Flyway migrations   | Console logs         | `Schema "public" is up to date`    |
| Health endpoint     | `GET /api/v1/health` | HTTP 200 OK                        |
| API documentation   | `/swagger-ui.html`   | Swagger UI page loads              |

### Step 6: Frontend Setup (Next.js)

The frontend is a **Next.js 14+** application using **React**, **TypeScript**, and **Tailwind CSS**.

#### 6.1 Navigate to Frontend Directory

```powershell
cd frontend
```

#### 6.2 Install Dependencies

```powershell
# Install all npm packages
npm install

# Or use Yarn
yarn install
```

**Expected output:**
```
added XXX packages in XX.XXs
```

#### 6.3 Run the Development Server

**Command Line (PowerShell)**

```powershell
npm run dev
# Or: yarn dev
```

**IDE Options**

| IDE | How to Run |
|-----|------------|
| **IntelliJ** | Right-click `frontend/package.json` → **Run 'dev'**, or use **Terminal** inside `frontend/` and run `npm run dev`. |
| **VS Code / Cursor** | Open **Terminal** (Ctrl+`) → `cd frontend` → `npm run dev`, or use the **NPM Scripts** view to run `dev`. |
| **Any** | Open a terminal, `cd frontend`, then `npm run dev`. |

**Expected output:**
```
▲ Next.js 14.x.x
- Local:        http://localhost:3001
- ready started server on 0.0.0.0:3001
```

#### 6.4 Verify Frontend is Running

**Open your browser:**
- [http://localhost:3001](http://localhost:3001)

**Expected:** The Faith Laundry Shop application home page should load.

#### 6.5 Build for Production (Optional)

```powershell
# Create production build
npm run build

# Start production server
npm start
```

### Step 7: Full System Verification

After completing all steps, verify the entire system is running:

| Component       | URL                                                                            | Status Check        |
|-----------------|--------------------------------------------------------------------------------|---------------------|
| **Database**    | `localhost:5433`                                                               | `docker compose ps` |
| **Backend API** | [http://localhost:8080/api/v1/health](http://localhost:8080/api/v1/health) or `/actuator/health` | HTTP 200 OK         |
| **API Docs**    | [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html) | Swagger UI loads    |
| **Frontend**    | [http://localhost:3000](http://localhost:3000)                                 | Application loads   |

### Production Deployment (Phase 14)

For deploying to the shop's hardware (production):

```powershell
# 1. Configure .env for production
#    - DB_PASSWORD (strong password)
#    - JWT_SECRET (≥32 characters)
#    - ALLOWED_ORIGIN (e.g., http://192.168.1.100)
#    - NEXT_PUBLIC_API_URL (e.g., http://192.168.1.100/api)

# 2. Start production stack (Nginx + Backend + Frontend + PostgreSQL)
docker compose -f docker/docker-compose.prod.yml up -d --build

# 3. Access via http://localhost or your server IP
```

**Optional (HTTPS):** Run `sh docker/nginx/generate-ssl.sh` (Git Bash or WSL on Windows) then `cp docker/nginx/nginx-ssl.conf docker/nginx/nginx.conf` and restart nginx.

**Backup (Windows):** `.\scripts\backup-database.ps1` or `.\scripts\backup-database.ps1 -BackupDir C:\Backups\laundry`. The script uses the running `laundry-postgres` container by default; to override connection settings, either create a root `.env` with `DB_*` variables or manually set `$env:DB_HOST`, `$env:DB_PORT`, `$env:DB_PASSWORD`, etc. in your shell (you can copy these values from `backend\.env`).

See [docs/06-implementation/deployment-guide.md](docs/06-implementation/deployment-guide.md) and [docs/06-implementation/user-manual.md](docs/06-implementation/user-manual.md) for full details.

---

### Quick Start Summary

For experienced developers, here's the condensed version:

```powershell
# 1. Clone and setup environment
git clone <repository-url>
cd laundry-shop-management-system
Copy-Item .env.example .env
# Edit .env to set your passwords and secrets

# 2. Start the full stack
docker compose up -d

# Access: http://localhost:3000
```

## ⚙️ Configuration

### Environment Variables

Environment configuration is managed via a single unified `.env` file at the root of the project. This makes setup simpler and avoids duplicating credentials across components.

| Location | Purpose |
|----------|---------|
| `.env` | Unified configuration (DB credentials, JWT secrets, App settings) — copy from `.env.example` |

**Important:**
- Never commit `.env` to version control (it is in `.gitignore`).
- Commit the `.env.example` file so new developers can bootstrap quickly.
- Each developer should maintain their own local env file with appropriate credentials.

### Backend Configuration
- **File:** `backend/src/main/resources/application.yml`
- **Default settings:**
  - Server port: 8080
  - Database URL: jdbc:postgresql://\${DB_HOST}:\${DB_PORT}/\${DB_NAME}
  - Flyway auto-migration: enabled
- Environment variables are read at runtime from `backend/.env` (or system env)

### Database Migrations
All database schema changes are version-controlled using Flyway:
- **Location:** `backend/src/main/resources/db/migration/`
- **Format:** V{version}__{description}.sql
- Migrations execute automatically on application startup

For detailed data model and relationships, see `docs/04-data-design/`.

## 👥 Team Collaboration & Git Workflow

### Branch Strategy & Workflow
- **`main`** — Production-ready branch (deployment only). Protected; no direct commits.
- **`develop`** — Active development branch. All feature/fix/docs/refactor/test/chore branches must open PRs **into `develop`**.
- **Feature branches** — `feature/short-description` (e.g., `feature/order-preview`).
- **Bugfix branches** — `fix/bug-description`.
- **Workflow:** Sync from `develop` (`git checkout develop && git pull --rebase origin develop`) → Branch from `develop` → Commit (use `feat:`, `fix:`, `docs:`, etc.) → Push → Open PR **into `develop`** → Request review.
- **Local setup:** Create env files from `.env.example` in `docker/`, `backend/`, `frontend/` → Start DB: `docker compose --env-file docker/.env.docker up -d` → Backend: `cd backend` + `.\mvnw.cmd spring-boot:run` → Frontend: `cd frontend` + `npm run dev` → Open http://localhost:3000

### Pull Request Checklist

- Fill out the [PR template](.github/pull_request_template.md).
- Link user stories (US-xx) or business rules (BR-xx) if applicable.
- Ensure tests pass locally (Backend: `.\mvnw.cmd test` in `backend/`; Frontend: `npm run lint && npm run test && npm run build` in `frontend/`).
- Request review from at least one team member. Do not merge your own PR without review.

### Rules for All Team Members

- **Never commit** `.env`, `.env.docker`, `.env.local`, or any file with secrets.
- **Never force-push** to `main` (or shared branches).
- **Pull before you push** — `git pull --rebase origin main` before opening a PR.
- **Keep PRs small** — One feature or fix per PR.
- **Use Maven wrapper** (`.\mvnw.cmd`) for consistency across machines.

## 🔧 Troubleshooting

### Database Connection Issues
- **Verify Docker is running:** `docker compose ps`
- **Check credentials:** Ensure `docker/.env.docker` and `backend/.env` have correct `DB_USER`, `DB_PASSWORD`, `DB_HOST`, and `DB_PORT`
- **Verify port availability:** Ensure PostgreSQL port 5433 is not in use
- **Restart container:** `docker compose down` then `docker compose --env-file docker/.env.docker up -d`

### Flyway Migrations Fail
- **Check migration format:** Files should follow `V{version}__{description}.sql` (e.g., `V1__init.sql`)
- **Verify file encoding:** Ensure all migration files are in UTF-8 format
- **Review logs:** Check application console output for detailed migration error messages
- **Reset database:** `docker compose down -v` then `docker compose --env-file docker/.env.docker up -d`

### Backend Startup Issues
- **Check Java version:** `java -version` (should be 21 or higher)
- **Verify Maven:** `.\mvnw.cmd --version`
- **Clean and rebuild:** `.\mvnw.cmd clean install`
- **Check port 8080:** Ensure port 8080 is not in use by another application

### Frontend Build Issues
- **Clear node_modules (Windows PowerShell):**
  ```powershell
  Remove-Item -Recurse -Force node_modules
  npm install
  ```
- **Clear Next.js cache:**
  ```powershell
  Remove-Item -Recurse -Force .next
  npm run dev
  ```
- **Port 3000 in use:** 
  ```powershell
  npm run dev -- -p 3001
  ```

## 📞 Support & Documentation

**Documentation index:** **[docs/README.md](docs/README.md)** — central guide to all project docs (source of truth).

| Topic | Document |
|-------|----------|
| **Documentation index** | [docs/README.md](docs/README.md) |
| **Case study & problem statement** | [docs/00-context/case-study.md](docs/00-context/case-study.md) |
| **Project scope (MVP vs post-MVP)** | [docs/01-scope/project-scope.md](docs/01-scope/project-scope.md) |
| **User stories (US-01 to US-11)** | [docs/02-requirements/user-stories.md](docs/02-requirements/user-stories.md) |
| **Business rules (BR-xx)** | [docs/02-requirements/business-rules.md](docs/02-requirements/business-rules.md) |
| **To-be process flows** | [docs/03-process/to-be-flow.md](docs/03-process/to-be-flow.md) |
| **Database design (ERD)** | [docs/04-data-design/erd.dbml](docs/04-data-design/erd.dbml), [erd.svg](docs/04-data-design/erd.svg) |
| **API contract** | [docs/05-tech-design/openapi.yaml](docs/05-tech-design/openapi.yaml) |
| **Architecture** | [docs/05-tech-design/architecture.md](docs/05-tech-design/architecture.md) |
| **Deployment guide** | [docs/06-implementation/deployment-guide.md](docs/06-implementation/deployment-guide.md) |
| **User manual (Admin/Staff)** | [docs/06-implementation/user-manual.md](docs/06-implementation/user-manual.md) |
| **Getting started (developers)** | [docs/GETTING_STARTED.md](docs/GETTING_STARTED.md) |
| **Development credentials** | [docs/development-credentials.md](docs/development-credentials.md) |
| **Implementation status** | [docs/06-implementation/implementation-status.md](docs/06-implementation/implementation-status.md) |
| **Non-functional requirements** | [docs/02-requirements/non-functional-requirements.md](docs/02-requirements/non-functional-requirements.md) |
