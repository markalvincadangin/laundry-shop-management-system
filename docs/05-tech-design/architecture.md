# System Architecture Overview
## Faith Laundry Shop Management System

> **Client:** Faith Laundry Shop  
> **Prepared By:** HIMÓTECH  
> **Document ID:** ARCH-001  
> **Version:** 3.1 (Standalone & Tunnel Standardization)  
> **Date:** 2026-07-24  
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
- **Enable zero-cost public tracking by exposing the local server via a secure Cloudflare Tunnel.**

---

## 2. Scope (MVP)

### 2.1 In Scope

- Admin and Staff authentication (username/password)
- Customer management (create, search by name/contact)
- Order intake: record weight (kg), compute loads (8 kg per load) and totals, generate a unique tracking number (`tracking_number`)
- Business Rules: Standard pricing at ₱140 per load (up to 8 kg). Weight overages trigger automatic additional load charges. Time penalties require manual input to add ₱1 per extra minute.
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
| Tunnel     | Cloudflare Tunnel (`cloudflared`)     |
| Migrations | Flyway                                |
| Packaging  | `jpackage` native installer, PowerShell |
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
   - Public Tracking UI: Deployed to Vercel (or similar) to provide a public URL for customers.

2. **API Server (Backend)** — Java Spring Boot 3.5+
   - Business rules enforcement (Service layer only).
   - Tracking number generation and uniqueness.
   - Auth and role-based access.

3. **Local Database** — PostgreSQL 16
   - Persistent offline storage running as a silent OS background service.

4. **Cloudflare Tunnel (`cloudflared`)** 
   - A daemon running on the Windows laptop that creates an encrypted reverse tunnel to Cloudflare's network. This exposes the local API to the Vercel frontend without requiring port forwarding or cloud databases.

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

- **auth** — Login, JWT/session, role guards
- **users** — User management (Admin/Staff), seeded admin
- **customers** — CRUD, search (US-01)
- **rates** — Service rates management, active rate retrieval
- **orders** — Order creation, pricing computation, reference generation (US-01, US-02)
- **activity** — Read-only access to `activity_logs`; surfaces forensic audit trail to the dashboard (US-03, US-05)
- **payments** — Create payment (1:1), validate amount equals grand total, update payment status (US-06)
- **reports** — Daily, monthly, yearly sales from payments (US-08, US-09)

*(Note: The sync engine module has been deleted in favor of the Tunnel topology).*

---

## 7. Data Flow (Tunnel Topology)

To achieve zero cloud hosting costs while retaining public tracking functionality, the system eliminates background synchronization and cloud databases.

1. **Local Primacy:** All operations strictly mutate the local PostgreSQL database on the shop's Windows machine.
2. **Tunneling:** The `cloudflared` daemon runs in the background on the Windows machine, opening an outbound connection to Cloudflare.
3. **Tracking Requests:** When a customer visits the Vercel tracking site and searches for an order, Vercel makes an API call to the Cloudflare domain (e.g., `api.faithlaundry.com`).
4. **Resolution:** Cloudflare routes the request down the secure tunnel directly into the shop's local Spring Boot server. The server reads the database and returns the result.
5. **Tradeoff:** If the shop laptop is powered off or loses internet, the tunnel closes, and customer tracking is temporarily unavailable.

---

## 8. Deployment Strategy

### 8.1 Zero-Friction Client Execution
The system must run entirely locally without requiring the end user (the shop owner) to launch developer tools, terminals, or Docker.

- **Frontend Bundling:** The Next.js UI is statically exported during the build process and bundled directly into the Java application.
- **Executable Packaging:** The application is packaged into a single, professional `.exe` Windows Installer wizard built via Inno Setup and managed as a background service via WinSW (Windows Service Wrapper).
- **Database Provisioning:** The local PostgreSQL instance is installed and configured automatically via a provided PowerShell setup script. It runs as a silent, automated Windows background service, invisible to the operator.
- **Tunnel Provisioning:** The Cloudflare Tunnel token is installed on the machine, securely linking it to the remote domain.

---

## 9. Security & Hardening

To protect the system within a potentially unmanaged shop environment, a Zero-Trust Local Network posture is maintained:

- **Local Bindings (Strict Localhost):** Both the Java backend and the PostgreSQL database are strictly bound to `127.0.0.1` (localhost). This prevents unauthorized access or API calls from other devices connected to the shop's local Wi-Fi.
- **Tunnel Security:** Cloudflare Tunnels do not require inbound firewall ports to be open. They rely on outbound persistent connections.
- **Public API Protection:** The public tracking endpoint exposed via the tunnel MUST ONLY return non-PII data (like order status) or require authentication (PIN code / Phone Number validation) to prevent data scraping.

---

## 10. Observability

- Structured logs for order creation, status changes, payment creation
- Consistent API error response format per [OpenAPI spec](openapi.yaml) (ErrorResponse schema)

---

## 11. Architecture Decisions (ADR-lite)

- **Universal Unique Identifiers (UUIDs):** The database utilizes UUIDs or BigSerials securely mapped.
- **Protect the Stack (Hardware Enforcement):** Opted to mandate a Windows OS deployment rather than rewriting the reliable Java/PostgreSQL stack into a mobile-friendly or browser-based offline application (e.g., PWA/IndexedDB).
- **The Tunnel Topology Pivot:** We decisively moved away from the Transactional Outbox cloud-sync pattern in favor of Cloudflare Tunnels to permanently eliminate cloud database costs.
- **Markdown Documentation:** maintained under `/docs` as a source of truth.
- **OpenAPI Contract:** maintained as an API source of truth.
