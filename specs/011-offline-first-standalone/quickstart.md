# Quickstart: Offline-First Standalone Validation

This guide outlines how to validate the transition of the application into an offline-first standalone architecture.

## Prerequisites
- Windows OS (required for full MSI validation)
- Docker & Docker Compose (for backend testing)
- Node.js (for frontend testing)

## 1. Automated Tests Validation
Validate that the backend schema correctly leverages UUIDs and the Outbox worker logic executes cleanly.

```bash
# In repository root
make test-backend
```
**Expected Outcome**: All JUnit and Testcontainers tests pass. Flyway migration `V1__init.sql` successfully runs.

## 2. Next.js Static Export Validation
Validate that the App Router correctly compiles dynamic routes into static assets.

```bash
cd frontend
npm ci
npm run build
```
**Expected Outcome**: The Next.js build succeeds and outputs static assets into the `frontend/out/` directory without Server Component or `generateStaticParams()` errors.

## 3. Local Autonomy & Sync Verification
Run the backend with an active internet connection, create a record, disconnect, and verify sync.

1. Start backend: `mvn spring-boot:run -Dspring-boot.run.profiles=dev`
2. Disconnect internet.
3. Access UI at `http://localhost:8080/` (or via LAN IP) and create an Order.
4. Verify the database `outbox_events` table contains a new row with `sync_status = PENDING`.
5. Reconnect internet.
6. Wait up to 5 seconds.
7. Verify `outbox_events` sync status changes to `COMPLETED` (or `FAILED` with incremented `retry_count` if cloud API mock is used).

## 4. Final Standalone Packaging
Generate the Windows Installer.

```powershell
# Open PowerShell as Administrator
cd scripts
.\build_standalone.ps1
```
**Expected Outcome**: A `.msi` file is generated in the `target/` directory. Installing it will deploy the application silently with PostgreSQL as a service.
