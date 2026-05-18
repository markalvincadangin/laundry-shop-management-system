<div align="center">

# Faith Laundry Shop Management System

**A full-stack web application that replaces manual logbooks with digital order tracking, automated pricing, and real-time sales reporting.**

Built with **Next.js** · **Spring Boot 3.5** · **PostgreSQL** · **Docker**

---

![Dashboard](academic-docs-deliverables/ui/DASHBOARD.png)

</div>

## Table of Contents

- [Overview](#overview)
- [Screenshots](#screenshots)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Architecture](#architecture)
- [API Reference](#api-reference)
- [Configuration](#configuration)
- [Contributing](#contributing)
- [Documentation](#documentation)
- [Team](#team)
- [License](#license)

## Overview

**Faith Laundry Shop** is a small-scale laundry service in Ilaya, Tabuc Suba, Jaro, Iloilo City, operating since 2022. The business relies on handwritten logbooks, physical tags, and paper receipts — leading to order mix-ups, slow record-keeping, and zero reporting capability.

This system digitizes the entire workflow: from order intake with automatic pricing computation, through a 6-stage status pipeline, to payment collection and automated sales reports.

> **Academic Context:** Developed by **HIMÓTECH** as a Systems Analysis and Design course deliverable at West Visayas State University.

## Screenshots

<div align="center">

| | |
|:---:|:---:|
| ![Login](academic-docs-deliverables/ui/LOGIN.png) | ![Landing](academic-docs-deliverables/ui/LANDING.png) |
| **Login** — Secure JWT authentication | **Landing** — Public-facing homepage |
| ![Dashboard](academic-docs-deliverables/ui/DASHBOARD.png) | ![Orders](academic-docs-deliverables/ui/ORDERS.png) |
| **Dashboard** — KPI cards & order pipeline | **Orders** — Filterable order list |
| ![Order Intake](academic-docs-deliverables/ui/ORDER_INTAKE.png) | ![Payments](academic-docs-deliverables/ui/PAYMENTS.png) |
| **Order Intake** — Wizard with auto-pricing | **Payments** — Payment recording & history |
| ![Customers](academic-docs-deliverables/ui/CUSTOMERS.png) | ![Reports](academic-docs-deliverables/ui/REPORTS.png) |
| **Customers** — Customer registry | **Reports** — Daily/monthly/yearly analytics |
| ![Rates](academic-docs-deliverables/ui/RATES.png) | ![Users](academic-docs-deliverables/ui/USERS.png) |
| **Service Rates** — Configurable pricing | **Users** — Role-based user management |
| ![Messaging](academic-docs-deliverables/ui/MESSAGING.png) | ![Audit Logs](academic-docs-deliverables/ui/LOGS.png) |
| **Messaging** — Client alert queue | **Audit Logs** — Forensic activity trail |
| ![Tracking](academic-docs-deliverables/ui/TRACK.png) | |
| **Public Tracking** — No-login order status | |

</div>

## Features

### Order Management
- Record laundry orders with customer details, weight, and service type
- **Automatic pricing** — computes loads from weight (`ceil(weight / 8kg)`) and applies per-load rates
- Unique reference numbers (`LDR-YYYYMMDD-XXXX`) for every order
- Add-on charges (e.g., fabric conditioner) and extra-time billing

### Order Pipeline
- 6-stage status tracking: **Received → Washing → Drying → Folding → Ready for Pickup → Released**
- Drag-and-drop Kanban-style board on the dashboard
- Business rule enforcement — orders cannot be released until paid

### Payment & Reporting
- One-to-one payment recording linked to orders (Cash, GCash, Bank Transfer)
- **Automated sales reports** — daily, monthly, and yearly breakdowns
- Admin-only revenue analytics with visual charts

### Security & Audit
- JWT-based authentication with role-based access (Admin / Staff)
- Database-level forensic audit triggers on all core tables
- Complete audit trail — who changed what, when, with before/after snapshots

### Public Order Tracking
- Customers can check order status using their reference number — **no login required**
- Minimal data exposure (status and dates only, no internal IDs)

## Tech Stack

| Layer | Technology | Version |
|:---|:---|:---|
| **Frontend** | Next.js (React, TypeScript, Tailwind CSS) | 14+ |
| **Backend** | Spring Boot (Java) | 3.5 / Java 21 LTS |
| **Database** | PostgreSQL | 16 |
| **Migrations** | Flyway | Embedded |
| **Build** | Maven (wrapper included) | 3.9+ |
| **Containerization** | Docker & Docker Compose | Latest |
| **Testing** | JUnit 5, Testcontainers | Latest |
| **UI Framework** | Tailwind CSS, Framer Motion, Lucide Icons | Latest |

## Getting Started

### Prerequisites

| Tool | Version | Check |
|:---|:---|:---|
| [Docker Desktop](https://www.docker.com/products/docker-desktop) | Latest | `docker --version` |
| [Java JDK](https://adoptium.net/) | 21 LTS | `java -version` |
| [Node.js](https://nodejs.org/) | 18+ LTS | `node --version` |
| [Git](https://git-scm.com/) | Latest | `git --version` |

> **Note:** Maven is included via the project's wrapper (`mvnw` / `mvnw.cmd`) — no separate install needed.

### Quick Start (Docker — Recommended)

```bash
# 1. Clone
git clone <repository-url>
cd laundry-shop-management-system

# 2. Configure environment
cp .env.example .env    # Linux/macOS
# Copy-Item .env.example .env    # Windows PowerShell

# 3. Start the full stack
docker compose up -d

# 4. Open the app
# Frontend:  http://localhost:3001
# Backend:   http://localhost:8080/api/v1/health
# API Docs:  http://localhost:8080/swagger-ui.html
```

### Manual Setup (Without Docker)

<details>
<summary><strong>Click to expand manual setup instructions</strong></summary>

#### 1. Database

Start a PostgreSQL 16 instance and enable the `pgcrypto` extension:

```sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;
```

#### 2. Backend

```bash
cd backend
cp ../.env.example ../.env
# Edit ../.env with your database credentials

# Build and run
./mvnw clean install        # Linux/macOS
# .\mvnw.cmd clean install  # Windows

./mvnw spring-boot:run
```

The backend starts on `http://localhost:8080`. Flyway migrations run automatically on startup.

#### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend starts on `http://localhost:3001`.

</details>

### Verify Everything is Running

| Service | URL | Expected |
|:---|:---|:---|
| **Database** | `localhost:5433` | `docker compose ps` shows healthy |
| **Backend** | http://localhost:8080/api/v1/health | HTTP 200 OK |
| **API Docs** | http://localhost:8080/swagger-ui.html | Swagger UI loads |
| **Frontend** | http://localhost:3001 | Application loads |

### Utility Scripts

| Command | Description |
|:---|:---|
| `docker compose up -d` | Start the full stack |
| `docker compose down` | Stop all services |
| `./scripts/fresh.ps1` | Reset DB, re-migrate, and re-seed (keeps caches) |
| `./scripts/share.ps1` | Share local environment via ngrok |

## Project Structure

```
laundry-shop-management-system/
├── backend/                          # Spring Boot REST API (Java 21)
│   ├── src/main/java/com/himotech/laundryms/
│   │   ├── auth/                     # JWT authentication & login
│   │   ├── orders/                   # Order CRUD & status pipeline
│   │   ├── customers/                # Customer registry
│   │   ├── payments/                 # Payment processing
│   │   ├── rates/                    # Service rate configuration
│   │   ├── reports/                  # Sales report generation
│   │   ├── auditlog/                 # Forensic audit trail
│   │   ├── clientalert/              # Customer notifications (SMS)
│   │   ├── users/                    # User management (RBAC)
│   │   ├── security/                 # JWT filter & Spring Security
│   │   └── config/                   # App configuration
│   └── src/main/resources/
│       ├── db/migration/             # Flyway SQL migrations
│       └── application.yml           # Spring Boot config
├── frontend/                         # Next.js client (TypeScript)
│   └── src/
│       ├── app/                      # App Router pages
│       │   ├── (auth)/               # Login page
│       │   ├── (dashboard)/          # Protected dashboard routes
│       │   └── (public)/             # Landing & public tracking
│       ├── components/               # Shared UI components
│       ├── features/                 # Feature-specific modules
│       ├── contexts/                 # React context providers
│       └── hooks/                    # Custom React hooks
├── docs/                             # Project documentation (source of truth)
├── academic-docs-deliverables/       # SDLC academic manuscript
├── scripts/                          # Utility scripts (backup, reset, share)
├── docker-compose.yml                # Dev stack
├── docker-compose.prod.yml           # Production stack
├── .env.example                      # Environment template
└── README.md                         # ← You are here
```

## Architecture

```
┌──────────────────────┐
│     Next.js 14       │  React + TypeScript + Tailwind CSS
│     (Frontend)       │  Glassmorphism UI with Framer Motion
│                      │  App Router with Route Groups
└──────────┬───────────┘
           │ HTTP / REST
           ▼
┌──────────────────────┐
│   Spring Boot 3.5    │  Java 21 LTS
│     (Backend)        │  JWT Auth + RBAC
│                      │  Business rules enforcement
└──────────┬───────────┘  Pricing computation engine
           │ JDBC
           ▼
┌──────────────────────┐
│   PostgreSQL 16      │  pgcrypto (UUID generation)
│    (Database)        │  Flyway schema migrations
│                      │  Database-level audit triggers
└──────────────────────┘
```

### Database Tables

| Table | Purpose |
|:---|:---|
| `users` | System users with UUID PKs and role-based access (Admin/Staff) |
| `customers` | Customer registry with contact validation |
| `service_rates` | Configurable pricing rules (base price, kg limit, extra-minute rate) |
| `orders` | Central transaction table with price snapshots and status tracking |
| `order_add_ons` | Flexible line-item charges per order |
| `payments` | One-to-one payment records (Cash, GCash, Bank Transfer) |
| `client_alerts` | Customer notification queue (SMS via Semaphore) |
| `audit_logs` | Forensic audit trail via database triggers (INSERT/UPDATE/DELETE) |

> **Design decisions:** Orders snapshot pricing at creation time for historical accuracy. Audit logging is handled at the database level via triggers (`fn_audit_log`) for tamper-resistant traceability.

## API Reference

When the backend is running, full interactive documentation is available at:
- **Swagger UI:** http://localhost:8080/swagger-ui.html
- **OpenAPI JSON:** http://localhost:8080/v3/api-docs

### Key Endpoints

| Method | Endpoint | Description | Auth |
|:---|:---|:---|:---|
| `POST` | `/api/v1/orders` | Create order (auto-computes pricing) | Staff/Admin |
| `PATCH` | `/api/v1/orders/{id}/status` | Advance order status | Staff/Admin |
| `GET` | `/api/v1/orders/reference/{ref}` | Public order tracking | None |
| `POST` | `/api/v1/payments` | Record payment | Staff/Admin |
| `GET` | `/api/v1/reports/sales/daily` | Daily sales report | Admin |
| `GET` | `/api/v1/reports/sales/monthly` | Monthly income report | Admin |
| `GET` | `/api/v1/reports/sales/yearly` | Yearly income report | Admin |
| `GET` | `/api/v1/health` | Health check | None |

For the complete API contract, see [`docs/05-tech-design/openapi.yaml`](docs/05-tech-design/openapi.yaml).

## Configuration

The project uses a **single unified `.env` file** at the project root. Copy from the template:

```bash
cp .env.example .env
```

### Key Variables

| Variable | Description | Default |
|:---|:---|:---|
| `DB_HOST` | PostgreSQL host | `localhost` |
| `DB_PORT` | PostgreSQL port | `5433` |
| `DB_NAME` | Database name | `laundry_db` |
| `DB_USER` | Database user | `laundry_user` |
| `DB_PASSWORD` | Database password | *(change this)* |
| `JWT_SECRET` | JWT signing secret (min 32 chars) | *(change this)* |
| `SPRING_PROFILES_ACTIVE` | Spring profile (`dev` / `prod`) | `dev` |
| `ALLOWED_ORIGIN` | CORS allowed origin | `http://localhost:3001` |

> ⚠️ **Security:** Never commit `.env` to Git. It is already in `.gitignore`.

### Production Deployment

```bash
# Configure .env for production (strong passwords, real JWT secret)
# Then start the production stack:
docker compose -f docker-compose.prod.yml up -d --build
```

See [`docs/06-implementation/deployment-guide.md`](docs/06-implementation/deployment-guide.md) for full production deployment instructions including Render, Vercel, and Neon setup.

## Contributing

### Branch Strategy

| Branch | Purpose |
|:---|:---|
| `main` | Production-ready. Protected — no direct commits. |
| `develop` | Active development. All PRs target this branch. |
| `feature/*` | New features (e.g., `feature/order-preview`) |
| `fix/*` | Bug fixes (e.g., `fix/payment-validation`) |

### Workflow

1. Sync: `git checkout develop && git pull --rebase origin develop`
2. Branch: `git checkout -b feature/your-feature`
3. Commit using [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `docs:`, etc.)
4. Push and open a PR **into `develop`**
5. Request review — do not merge your own PR

### PR Checklist

- [ ] Fill out the [PR template](.github/pull_request_template.md)
- [ ] Link user stories (US-xx) or business rules (BR-xx) if applicable
- [ ] Tests pass: `./mvnw test` (backend) / `npm run lint && npm run build` (frontend)
- [ ] At least one reviewer approved

## Documentation

All project documentation lives in the [`docs/`](docs/) directory:

| Topic | Document |
|:---|:---|
| 📋 Documentation Index | [`docs/README.md`](docs/README.md) |
| 📝 Case Study | [`docs/00-context/case-study.md`](docs/00-context/case-study.md) |
| 🎯 Project Scope | [`docs/01-scope/project-scope.md`](docs/01-scope/project-scope.md) |
| 📖 User Stories | [`docs/02-requirements/user-stories.md`](docs/02-requirements/user-stories.md) |
| ⚙️ Business Rules | [`docs/02-requirements/business-rules.md`](docs/02-requirements/business-rules.md) |
| 🗄️ Database Design (ERD) | [`docs/04-data-design/erd.dbml`](docs/04-data-design/erd.dbml) |
| 🔌 API Contract | [`docs/05-tech-design/openapi.yaml`](docs/05-tech-design/openapi.yaml) |
| 🏗️ Architecture | [`docs/05-tech-design/architecture.md`](docs/05-tech-design/architecture.md) |
| 🚀 Deployment Guide | [`docs/06-implementation/deployment-guide.md`](docs/06-implementation/deployment-guide.md) |
| 📘 User Manual | [`docs/06-implementation/user-manual.md`](docs/06-implementation/user-manual.md) |
| 🔑 Dev Credentials | [`docs/development-credentials.md`](docs/development-credentials.md) |

## Team

**HIMÓTECH** — West Visayas State University, La Paz, Iloilo City

| Member | Role |
|:---|:---|
| Brillantes, Luisa Rose | Developer |
| Cadangin, Mark Alvin | Developer |
| Calisa, Eliza May | Developer |
| De la Cruz, Christian Paul | Developer |
| Serra, Alyanna Bianca | Developer |
| Tacleon, Ellen Mae | Developer |

## License

This project is developed for academic purposes as part of the Systems Analysis and Design course at West Visayas State University. All rights reserved.

---

<div align="center">

**Faith Laundry Shop Management System** · Built with ❤️ by HIMÓTECH · May 2026

</div>
