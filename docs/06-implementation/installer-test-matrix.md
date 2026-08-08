# Laundry Shop Management System Installer — Windows Acceptance Matrix

Run each destructive scenario from a disposable Windows 10/11 x64 VM snapshot. Record installer log, Windows Event Log, PostgreSQL service state, registry metadata, and `installer-smoke-test.ps1` output.

| ID | Scenario | Expected result |
|---|---|---|
| C01 | Clean VM, no PostgreSQL | Setup prompts for `postgres` superuser password; managed PG 16.14 installs on 5432 using that password; DB/role provision; service healthy; metadata written |
| C02 | Port 5432 occupied by unrelated listener, no PG | Managed PG uses first safe fallback port; unrelated service untouched |
| C03 | PostgreSQL 16 active on 5432 | Reuse; prompt admin; no PG install; exact major/port/bin metadata stored |
| C04 | PostgreSQL 17 in non-default directory/custom port | Registry discovery finds custom base/data directory; reuse custom port |
| C05 | PostgreSQL 18 active | Reuse successfully |
| C06 | Supported PostgreSQL installed but stopped | Setup aborts and requests existing service be started; no duplicate PG install |
| C07 | PostgreSQL 15 on 5432 | Existing PG untouched; unchecked separate-install opt-in displayed; fallback starts at 5433 |
| C08 | State 2 opt-in not selected | Next is blocked; no PG modification |
| C08A | State 2 opt-in selected | Setup then shows the managed PostgreSQL `postgres` password/confirmation page before installation |
| C09 | Ports 5433-5435 reserved/listening | Fallback skips them and selects next safe port |
| C10 | Unsupported/newer PG major on 5432 | Treated as unsupported; untouched; fallback offered |
| C11 | Active manual/ZIP PostgreSQL 16/17/18 with no EDB registry key | Listener/process scan finds postgres.exe, derives bin/version/port, and reuses after admin validation |
| C12 | Registry metadata says supported PG but live endpoint is a different/unsupported server | Admin validation reads `server_version_num`; reuse is rejected |
| A01 | Wrong existing PG admin password | Credentials page rejects; no provisioning occurs |
| A02 | Correct admin login without CREATE ROLE/DB privilege | Provision fails with ON_ERROR_STOP; service not installed; no success metadata |
| A03 | Existing-server admin password contains colon/backslash | Temporary pgpass escaping works; password never appears in `psql` command line |
| A04 | Managed PG password mismatch | Next is blocked with password mismatch message; no download/install starts |
| A05 | Managed PG weak/invalid password | Next is blocked unless password is 12-128 printable ASCII chars with upper/lower/digit |
| A06 | Managed PG user-selected superuser password | After install, `psql -U postgres -h 127.0.0.1 -p <port>` accepts the password chosen on the Setup page |
| P01 | Fresh provisioning | `laundryms_app` is LOGIN/NOSUPERUSER/NOCREATEDB/NOCREATEROLE/NOREPLICATION; owns DB/schema |
| P02 | Database absent, role present | Role password reconciled; DB created; succeeds |
| P03 | Database present, role absent | Role created; ownership reconciled; succeeds |
| P04 | Database and role already present after interrupted install | Retry succeeds without dropping tables/data |
| P05 | SQL error injected | Setup aborts before service registration |
| N01 | Clean install, choose Local only | No Ngrok download/config/service is created; local app remains healthy |
| N02 | Clean install, enable Ngrok with valid authtoken + reserved HTTPS domain + remote frontend HTTPS origin | Pinned Ngrok archive is SHA-verified/cached, Authenticode validates publisher, protected v3 config written, production CORS includes both origins, `LaundryShopMSTunnel` runs, public `/api/v1/health` returns 200 |
| N03 | Ngrok authtoken missing/invalid | Next is blocked before install |
| N04 | Ngrok URL is HTTP, localhost, contains path/query, or malformed | Next is blocked before install |
| N05 | No internet / Ngrok download failure | LaundryMS local install still succeeds; tunnel warning shown; no tunnel process starts |
| N06 | Tampered Ngrok archive/cache | SHA-256 validation rejects archive; local install still succeeds without executing Ngrok |
| N07 | Ngrok executable Authenticode invalid/wrong publisher | Tunnel agent is deleted/not executed; local install remains healthy |
| N08 | Ngrok auth/domain/DNS causes public health failure | Installer completes local install with warning; `LaundryShopMS` remains healthy |
| N09 | Upgrade with enabled tunnel | Tunnel service stops before replacement, protected `ngrok.yml` is preserved, pinned agent is refreshed/reused, tunnel service restarts |
| N10 | Default uninstall then reinstall with tunnel enabled | Tunnel service is removed on uninstall; protected `ngrok.yml` + public metadata retained; reinstall reattaches without requesting the authtoken again |
| N11 | Destructive uninstall | Tunnel service stops/unregisters and protected Ngrok config is deleted with ProgramData |
| N12 | Remote frontend URL is HTTP, localhost, contains path/query, or malformed | Next is blocked before install; only a bare non-local HTTPS origin is accepted |
| N13 | Production CORS contract | `application-prod.properties` contains `server.forward-headers-strategy=framework` and both Ngrok + remote frontend origins; OPTIONS preflight for each origin returns matching `Access-Control-Allow-Origin` |
| N14 | Upgrade from pre-CORS tunnel deployment | Setup prompts once for remote frontend HTTPS origin, preserves DB/JWT/Ngrok secrets, upserts CORS/forwarded-header properties, and remote login no longer returns CORS 403 |
| U01 | Upgrade with service running | Exact STOPPED before replacement; refresh/start; secrets unchanged |
| U02 | Upgrade with service already stopped | No false failure; refresh/start; secrets unchanged |
| U03 | Upgrade with SCM UNKNOWN/pending unsupported state | Fail closed before file replacement |
| U04 | Config missing but service/registry exists | Damaged deployment abort; no new secrets |
| U05 | Retained-data reinstall after default uninstall | Config+metadata reused; service reinstalled; DB provisioning skipped |
| J01 | Runtime missing from staging | Inno compile input check/build fails or Setup runtime gate fails |
| J02 | Bundled Java executes `-version` | Must exit 0 before service install |
| D01 | Tamper PostgreSQL downloaded EXE | SHA-256 verification rejects before execution |
| D01A | Retry after PostgreSQL installer failure | Verified cached PostgreSQL EXE is reused; Setup does not redownload it |
| D02 | Tamper cached WinSW/JRE during staging | Build hash verification rejects |
| S01 | App health endpoint never returns 200 | Setup aborts; InstalledVersion is not updated |
| S02 | Service cannot reach RUNNING | Setup aborts; no success metadata |
| ACL01 | Standard non-admin user reads production config | Access denied |
| ACL02 | SYSTEM/Admin access config | Allowed |
| R01 | Registry inspection | No DB password/JWT/`postgres` superuser password values exist |
| R02 | Successful managed PostgreSQL installation | EDB debug trace is deleted after success; no success-time troubleshooting log retaining the superuser password remains |
| UN01 | Uninstall, removal checkbox unchecked | Service/binaries removed; DB/config/backups/metadata retained for reattach |
| UN02 | Reinstall after UN01 | Retained-data repair path installs service and health passes without DB admin prompt |
| UN03 | Uninstall with destructive checkbox selected | DB dropped using app owner credential; ProgramData/backups + metadata removed |
| UN04 | Destructive DB drop fails | Uninstall reports failure and DB is retained rather than pretending success |
| B01 | `build-deployment.sh` | `NEXT_DEPLOYMENT_TARGET=standalone` frontend export + Maven verify + verified WinSW/JRE staging succeeds |
| B02 | `build-installer.ps1 -Version 1.2.3` | Output filename/version is `LaundryShopMS-Setup-1.2.3.exe` |
| B03 | Authenticode signing enabled | Signature status Valid; timestamp present |
| B04 | Modify staged JAR/WinSW/java.exe after deployment staging | Windows build rejects manifest/hash mismatch before ISCC |

## Minimum release gate

A production release is approved only if:

1. `ISCC.exe` compiles `installer.iss` with zero errors.
2. C01, C03, C04, C07, C08A, C11, C12, A01, A04, A05, A06, P04, N01, N02, N05, N06, N07, N08, N09, N10, N11, N12, N13, N14, U01, U05, J02, D01, D01A, S01, ACL01, R02, UN01, UN02, UN03, B01, B02, and B04 pass.
3. `installer-smoke-test.ps1 -ExpectedVersion <version>` passes after clean install and after upgrade.
4. No test shows an existing PostgreSQL installation/data directory being deleted or overwritten.
