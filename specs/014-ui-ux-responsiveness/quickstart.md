# Quickstart Guide: UI/UX Refinement & Responsive Layout Enhancement

**Feature**: [`specs/014-ui-ux-responsiveness`](../spec.md)
**Created**: 2026-08-10

## Verification Scenarios

### 1. Viewport Resizing & Responsive Reflow Check
- Run local dev server: `cd frontend && npm run dev`.
- Open Chrome DevTools (`F12`), toggle device toolbar (`Ctrl+Shift+M`).
- Test all 16 page routes:
  1. `/` (Landing Page)
  2. `/track` (Customer Tracker)
  3. `/login` (Staff Login)
  4. `/overview` (Operations Dashboard)
  5. `/orders` (Orders Grid)
  6. `/orders/new` (Order Intake Wizard)
  7. `/orders/[id]` (Order Details)
  8. `/orders/[id]/pay` (Checkout Modal)
  9. `/customers` (Customer Directory)
  10. `/customers/[id]` (Customer Profile)
  11. `/payments` (Payment Ledger)
  12. `/rates` (Service Rates Catalog)
  13. `/messaging` (Notifications Log)
  14. `/audit-logs` (Audit History)
  15. `/machines` (Equipment Monitor)
  16. `/users` (User Management)
- Verify zero horizontal overflow on 375px, 768px, 1280px, and 1920px viewports.

### 2. Frontend Vitest Test Suite Execution
```bash
cd frontend && npm test
```
Verify all 29+ test files pass without errors.
