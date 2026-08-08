# System Architecture Overview
## Laundry Shop Management System

> **Client:** Faith Laundry Shop (Baseline Reference)  
> **Prepared By:** Mark Alvin Cadangin  
> **Document ID:** ARCH-001  
> **Version:** 3.3 (Installer Tunnel Integration)  
> **Date:** 2026-08-07  
> **Purpose:** Define implementation-ready architecture aligned to the Standalone, Offline-First shift with Tunnel topology  
> **Status:** Baseline

---

## Document Control
- **Document Type:** Technical Design — Architecture
- **Related Documents:** [Project Scope](../01-scope/project-scope.md), [User Stories](../02-requirements/user-stories.md), [Business Rules](../02-requirements/business-rules.md), [Non-Functional Requirements](../02-requirements/non-functional-requirements.md), [To-Be Process Flow](../03-process/to-be-flow.md), [ERD](../04-data-design/erd.dbml), [OpenAPI Spec](openapi.yaml), [Deployment Guide](../06-implementation/deployment-guide.md)
- **Confidentiality:** Internal / Academic Use

---

## 1. Goals

- Replace paper-based tracking (tags, logbooks) with a centralized system.
- Enable order tracking via unique tracking number (`tracking_number`) and QR codes linked to generated UUIDs.
- Automate pricing computation (load-based, extra minutes, add-ons) and store transaction history.
- Provide income reports (daily, monthly, yearly) from recorded payments.
- **Provide a highly resilient, zero-downtime offline-first local operation at the shop counter.**
- **Enable zero-cost remote access by exposing the local server via a secure Ngrok reverse tunnel: public customer tracking and authenticated staff/admin access.**

---

## 2. Scope (MVP)

### 2.1 In Scope

- Admin and Staff authentication (username/password)
- Customer management (create, search by name/contact)
- Order intake: record weight (kg), compute loads dynamically (`ceil(weight_kg / kg_limit_per_load)`) and totals, generate a unique tracking number (`tracking_number`)
- Business Rules: Configurable rate pricing per load (Baseline default: ₱140 per load up to 8 kg). Weight overages trigger automatic additional load charges based on `kg_limit_per_load`. Time penalties apply configured `price_per_extra_minute`.
- Order status updates with audit trail (`activity_logs`)
- Payment recording (one payment per order; amount must equal order grand total)
- Sales reporting (daily, monthly, yearly) from payments
- QR-Code powered public order tracking by tracking number

### 2.2 Out of Scope (MVP+)

- Inventory or item-level tracking
- Machine maintenance monitoring
- Online booking or scheduling
- Advanced analytics dashboards
- Multi-branch support

---

## 3. Technology Stack

| Layer      | Technology                            |
|------------|---------------------------------------|
| Backend    | Java 21, Spring Boot 3.5+, Maven      |
| Frontend   | Next.js 15+ (Statically Exported), TypeScript, Tailwind CSS |
| Database   | PostgreSQL 16 (Local Background Service) |
| Tunnel     | Ngrok reverse tunnel (`ngrok`)        |
| Migrations | Flyway                                |
| Packaging  | Inno Setup `.exe`, WinSW services, PowerShell/WSL build tooling |
| Hardware   | Windows OS (Desktop/Tablet)           |

---

## 4. System Architecture (Standalone, Tunnel Strategy)

### 4.1 System Context

**Actors**
- **Admin:** Views reports, manages rates, oversees operations
- **Staff:** Encodes orders, updates status, records payments
- **Customer:** Scans QR code on receipt to track order status via the public cloud-hosted web portal

**Hardware Constraint**
- The system enforces a strict hardware constraint: It is deployed on a single physical Windows device (laptop or tablet) located at the shop counter. It achieves absolute local autonomy, functioning flawlessly during local network outages.

### 4.2 Containers

1. **Web App (Frontend)** — Next.js 15+, TypeScript, Tailwind
   - Internal Staff UI: Statically exported and served directly from the Java backend's static resources directory.
   - Remote UI: Deployed to Vercel (or similar). Customers use the public tracking route; staff and admins may use the authenticated application remotely while the local server and tunnel are available.

2. **API Server (Backend)** — Java Spring Boot 3.5+
   - Business rules enforcement (Service layer only).
   - Tracking number generation and uniqueness.
   - Auth and role-based access.

