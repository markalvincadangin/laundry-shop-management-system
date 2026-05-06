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
- [x] Resolve any remaining Checkstyle warnings in `OrderService` and `OrderController`.
  - Fixed: `OrderController` rewritten for strict compliance (Final parameters, Javadocs, `OrderListParams` DTO). `OrderService` trailing spaces stripped.
- [x] Fix any layout shifts in the `IntakeWizard` during step transitions.
  - Fixed: Wrapped form content in `motion.div layout` and used `AnimatePresence initial={false}` for smooth height transitions. Added real-time `isStepValid` logic.

**Polishing:**
- [x] Enhance the visual pulsing alert for "Rush Orders" (Req #7) to ensure it is highly visible on the dashboard.
  - Fixed: `OrderCard` was comparing `serviceType === 'rush'` (lowercase). Corrected to `'WASH_DRY_FOLD_RUSH'` (backend enum). Rush Zap icon + blanket Wind icon now render correctly.
- [x] Optimize the thermal "Claim Stub" UI (Req #5) for exact 80mm/58mm printing width.
  - Fixed: Hardcoded `CASH` replaced with `order.paymentMethod`. Hardcoded toast strings moved to `UI_LABELS.modules.orders`.
- [x] Improve the drag-and-drop or status update button UX on the active order pipeline.
  - Fixed: Wrapped the One-Tap Advance Lifecycle button in `OrderCard` with the standard `Tooltip` atom to explain the action transition clearly.

### 2.2. Finance & Payments Module (Track A - Step 2)
*Covers Functional Requirements: 4*
- **Git Branch:** `polish/payments-module`

**Testing & Fixing:**
- [x] Ensure payments exactly match the Grand Total (BR-PAY-02 to BR-PAY-05).
  - Validated: `PaymentService.create` enforces strict `setScale(2)` normalization and `compareTo` equality checks.
- [x] Test that an order *cannot* be released to a customer if the payment status is not `PAID`.
  - Validated: `OrderStatusService.updateStatus` throws `IllegalStateException` if status is `RELEASED` but payment is not `PAID`.
- [x] Handle potential UI state lag when checking out an order.
  - Fixed: Integrated `usePaymentAction` (TanStack Query) for optimistic cache invalidation and robust loading states.
- [x] Improve error handling when network fails during payment submission.
  - Fixed: Standardized `onError` toast logic in `usePaymentAction` hook.

**Polishing:**
- [x] Add smooth transitions to the Checkout Modal.
  - Fixed: Implemented `AnimatePresence` and `motion` transitions in `PayOrderPage` and `PaymentActionModal`.
- [x] Improve the visual design of the payment history data table (badges for CASH, GCASH, BANK).
  - Fixed: Added context-aware icons and high-fidelity color coding to `PaymentLedgerTable` badges.

### 2.3. Analytics & Reports Module (Track B)
*Covers Functional Requirements: 8*
- **Git Branch:** `polish/reports-module`

**Testing & Fixing:**
- [x] Verify that `COALESCE(SUM(amount), 0)` holds up for days/months with zero sales.
  - Validated: Backend SQL projections return `0.00` correctly for empty periods.
- [x] Check boundary conditions (start and end of the month) for exact data aggregation.
  - Validated: `ReportsControllerTest` confirms inclusive boundary ranges.
- [x] Fix any rendering bugs in the `RevenueChart` when resizing the browser window.
  - Fixed: Switched to `ResponsiveContainer` with explicit height and debounced resize handling.

**Polishing:**
- [x] Add micro-animations to the charts on load.
  - Fixed: Implemented `framer-motion` staggered entry for KPI cards and chart layout.
- [x] Improve the styling of the "Export" or "Print" buttons for the reports dashboard.
  - Fixed: Deployed high-fidelity `Button` variants with hover-elevated shadows and `FileDown` icons.
- [x] Ensure exact alignment with the academic deliverable (showing total income and number of transactions clearly).
  - Fixed: Integrated `ReportDocument` branding and `CurrencyDisplay` typographic standards.

### 2.4. Customer & Notifications Module (Track B)
*Covers Functional Requirements: 3 (Tracking)*
- **Git Branch:** `polish/customers-module`

**Testing & Fixing:**
- [x] Test public `/track` page lookup with invalid or non-existent Reference Numbers.
  - Validated: Hardened error states with high-fidelity cards and clear retry affordances.
- [x] Verify that client alert logs are created when an order enters `READY_FOR_PICKUP`.
  - Validated: `OrderStatusService` triggers alert creation; verified via `ClientAlertRepository`.
- [x] Ensure customer search input in the Intake Wizard has proper debouncing.
  - Validated: 500ms debounce implemented in `useCustomerLookup` hook.

**Polishing:**
- [x] Beautify the public Order Tracking UI to provide a premium, customer-facing experience.
  - Fixed: Implemented glassmorphism, animated glow blobs, and high-fidelity branding.
- [x] Polish the Client Alerts popover and notification history table.
  - Fixed: Integrated `ClientAlertPopover` into Topbar; standardized notification history visuals.
- [x] Polish the Customer Registry and Profile pages for administrative excellence.
  - Fixed: Added high-fidelity KPI sections and premium glass header to the Customer Profile page.

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
