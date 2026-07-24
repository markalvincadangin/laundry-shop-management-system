# Quality Assurance: Comprehensive Test Plan
## Faith Laundry Shop Management System

**Document ID:** QA-TEST-PLAN  
**Scope:** Core system operations, business logic validation, security, offline-first standalone packaging, and cloud synchronization (Spec 011).

---

## Phase 1: Environment & Deployment

**Objective:** Verify the successful setup, execution, and packaging of the system across development and production environments.

### 1.1 Local Development (Hybrid Mode)
| Test ID | Description | Steps | Expected Result | Pass/Fail |
| :--- | :--- | :--- | :--- | :--- |
| **ENV-01** | Start Backend & DB | 1. Run `make up-backend`.<br>2. Wait for `docker ps` to show healthy containers. | Backend API responds with HTTP `200 OK` on `/api/v1/health`. | [ ] |
| **ENV-02** | Start Frontend | 1. Navigate to `frontend` directory.<br>2. Run `npm run dev`. | Next.js UI loads successfully on `http://localhost:3000`. | [ ] |

### 1.2 Windows Standalone Packaging (Production)
*Note: Execute on a Windows host using PowerShell.*
| Test ID | Description | Steps | Expected Result | Pass/Fail |
| :--- | :--- | :--- | :--- | :--- |
| **PKG-01** | Build Standalone Installer | 1. Run `.\scripts\build_standalone.ps1`. | `LaundryShopMS-Setup-1.0.0.exe` is generated in `backend\target\`. | [ ] |
| **PKG-02** | Install Application & Environment | 1. Execute `LaundryShopMS-Setup-1.0.0.exe` and follow the wizard. | PostgreSQL 16 silently installs, env vars set, `LaundryShopMS` service registers/starts, shortcuts created, browser opens. | [ ] |
| **PKG-03** | Post-Reboot Recovery | 1. Reboot the Windows host machine completely.<br>2. Launch the app. | `PostgreSQL-16` and `LaundryShopMS` services auto-start. App UI loads at `localhost:8080` without manual intervention. | [ ] |

### 1.3 Offline Server Initialization
| Test ID | Description | Steps | Expected Result | Pass/Fail |
| :--- | :--- | :--- | :--- | :--- |
| **SRV-01** | Embedded Tomcat Boot | 1. Launch `FaithLaundryMS` from Start Menu. | UI loads at `http://localhost:8080`. | [ ] |
| **SRV-02** | Local Area Network (LAN) | 1. Access `http://<server-ip>:8080` from a mobile phone on the same Wi-Fi. | UI loads perfectly on the remote device, proving 0.0.0.0 network binding. | [ ] |

---

## Phase 2: Core Domain & Business Logic

**Objective:** Verify pricing algorithms, state machines, business rules, reporting, and customer notifications derived from the Business Rules catalog (BR-CATALOG).

### 2.1 Order Lifecycle & Workflows
| Test ID | Description | Steps | Expected Result | Pass/Fail |
| :--- | :--- | :--- | :--- | :--- |
| **BIZ-01** | Order State Machine (Forward) | 1. Create order.<br>2. Update to `WASHING` -> `READY`. | Timestamps are recorded; invalid leaps (e.g. `RECEIVED` straight to `CLAIMED`) are rejected. | [ ] |
| **BIZ-02** | Claiming Validation | 1. Attempt to mark an *unpaid* order as `CLAIMED`. | Validation error prevents claiming until fully paid. | [ ] |
| **BIZ-03** | Invalid Reverse Transition | 1. Attempt an invalid reverse transition (e.g., `READY` → `WASHING`). | The system explicitly rejects reverse transitions that violate the physical workflow. | [ ] |
| **BIZ-04** | Cancel Mid-Process | 1. Cancel an order that's currently `WASHING`. | Order is cancelled AND the assigned machine is immediately freed for other uses. | [ ] |

