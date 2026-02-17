# Documentation Style Guide
## Faith Laundry Shop Management System

> **Client:** Faith Laundry Shop  
> **Prepared By:** HIMÓTECH  
> **Document ID:** STYLE-001  
> **Version:** 1.0  
> **Date:** 2026-02-13  
> **Purpose:** Enforce consistent documentation standards across all project documents  
> **Status:** Living Document

---

## Document Control
- **Document Type:** Style Guide
- **Related Documents:** [Stage 1 Inventory & Terminology](STAGE1_INVENTORY_AND_TERMINOLOGY.md), [README](README.md), all `/docs` files
- **Confidentiality:** Internal / Academic Use

---

## 1. Standard Header Template

All documents MUST use the following header structure:

```markdown
# [Document Title]
## [Subtitle / System Name]

> **Client:** Faith Laundry Shop  
> **Prepared By:** HIMÓTECH  
> **Document ID:** [PREFIX]-[NUMBER]  
> **Version:** [MAJOR].[MINOR]  
> **Date:** YYYY-MM-DD  
> **Purpose:** [Brief statement of what this document covers]  
> **Status:** [Baseline (MVP) | Living Document | Draft | Completed]

---

## Document Control
- **Document Type:** [Type]
- **Related Documents:** [Links to relevant docs]
- **Confidentiality:** Internal / Academic Use

---
```

**Required metadata fields:** Client, Prepared By, Document ID, Version, Date, Status  
**Optional:** Purpose, Source

---

## 2. Document Control Section Template

Every formal document MUST include a Document Control section immediately after the header block:

```markdown
## Document Control
- **Document Type:** [Case Study | Requirements | Scope Definition | etc.]
- **Related Documents:** [Document Name](path/to/doc.md), [Document Name](path/to/doc2.md)
- **Confidentiality:** Internal / Academic Use
```

**Rules:**
- Use relative paths for all links
- Link to specific sections with anchors when relevant: `[BR-PR-01](02-requirements/business-rules.md#br-pr-01-base-load-pricing)`
- For confidential/sensitive docs (e.g., credentials): use **INTERNAL ONLY**

---

## 3. Numbering Rules

### 3.1 Section Numbering
- **Major sections:** Use numeric prefixes: `## 1. Introduction`, `## 2. Requirements`
- **Subsections:** Use hierarchical numbering: `### 1.1 Background`, `### 1.2 Scope`
- **Non-sequential content:** Use descriptive headings: `## Epic 1: Order Intake & Management`

### 3.2 Requirement IDs
- **User Stories:** US-01, US-02, … US-99 (MVP); US-100+ (post-MVP)
- **Business Rules:** Category sub-prefix + number:
  - BR-PR-* (Pricing)
  - BR-OL-* (Order Lifecycle)
  - BR-PAY-* (Payment)
  - BR-REC-* (Records)
  - BR-NOTIF-* (Notifications)

### 3.3 Document ID Prefixes
| Prefix | Document Type | Example |
|--------|---------------|---------|
| CS | Case Study | CS-001 |
| INT | Interview Notes | INT-001 |
| SCOPE | Scope Definition | SCOPE-001 |
| PROC | Process Flow | PROC-001 |
| DATA | Data Design Notes | DATA-001 |
| ARCH | Architecture | ARCH-001 |
| IMPL | Implementation Plan | IMPL-001 |

---

## 4. Terminology Rules (Canonical)

All documents MUST use the following terminology consistently. Source: [STAGE1_INVENTORY_AND_TERMINOLOGY.md](STAGE1_INVENTORY_AND_TERMINOLOGY.md).

### 4.1 Core Business Terms
| Term | Canonical Wording | Definition |
|------|-------------------|------------|
| **Order** | Order | Laundry service transaction record with customer details, weight, pricing, status. Each has a unique reference number. |
| **Load** | Load | Unit of laundry service covering up to **8 kg**, costing **₱120** per load. |
| **Extra Minute** | Extra minute | Washing time **beyond 45 minutes per load**, charged at **₱1 per minute**. |
| **Reference Number** | Reference number | Unique identifier for each order, generated automatically. |
| **Grand Total** | Grand total | Final order amount: `base_amount + extra_minutes_amount + addons_total_amount`. |

### 4.2 Order Status
- **In documentation:** Use Title Case: Received, Washing, Drying, Folding, Ready for Pickup, Released, Cancelled
- **In code/API/database:** Use UPPER_SNAKE_CASE: `RECEIVED`, `WASHING`, `DRYING`, `FOLDING`, `READY_FOR_PICKUP`, `RELEASED`, `CANCELLED`
- **Complete set:** All 7 statuses must be documented where order lifecycle is described.

### 4.3 Payment Status
- **MVP:** Unpaid, Paid only
- **Post-MVP:** Partial (reserved in schema, not used in MVP logic)

### 4.4 Roles
- **Owner:** View reports, manage rates, oversee operations
- **Staff:** Create orders, update status, record payments (no access to reports)

### 4.5 Reporting
- Reports are computed **exclusively from recorded payment data**
- Only orders with `payment_status = PAID` are included
- Daily, Monthly, Yearly reports aggregate `payments.amount_paid` within the selected period

---

## 5. Cross-Reference Rules

### 5.1 Path Rules
- **MUST** use relative paths: `[Business Rules](business-rules.md)`, `[ERD](../04-data-design/erd.dbml)`
- **MUST NOT** use absolute paths or full URLs for internal docs

### 5.2 When to Cite
- Referencing another document's content
- Deriving requirements from source material
- Implementing a business rule or user story

### 5.3 Citation Format
```markdown
<!-- Inline -->
Per [BR-PR-01](02-requirements/business-rules.md#br-pr-01-base-load-pricing), one load costs ₱120.

<!-- Multiple -->
This satisfies US-01, US-02, and BR-PR-01.

<!-- User Story ↔ Business Rule traceability -->
**Related Business Rules:** [BR-OL-01](02-requirements/business-rules.md#br-ol-01-order-must-have-a-unique-reference-number), [BR-OL-02](02-requirements/business-rules.md#br-ol-02-initial-order-status)
**Supports User Stories:** [US-01](02-requirements/user-stories.md#us-01-record-laundry-order), [US-04](02-requirements/user-stories.md#us-04-track-laundry-order-by-reference-number)
```

### 5.4 Anchor Links
- Use full heading-derived anchors (lowercase, hyphens): `#br-pr-01-base-load-pricing`, `#us-01-record-laundry-order`
- Headings auto-generate anchors from text; links must match the full anchor
