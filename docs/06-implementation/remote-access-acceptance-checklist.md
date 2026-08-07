# Operator Acceptance Checklist
## Faith Laundry Shop Management System — Remote Access Resilience

> **Version:** 1.0 | **Date:** 2026-08-07  
> **Purpose:** Verify that the full Standalone + Tunnel topology is operational before releasing to the shop.  
> **Use:** Run through this checklist after every new deployment to the shop Windows machine.

---

## Section 1: Pre-Start Conditions

- [ ] The shop Windows machine is powered on and connected to AC power (sleep/hibernation prevention is configured by the installer via `powercfg`).
- [ ] PostgreSQL is running as a Windows background service (check: Services → `postgresql-x64-16`).
- [ ] The `LaundryShopMS` Windows Service is running (check: Services → `LaundryShopMS`).
- [ ] Ngrok authtoken is configured on the machine (`ngrok config check`).
- [ ] The Ngrok static domain is configured and matches `UPSTREAM_API_URL` in the Vercel project settings.

---

## Section 2: Local System Health

- [ ] Open `http://localhost:8765` in a browser on the shop machine.
  - **Expected:** The Faith Laundry Shop login page loads.
- [ ] Log in as `admin`.
  - **Expected:** Redirected to the overview/dashboard.
- [ ] Create a test order.
  - **Expected:** Order appears in the pipeline. Tracking number `LDR-YYYYMMDD-XXXX` is generated.
- [ ] Advance the order through at least one status step.
  - **Expected:** Status badge updates correctly.

---

## Section 3: Tunnel Health

- [ ] Verify Ngrok is running: open `http://localhost:4040` on the shop machine (Ngrok web inspector).
  - **Expected:** Shows one active tunnel: `https://<your-static-domain>` → `http://localhost:8080`.
- [ ] Confirm the tunnel uses HTTPS (`https://`), not HTTP.
- [ ] Hit the health endpoint through the tunnel:

  ```sh
  curl https://\<your-static-domain\>/api/health
  ```

  - **Expected:** `{"status":"UP"}` or HTTP 200.

---

## Section 4: Remote Vercel State

- [ ] Open the Vercel public URL from a **separate device / network** (e.g., mobile data).
  - **Expected:** Application loads; availability banner shows online state.
- [ ] Perform public order tracking:
  1. Enter the tracking number created in Section 2.
  - **Expected:** Order status and timeline displayed. No PII (customer phone/name) exposed.

---

## Section 5: Authenticated Remote Access

- [ ] Log in remotely as `admin` through the Vercel URL.
  - **Expected:** Login succeeds. Dashboard renders.
- [ ] Log in remotely as a `staff` user.
  - **Expected:** Login succeeds. Admin-only routes (users, reports) are inaccessible.
- [ ] Verify browser cookies (DevTools → Application → Cookies):
  - `refreshToken`: `Secure = true`, `HttpOnly = true`, `SameSite = Lax`.
  - `XSRF-TOKEN`: present, JavaScript-readable, `SameSite = Lax`.
- [ ] Make a mutation (e.g., advance an order status).
  - **Expected:** Mutation succeeds. No CSRF error (403) occurs.
- [ ] Log out.
  - **Expected:** Redirected to login. Subsequent refresh attempt returns 401.

---

## Section 6: Outage & Recovery

- [ ] **Simulate outage** — stop the Ngrok tunnel or the `LaundryShopMS` Windows service.
  - **Expected within 8 seconds:** The Vercel frontend shows the offline screen. Write actions are disabled.
- [ ] **Verify local operations continue:**
  Open `http://localhost:8765` on the shop machine and complete an order action.
  - **Expected:** Local operations work normally despite the tunnel being down.
- [ ] **Restore the tunnel** — restart Ngrok / the Windows service.
  - **Expected within 15 seconds:** The Vercel frontend recovers and write actions are re-enabled.

---

## Section 7: Idempotency / Retry Safety

- [ ] **Simulate an interrupted mutation:**
  Use browser DevTools → Network → set to Offline while a mutation is in-flight, then restore.
  - **Expected:** The UI shows an "unconfirmed" toast (not a success or generic error).
- [ ] **Verify no duplicate was created:** Navigate to the affected list (e.g., Customers). Confirm the record appears at most once.
- [ ] **Retry with the same operation ID:**
  Re-submit the form without refreshing (operation ID is retained for the unconfirmed case).
  - **Expected:** Second submission returns the original result. No duplicate created.

---

## Section 8: Backup Verification

- [ ] Confirm the database backup job is scheduled (Windows Task Scheduler → `LaundryShopBackup` task exists).
- [ ] Verify the most recent backup file exists in the configured backup directory.
- [ ] *(Annual / pre-release)* Test a restore from the most recent backup on a separate database instance.

---

## Sign-Off

| Section | Result | Notes |
|---|---|---|
| 1 — Pre-Start Conditions | Pass / Fail | |
| 2 — Local System Health | Pass / Fail | |
| 3 — Tunnel Health | Pass / Fail | |
| 4 — Remote Vercel State | Pass / Fail | |
| 5 — Authenticated Remote Access | Pass / Fail | |
| 6 — Outage & Recovery | Pass / Fail | |
| 7 — Idempotency / Retry Safety | Pass / Fail | |
| 8 — Backup Verification | Pass / Fail | |

**Verified by:** ___________________________  
**Date:** _______________  
**Version deployed:** _______________
