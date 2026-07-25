# Project Scope
## Laundry Shop Management System

> **Client / Case Study:** Faith Laundry Shop (Baseline Reference)  
> **Prepared By:** Mark Alvin Cadangin  
> **Document ID:** SCOPE-001  
> **Version:** 1.3  
> **Date:** 2026-07-25  
> **Purpose:** Define MVP boundaries, deliverables, and constraints for system deployment  
> **Status:** Baseline (MVP Reference)

---

## Document Control
- **Document Type:** Scope Definition
- **Related Documents:** [Case Study (CS-001)](../00-context/case-study.md), [Client Interview (INT-001)](../00-context/client-interview.md), [User Stories](../02-requirements/user-stories.md), [Business Rules](../02-requirements/business-rules.md), [Non-Functional Requirements](../02-requirements/non-functional-requirements.md), [Architecture](../05-tech-design/architecture.md), [Deployment Guide](../06-implementation/deployment-guide.md)
- **Confidentiality:** Internal / Academic Use

### Revision History
| Version | Date       | Author   | Changes |
|---------|------------|----------|---------|
| 1.0     | 2026-02-13 | Mark Alvin Cadangin | Initial baseline |
| 1.1     | 2026-02-20 | Mark Alvin Cadangin | Release precondition (Ready + Paid); payment method recording in scope; NFR reference; glossary; operational readiness |
| 1.2     | 2026-07-24 | Mark Alvin Cadangin | Standardized `tracking_number` terminology, UUID data model, and aligned with Standalone Cloudflare Tunnel Architecture |
| 1.3     | 2026-07-25 | Mark Alvin Cadangin | Generalized project scope to customizable laundry management platform with configurable business rules |

---

## 1. Introduction

This document defines the boundaries, deliverables, and constraints of the Laundry Shop Management System.

**Purpose:**
- Establish clear system boundaries and multi-shop configurability
- Prevent scope creep
- Align development with general laundry shop business processes (using Faith Laundry Shop as baseline case study)
- Serve as the reference for implementation and validation

Scope is derived from the approved Case Study and Client Interview and aligns with academic baseline documents (PC-001, SSR-001, CS-001, SA-001, RRM-001).

---

## 2. Project Objective

Design and implement a Laundry Shop Management System that replaces manual paper-based processes with a structured digital solution that:

- Automates pricing computation
- Tracks order lifecycle stages
- Records and validates payments
- Generates income reports
- Enables order tracking via unique tracking number
- Supports role-based access control (Admin / Staff)

---

## 3. System Boundaries

### 3.1 In-Scope (Minimum Viable Product)

#### 3.1.1 Order Intake & Management

The system shall:

- Record customer information: first name, last name, contact number
- Record order details: weight (kg), extra minutes (if applicable), optional add-ons
- Automatically compute:
  - Total loads (8 kg per load)
  - Base amount (₱140 per load)
  - Extra minute charge (₱1 per minute beyond 45 minutes per load)
  - Add-ons total
  - Grand total
- Generate a unique tracking number (`tracking_number`)
- Set initial order status to **Received**
- Store order creation timestamp

#### 3.1.2 Order Lifecycle Tracking

The system shall support order statuses: Received, Washing, Drying, Folding, Ready for Pickup, Released, Cancelled.

The system shall:

- Record status changes with timestamp and user (audit trail)
- Restrict invalid status values and enforce logical status transitions (BR-OL-04)
- Prevent release unless (1) status is **Ready for Pickup** and (2) payment has been recorded (**Paid**)

#### 3.1.3 Payment Recording

The system shall:

- Record one payment per order
- Require full payment (MVP restriction)
- Validate that payment amount exactly matches the order grand total
- Record **payment method** (Cash, GCash, Bank Transfer) for each payment — for record-keeping only; no integration with payment gateways
- Update payment status (**Paid** / **Unpaid**) automatically
- Record payment timestamp

Partial payments and overpayments are excluded from MVP.

#### 3.1.4 Reporting

The system shall generate Daily, Monthly, and Yearly income reports.

Reports shall be computed exclusively from recorded payment data. Only orders with payment status **Paid** are included.

#### 3.1.5 Order Tracking (Customer-Facing)

The system shall allow customers to:

- Enter a valid order tracking number (`tracking_number`)
- View: current order status, order date, basic order summary

No sensitive or internal system data shall be exposed.

#### 3.1.6 User Roles (Basic Access Control)

The system shall support two roles:

- **Admin:** View reports, access payment history, manage rates
- **Staff:** Create orders, update order status, record payments (no access to reports)

#### 3.1.7 Pricing Configuration

The system shall:

- Store pricing rules in the database
- Allow future modification of rates without schema changes
- Preserve historical accuracy of order totals

---

