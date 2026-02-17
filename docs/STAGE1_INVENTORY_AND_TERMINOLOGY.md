# Stage 1: Documentation Inventory & Canonical Terminology
## Faith Laundry Shop Management System

> **Client:** Faith Laundry Shop  
> **Prepared By:** Documentation Alignment Agent  
> **Document ID:** STAGE1-001  
> **Version:** 1.0  
> **Date:** 2026-02-13  
> **Purpose:** Documentation inventory and canonical terminology baseline  
> **Status:** Analysis Complete

---

## Document Control
- **Document Type:** Analysis Report
- **Related Documents:** All `/docs` files, Academic Baseline Documents (PC-001, SSR-001, CS-001, SA-001, RRM-001)
- **Confidentiality:** Internal / Academic Use

---

## A) Documentation Inventory

### Academic Baseline Documents (Authoritative Source)

| Path                                                  | Document ID | Document Type          | Purpose                                           | Alignment Status |
|-------------------------------------------------------|-------------|------------------------|---------------------------------------------------|------------------|
| `docs/Case Study (CS-001).docx`                       | CS-001      | Case Study             | Client background, business problems, pain points | ✅ Baseline       |
| `docs/System Service Request (SSR-001).docx`          | SSR-001     | System Service Request | Formal system request document                    | ✅ Baseline       |
| `docs/Project Charter (PC-001).docx`                  | PC-001      | Project Charter        | Project authorization and scope                   | ✅ Baseline       |
| `docs/Stakeholder Analysis (SA-001).docx`             | SA-001      | Stakeholder Analysis   | Stakeholder identification and analysis           | ✅ Baseline       |
| `docs/Roles & Responsibilities Matrix (RRM-001).docx` | RRM-001     | Roles Matrix           | Role definitions and responsibilities             | ✅ Baseline       |

**Note:** These .docx files are the authoritative baseline. Markdown documentation must align with these documents.

---

### Implementation Documentation (Markdown Files)

#### 00-context/ — Project Background

| Path                                  | Document ID | Document Type   | Purpose                                           | Alignment Risk                       |
|---------------------------------------|-------------|-----------------|---------------------------------------------------|--------------------------------------|
| `docs/00-context/case-study.md`       | CS-001      | Case Study      | Client background, business problems, pain points | **LOW** — Aligned with CS-001.docx   |
| `docs/00-context/client-interview.md` | INT-001     | Interview Notes | Raw interview notes and observations              | **LOW** — Source material for CS-001 |

#### 01-scope/ — Project Boundaries

| Path                             | Document ID | Document Type    | Purpose                                             | Alignment Risk                                                     |
|----------------------------------|-------------|------------------|-----------------------------------------------------|--------------------------------------------------------------------|
| `docs/01-scope/project-scope.md` | SCOPE-001   | Scope Definition | MVP vs post-MVP features, deliverables, constraints | **MEDIUM** — Minor terminology inconsistency (see Inconsistencies) |

#### 02-requirements/ — Functional Requirements

| Path                                     | Document ID | Document Type  | Purpose                                                       | Alignment Risk                                    |
|------------------------------------------|-------------|----------------|---------------------------------------------------------------|---------------------------------------------------|
| `docs/02-requirements/user-stories.md`   | US-CATALOG  | User Stories   | Functional behavior requirements (US-01 to US-11)             | **LOW** — Well-structured, references BR-*        |
| `docs/02-requirements/business-rules.md` | BR-CATALOG  | Business Rules | Enforceable business rules (BR-PR-*, BR-OL-*, BR-PAY-*, etc.) | **MEDIUM** — Missing CANCELLED status in BR-OL-03 |

#### 03-process/ — Business Process Flows

| Path                            | Document ID | Document Type | Purpose                                                | Alignment Risk                                     |
|---------------------------------|-------------|---------------|--------------------------------------------------------|----------------------------------------------------|
| `docs/03-process/to-be-flow.md` | PROC-001    | Process Flow  | Future-state process flows after system implementation | **MEDIUM** — Typo: "Receive" instead of "Received" |

#### 04-data-design/ — Database Schema

