# Non-Functional Requirements Checklist

## Faith Laundry Shop Management System

> **Client:** Faith Laundry Shop  
> **Prepared By:** HIMÓTECH  
> **Document ID:** NFR-001  
> **Version:** 1.0  
> **Date:** 2026-02-20  
> **Purpose:** Define non-functional requirements for security, performance, availability, and maintainability  
> **Status:** Baseline

---

## Document Control

- **Document Type:** Non-Functional Requirements Checklist
- **Related Documents:** [Functional Requirements Checklist (FRC-001)](9-functional-requirements-checklist.md)
- **Confidentiality:** Internal / Academic Use

---

## Non-Functional Requirements Checklist

**SYSTEM NAME:** Laundry Shop Management System  
**EVALUATED ON:** HIMÓTECH  

### Category: Security


| ID         | Requirement                                                                                                                                                                             | Priority                |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- |
| **NFR-S1** | The system SHALL authenticate users (Admin, Staff) via username and password.                                                                                                           | ☑ Mandatory ☐ Desirable |
| **NFR-S2** | The system SHALL use JWT (or equivalent) for session management; credentials SHALL NOT be stored in client-side code.                                                                   | ☑ Mandatory ☐ Desirable |
| **NFR-S3** | The system SHALL enforce role-based access: Admin (reports, rates, all operations); Staff (orders, status, payments, customers; no reports).                                            | ☑ Mandatory ☐ Desirable |
| **NFR-S4** | The public tracking endpoint SHALL return only: reference number, current status, order date, basic summary. Internal IDs, staff information, and payment details SHALL NOT be exposed. | ☑ Mandatory ☐ Desirable |
| **NFR-S5** | Passwords SHALL be stored as one-way hashes; JWT secret and database credentials SHALL be configurable via environment variables and SHALL NOT be committed to version control.         | ☑ Mandatory ☐ Desirable |
| **NFR-S6** | In production, the system SHALL use a strong JWT secret (≥32 characters) and a non-default database password.                                                                           | ☑ Mandatory ☐ Desirable |


### Category: Performance


| ID         | Requirement                                                                                             | Priority                |
| ---------- | ------------------------------------------------------------------------------------------------------- | ----------------------- |
| **NFR-P1** | The system SHALL support concurrent use by at least two users (Admin and Staff) without degradation.    | ☑ Mandatory ☐ Desirable |
| **NFR-P2** | Order list and payment list SHALL support pagination to handle growth of data.                          | ☑ Mandatory ☐ Desirable |
| **NFR-P3** | API responses SHALL complete within a reasonable time for single-shop workload (no formal SLA for MVP). | ☐ Mandatory ☑ Desirable |


### Category: Availability & Recovery


| ID         | Requirement                                                                                                        | Priority                |
| ---------- | ------------------------------------------------------------------------------------------------------------------ | ----------------------- |
| **NFR-A1** | The system SHALL be deployable and operable on hardware available to the client (single machine or local network). | ☑ Mandatory ☐ Desirable |
| **NFR-A2** | Database backup SHALL be supported via documented script; backup format SHALL allow restore to PostgreSQL.         | ☑ Mandatory ☐ Desirable |
| **NFR-A3** | Deployment and restore procedures SHALL be documented in the Deployment Guide.                                     | ☑ Mandatory ☐ Desirable |


### Category: Audit & Traceability


| ID         | Requirement                                                                                               | Priority                |
| ---------- | --------------------------------------------------------------------------------------------------------- | ----------------------- |
| **NFR-T1** | Every order status change SHALL be recorded with timestamp and user (audit trail in `order_status_logs`). | ☑ Mandatory ☐ Desirable |
| **NFR-T2** | Payment records SHALL be linked to order and user who recorded the payment.                               | ☑ Mandatory ☐ Desirable |
| **NFR-T3** | Reports SHALL be computed from recorded payment data only (no estimates or manual overrides in MVP).      | ☑ Mandatory ☐ Desirable |


### Category: Usability


| ID         | Requirement                                                                                                                            | Priority                |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- |
| **NFR-U1** | Admin and Staff SHALL be able to perform core tasks (create order, update status, record payment, view reports) with minimal training. | ☑ Mandatory ☐ Desirable |
| **NFR-U2** | An end-user manual SHALL be provided.                                                                                                  | ☑ Mandatory ☐ Desirable |
| **NFR-U3** | Error messages SHALL be clear enough for staff to correct invalid input (e.g., payment amount mismatch, invalid status transition).    | ☐ Mandatory ☑ Desirable |


### Category: Maintainability & Operations


| ID         | Requirement                                                                                                           | Priority                |
| ---------- | --------------------------------------------------------------------------------------------------------------------- | ----------------------- |
| **NFR-M1** | System architecture, API contract (OpenAPI), and data model (ERD) SHALL be documented and treated as source of truth. | ☑ Mandatory ☐ Desirable |
| **NFR-M2** | Database schema changes SHALL be version-controlled via Flyway migrations.                                            | ☑ Mandatory ☐ Desirable |
| **NFR-M3** | The system SHALL support configuration via environment variables without code changes.                                | ☑ Mandatory ☐ Desirable |
| **NFR-M4** | A handover checklist and deployment guide SHALL be provided for production deployment and client handover.            | ☑ Mandatory ☐ Desirable |


