# Feature Specification: UI/UX Refinement & Responsive Layout Enhancement

**Feature Branch**: `feature/014-ui-ux-responsiveness`

**Created**: 2026-08-10

**Status**: Draft

**Input**: User description: "improve the UI/UX and responsiveness. make sure it covers all pages from landing page to all portals"

## Clarifications

### Session 2026-08-10
- Q: How should data grids adapt on mobile screens (<768px) across all portals? → A: **Hybrid Card & Grid Reflow**: Data tables across all management portals automatically transform into stacked touch-optimized cards on mobile (<768px) and switch back to full multi-column data grids on desktop (≥768px).
- Q: What style of micro-animations and interactive feedback should be implemented across controls and cards? → A: **Tactile Spring & Scale Feedback**: Subtle active press scaling (`0.97x` / `active:scale-95`), smooth spring hover transitions on cards, and instant visual color shifts (`<50ms`) on quick-select chips.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Adaptive Mobile & Tablet Navigation & Responsive Layouts Across All Portals (Priority: P1)

As a laundry shop staff member or administrator using a mobile phone, tablet, or desktop, I want all public pages (`/`, `/track`), authentication views (`/login`), and management portals (`/overview`, `/orders`, `/orders/new`, `/orders/[id]`, `/orders/[id]/pay`, `/customers`, `/customers/[id]`, `/payments`, `/rates`, `/messaging`, `/audit-logs`, `/machines`, `/users`) to automatically adapt to screen sizes from 320px to 2560px+ without horizontal scrolling or clipping, so that I can operate the system efficiently on any device.

**Why this priority**: Staff and customers operate the system across different device types (mobile phones at counter/folding stations, tablets, laptops, and desktop monitors). Comprehensive responsiveness prevents UI breakage across the entire application surface.

**Independent Test**: Can be tested by resizing the browser viewport across mobile (375px), tablet (768px), and desktop (1280px+) breakpoints across all 16 page routes and verifying navigation, tables, dialogs, and forms adapt fluidly.

**Acceptance Scenarios**:

1. **Given** a staff member or customer on a mobile screen (<768px), **When** navigating any route (Landing, Track, Login, Overview, Orders, Customers, Rates, Messaging, Audit Logs, Machines, Users), **Then** the sidebar converts to a smooth drawer navigation, table columns reflow into touch-optimized cards, and action buttons meet minimum 44x44px tap targets.
2. **Given** a staff member viewing data tables on mobile, **When** switching screen orientation or device sizes, **Then** data grids reflow cleanly into card layouts without text truncation or overlay overlap.

---

### User Story 2 - Order Intake Wizard & Form Touch UX (Priority: P1)

As a laundry shop staff member creating new orders on `/orders/new`, I want touch-optimized form controls, auto-scrolling steps, larger quick-select chips, and instant price feedback, so that I can intake customer orders faster with fewer touch errors.

**Why this priority**: Order intake is the most frequent operational task. Improving step transitions, inputs, and touch targets directly reduces order intake time.

**Independent Test**: Can be tested independently on `/orders/new` by completing a 3-step order intake on mobile and verifying touch targets, step validations, and price calculation responsiveness.

**Acceptance Scenarios**:

1. **Given** a staff member filling Step 1-3 of order intake on touch screens, **When** tapping add-on chips or selecting services, **Then** visual selection feedback is immediate (<50ms) with tactile micro-animations and active indicators.
2. **Given** form validation errors or empty required fields, **When** attempting to proceed to the next step, **Then** clear inline context warnings appear near the input field with auto-focus and scroll.

---

### User Story 3 - Visual Hierarchy, Dark/Light Polish & Dashboard Micro-Animations (Priority: P2)

As a shop owner or manager, I want modern typography, smooth status transitions, subtle card elevations, dynamic skeleton loaders, and a polished aesthetic across all dashboard views, so that the application feels premium and state-of-the-art.

**Why this priority**: Elevates perceived quality, improves operational readability, and provides visual confirmation for background actions.

**Independent Test**: Can be tested on `/overview` and `/orders` by verifying loading skeleton transitions, card hover states, and status tag color coding.

