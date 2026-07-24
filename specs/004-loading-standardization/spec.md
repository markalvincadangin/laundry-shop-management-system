# Feature Specification: Feedback & Loading Standardization

**Feature Branch**: `[004-loading-standardization]`

**Created**: 2026-07-05

**Status**: Draft

**Input**: User description: "standardize all loading state to a consistent UI/UX accross the system. You reserch for it. also add the improvements, updates and standardization of the toasts, errors, fallback pages, etc."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Unified Loading States (Priority: P1)
As a user, I want to see consistent, non-disruptive loading indicators so that the application feels premium and responsive.

**Why this priority**: Inconsistent loading states (blocking modals vs inline spinners) break the Doherty Threshold and confuse users.

**Independent Test**: Navigate through the app and perform actions (e.g., saving orders). Verify that full-page blocking modals are strictly used for initial auth checks, while button actions and data fetches use inline, standardized SVG spinners.

**Acceptance Scenarios**:
1. **Given** a user clicks "Save", **When** the system processes, **Then** the button shows a compact premium spinner.
2. **Given** the app initializes, **When** auth is verified, **Then** a full-page modal blocks the screen.

---

### User Story 2 - Universal Error Handling & Fallbacks (Priority: P1)
As a user encountering a system error or a broken link, I want to see a polished, branded error page with clear recovery actions so that I am not left stranded.

**Why this priority**: Poor error handling reduces trust and increases support requests.

**Independent Test**: Trigger a critical system error or navigate to a non-existent URL and verify the global error boundary catches it with a premium fallback UI.

**Acceptance Scenarios**:
1. **Given** an unhandled runtime error occurs, **When** the app crashes, **Then** the `global-error` boundary catches it and displays a unified `ErrorState` component.

---

### User Story 3 - Standardized Toast Notifications (Priority: P2)
As a user performing CRUD operations, I want to see consistent, branded toast notifications confirming success or failure so that I have immediate feedback.

**Why this priority**: Consistent feedback is critical for data integrity assurance.

**Independent Test**: Create, update, or delete a record and verify the toast notification perfectly matches the established UI guidelines and uses centralized `UI_LABELS`.

**Acceptance Scenarios**:
1. **Given** an order is created, **When** it succeeds, **Then** a Sonner toast appears with the unified styling.

## Requirements *(mandatory)*

### Functional Requirements
- **FR-001**: System MUST provide a universal `Spinner` atom (extracting the dual-ring gradient SVG) and replace all `lucide-react` `Loader2` usages.
- **FR-002**: System MUST restrict full-page modal loading states exclusively to initial app boot/authentication. All other loads must be inline.
- **FR-003**: System MUST implement a `global-error.tsx` boundary using the existing high-fidelity `ErrorState` component to catch fatal layout crashes.
- **FR-004**: System MUST ensure all `toast.success` and `toast.error` calls use standardized messages from `UI_LABELS` rather than hardcoded strings.
- **FR-005**: System MUST standardize fallback pages (like `not-found.tsx`) to adhere strictly to the premium UI tokens (e.g., `MeshBackground`, `Card`).

## Success Criteria *(mandatory)*

### Measurable Outcomes
- **SC-001**: 0 instances of `Loader2` are used for loading states across the frontend.
- **SC-002**: 100% of toast notifications use `UI_LABELS` constants instead of hardcoded strings.
- **SC-003**: Fatal app crashes are intercepted by `global-error.tsx` rather than exposing React error overlays to the user.
- **SC-004**: Navigation between dashboard routes does not trigger a full-screen modal overlay.

## Assumptions
- We will strictly reserve full-page blocking loaders for Authentication initialization (AuthGuard) per best UX practices (Option A selected).
- The existing Sonner `<Toaster />` configuration in `layout.tsx` is sufficient and only the invocation logic/strings need standardization.