3. **Local Database** — PostgreSQL 16
   - Persistent offline storage running as a silent OS background service.

4. **Ngrok Tunnel (`ngrok`)**
   - A daemon running on the Windows laptop that creates an encrypted reverse tunnel to the configured Ngrok static domain. This exposes the local API to the Vercel frontend without requiring port forwarding or cloud databases. Cloudflare remains a future alternative, but is not implemented by the current installer.

---

## 5. Layering and Responsibility

All business rules are enforced in the **Service layer only**. Controllers and repositories do not contain business logic.

| Layer          | Responsibility                                                           |
|----------------|--------------------------------------------------------------------------|
| **Controller** | HTTP handling, request/response mapping, validation annotations          |
| **Service**    | Business rules (BR-PR-*, BR-OL-*, BR-PAY-*), computations, orchestration |
| **Repository** | Data access, persistence                                                 |
| **Database**   | Storage, constraints (uniques, FKs)                                      |

---

## 6. Backend Modules (Spring Boot)

### 6.1 Core Business Modules

- **auth** — Login, JWT access token + rotating refresh token, role guards, CSRF double-submit cookie filter
- **users** — User management (Admin/Staff), seeded admin account
- **customers** — CRUD, search by name/contact (US-01)
- **rates** — Service rates management, add-on catalog management, active rate retrieval
- **orders** — Order creation, pricing computation, tracking number generation, status lifecycle, machine assignment (US-01, US-02, US-04)
- **payments** — Create payment (1:1), validate amount equals grand total, update payment status (US-06)
- **reports** — Daily, monthly, yearly sales aggregated from payments (US-08, US-09)

### 6.2 Operational & Infrastructure Modules

- **auditlog** — Read-only surface for `audit_logs`; exposes forensic trail to the dashboard (US-03, US-05)
- **clientalert** — In-app notification queue for customer-facing order status communications; SMS adapter stub for future extension
- **machines** — Physical laundry machine CRUD, availability tracking, double-assignment prevention (BR-MAC-01 through BR-MAC-04)
- **settings** — Single-row `system_settings` for operational toggles (e.g., system pause)
- **health** — Lightweight `/api/health` endpoint powering the remote availability probe (US1 — Availability Provider)
- **idempotency** — Operation recovery store: AOP-based `@Idempotent` annotation, `IdempotencyAspect`, and `OperationRecoveryRepository`; prevents duplicate business mutations on retry (US3 — Remote Resilience)
- **config** — Spring Security, CORS, Flyway, cache-control filter, request/response logging filter, global exception handler
- **shared** — Cross-cutting DTOs: `PageResponse`, `ErrorResponse`, `GlobalExceptionHandler`

*(Note: The sync engine module has been deleted in favor of the Tunnel topology.)*

---

## 7. Data Flow (Tunnel Topology)

To achieve zero cloud hosting costs while retaining public tracking and authenticated remote staff/admin functionality, the system eliminates background synchronization and cloud databases.

1. **Local Primacy:** All operations strictly mutate the local PostgreSQL database on the shop's Windows machine.
2. **Tunneling:** The `ngrok` daemon runs in the background on the Windows machine, opening an outbound connection to Ngrok.
3. **Remote Requests:** Customer tracking requests and authenticated staff/admin requests reach the configured Ngrok static domain (for example, `https://shop-name.ngrok-free.app`).
4. **Resolution:** Ngrok routes each request down the secure tunnel directly into the shop's local Spring Boot server. The server applies public-tracking limits or authenticated role-based access, reads the local database, and returns the result.
5. **Tradeoff:** If the shop laptop is powered off or loses internet, the tunnel closes and all remote access is temporarily unavailable; local shop operations continue.

---

## 8. Deployment Strategy

### 8.1 Zero-Friction Client Execution
The system must run entirely locally without requiring the end user (the shop owner) to launch developer tools, terminals, or Docker.

