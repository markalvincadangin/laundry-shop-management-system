# Handover Checklist — Faith Laundry Shop Management System

> **Phase:** 14 — Production Deployment & Handover  
> **Purpose:** Guide for conducting the handover session with Admin and Staff

---

## Pre-Handover

- [ ] Standalone production stack running: PostgreSQL 16 service + `.exe` installer / Spring Boot server
- [ ] Application accessible via local counter browser (`http://localhost:8080`)
- [ ] Cloudflare Tunnel daemon (`cloudflared`) active for public customer tracking (`https://track.faithlaundry.com`)
- [ ] Admin and Staff accounts created (via seed or migration)
- [ ] User manual printed or available: [user-manual.md](user-manual.md)
- [ ] Backup script tested: `./scripts/backup-database.sh` or `backup-database.ps1`

---

## Handover Session Agenda

### 1. Login and Roles (10 min)

- Demonstrate login with Admin and Staff accounts
- Explain role differences: Admin (reports, rates) vs Staff (orders, payments)
- Have each person log in from their device

### 2. Create Order (15 min)

- Walk through New Order flow: customer, weight, extra minutes, add-ons
- Show tracking number generation (`tracking_number`)
- Explain pricing: ₱140/8 kg, ₱1/extra minute

### 3. Status Updates (10 min)

- Update order through stages: Received → Washing → Drying → Folding → Ready for Pickup
- Explain release precondition: order must be **Ready for Pickup** and **Paid** before it can be released
- Show status history/timeline

### 4. Payment Recording (10 min)

- Record payment for a completed order
- Select payment method (Cash, GCash, Bank Transfer)
- Confirm one payment per order rule

### 5. Reports — Admin Only (10 min)

- Daily, monthly, yearly reports
- Explain data source (paid orders only)

### 6. Customer Tracking (5 min)

- Show public Track Order page
- Enter tracking number, view status

### 7. Backup and Support (5 min)

- Explain backup script and schedule
- Provide contact for technical support

---

## Sign-Off

- [ ] Admin and Staff can log in from their devices
- [ ] At least one order created and paid during session
- [ ] Client sign-off received

---

## Post-Handover

- [ ] Schedule first backup verification
- [ ] Document any custom configuration (e.g., receipt printer if added)
- [ ] Provide user manual PDF to client
