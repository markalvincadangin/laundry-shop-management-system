# User Interface Design
## Faith Laundry Shop Management System

> **Client:** Faith Laundry Shop  
> **Prepared By:** HIMÓTECH  
> **Document ID:** UID-001  
> **Version:** 1.0  
> **Date:** 2026-05-10  
> **Purpose:** Present the user interface design decisions, visual language, and screen layouts  
> **Status:** Baseline

---

## Document Control
- **Document Type:** User Interface Design Specification
- **Related Documents:** FRONT-001 (Design Spec v3.3.1), Technology Stack (TS-001)
- **Confidentiality:** Internal / Academic Use

---

## 1. Design Philosophy

The user interface of the Faith Laundry Shop Management System was designed following established Human-Computer Interaction (HCI) principles to ensure usability, learnability, and visual clarity for non-technical shop staff. The design adopts a Command Center paradigm where the dashboard serves as the central operational hub, providing at-a-glance visibility into the entire laundry workflow.

Key HCI principles applied throughout the interface include Nielsen's Heuristics for visibility of system status, match between the system and the real world, and aesthetic-minimalist design. The interface uses an F-pattern visual hierarchy optimized for rapid scanning during peak shop hours.

## 2. Design System

### Color Palette

The visual identity of the system is anchored to a purpose-driven color palette. Each color is mapped to a specific semantic meaning to reduce cognitive load and support rapid decision-making.

| Token | Hex Value | Usage |
| --- | --- | --- |
| Brand Blue | #15489D | Primary actions, navigation, branding |
| Brand Cyan | #30A8D4 | Secondary actions, interactive highlights |
| Success Green | #047857 | Ready status, completed actions, positive KPIs |
| Warning Amber | #B45309 | Pending states, caution indicators |
| Error Rose | #BE123C | Error states, destructive actions |
| Neutral 50 | #F8FAFC | Page backgrounds |
| Neutral 900 | #0F172A | Primary text |

### Typography

The system uses a dual-font strategy for visual hierarchy. Display headings use a geometric sans-serif typeface for bold, attention-grabbing titles, while body text uses Inter for maximum legibility at small sizes. All text sizes follow an 8-point modular scale to maintain consistent vertical rhythm across screens.

### Visual Effects

The interface employs glassmorphism as a unifying design language. Glass panels use a combination of semi-transparent white backgrounds, backdrop blur filters, and subtle inner borders to create depth without visual clutter. This technique is applied consistently to cards, modals, and the sidebar navigation.

## 3. Screen Layouts

### Login Page

The Login Page serves as the staff authentication portal. It follows a vertically centered, single-column layout that minimizes visual distractions and directs focus entirely to the credential input fields. The design applies Nielsen's Aesthetic-Minimalist heuristic by removing all unnecessary elements. Error messages are displayed inline using a high-contrast rose alert banner with an icon for immediate visibility. A secondary call-to-action below the form links customers to the public order tracking page.

![Login Page](./ui/LOGIN.png)

### Public Landing Page

The Public Landing Page is the customer-facing entry point to the system. It features a full-width hero section with the business name, service description, and an integrated order tracking search bar. Below the hero, a location strip displays the shop address, operating hours, and contact information. A features section highlights the value propositions of the service, and a pricing card dynamically displays the current standard wash rate fetched from the backend API. The page concludes with a footer containing business location details and support contact information.

![Public Landing Page](./ui/LANDING.png)

### Order Tracking Page

The Order Tracking Page allows customers to look up the real-time status of their laundry order using a reference number. Upon entering a valid reference number, the page displays the current order status using a visual progress stepper, the service type, weight, pricing breakdown, and a timestamped status history. This page is publicly accessible and does not require authentication.

![Order Tracking Page](./ui/TRACK.png)

### Dashboard (Command Center)

The Dashboard is the primary operational interface for staff and administrators. It is composed of two main sections. The top section displays Key Performance Indicator (KPI) cards showing the count of active loads, orders ready for pickup, today's new orders, and today's revenue (visible only to administrators). These cards use color-coded variants to communicate status at a glance.