- **Frontend Bundling:** The Next.js UI is statically exported during the build process and bundled directly into the Java application.
- **Executable Packaging:** The application is packaged into a single, professional `.exe` Windows Installer wizard built via Inno Setup and managed as a background service via WinSW (Windows Service Wrapper).
- **Database Provisioning:** The local PostgreSQL instance is installed and configured automatically via a provided PowerShell setup script. It runs as a silent, automated Windows background service, invisible to the operator.
- **Tunnel Provisioning:** The Inno Setup wizard offers local-only or Ngrok remote access. When enabled, it securely collects the Ngrok authtoken and static domain, writes an ACL-protected Ngrok v3 configuration, and runs the tunnel as the dedicated `LaundryShopMSTunnel` Windows background service. Ngrok failure never blocks healthy local operation.

### 8.2 Dual-Target Frontend Build Strategy

The Next.js frontend supports three build targets controlled by the `NEXT_DEPLOYMENT_TARGET` environment variable set at build time:

| Target | Value | Output | API Base |
|---|---|---|---|
| **Local Development** | `development` (default) | Dev server | `NEXT_PUBLIC_API_URL` (e.g. `http://localhost:8080`) |
| **Standalone (Installer)** | `standalone` | `output: "export"` (static HTML) | Relative `/api` (served by Spring Boot) |
| **Vercel (Remote)** | `vercel` | Standard Next.js build | Relative `/api` (Vercel rewrite → `UPSTREAM_API_URL`) |

**Key rules enforced in `next.config.mjs`:**
- When `standalone`: forces static export; no server-side runtime. Frontend is served from Spring Boot's static resources directory.
- When `vercel`: injects a rewrite rule `/api/:path* → UPSTREAM_API_URL/api/:path*`. `UPSTREAM_API_URL` **must** be an HTTPS URL — a build-time guard rejects non-HTTPS values, preventing accidental exposure of the shop host address. Preview deployments use `PREVIEW_UPSTREAM_API_URL` to isolate test traffic.
- The standalone build artifact must contain **no** hardcoded `http://localhost:8080/api` — a CI contract test (`standalone-build-contract.test.ts`) enforces this.

---

## 9. Security & Hardening

To protect the system within a potentially unmanaged shop environment, a Zero-Trust Local Network posture is maintained:

- **Local Bindings (Strict Localhost):** Both the Java backend and the PostgreSQL database are strictly bound to `127.0.0.1` (localhost). This prevents unauthorized access or API calls from other devices connected to the shop's local Wi-Fi.
- **Tunnel Security:** Ngrok does not require inbound firewall ports to be open; it uses an outbound persistent connection.
- **Public API Protection:** The unauthenticated tracking endpoint exposed via the tunnel MUST ONLY return non-PII data (like order status) or require tracking verification to prevent data scraping. Remote staff and admin access MUST require normal JWT authentication and role authorization.

---

## 10. Observability

- Structured logs for order creation, status changes, payment creation
- Consistent API error response format per [OpenAPI spec](openapi.yaml) (ErrorResponse schema)

---

## 11. Architecture Decisions (ADR-lite)

- **Universal Unique Identifiers (UUIDs):** The database utilizes UUIDs or BigSerials securely mapped.
- **Protect the Stack (Hardware Enforcement):** Opted to mandate a Windows OS deployment rather than rewriting the reliable Java/PostgreSQL stack into a mobile-friendly or browser-based offline application (e.g., PWA/IndexedDB).
- **The Tunnel Topology Pivot:** We decisively moved away from the Transactional Outbox cloud-sync pattern in favor of a reverse tunnel, currently Ngrok, to permanently eliminate cloud database costs.
- **Dual-Target Build (Standalone vs Vercel):** Rather than maintaining two separate frontend codebases, a single `NEXT_DEPLOYMENT_TARGET` environment variable at build time switches between static export (for the installer) and a full Next.js build with Vercel rewrites (for remote access). This keeps the UI codebase unified while supporting both deployment targets.
- **Idempotency via AOP (`@Idempotent`):** Remote mutations are protected against duplicate submission using an AOP-based idempotency layer (Spring AOP + `operation_recovery` table) keyed by `X-Operation-Identifier` headers supplied by the frontend. This avoids polluting service method signatures and keeps the pattern orthogonal to business logic.
- **Refresh Token Rotation:** Access tokens are short-lived (minutes); refresh tokens are stored hashed in `refresh_tokens` with family-based rotation detection. If a superseded token is replayed (theft indicator), the entire family is immediately revoked.
- **Markdown Documentation:** maintained under `/docs` as a source of truth.
- **OpenAPI Contract:** maintained as an API source of truth.