## 4. Out-of-Scope (Excluded from MVP)

The following is explicitly excluded from MVP:

- **Partial payment support** — full payment only; amount must equal order grand total
- **Payment gateway integrations** — no API integration with GCash, bank, or other payment providers; the system only records which method (Cash, GCash, Bank Transfer) was used
- **Inventory management** — detergent, supplies, stock tracking
- **Machine maintenance tracking** — washing machine status or maintenance scheduling
- **Multi-branch management** — single-branch only
- **Customer account registration** — no customer self-service accounts or login
- **Loyalty programs** — points, discounts, or membership tiers
- **Advanced business analytics dashboards** — charts, trends, or predictive analytics beyond basic income reports
- **Real-time SMS sending** — notification records may exist; actual SMS delivery is optional/post-MVP

Future enhancements may address these in later phases.

---

## 5. Non-Functional Requirements (Summary)

Non-functional requirements are detailed in **[docs/02-requirements/non-functional-requirements.md](../02-requirements/non-functional-requirements.md)**. Summary:

- **Security:** Role-based access (Admin/Staff), JWT authentication, no sensitive data on public tracking
- **Performance:** Responsive UI; API response times suitable for single-shop usage
- **Availability:** System operable during business hours; backup and recovery procedures documented
- **Audit:** Status changes and payment records traceable to user and timestamp
- **Usability:** Admin and staff can operate with minimal training; see [User Manual](../06-implementation/user-manual.md)
- **Maintainability:** Documented architecture, OpenAPI and ERD as source of truth, automated tests

---

## 6. Assumptions

1. The laundry shop operates as a single branch.
2. Admin and staff possess basic computer literacy.
3. Payment is typically collected upon pickup.
4. The system is deployed on a physical Windows device kept powered on at the counter.
5. Internet connectivity is required *only* for customer online tracking (via Cloudflare Tunnel). Local operations continue seamlessly without internet.

---

## 7. Constraints

### 7.1 Technical Constraints

- Backend: Java 21, Spring Boot 3.5+
- Database: PostgreSQL 16 (Local Windows Service)
- Migration Tool: Flyway
- Frontend: Next.js 15+, TypeScript
- Infrastructure: Standalone Windows Native Application (`.exe` wizard) + Cloudflare Tunnel
- Testing: Testcontainers
- CI/CD: GitHub Actions

### 7.2 Operational Constraints

- Limited personnel (Admin and one staff)
- Manual fallback during transition
- Budget limitations typical of MSMEs

---

## 8. Success Criteria

The project shall be considered successful if:

- Order creation eliminates manual pricing errors
- Order tracking reduces mix-ups
- Daily income reporting is automated
- Payment validation prevents incorrect totals
- Staff can operate the system with minimal training
- All documented business rules are enforced server-side

---

## 9. Operational Readiness (Complete System)

For the system to be considered **complete and production-ready**, the following must be in place (see [Deployment Guide](../06-implementation/deployment-guide.md) and [Handover Checklist](../06-implementation/handover-checklist.md)):

- **Deployment:** Production stack deployable natively on Windows via the provided `.exe` installer wizard.
- **Tunnel:** Cloudflare Tunnel (`cloudflared`) configured to securely expose the local backend to the public tracking frontend.
- **Backup:** Database backup script available and scheduled (e.g., nightly) using the provided `backup-database.sh`/`.ps1`.
- **Security:** Strong JWT secret and DB password in production generated securely during Windows setup.
- **Handover:** User manual and handover checklist completed; Admin and Staff trained; sign-off obtained.
- **Support:** Contact or process for technical support and maintenance documented.

---

## 10. Scope Governance

Any functionality not explicitly listed under **Section 3 – In-Scope** shall:

1. Be documented as an enhancement
2. Be reviewed and approved before implementation
3. Be developed in a separate branch
4. Be clearly marked as post-MVP

No undocumented feature additions shall be merged into the main development branch.

---

## 11. Glossary

| Term | Definition |
|------|------------|
| **Load** | Unit of laundry pricing: one load covers up to 8 kg; price per load is ₱140 (configurable). |
| **Tracking number** | Unique identifier for an order (e.g., LDR-YYYYMMDD-XXXX), used for customer tracking (`tracking_number`). |
| **Release** | Final order status when laundry has been handed to the customer; requires status Ready for Pickup and payment recorded. |
| **Snapshot pricing** | Copy of service rates stored on the order at creation time so historical totals remain correct when rates change. |
| **MVP** | Minimum Viable Product — the initial deliverable scope defined in this document. |

---

## 12. Conclusion

This document formally defines the system boundaries of the Faith Laundry Shop Management System. It ensures alignment with stakeholder needs, enforces development discipline, and establishes the authoritative reference for MVP functionality and scope control.
