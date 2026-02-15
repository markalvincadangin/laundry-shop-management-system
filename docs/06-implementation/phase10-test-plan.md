# Phase 10 — Notifications: Test Plan

> **Phase:** 10 — Notifications (Post-MVP)  
> **Source:** implementation-plan.md Phase 10, US-10, BR-NOTIF-01

---

## 1) Phase 10 Test Strategy

### What SHOULD Be Tested

| Category | Scope | Rationale |
|----------|-------|-----------|
| **Notifications API** | list | GET path, response handling |
| **Notifications page** | Fetch, display, error | Staff view UI |
| **Nav** | Notifications link | Staff can access |
| **Backend** | NotificationController, OrderStatusService | BR-NOTIF-01 |

### What Should NOT Be Tested (Phase 10)

| Category | Reason |
|----------|--------|
| **SMS adapter** | Stub logs only |
| **E2E with real backend** | Use mocked APIs |

---

## 2) Test Matrix

| What is tested | File | Type | Why |
|----------------|------|------|-----|
| notificationsApi.list | notifications.test.ts | unit | GET path |
| NotificationsPage fetch | NotificationsPage.test.tsx | component | Load, display, error |
| Nav Notifications link | Nav.test.tsx | component | Staff sees link |
| NotificationController | NotificationControllerTest | backend | GET 200 |
| OrderStatusService BR-NOTIF-01 | OrderStatusServiceTest | backend | Notification on READY_FOR_PICKUP |

---

## 3) Definition of Done (Testing)

- [x] Notifications API module tested
- [x] Notifications page tested
- [x] Nav Notifications link tested
- [x] Backend NotificationController tested
- [x] Backend OrderStatusService BR-NOTIF-01 tested
- [x] Build passes
