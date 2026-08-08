# Remote Access Resilience Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the Vercel frontend safely available when the laptop server is down and make every remote business mutation recoverable without duplicate writes.

**Architecture:** Vercel hosts the frontend and reverse-proxies browser `/api/*` requests to a fixed Ngrok HTTPS endpoint. The Windows standalone package continues to serve a static frontend and Spring Boot API from the laptop at `:8765`; both production modes use the relative `/api` base. An availability provider controls offline UI, while a durable backend idempotency layer resolves interrupted business writes.

**Tech Stack:** Next.js 15.5, React 19, TypeScript, Vitest, Playwright, Spring Boot 3.5, Spring Security, Spring AOP, JPA/Hibernate, Flyway, PostgreSQL, Docker Compose, Inno Setup, Vercel, Ngrok.

## Global Constraints

- The laptop PostgreSQL database is the only source of truth; do not implement client-side offline write queuing.
- The Ngrok endpoint is a fixed HTTPS domain configured as a Windows service and forwards only to `127.0.0.1:8765`.
- Vercel production is the browser-facing frontend. Preview deployments must not connect to the production laptop.
- Browser production API base is exactly `/api`; `UPSTREAM_API_URL` is Vercel-only configuration and never a `NEXT_PUBLIC_*` variable.
- `/api/**` responses must explicitly opt out of CDN and browser caching.
- Every non-auth business mutation requires a UUID `Idempotency-Key`; same key plus different request data returns HTTP 409.
- Never declare an unconfirmed operation successful or automatically issue a new business mutation after an outage.
- Preserve JWT/RBAC, CSRF protection for refresh/logout, HttpOnly refresh cookies, and exact-origin CORS.

---

### Task 1: Establish the dual-build and environment contract

**Files:**
- Modify: `frontend/next.config.mjs`
- Modify: `frontend/src/lib/api-client.ts`
- Modify: `scripts/build-installer.ps1`
- Modify: `scripts/build-installer.sh`
- Modify: `scripts/installer.iss`
- Modify: `.env.example`
- Modify: `frontend/.env.local.example`
- Create: `frontend/.env.standalone.example`
- Modify: `backend/src/main/resources/application.yml`
- Modify: `backend/src/main/resources/application-prod.yml`
- Test: `frontend/src/tests/lib/api-client.test.ts`

**Interfaces:**
- Consumes: `NEXT_DEPLOYMENT_TARGET` (`development`, `standalone`, or `vercel`), `NEXT_PUBLIC_API_URL`, and Vercel-only `UPSTREAM_API_URL`.
- Produces: a standalone static `out/` build that calls `/api`, and a Vercel build whose `/api/:path*` rewrite forwards to `${UPSTREAM_API_URL}/api/:path*`.

- [ ] **Step 1: Write failing frontend configuration tests**

Create tests that import the URL-resolution helper and assert:

```ts
expect(resolveApiBaseUrl({ nodeEnv: "production", apiUrl: "/api" })).toBe("/api");
expect(resolveApiBaseUrl({ nodeEnv: "development", apiUrl: "http://localhost:8080/api" }))
  .toBe("http://localhost:8080/api");
```

Add a build-inspection test/script that fails if installer output contains `http://localhost:8080/api` and passes only when it contains the relative `/api` base.

- [ ] **Step 2: Run the new test to verify it fails**

Run: `cd frontend && npm run test -- src/tests/lib/api-client.test.ts`

Expected: FAIL because `resolveApiBaseUrl` and the standalone build contract do not yet exist.

- [ ] **Step 3: Implement the build modes**

Make `next.config.mjs` conditional:

```js
const target = process.env.NEXT_DEPLOYMENT_TARGET ?? "development";
const nextConfig = {
  ...(target === "standalone" ? { output: "export" } : {}),
  images: { unoptimized: true, dangerouslyAllowSVG: false,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;" },
};

if (target === "vercel") {
  if (!process.env.UPSTREAM_API_URL?.startsWith("https://")) throw new Error("UPSTREAM_API_URL must be HTTPS");
  nextConfig.rewrites = async () => [{ source: "/api/:path*", destination: `${process.env.UPSTREAM_API_URL}/api/:path*` }];
}
```

Refactor `api-client.ts` so production accepts relative `/api` and development keeps the explicit local URL. Do not use browser `localhost` fallback in production.