### 2.2 Pricing Algorithms & Boundaries
| Test ID | Description | Steps | Expected Result | Pass/Fail |
| :--- | :--- | :--- | :--- | :--- |
| **DOM-01** | Base Load Pricing | 1. Create 5kg order. | Computes to **1 load** (₱140). | [ ] |
| **DOM-02** | Rate Immutability | 1. Admin increases Base Rate to ₱150.<br>2. View an old order and create a new order. | Old order remains locked at **₱140**. New order computes at **₱150**. | [ ] |
| **DOM-03** | Boundary: Exactly 8.0kg | 1. Create an order exactly at 8.0kg. | Computes strictly as **1 load**, confirming inclusive upper boundary. | [ ] |
| **DOM-04** | Boundary: Exact Thresholds | 1. Create order at 16.0kg.<br>2. Create order at 16.01kg. | 16.0kg = **2 loads**. 16.01kg = **3 loads**. | [ ] |
| **DOM-05** | Zero Extra Minutes | 1. Submit an order with exactly 0 extra minutes. | No phantom charge is added. | [ ] |
| **DOM-06** | Negative Inputs | 1. Submit negative weight (-5kg) or negative extra minutes. | Rejected at validation level; does not silently compute negative charges. | [ ] |
| **DOM-07** | Floating-Point Arithmetic | 1. Sum many small peso charges (e.g., 47 extra min × ₱1). | Currency arithmetic utilizes precise fixed-point/decimals without float rounding errors. | [ ] |

### 2.3 Machine Allocation & Inventory
| Test ID | Description | Steps | Expected Result | Pass/Fail |
| :--- | :--- | :--- | :--- | :--- |
| **MAC-01** | Hoarding Prevention | 1. Attempt to assign 2 washers to a 1-load order. | HTTP 400 error. Assigned machines cannot exceed `totalLoads`. | [ ] |
| **MAC-02** | Concurrent Allocation | 1. In two separate browser tabs, simultaneously mark Washer 1 as `IN_USE`. | Tab 2 receives HTTP 409 Conflict (Optimistic Locking). Prevents double booking. | [ ] |
| **MAC-03** | Status Conflict | 1. Attempt to assign a machine currently `WASHING` to a second new order. | HTTP 409 Conflict. Cannot assign a machine that is already actively in use. | [ ] |
| **MAC-04** | Max Inventory Limit | 1. Attempt to create the 51st active machine in the system. | HTTP 400 error. System strictly enforces maximum limit of 50 active machines (BR-MAC-04). | [ ] |
| **MAC-05** | Mid-Cycle Breakdown | 1. Mark a machine assigned to a `WASHING` order as broken.<br>2. Assign a new machine to the order. | Broken machine is flagged `MAINTENANCE`. Order swaps to new machine but remains in `WASHING` status seamlessly. | [ ] |
| **MAC-06** | UI Visibility Policy | 1. View machine grid when machines are `IN_USE` or `MAINTENANCE`. | Unavailable machines remain visible but are visually disabled/greyed out, never hidden. | [ ] |

### 2.4 Payment Processing & Revenue
| Test ID | Description | Steps | Expected Result | Pass/Fail |
| :--- | :--- | :--- | :--- | :--- |
| **PAY-01** | Partial & Full Payments | 1. Record 50% payment.<br>2. Record remaining 50%. | Order transitions to `PARTIAL`, then to `PAID`. | [ ] |
| **PAY-02** | Auto-Revenue Voiding | 1. Force a fully `PAID` order into `CANCELLED` status. | Payment record automatically transitions to `VOIDED`. Daily Sales Report excludes it. | [ ] |
| **PAY-03** | Overpayment Handling | 1. Attempt to pay ₱500 on a ₱140 balance. | UI rejects the input or automatically calculates change due. | [ ] |

### 2.5 Reporting & Analytics
| Test ID | Description | Steps | Expected Result | Pass/Fail |
| :--- | :--- | :--- | :--- | :--- |
| **REP-01** | Daily Sales Generation | 1. Record 3 exact payments today.<br>2. Generate Daily Sales Report. | Sum precisely matches the 3 payments. Validates automated income tracking logic. | [ ] |
| **REP-02** | Period Comparison | 1. Generate an Income Report for Month A.<br>2. Generate for Month B and compare. | Accurately aggregates revenue; UI correctly contrasts the two periods without data bleed. | [ ] |
| **REP-03** | Exclude Voided Revenue | 1. Void a payment.<br>2. Regenerate Daily/Monthly Report. | Voided payment is strictly excluded from Total Revenue sums. | [ ] |
| **REP-04** | Receipt Data Integrity | 1. Print/Generate a receipt for an order. | Receipt strictly contains: Name, Contact, Date, Amount, Shop Name, and Authorized Signature. | [ ] |

