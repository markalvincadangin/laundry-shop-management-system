# Feature Specification: frontend-ui-polish

**Feature Branch**: `007-frontend-ui-polish`

**Created**: 2026-07-05

**Status**: Draft

**Input**: User description: "Polish the entire frontend UI across all screens and components, per docs/05-tech-design/frontend-design-spec.md (FRONT-001) and frontend-structure.md (FRONT-002)..."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - System-wide Architecture Compliance (Priority: P1)

As a Developer, I want to ensure that all UI components strictly follow architectural layering so that the system remains scalable and decoupled.

**Why this priority**: Architectural integrity (Constitution Principle II) prevents circular dependencies and side-effects.
**Independent Test**: Can be fully tested by verifying that presentation components operate independently of routing logic.

**Acceptance Scenarios**:
1. **Given** any presentation component, **When** the code is compiled, **Then** there are zero dependencies originating from the routing layer.

---

### User Story 2 - Instant Interaction Feedback (Priority: P1)

As a Staff User, I want the system to respond to my actions instantly so that I am never wondering if my click registered.

**Why this priority**: Satisfies Constitution Principle IV (Doherty Threshold).
**Independent Test**: Can be fully tested by clicking any primary action and observing a loading state (spinner, skeleton, or disabled state) within 400ms.

**Acceptance Scenarios**:
1. **Given** any data-fetching view, **When** the page loads, **Then** a visible loading skeleton is displayed instead of a blank screen.
2. **Given** any form submission, **When** the user clicks submit, **Then** the button immediately shows a loading indicator and disables itself.

---

### User Story 3 - Per-Screen Visual Consistency (Priority: P2)

As a Staff User, I want all screens to look like they belong to the same application so that I do not have to relearn patterns.

**Why this priority**: Satisfies Jakob's Law and Gestalt Principles of Similarity.
**Independent Test**: Can be fully tested by navigating through all 11 screens and verifying visual consistency.

**Acceptance Scenarios**:
1. **Given** any screen, **When** a status badge is displayed, **Then** it uses identical padding, border radius, and typography as badges on other screens.

### Edge Cases

- What happens when a user clicks a submit button multiple times before the 400ms loading state renders? (Button should disable immediately).
- What happens when a loading skeleton must be displayed for an unknown amount of data? (Display a fixed number of rows/cards).
- What happens when the user views the Dashboard on a screen without enough horizontal space? (Allow horizontal scrolling with a custom scrollbar for the Kanban board area).
- What happens if a form submission fails entirely after the loading state is triggered? (Display a clear error toast notification via Sonner and restore the UI back to its interactive default state).
- What happens if multiple staff members concurrently interact with the board or advance orders rapidly? (Implement optimistic UI updates for instant responsiveness, reverting only if the server request fails).
- What happens if the dashboard is left open and inactive on a shared terminal? (Implement a visual inactivity overlay after 5 minutes of no interaction to obscure customer data).
- What happens if a staff member tries to navigate away with unsaved data in the Intake Wizard? (Show a browser-native "Discard unsaved changes?" warning dialog to prevent accidental data loss).

## Requirements *(mandatory)*

### Functional Requirements: Global Constraints
- **FR-001**: UI MUST satisfy Constitution Principle II: Component layer MUST NOT depend on the application routing layer.
- **FR-002**: UI MUST satisfy Constitution Principle IV: All async actions MUST trigger a visible loading state within 400ms (Doherty Threshold).
- **FR-003**: UI MUST strictly reuse existing visual design standards. No new colors, typography, or spacing values may be introduced without updating documentation.
- **FR-004**: UI MUST satisfy Gestalt Similarity: All status badges MUST use identical visual treatments across the entire system.

### Functional Requirements: Per-Screen Polish