**Acceptance Scenarios**:

1. **Given** a user loading dashboard stats or order pipelines, **When** data is fetching or updating, **Then** unified skeleton loaders smoothly morph into populated content without layout shift (CLS < 0.05).
2. **Given** status transitions (e.g. RECEIVED → WASHING → READY), **When** status changes or cards are pressed/hovered, **Then** Gestalt color indicators and tactile spring/scale micro-animations (0.97x active press) highlight the interactive element.

---

### Edge Cases

- How does the UI handle long customer names, high item quantities, or extreme price totals on small 320px screens? (Text must wrap cleanly with ellipsis on secondary labels).
- How do data tables display on ultra-narrow viewports across Audit Logs, Machines, Payments, and Users? (Convert to stacked card view with primary status badges).
- What happens if touch input triggers multiple rapid taps on submit buttons? (Buttons debounce and display inline loading spinners to prevent double submission).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide fully responsive layouts for screen widths ranging from 320px (mobile) to 2560px (4K displays) across all 16 application routes:
  - **Public Routes**: Landing (`/`), Customer Tracking (`/track`)
  - **Auth Routes**: Staff Login (`/login`)
  - **Dashboard Portals**: Operations Overview (`/overview`), Orders Management (`/orders`), Intake Wizard (`/orders/new`), Order Detail (`/orders/[id]`), Checkout Gate (`/orders/[id]/pay`), Customers Directory (`/customers`), Customer Detail (`/customers/[id]`), Payment Ledger (`/payments`), Service Rates & Catalog (`/rates`), Customer Messaging (`/messaging`), Audit Logs (`/audit-logs`), Machine Monitor (`/machines`), User Management (`/users`).
- **FR-002**: Mobile viewports (<768px) MUST render touch-friendly navigation controls with minimum 44x44px interactive tap targets.
- **FR-003**: Order Intake Wizard (`/orders/new`) MUST implement smooth step transitions, quick-selection chips with tactile active states, and real-time total summary cards accessible on mobile screens.
- **FR-004**: Data tables (`/orders`, `/customers`, `/payments`, `/rates`, `/audit-logs`, `/machines`, `/users`) MUST implement **Hybrid Card & Grid Reflow**, transforming multi-column tables into stacked touch-optimized card views on viewports below 768px.
- **FR-005**: System MUST provide unified typography, harmonious HSL color tokens, dark/light mode consistency, Tactile Spring & Scale Feedback (`0.97x` active press), and Zero Cumulative Layout Shift (CLS) during data loading across all routes.
- **FR-006**: All interactive buttons, inputs, and modal dialogs MUST display clear hover, focus-visible, and active feedback states adhering to accessibility standards (WCAG 2.1 AA).

### Key Entities *(include if feature involves data)*

- **UI Design System Tokens**: Spacing tokens, breakpoint variables (sm: 640px, md: 768px, lg: 1024px, xl: 1280px), color palette tokens, and elevation shadows.
- **Responsive Viewport State**: Active breakpoint detection state for dynamic UI layout selection (card vs table).

### Database Migrations
- **Flyway Target**: None required (Pure Frontend UI/UX & Responsive Layout Enhancement).
- **Schema Changes**: N/A.

### API Contracts
- **Endpoints Needed**: Existing `/api/v1/*` REST endpoints.
- **Security**: Preserves existing authentication and role permissions.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of pages and forms across all 16 routes render without horizontal page overflow or scrollbars on viewports from 320px to 1920px.
- **SC-002**: Mobile order intake completion time decreases by at least 25% due to touch-optimized controls and chips.
- **SC-003**: Cumulative Layout Shift (CLS) score remains under 0.05 during initial page load and data fetching across all dashboard routes.
- **SC-004**: 100% of interactive controls pass minimum touch target size checks (≥44px height and width on touch viewports).

## Assumptions

- No backend database schema changes are required for UI layout and responsiveness polish.
- Existing React components and Tailwind CSS utilities will be refined using established CSS tokens and responsive primitives.
- Mobile browsers (Safari iOS, Chrome Android) and desktop viewports are supported.
