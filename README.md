# Faith Laundry Shop Management System

> **Client:** Faith Laundry Shop  
> **Developer:** HIMÓTECH  
> **Status:** Active Development (MVP Phase)

A centralized, full-stack information system designed to replace manual paper-based logbooks with a digital solution for laundry order recording, status tracking, payment management, and sales reporting.

---

## 📖 Project Overview

### The Client
**Faith Laundry Shop** is a small-scale laundry service business established in 2022, located in Ilaya, Tabuc Suba Jaro, Iloilo City. The business operates with one owner and one staff member, providing washing, drying, and folding services on a per-load basis.

### The Problem
Faith Laundry Shop currently relies on **manual, paper-based processes** for all operations:
- **Physical tags** and **logbooks** are used to track laundry orders
- **Manual notebooks** record payments and sales
- **Order mix-ups** occur during peak hours when handling multiple orders
- **No automated reporting** — income tracking is entirely manual
- **Limited order tracking** — customers must call or visit to check laundry status

These manual processes are time-consuming, error-prone, and limit the owner's visibility into business performance.

### The Solution
This system digitizes the entire laundry management workflow:
- Replace physical tags with **unique reference numbers** for tracking
- Replace logbooks with a **centralized database** storing all orders and status changes
- **Automate pricing calculations** based on weight, loads, and extra charges
- Provide **real-time order tracking** for customers using reference numbers
- Generate **automated daily, monthly, and yearly sales reports** for the owner

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
- Prevent premature release (orders must be "Ready for Pickup" before release)

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
- **Owner**: Full access to reports, rates management, all order operations
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
| **Release Precondition**     | Orders can only be released when status is `READY_FOR_PICKUP` | BR-OL-05  |

### Payment Rules
| Rule                         | Description                                  | Reference |
|------------------------------|----------------------------------------------|-----------|
| **One Payment Per Order**    | Each payment must link to exactly one order  | BR-PAY-02 |
| **Exact Amount Match (MVP)** | Payment amount must equal order grand total  | BR-PAY-03 |
| **Payment Timing**           | Payments are typically collected upon pickup | BR-PAY-01 |

> **Note:** Partial payments, overpayments, and owner override capabilities are **post-MVP features**.

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
| **users**             | `id` (UUID)      | System users (Owner/Staff) with role-based access         | Created by: orders, order_status_logs, payments     |
| **customers**         | `id` (bigserial) | Customer contact information                              | Referenced by: orders, notifications                |
| **service_rates**     | `id` (int)       | Configurable pricing rules (₱120/8kg, ₱1/min)             | Referenced by: orders (snapshot)                    |
| **orders**            | `id` (bigserial) | Central transaction table with computed totals and status | Links to: customers, users, service_rates, payments |
| **order_add_ons**     | `id` (bigserial) | Flexible additional charges per order                     | Links to: orders                                    |
| **order_status_logs** | `id` (bigserial) | Audit trail of all status changes                         | Links to: orders, users                             |
| **payments**          | `id` (bigserial) | One-to-one payment records linked to orders               | Links to: orders (1:1), users                       |
| **notifications**     | `id` (bigserial) | Queue for customer notifications (MVP optional)           | Links to: orders, customers                         |

#### Key Design Decisions

- **UUID for users**: Uses `gen_random_uuid()` from pgcrypto extension for secure user IDs
- **Bigserial for business entities**: Auto-incrementing IDs for orders, customers, payments
- **Price snapshot pattern**: Orders store pricing rules at creation time to preserve historical accuracy
- **Audit trail**: `order_status_logs` table tracks all status changes with timestamp and user
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
| `/api/v1/orders`                             | POST   | Create order with automatic pricing computation | ✅ Staff/Owner |
| `/api/v1/orders/{orderId}/status`            | PATCH  | Update order status (creates audit log)         | ✅ Staff/Owner |
| `/api/v1/orders/reference/{referenceNumber}` | GET    | Public order tracking                           | ❌ No auth     |
| `/api/v1/payments`                           | POST   | Record payment (1:1 with order)                 | ✅ Staff/Owner |
| `/api/v1/reports/sales/daily`                | GET    | Daily sales report                              | ✅ Owner only  |
| `/api/v1/reports/sales/monthly`              | GET    | Monthly income report                           | ✅ Owner only  |
| `/api/v1/customers`                          | POST   | Create new customer                             | ✅ Staff/Owner |
| `/api/v1/service-rates/active`               | GET    | Get current pricing rules                       | ✅ Staff/Owner |