| Path                                | Document ID | Document Type     | Purpose                                   | Alignment Risk                           |
|-------------------------------------|-------------|-------------------|-------------------------------------------|------------------------------------------|
| `docs/04-data-design/erd.dbml`      | ERD-001     | Database Schema   | Database schema definition (DBML format)  | **LOW** — Source of truth for data model |
| `docs/04-data-design/data-notes.md` | DATA-001    | Data Design Notes | Additional notes on data design decisions | **LOW** — Aligned with ERD               |

#### 05-tech-design/ — Technical Design

| Path                                  | Document ID | Document Type     | Purpose                                         | Alignment Risk                                     |
|---------------------------------------|-------------|-------------------|-------------------------------------------------|----------------------------------------------------|
| `docs/05-tech-design/architecture.md` | ARCH-001    | Architecture      | System architecture, tech stack, layered design | **LOW** — Well-structured, references requirements |
| `docs/05-tech-design/openapi.yaml`    | API-001     | API Specification | API contract definitions (endpoints, schemas)   | **LOW** — Source of truth for API contracts        |

#### 06-implementation/ — Development Roadmap

| Path                                            | Document ID | Document Type       | Purpose                            | Alignment Risk                               |
|-------------------------------------------------|-------------|---------------------|------------------------------------|----------------------------------------------|
| `docs/06-implementation/implementation-plan.md` | IMPL-001    | Implementation Plan | Phase-by-phase development roadmap | **LOW** — References US-* and BR-* correctly |

#### Root-Level Guides

| Path                                  | Document ID | Document Type           | Purpose                                      | Alignment Risk                                   |
|---------------------------------------|-------------|-------------------------|----------------------------------------------|--------------------------------------------------|
| `docs/README.md`                      | INDEX-001   | Documentation Index     | Central guide to all project documentation   | **LOW** — Navigation guide, no content conflicts |
| `docs/STYLE_GUIDE.md`                 | STYLE-001   | Style Guide             | Documentation standards and formatting rules | **LOW** — Meta-document, defines standards       |
| `docs/GETTING_STARTED.md`             | GUIDE-001   | Developer Guide         | Step-by-step local setup instructions        | **LOW** — Implementation guide, no requirements  |
| `docs/development-credentials.md`     | CRED-001    | Development Credentials | Default development credentials              | **LOW** — Operational document                   |
| `docs/DOCUMENTATION_AUDIT_REPORT.md`  | AUDIT-001   | Audit Report            | Previous documentation audit findings        | **LOW** — Analysis document                      |
| `docs/STANDARDIZATION_SUMMARY.md`     | —           | Change Summary          | Previous standardization work summary        | **LOW** — Historical document                    |
| `docs/TRACEABILITY_UPDATE_SUMMARY.md` | TRACE-001   | Change Summary          | Cross-reference improvements summary         | **LOW** — Historical document                    |
| `docs/UNIFIED_DIFFS.md`               | DIFF-001    | Technical Documentation | Example diffs of traceability improvements   | **LOW** — Historical document                    |

---

## B) Canonical Terminology Table

### Core Business Terms

| Term                 | Canonical Definition                                                                                                                                          | Source Document(s)                 | Usage Context                                       |
|----------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------|-----------------------------------------------------|
| **Order**            | A laundry service transaction record containing customer details, weight, pricing computation, and status tracking. Each order has a unique reference number. | BR-OL-01, US-01, erd.dbml          | Used consistently across all documents              |
| **Load**             | A unit of laundry service covering up to **8 kg** of laundry items, costing **₱120** per load.                                                                | BR-PR-01, US-02, erd.dbml          | Consistently defined as 8 kg / ₱120                 |
| **Extra Minute**     | Washing time **beyond the included 45 minutes per load**, charged at **₱1 per recorded extra minute**. The base price includes up to 45 minutes per load.     | BR-PR-03, US-02, erd.dbml          | Consistently defined as beyond 45 min/load @ ₱1/min |
| **Reference Number** | A unique identifier assigned to each order for tracking purposes. Must be unique across all orders. Generated automatically by the system.                    | BR-OL-01, US-01, US-04, erd.dbml   | Consistently used for order tracking                |
| **Grand Total**      | The final computed amount for an order, calculated as: `base_amount + extra_minutes_amount + addons_total_amount`.                                            | erd.dbml, architecture.md, BR-PR-* | Consistently used for final order amount            |