#### 1. Home
- **FR-HOME-1**: Align 3-Card Commitment Section to the standard system grid (Gestalt Proximity).
- **FR-HOME-2**: Ensure Hero Call-to-Action is sufficiently large to acquire quickly (Fitts's Law).

#### 2. Track Order
- **FR-TRACK-1**: Progress Stepper must use a continuous horizontal line (Gestalt Continuity) to signal left-to-right progression.
- **FR-TRACK-2**: Implement instantaneous skeleton loading for the reference search to satisfy Doherty Threshold.

#### 3. Staff Login
- **FR-LOGIN-1**: Center the authentication card to reduce cognitive load (Miller's Law - minimal chunking).
- **FR-LOGIN-2**: Ensure input fields have highly visible focus states (WCAG POUR - Perceivable).

#### 4. Dashboard
- **FR-DASH-1**: Primary CTA "New Order" MUST be anchored in the top header to align with the dominant horizontal scanning pattern (F-Pattern Eye Scanning).
- **FR-DASH-2**: Workflow columns MUST use a contrasting background to visually enclose related orders (Gestalt Common Region).
- **FR-DASH-3**: Each order card MUST present exactly one contextual "Next Stage" button to minimize decision time (Hick's Law).

#### 5. New Intake
- **FR-INTAKE-1**: Organize the form into a 4-step wizard enclosed in distinct regions (Miller's Law and Gestalt Common Region).
- **FR-INTAKE-2**: Place input fields top-to-bottom in task order to guide the eye (Gestalt Continuity).
- **FR-INTAKE-3**: Disable the "Settle Balance" button until a payment method is selected (Shneiderman's Golden Rule 5: Error Prevention).

#### 6. Orders Registry
- **FR-REG-1**: Data rows must have a clickable target area that spans the entire row (Fitts's Law).
- **FR-REG-2**: Status badges MUST apply redundant signaling (Color + Icon + Text) to satisfy WCAG 1.4.1.

#### 7. Order Details
- **FR-DET-1**: Place "Next Step" actions in a high-visibility zone (F-Pattern).
- **FR-DET-2**: Utilize an undo notification window for any status reversion to permit easy reversal of actions (Shneiderman's Golden Rule 6).

#### 8. Record Payment
- **FR-PAY-1**: Constrain payment inputs using restricted choice controls rather than free-text (Nielsen H5: Error Prevention).
- **FR-PAY-2**: Confirm payment completion with a clear, terminal receipt state (Shneiderman's Golden Rule 4: Yield Closure).

#### 9. Customers
- **FR-CUST-1**: Ensure the "New Customer" action is sized adequately and placed within the primary horizontal sweep.
- **FR-CUST-2**: Customer search must provide predictive filtering after 2 characters (Jakob's Law: standard search expectations).

#### 10. Customer Profile
- **FR-PROF-1**: Display historical orders in a standard tabular format consistent with the Orders Registry (Jakob's Law).
- **FR-PROF-2**: Group transaction summary cards using standard spatial proximity rules (Gestalt Proximity).

#### 11. Messaging/Client Alerts
- **FR-MSG-1**: Delivery status performance indicators must share identical visual dimensions with Dashboard indicators (Gestalt Similarity).
- **FR-MSG-2**: Add visible loading placeholders when fetching communication logs (Doherty Threshold).

## Success Criteria *(mandatory)*

### Measurable Outcomes
- **SC-001**: 100% of presentation components are successfully isolated from routing logic.
- **SC-002**: 100% of interactive state changes trigger a loading indicator within 400ms.
- **SC-003**: All status badges are visually uniform across all screens without exceptions.
- **SC-004**: No new arbitrary or undocumented styling values are introduced during implementation.

## Assumptions

- We assume that standard existing icons are sufficient for all required visual cues without needing custom assets.
- We assume that the existing layout structure naturally supports the required F-pattern sweeps.

## Brainstorm Log

### Session 2026-07-05
- **Boundary Conditions:** Resolved UI constraints on small desktop viewports by mandating horizontal scrolling for the Kanban board rather than attempting to scale or collapse it.
- **Error Scenarios:** Clarified that a 500 server error during an async operation should gracefully restore the UI to its interactive state and display a toast notification (avoiding permanent loading locks).
- **Scale & Performance:** Addressed concurrent edits on the Kanban board by requiring optimistic UI updates, ensuring instant responsiveness while handling eventual consistency on failure.
- **Security & Privacy:** Mitigated shared-terminal exposure risks by introducing a 5-minute inactivity overlay to obscure customer data when staff step away from the desk.
- **User Experience:** Prevented accidental data loss during complex intake flows by requiring a browser-native "Discard unsaved changes?" dialog if the user navigates away prematurely.
