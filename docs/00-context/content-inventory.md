# Content Inventory & Audit: Faith Laundry Shop Management System

> [!NOTE]
> This document is the "Gold Standard" Content Inventory and Audit for the Faith Laundry Shop Management System. It maps the hierarchical Information Architecture (IA) to functional implementation and provides a qualitative UX assessment (Audit) for each content node.
> **Verified via Live System Audit (2026-05-08)**

## 1. Inventory Summary
| Metric | Value |
| :--- | :--- |
| **Total Pages/Views** | 16 |
| **HCI Standard** | NN/g Content Audit Framework |
| **Primary Owner** | Faith Laundry Admin / Staff |
| **Last Audit Date** | 2026-05-08 |

---

## 2. Global Content Inventory & Audit Table

| ID | Nav Label | Page Title | URL Path | Format | Key Content Elements | Refinement Action | Backend API | Audit Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **0.0** | **Home** | **Faith Laundry Shop** | `/` | Page | Hero H1, Order Tracking Bar, Location/Hours Strip, 3-Card Commitment Section (Status/Loads/Digital), ₱140 Pricing Card, Detailed Footer | **Keep** | N/A | Primary marketing entry point. Adheres to F-Pattern for scanning to highlight value prop. |
| **0.1** | Track Order | Track Order | `/track` | Page | Reference Search Bar, 6-Step Progress Stepper (Queued to Claimed), Live Status Badge, Order Stats (Weight/Loads), Dynamic Live Update Message Box | **Keep** | `GET /api/v1/orders/reference/{ref}` | Public order tracker. Provides instant feedback (Doherty Threshold) via status bars. |
| **0.2** | Staff Login | Staff Login | `/login` | Page | Split-screen Hero Layout, Username/Password fields (with icons & visibility toggle), "Log In" button, "Track Here" link | **Keep** | `POST /api/v1/auth/login` | Restricted access portal. Simple, centered layout reduces cognitive load for auth actions. |
| **1.0** | **Dashboard** | **System Overview** | `/overview` | Page | 4 KPI Cards (Active, Ready, New, Sales), "Orders Queue" Kanban Pipeline, Actionable Order Cards (Start Washing / Confirm Pickup), Global "+ New Intake" Button | **Keep** | `GET /api/v1/orders/stats` | Operational nerve center. Visualizes system status visibility (Nielsen H1) via live Kanban. |
| **1.1** | New Intake | Order Intake | `/orders/new` | Wizard | 4-Step Stepper (Client/Service/Extras/Review), Persistent "Order Preview" Ticket, Payment Method Selector (Cash/GCash/Bank), Thermal Receipt Modal (Claim Stub) w/ Barcode | **Keep** | `POST /api/v1/orders` | Primary transaction entry. Uses Miller's Law to chunk the 4-step wizard for high accuracy. |
| **1.2** | Orders | Order Registry | `/orders` | Page | 4 Registry KPIs, Multi-criteria Filters (Status/Payment/Date), Export PDF Button, Paginated Data Table w/ Status Badges | **Keep** | `GET /api/v1/orders` | Central database management. Standardized table patterns optimize for efficiency of use. |
| **1.3** | — | Order Details | `/orders/[id]` | Page | Horizontal Stepper, Vertical History Timeline, "Next Step" Sidebar, Price Summary Breakdown, Void Payment Modal | **Keep** | `GET /api/v1/orders/{id}` | Individual record inspection. Includes physical accountability via Claim Stubs and Receipts. |
| **1.4** | — | Record Payment | `/orders/[id]/pay` | Page | Order Summary Card, Payment Method Selector, Dynamic Trace ID Input (for Digital), "Settle Balance" Action | **Keep** | `POST /api/v1/payments` | Financial settlement point. Minimizes errors (Nielsen H5) via constrained payment inputs. |
| **1.5** | Customers | Customer Registry | `/customers` | Page | Customer Search (Name/Phone), Status Filter, "+ New Customer" Modal (First/Last/Contact fields), Table w/ Unique IDs, Triple Action Icons | **Keep** | `GET /api/v1/customers` | CRM directory. Centralizes customer data to enable personalized staff interactions. |
| **1.6** | — | Customer Profile | `/customers/[id]` | Page | Customer header (Name/Phone), Transaction summary cards, Historical orders table, Loyalty notes | **Keep** | `GET /api/v1/customers/{id}` | Historical data context. Displays transaction history to identify loyal customers. |
| **1.7** | Messaging | Client Alerts | `/messaging` | Page | 3 Communication KPIs (Logged/Rate/Failed), Search by Order/Message, Delivery Status Filter, Date Picker | **Keep** | `GET /api/v1/client-alerts` | Communication transparency. High visibility on delivery status to ensure reliable alerts. |
| **2.0** | **Reports** | **Business Reports** | `/reports` | Page | Total Sales/Paid Orders/Avg Sale KPIs, Weekly Performance Chart, Period Selector (D/M/Y), Detailed Sales History Table | **Keep** | `GET /api/v1/reports/sales/trend` | Administrative decision engine. High-fidelity forensic data for business strategy. |
| **2.1** | Payments | Payment Ledger | `/payments` | Page | 3 Financial KPIs (Revenue/Count/Load), Date-range Filters, Payment Verification Modal (Staff Attribution), Export PDF | **Keep** | `GET /api/v1/payments` | Financial reconciliation ledger. Provides oversight for cash flow and voided actions. |
| **2.2** | Rates | Service Rates | `/rates` | Page | Service Pricing Cards (Base/Weight/Overtime), "Add New Rate" Modal, Status Toggle (Active/Inactive) | **Keep** | `PATCH /api/v1/service-rates/{id}` | Configuration panel. Administrative control to update pricing without code changes. |
| **2.3** | Users | Staff Accounts | `/users` | Page | 3 Security KPIs (Staff/Admin/Active), Onboard Staff Modal, Edit Profile Modal, Role Badges, Deactivation Modal | **Keep** | `GET /api/v1/users` | Access control management. Essential for security governance and staff accountability. |
| **2.4** | Audit Log | Forensic Audit Log | `/audit-logs` | Page | 3 Forensic KPIs (Logs/Sys/Security), Global Search & Date Filters, Activity Details Modal (Previous/New State Comparison), Staff/System Attribution | **Keep** | `GET /api/v1/audit-logs` | Security & Forensic registry. Ensures full traceability of every system mutation. |

