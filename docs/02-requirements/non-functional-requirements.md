# Non-Functional Requirements
## Faith Laundry Shop Management System

> **Client:** Faith Laundry Shop  
> **Prepared By:** HIMÓTECH  
> **Document ID:** NFR-001  
> **Version:** 1.0  
> **Date:** 2026-02-20  
> **Purpose:** Define non-functional requirements for security, performance, availability, and maintainability  
> **Status:** Baseline (MVP)

---

## Document Control
- **Document Type:** Requirements — Non-Functional
- **Related Documents:** [Project Scope](../01-scope/project-scope.md), [User Stories](user-stories.md), [Business Rules](business-rules.md), [Architecture](../05-tech-design/architecture.md), [Deployment Guide](../06-implementation/deployment-guide.md)
- **Confidentiality:** Internal / Academic Use

---

## 1. Security

| ID    | Requirement | Priority |
|-------|-------------|----------|
| NFR-S1 | The system SHALL authenticate users (Admin, Staff) via username and password. | Must |
| NFR-S2 | The system SHALL use JWT (or equivalent) for session management; credentials SHALL NOT be stored in client-side code. | Must |
| NFR-S3 | The system SHALL enforce role-based access: Admin (reports, rates, all operations); Staff (orders, status, payments, customers; no reports). | Must |
| NFR-S4 | The public tracking endpoint SHALL return only: reference number, current status, order date, basic summary. Internal IDs, staff information, and payment details SHALL NOT be exposed. | Must |
| NFR-S5 | Passwords SHALL be stored as one-way hashes; JWT secret and database credentials SHALL be configurable via environment variables and SHALL NOT be committed to version control. | Must |
| NFR-S6 | In production, the system SHALL use a strong JWT secret (≥32 characters) and a non-default database password. | Must |

---

## 2. Performance

| ID    | Requirement | Priority |
|-------|-------------|----------|
| NFR-P1 | The system SHALL support concurrent use by at least two users (Admin and Staff) without degradation. | Must |
| NFR-P2 | Order list and payment list SHALL support pagination to handle growth of data. | Must |
| NFR-P3 | API responses SHALL complete within a reasonable time for single-shop workload (no formal SLA for MVP). | Should |

---

## 3. Availability & Recovery

| ID    | Requirement | Priority |
|-------|-------------|----------|
| NFR-A1 | The system SHALL be deployed natively on a local Windows machine located at the shop counter, acting as the offline-first server. | Must |
| NFR-A2 | Database backup SHALL be supported via documented script (e.g., `scripts/backup-database.ps1`); backup format SHALL allow restore to PostgreSQL. | Must |
| NFR-A3 | Deployment and restore procedures SHALL be documented in [Deployment Guide](../06-implementation/deployment-guide.md). | Must |
| NFR-A4 | The public order tracking endpoint relies on a Cloudflare Tunnel; tracking SHALL only be available while the local Windows machine is powered on and connected to the internet. | Must |

---

## 4. Audit & Traceability

| ID    | Requirement | Priority |
|-------|-------------|----------|
| NFR-T1 | Every order status change SHALL be recorded with timestamp and user (audit trail in `activity_logs`). | Must |
| NFR-T2 | Payment records SHALL be linked to order and user who recorded the payment. | Must |
| NFR-T3 | Reports SHALL be computed from recorded payment data only (no estimates or manual overrides in MVP). | Must |

---

## 5. Usability

| ID    | Requirement | Priority |
|-------|-------------|----------|
| NFR-U1 | Admin and Staff SHALL be able to perform core tasks (create order, update status, record payment, view reports) with minimal training. | Must |
| NFR-U2 | An end-user manual SHALL be provided (see [User Manual](../06-implementation/user-manual.md)). | Must |
| NFR-U3 | Error messages SHALL be clear enough for staff to correct invalid input (e.g., payment amount mismatch, invalid status transition). | Should |

---

## 6. Maintainability & Operations

| ID    | Requirement | Priority |
|-------|-------------|----------|
| NFR-M1 | System architecture, API contract (OpenAPI), and data model (ERD) SHALL be documented and treated as source of truth. | Must |
| NFR-M2 | Database schema changes SHALL be version-controlled via Flyway migrations. | Must |
| NFR-M3 | The system SHALL support configuration via environment variables (database, JWT secret, CORS origin, API URL) without code changes. | Must |
| NFR-M4 | A handover checklist and deployment guide SHALL be provided for production deployment and client handover. | Must |

---

## 7. Compliance with Scope

These NFRs support the [Project Scope](../01-scope/project-scope.md) and do not introduce new functional features. They ensure the delivered system is secure, operable, and maintainable as a complete, professional solution.
