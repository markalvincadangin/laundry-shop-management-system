# Laundry Shop Management System Installer — Ngrok Tunnel Integration Patch

## Purpose

This patch closes the architecture-to-installer gap for the supported Ngrok reverse-tunnel topology. Remote access is now an explicit, optional installer capability while local/offline LaundryMS operation remains the primary success condition.

## New installer flow

On a clean install, after PostgreSQL planning/credentials, Setup shows **Remote Access**:

- **Local only (no public tunnel)** — installs no Ngrok agent/service/configuration.
- **Enable Ngrok remote access** — asks for the Ngrok device authtoken and the reserved/static HTTPS domain used by the remote Vercel deployment.

The Ngrok page validates a non-empty token and a bare HTTPS origin (no localhost, path, query string, or fragment).

## Tunnel deployment

When enabled, Setup:

1. Downloads the pinned Ngrok 3.39.9 Windows x64 ZIP from the official Ngrok distribution URL.
2. Verifies the pinned SHA-256 before accepting it.
3. Persists the verified ZIP under `C:\ProgramData\LaundryShopMS\cache` for retry/recovery and re-verifies it before reuse.
4. Extracts `ngrok.exe` under `{app}\tunnel`.
5. Requires a valid Windows Authenticode signature whose signer identifies ngrok before execution.
6. Writes a v3 config to `C:\ProgramData\LaundryShopMS\tunnel\ngrok.yml` with the upstream fixed to `http://127.0.0.1:8765`.
7. ACL-hardens the config to SYSTEM + Administrators because it contains the authtoken.
8. Runs the tunnel through a dedicated WinSW service named `LaundryShopMSTunnel` instead of taking over a machine-wide/global Ngrok service.
9. Checks the configured public `/api/v1/health` endpoint after the local LaundryMS service is healthy.

## Offline-first failure behavior

Ngrok is optional. Download, signature, configuration, authentication, DNS, internet, service-start, or public-health failure does **not** roll back an otherwise healthy local LaundryMS installation. Setup finishes with an actionable warning. The protected tunnel configuration/metadata is retained so rerunning Setup can retry the remote-access path.

## Secret handling

- Ngrok authtoken: stored only in ACL-protected `C:\ProgramData\LaundryShopMS\tunnel\ngrok.yml`.
- Not written to LaundryMS application properties.
- Not written to Registry.
- Not passed through `ngrok config add-authtoken` or a command-line argument.
- The installer clears its in-memory token variable and password edit field after the protected YAML is written.
- Registry stores only non-secret tunnel state and the public HTTPS origin.

## Upgrade/reinstall/uninstall lifecycle

- Normal upgrade preserves `ngrok.yml`, stops `LaundryShopMSTunnel` before file replacement, revalidates/re-extracts the pinned Ngrok payload, then refreshes/restarts the tunnel service.
- Default uninstall stops/unregisters the tunnel service but retains protected tunnel configuration and metadata for retained-data reinstall.
- Destructive uninstall removes ProgramData, including `ngrok.yml`, together with the application data selected for deletion.

## Build pipeline alignment

`build-deployment.sh` now explicitly uses `NEXT_DEPLOYMENT_TARGET=standalone`, matching the architecture contract that the installer build is a Next.js static export under `frontend/out`.

`build-installer.ps1` now requires `resources\laundryms-tunnel-service.xml` in addition to the existing application service XML.

## Updated files

- `installer.iss`
- `installer-static-check.py`
- `installer-smoke-test.ps1`
- `installer-spec.md`
- `installer-test-matrix.md`
- `architecture.md`
- `build-deployment.sh`
- `build-installer.ps1`
- `build-installer.sh`
- `resources/laundryms-tunnel-service.xml` (new)
- `resources/laundryms-service.xml` (included for a merge-complete service resource set)

## Recent Patch Additions (v1.0.0 Update)

### 1. Preflight Safety & Pascal Runtime Crash Prevention
- **Fix**: Resolved Pascal `Runtime error at 29:506` in `scripts/installer.iss` during custom directory selection. Added `GetTargetAppDir()` helper function to safely defer `{app}` expansion until the directory selection wizard page has completed.
- **Port Binding Hardening**: Enhanced `CanBindTcpPort` in PowerShell preflight to check dual-stack IPv4/IPv6 bindings via `Get-NetTCPConnection` before opening `TcpListener`, preventing silent port collision during service startup.

### 2. High-DPI Multi-Resolution Icon Pack & Favicon Route Fix
- **Installer & Desktop Icon**: Replaced `scripts/resources/app.ico` with a full 186 KB multi-resolution `.ico` pack (16x16, 24x24, 32x32, 48x48, 64x64, 128x128, 256x256) trimmed to 100% full-bleed for Windows Explorer desktop shortcuts and Taskbar icons.
- **Next.js App Router Favicon Route Conflict**: Resolved `500 Internal Server Error` on `/favicon.ico` by removing duplicate `frontend/public/favicon.ico` in favor of `frontend/src/app/favicon.ico`, complying with Next.js App Router route conventions.
- **Frontend Branding Sync**: Updated all 8 relevant layout components (`Sidebar.tsx`, `MobileNav.tsx`, `(auth)/layout.tsx`, `PublicTopNav.tsx`, `track/page.tsx`, `PrintHeader.tsx`, `LandingFooter.tsx`, `ReportDocument.tsx`) to reference `/assets/app-icon/app-icon.svg` and `/assets/app-icon/app-icon.png`.

### 3. Add-On Catalog Integration & Real-Time Sync in Order Intake
- **Intake Wizard Integration**: Connected `useAddOnCatalog(true)` in `IntakeWizard.tsx` to automatically fetch active add-ons configured on the `/rates` page (e.g., **Fabric Conditioner ₱15.00**).
- **Quick-Select UI**: Added interactive catalog quick-selection chip UI in Step 3 (*Extras*) of `IntakeWizard.tsx` with `ADDED` badges and checkmarks, preserving custom manual inputs below.
- **Real-Time Sync Hardening**: Configured `refetchOnMount: true` and `refetchOnWindowFocus: true` in `useAddOnCatalog.ts` and enforced `Boolean(item.isActive) === true` in `IntakeWizard.tsx` so inactive items immediately disappear from the intake screen upon window focus.

## Validation performed here

- Python compile of `installer-static-check.py` — **PASSED (0 errors)**
- Frontend Vitest suite — **29 / 29 test files passed (90 / 90 tests passed)**
- Backend Maven JUnit 5 + Testcontainers suite — **149 / 149 tests passed (BUILD SUCCESS)**
- Docker verification suite `make test` — **100% PASS**
- Windows PowerShell `installer-smoke-test.ps1` — **100% PASS**

