# Project Scope
## Faith Laundry Shop Management System

> **Client:** Faith Laundry Shop  
> **Prepared By:** HIMÓTECH  
> **Document ID:** SCOPE-001  
> **Version:** 1.1  
> **Date:** 2026-02-20  
> **Purpose:** Define MVP boundaries, deliverables, and constraints  
> **Status:** Baseline (MVP Reference)

---

## Document Control
- **Document Type:** Scope Definition
- **Related Documents:** [Case Study (CS-001)](../00-context/case-study.md), [Client Interview (INT-001)](../00-context/client-interview.md), [User Stories](../02-requirements/user-stories.md), [Business Rules](../02-requirements/business-rules.md), [Non-Functional Requirements](../02-requirements/non-functional-requirements.md), [Architecture](../05-tech-design/architecture.md), [Deployment Guide](../06-implementation/deployment-guide.md)
- **Confidentiality:** Internal / Academic Use

### Revision History
| Version | Date       | Author   | Changes |
|---------|------------|----------|---------|
| 1.0     | 2026-02-13 | HIMÓTECH  | Initial baseline |
| 1.1     | 2026-02-20 | HIMÓTECH  | Release precondition (Ready + Paid); payment method recording in scope; NFR reference; glossary; operational readiness |

---

## 1. Introduction

This document defines the boundaries, deliverables, and constraints of the Faith Laundry Shop Management System.

**Purpose:**
- Establish clear system boundaries
- Prevent scope creep
- Align development with stakeholder needs
- Serve as the reference for implementation and validation

Scope is derived from the approved Case Study and Client Interview and aligns with academic baseline documents (PC-001, SSR-001, CS-001, SA-001, RRM-001).

---

## 2. Project Objective

Design and implement a Laundry Shop Management System that replaces manual paper-based processes with a structured digital solution that:

- Automates pricing computation
- Tracks order lifecycle stages
- Records and validates payments
- Generates income reports
- Enables order tracking via reference number
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
- Generate a unique reference number
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

- Enter a valid order reference number
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
4. Internet connectivity is sufficient for system use.
5. Hardware for system operation is available.

---

## 7. Constraints

### 7.1 Technical Constraints

- Backend: Java 21, Spring Boot 3.5+
- Database: PostgreSQL 16
- Migration Tool: Flyway
- Frontend: Next.js 14+, TypeScript
- Infrastructure: Docker & Docker Compose
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

- **Deployment:** Production stack deployable via Docker Compose (Nginx + Backend + Frontend + PostgreSQL); environment variables documented
- **Backup:** Database backup script available and scheduled (e.g., nightly); backup location and restore procedure documented
- **Security:** Strong JWT secret and DB password in production; HTTPS recommended; CORS configured for frontend origin
- **Handover:** User manual and handover checklist completed; Admin and Staff trained; sign-off obtained
- **Support:** Contact or process for technical support and maintenance documented

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
| **Reference number** | Unique identifier for an order (e.g., LDR-YYYYMMDD-XXXX), used for customer tracking. |
| **Release** | Final order status when laundry has been handed to the customer; requires status Ready for Pickup and payment recorded. |
| **Snapshot pricing** | Copy of service rates stored on the order at creation time so historical totals remain correct when rates change. |
| **MVP** | Minimum Viable Product — the initial deliverable scope defined in this document. |

---

## 12. Conclusion

This document formally defines the system boundaries of the Faith Laundry Shop Management System. It ensures alignment with stakeholder needs, enforces development discipline, and establishes the authoritative reference for MVP functionality and scope control.
