# Release Notes — MVP v1.0

## Faith Laundry Shop Management System

**Release Date:** 2026-02-15  
**Version:** 1.0.0-MVP

---

## Features

### Order Management (US-01, US-02, US-03)
- Create laundry orders with automatic pricing (loads, extra minutes, add-ons)
- Unique tracking number generation (LDR-YYYYMMDD-XXXX)
- List orders with **pagination** and **filtering** (status, payment status, date range)
- View order details and status history
- Update order status: **Received** → **Washing** → **Drying** → **Folding** → **Ready for Pickup** → **Released** (release requires Ready for Pickup and payment recorded)

### Customer Management (US-05)
- Create and manage customers
- Link customers to orders

### Payment (US-06, US-07)
- Record payment for orders (one payment per order)
- Record **payment method** (Cash, GCash, Bank Transfer) for each payment
- List payments with **pagination** and **filtering** (order ID, date range)
- Payment amount must equal order grand total

### Public Tracking (US-04)
- Customers can track order status by tracking number (no login required)

### Reports (US-08, US-09)
- Daily sales report
- Monthly sales report
- Yearly sales report

### Authentication (US-11)
- Login/logout with JWT stored in HTTP-only cookie
- Role-based access (Admin, Staff)

### Notifications (US-10)
- Notification list for staff
- SMS adapter stubbed (logs instead of sending)

### Developer Experience
- Pagination for order and payment lists
- Filtering by date range and status
- Structured JSON logging in production
- Request/response logging in dev profile
- CI: test coverage, Checkstyle, ESLint
- Standalone `.exe` Windows installer & Docker Compose dev stack
- Deployment guide and release notes

---

## Known Limitations

- **SMS notifications:** Stubbed; logs message instead of sending
- **Test coverage:** JaCoCo threshold set to 45% baseline; target 80% as tests are added
- **Single service rate:** One active rate at a time

---

## Technical Stack

- **Backend:** Java 21, Spring Boot 3.5+, PostgreSQL 16, Flyway, JWT
- **Frontend:** Next.js 15+, React 19, TypeScript, Tailwind CSS
- **Infrastructure:** Standalone Windows Application (`.exe`) + Cloudflare Tunnel (`cloudflared`)

---

## Upgrade Notes

N/A (initial release)