### 2.6 Notifications & Tracking
| Test ID | Description | Steps | Expected Result | Pass/Fail |
| :--- | :--- | :--- | :--- | :--- |
| **NOT-01** | SMS Dispatch & Fallback | 1. Update order status to `READY`.<br>2. Simulate offline SMS Gateway. | On success: SMS dispatches. On failure: System queues retry or alerts staff that SMS failed. | [ ] |
| **NOT-02** | Public Tracking Data | 1. Access `/api/v1/tracking/{ref}` without authentication. | Returns order status/details but strictly omits PII (full name, phone number, address). | [ ] |
| **NOT-03** | Invalid Tracking Lookup | 1. Query tracking API with an invalid or fake reference number. | HTTP 404 Not Found. No data or partial matches leaked. | [ ] |

---

## Phase 3: System Reliability & Data Integrity (ACID)

**Objective:** Guarantee strict data consistency during network failures, high concurrency, and power outages.

### 3.1 Database Persistence & Atomicity
| Test ID | Description | Steps | Expected Result | Pass/Fail |
| :--- | :--- | :--- | :--- | :--- |
| **DB-01** | Migration Idempotency | 1. Run Flyway migrations twice against the same fresh database. | Success on second run (checksum validation passes, no half-applied broken scripts). | [ ] |
| **DB-02** | FK Integrity (Deletes) | 1. Attempt to delete a customer that has existing orders. | Database restricts deletion (HTTP 409) to preserve historical financial records. No silent orphaning. | [ ] |
| **DB-03** | DB Constraint Bypass | 1. Attempt to insert a NULL into a required column directly via raw SQL client. | Database level constraints catch the error, proving defense in depth beyond the app layer. | [ ] |
| **DB-04** | Concurrent Transactions | 1. Two concurrent requests attempt to record a payment on the same order via separate DB connections. | True concurrent transaction isolation at the database level handles the race condition (via locking). | [ ] |
| **DB-05** | Atomicity (Transaction Rollback) | 1. Force a failure during Outbox event creation on Order creation. | No partial order data is saved to the database. Complete rollback. | [ ] |

### 3.2 Data Sync & Outbox Machinery (Offline-First Specific)
| Test ID | Description | Steps | Expected Result | Pass/Fail |
| :--- | :--- | :--- | :--- | :--- |
| **SYNC-01** | Outbox Atomicity | 1. Force primary order save to succeed but the Outbox insert to fail. | Verifies same-transaction atomicity: entire transaction rolls back. | [ ] |
| **SYNC-02** | Exponential Backoff | 1. Verify retry backoff timing matches spec exactly (5s, 10s, 15s...). | Logs prove actual exponential delay behavior. | [ ] |
| **SYNC-03** | Retry Exhaustion | 1. Force 5 consecutive failures on one event. | Status lands on `FAILED` and stops retrying permanently. | [ ] |
| **SYNC-04** | Poison Pill Immunity | 1. One event is stuck `FAILED`; new events keep arriving. | The failed event does NOT block subsequent `PENDING` events from syncing. | [ ] |
| **SYNC-05** | Network Drop Idempotency | 1. Network drops *after* cloud API processes payload but *before* local gets success response. Local retries. | Cloud API's UPSERT is genuinely idempotent (no duplicate increments or audit entries). | [ ] |
| **SYNC-06** | Out-of-Order Sync | 1. Send status update before the create event due to retry timing. | Cloud side does not crash or corrupt state on race condition. | [ ] |
| **SYNC-07** | HMAC Tampering | 1. Tamper with payload's HMAC signature before it reaches cloud API. | Strictly rejected by cloud (Primary defense against arbitrary write access). | [ ] |
| **SYNC-08** | Expired JWT | 1. Send a sync payload with an expired JWT. | Payload is rejected, not silently accepted. | [ ] |
| **SYNC-09** | Cloud Conflict Overwrite | 1. Manually change field in cloud DB, then let stale local sync fire for same record. | Local data clobbers cloud change unconditionally (Local Wins logic). | [ ] |
| **SYNC-10** | Dual Sync Conflict | 1. Two devices sync same aggregate ID (e.g. backup restore). | Confirm behavior matches spec. *Note: Fragile "cloud never wins" invariant must be carefully verified to prevent silent overwrite of newer cloud data.* | [ ] |