---

### Order Status Values & Lifecycle

| Status               | Database/API Format | Documentation Format | Lifecycle Position | Notes                                                   |
|----------------------|---------------------|----------------------|--------------------|---------------------------------------------------------|
| **RECEIVED**         | `RECEIVED`          | "Received"           | Initial state      | Set automatically on order creation (BR-OL-02)          |
| **WASHING**          | `WASHING`           | "Washing"            | Processing         | After Received                                          |
| **DRYING**           | `DRYING`            | "Drying"             | Processing         | After Washing                                           |
| **FOLDING**          | `FOLDING`           | "Folding"            | Processing         | After Drying                                            |
| **READY_FOR_PICKUP** | `READY_FOR_PICKUP`  | "Ready for Pickup"   | Pre-release        | Required before release (BR-OL-05)                      |
| **RELEASED**         | `RELEASED`          | "Released"           | Terminal           | Final state after pickup                                |
| **CANCELLED**        | `CANCELLED`         | "Cancelled"          | Terminal           | Terminal state, can be set from any non-terminal status |

**Canonical Rule:**
- **In Code/API/Database:** Use `UPPER_SNAKE_CASE` (e.g., `READY_FOR_PICKUP`, `CANCELLED`)
- **In Documentation:** Use Title Case with spaces (e.g., "Ready for Pickup", "Cancelled")
- **Complete Set:** All 7 statuses must be documented in requirements (BR-OL-03)

---

### Payment Status

| Status      | Database/API Format | Documentation Format | MVP Usage  | Notes                                       |
|-------------|---------------------|----------------------|------------|---------------------------------------------|
| **UNPAID**  | `UNPAID`            | "Unpaid"             | ✅ MVP      | Initial state, default for new orders       |
| **PAID**    | `PAID`              | "Paid"               | ✅ MVP      | Set when full payment recorded (BR-PAY-04)  |
| **PARTIAL** | `PARTIAL`           | "Partial"            | ❌ Post-MVP | Reserved for future partial payment support |

**Canonical Rule:**
- MVP uses **UNPAID** and **PAID** only
- **PARTIAL** exists in schema but is not used in MVP business logic
- The payment amount must exactly match order grand total in MVP (BR-PAY-03)

---

### Roles

| Role      | Database/API Format | Documentation Format | Permissions                                    | Notes                   |
|-----------|---------------------|----------------------|------------------------------------------------|-------------------------|
| **Owner** | `OWNER`             | "Owner"              | View reports, manage rates, oversee operations | Can access all features |
| **Staff** | `STAFF`             | "Staff"              | Create orders, update status, record payments  | Cannot access reports   |

**Canonical Rule:**
- Two roles only: **Owner** and **Staff**
- Role-based access control is enforced in the backend (US-11)
- Owner has elevated permissions for reporting and rate management

---

### MVP Definition

**Canonical MVP Scope:**

**In Scope:**
- Order intake with automatic pricing computation (US-01, US-02)
- Order lifecycle tracking with status updates (US-03)
- Payment recording with full-payment-only validation (US-06)
- Order tracking by reference number (US-04)
- Daily sales reporting (US-08)
- Role-based access control (US-11)

**Out of Scope (Post-MVP):**
- Partial payment support
- Digital payment integrations (GCash, bank transfer)
- Inventory management
- Machine maintenance tracking
- Multi-branch management
- Customer account registration
- Loyalty programs
- Advanced analytics dashboards
- Real-time SMS integration (notification storage may exist)

**Source:** `docs/01-scope/project-scope.md` Section 3 (In-Scope) and Section 4 (Out-of-Scope)

---

### Reporting Rules

| Report Type        | Time Period  | Data Source    | Calculation Method                                                     | Notes                                 |
|--------------------|--------------|----------------|------------------------------------------------------------------------|---------------------------------------|
| **Daily Report**   | Single day   | Payments table | Sum of `amount_paid` where `payment_date` is within the selected day   | Only includes paid orders (BR-PAY-04) |
| **Monthly Report** | Single month | Payments table | Sum of `amount_paid` where `payment_date` is within the selected month | Only includes paid orders (BR-PAY-04) |
| **Yearly Report**  | Single year  | Payments table | Sum of `amount_paid` where `payment_date` is within the selected year  | Only includes paid orders (BR-PAY-04) |