The bottom section features the Order Pipeline, a five-column Kanban-style board that visualizes all active orders organized by their lifecycle status: Received, In Progress, Ready for Pickup, Released, and Cancelled. Staff can advance orders through the pipeline using action buttons on each order card, triggering backend status transitions and audit log entries.

![Dashboard Overview](./ui/DASHBOARD.png)

### Order Intake Wizard

The Order Intake Wizard provides a guided, multi-step form for creating new laundry orders. The wizard is divided into sequential steps: customer selection or creation, service and weight input, optional add-ons, and a final review and confirmation step. Each step validates input before allowing progression to the next, preventing incomplete order submissions. The wizard dynamically calculates pricing based on the selected service rate, weight, and any add-ons.

![Order Intake Wizard](./ui/ORDER_INTAKE.png)

### Order Management List

The Order Management List displays all orders in a searchable, filterable, and paginated table. Each row shows the reference number, customer name, service type, total amount, current status, and payment status. Status badges use semantic color coding consistent with the design system. Staff can click on any order to view its full details, update its status, or process a payment.

![Order Management List](./ui/ORDERS.png)

### Customer Management

The Customer Management module provides a master list of all registered customers with their contact information and order history. Staff can search customers by name or contact number, view individual customer profiles, and edit customer details. The customer detail view displays the complete order history for that customer along with summary statistics.

![Customer Management](./ui/CUSTOMERS.png)

### Payment Management

The Payment Management module displays a complete ledger of all payment transactions. The table includes the order reference number, customer name, amount paid, payment method, the staff member who received the payment, and the payment date. A payment action modal allows staff to record payments for unpaid orders, capturing the payment method and optional remarks.

![Payment Management](./ui/PAYMENTS.png)

### Reports Module

The Reports Module provides automated sales reporting capabilities. It displays revenue charts, order volume trends, and service type breakdowns across configurable date ranges. The module supports daily and monthly aggregation views with exportable data. Revenue figures, order counts, and average order values are displayed as KPI summary cards above the chart area. This module is restricted to administrators only.

![Reports Module](./ui/REPORTS.png)

### Service Rates Configuration

The Service Rates Configuration screen allows administrators to manage the pricing structure of the laundry shop. Each service rate entry defines the service name, base price per load, weight limit per load, and extra time charge per minute. Administrators can add new service types, edit existing rates, and activate or deactivate services. Changes to service rates are logged in the audit trail for accountability.

![Service Rates Configuration](./ui/RATES.png)

### User Management

The User Management module allows administrators to manage staff accounts. The interface displays all system users with their usernames, full names, roles, and active status. Administrators can create new user accounts, edit existing user profiles, reset passwords, and deactivate accounts. Role-based access control is enforced at both the frontend and backend levels.

![User Management](./ui/USERS.png)

### Client Alerts (Messaging)

The Client Alerts module provides a log of all customer notifications generated by the system. Each alert entry shows the associated order reference, the notification channel, message content, creation timestamp, and delivery status. This module enables staff to monitor customer communication history and verify that status update notifications have been sent successfully.

![Client Alerts](./ui/MESSAGING.png)

### Audit Logs

The Audit Logs module provides a forensic trail of all system actions for accountability and compliance. The log displays the user who performed the action, the action type, the affected table and record, timestamps, and before-and-after data snapshots in JSON format. This module is restricted to administrators and supports filtering by action type, table name, and date range.

![Audit Logs](./ui/LOGS.png)

## 4. Responsive Design

The interface is fully responsive across desktop, tablet, and mobile viewports. On desktop screens, the layout uses a persistent sidebar navigation with a collapsible state. On tablet and mobile viewports, the sidebar transitions to a slide-out drawer accessible via a hamburger menu icon in the mobile top navigation bar. All data tables, forms, and card grids gracefully adapt their column counts and spacing to fit smaller screens without loss of functionality.

## 5. Accessibility Considerations

The system implements several accessibility features aligned with WCAG 2.1 Level AA guidelines. All interactive elements have visible focus indicators using consistent focus ring styles. Form inputs include descriptive labels and error messages. Color is never used as the sole indicator of status; text labels and icons always accompany color-coded badges. The interface maintains a minimum contrast ratio of 4.5:1 for all text content against its background.