Invoke installer frontend builds with `NEXT_DEPLOYMENT_TARGET=standalone` and `NEXT_PUBLIC_API_URL=/api`, so they do not read a developer's ignored `frontend/.env.local`. Change the installer-generated Spring property to `app.security.allowed-origin`, remove `allowed-origin-patterns`, and set `server.address=127.0.0.1`.

Keep `cookie-secure: true` and use `cookie-same-site: Lax` for production because the Vercel proxy makes browser requests same-origin. Keep local development cookie settings in the non-production profile.

- [ ] **Step 4: Normalize templates**

Make root `.env.example` backend-only. Retain database, Spring, JWT, SMS, and `ALLOWED_ORIGIN`; remove `NEXT_PUBLIC_API_URL`, `ALLOWED_ORIGIN_PATTERNS`, Render-specific tunnel guidance, and stale Cloudflare notes. Set `frontend/.env.local.example` to the local-dev URL only. Add `frontend/.env.standalone.example` containing only:

```dotenv
NEXT_DEPLOYMENT_TARGET=standalone
NEXT_PUBLIC_API_URL=/api
```

Document Vercel dashboard values in deployment documentation instead of committing a production `.env` file:

```dotenv
NEXT_DEPLOYMENT_TARGET=vercel
NEXT_PUBLIC_API_URL=/api
UPSTREAM_API_URL=https://<reserved-ngrok-domain>
```

- [ ] **Step 5: Verify both builds**

Run:

```bash
cd frontend && npm run typecheck && npm run test -- src/tests/lib/api-client.test.ts
NEXT_DEPLOYMENT_TARGET=standalone NEXT_PUBLIC_API_URL=/api npm run build
rg -F 'http://localhost:8080/api' out && exit 1 || true
NEXT_DEPLOYMENT_TARGET=vercel NEXT_PUBLIC_API_URL=/api UPSTREAM_API_URL=https://example.ngrok.app npm run build
```

Expected: both builds succeed; the standalone output has no local development API URL.

- [ ] **Step 6: Commit**

```bash
git add frontend/next.config.mjs frontend/src/lib/api-client.ts frontend/src/tests/lib/api-client.test.ts \
  scripts/build-installer.ps1 scripts/build-installer.sh scripts/installer.iss \
  .env.example frontend/.env.local.example frontend/.env.standalone.example \
  backend/src/main/resources/application.yml backend/src/main/resources/application-prod.yml
git commit -m "feat(deploy): add Vercel and standalone build modes"
```

### Task 2: Add durable idempotency for business mutations

**Files:**
- Create: `backend/src/main/resources/db/migration/V3__add_idempotency_records.sql`
- Create: `backend/src/main/java/com/himotech/laundryms/idempotency/IdempotencyRecord.java`
- Create: `backend/src/main/java/com/himotech/laundryms/idempotency/IdempotencyRecordRepository.java`
- Create: `backend/src/main/java/com/himotech/laundryms/idempotency/IdempotentOperation.java`
- Create: `backend/src/main/java/com/himotech/laundryms/idempotency/IdempotencyAspect.java`
- Create: `backend/src/main/java/com/himotech/laundryms/idempotency/IdempotencyConflictException.java`
- Modify: `backend/src/main/java/com/himotech/laundryms/shared/GlobalExceptionHandler.java`
- Modify: all non-auth mutation methods under `backend/src/main/java/com/himotech/laundryms/**/api/*Controller.java`
- Test: `backend/src/test/java/com/himotech/laundryms/idempotency/IdempotencyAspectIT.java`

**Interfaces:**
- Consumes: `Idempotency-Key: <UUID>` and the authenticated user from Spring Security.
- Produces: the original success response for a matching replay, `409 IDEMPOTENCY_KEY_CONFLICT` for a changed request, and `400 IDEMPOTENCY_KEY_REQUIRED` for an omitted/invalid key.

- [ ] **Step 1: Write integration tests before implementation**

Use `AbstractIntegrationTest` to verify the following against a protected write endpoint:

```java
// First request performs one mutation and records its 201/200 response.
// Same UUID + identical request returns that response and creates no second record.
// Same UUID + changed JSON body returns 409.
// No Idempotency-Key returns 400 before the controller service runs.
// A forced service exception rolls back both business state and idempotency record.
```

Choose order creation and payment recording as representative high-risk endpoints; add one status transition test to prove PATCH handling.

- [ ] **Step 2: Run the integration test to verify it fails**

Run: `cd backend && ./mvnw test -Dtest=IdempotencyAspectIT`