### 3.3 Network & Crash Recovery
| Test ID | Description | Steps | Expected Result | Pass/Fail |
| :--- | :--- | :--- | :--- | :--- |
| **SYS-01** | DB Durability (Hard Crash) | 1. Create a customer. Instantly run `docker kill laundry-postgres`. | Data survives perfectly upon restart due to PostgreSQL Write-Ahead Logging (WAL). | [ ] |
| **SYS-02** | Outbox Mid-Write Crash | 1. Kill machine mid-write during active Outbox insert. | Outbox and primary record remain perfectly in sync after crash recovery. | [ ] |
| **SYS-03** | Graceful Degradation | 1. Stop backend server. Attempt to save an order. | UI shows a graceful "Network Error" toast instead of a fatal white screen. | [ ] |

---

## Phase 4: Security Operations & Threat Mitigation

**Objective:** Ensure strict Role-Based Access Control and resilience against malicious behavior.

### 4.1 Authentication & Access Control
| Test ID | Description | Steps | Expected Result | Pass/Fail |
| :--- | :--- | :--- | :--- | :--- |
| **SEC-01** | Admin vs Staff UI Limits | 1. Log in as `staff`. Navigate to `/settings`. | Access is strictly denied (HTTP 403 Forbidden) and redirected. | [ ] |
| **SEC-02** | Admin API Bypass | 1. Call admin-only API via `curl` with a staff JWT, bypassing UI. | Backend independently enforces role checks (HTTP 403 Forbidden). | [ ] |
| **SEC-03** | BCrypt Verification | 1. Inspect local Postgres `users` table directly. | Passwords are strictly stored as BCrypt hashes, not plaintext. | [ ] |
| **SEC-04** | SPA Path Traversal | 1. Request path like `/../../etc/passwd` through SPA fallback filter. | SpaRedirectFilter strictly scopes requests; path traversal blocked. | [ ] |
| **SEC-05** | Network Binding Integrity | 1. Confirm `server.address` configuration value (e.g. `0.0.0.0`). | Validates that binding to `0.0.0.0` securely supports LAN (SRV-02) while maintaining auth constraints. | [ ] |
| **SEC-06** | Actuator Scope Checks | 1. Check `/actuator/env`, `/actuator/beans` vs `/actuator/health`. | Sensitive endpoints (`/env`, `/beans`) are strictly Admin-only. Monitoring (`/health`) remains public to support uptime tooling. | [ ] |
| **SEC-07** | Malformed JWT Token | 1. Delete characters from the `jwt` browser cookie and refresh. | Backend rejects token. Frontend kicks user back to `/login`. | [ ] |

### 4.2 Threat & Abuse Protection
| Test ID | Description | Steps | Expected Result | Pass/Fail |
| :--- | :--- | :--- | :--- | :--- |
| **THR-01** | API Rate Limiting | 1. Bombard `/api/v1/auth/login` with 1,000 req/sec via Apache Bench. | Server gracefully returns `429 Too Many Requests`, avoiding a crash. | [ ] |
| **THR-02** | OOM Prevention | 1. Send 50MB JSON payload to Create Order endpoint. | Tomcat instantly returns `413 Payload Too Large` without parsing it. | [ ] |
| **THR-03** | Injection (SQLi/XSS) | 1. Enter `' OR 1=1 --` in search, and `<script>alert(1)</script>` as a name. | JPA Parameter binding safely queries text. React escapes the script tags visually. | [ ] |
