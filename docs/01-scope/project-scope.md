# Project Scope
## Faith Laundry Shop Management System

> **Client:** Faith Laundry Shop  
> **Prepared By:** HIMÓTECH  
> **Document ID:** SCOPE-001  
> **Version:** 1.0  
> **Date:** 2026-02-13  
> **Purpose:** Define MVP boundaries, deliverables, and constraints  
> **Status:** Baseline (MVP Reference)

---

## Document Control
- **Document Type:** Scope Definition
- **Related Documents:** [Case Study (CS-001)](../00-context/case-study.md), [Client Interview (INT-001)](../00-context/client-interview.md), [User Stories](../02-requirements/user-stories.md), [Business Rules](../02-requirements/business-rules.md), [Architecture](../05-tech-design/architecture.md), [Implementation Plan](../06-implementation/implementation-plan.md)
- **Confidentiality:** Internal / Academic Use

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
- Supports role-based access control (Owner / Staff)

---

## 3. System Boundaries

### 3.1 In-Scope (Minimum Viable Product)

#### 3.1.1 Order Intake & Management

The system shall:

- Record customer information: first name, last name, contact number
- Record order details: weight (kg), extra minutes (if applicable), optional add-ons
- Automatically compute:
  - Total loads (8 kg per load)
  - Base amount (₱120 per load)
  - Extra minute charge (₱1 per minute beyond 45 minutes per load)
  - Add-ons total
  - Grand total
- Generate a unique reference number
- Set initial order status to **Received**
- Store order creation timestamp

#### 3.1.2 Order Lifecycle Tracking

The system shall support order statuses: Received, Washing, Drying, Folding, Ready for Pickup, Released, Cancelled.

The system shall:

- Record status changes with timestamp
- Restrict invalid status values
- Prevent release unless status is **Ready for Pickup**

#### 3.1.3 Payment Recording

The system shall:

- Record one payment per order
- Require full payment (MVP restriction)
- Validate that payment amount exactly matches the order grand total
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

- **Owner:** View reports, access payment history, manage rates
- **Staff:** Create orders, update order status, record payments (no access to reports)

#### 3.1.7 Pricing Configuration

The system shall:

- Store pricing rules in the database
- Allow future modification of rates without schema changes
- Preserve historical accuracy of order totals

---

## 4. Out-of-Scope (Excluded from MVP)

The following is explicitly excluded from MVP:

- Partial payment support
- Digital payment integrations (e.g., GCash, bank transfer)
- Inventory management (detergent, supplies)
- Machine maintenance tracking
- Multi-branch management
- Customer account registration
- Loyalty programs
- Advanced business analytics dashboards
- Real-time SMS integration (notification storage only may exist)

Future enhancements may address these in later phases.

---

## 5. Assumptions

1. The laundry shop operates as a single branch.
2. Owner and staff possess basic computer literacy.
3. Payment is typically collected upon pickup.
4. Internet connectivity is sufficient for system use.
5. Hardware for system operation is available.

---

## 6. Constraints

### 6.1 Technical Constraints

- Backend: Java 21, Spring Boot 3.3+
- Database: PostgreSQL 16
- Migration Tool: Flyway
- Frontend: Next.js 14+, TypeScript
- Infrastructure: Docker & Docker Compose
- Testing: Testcontainers
- CI/CD: GitHub Actions

### 6.2 Operational Constraints

- Limited personnel (owner and one staff)
- Manual fallback during transition
- Budget limitations typical of MSMEs

---

## 7. Success Criteria

The project shall be considered successful if:

- Order creation eliminates manual pricing errors
- Order tracking reduces mix-ups
- Daily income reporting is automated
- Payment validation prevents incorrect totals
- Staff can operate the system with minimal training
- All documented business rules are enforced server-side

---

## 8. Scope Governance

Any functionality not explicitly listed under **Section 3 – In-Scope** shall:

1. Be documented as an enhancement
2. Be reviewed and approved before implementation
3. Be developed in a separate branch
4. Be clearly marked as post-MVP

No undocumented feature additions shall be merged into the main development branch.

---

## 9. Conclusion

This document formally defines the system boundaries of the Faith Laundry Shop Management System. It ensures alignment with stakeholder needs, enforces development discipline, and establishes the authoritative reference for MVP functionality and scope control.
