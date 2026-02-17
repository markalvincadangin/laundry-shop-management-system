# Handover Checklist — Faith Laundry Shop Management System

> **Phase:** 14 — Production Deployment & Handover  
> **Purpose:** Guide for conducting the handover session with Owner and Staff

---

## Pre-Handover

- [ ] Production stack running: `docker compose -f docker/docker-compose.prod.yml up -d`
- [ ] Application accessible via local network IP or domain
- [ ] Owner and Staff accounts created (via seed or migration)
- [ ] User manual printed or available: [user-manual.md](user-manual.md)
- [ ] Backup script tested: `./scripts/backup-database.sh`

---

## Handover Session Agenda

### 1. Login and Roles (10 min)

- Demonstrate login with Owner and Staff accounts
- Explain role differences: Owner (reports, rates) vs Staff (orders, payments)
- Have each person log in from their device

### 2. Create Order (15 min)

- Walk through New Order flow: customer, weight, extra minutes, add-ons
- Show reference number generation
- Explain pricing: ₱120/8 kg, ₱1/extra minute

### 3. Status Updates (10 min)

- Update order through stages: Received → Washing → Drying → Folding → Ready for Pickup
- Explain release precondition (must be Ready for Pickup)
- Show status history/timeline

### 4. Payment Recording (10 min)

- Record payment for a completed order
- Select payment method (Cash, GCash, Bank Transfer)
- Confirm one payment per order rule

### 5. Reports — Owner Only (10 min)

- Daily, monthly, yearly reports
- Explain data source (paid orders only)

### 6. Customer Tracking (5 min)

- Show public Track Order page
- Enter reference number, view status

### 7. Backup and Support (5 min)

- Explain backup script and schedule
- Provide contact for technical support

---

## Sign-Off

- [ ] Owner and Staff can log in from their devices
- [ ] At least one order created and paid during session
- [ ] Client sign-off received

---

## Post-Handover

- [ ] Schedule first backup verification
- [ ] Document any custom configuration (e.g., receipt printer if added)
- [ ] Provide user manual PDF to client
