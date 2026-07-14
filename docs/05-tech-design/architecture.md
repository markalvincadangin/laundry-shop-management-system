# System Architecture Overview
## Faith Laundry Shop Management System

> **Client:** Faith Laundry Shop  
> **Prepared By:** HIMÓTECH  
> **Document ID:** ARCH-001  
> **Version:** 2.0 (Offline-First Amendment)  
> **Date:** 2026-07-14  
> **Purpose:** Define implementation-ready architecture aligned to the Standalone, Offline-First shift  
> **Status:** Baseline

---

## Document Control
- **Document Type:** Technical Design — Architecture
- **Related Documents:** [Project Scope](../01-scope/project-scope.md), [User Stories](../02-requirements/user-stories.md), [Business Rules](../02-requirements/business-rules.md), [Non-Functional Requirements](../02-requirements/non-functional-requirements.md), [To-Be Process Flow](../03-process/to-be-flow.md), [ERD](../04-data-design/erd.dbml), [Data Design Notes](../04-data-design/data-notes.md), [OpenAPI Spec](openapi.yaml), [Deployment Guide](../06-implementation/deployment-guide.md)
- **Confidentiality:** Internal / Academic Use

---

## 1. Goals

- Replace paper-based tracking (tags, logbooks) with a centralized system.
- Enable order tracking via unique reference number and QR codes linked to generated UUIDs.
- Automate pricing computation (load-based, extra minutes, add-ons) and store transaction history.
- Provide income reports (daily, monthly, yearly) from recorded payments.
- **Provide a highly resilient, zero-downtime offline-first local operation at the shop counter.**
- **Securely synchronize local operations to a remote cloud database for administrative tracking and digital notifications without blocking local transactions.**

---

## 2. Scope (MVP)

### 2.1 In Scope

- Admin and Staff authentication (username/password)
- Customer management (create, search by name/contact)
- Order intake: record weight (kg), compute loads (8 kg per load) and totals, generate a unique reference number
- Business Rules: Standard pricing at ₱140 per load (up to 8 kg). Weight overages trigger automatic additional load charges. Time penalties require manual input to add ₱1 per extra minute.
- Order status updates with audit trail (order_status_logs)
- Payment recording (one payment per order; amount must equal order grand total)
- Sales reporting (daily, monthly, yearly) from payments
- QR-Code powered public order tracking by reference number

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
| Sync Engine| Java `@Scheduled` Worker + Transactional Outbox |
| Migrations | Flyway                                |
| Packaging  | `jpackage` native installer, PowerShell |
| Hardware   | Windows OS (Desktop/Tablet)           |

---

## 4. System Architecture (Standalone, Offline-First)

### 4.1 System Context

**Actors**
- **Admin:** Views reports, manages rates, oversees operations
- **Staff:** Encodes orders, updates status, records payments
- **Customer:** Scans QR code on receipt to track order status via the public cloud-hosted web portal

**Hardware Constraint**
- The system enforces a strict hardware constraint: It is deployed on a single physical Windows device (laptop or tablet) located at the shop counter. It achieves absolute local autonomy, functioning flawlessly during local network outages.

### 4.2 Containers

1. **Web App (Frontend)** — Next.js 15+, TypeScript, Tailwind
   - Statically exported and served directly from the Java backend's static resources directory.
   - Order intake, status updates, payment recording, and reports dashboard (Admin only).

2. **API Server & Sync Engine (Backend)** — Java Spring Boot 3.5+
   - Business rules enforcement (Service layer only).
   - Reference number generation and uniqueness.
   - Auth and role-based access.
   - **Sync Worker:** Polling engine that securely bridges local data to the cloud when internet access is restored.

3. **Local Database** — PostgreSQL 16
   - Persistent offline storage running as a silent OS background service.
   - Employs Universal Unique Identifiers (UUIDs) for all primary keys to prevent data collisions.

4. **Cloud API (Remote)** 
   - A remote Next.js/PHP endpoint that receives synchronization payloads to execute idempotent operations against the remote PostgreSQL database.

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
- **sync** — Background synchronization worker and Transactional Outbox event publishing

---

## 7. Data Flow (Outbox Pattern)

The system is engineered for a distributed, eventual-consistency model. To ensure operations never freeze during local network outages, data synchronization utilizes the **Transactional Outbox Pattern**:

1. **Local Transaction**: When an operational event occurs (e.g., Order Created, Status Updated), the system saves the primary record and simultaneously inserts a serialized payload into a tracking table (`outbox_events` with `sync_status`, `retry_count`) within the exact same database transaction.
2. **Sync Worker**: A `@Scheduled` Java background worker continually polls the `outbox_events` table for `PENDING` transactions.
3. **Cloud Push**: When an active internet connection is detected, the worker securely pushes the payloads to the remote Cloud API.
4. **Conflict Resolution (Local Wins)**: The system enforces a strict "Local Wins" policy. The shop counter is the absolute source of truth. The Cloud API executes idempotent `UPSERT` operations, blindly overwriting any cloud-side changes with the local data to resolve conflicts.
5. **Mark Completed**: Upon a successful HTTP acknowledgment from the Cloud API, the local worker updates the event's `sync_status` to `COMPLETED`.

---

## 8. Deployment Strategy

### 8.1 Zero-Friction Client Execution
The system must run entirely locally without requiring the end user (the shop owner) to launch developer tools, terminals, or Docker.

- **Frontend Bundling:** The Next.js UI is statically exported during the build process and bundled directly into the Java application.
- **Executable Packaging:** The Java application and JRE are bundled into a native desktop executable (e.g., an `.msi` Windows Installer) using the `jpackage` tool.
- **Database Provisioning:** The local PostgreSQL instance is installed and configured automatically via a provided PowerShell setup script. It runs as a silent, automated Windows background service, invisible to the operator.

---

## 9. Security & Hardening

To protect the system within a potentially unmanaged shop environment, a Zero-Trust Local Network posture is maintained:

- **Local Bindings (Strict Localhost):** Both the Java backend and the PostgreSQL database are strictly bound to `127.0.0.1` (localhost). This prevents unauthorized access or API calls from other devices connected to the shop's local Wi-Fi.
- **Sync Authentication:** Mutual token-based authentication (JWT/HMAC) secures the synchronization channel between the local Java worker and the Cloud API.
- **Public API Protection:** Strict rate-limiting is applied to the cloud-hosted Next.js tracking endpoint to prevent UUID brute-forcing and malicious data scraping.

---

## 10. Observability

- Structured logs for order creation, status changes, payment creation
- Consistent API error response format per [OpenAPI spec](openapi.yaml) (ErrorResponse schema)

---

## 11. Architecture Decisions (ADR-lite)

- **Universal Unique Identifiers (UUIDs):** Complete migration of all database entities to use UUIDs for primary keys to categorically prevent data collisions in the distributed database environment.
- **Protect the Stack (Hardware Enforcement):** Opted to mandate a Windows OS deployment rather than rewriting the reliable Java/PostgreSQL stack into a mobile-friendly or browser-based offline application (e.g., PWA/IndexedDB).
- **Markdown Documentation:** maintained under `/docs` as a source of truth.
- **OpenAPI Contract:** maintained as an API source of truth.