Expected: FAIL because the header is currently ignored and duplicate writes are accepted.

- [ ] **Step 3: Create the transactional record model**

Create Flyway migration V3 with a unique constraint on `(actor_user_id, idempotency_key)`, a request fingerprint column, method/path columns, serialized response body, HTTP status, `created_at`, and `expires_at`. Add an index for expiry cleanup.

Implement the JPA entity/repository with a pessimistic lookup lock. Define `@IdempotentOperation` for controller methods and an AOP `@Around` advice that opens one transaction around: validate header, resolve actor, canonicalize request payload, look up/replay, invoke the controller, and persist the response record. A concurrent unique-key collision must re-read and replay or return conflict, never execute the mutation twice.

Annotate every business POST/PATCH/PUT/DELETE endpoint, including order creation/status/update/delete, payments/voids, customer changes, user changes, rates/add-ons, machines, pause settings, and client-alert read mutations. Exclude login, refresh, logout, read endpoints, and `POST /orders/preview` because it has no durable business side effect.

- [ ] **Step 4: Implement error and retention behavior**

Map header absence/invalid UUID to `400 IDEMPOTENCY_KEY_REQUIRED` and same-key/different-fingerprint to `409 IDEMPOTENCY_KEY_CONFLICT`. Add `Idempotency-Replayed: true` on replayed responses. Retain records for seven days and add a scheduled cleanup job that deletes only expired records.

- [ ] **Step 5: Run focused and full backend verification**

Run:

```bash
cd backend && ./mvnw test -Dtest=IdempotencyAspectIT,OrderControllerTest,PaymentControllerTest
cd .. && make test-backend
```

Expected: idempotent replays create one business record, conflicts return 409, and existing tests remain green.

- [ ] **Step 6: Commit**

```bash
git add backend/src/main/resources/db/migration/V3__add_idempotency_records.sql \
  backend/src/main/java/com/himotech/laundryms/idempotency \
  backend/src/main/java/com/himotech/laundryms/shared/GlobalExceptionHandler.java \
  backend/src/main/java/com/himotech/laundryms/*/api backend/src/test/java/com/himotech/laundryms/idempotency
git commit -m "feat(api): make business mutations idempotent"
```

### Task 3: Implement availability state and safe mutation recovery in the frontend

**Files:**
- Create: `frontend/src/lib/availability.ts`
- Create: `frontend/src/components/providers/AvailabilityProvider.tsx`
- Create: `frontend/src/components/system/OfflineScreen.tsx`
- Create: `frontend/src/components/system/AvailabilityBanner.tsx`
- Modify: `frontend/src/app/providers.tsx`
- Modify: `frontend/src/lib/api-client.ts`
- Test: `frontend/src/tests/lib/availability.test.ts`
- Test: `frontend/src/tests/components/system/AvailabilityProvider.test.tsx`
- Test: `frontend/src/tests/lib/api-client.test.ts`

**Interfaces:**
- Consumes: `GET /api/v1/health` with a five-second `AbortSignal.timeout`/abort-controller deadline.
- Produces: `online`, `offline`, or `checking` availability state and `UnconfirmedOperationError { idempotencyKey, method, path }` for a network/gateway failure after a business mutation starts.

- [ ] **Step 1: Write failing availability and recovery tests**

Cover initial failed health probe, successful recovery after a failed probe, timeout handling, and a mutation fetch rejection. Assert that a failed mutation produces `UnconfirmedOperationError`, retains its idempotency key for explicit reconciliation, and does not make a second fetch automatically.

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd frontend && npm run test -- src/tests/lib/availability.test.ts src/tests/components/system/AvailabilityProvider.test.tsx src/tests/lib/api-client.test.ts`

Expected: FAIL because availability state and unconfirmed operation types do not exist.

- [ ] **Step 3: Implement the availability boundary**

Implement a single provider that probes health at initial load, on `online` browser events, and at a modest interval while the application is open. Use the backend result—not `navigator.onLine` alone—as the availability authority. Render `OfflineScreen` for initial failure and `AvailabilityBanner` for mid-session loss. Expose `isWriteEnabled`; dashboard action components must use it to disable mutations while offline.

- [ ] **Step 4: Implement idempotency-aware API client behavior**

Extend the API client mutation methods to create one UUID per business operation and send it in `Idempotency-Key`. Retain the same key only for an explicit retry/reconcile action. On a fetch rejection, timeout, 502, 503, or 504 after a mutation starts, throw `UnconfirmedOperationError`; do not retry the business request automatically. Continue automatic refresh retry only for the existing 401 authentication flow.

Add a recovery dialog/toast contract: “We could not confirm this operation. Reconnect, then check or retry it with the same operation key.” Remove a pending key only after a confirmed response or an explicit user discard.

- [ ] **Step 5: Wire high-risk mutation flows**

Update order intake, payment recording/voiding, and order status transition call sites first to show the unconfirmed/retry state and to disable duplicate submit controls. Apply the common availability guard to the remaining mutation UI paths (customers, users, rates, machines, settings, alerts). Existing forms must continue to show server validation errors normally.

- [ ] **Step 6: Verify frontend behavior**

Run:

```bash
cd frontend && npm run typecheck && npm run lint && npm run test
```

Expected: availability transitions, one-key retry behavior, and all existing frontend tests pass.

- [ ] **Step 7: Commit**

```bash
git add frontend/src/lib frontend/src/components/providers frontend/src/components/system \
  frontend/src/app/providers.tsx frontend/src/components/features frontend/src/tests
