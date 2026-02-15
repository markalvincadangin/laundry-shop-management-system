# Phase 12 — User Experience (UX) Polish & Visualization: Test Plan

> **Phase:** 12 — UX Polish & Visualization (Post-MVP)  
> **Source:** implementation-plan.md Phase 12, US-08, US-09

---

## 1) Phase 12 Test Strategy

### What SHOULD Be Tested

| Category | Scope | Rationale |
|----------|-------|-----------|
| **Toast notifications** | success/error on create/update/delete | DoD: All CUD actions show toast |
| **Skeleton loaders** | TableSkeleton, ChartSkeleton, CardSkeleton | DoD: No layout shift |
| **Empty states** | EmptyState in orders, notifications | DoD: Friendly "No data" graphic |
| **Dashboard charts** | Bar chart on Home, Reports | DoD: Sales visualization |
| **Status buttons** | min 44px touch targets | DoD: Mobile tappable |
| **Receipt print** | print-receipt class, @media print | DoD: Ctrl+P thermal layout |

### What Should NOT Be Tested (Phase 12)

| Category | Reason |
|----------|--------|
| **Lighthouse score** | Manual/CI audit |
| **Actual print output** | Browser/OS dependent |
| **recharts internals** | Library behavior |

---

## 2) Test Matrix

| What is tested | File | Type | Why |
|----------------|------|------|-----|
| TableSkeleton on Orders load | app/orders/page.test.tsx | component | Phase 12 skeleton |
| EmptyState when no orders | app/orders/page.test.tsx | component | Phase 12 empty state |
| toast.error on Orders API fail | app/orders/page.test.tsx | component | Phase 12 toast |
| ChartSkeleton on Home load | app/page.test.tsx | component | Phase 12 skeleton |
| Bar chart when data | app/page.test.tsx | component | Phase 12 chart |
| ChartSkeleton on Reports | app/reports/page.test.tsx | component | Phase 12 skeleton |
| Status buttons touch targets | app/orders/[id]/page.test.tsx | component | Phase 12 mobile |
| print-receipt element | app/orders/[id]/page.test.tsx | component | Phase 12 receipt |
| EmptyState component | EmptyState.test.tsx | unit | Phase 12 component |
| TableSkeleton component | TableSkeleton.test.tsx | unit | Phase 12 component |

---

## 3) Definition of Done (Testing)

- [x] Toast shown on CUD actions (create order, update status, record payment)
- [x] Skeleton loaders tested (Orders, Home, Reports)
- [x] EmptyState tested (Orders, Notifications)
- [x] Dashboard/Reports charts tested
- [x] Status buttons have min 44px touch targets
- [x] print-receipt element present on Order Detail
- [x] Build passes