#### API Documentation

When the backend is running, access interactive API documentation at:
- **Swagger UI**: [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)
- **OpenAPI JSON**: [http://localhost:8080/v3/api-docs](http://localhost:8080/v3/api-docs)

---

## 📂 Repository Structure

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
├── docker/
│   └── docker-compose.yml      # PostgreSQL 16 container setup
├── docs/                        # Project documentation
│   ├── 00-context/
│   │   ├── case-study.md       # Client background & problem statement
│   │   └── client-interview.md # Interview notes
│   ├── 02-requirements/
│   │   ├── user-stories.md     # Functional requirements (US-xx)
│   │   └── business-rules.md   # Pricing & validation rules (BR-xx)
│   ├── 04-data-design/
│   │   ├── erd.dbml            # Database schema (source of truth)
│   │   ├── erd.svg             # Visual ERD diagram
│   │   └── data-notes.md
│   ├── 05-tech-design/
│   │   ├── openapi.yaml        # REST API contract (source of truth)
│   │   └── architecture.md     # System design & deployment
│   └── development-credentials.md
├── .env.example                 # Environment variables template
├── README.md                    # This file
└── ENV_SETUP.md                 # Detailed environment setup guide
```

---

## 📋 Prerequisites

Before you begin, ensure the following tools are installed and properly configured on your development machine:

### Required Software

| Tool               | Minimum Version  | Verification Command | Download Link                                                                                                            |
|--------------------|------------------|----------------------|--------------------------------------------------------------------------------------------------------------------------|
| **Docker Desktop** | Latest           | `docker --version`   | [https://www.docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop)                         |
| **Java JDK**       | 21 (LTS)         | `java -version`      | [https://www.oracle.com/java/technologies/downloads/#java21](https://www.oracle.com/java/technologies/downloads/#java21) |
| **Maven**          | 3.9+             | `mvn -version`       | [https://maven.apache.org/download.cgi](https://maven.apache.org/download.cgi)                                           |
| **Node.js**        | 18 LTS or 20 LTS | `node --version`     | [https://nodejs.org/](https://nodejs.org/)                                                                               |
| **Git**            | Latest           | `git --version`      | [https://git-scm.com/downloads](https://git-scm.com/downloads)                                                           |

### Verification Steps

After installation, verify each tool in PowerShell:

```powershell
# Check Docker
docker --version
docker compose version

# Check Java (must be version 21)
java -version

# Check Maven (or use the included wrapper)
mvn -version

# Check Node.js
node --version
npm --version

# Check Git
git --version
```

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

The application requires environment variables for database credentials and configuration.

#### 2.1 Create the `.env` file

```powershell
# Copy the example file to create your local .env
Copy-Item .env.example .env
```

#### 2.2 Configure Required Variables

Open `.env` in a text editor and configure the following **required** variables:

```env
# Database Configuration (REQUIRED)
DB_USER=laundry_user
DB_PASSWORD=laundry_password    # ⚠️ Change this for production
DB_HOST=localhost
DB_PORT=5433                    # External port (mapped to 5432 inside container)
DB_NAME=laundry_db

# Backend Configuration (REQUIRED)
SPRING_PORT=8080
SPRING_PROFILES_ACTIVE=dev      # Use 'dev' for local development
JWT_SECRET=dev-only-change-me-in-production  # ⚠️ MUST change in production
ALLOWED_ORIGIN=http://localhost:3000

# Frontend Configuration (REQUIRED)
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

#### Required Environment Variables Reference

| Variable                 | Purpose                  | Default Value               | Required |
|--------------------------|--------------------------|-----------------------------|----------|
| `DB_USER`                | PostgreSQL username      | `laundry_user`              | ✅ Yes    |
| `DB_PASSWORD`            | PostgreSQL password      | `laundry_password`          | ✅ Yes    |
| `DB_HOST`                | Database host            | `localhost`                 | ✅ Yes    |
| `DB_PORT`                | Database port (external) | `5433`                      | ✅ Yes    |
| `DB_NAME`                | Database name            | `laundry_db`                | ✅ Yes    |
| `SPRING_PORT`            | Backend server port      | `8080`                      | ✅ Yes    |
| `SPRING_PROFILES_ACTIVE` | Spring profile           | `dev`                       | ✅ Yes    |
| `JWT_SECRET`             | JWT signing key          | (see above)                 | ✅ Yes    |
| `ALLOWED_ORIGIN`         | CORS allowed origin      | `http://localhost:3000`     | ✅ Yes    |
| `NEXT_PUBLIC_API_URL`    | Frontend API base URL    | `http://localhost:8080/api` | ✅ Yes    |

> ⚠️ **IMPORTANT SECURITY WARNINGS:**
> - **NEVER commit the `.env` file to Git** (already in `.gitignore`)
> - **Change `DB_PASSWORD` and `JWT_SECRET` before deploying to production**
> - Each developer should maintain their own local `.env` file

### Step 3: Database Setup (Docker)

The project uses **PostgreSQL 16** running in a Docker container with the **pgcrypto extension** pre-enabled.

#### 3.1 Start the PostgreSQL Container

```powershell
# From the repository root, start the database
docker compose -f docker/docker-compose.yml up -d

# Verify the container is running
docker compose -f docker/docker-compose.yml ps
```

**Expected output:**
```
NAME                IMAGE          STATUS          PORTS
laundry-postgres    postgres:16    Up X seconds    0.0.0.0:5433->5432/tcp
```

#### 3.2 Verify Database Connection

```powershell
# Connect to the database using psql (requires PostgreSQL client tools)
docker exec -it laundry-postgres psql -U laundry_user -d laundry_db

# Once connected, verify the pgcrypto extension
\dx
```

**Expected output should include:**
```
Name      | Version | Schema | Description
----------+---------+--------+-------------
pgcrypto  | 1.3     | public | cryptographic functions
```

> ✅ **Verification Complete:** If you see `pgcrypto` listed, the extension is properly enabled.

#### 3.3 Database Configuration Details

| Setting       | Value                                         | Description                             |
|---------------|-----------------------------------------------|-----------------------------------------|
| **Host**      | `localhost`                                   | Database host (from `.env`)             |
| **Port**      | `5433`                                        | External port (mapped to internal 5432) |
| **Database**  | `laundry_db`                                  | Database name                           |
| **Username**  | `laundry_user`                                | Database user (from `.env`)             |
| **Password**  | `laundry_password`                            | Database password (from `.env`)         |
| **Extension** | `pgcrypto`                                    | Required for UUID generation            |
| **JDBC URL**  | `jdbc:postgresql://localhost:5433/laundry_db` | Full connection string                  |

#### 3.4 Database Management Commands

```powershell
# Stop the database (preserves data)
docker compose -f docker/docker-compose.yml down

# Start the database
docker compose -f docker/docker-compose.yml up -d

# View database logs
docker compose -f docker/docker-compose.yml logs -f postgres

# Reset the database (⚠️ DELETES ALL DATA)
docker compose -f docker/docker-compose.yml down -v
docker compose -f docker/docker-compose.yml up -d
```

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
docker compose -f docker/docker-compose.yml down -v
docker compose -f docker/docker-compose.yml up -d
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

**Option A: Using Maven Wrapper (Recommended)**

```powershell
.\mvnw.cmd spring-boot:run
```

**Option B: Using IntelliJ IDEA**

1. Open `backend/` folder in IntelliJ IDEA
2. Locate `src/main/java/com/himotech/laundryms/LaundrySystemApplication.java`
3. Right-click → **Run 'LaundrySystemApplication'**

#### 5.4 Verify Backend is Running

**Console output should show:**
```
INFO  LaundrySystemApplication : Started LaundrySystemApplication in X.XXX seconds
```

**Test the health endpoint:**
```powershell
# Should return HTTP 200 OK
curl http://localhost:8080/api/v1/health
```

**Test the API documentation:**
- Open browser: [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)

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

```powershell
# Start the Next.js dev server
npm run dev

# Or use Yarn
yarn dev
```

**Expected output:**
```
- ready started server on 0.0.0.0:3000, url: http://localhost:3000
- info Loaded env from .env
```

#### 6.4 Verify Frontend is Running

**Open your browser:**
- [http://localhost:3000](http://localhost:3000)

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
| **Backend API** | [http://localhost:8080/api/v1/health](http://localhost:8080/api/v1/health)     | HTTP 200 OK         |
| **API Docs**    | [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html) | Swagger UI loads    |
| **Frontend**    | [http://localhost:3000](http://localhost:3000)                                 | Application loads   |

### Quick Start Summary

For experienced developers, here's the condensed version:

```powershell
# 1. Clone and setup environment
git clone <repository-url>
cd laundry-shop-management-system
Copy-Item .env.example .env
# Edit .env with your credentials

# 2. Start database
docker compose -f docker/docker-compose.yml up -d

# 3. Start backend (in new terminal)
cd backend
.\mvnw.cmd spring-boot:run

# 4. Start frontend (in new terminal)
cd frontend
npm install
npm run dev

# Access: http://localhost:3000
```

## ⚙️ Configuration

### Environment Variables
Create a `.env` file in the root directory based on `.env.example`:

```powershell
Copy-Item .env.example .env
```

Then update the values as needed:

```env
# Database Configuration
DB_USER=laundry_user
DB_PASSWORD=<your_secure_password>
DB_HOST=localhost
DB_PORT=5433
DB_NAME=laundry_db

# Backend Configuration
SPRING_PORT=8080

# Frontend Configuration
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

**Important:**
- Never commit the `.env` file to version control. It is already excluded in `.gitignore`.
- Commit `.env.example` so new developers can bootstrap quickly.
- Each developer should maintain their own local `.env` file with appropriate credentials.

### Backend Configuration
- **File:** `backend/src/main/resources/application.yml`
- **Default settings:**
  - Server port: 8080
  - Database URL: jdbc:postgresql://\${DB_HOST}:\${DB_PORT}/\${DB_NAME}
  - Flyway auto-migration: enabled
- Environment variables are injected at runtime from the `.env` file

### Database Migrations
All database schema changes are version-controlled using Flyway:
- **Location:** `backend/src/main/resources/db/migration/`
- **Format:** V{version}__{description}.sql
- Migrations execute automatically on application startup

For detailed data model and relationships, see `docs/04-data-design/`.

## 👨‍💼 Development Workflow

### Local Development Setup
1. Clone the repository
2. Create `.env` file from `.env.example`
3. Start Docker containers: `docker compose -f docker/docker-compose.yml up -d`
4. Start backend: `cd backend && .\mvnw.cmd spring-boot:run`
5. Start frontend: `cd frontend && npm run dev`
6. Access the application at `http://localhost:3000`

### Git Workflow
- Create feature branches: `git checkout -b feature/your-feature-name`
- Keep commits atomic and descriptive
- Push to the feature branch and create Pull Request
- Never commit `.env` or sensitive configuration files
- Follow conventional commit messages: `feat:`, `fix:`, `docs:`, `refactor:`, etc.

### Code Quality
- Backend: Follow Java coding standards and Spring Boot best practices
- Frontend: Use TypeScript for type safety
- Test your changes before pushing
- Ensure no sensitive data in commit messages or code

## 🔧 Troubleshooting

### Database Connection Issues
- **Verify Docker is running:** `docker compose -f docker/docker-compose.yml ps`
- **Check credentials:** Ensure `.env` in the repository root has correct `DB_USER` and `DB_PASSWORD`
- **Verify port availability:** Ensure PostgreSQL port 5433 is not in use
- **Restart container:** `docker compose -f docker/docker-compose.yml down && docker compose -f docker/docker-compose.yml up -d`

### Flyway Migrations Fail
- **Check migration format:** Files should follow `V{version}__{description}.sql` (e.g., `V1__init.sql`)
- **Verify file encoding:** Ensure all migration files are in UTF-8 format
- **Review logs:** Check application console output for detailed migration error messages
- **Reset database:** `docker compose -f docker/docker-compose.yml down -v && docker compose -f docker/docker-compose.yml up -d`

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

For detailed project documentation:
- **Case Study & Problem Statement:** `docs/00-context/case-study.md`
- **User Stories (Features):** `docs/02-requirements/user-stories.md`
- **Business Rules:** `docs/02-requirements/business-rules.md`
- **Database Design:** `docs/04-data-design/erd.dbml` and `erd.svg`
- **API Contract:** `docs/05-tech-design/openapi.yaml`
- **Architecture:** `docs/05-tech-design/architecture.md`

## 📝 License

[Add your license here if applicable]
