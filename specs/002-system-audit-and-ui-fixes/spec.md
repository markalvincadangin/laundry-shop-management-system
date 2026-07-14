# Feature Specification: System Audit, UI Consistency, & Messaging "Coming Soon"

**Feature Branch**: `[002-system-audit-and-ui-fixes]`

**Created**: 2026-07-05

**Status**: Draft

**Input**: User description: "I want you make the UI consistent and be fixed everything. review the business rules, Make the messaging feature a coming soon feature. check, analyze and test the integrity of the system, the business rules correctness, the UI/UX, etc."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Graceful "Coming Soon" for Messaging (Priority: P1)

As a laundry shop staff member, I want to see the Messaging (Client Alerts) feature clearly marked as "Coming Soon" so that I know it is intentionally disabled for the MVP rather than broken.

**Why this priority**: Managing user expectations is critical for an MVP release. Dead links or errors confuse users.

**Independent Test**: Can be fully tested by clicking the "Messaging" navigation link and verifying a "Coming Soon" badge or modal appears instead of a broken page.

**Acceptance Scenarios**:

1. **Given** a user is logged in, **When** they view the sidebar/navigation, **Then** the Messaging link has a visual "Coming Soon" indicator.
2. **Given** a user clicks the Messaging link, **When** the action is triggered, **Then** they are presented with a friendly message explaining the feature is under development, and they are not redirected to an empty or broken page.

---

### User Story 2 - UI Consistency & UX Fixes (Priority: P1)

As an end-user (Staff or Admin), I want the application to look polished and consistent across all screens so that I can easily navigate and use the system without visual confusion.

**Why this priority**: A consistent UI builds trust and reduces training time for staff.

**Independent Test**: Can be fully tested by navigating through all primary screens and verifying that typography, spacing, colors, and button styles align with a single design system.

**Acceptance Scenarios**:

1. **Given** a user views a data table on the Orders page and the Customers page, **When** they compare them, **Then** the table headers, pagination, and action buttons look and behave identically.
2. **Given** a user submits a form, **When** validation fails, **Then** the error messages are displayed consistently across the entire application.

---

### User Story 3 - Business Rules Integrity Audit (Priority: P2)

As a product owner, I want the system's core business rules (pricing, order lifecycle, payments) to be strictly audited and tested so that I am confident the system enforces the correct behavior in production.

**Why this priority**: Incorrect pricing or broken order states lead to revenue loss and customer dissatisfaction.

**Independent Test**: Can be fully tested by running automated test suites that cover all documented Business Rules (BR-PR-*, BR-OL-*, BR-PAY-*).

**Acceptance Scenarios**:

1. **Given** an order exceeds 8kg, **When** the system calculates the price, **Then** an additional load is automatically charged.
2. **Given** an order is unpaid, **When** staff attempts to release it to the customer, **Then** the system blocks the release until payment is recorded.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST disable access to the Messaging feature and replace it with a "Coming Soon" UI state.
- **FR-002**: System MUST apply a unified design token system (colors, typography, spacing) to all UI components.
- **FR-003**: System MUST enforce Business Rule BR-PR-01 through BR-PR-05 (Pricing logic).
- **FR-004**: System MUST enforce Business Rule BR-OL-01 through BR-OL-06 (Order lifecycle).
- **FR-005**: System MUST enforce Business Rule BR-PAY-01 through BR-PAY-07 (Payments).

### Key Entities 

- **Order / Payment / Service Rates**: Core entities whose integrity will be audited and tested.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of the UI components share a single, unified styling approach with no "rogue" custom CSS elements breaking the design system.
- **SC-002**: The Messaging feature is completely inaccessible but visible as an upcoming addition, resulting in 0 error logs from attempted access.
- **SC-003**: Automated test coverage or systematic manual audits confirm 100% compliance with the MVP Business Rules Catalog.

## Assumptions

- We have a comprehensive test suite framework available (e.g., JUnit for backend, Vitest for frontend).
- The definition of "UI Consistency" aligns with modern, standard design practices (like Tailwind conventions or Shadcn UI if used).