---

## 3. Persistent UI Components (Global Assets)
These elements are persistent across the dashboard environment.

| ID | Component Name | Content Type | Elements / Actions | Audit Note |
| :--- | :--- | :--- | :--- | :--- |
| **G-01** | Sidebar Navigation | Layout Shell | Operations Group, Management Group, Collapse toggle | High visual consistency and grouping by domain. |
| **G-02** | Topbar / Header | Layout Shell | Global Search, Notification Bell, User Profile Dropdown, Logout | Uses F-Pattern for high-frequency actions. |
| **G-03** | Feedback UI | Overlay | Success/Error Toasts, Confirmation Dialogs, Loading Spinners | Confirms user actions and prevents state confusion. |
| **G-04** | Form Elements | Component | Standardized Inputs, Selects, and Buttons (Premium Design) | Enforces FRONT-001 §2 style guide consistency. |

---

## 4. Maintenance & Governance Notes
1. **Hierarchical ID System**: `0.x` = Public, `1.x` = Staff/Operations, `2.x` = Admin/Management.
2. **Technical Alignment**: The `URL Path` column must remain synchronized with `frontend/src/app`.
3. **Audit Rule**: "Refinement Action" should be reviewed every major release (e.g., v1.0, v2.0) to ensure the content still serves the primary business goal.
