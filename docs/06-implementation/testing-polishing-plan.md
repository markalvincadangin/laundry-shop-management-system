# Module Testing, Fixing, and Polishing Plan
## Faith Laundry Shop Management System

> **Reference Documents:** 
> - `academic-docs-deliverables/10-functional-requirements-matrix.md`
> - `docs/06-implementation/implementation-status.md`
> 
> **Goal:** Ensure all implemented MVP modules are hardened, visually polished, deeply tested, and fully aligned with the academic deliverables before final production deployment.

---

## 1. Branching Strategy & Dependency Tracks

To keep the codebase stable while isolating module-specific polish, we will use a simplified **Git Flow** strategy. Work has been split into two tracks to allow for **simultaneous development** without Git merge conflicts or logic blocking.

### 🔴 Track A: Core Transaction Flow (Sequential)
*These modules share heavy logic dependencies (e.g., checkout relies on intake). They must be done sequentially by the same person/pair.*
1. **First:** `polish/orders-module` (Intake -> Pipeline -> Claim Stub)
2. **Second:** `polish/payments-module` (Checkout -> Payment Validation)

### 🔵 Track B: Independent Features (Simultaneous)
*These modules are highly independent. They can be worked on right now, simultaneously alongside Track A.*
- `polish/reports-module` (Charts, Aggregations, Print/Export layouts)
- `polish/customers-module` (Public tracking page, SMS alerts UI)
- `polish/admin-settings` (RBAC lockdown, Audit Logs, Settings)

**Workflow:** 
1. Checkout the branch from `develop`: `git checkout -b polish/<module-name>`
2. Execute the checklists below.
3. Verify with local CI (`npm run build`, `mvn verify`).
4. PR and merge into `develop`.

---

## 2. Module Task Checklists

### 2.1. Orders & Core Processing Module (Track A - Step 1)
*Covers Functional Requirements: 1, 2, 3, 5, 7, 9*
- **Git Branch:** `polish/orders-module`

**Testing & Fixing:**
- [x] Validate edge cases for price calculations (BR-PR-01 to BR-PR-04) especially with multiple add-ons.
  - Fixed: `TestDataBuilders.serviceRate()` corrected from ₱120 → ₱140 (BR-PR-01). All 17 pricing assertions updated.
- [x] Test strict status transitions (RECEIVED → WASHING → DRYING → FOLDING → READY).
  - Validated: `OrderStatusService.ALLOWED_TRANSITIONS` map is correct. Removed stale `PaymentStatus.PARTIAL` reference.
- [ ] Resolve any remaining Checkstyle warnings in `OrderService` and `OrderController`.
- [ ] Fix any layout shifts in the `IntakeWizard` during step transitions.

**Polishing:**
- [x] Enhance the visual pulsing alert for "Rush Orders" (Req #7) to ensure it is highly visible on the dashboard.
  - Fixed: `OrderCard` was comparing `serviceType === 'rush'` (lowercase). Corrected to `'WASH_DRY_FOLD_RUSH'` (backend enum). Rush Zap icon + blanket Wind icon now render correctly.
- [x] Optimize the thermal "Claim Stub" UI (Req #5) for exact 80mm/58mm printing width.
  - Fixed: Hardcoded `CASH` replaced with `order.paymentMethod`. Hardcoded toast strings moved to `UI_LABELS.modules.orders`.
- [ ] Improve the drag-and-drop or status update button UX on the active order pipeline.

### 2.2. Finance & Payments Module (Track A - Step 2)
*Covers Functional Requirements: 4*
- **Git Branch:** `polish/payments-module`

**Testing & Fixing:**
- [ ] Ensure payments exactly match the Grand Total (BR-PAY-02 to BR-PAY-05).
- [ ] Test that an order *cannot* be released to a customer if the payment status is not `PAID`.
- [ ] Handle potential UI state lag when checking out an order.
- [ ] Improve error handling when network fails during payment submission.

**Polishing:**
- [ ] Add smooth transitions to the Checkout Modal.
- [ ] Improve the visual design of the payment history data table (badges for CASH, GCASH, BANK).

### 2.3. Analytics & Reports Module (Track B)
*Covers Functional Requirements: 8*
- **Git Branch:** `polish/reports-module`

**Testing & Fixing:**
- [ ] Verify that `COALESCE(SUM(amount), 0)` holds up for days/months with zero sales.
- [ ] Check boundary conditions (start and end of the month) for exact data aggregation.
- [ ] Fix any rendering bugs in the `RevenueChart` when resizing the browser window.

**Polishing:**
- [ ] Add micro-animations to the charts on load.
- [ ] Improve the styling of the "Export" or "Print" buttons for the reports dashboard.
- [ ] Ensure exact alignment with the academic deliverable (showing total income and number of transactions clearly).

### 2.4. Customer & Notifications Module (Track B)
*Covers Functional Requirements: 3 (Tracking)*
- **Git Branch:** `polish/customers-module`

**Testing & Fixing:**
- [ ] Test public `/track` page lookup with invalid or non-existent Reference Numbers.
- [ ] Verify that client alert logs are created when an order enters `READY_FOR_PICKUP`.
- [ ] Ensure customer search input in the Intake Wizard has proper debouncing.

**Polishing:**
- [ ] Beautify the public Order Tracking UI to provide a premium, customer-facing experience.
- [ ] Polish the Client Alerts popover and notification history table.

### 2.5. Admin Security & System Settings (Track B)
*Covers Functional Requirements: 10*
- **Git Branch:** `polish/admin-settings`

**Testing & Fixing:**
- [ ] Write negative tests ensuring `STAFF` roles cannot access `DELETE /api/v1/orders/{id}` or `PATCH /api/v1/service-rates/{id}`.
- [ ] Ensure the UI hides "Delete" or "Edit Rates" buttons completely from Staff accounts.

**Polishing:**
- [ ] Standardize confirmation modals for destructive actions (e.g., deleting an order or changing base prices).
- [ ] Add visual indicators in the Audit Log to highlight administrative overrides.

---

## 3. QA and Final Certification

Once all `polish/*` branches are merged back into `develop`:

- [ ] **System Integration Testing (SIT):** Run through the complete Happy Path (Walk-in Customer -> Order -> Pay -> Release -> Report).
- [ ] **Review against FDD & ERD:** Cross-reference final codebase state with the Data Flow Diagram and ERD in `academic-docs-deliverables/`.
- [ ] **Release:** Merge `develop` into `main` and tag the release as `v1.0.0` for final submission.