**Canonical Rule:**
- Reports are computed **exclusively from recorded payment data** (BR-REC-01)
- Only orders with `payment_status = PAID` are included
- Unpaid or cancelled orders are excluded
- Reports aggregate `payments.amount_paid`, not `orders.grand_total` (to reflect actual revenue)

**Source:** US-08, US-09, BR-REC-01, BR-PAY-04, `docs/03-process/to-be-flow.md` Section 3.5

---

## C) Inconsistencies Found

### 1. Missing CANCELLED Status in Requirements

**Status:** ✅ **Resolved** (addressed in subsequent revisions)

**File:** `docs/02-requirements/business-rules.md`  
**Section:** BR-OL-03 – Allowed Order Status Values  
**Conflict:** Status list omits CANCELLED, which exists in `erd.dbml` and `openapi.yaml`  
**Impact:** Medium — Functional accuracy  
**Proposed Fix:** Add "Cancelled" to the status list in BR-OL-03

**Historical State (pre-fix):**
```markdown
### BR-OL-03 – Allowed Order Status Values
**Rule:** Order status must be one of the defined states:
- Received
- Washing
- Drying
- Folding
- Ready for Pickup
- Released
```

**Should Be:**
```markdown
### BR-OL-03 – Allowed Order Status Values
**Rule:** Order status must be one of the defined states:
- Received
- Washing
- Drying
- Folding
- Ready for Pickup
- Released
- Cancelled
```

---

### 2. Typo: "Receive" Instead of "Received"

**Status:** ✅ **Resolved** (addressed in subsequent revisions)

**File:** `docs/03-process/to-be-flow.md`  
**Section:** 3.1 Order Intake Process, Step 3  
**Conflict:** Uses "Receive" instead of "Received"  
**Impact:** Low — Terminology consistency  
**Proposed Fix:** Change "Receive" to "Received"

**Historical State (pre-fix):**
```markdown
* Sets order status to **Receive**
```

**Should Be:**
```markdown
* Sets order status to **Received**
```

---

### 3. Missing CANCELLED in Status Transition Documentation

**File:** `docs/02-requirements/business-rules.md`  
**Section:** BR-OL-04 – Status Transition Control  
**Conflict:** Transition rules mention CANCELLED but don't explicitly document all cancellation paths  
**Impact:** Low — Documentation completeness  
**Proposed Fix:** Ensure CANCELLED transitions are explicitly documented

**Current State:** Already includes:
```markdown
- Any non-terminal status → Cancelled (order cancellation)
- Cancelled → (terminal state, no further transitions)
```

**Status:** ✅ Already documented correctly

---

### 4. Missing Document Control Sections (Previously Identified)

**Files:**
- `docs/02-requirements/user-stories.md` — Missing Document Control section
- `docs/02-requirements/business-rules.md` — Missing Document Control section  
- `docs/05-tech-design/architecture.md` — Missing Document Control section

**Impact:** Low — Structural consistency  
**Status:** Already identified in `DOCUMENTATION_AUDIT_REPORT.md` Section 3.2  
**Note:** These will be addressed in Stage 2 (Structural Standardization)

---

## Summary

### Inventory Summary
- **Total Markdown Files:** 18
- **Academic Baseline Documents:** 5 (.docx files)
- **Alignment Risk Distribution:**
  - **LOW Risk:** 15 files
  - **MEDIUM Risk:** 3 files
  - **HIGH Risk:** 0 files

### Terminology Status
- **Consistent Terms:** Order, Load, Extra Minute, Reference Number, Grand Total, Payment Status, Roles, MVP Definition, Reporting Rules
- **Inconsistencies:** None (items 1 and 2 above were resolved in subsequent revisions)

### Next Steps
1. Address inconsistencies identified in Section C
2. Proceed to Stage 2: Structural Standardization
3. Ensure all documents reference canonical terminology from Section B

---

**Analysis Completed:** 2026-02-13  
**Analyst:** Documentation Alignment Agent