git commit -m "feat(frontend): handle server outages safely"
```

### Task 4: Enforce proxy-safe cache and security policy

**Files:**
- Create: `backend/src/main/java/com/himotech/laundryms/config/ApiCacheControlFilter.java`
- Modify: `backend/src/main/java/com/himotech/laundryms/config/SecurityConfig.java`
- Modify: `backend/src/main/java/com/himotech/laundryms/auth/api/AuthController.java`
- Modify: `backend/src/main/resources/application-prod.yml`
- Test: `backend/src/test/java/com/himotech/laundryms/config/ApiCacheControlFilterTest.java`
- Test: `backend/src/test/java/com/himotech/laundryms/auth/AuthControllerTest.java`

**Interfaces:**
- Produces: `Cache-Control: no-store, no-cache, must-revalidate` and `Pragma: no-cache` for every `/api/**` response, including health and auth responses.

- [ ] **Step 1: Write failing cache/security tests**

Test that health, login, refresh, a protected GET, and a protected mutation each return `Cache-Control: no-store`. Keep the existing test coverage for exact allowed origin, exposed CSRF header, secure refresh cookie, and CSRF rejection.

- [ ] **Step 2: Run focused tests to verify failure**

Run: `cd backend && ./mvnw test -Dtest=ApiCacheControlFilterTest,AuthControllerTest`

Expected: FAIL because API no-store headers are not uniformly present.

- [ ] **Step 3: Implement cache prevention and exact-origin policy**

Register `ApiCacheControlFilter` before response completion for `/api/**`. Preserve the existing exact `allowed-origin` CORS configuration; do not restore wildcard origins. Ensure production uses secure, host-only `SameSite=Lax` refresh cookies and `X-CSRF-Token` remains exposed where browser code needs it.

- [ ] **Step 4: Verify**

Run: `cd backend && ./mvnw test -Dtest=ApiCacheControlFilterTest,AuthControllerTest && cd .. && make test-backend`

Expected: cache, CORS, CSRF, refresh, and authorization tests pass.

- [ ] **Step 5: Commit**

```bash
git add backend/src/main/java/com/himotech/laundryms/config/ApiCacheControlFilter.java \
  backend/src/main/java/com/himotech/laundryms/config/SecurityConfig.java \
  backend/src/main/java/com/himotech/laundryms/auth/api/AuthController.java \
  backend/src/main/resources/application-prod.yml backend/src/test/java/com/himotech/laundryms
git commit -m "fix(api): prevent proxy caching of operational data"
```

### Task 5: Update installer, deployment documentation, and operational acceptance checks

**Files:**
- Modify: `scripts/installer.iss`
- Modify: `scripts/share.ps1`
- Modify: `docs/05-tech-design/architecture.md`
- Modify: `docs/05-tech-design/frontend-design-spec.md`
- Modify: `docs/06-implementation/deployment-guide.md`
- Modify: `docs/06-implementation/environment-manifest.md`
- Modify: `docs/06-implementation/handover-checklist.md`
- Modify: `docs/README.md`
- Modify: `.specify/memory/constitution.md`
- Create: `docs/06-implementation/remote-access-acceptance-checklist.md`

**Interfaces:**
- Consumes: reserved Ngrok domain, Vercel production URL, Vercel `UPSTREAM_API_URL`, and exact backend `ALLOWED_ORIGIN`.
- Produces: repeatable setup instructions and an outage/recovery acceptance record.

- [ ] **Step 1: Update installer and operator wording**

Label Ngrok as remote access for customer tracking and authenticated Staff/Admin use. Explain that it forwards the laptop server, not a separate frontend. Make `scripts/share.ps1` obsolete or change it to a development-only helper that no longer claims it is the production sharing workflow.

- [ ] **Step 2: Document production setup exactly**

Document these ordered operator actions:

1. Reserve Ngrok HTTPS domain and configure the laptop service to tunnel `127.0.0.1:8765`.
2. Deploy frontend to Vercel with `NEXT_DEPLOYMENT_TARGET=vercel`, `NEXT_PUBLIC_API_URL=/api`, and production-only `UPSTREAM_API_URL`.
3. Set backend `ALLOWED_ORIGIN` to the exact Vercel production origin.
4. Verify `/api/v1/health` through Vercel, not by relying on direct Ngrok access.
5. Keep Vercel preview deployments disconnected from production upstream.

State that Vercel hosts the offline screen, whereas the laptop must be running for all live data and operations.

- [ ] **Step 3: Create the outage acceptance checklist**

The checklist must require proof of:

- page load with laptop server stopped shows the offline screen;
- public tracking, Staff login, and Admin-only action work through Vercel when online;
- stopping the laptop during a submitted order/payment shows unconfirmed status;
- restarting it and retrying with the same key yields one record only;
- no private API response is cached;
- local standalone `http://localhost:8765` still logs in and performs an operation.

- [ ] **Step 4: Verify documentation and installer syntax**

Run:

```bash
git diff --check
rg -n "ALLOWED_ORIGIN_PATTERNS|localhost:8080/api" .env.example scripts docs --glob '!docs/superpowers/**'
```

Expected: no obsolete production configuration remains; local-dev references remain only in `frontend/.env.local.example` and explicitly labeled development documentation.

- [ ] **Step 5: Commit**

```bash
git add scripts/installer.iss scripts/share.ps1 docs .specify/memory/constitution.md
git commit -m "docs: document resilient Vercel and Ngrok access"
```

### Task 6: Perform end-to-end verification and release handoff

**Files:**
- Modify: `frontend/playwright.config.ts`
- Create: `frontend/e2e/remote-access-resilience.spec.ts`
- Modify: `docs/06-implementation/remote-access-acceptance-checklist.md`

**Interfaces:**
- Consumes: a non-production Vercel deployment, fixed test Ngrok endpoint, and disposable test user/order data.
- Produces: automated local resilience coverage and an operator-signed live acceptance checklist.

- [ ] **Step 1: Add browser tests with a controllable API outage**

Add Playwright cases that route `/api/v1/health` to a failure for initial-load offline state, restore it for recovery, and abort a mutation response after request dispatch. Assert disabled writes while offline and a single retry with the preserved idempotency key.

- [ ] **Step 2: Run automated verification**

Run:

```bash
make test-backend
make test-frontend
(cd frontend && npm run build)
(cd frontend && npm run e2e)
git diff --check
```

Expected: all suites pass and no whitespace errors are reported.

- [ ] **Step 3: Run live non-production acceptance**

Use Vercel preview with a non-production fixed Ngrok tunnel. Execute every item in `remote-access-acceptance-checklist.md`, record the Vercel deployment URL, tunnel domain, date, and pass/fail result, but never place authtokens, database credentials, or user passwords in the document.

- [ ] **Step 4: Review and commit release evidence**

Run `git status --short`, inspect only intended changes, and commit the test/checklist updates:

```bash
git add frontend/playwright.config.ts frontend/e2e/remote-access-resilience.spec.ts \
  docs/06-implementation/remote-access-acceptance-checklist.md
git commit -m "test: verify remote access outage recovery"
```

## Plan Self-Review

- Spec coverage: tasks 1–2 implement dual deployment and exactly-once mutation behavior; task 3 implements offline UX and explicit recovery; task 4 covers cache/auth security; task 5 documents operation; task 6 validates local and live paths.
- No-placeholder scan: every task names file targets, commands, expected results, and production variables. Live acceptance requires user-provided non-production deployment authority but does not block local automated testing.
- Type consistency: all browser mutations use the exact `Idempotency-Key` header; backend derives replay ownership from the authenticated actor; frontend exposes `UnconfirmedOperationError` with the same key.
